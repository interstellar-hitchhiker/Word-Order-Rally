(function () {
  'use strict';

  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);

  async function clearLocalServiceWorkers() {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        const previousCache = ['sentence', 'scramble', 'sprint'].join('-');
        await Promise.all(keys.filter(key => key.includes('word-order-rally') || key.includes(previousCache)).map(key => caches.delete(key)));
      }
      console.info('Word Order Rally: local dev cache/service worker cleared.');
    } catch (err) {
      console.warn('Could not clear local service worker cache:', err);
    }
  }

  if (isLocal) {
    window.addEventListener('load', clearLocalServiceWorkers);
    return;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(err => {
        console.warn('Service worker registration failed:', err);
      });
    });
  }
}());
