import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const origin = process.env.DEMO_URL ?? 'http://127.0.0.1:8765';
const browser = await chromium.launch({ chromiumSandbox: true, ...(process.env.LATTICE_BROWSER_CHANNEL ? { channel: process.env.LATTICE_BROWSER_CHANNEL } : {}) });
async function checkDiagram(page) {
  const blocks = page.locator('#records-diagram li');
  assert.deepEqual(await blocks.allTextContents(), ['Data address', 'Investigation procedure', 'Action revision']);
  assert.ok((await page.locator('#records-diagram figcaption').textContent()).includes('not an integration between the three products'));
  assert.equal(await blocks.evaluateAll(elements => elements.every(element => {
    const box = element.getBoundingClientRect();
    const range = document.createRange(); range.selectNodeContents(element);
    return parseFloat(getComputedStyle(element).fontSize) >= 16 && [...range.getClientRects()].every(rect => rect.left >= box.left && rect.right <= box.right && rect.top >= box.top && rect.bottom <= box.bottom);
  })), true, 'diagram labels remain readable inside their blocks');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
}
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const response = await page.goto(origin);
    assert.equal(response.status(), 200);
    await page.waitForFunction(() => !document.querySelector('#lattice-controls').disabled);
    assert.equal(await page.locator('article h1').textContent(), 'Code fieldnotes');
    assert.equal(await page.locator('#lattice-current-collection').textContent(), 'Pages');
    if (width === 390) await page.getByRole('button', { name: /Browse.*search/i }).click();
    assert.equal(await page.locator('#lattice-page-navigation summary').filter({ hasText: /^Pages/ }).count(), 1);
    assert.equal(await page.locator('#lattice-page-navigation').getByText('_root', { exact: false }).count(), 0);
    await page.getByRole('searchbox').fill('Saved investigations');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.locator('#lattice-results a').waitFor();
    assert.equal(await page.locator('#lattice-results a').count(), 1);
    assert.ok((await page.locator('#lattice-results a').getAttribute('href')).startsWith('/Notes/supabase-notebooks/'));
    await page.locator('#lattice-filters').evaluate(element => element.open = true);
    await page.evaluate(() => window.readerContinuity = 'kept');
    await page.locator('#lattice-results a').click();
    await page.waitForURL('**/Notes/supabase-notebooks/**');
    await page.waitForFunction(() => !document.querySelector('#lattice-controls').disabled);
    assert.equal(await page.locator('article h1').textContent(), 'Supabase Explorer notebooks');
    assert.equal(await page.evaluate(() => window.readerContinuity), 'kept', 'sidebar navigation must preserve the reader shell');
    assert.equal(await page.locator('#lattice-filters').getAttribute('open'), '', 'tag disclosure stays open');
    assert.equal(await page.locator('#lattice-query').inputValue(), 'Saved investigations');
    const noteURL = page.url();
    if (width === 390) await page.getByRole('button', { name: /Browse.*search/i }).click();
    let releaseVisit, sawVisit;
    const visitGate = new Promise(resolve => releaseVisit = resolve);
    const visitSeen = new Promise(resolve => sawVisit = resolve);
    await page.route('**/Notes/sail-onelake/', async route => { sawVisit(); await visitGate; await route.continue(); });
    await page.locator('#lattice-page-navigation').getByRole('link', { name: 'Sail and OneLake', exact: true }).click();
    await visitSeen;
    assert.equal(await page.locator('#lattice-controls').isDisabled(), false);
    assert.equal(await page.locator('#lattice-filters').getAttribute('open'), '');
    assert.equal(await page.locator('#lattice-query').inputValue(), 'Saved investigations');
    releaseVisit();
    await page.waitForURL('**/Notes/sail-onelake/');
    assert.equal(await page.evaluate(() => window.readerContinuity), 'kept');
    await page.unroute('**/Notes/sail-onelake/');
    await page.goBack(); await page.waitForURL(noteURL);
    await page.waitForFunction(() => document.querySelector('article h1')?.textContent === 'Supabase Explorer notebooks');
    assert.equal(await page.evaluate(() => window.readerContinuity), 'kept');
    const heading = page.locator('#repeat-the-question-not-the-snapshot');
    const permalink = heading.locator('.section-permalink');
    await permalink.focus();
    const aligned = await heading.evaluate(element => {
      const range = document.createRange(); range.selectNodeContents(element.firstChild);
      const text = [...range.getClientRects()];
      const link = element.querySelector('.section-permalink').getBoundingClientRect();
      return link.top < text[0].bottom && link.bottom > text[0].top && text.every(rect => rect.right <= link.left);
    });
    assert.equal(aligned, true, 'section link stays beside the heading without overlap');
    assert.equal(await permalink.getAttribute('href'), '#repeat-the-question-not-the-snapshot');
    await permalink.press('Enter');
    assert.equal(new URL(page.url()).hash, '#repeat-the-question-not-the-snapshot');

    await page.goto(origin + '/Notes/actions-lockfiles/');
    await checkDiagram(page);
    const rows = await page.locator('#records-diagram li').evaluateAll(elements => elements.map(element => Math.round(element.getBoundingClientRect().top)));
    assert.equal(new Set(rows).size, width === 1440 ? 1 : 3);
    if (process.env.DEMO_SCREENSHOTS) await page.locator('#records-diagram').screenshot({ path: `${process.env.DEMO_SCREENSHOTS}-diagram-${width}.png` });
    await page.getByRole('link', { name: 'notebooks preserve a procedure', exact: true }).click();
    await page.waitForURL('**/Notes/supabase-notebooks/#keep-the-procedure');
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
  for (const width of [320, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage(); await page.goto(origin);
    await page.waitForFunction(() => !document.querySelector('#lattice-controls').disabled);
    await page.evaluate(() => document.documentElement.style.fontSize = '32px');
    const title = await page.locator('article h1').evaluate(heading => {
      const text = heading.firstChild; const start = text.textContent.indexOf('fieldnotes');
      const range = document.createRange(); range.setStart(text, start); range.setEnd(text, start + 'fieldnotes'.length);
      return { lines: new Set([...range.getClientRects()].map(rect => Math.round(rect.top))).size, size: parseFloat(getComputedStyle(heading).fontSize) };
    });
    assert.equal(title.lines, 1, 'ordinary title word fits at enlarged text size');
    assert.ok(title.size >= 68, 'do not shrink enlarged title text');
    const fits = await page.locator('.masthead').evaluate(header => {
      const bounds = header.getBoundingClientRect();
      const brand = header.querySelector('.brand');
      const toggle = header.querySelector('button').getBoundingClientRect();
      const range = document.createRange(); range.selectNodeContents(brand.lastElementChild);
      return [...range.getClientRects(), toggle].every(rect => rect.left >= bounds.left && rect.right <= bounds.right && rect.top >= bounds.top && rect.bottom <= bounds.bottom)
        && brand.getBoundingClientRect().bottom <= toggle.top
        && document.documentElement.scrollWidth <= innerWidth;
    });
    assert.equal(fits, true, 'enlarged mobile masthead keeps full labels in separate rows');
    const toggle = page.getByRole('button', { name: 'Browse & search' });
    await toggle.focus(); await toggle.press('Enter');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await toggle.evaluate(element => element === document.activeElement), true);
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    if (process.env.DEMO_SCREENSHOTS) await page.screenshot({ path: `${process.env.DEMO_SCREENSHOTS}-${width}-double-text.png` });
    await page.goto(origin + '/Notes/supabase-notebooks/');
    await page.waitForFunction(() => !document.querySelector('#lattice-controls').disabled);
    await page.evaluate(() => document.documentElement.style.fontSize = '32px');
    const section = page.locator('#repeat-the-question-not-the-snapshot');
    await section.locator('.section-permalink').click();
    assert.ok((await section.boundingBox()).y >= (await page.locator('.masthead').boundingBox()).height, 'fragment clears enlarged masthead');
    await page.goto(origin + '/Notes/actions-lockfiles/');
    await page.evaluate(() => document.documentElement.style.fontSize = '32px');
    await checkDiagram(page);
    if (process.env.DEMO_SCREENSHOTS) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: `${process.env.DEMO_SCREENSHOTS}-diagram-${width}-double.png`, fullPage: true });
    }
    await page.emulateMedia({ forcedColors: 'active' });
    await checkDiagram(page);
    assert.equal(await page.locator('#records-diagram li').first().evaluate(element => getComputedStyle(element).borderStyle), 'solid');
    await context.close();
  }
  const plain = await browser.newContext({ javaScriptEnabled: false });
  const page = await plain.newPage(); await page.goto(origin + '/Notes/supabase-notebooks/');
  const details = page.locator('article details.callout-question'); await details.locator('summary').click();
  assert.notEqual(await details.getAttribute('open'), null);
  await page.getByRole('link', { name: 'Actions lockfile', exact: true }).click();
  await checkDiagram(page);
  await plain.close();
  console.log(`Verified deployed reader, real WASM alias search, canonical citations, labeled diagram, mobile reflow and no-JS callouts: ${origin}`);
} finally { await browser.close(); }
