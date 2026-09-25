const test = require('node:test');
const assert = require('node:assert/strict');
const { createSim } = require('../src/physics.js');

test('reset immediately restores fresh diagnostics and neutral controls', () => {
  const sim = createSim();
  sim.setWind(0);
  for (let i = 0; i < 1800; i++) sim.step();
  assert.ok(sim.out.V > 1, 'the run must change the displayed speed');
  sim.spinIn = 1;
  sim.grabIn = 1;
  sim.leanCmdIn = 0.3;
  sim.reset();
  const fresh = createSim();
  fresh.setWind(0);
  fresh.reset();
  assert.equal(sim.t, 0);
  assert.equal(sim.out.V, 0, 'paused reset must not display the old speed');
  assert.deepEqual(sim.out, fresh.out);
  assert.equal(sim.spinIn, 0);
  assert.equal(sim.grabIn, 0);
  assert.equal(sim.leanCmdIn, 0);
  for (let i = 0; i < 240; i++) { sim.step(); fresh.step(); }
  assert.deepEqual(sim.rider, fresh.rider);
  assert.deepEqual(sim.out, fresh.out);
});
