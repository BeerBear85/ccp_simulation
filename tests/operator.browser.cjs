/* Browser acceptance checks. Uses an existing Playwright installation; no project dependency.
 * Serve the repository on port 8765 (or set CCP_BASE_URL). Optional CCP_BROWSER_VENDOR
 * points at local copies of the app's existing CDN scripts/fonts for restricted networks.
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.CCP_BASE_URL || 'http://127.0.0.1:8765';
const vendor = process.env.CCP_BROWSER_VENDOR;
const screenshots = path.resolve(__dirname, '../docs/screenshots');

(async () => {
  const browser = await chromium.launch({ channel: process.env.CCP_BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined), headless: true, args: ['--enable-unsafe-swiftshader'] });
  const errors = [];
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  if (vendor) {
    await context.route('https://cdn.jsdelivr.net/**', route => route.fulfill({ path: path.join(vendor, route.request().url().split('/').pop()), contentType: 'text/javascript' }));
    await context.route('https://fonts.googleapis.com/**', route => route.fulfill({ path: path.join(vendor, 'fonts.css'), contentType: 'text/css' }));
    await context.route('https://fonts.gstatic.com/**', route => route.fulfill({ path: path.join(vendor, route.request().url().split('/').pop()) }));
  }
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const start = async () => {
    await page.goto(base + '/dist/copenhagen_cable_park_sim.html');
    await page.waitForFunction(() => window.__ccpDebug);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => __ccpDebug.sim.t > 2.5 && getComputedStyle(document.getElementById('cover')).opacity === '0');
    await page.locator('#btnPlay').click();
    await page.evaluate(() => document.fonts.ready);
  };
  const history = () => page.evaluate(() => {
    const { hist, series, sim } = __ccpDebug;
    return { n: hist.n, head: hist.head, first: hist.t[(hist.head - hist.n + hist.t.length) % hist.t.length],
      tension: series[0].buf[(hist.head - 1 + hist.t.length) % hist.t.length], t: sim.t };
  });
  const checkLayout = async (open) => {
    await page.waitForFunction(expected => document.getElementById('btnPanel').getAttribute('aria-expanded') === String(expected), open);
    const result = await page.evaluate(() => {
      const rect = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
      const panel = document.getElementById('telemetryPanel');
      return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth,
        main: rect(document.querySelector('.operator')), panel: rect(panel), open: !panel.hidden,
        gauges: [...document.querySelectorAll('.gauge')].map(rect),
        controls: [...document.querySelectorAll('.control-bar button, .control-bar select')].filter(el => el.checkVisibility()).map(rect),
        view: rect(document.getElementById('view')), panelScroll: document.querySelector('.panel-scroll').scrollWidth,
        panelClient: document.querySelector('.panel-scroll').clientWidth };
    });
    assert.equal(result.scrollWidth, result.width, 'no document horizontal scrolling');
    assert.equal(result.gauges.length, 2);
    if (open && result.width >= 1100) assert.ok(result.main.right <= result.panel.x + 1, 'panel pushes main');
    for (const g of result.gauges) {
      assert.ok(g.x >= 0 && g.right <= result.main.right && g.bottom <= result.height, 'gauge is fully visible');
      assert.ok(g.width >= 120 && g.width <= 150, 'gauges use the compact half-size layout');
      assert.ok(g.x >= result.view.x && g.right <= result.view.right && g.y >= result.view.y && g.bottom <= result.view.bottom, 'transparent gauges stay inside the camera');
    }
    assert.ok(result.gauges[0].right <= result.gauges[1].x, 'gauges stay side by side');
    for (const b of result.controls) assert.ok(b.right <= result.main.right && b.bottom <= result.view.y, 'controls stay within main and above camera');
    for (let i = 0; i < result.controls.length; i++) for (let j = i + 1; j < result.controls.length; j++) {
      const a = result.controls[i], b = result.controls[j];
      assert.ok(a.right <= b.x + 1 || b.right <= a.x + 1 || a.bottom <= b.y + 1 || b.bottom <= a.y + 1, 'controls do not overlap');
    }
    if (open) assert.ok(result.panelScroll <= result.panelClient + 1, 'panel has no horizontal scrolling');
    return result;
  };
  try {
    await start();
    assert.equal(await page.locator('.gauge svg').count(), 2);
    const initial = await history();
    await page.locator('#btnPanel').click();
    await checkLayout(true);
    assert.deepEqual(await history(), initial, 'opening panel preserves history');
    await page.locator('#tab-log').click();
    await page.waitForFunction(() => document.querySelectorAll('#tblDiag tr').length > 30);
    await checkLayout(true);
    await page.locator('#tab-settings').click();
    await checkLayout(true);
    await page.locator('#rngSpeed').fill('32');
    assert.ok(Math.abs(await page.evaluate(() => __ccpDebug.sim.cableSpeed) - 32 / 3.6) < 1e-9);
    await page.locator('#rngSpeed').focus();
    await page.keyboard.press('l');
    assert.equal(await page.locator('#btnPanel').getAttribute('aria-expanded'), 'true', 'typing in input does not toggle');
    await page.locator('#rngSpeed').fill('30');
    await page.locator('#tab-guide').click();
    await checkLayout(true);
    await page.locator('#tab-ride').click();
    const grip = page.locator('#panelResize');
    const box = await grip.boundingBox();
    await page.mouse.move(box.x + box.width / 2, 250);
    await page.mouse.down();
    await page.mouse.move(box.x - 96, 250, { steps: 8 });
    await page.mouse.up();
    const resized = await page.locator('#telemetryPanel').evaluate(el => el.getBoundingClientRect().width);
    assert.ok(resized > 480 && resized <= 540, 'drag changes width within bounds');
    await checkLayout(true);
    await grip.focus();
    await page.keyboard.press('End');
    assert.equal(Math.round(await page.locator('#telemetryPanel').evaluate(el => el.getBoundingClientRect().width)), 540);
    await checkLayout(true);
    await page.keyboard.press('Home');
    assert.equal(Math.round(await page.locator('#telemetryPanel').evaluate(el => el.getBoundingClientRect().width)), 320);
    await checkLayout(true);
    for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('l');
    assert.equal(await page.locator('#btnPanel').getAttribute('aria-expanded'), 'false');
    await checkLayout(false);
    assert.deepEqual(await history(), initial, 'tab and resize changes preserve history');
    await page.locator('#btnPlay').click();
    await page.waitForFunction(n => __ccpDebug.hist.n > n + 12, initial.n);
    await page.locator('#btnPlay').click();
    const collected = await history();
    assert.equal(collected.first, initial.first, 'closed panel keeps collecting without discarding earlier samples');
    await page.keyboard.press('l');
    assert.deepEqual(await history(), collected);
    await page.reload();
    await page.waitForFunction(() => window.__ccpDebug);
    assert.equal(await page.locator('#btnPanel').getAttribute('aria-expanded'), 'true', 'open state survives reload');
    assert.equal(Math.round(await page.locator('#telemetryPanel').evaluate(el => el.getBoundingClientRect().width)), 400, 'width survives reload');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => getComputedStyle(document.getElementById('cover')).opacity === '0');
    await page.locator('#btnPlay').click();
    await page.locator('#btnReset').click();
    assert.equal((await history()).n, 0);
    await page.locator('#btnStep').click();
    assert.ok(Math.abs((await history()).t - 1 / 240) < 1e-9);
    await page.locator('#btnStep24').click();
    assert.ok(Math.abs((await history()).t - 25 / 240) < 1e-9);
    for (const [id, mode] of [['camOrbit', 'orbit'], ['camFollow', 'follow'], ['camTop', 'top']]) {
      await page.locator('#' + id).click();
      assert.equal(await page.locator('#' + id).getAttribute('aria-pressed'), 'true', mode + ' camera still works');
    }
    await page.locator('#camFollow').click();
    await page.locator('#btnInfo').click();
    assert.equal(await page.locator('#hud').isVisible(), false);
    await page.locator('#btnInfo').click();
    for (const id of ['edgeL', 'edgeR', 'legDn', 'legUp', 'trSpinL', 'trSpinR', 'trNose', 'trTail']) {
      const b = await page.locator('#' + id).boundingBox();
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.down();
      assert.match(await page.locator('#' + id).getAttribute('class'), /held/);
      await page.mouse.up();
      assert.doesNotMatch(await page.locator('#' + id).getAttribute('class'), /held/);
    }
    for (const [force, tone] of [[799, null], [800, 'yellow'], [1000, 'yellow'], [1001, 'red'], [2400, 'red']]) {
      await page.evaluate(f => { __ccpDebug.sim.line.F = f; __ccpDebug.sim.out.V = 75 / 3.6; }, force);
      await page.waitForFunction(({ value, tone }) => {
        const el = document.querySelector('#tensionGauge .gauge-value');
        return el.textContent === value && el.getAttribute('class') === 'gauge-value' + (tone ? ' ' + tone : '');
      }, { value: (force / 1000).toFixed(2), tone });
      const classes = await page.locator('#tensionGauge .gauge-value').getAttribute('class');
      assert.equal(classes, 'gauge-value' + (tone ? ' ' + tone : ''));
      assert.equal(await page.locator('#speedGauge .gauge-value').textContent(), '75.0');
      assert.equal(await page.evaluate(() => __ccpDebug.speedGauge.needleValue), 60);
    }
    assert.match(await page.locator('#tensionGauge .gauge-status').textContent(), /Above scale/);
    assert.equal(await page.evaluate(() => __ccpDebug.tensionGauge.needleValue), 1.8);
    await page.locator('#btnReset').click();
    await page.locator('#btnPlay').click();
    await page.waitForFunction(() => __ccpDebug.sim.t > 2.5);
    await page.locator('#btnPlay').click();
    fs.mkdirSync(screenshots, { recursive: true });
    for (const [width, height] of [[1280, 720], [1920, 1080]]) {
      await page.setViewportSize({ width, height });
      for (const open of [false, true]) {
        if ((await page.locator('#btnPanel').getAttribute('aria-expanded') === 'true') !== open) await page.locator('#btnPanel').click();
        await checkLayout(open);
        await page.screenshot({ path: path.join(screenshots, `operator-${width}x${height}-${open ? 'open' : 'closed'}.png`) });
      }
    }
    await page.setViewportSize({ width: 1024, height: 768 });
    const overlay = await page.locator('#telemetryPanel').evaluate(el => getComputedStyle(el).position);
    assert.equal(overlay, 'fixed', 'narrow screens use overlay');
    await page.locator('#btnPanelClose').click();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await page.waitForFunction(() => window.__ccpDebug);
    assert.equal(await page.locator('#btnPanel').getAttribute('aria-expanded'), 'false', 'closed state survives reload');
    await page.locator('#btnFlyby').click();
    await page.waitForFunction(() => window.__ccpDebug && document.getElementById('view').classList.contains('demo') && getComputedStyle(document.getElementById('cover')).opacity === '0');
    assert.equal(await page.locator('.rider-controls').isVisible(), false, 'demo retains its existing hidden manual controls');
    assert.equal(await page.locator('#btnDemoExit').isVisible(), true);
    await page.locator('#btnDemoExit').click();
    assert.equal(await page.locator('.rider-controls').isVisible(), true);
    await page.locator('#btnPlay').click();
    await page.locator('#btnReset').click();
    // Exercise the existing fall/restart action without waiting for a random collision.
    await page.evaluate(() => { __ccpDebug.sim.out.fall = 'Browser acceptance check'; });
    await page.waitForFunction(() => !document.getElementById('fallBox').hidden);
    await page.locator('#btnRestart').click();
    assert.equal(await page.locator('#fallBox').isVisible(), false);
    assert.equal(await page.evaluate(() => __ccpDebug.sim.out.fall), '');
    // Storage denial must not prevent startup or toggling.
    await page.addInitScript(() => { Storage.prototype.getItem = Storage.prototype.setItem = () => { throw new Error('Storage disabled'); }; });
    await start();
    await page.locator('#btnPanel').click();
    await checkLayout(true);
    assert.deepEqual(errors, [], 'no browser JavaScript errors');
    console.log('PASS: layout, resize, persistence, storage denial, keyboard, history, controls, gauge zones and overflow. Four screenshots saved to docs/screenshots.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
