const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createSim } = require('../src/physics.js');

test('both built artifacts contain current source and replay its behavior', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/physics.js'), 'utf8').replace(/\r\n/g, '\n');
  for (const name of ['copenhagen_cable_park_sim.html', 'copenhagen_cable_park_sim.frag.html']) {
    const html = fs.readFileSync(path.join(__dirname, '../dist', name), 'utf8').replace(/\r\n/g, '\n');
    assert.ok(html.includes(source), `${name} is stale: run python build.py`);
    const area = fs.readFileSync(path.join(__dirname, '../src/start_area.js'), 'utf8').replace(/\r\n/g, '\n');
    assert.ok(html.includes(area), `${name} has stale start-area geometry: run python build.py`);
    assert.ok(!html.includes('/*__START_AREA__*/'), `${name} has an unresolved model placeholder`);
    const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
    const embedded = scripts.find(([, code]) => code.includes('function createSim('));
    assert.ok(embedded, `${name} contains the physics script`);
    const context = { module: { exports: {} }, structuredClone };
    vm.runInNewContext(embedded[1], context, { filename: name });
    const built = context.module.exports.createSim({ wind: 0 });
    const direct = createSim({ wind: 0 });
    for (let i = 0; i < 240; i++) { built.step(); direct.step(); }
    assert.equal(JSON.stringify(built.out), JSON.stringify(direct.out), name);
    // Also compile the UI script: the headless physics suite cannot catch its syntax errors.
    for (const [, code] of scripts) new vm.Script(code);
  }
});
