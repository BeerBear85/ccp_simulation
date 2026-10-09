// Drone flyby camera: the drone must stay out of the grass/trees beside the course and keep the rider in view.
// Run: node --test tests/drone_path.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { environment: E } = require('../src/surroundings.js');
const { createSim, createAutopilot, DEMO_SETTINGS, LAYOUT } = require('../src/physics.js');
const { createDrone, createDroneGuard } = require('../src/drone.js');

function fly(opt, laps = 2) {
  const s = createSim({ ...DEMO_SETTINGS, wind: 4 }), ap = createAutopilot(s);
  const obst = [...s.path.wheels, ...LAYOUT.masts.map(m => [m.x, m.y])];
  const d = createDrone(s, E, obst, opt), judge = createDroneGuard(E);
  d.reset(0);
  const L = s.path.length, o = { lowOverLand: 0, minOverLand: Infinity, frames: 0, blocked: 0, longestBlock: 0, worst: null, maxZ: 0 };
  let run = 0, next = 0;
  while (s.carrier.s < (laps + 1) * L && s.t < 400) {
    ap.update(); s.step();
    if (s.t < next) continue; next += 1 / 60;
    const { p } = d.update(s.t, s.rider, ap.focus);
    if (s.t < 9) continue;   // scripted intro sweep
    o.frames++; o.maxZ = Math.max(o.maxZ, p[2]);
    if (judge.land(p[0], p[1])) { o.minOverLand = Math.min(o.minOverLand, p[2]);
      if (p[2] < 10) { o.lowOverLand++; if (!o.worst || p[2] < o.worst[2]) o.worst = [...p, s.t, d.mode]; } }
    const b = judge.blocked(p, s.rider.x, s.rider.y, Math.max(s.rider.z, 0) + 0.9);
    if (b) { o.blocked++; run += 1 / 60; o.longestBlock = Math.max(o.longestBlock, run); } else run = 0;
  }
  return o;
}

test('drone never flies into the grass or trees beside the course, and keeps the rider in view', () => {
  const o = fly({});
  console.log('guarded', JSON.stringify(o));
  assert.equal(o.lowOverLand, 0, `drone below 10 m over land: ${o.worst}`);
  assert.ok(o.blocked / o.frames < 0.02, `view blocked by land ${(100 * o.blocked / o.frames).toFixed(1)} % of the time`);
  assert.ok(o.longestBlock < 1.0, `longest blocked view ${o.longestBlock.toFixed(2)} s`);
  assert.ok(o.maxZ <= 45.01, `ceiling ${o.maxZ}`);
});
