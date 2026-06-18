import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadHtml } from '../helpers/loadHtml.js';

// Drives the real contact-form logic in index.html (setTrack + submit handler).
let dom, win, doc;

beforeEach(() => {
  dom = loadHtml('index.html');
  win = dom.window;
  doc = win.document;
});

afterEach(() => {
  dom.window.close();
});

describe('setTrack — founder/investor toggle', () => {
  it('starts on the founder track', () => {
    expect(doc.getElementById('trackInput').value).toBe('founder');
    expect(doc.getElementById('founderFields').classList.contains('active')).toBe(true);
    expect(doc.getElementById('investorFields').classList.contains('active')).toBe(false);
  });

  it('switching to investor flips required fields and active tab', () => {
    win.setTrack('investor');

    expect(doc.getElementById('trackInput').value).toBe('investor');
    expect(doc.getElementById('tabInvestor').classList.contains('active')).toBe(true);
    expect(doc.getElementById('tabInvestor').getAttribute('aria-selected')).toBe('true');

    // founder fields no longer required, investor fields now required
    expect(doc.getElementById('f_name').required).toBe(false);
    expect(doc.getElementById('f_email').required).toBe(false);
    expect(doc.getElementById('i_name').required).toBe(true);
    expect(doc.getElementById('i_type').required).toBe(true);
  });

  it('switching back to founder restores founder requirements', () => {
    win.setTrack('investor');
    win.setTrack('founder');
    expect(doc.getElementById('f_company').required).toBe(true);
    expect(doc.getElementById('i_name').required).toBe(false);
  });
});

describe('form submission', () => {
  function fillFounder() {
    doc.getElementById('f_name').value = 'Jane Doe';
    doc.getElementById('f_email').value = 'jane@acme.com';
    doc.getElementById('f_company').value = 'Acme Co.';
    doc.getElementById('f_what').value = 'We build autonomous localisation agents.';
  }

  function submit() {
    const form = doc.getElementById('contactForm');
    form.dispatchEvent(new win.Event('submit', { cancelable: true, bubbles: true }));
    // let the async handler settle
    return new Promise((r) => setTimeout(r, 20));
  }

  it('posts JSON to the configured endpoint and shows the success state', async () => {
    win.CONFIG.submitEndpoint = 'https://hook.test/submit';
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200 }));
    win.fetch = fetchMock;

    fillFounder();
    await submit();

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('https://hook.test/submit');
    expect(opts.method).toBe('POST');

    const body = JSON.parse(opts.body);
    expect(body.track).toBe('founder');
    expect(body.source).toBe('avemundo.com');
    expect(body.founder_email).toBe('jane@acme.com');
    expect(body.company).toBe('Acme Co.');
    expect(body.submitted_at).toBeTruthy();

    expect(doc.getElementById('successState').classList.contains('show')).toBe(true);
  });

  it('blocks submission and never calls fetch when required fields are empty', async () => {
    win.CONFIG.submitEndpoint = 'https://hook.test/submit';
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200 }));
    win.fetch = fetchMock;

    const form = doc.getElementById('contactForm');
    form.reportValidity = vi.fn(() => false); // jsdom doesn't implement it natively

    await submit();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(doc.getElementById('successState').classList.contains('show')).toBe(false);
  });

  it('shows the error state when the endpoint rejects', async () => {
    win.CONFIG.submitEndpoint = 'https://hook.test/submit';
    win.fetch = vi.fn(async () => ({ ok: false, status: 500 }));

    fillFounder();
    await submit();

    expect(doc.getElementById('errorState').classList.contains('show')).toBe(true);
    expect(doc.getElementById('successState').classList.contains('show')).toBe(false);
  });

  it('carries the investor track through to the payload', async () => {
    win.CONFIG.submitEndpoint = 'https://hook.test/submit';
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200 }));
    win.fetch = fetchMock;

    win.setTrack('investor');
    doc.getElementById('i_name').value = 'Investor Inc';
    doc.getElementById('i_email').value = 'lp@fund.com';
    doc.getElementById('i_type').value = doc.getElementById('i_type').options[1]?.value || '';

    await submit();

    expect(fetchMock).toHaveBeenCalledOnce();
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.track).toBe('investor');
    expect(body.investor_email).toBe('lp@fund.com');
  });
});
