var idbKeyval = (() => {
  const store = () => (new Promise((resolve, reject) => {
    const openreq = indexedDB.open('keyval-store', 1);
    openreq.onerror = () => reject(openreq.error);
    openreq.onsuccess = () => resolve(openreq.result.transaction('keyval', 'readwrite').objectStore('keyval'));
    openreq.onupgradeneeded = () => openreq.result.createObjectStore('keyval');
  }));
  return {
    get: async (key) => (await store()).get(key),
    set: async (key, val) => (await store()).put(val, key),
    del: async (key) => (await store()).delete(key),
    clear: async () => (await store()).clear(),
    keys: async () => {
      const keys = [];
      const req = (await store()).openCursor();
      return new Promise((resolve, reject) => {
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          if (!req.result) return resolve(keys);
          keys.push(req.result.key);
          req.result.continue();
        };
      });
    }
  };
})();