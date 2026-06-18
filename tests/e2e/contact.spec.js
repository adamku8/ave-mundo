import { test, expect } from '@playwright/test';

// End-to-end smoke of the homepage's lead-capture flow in a real browser.

test('founder application submits and shows the success state', async ({ page }) => {
  await page.goto('/');

  // Point the form at a stubbed endpoint and intercept the request so no real
  // network call happens (and the deterministic webhook path is exercised).
  await page.evaluate(() => {
    window.CONFIG.submitEndpoint = 'https://hook.test/submit';
  });
  await page.route('https://hook.test/submit', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  );

  await page.fill('#f_name', 'Jane Doe');
  await page.fill('#f_email', 'jane@acme.com');
  await page.fill('#f_company', 'Acme Co.');
  await page.fill('#f_what', 'We build autonomous localisation agents for ecommerce.');

  await page.click('#submitBtn');

  await expect(page.locator('#successState')).toHaveClass(/show/);
});

test('investor tab toggles the investor track UI', async ({ page }) => {
  await page.goto('/');

  await page.click('#tabInvestor');

  await expect(page.locator('#tabInvestor')).toHaveClass(/active/);
  await expect(page.locator('#investorFields')).toHaveClass(/active/);
  await expect(page.locator('#trackInput')).toHaveValue('investor');
});
