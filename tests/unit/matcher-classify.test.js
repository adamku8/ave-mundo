import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { loadHtml } from '../helpers/loadHtml.js';

// Exercises the real classification helpers in matcher/index.html:
//   cc(c) -> CSS class by confidence, cv(c) -> colour, sc(status) -> status class.
let dom, win;

beforeAll(() => {
  dom = loadHtml('matcher/index.html');
  win = dom.window;
});

afterAll(() => {
  dom.window.close();
});

describe('cc — confidence → CSS class (thresholds 85 / 70)', () => {
  it('is high at and above 85', () => {
    expect(win.cc(100)).toBe('c-hi');
    expect(win.cc(85)).toBe('c-hi');
  });

  it('is medium in [70, 85)', () => {
    expect(win.cc(84)).toBe('c-md');
    expect(win.cc(70)).toBe('c-md');
  });

  it('is low below 70', () => {
    expect(win.cc(69)).toBe('c-lo');
    expect(win.cc(0)).toBe('c-lo');
  });
});

describe('cv — confidence → colour (same thresholds)', () => {
  it('maps each band to its colour', () => {
    expect(win.cv(90)).toBe('#008060'); // green
    expect(win.cv(75)).toBe('#d97706'); // amber
    expect(win.cv(50)).toBe('#c0392b'); // red
  });

  it('uses the same boundaries as cc', () => {
    expect(win.cv(85)).toBe('#008060');
    expect(win.cv(84)).toBe('#d97706');
    expect(win.cv(70)).toBe('#d97706');
    expect(win.cv(69)).toBe('#c0392b');
  });
});

describe('sc — status → CSS class', () => {
  it('maps known statuses', () => {
    expect(win.sc('Published')).toBe('s-pub');
    expect(win.sc('Unpublished')).toBe('s-unp');
    expect(win.sc('Pending')).toBe('s-pen');
    expect(win.sc('Error')).toBe('s-err');
  });

  it('falls back to empty string for unknown status', () => {
    expect(win.sc('Whatever')).toBe('');
    expect(win.sc('')).toBe('');
  });
});
