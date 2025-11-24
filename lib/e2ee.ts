'use client';

import nacl from 'tweetnacl';
import { XChaCha20Poly1305 } from '@stablelib/xchacha20poly1305';
import { HKDF } from '@stablelib/hkdf';
import { SHA256 } from '@stablelib/sha256';
import { deriveKey as pbkdf2DeriveKey } from '@stablelib/pbkdf2';
import type { EnvelopeEntry } from './types';
import { apiClient } from './apiClient';
import { storage } from './storage';

interface IdentityBundle {
  publicKey: string;
  privateKey: string;
  keyVersion: number;
}

interface RemoteIdentityRecord {
  publicKey: string;
  encryptedPrivateKey?: string | null;
  nonce?: string | null;
  salt?: string | null;
  iterations?: number | null;
  version?: number | null;
}

interface DecryptParams {
  chatId: string;
  envelopes: EnvelopeEntry[];
  senderId?: string | number | null;
  currentUserId?: string | number | null;
  token?: string | null;
}

interface DecryptResult {
  plaintext: string | null;
  error?: string;
}

const IDENTITY_STORAGE_KEY = 'syncre_e2ee_identity_v1';
const DEVICE_ID_KEY = 'syncre_web_device_id';
const PIN_CACHE_KEY = 'syncre_e2ee_pin_v1';
const KEY_INFO_CONTEXT = 'syncre-chat-v1';
const HKDF_KEY_LENGTH = 32;
const DEFAULT_ITERATIONS = 60000;

const toBase64 = (bytes: Uint8Array): string => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
};

const fromBase64 = (value: string): Uint8Array => {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(value, 'base64'));
  }
  const decoded = atob(value);
  const array = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i += 1) {
    array[i] = decoded.charCodeAt(i);
  }
  return array;
};

const utf8ToBytes = (value: string): Uint8Array => {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value);
  }
  return new Uint8Array(Array.from(value).map((char) => char.charCodeAt(0)));
};

const bytesToUtf8 = (bytes: Uint8Array): string => {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(bytes);
  }
  return Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join('');
};

const randomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
    return bytes;
  }
  for (let i = 0; i < length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
};

const deriveSymmetricKey = (sharedSecret: Uint8Array, chatId: string): Uint8Array => {
  const info = utf8ToBytes(`${KEY_INFO_CONTEXT}:${chatId}`);
  const salt = new Uint8Array(HKDF_KEY_LENGTH);
  const hkdf = new HKDF(SHA256, sharedSecret, salt, info);
  const key = hkdf.expand(HKDF_KEY_LENGTH);
  hkdf.clean();
  return key;
};

const derivePassphraseKey = async (password: string, salt: Uint8Array, iterations: number) => {
  const passwordBytes = utf8ToBytes(password);
  return pbkdf2DeriveKey(SHA256, passwordBytes, salt, iterations, 32);
};

const decryptPrivateKey = async (encryptedBase64: string, nonceBase64: string, passphraseKey: Uint8Array) => {
  const cipher = new XChaCha20Poly1305(passphraseKey);
  const decrypted = cipher.open(fromBase64(nonceBase64), fromBase64(encryptedBase64));
  if (!decrypted) {
    throw new Error('Failed to decrypt identity key');
  }
  return decrypted;
};

const encryptForRecipient = ({
  chatId,
  message,
  recipientUserId,
  recipientPublicKey,
  privateKeyBytes,
  senderPublicKey,
}: {
  chatId: string;
  message: string;
  recipientUserId: string;
  recipientPublicKey: string;
  privateKeyBytes: Uint8Array;
  senderPublicKey: string;
}): EnvelopeEntry => {
  const recipientKeyBytes = fromBase64(recipientPublicKey);
  const sharedSecret = nacl.box.before(recipientKeyBytes, privateKeyBytes);
  const symmetricKey = deriveSymmetricKey(sharedSecret, chatId);
  const cipher = new XChaCha20Poly1305(symmetricKey);

  const nonce = randomBytes(24);
  const payload = cipher.seal(nonce, utf8ToBytes(message));

  return {
    recipientId: recipientUserId,
    recipientDevice: null,
    payload: toBase64(payload),
    nonce: toBase64(nonce),
    keyVersion: 1,
    alg: 'xchacha20poly1305',
    senderIdentityKey: senderPublicKey,
    version: 1,
  };
};

