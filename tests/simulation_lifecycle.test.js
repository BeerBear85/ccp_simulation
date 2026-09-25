const test = require('node:test');
const assert = require('node:assert/strict');
const { createSim, PHYS, LAYOUT } = require('../src/physics.js');

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

test('each simulation owns its physics, layout and live settings', () => {
  const physics = { DT: 1 / 480, DOCK_C: [50, 50] };
  const layout = { wheels: [[0, 0], [300, 0], [300, 100], [0, 100]], obstacles: [] };
  const sim = createSim({ physics, layout, wind: 0, cableKmh: 20, releaseN: 900, obstaclesOn: false, footShift: 0.1, startMode: 'jump' });
  const fresh = createSim();
  physics.DT = 1;
  physics.DOCK_C[0] = -100;
  layout.wheels[0][0] = -100;
  sim.step(); fresh.step();
  assert.equal(sim.t, 1 / 480);
  assert.equal(fresh.t, PHYS.DT);
  assert.deepEqual(fresh.path.wheels, LAYOUT.wheels);
  assert.equal(sim.obs.length, 0);
  sim.reset();
  assert.ok(sim.rider.x > 40, 'reset uses the owned dock configuration');
  assert.equal(sim.startMode, 'jump');
  assert.equal(sim.wind, 0);
  assert.equal(sim.cableSpeed, 20 / 3.6);
  assert.equal(sim.releaseN, 900);
  assert.equal(sim.obstaclesOn, false);
  assert.equal(sim.footShift, 0.1);
});

test('scenario reset initializes dependent state and replays without internal mutations', () => {
  const opts = { wind: 0, obstaclesOn: false, layout: { wheels: [[0, 0], [3000, 0], [3000, 400], [0, 400]], obstacles: [] } };
  const initial = { carrierS: 200, rider: { x: 184, y: 0, z: -0.05, vx: 8.33, psi: 0, phi: 0.2, theta: 0.1 } };
  const sim = createSim({ ...opts, initial });
  const other = createSim(opts);
  other.reset(initial);
  assert.equal(sim.t, 0, 'initialization must not secretly advance physics');
  assert.equal(sim.carrier.s, 200);
  assert.equal(sim.out.V, 8.33);
  assert.deepEqual(sim.towPt, sim.tow);
  assert.deepEqual(sim.line, other.line);
  assert.deepEqual(sim.out, other.out);
  const start = structuredClone(sim.rider);
  initial.rider.x = -100;
  for (let i = 0; i < 480; i++) { sim.step(); other.step(); }
  const outcome = structuredClone(sim.out);
  assert.deepEqual(sim.out, other.out);
  sim.reset();
  assert.deepEqual(sim.rider, start);
  for (let i = 0; i < 480; i++) sim.step();
  assert.deepEqual(sim.out, outcome);
  sim.setStartMode('slide'); sim.reset();
  assert.equal(sim.carrier.s, 0, 'selecting a dock start clears the custom scenario');
  assert.equal(sim.out.V, 0);
});

for (const startMode of ['slide', 'jump']) {
  test(`${startMode} reset clears a completed fall and preserves the selected settings`, () => {
    const settings = { startMode, wind: 0, obstaclesOn: false, releaseN: 500, cableKmh: 30 };
    const sim = createSim(settings);
    for (let i = 0; i < 2400 && sim.line.attached; i++) sim.step();
    assert.equal(sim.line.attached, false, 'exercise a real fall before resetting');
    assert.ok(sim.out.fall);
    sim.reset();
    const fresh = createSim(settings);
    for (const key of ['rider', 'carrier', 'tow', 'towPt', 'cable', 'line', 'out', 'energy', 'trail', 'grab']) {
      assert.deepEqual(sim[key], fresh[key], key);
    }
    for (let i = 0; i < 240; i++) { sim.step(); fresh.step(); }
    assert.deepEqual(sim.out, fresh.out);
  });
}
