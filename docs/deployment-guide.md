# Deployment Guide

Word Order Rally is a static app. It does not need a build step, backend, database, login, or external asset host.

## Local preview

```bash
npm run serve
```

Then open `http://127.0.0.1:8080/`.

Or with Python:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/`.

## GitHub Pages

1. Commit the project root as-is.
2. Keep `.nojekyll`, `index.html`, `manifest.webmanifest`, and `service-worker.js` in the repository root.
3. In GitHub, open repository settings.
4. Enable Pages from the repository root.
5. Visit the Pages URL after deployment finishes.

## Checks before publishing

```bash
npm run check:js
npm run validate:sentences
```
