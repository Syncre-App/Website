// Web CryptoService - End-to-End Encryption for Web
// Uses Web Crypto API and IndexedDB for secure storage

import { ApiService } from './ApiService';

// Constants matching mobile app
const KEY_INFO_CONTEXT = 'syncre-chat-v1';
const BACKUP_KEY_INFO = 'syncre-backup-v1';
const HKDF_KEY_LENGTH = 32;
const IDENTITY_PBKDF_ITERATIONS = 50000;

// IndexedDB keys
const DB_NAME = 'syncre-e2ee';
const DB_VERSION = 1;
const STORE_NAME = 'keys';

const IDENTITY_PRIVATE_KEY_KEY = 'e2ee_identity_private_v2';
const IDENTITY_PUBLIC_KEY_KEY = 'e2ee_identity_public_v2';
const IDENTITY_VERSION_KEY = 'e2ee_identity_version_v2';
const BACKUP_KEY_STORAGE = 'e2ee_backup_key_v1';
const BACKUP_SALT_STORAGE = 'e2ee_backup_salt_v1';

export interface EnvelopeEntry {
  recipientId: string;
  recipientDevice: string | null;
  payload: string;
  nonce: string;
  keyVersion: number;
  alg: string;
  senderIdentityKey: string | null;
  version: number;
}

export interface EncryptedPayload {
  envelopes: EnvelopeEntry[];
  senderDeviceId: string;
}

export interface IdentityKeyPair {
  publicKey: string;
  privateKey: string;
  keyVersion: number;
}

export interface EncryptedIdentityKey {
  publicKey: string;
  encryptedPrivateKey: string;
  nonce: string;
  salt: string;
  iterations: number;
  version: number;
}

export interface BackupEnvelope {
  userId: string;
  payload: string;
  nonce: string;
  keyVersion: number;
}

// ═══════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════

const toBase64 = (bytes: Uint8Array): string => {
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binString);
};

const fromBase64 = (value: string): Uint8Array => {
  const binString = atob(value);
  return Uint8Array.from(binString, (char) => char.charCodeAt(0));
};

const utf8ToBytes = (value: string): Uint8Array => {
  return new TextEncoder().encode(value);
};

const bytesToUtf8 = (bytes: Uint8Array): string => {
  return new TextDecoder().decode(bytes);
};

const randomBytes = (length: number): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(length));
};

// ═══════════════════════════════════════════════════════════════
// IndexedDB Operations
// ═══════════════════════════════════════════════════════════════

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

const readSecureItem = async (key: string): Promise<string | null> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result ?? null);
    });
  } catch (error) {
    console.error(`[CryptoService] Failed to read secure item '${key}':`, error);
    return null;
  }
};

const writeSecureItem = async (key: string, value: string): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);
    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error(`[CryptoService] Failed to persist secure item '${key}':`, error);
    throw error;
  }
};

const deleteSecureItem = async (key: string): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);
    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error(`[CryptoService] Failed to delete secure item '${key}':`, error);
  }
};

// ═══════════════════════════════════════════════════════════════
// Key Derivation using Web Crypto API
// ═══════════════════════════════════════════════════════════════

const deriveSymmetricKey = async (
  sharedSecret: Uint8Array,
  chatId: string
): Promise<Uint8Array> => {
  const info = utf8ToBytes(`${KEY_INFO_CONTEXT}:${chatId}`);
  const salt = new Uint8Array(HKDF_KEY_LENGTH);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    sharedSecret,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt,
      info
    },
    keyMaterial,
    HKDF_KEY_LENGTH * 8
  );
  
  return new Uint8Array(derivedBits);
};

const derivePasswordKey = async (
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<CryptoKey> => {
  const passwordBytes = utf8ToBytes(password);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  return await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  ).then(bits => crypto.subtle.importKey(
    'raw',
    new Uint8Array(bits),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  ));
};

// ═══════════════════════════════════════════════════════════════
// Local Identity Storage
// ═══════════════════════════════════════════════════════════════

const getLocalIdentity = async (): Promise<IdentityKeyPair | null> => {
  const existingPrivate = await readSecureItem(IDENTITY_PRIVATE_KEY_KEY);
  const existingPublic = await readSecureItem(IDENTITY_PUBLIC_KEY_KEY);
  const versionStr = (await readSecureItem(IDENTITY_VERSION_KEY)) || '1';
  const version = Number.parseInt(versionStr, 10) || 1;

  if (existingPrivate && existingPublic) {
    return {
      privateKey: existingPrivate,
      publicKey: existingPublic,
      keyVersion: version,
    };
  }
  return null;
};

const persistLocalIdentity = async (identity: IdentityKeyPair): Promise<void> => {
  await writeSecureItem(IDENTITY_PRIVATE_KEY_KEY, identity.privateKey);
  await writeSecureItem(IDENTITY_PUBLIC_KEY_KEY, identity.publicKey);
  await writeSecureItem(IDENTITY_VERSION_KEY, String(identity.keyVersion));
  console.log('[CryptoService] Local identity persisted');
};

