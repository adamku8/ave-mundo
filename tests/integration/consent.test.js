import { describe, it, expect, afterEach, vi } from 'vitest';
import { loadHtml } from '../helpers/loadHtml.js';

// Verifies the cookie-consent / GA Consent Mode wiring in index.html.
let dom;

afterEach(() => {
  dom?.window.close();
});

describe('cookie consent banner', () => {
  it('is shown on first visit (no stored choice)', () => {
    dom = loadHtml('index.html');
    expect(dom.window.document.getElementById('cookie-banner').hidden).toBe(false);
  });

  it('accepting stores "granted" and updates GA consent', () => {
    dom = loadHtml('index.html');
    const win = dom.window;
    const gtagSpy = vi.fn();
    win.gtag = gtagSpy;

    win.cookieAccept();

    expect(win.localStorage.getItem('avemundo_consent')).toBe('granted');
    expect(gtagSpy).toHaveBeenCalledWith('consent', 'update', { analytics_storage: 'granted' });
    expect(win.document.getElementById('cookie-banner').hidden).toBe(true);
  });

  it('declining stores "denied" and does NOT grant GA consent', () => {
    dom = loadHtml('index.html');
    const win = dom.window;
    const gtagSpy = vi.fn();
    win.gtag = gtagSpy;

    win.cookieDecline();

    expect(win.localStorage.getItem('avemundo_consent')).toBe('denied');
    expect(gtagSpy).not.toHaveBeenCalled();
    expect(win.document.getElementById('cookie-banner').hidden).toBe(true);
  });
});