const getStoredIdentity = (): IdentityBundle | null => {
  return storage.getJSON<IdentityBundle>(IDENTITY_STORAGE_KEY);
};

const persistIdentity = (bundle: IdentityBundle) => {
  storage.setJSON(IDENTITY_STORAGE_KEY, bundle);
};

const clearIdentity = (options?: { includePin?: boolean }) => {
  storage.removeItem(IDENTITY_STORAGE_KEY);
  if (options?.includePin) {
    storage.removeItem(PIN_CACHE_KEY);
  }
};

const getDeviceId = (): string => {
  const existing = storage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const generated =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  storage.setItem(DEVICE_ID_KEY, generated);
  return generated;
};

const publicKeyCache = new Map<string, string>();
const resolvePublicIdentityKey = async (userId: string, token: string): Promise<string | null> => {
  if (!userId || !token) return null;
  const cached = publicKeyCache.get(userId);
  if (cached) return cached;

  const response = await apiClient.get<{ publicKey?: string }>(`/keys/identity/public/${userId}`, token);
  if (response.success && response.data?.publicKey) {
    publicKeyCache.set(userId, response.data.publicKey);
    return response.data.publicKey;
  }

  const fallback = await apiClient.get<{ devices?: { identityKey?: string }[] }>(`/keys/${userId}`, token);
  if (fallback.success && Array.isArray(fallback.data?.devices)) {
    const key = fallback.data.devices.find((device) => typeof device.identityKey === 'string')?.identityKey;
    if (key) {
      publicKeyCache.set(userId, key);
      return key;
    }
  }

  return null;
};

const registerDeviceIdentity = async (identity: IdentityBundle, token: string) => {
  try {
    await apiClient.post(
      '/keys/register',
      {
        deviceId: getDeviceId(),
        identityKey: identity.publicKey,
        keyVersion: identity.keyVersion || 1,
      },
      token
    );
  } catch (error) {
    console.warn('[e2ee] Failed to register device identity', error);
  }
};

const decryptEnvelope = async ({
  chatId,
  envelope,
  senderId,
  currentUserId,
  token,
}: {
  chatId: string;
  envelope: EnvelopeEntry;
  senderId?: string | number | null;
  currentUserId?: string | number | null;
  token?: string | null;
}): Promise<DecryptResult | null> => {
  const identity = getStoredIdentity();
  if (!identity) {
    return { plaintext: null, error: 'Add meg a mobil appban beállított PIN kódot az üzenetek feloldásához.' };
  }

  const privateKeyBytes = fromBase64(identity.privateKey);
  let senderKey = envelope.senderIdentityKey || null;
  const senderIdStr = senderId?.toString?.();
  const currentUserIdStr = currentUserId?.toString?.();

  if (!senderKey && senderIdStr && currentUserIdStr && senderIdStr === currentUserIdStr) {
    senderKey = identity.publicKey;
  }

  if (!senderKey && senderIdStr && token) {
    senderKey = await resolvePublicIdentityKey(senderIdStr, token);
  }

  if (!senderKey) {
    return { plaintext: null, error: 'Hiányzik a feladó kulcsa az üzenet dekódolásához.' };
  }

  try {
    const sharedSecret = nacl.box.before(fromBase64(senderKey), privateKeyBytes);
    const symmetricKey = deriveSymmetricKey(sharedSecret, chatId);
    const cipher = new XChaCha20Poly1305(symmetricKey);
    const plaintextBytes = cipher.open(fromBase64(envelope.nonce), fromBase64(envelope.payload));
    if (!plaintextBytes) {
      return { plaintext: null };
    }
    return { plaintext: bytesToUtf8(plaintextBytes) };
  } catch (error) {
    console.warn('[e2ee] Envelope decrypt failed', error);
    return { plaintext: null, error: 'Nem sikerült visszafejteni az üzenetet.' };
  }
};

