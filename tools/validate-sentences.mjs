import fs from 'node:fs';

const bank = JSON.parse(fs.readFileSync('assets/data/sentence-bank.json', 'utf8'));
const routes = JSON.parse(fs.readFileSync('assets/data/level-routes.json', 'utf8'));
const errors = [];
const seen = new Set();
let total = 0;

if (bank.schemaVersion !== 2) errors.push('Sentence bank schemaVersion must be 2.');
if (routes.schemaVersion !== 2) errors.push('Route schemaVersion must be 2.');

Object.entries(routes.frameworks || {}).forEach(([frameworkId, framework]) => {
  if (!bank.frameworks?.[frameworkId]) errors.push(`Missing framework bank: ${frameworkId}`);
  if (!Array.isArray(framework.levels) || framework.levels.length === 0) {
    errors.push(`Framework ${frameworkId} has no levels.`);
    return;
  }
  framework.levels.forEach(level => {
    const items = bank.frameworks?.[frameworkId]?.[level.id];
    const prefix = `${frameworkId} ${level.id}`;
    if (!Array.isArray(items)) {
      errors.push(`${prefix}: missing sentence array.`);
      return;
    }
    if (items.length < 50) errors.push(`${prefix}: expected at least 50 sentences, found ${items.length}.`);
    items.forEach((item, index) => {
      const where = `${prefix}, item ${index + 1}`;
      if (item.framework !== frameworkId) errors.push(`${where}: framework mismatch.`);
      if (item.level !== level.id) errors.push(`${where}: level mismatch.`);
      if (!item.id || typeof item.id !== 'string') errors.push(`${where}: missing id.`);
      if (!item.text || typeof item.text !== 'string') errors.push(`${where}: missing text.`);
      if (!item.grammar || typeof item.grammar !== 'string') errors.push(`${where}: missing grammar.`);
      if (!item.note || typeof item.note !== 'string') errors.push(`${where}: missing note.`);
      if (!Array.isArray(item.tags)) errors.push(`${where}: tags must be an array.`);
      const words = String(item.text || '').trim().split(/\s+/).filter(Boolean);
      if (words.length < 3) errors.push(`${where}: fewer than three words.`);
      const normal = String(item.text || '').toLowerCase().replace(/\s+/g, ' ').trim();
      if (seen.has(normal)) errors.push(`${where}: duplicate sentence.`);
      seen.add(normal);
      total += 1;
    });
  });
});

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated ${total} sentences across ${Object.keys(routes.frameworks).length} framework families.`);
