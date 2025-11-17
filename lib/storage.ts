const memoryStore = new Map<string, string>();

const getStorage = (): Storage | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined') {
    const candidate = globalThis as typeof globalThis & { localStorage?: Storage };
    if (candidate.localStorage) {
      return candidate.localStorage;
    }
  }
  return null;
};

const fallbackStorage: Storage = {
  get length() {
    return memoryStore.size;
  },
  clear() {
    memoryStore.clear();
  },
  getItem(key: string) {
    return memoryStore.has(key) ? memoryStore.get(key)! : null;
  },
  key(index: number) {
    return Array.from(memoryStore.keys())[index] ?? null;
  },
  removeItem(key: string) {
    memoryStore.delete(key);
  },
  setItem(key: string, value: string) {
    memoryStore.set(key, value);
  },
};

const resolve = () => getStorage() ?? fallbackStorage;

export const storage = {
  getItem(key: string): string | null {
    try {
      return resolve().getItem(key);
    } catch (error) {
      console.warn('storage.getItem failed', error);
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      resolve().setItem(key, value);
    } catch (error) {
      console.warn('storage.setItem failed', error);
    }
  },
  removeItem(key: string) {
    try {
      resolve().removeItem(key);
    } catch (error) {
      console.warn('storage.removeItem failed', error);
    }
  },
  setJSON(key: string, value: unknown) {
    if (value === undefined) {
      this.removeItem(key);
      return;
    }
    try {
      this.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('storage.setJSON failed', error);
    }
  },
  getJSON<T>(key: string): T | null {
    const raw = this.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn('storage.getJSON failed', error);
      return null;
    }
  },
  clear() {
    try {
      resolve().clear();
    } catch (error) {
      console.warn('storage.clear failed', error);
    }
  },
};
