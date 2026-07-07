(function () {
  'use strict';
  const safe = {
    get(key, fallback = null) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch {}
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch {}
    },
    jsonGet(key, fallback = []) {
      try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
      catch { return fallback; }
    },
    jsonSet(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    }
  };
  window.SSSStorage = safe;
}());
