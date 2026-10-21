// Safe storage wrapper that prevents app crashes in webviews, incognito windows, or sandboxed iframes where localStorage or sessionStorage is restricted
const memoryStorage = {};
const memorySession = {};

export const safeStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Storage access blocked or restricted
    }
    return memoryStorage[key] || null;
  },

  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // Storage access blocked or restricted
    }
    memoryStorage[key] = String(value);
  },

  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      // Storage access blocked or restricted
    }
    delete memoryStorage[key];
  },
};

export const safeSessionStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch (e) {
      // Session storage blocked
    }
    return memorySession[key] || null;
  },

  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // Session storage blocked
    }
    memorySession[key] = String(value);
  },

  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
        return;
      }
    } catch (e) {
      // Session storage blocked
    }
    delete memorySession[key];
  },
};

export default safeStorage;
