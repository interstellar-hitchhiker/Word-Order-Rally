(function () {
  'use strict';
  function splitSentence(sentence) {
    return String(sentence).trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);
  }
  function makeTokens(sentence) {
    const words = splitSentence(sentence);
    const objects = words.map((word, index) => ({
      word,
      index,
      used: false,
      id: `${Date.now()}_${index}_${Math.random().toString(16).slice(2)}`
    }));
    const shuffled = objects.slice();
    shuffle(shuffled);
    const same = shuffled.every((item, i) => item.index === i);
    if (same && shuffled.length > 2) {
      [shuffled[0], shuffled[shuffled.length - 1]] = [shuffled[shuffled.length - 1], shuffled[0]];
    }
    return shuffled;
  }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function normaliseStrict(text) {
    return String(text)
      .toLocaleLowerCase()
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/\s+([,.;:!?])/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function normaliseLoose(text) {
    return normaliseStrict(text)
      .replace(/[.,;:!?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function escapeHtml(text) {
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  window.SSSWordEngine = { splitSentence, makeTokens, normaliseStrict, normaliseLoose, escapeHtml, randomInt, rand, clamp };
}());