export const e2ee = {
  hasIdentity(): boolean {
    return Boolean(getStoredIdentity());
  },

  clearIdentity(includePin = false) {
    clearIdentity({ includePin });
  },

  getDeviceId,

  getCachedPin(): string | null {
    return storage.getItem(PIN_CACHE_KEY);
  },

  async unlockIdentity(
    pin: string,
    token: string,
    options?: { rememberPin?: boolean }
  ): Promise<{ success: boolean; error?: string }> {
    if (!pin?.trim()) {
      return { success: false, error: 'Add meg a PIN kódot a titkosítás feloldásához.' };
    }

    const response = await apiClient.get<RemoteIdentityRecord>('/keys/identity', token);
    if (!response.success || !response.data) {
      return { success: false, error: response.error || 'Nem található titkosítási kulcs a fiókhoz.' };
    }

    const { encryptedPrivateKey, nonce, salt, iterations, publicKey, version } = response.data;
    if (!encryptedPrivateKey || !nonce || !salt) {
      return { success: false, error: 'Hiányos titkosítási csomag, próbáld meg újra a mobil appból.' };
    }

    try {
      const saltBytes = fromBase64(salt);
      const passphraseKey = await derivePassphraseKey(pin, saltBytes, iterations || DEFAULT_ITERATIONS);
      const privateKeyBytes = await decryptPrivateKey(encryptedPrivateKey, nonce, passphraseKey);
      const bundle: IdentityBundle = {
        publicKey,
        privateKey: toBase64(privateKeyBytes),
        keyVersion: version || 1,
      };
      persistIdentity(bundle);
      if (options?.rememberPin !== false) {
        storage.setItem(PIN_CACHE_KEY, pin);
      }
      await registerDeviceIdentity(bundle, token);
      return { success: true };
    } catch (error) {
      console.warn('[e2ee] Unlock failed', error);
      return { success: false, error: 'Érvénytelen PIN vagy sérült kulcs. Próbáld újra.' };
    }
  },

  async decryptMessage(params: DecryptParams): Promise<DecryptResult> {
    const { chatId, envelopes, senderId, currentUserId, token } = params;
    if (!envelopes || !envelopes.length) {
      return { plaintext: null };
    }
    for (const envelope of envelopes) {
      const result = await decryptEnvelope({ chatId, envelope, senderId, currentUserId, token });
      if (result?.plaintext) {
        return result;
      }
    }
    return { plaintext: null };
  },

  async buildEncryptedPayload(options: {
    chatId: string;
    message: string;
    recipientUserIds: string[];
    token: string;
    currentUserId: string;
  }): Promise<{ envelopes: EnvelopeEntry[]; senderDeviceId: string; preview: string }> {
    const { chatId, message, recipientUserIds, token, currentUserId } = options;
    const identity = getStoredIdentity();
    if (!identity) {
      throw new Error('Titkosítási kulcs nincs feloldva.');
    }

    const privateKeyBytes = fromBase64(identity.privateKey);
    const uniqueRecipients = new Set(recipientUserIds.map((id) => id.toString()));
    uniqueRecipients.add(currentUserId);
    const envelopes: EnvelopeEntry[] = [];

    for (const userId of uniqueRecipients) {
      const publicKey =
        userId === currentUserId ? identity.publicKey : await resolvePublicIdentityKey(userId, token);
      if (!publicKey) continue;
      envelopes.push(
        encryptForRecipient({
          chatId,
          message,
          recipientUserId: userId,
          recipientPublicKey: publicKey,
          privateKeyBytes,
          senderPublicKey: identity.publicKey,
        })
      );
    }

    return {
      envelopes,
      senderDeviceId: getDeviceId(),
      preview: message.slice(0, 140),
    };
  },
};
