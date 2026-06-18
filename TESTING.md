# Testing

The site ships as static HTML with no build step, but the inline JavaScript
(contact form, cookie consent, the `/matcher` and `/norda-demo` prototypes) is
now covered by an automated test suite. Tests run the **real** page code by
loading the actual HTML files — there is no second copy of the logic to keep in
sync.

## Stack

- **Vitest + jsdom** — unit & integration tests. Each test loads a real HTML
  file into jsdom (`tests/helpers/loadHtml.js`), runs its inline scripts, and
  asserts against the resulting globals/DOM.
- **Playwright** — one end-to-end smoke of the homepage lead-capture flow in a
  real Chromium browser, served by a tiny static server (`tests/e2e/server.mjs`).

## Running

```bash
npm install                 # one-time
npm run test:unit           # vitest (unit + integration) — fast, no browser
npx playwright install chromium   # one-time, downloads the browser
npm run test:e2e            # playwright end-to-end
```

## What's covered

| Area | File | Notes |
|------|------|-------|
| Currency parsing (`parseAmt`, `formatNum`) | `tests/unit/norda-parseAmt.test.js` | M / "k ft" suffixes, comma decimals, malformed input |
| Match-score classification (`cc`, `cv`, `sc`) | `tests/unit/matcher-classify.test.js` | 70 / 85 thresholds, status mapping |
| Contact form (`setTrack`, submit handler) | `tests/integration/contact-form.test.js` | required-field toggling, JSON payload, success/error states, validation gate |
| Cookie consent / GA Consent Mode | `tests/integration/consent.test.js` | banner visibility, granted/denied storage, gtag gating |
| Homepage lead-capture e2e | `tests/e2e/contact.spec.js` | real-browser founder submit + investor tab |

## CI

`.github/workflows/ci.yml` runs the vitest suite and the Playwright e2e on every
push to `main` / `claude/**` and on PRs to `main`.

## Notes for contributors

- The tests assume `window.CONFIG` is the submission config object in
  `index.html` (so a test/e2e can point the form at a stub endpoint). Keep it on
  `window`, not a block-scoped `const`.
- Element IDs/names referenced by the form tests (`#f_name`, `#i_email`,
  `#tabInvestor`, `#successState`, …) are part of the tested contract — if you
  rename them, update the tests.
