# Word Order Rally

Word Order Rally is a no-backend classroom sentence game for English language teaching. It has two deliberately different play flows:

- **Class Display**: show a scrambled sentence, run the timer, and reveal the answer automatically when time ends.
- **Solo Practice**: learners tap words into an answer tray, check the answer, get red/green word-position feedback, and see the correct sentence underneath.

The app is vanilla HTML/CSS/JavaScript and works well on GitHub Pages.

## What is included

- Mode-first setup for class display or solo practice.
- CEFR, MYP Language Acquisition, and TEFL/general English routes.
- 800 generated example sentences:
  - CEFR: A1, A2, B1, B2, C1
  - MYP: Phase 1-2, Phase 2-3, Phase 3-4, Phase 4-5, Phase 5-6
  - TEFL: Beginner, Elementary, Pre-Intermediate, Intermediate, Upper-Intermediate, Advanced
  - 50 sentences per route
- Local teacher bank with save, import, and export.
- PWA manifest and service worker.
- Lightweight validation scripts.

## Run locally

Because the app loads JSON files, use a local server rather than double-clicking `index.html`.

With Node:

```bash
npm run serve
```

Then open:

```text
http://127.0.0.1:8080/
```

With Python:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

On Windows, `py -m http.server 8080` also works if `python` is not on PATH.

## Validate

```bash
npm run check:js
npm run validate:sentences
```

To regenerate the bundled example sentence bank:

```bash
npm run build:data
```

## Project structure

```text
index.html
manifest.webmanifest
service-worker.js
.nojekyll
assets/
  css/styles.css
  data/level-routes.json
  data/sentence-bank.json
  icons/
  js/
docs/
tools/
  build-sentence-bank.mjs
  serve-local.mjs
  validate-sentences.mjs
```

## Notes on levels

The CEFR, MYP, and TEFL labels are classroom routes into example sentence banks, not formal assessment claims. Teachers can import their own sentences when a course, school, or language context needs a different vocabulary or grammar profile.

## Deploy on GitHub Pages

1. Upload the project files to a GitHub repository.
2. Keep `.nojekyll` in the repository root.
3. Keep `index.html`, `manifest.webmanifest`, and `service-worker.js` in the repository root.
4. Enable GitHub Pages from repository settings.
5. Use the repository root as the Pages source.

## Licence

The app code and bundled example sentence data are provided under the included MIT licence.
