const createMemoryStorage = () => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  } satisfies Storage;
};

const bootstrapStorage = () => {
  if (typeof window !== 'undefined') return;
  const globalRef = globalThis as typeof globalThis & {
    localStorage?: Storage;
    sessionStorage?: Storage;
  };

  if (!globalRef.localStorage || typeof globalRef.localStorage.getItem !== 'function') {
    globalRef.localStorage = createMemoryStorage();
  }
  if (!globalRef.sessionStorage || typeof globalRef.sessionStorage.getItem !== 'function') {
    globalRef.sessionStorage = createMemoryStorage();
  }
};

bootstrapStorage();
