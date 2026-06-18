# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The source for **avemundo.com** — the public marketing site for AVE MUNDO a.s., a boutique
investment holding for AI / e-commerce / SaaS companies in the EU. It is a **static HTML site
with no build step**, served by **GitHub Pages** from the repo root, on the custom domain in
`CNAME` (`avemundo.com`).

There is no framework, no bundler, no package manager, no tests, and no CI build. Each page is a
single self-contained `.html` file: CSS lives in an inline `<style>` block, JS in inline
`<script>` blocks, and most images are embedded as base64 data URIs (hence the large `index.html`).
Editing a page means editing that one file.

## Working on the site (no toolchain)

- **Preview:** open the `.html` file directly in a browser, or serve the repo root
  (e.g. `python3 -m http.server`) and visit the page. There is nothing to compile.
- **Deploy:** push to the deployment branch — GitHub Pages publishes the repo root automatically.
  There is no separate `dist/`. (Develop on the branch you were assigned; do not push elsewhere.)
- **Verification is manual:** check the page renders, links work, and structured data / meta tags
  stay valid. There is no lint or test command to run.

## Bilingual structure — the most important convention

The site is bilingual. **English is the master** and lives at the repo root; **Czech is a full
mirror** under `cs/`:

```
index.html  thesis.html  faq.html  privacy.html  imprint.html      ← EN master (root)
cs/index.html  cs/thesis.html  cs/faq.html  cs/privacy.html  cs/imprint.html   ← CS mirror
```

When you change content, layout, or structure in a root page, **make the parallel change in its
`cs/` counterpart** (and vice versa). The two versions must stay structurally in sync. Differences
that are *intentional* per language: `<html lang>` (`en` vs `cs`), the `<link rel="canonical">`,
and the active state of the language switcher (`.lang-switch__btn--active`). The language switcher
in the footer links `/` ↔ `/cs/`.

If you add or remove a page, also update **`sitemap.xml`** (both EN and CS `<loc>` entries),
the **`hreflang`** alternate links in the page `<head>`, and **`llms.txt`** if it lists pages.

## SEO / metadata surface (keep consistent across pages)

Every public page carries a coordinated set of metadata that must agree with each other and with
the actual content:

- Canonical URL, `hreflang` alternates (`en`, `cs`, `x-default`), Open Graph, and Twitter card tags.
- **JSON-LD structured data** (`<script type="application/ld+json">`) — Organization, founders,
  portfolio. Company facts (legal name *AVE MUNDO a.s.*, IČO `19576749`, DIČ `CZ19576749`, address
  Poštovní 244, Třinec) must match across JSON-LD, `imprint.html`, and `llms.txt`.
- **`llms.txt`** (root) follows the llms.txt convention — an AI-friendly summary of the company and
  its pages. Update it when company facts, founders, portfolio, or page list change.
- **`robots.txt`** explicitly welcomes AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) and
  **disallows `/matcher/`**. `sitemap.xml` lists only the public marketing pages.

## Analytics & consent

Pages load **Google Analytics 4 (`G-85S9MZPXNW`)** wired through **Consent Mode v2**. The default
state is **deny**; `analytics_storage` is granted only after the visitor accepts via the cookie
banner, and the choice is stored in `localStorage` under `avemundo_consent`. IPs are anonymized.
If you touch the GA snippet or cookie banner, replicate the change identically on every page that
has analytics (EN and CS).

## Contact form (index only)

The homepage contact form has a **founder / investor track toggle** (`setTrack()`), driven by
inline JS. Submission uses `CONFIG.submitEndpoint`; when that string is empty (current state), it
**falls back to a `mailto:` to `hello@avemundo.com`** composed from the form fields. To enable a
real backend (Make.com / Formspree / Basin), set `CONFIG.submitEndpoint` rather than rewriting the
handler.

## Assets and what is intentionally NOT committed

- `brand-assets/` holds the logos, favicons, founder photos, and SVG illustrations referenced by
  the pages.
- `.gitignore` deliberately keeps **strategic/private material out of the repo**: internal Notion
  exports (valuation, financing, structure), original high-res / experimental photo and logo
  variants, and working files like `brand-identity.html` / `wireframes.html`. Don't commit these.
- **`CLAUDE.md` itself is listed in `.gitignore`** as a local-only file. This copy was added to the
  repo on request; if you regenerate or move it, be aware the ignore rule means it won't be tracked
  by default (force-add if you intend to commit it).

## Prototypes (not part of the marketing site)

These are standalone internal demos, kept out of search and the sitemap — treat them as separate
from the bilingual marketing pages:

- **`matcher/index.html`** — "Matcher / Amazon Product Matching" prototype. `noindex` and
  disallowed in `robots.txt`.
- **`norda-demo/index.html`** — "NORDA · Agent Dashboard" prototype (Czech, uses Chart.js via CDN).
  `noindex`, not in the sitemap.