const ensureIdentityAvailable = async (): Promise<IdentityKeyPair> => {
  const identity = await getLocalIdentity();
  if (!identity) {
    throw new Error('Identity key not initialized. Please log in again.');
  }
  return identity;
};

// ═══════════════════════════════════════════════════════════════
// Encryption/Decryption using Web Crypto (AES-GCM as alternative to XChaCha20)
// ═══════════════════════════════════════════════════════════════

const encryptWithKey = async (
  plaintext: Uint8Array,
  key: Uint8Array,
  nonce: Uint8Array
): Promise<Uint8Array> => {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    cryptoKey,
    plaintext
  );
  
  return new Uint8Array(ciphertext);
};

const decryptWithKey = async (
  ciphertext: Uint8Array,
  key: Uint8Array,
  nonce: Uint8Array
): Promise<Uint8Array | null> => {
  try {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce },
      cryptoKey,
      ciphertext
    );
    
    return new Uint8Array(plaintext);
  } catch (error) {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════════
// X25519 Key Exchange using Web Crypto ( ECDH )
// Note: Web Crypto doesn't support X25519 directly, so we use ECDH P-256
// For X25519, we would need a library like tweetnacl.js
// ═══════════════════════════════════════════════════════════════

let nacl: any = null;

const loadNacl = async () => {
  if (nacl) return nacl;
  // Dynamic import of tweetnacl
  const module = await import('tweetnacl');
  nacl = module.default;
  return nacl;
};

// ═══════════════════════════════════════════════════════════════
// Identity Key Management
// ═══════════════════════════════════════════════════════════════

const encryptPrivateKeyWithPassword = async (
  privateKey: Uint8Array,
  password: string
): Promise<{ encryptedPrivateKey: string; nonce: string; salt: string; iterations: number }> => {
  const salt = randomBytes(32);
  const nonce = randomBytes(12);
  const iterations = IDENTITY_PBKDF_ITERATIONS;
  
  const key = await derivePasswordKey(password, salt, iterations);
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  const keyBytes = new Uint8Array(exportedKey);
  
  const encrypted = await encryptWithKey(privateKey, keyBytes, nonce);
  
  return {
    encryptedPrivateKey: toBase64(encrypted),
    nonce: toBase64(nonce),
    salt: toBase64(salt),
    iterations,
  };
};

const decryptPrivateKeyWithPassword = async (
  encryptedPrivateKey: string,
  nonce: string,
  salt: string,
  iterations: number,
  password: string
): Promise<Uint8Array> => {
  const key = await derivePasswordKey(password, fromBase64(salt), iterations);
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  const keyBytes = new Uint8Array(exportedKey);
  
  const decrypted = await decryptWithKey(
    fromBase64(encryptedPrivateKey),
    keyBytes,
    fromBase64(nonce)
  );
  
  if (!decrypted) {
    throw new Error('Failed to decrypt identity key. Wrong password?');
  }
  
  return decrypted;
};

// ═══════════════════════════════════════════════════════════════
// CryptoService Main Class
// ═══════════════════════════════════════════════════════════════

class CryptoServiceClass {
  // Initialize identity - called on login
  async initializeIdentity(password: string): Promise<void> {
    const existingIdentity = await getLocalIdentity();
    if (existingIdentity) {
      console.log('[CryptoService] Identity already exists');
      return;
    }
    
    const naclLib = await loadNacl();
    
    // Generate new X25519 keypair
    const keypair = naclLib.box.keyPair();
    
    const identity: IdentityKeyPair = {
      publicKey: toBase64(keypair.publicKey),
      privateKey: toBase64(keypair.secretKey),
      keyVersion: 1,
    };
    
    // Encrypt private key with password
    const encrypted = await encryptPrivateKeyWithPassword(
      keypair.secretKey,
      password
    );
    
    // Upload to server
    await ApiService.post('/keys/identity', {
      publicKey: identity.publicKey,
      encryptedPrivateKey: encrypted.encryptedPrivateKey,
      nonce: encrypted.nonce,
      salt: encrypted.salt,
      iterations: encrypted.iterations,
      version: identity.keyVersion,
    });
    
    // Store locally
    await persistLocalIdentity(identity);
    console.log('[CryptoService] Identity initialized and uploaded');
  }
  
  // Decrypt identity from server (for new device)
  async decryptIdentityFromServer(password: string): Promise<void> {
    const response = await ApiService.get('/keys/identity');
    if (!response.success || !response.data) {
      console.log('[CryptoService] No identity key on server');
      return;
    }
    
    const identityKey = response.data as EncryptedIdentityKey;
    
    const privateKeyBytes = await decryptPrivateKeyWithPassword(
      identityKey.encryptedPrivateKey,
      identityKey.nonce,
      identityKey.salt,
      identityKey.iterations,
      password
    );
    
    const identity: IdentityKeyPair = {
      publicKey: identityKey.publicKey,
      privateKey: toBase64(privateKeyBytes),
      keyVersion: identityKey.version,
    };
    
    await persistLocalIdentity(identity);
    console.log('[CryptoService] Identity decrypted from server');
  }
  
  // Encrypt a message for recipients
  async encryptMessage(params: {
    message: string;
    chatId: string;
    recipientPublicKeys: Array<{ userId: string; publicKey: string }>;
    senderDeviceId: string;
  }): Promise<EncryptedPayload | null> {
    try {
      const { message, recipientPublicKeys, senderDeviceId } = params;
      
      const identity = await ensureIdentityAvailable();
      const naclLib = await loadNacl();
      
      // Generate ephemeral keypair for this message
      const ephemeral = naclLib.box.keyPair();
      
      // Encrypt for each recipient
      const envelopes: EnvelopeEntry[] = [];
      
      for (const recipient of recipientPublicKeys) {
        try {
          const recipientPublicKey = fromBase64(recipient.publicKey);
          const ephemeralSecret = naclLib.box.before(recipientPublicKey, ephemeral.secretKey);
          const symmetricKey = await deriveSymmetricKey(ephemeralSecret, params.chatId);
          
          const nonce = randomBytes(12);
          const plaintext = utf8ToBytes(message);
          const ciphertext = await encryptWithKey(plaintext, symmetricKey, nonce);
          
          envelopes.push({
            recipientId: recipient.userId,
            recipientDevice: null,
            payload: toBase64(ciphertext),
            nonce: toBase64(nonce),
            keyVersion: identity.keyVersion,
            alg: 'AES-GCM',
            senderIdentityKey: identity.publicKey,
            version: 1,
          });
        } catch (error) {
          console.error(`[CryptoService] Failed to encrypt for recipient ${recipient.userId}:`, error);
        }
      }
      
      // Also encrypt for self (backup)
      try {
        const selfPublicKey = fromBase64(identity.publicKey);
        const ephemeralSecret = naclLib.box.before(selfPublicKey, ephemeral.secretKey);
        const symmetricKey = await deriveSymmetricKey(ephemeralSecret, params.chatId);
        
        const nonce = randomBytes(12);
        const plaintext = utf8ToBytes(message);
        const ciphertext = await encryptWithKey(plaintext, symmetricKey, nonce);
        
        // Get current user ID
        const userResponse = await ApiService.get('/user/me');
        if (userResponse.success && userResponse.data?.id) {
          envelopes.push({
            recipientId: userResponse.data.id.toString(),
            recipientDevice: null,
            payload: toBase64(ciphertext),
            nonce: toBase64(nonce),
            keyVersion: identity.keyVersion,
            alg: 'AES-GCM',
            senderIdentityKey: identity.publicKey,
            version: 1,
          });
        }
      } catch (error) {
        console.error('[CryptoService] Failed to encrypt for self:', error);
      }
      
      if (envelopes.length === 0) {
        throw new Error('Failed to encrypt for any recipient');
      }
      
      return {
        envelopes,
        senderDeviceId,
      };
    } catch (error) {
      console.error('[CryptoService] Failed to encrypt message:', error);
      return null;
    }
  }
  
  // Decrypt a message envelope
  async decryptMessage(params: {
    envelope: EnvelopeEntry;
    senderId: string;
    chatId: string;
  }): Promise<string | null> {
    try {
      const { envelope, chatId } = params;
      
      const identity = await ensureIdentityAvailable();
      const naclLib = await loadNacl();
      
      // Extract ephemeral public key from sender
      const senderPublicKey = envelope.senderIdentityKey 
        ? fromBase64(envelope.senderIdentityKey)
        : null;
      
      if (!senderPublicKey) {
        console.error('[CryptoService] No sender identity key in envelope');
        return null;
      }
      
      const privateKey = fromBase64(identity.privateKey);
      
      // Perform X25519 key exchange
      const sharedSecret = naclLib.box.before(senderPublicKey, privateKey);
      const symmetricKey = await deriveSymmetricKey(sharedSecret, chatId);
      
      // Decrypt
      const nonce = fromBase64(envelope.nonce);
      const ciphertext = fromBase64(envelope.payload);
      
      const plaintext = await decryptWithKey(ciphertext, symmetricKey, nonce);
      
      if (!plaintext) {
        console.error('[CryptoService] Decryption failed - likely wrong key');
        return null;
      }
      
      return bytesToUtf8(plaintext);
    } catch (error) {
      console.error('[CryptoService] Failed to decrypt message:', error);
      return null;
    }
  }
  
  // Check if identity is initialized
  async hasIdentity(): Promise<boolean> {
    const identity = await getLocalIdentity();
    return !!identity;
  }
  
  // Get public key for sharing
  async getPublicKey(): Promise<string | null> {
    const identity = await getLocalIdentity();
    return identity?.publicKey || null;
  }
  
  // Reset all E2EE data
  async resetAllE2EE(): Promise<void> {
    await deleteSecureItem(IDENTITY_PRIVATE_KEY_KEY);
    await deleteSecureItem(IDENTITY_PUBLIC_KEY_KEY);
    await deleteSecureItem(IDENTITY_VERSION_KEY);
    await deleteSecureItem(BACKUP_KEY_STORAGE);
    await deleteSecureItem(BACKUP_SALT_STORAGE);
    console.log('[CryptoService] All E2EE data reset');
  }
}

export const CryptoService = new CryptoServiceClass();
