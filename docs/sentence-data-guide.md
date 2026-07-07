# Sentence Data Guide

The bundled bank lives in `assets/data/sentence-bank.json`. Route labels and setup metadata live in `assets/data/level-routes.json`.

The generated bank contains 800 example sentences:

- CEFR: A1, A2, B1, B2, C1
- MYP: Phase 1-2, Phase 2-3, Phase 3-4, Phase 4-5, Phase 5-6
- TEFL: Beginner, Elementary, Pre-Intermediate, Intermediate, Upper-Intermediate, Advanced
- 50 sentences per route

Each sentence uses this shape:

```json
{
  "id": "CEFR-A1-01",
  "framework": "cefr",
  "level": "A1",
  "text": "Mina has a blue notebook.",
  "grammar": "Have for possession",
  "note": "Have shows ownership or possession.",
  "tags": ["have", "possession", "cefr", "A1"]
}
```

To regenerate the bundled examples:

```bash
npm run build:data
```

To validate the bank:

```bash
npm run validate:sentences
```

Teacher-created sentences can also be saved, exported, and imported from the app. Those entries stay local to the browser unless exported manually.
