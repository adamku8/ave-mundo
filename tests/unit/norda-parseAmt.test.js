import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { loadHtml } from '../helpers/loadHtml.js';

// Exercises the real parseAmt() / formatNum() defined inline in norda-demo/index.html.
let dom, win;

beforeAll(() => {
  dom = loadHtml('norda-demo/index.html');
  win = dom.window;
});

afterAll(() => {
  dom.window.close(); // stops the page's setInterval clock
});

describe('parseAmt — currency string parsing', () => {
  it('parses plain space-grouped CZK amounts', () => {
    expect(win.parseAmt('1 624 300 Kč')).toBe(1624300);
    expect(win.parseAmt('948 600 Kč')).toBe(948600);
  });

  it('expands the M (million) suffix', () => {
    expect(win.parseAmt('1.2M')).toBe(1200000);
    expect(win.parseAmt('3M Kč')).toBe(3000000);
  });

  it('treats a comma as a decimal separator before M', () => {
    expect(win.parseAmt('2,5M')).toBe(2500000);
  });

  it('expands the "k ft" (thousand) suffix', () => {
    expect(win.parseAmt('5k ft')).toBe(5000);
    expect(win.parseAmt('12,5k ft')).toBe(12500);
  });

  it('returns NaN for input with no digits at all', () => {
    // The M/k branches require a digit before the suffix, so a bare suffix
    // falls through to parseInt('') → NaN. (Documents that parseAmt assumes
    // well-formed input; callers feed it constants, never user data.)
    expect(Number.isNaN(win.parseAmt('M'))).toBe(true);
    expect(Number.isNaN(win.parseAmt(''))).toBe(true);
    expect(Number.isNaN(win.parseAmt('Kč'))).toBe(true);
  });
});

describe('formatNum — thousands grouping', () => {
  it('groups thousands with a space', () => {
    expect(win.formatNum(1234567)).toBe('1 234 567');
    expect(win.formatNum(1000)).toBe('1 000');
  });

  it('leaves short numbers untouched', () => {
    expect(win.formatNum(0)).toBe('0');
    expect(win.formatNum(42)).toBe('42');
    expect(win.formatNum(999)).toBe('999');
  });
});
