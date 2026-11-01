import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const origin = process.env.DEMO_URL ?? 'http://127.0.0.1:8765';
const browser = await chromium.launch({ chromiumSandbox: true, ...(process.env.LATTICE_BROWSER_CHANNEL ? { channel: process.env.LATTICE_BROWSER_CHANNEL } : {}) });
async function checkRelated(page) {
  const related = page.getByRole('region', { name: 'Related notes', exact: true });
  assert.equal(await related.locator('p').innerText(), 'Selected by the author.');
  assert.deepEqual(await related.locator('a').allTextContents(), ['Supabase Explorer notebooks', 'GitHub Actions dependency lockfiles']);
  assert.deepEqual(await related.locator('a').evaluateAll(links => links.map(a => a.getAttribute('href'))), ['/Notes/supabase-notebooks/', '/Notes/actions-lockfiles/']);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
}
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
  const coldContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const cold = await coldContext.newPage();
  let release;
  const gate = new Promise(resolve => release = resolve);
  await cold.route('**/app.js', async route => { await gate; await route.continue(); });
  await cold.goto(origin + '/Notes/supabase-notebooks/', { waitUntil: 'commit' });
  await cold.locator('article h1').waitFor();
  assert.equal(await cold.locator('article h1').textContent(), 'Supabase Explorer notebooks');
  assert.equal(await cold.title(), 'Supabase Explorer notebooks | Code fieldnotes');
  const coldMetadata = (await cold.locator('.reader-metadata').innerText()).replace(/\s+/g, ' ');
  assert.match(coldMetadata, /Published 2026-10-31/);
  assert.match(coldMetadata, /Tags:/);
  assert.match(coldMetadata, /Backlinks \(\d+\)/);
  assert.equal(coldMetadata.includes('Updated'), false);
  const sourceBacklink = cold.locator('.backlinks li').filter({ has: cold.getByRole('link', { name: 'Sail and OneLake', exact: true }) });
  assert.match(await sourceBacklink.locator('.backlink-context').innerText(), /save the investigation that uses the connection/);
  assert.equal(await sourceBacklink.locator('a').getAttribute('href'), '/Notes/sail-onelake/#what-to-verify');
  release();
  await cold.waitForFunction(() => !document.querySelector('#lattice-controls').disabled);
  assert.equal(await cold.locator('article h1').textContent(), 'Supabase Explorer notebooks');
  assert.equal((await cold.locator('.reader-metadata').innerText()).replace(/\s+/g, ' '), coldMetadata);
  await coldContext.close();
  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  for (const [path, title] of [['/', 'Code fieldnotes'], ['/Notes/supabase-notebooks/', 'Supabase Explorer notebooks']]) {
    await staticPage.goto(origin + path);
    assert.equal(await staticPage.locator('article h1').textContent(), title);
    const metadata = await staticPage.locator('.reader-metadata').innerText();
    assert.match(metadata, /Published 2026-10-31/);
    if (path === '/') assert.match(metadata, /Updated 2026-11-01/);
    await staticPage.reload();
    assert.equal(await staticPage.locator('article h1').textContent(), title);
  }
  const sourceLink = staticPage.locator('.backlinks').getByRole('link', { name: 'Sail and OneLake', exact: true });
  await sourceLink.focus(); await sourceLink.press('Enter');
  await staticPage.waitForURL('**/Notes/sail-onelake/#what-to-verify');
  assert.equal(await staticPage.locator('#what-to-verify').count(), 1);
  await staticContext.close();
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.searchStatuses = [];
      new MutationObserver(() => {
        const text = document.querySelector('#lattice-status')?.textContent;
        if (text !== undefined && text !== window.searchStatuses.at(-1)) window.searchStatuses.push(text);
      }).observe(document, { subtree: true, childList: true, characterData: true });
    });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const response = await page.goto(origin);
    assert.equal(response.status(), 200);
    await page.waitForFunction(() => !document.querySelector('#lattice-controls').disabled);
    assert.equal(await page.evaluate(() => window.searchStatuses.includes('Loading wiki…')), false, 'initial HTML must not flash a loading placeholder');
    const loadingCount = await page.evaluate(() => window.searchStatuses.filter(text => text === 'Loading search…').length);
    assert.equal(await page.locator('article h1').textContent(), 'Code fieldnotes');
    assert.match(await page.locator('.reader-metadata').innerText(), /Updated 2026-11-01/);
    assert.equal(await page.locator('#lattice-current-collection').textContent(), 'Pages');
    if (width === 390) await page.getByRole('button', { name: /Browse.*search/i }).click();
    assert.equal(await page.locator('#lattice-page-navigation summary').filter({ hasText: /^Pages/ }).count(), 1);
    assert.equal(await page.locator('#lattice-page-navigation').getByText('_root', { exact: false }).count(), 0);
    await page.getByRole('searchbox').fill('Saved investigations');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.locator('#lattice-results a').waitFor();
    assert.equal(await page.locator('#lattice-results a').count(), 1);
    assert.ok((await page.locator('#lattice-results a').getAttribute('href')).startsWith('/Notes/supabase-notebooks/'));
    // Reuse the loaded worker rather than reinitializing it for every query.
    for (const term of ['no-such-fieldnotes-result', 'Saved investigations', 'Saved investigations']) {
      await page.getByRole('searchbox').fill(term);
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('#lattice-results').getAttribute('aria-busy') !== 'true');
      assert.equal(await page.locator('#lattice-results a').count(), term === 'no-such-fieldnotes-result' ? 0 : 1);
      if (term === 'Saved investigations') assert.ok((await page.locator('#lattice-results a').getAttribute('href')).startsWith('/Notes/supabase-notebooks/'));
    }
    await page.locator('#lattice-filters').evaluate(element => element.open = true);
    await page.evaluate(() => window.readerContinuity = 'kept');
    await page.locator('#lattice-results a').click();
    await page.waitForURL('**/Notes/supabase-notebooks/**');
    await page.waitForFunction(() => !document.querySelector('#lattice-controls').disabled);
    assert.equal(await page.locator('article h1').textContent(), 'Supabase Explorer notebooks');
    assert.equal(await page.evaluate(() => window.readerContinuity), 'kept', 'sidebar navigation must preserve the reader shell');
    assert.equal(await page.locator('#lattice-filters').getAttribute('open'), '', 'tag disclosure stays open');
    assert.equal(await page.locator('#lattice-query').inputValue(), 'Saved investigations');
    const contextual = page.locator('.backlinks li').filter({ has: page.getByRole('link', { name: 'Sail and OneLake', exact: true }) });
    assert.match(await contextual.innerText(), /save the investigation that uses the connection/);
    assert.equal(await contextual.evaluate(element => element.scrollWidth <= element.clientWidth), true);
    await contextual.scrollIntoViewIfNeeded();
    if (process.env.DEMO_SCREENSHOTS) await page.screenshot({ path: `${process.env.DEMO_SCREENSHOTS}-backlinks-${width}.png` });
    const contextualURL = page.url();
    await contextual.locator('a').focus(); await contextual.locator('a').press('Enter');
    await page.waitForURL('**/Notes/sail-onelake/#what-to-verify');
    assert.equal(await page.evaluate(() => window.readerContinuity), 'kept');
    await page.goBack(); await page.waitForURL(contextualURL);
    await page.waitForFunction(() => document.querySelector('article h1')?.textContent === 'Supabase Explorer notebooks');
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
    assert.equal(await page.evaluate(() => window.searchStatuses.filter(text => text === 'Loading search…').length), loadingCount, 'note navigation must not restart loading feedback');
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
  for (const width of [1280, 390]) {
    const graphPage = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await graphPage.goto(origin + '/Notes/sail-onelake/');
    await checkRelated(graphPage);
    if (process.env.DEMO_SCREENSHOTS) await graphPage.locator('.related-notes').screenshot({ path: `${process.env.DEMO_SCREENSHOTS}-related-${width}.png` });
    await graphPage.locator('.local-graph summary').click();
    await graphPage.locator('.graph-canvas a').first().waitFor();
    assert.ok(await graphPage.locator('.graph-canvas a').count() > 1);
    assert.ok(await graphPage.locator('.graph-links a').count() > 0);
    assert.equal(await graphPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    if (process.env.DEMO_SCREENSHOTS) await graphPage.locator('.local-graph').screenshot({ path: `${process.env.DEMO_SCREENSHOTS}-graph-${width}.png` });
    const link = graphPage.locator('.graph-canvas a').nth(1);
    const destination = await link.getAttribute('href');
    await link.focus(); await link.press('Enter'); await graphPage.waitForURL(destination);
    await graphPage.locator('.local-graph summary').click();
    await graphPage.locator('.graph-canvas a[aria-current="page"]').waitFor();
    assert.equal(new URL(await graphPage.locator('.graph-canvas a[aria-current="page"]').getAttribute('href')).pathname, new URL(destination).pathname);
    await graphPage.goBack(); await graphPage.waitForURL(origin + '/Notes/sail-onelake/');
    await checkRelated(graphPage);
    await graphPage.goForward(); await graphPage.waitForURL(destination);
    await graphPage.waitForFunction(() => !document.querySelector('#lattice-controls').disabled);
    const graphDetails = graphPage.locator('.local-graph');
    if (await graphDetails.getAttribute('open') === null) await graphDetails.locator('summary').click();
    await graphPage.locator('.graph-canvas a[aria-current="page"]').waitFor();
    assert.equal(new URL(await graphPage.locator('.graph-canvas a[aria-current="page"]').getAttribute('href')).pathname, new URL(destination).pathname);
    await graphPage.goBack(); await graphPage.waitForURL(origin + '/Notes/sail-onelake/');
    await checkRelated(graphPage);
    await graphPage.close();
  }
  const graphPlain = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await graphPlain.goto(origin + '/Notes/sail-onelake/');
  await checkRelated(graphPlain);
  const recommendation = graphPlain.locator('.related-notes a').first();
  await recommendation.focus(); await recommendation.press('Enter');
  await graphPlain.waitForURL(origin + '/Notes/supabase-notebooks/');
  assert.equal(await graphPlain.locator('.related-notes').count(), 0);
  await graphPlain.goBack(); await checkRelated(graphPlain);
  await graphPlain.locator('.local-graph summary').click();
  assert.ok(await graphPlain.locator('.graph-links a').count() > 0);
  assert.equal(await graphPlain.locator('.graph-canvas').count(), 0);
  await graphPlain.close();
  console.log('Local graph: desktop/mobile, canonical keyboard navigation/history and no-JS links passed');
} finally { await browser.close(); }
