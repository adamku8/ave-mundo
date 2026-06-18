import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Load one of the site's real HTML files into jsdom and run its inline scripts,
 * so tests exercise the production code (not a copy). Browser APIs that jsdom
 * lacks are polyfilled in `beforeParse` so the inline scripts run to completion
 * and every global function (parseAmt, setTrack, cc, cookieAccept, …) is defined.
 *
 * Returns the JSDOM instance; call `dom.window.close()` when done to stop the
 * page's timers (norda-demo registers a setInterval clock).
 */
export function loadHtml(relPath, { url = 'https://avemundo.com/' } = {}) {
  const html = readFileSync(path.join(ROOT, relPath), 'utf8');

  // Swallow page-level console noise (e.g. the GA snippet) so test output stays clean.
  const virtualConsole = new VirtualConsole();

  return new JSDOM(html, {
    url,
    runScripts: 'dangerously',
    pretendToBeVisual: true, // provides requestAnimationFrame / cancelAnimationFrame
    virtualConsole,
    beforeParse(window) {
      // IntersectionObserver — index.html uses it for scroll reveals. Without a
      // stub the inline script throws before the form submit handler is attached.
      window.IntersectionObserver = class {
        constructor(cb) { this.cb = cb; }
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() { return []; }
      };

      // matchMedia — used by the hero parallax (prefers-reduced-motion).
      if (typeof window.matchMedia !== 'function') {
        window.matchMedia = () => ({
          matches: false,
          media: '',
          onchange: null,
          addEventListener() {},
          removeEventListener() {},
          addListener() {},
          removeListener() {},
          dispatchEvent() { return false; },
        });
      }

      // scrollTo — norda-demo's view switcher calls it.
      window.scrollTo = () => {};
    },
  });
}

export { ROOT };
