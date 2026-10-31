import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const origin = process.env.DEMO_URL ?? 'http://127.0.0.1:8765';
const browser = await chromium.launch({ chromiumSandbox: true, ...(process.env.LATTICE_BROWSER_CHANNEL ? { channel: process.env.LATTICE_BROWSER_CHANNEL } : {}) });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const response = await page.goto(origin);
    assert.equal(response.status(), 200);
    await page.waitForFunction(() => !document.querySelector('#lattice-controls').disabled);
    assert.equal(await page.locator('article h1').textContent(), 'Code fieldnotes');
    if (width === 390) await page.getByRole('button', { name: /Browse.*search/i }).click();
    await page.getByRole('searchbox').fill('Saved investigations');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.locator('#lattice-results a').waitFor();
    assert.equal(await page.locator('#lattice-results a').count(), 1);
    assert.ok((await page.locator('#lattice-results a').getAttribute('href')).startsWith('/Notes/supabase-notebooks/'));
    await page.locator('#lattice-results a').click();
    await page.waitForURL('**/Notes/supabase-notebooks/**');
    assert.equal(await page.locator('article h1').textContent(), 'Supabase Explorer notebooks | Code fieldnotes');
    await page.goto(origin + '/Notes/actions-lockfiles/');
    const img = page.locator('article img'); await img.evaluate(el => el.decode());
    assert.equal(await img.evaluate(el => el.naturalWidth), 600);
    await page.getByRole('link', { name: 'notebooks preserve a procedure', exact: true }).click();
    assert.equal(new URL(page.url()).hash, '#keep-the-procedure');
    assert.equal(await page.locator('#keep-the-procedure').count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    if (process.env.DEMO_UPDATED === '1') {
      await page.goto(origin + '/Notes/supabase-notebooks/');
      assert.equal(await page.locator('#repeat-the-question-not-the-snapshot').count(), 1);
      await page.waitForFunction(() => !document.querySelector('#lattice-controls').disabled);
      if (width === 390) await page.getByRole('button', { name: /Browse.*search/i }).click();
      await page.getByRole('searchbox').fill('snapshot');
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      await page.locator('#lattice-results a').waitFor();
      assert.equal(await page.locator('#lattice-results a').first().getAttribute('href'), '/Notes/supabase-notebooks/#repeat-the-question-not-the-snapshot');
    }
    if (process.env.DEMO_SCREENSHOTS) await page.screenshot({ path: `${process.env.DEMO_SCREENSHOTS}-${width}.png`, fullPage: true });
    assert.deepEqual(errors, []);
    await context.close();
  }
  const plain = await browser.newContext({ javaScriptEnabled: false });
  const page = await plain.newPage(); await page.goto(origin + '/Notes/supabase-notebooks/');
  const details = page.locator('article details.callout-question'); await details.locator('summary').click();
  assert.notEqual(await details.getAttribute('open'), null);
  await page.getByRole('link', { name: 'Actions lockfile', exact: true }).click();
  await page.locator('article img').evaluate(el => el.decode());
  await plain.close();
  console.log(`Verified deployed reader, real WASM alias search, canonical citations, image, mobile reflow and no-JS callouts: ${origin}`);
} finally { await browser.close(); }
