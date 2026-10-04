const test = require('node:test');
const assert = require('node:assert/strict');
const { environment: E } = require('../src/surroundings.js');
const { createSim } = require('../src/physics.js');

function inside(p, polygon) {
  let c = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}

test('source measurement sets the environment scale without moving the riding layout', () => {
  const a = E.project([167, 544]), b = E.project([318, 365]);
  assert.ok(Math.abs(Math.hypot(a[0] - b[0], a[1] - b[1]) - 256.97) < 1e-8);
  const sim = createSim();
  assert.deepEqual(sim.path.wheels, [[5.4,4.2],[77,-51.5],[106.6,-45.5],[173.4,84.6],[157.5,118.2],[116.9,118.4]]);
  for (const p of sim.path.wheels.concat(sim.obs.map(o => [o.x, o.y]))) {
    assert.ok(inside(p, E.water), `Riding feature must lie over water: ${p}`);
    assert.ok(!inside(p, E.westLand) && !inside(p, E.eastLand), `Land must not cover riding feature: ${p}`);
  }
});

test('water continues beyond the front jetties and behind the dam', () => {
  for (const pixel of [[246,690],[285,785],[360,960],[440,1220],[407,406]]) {
    const p = E.project(pixel);
    assert.ok(inside(p, E.water), `Channel/basin connectivity lost at ${pixel}`);
    assert.ok(!inside(p, E.westLand) && !inside(p, E.eastLand));
  }
});

test('both approaches to the dam passage lie in water, outside the land masses', () => {
  const D = E.dam, normal = [(D.a[1]-D.b[1])/D.length, (D.b[0]-D.a[0])/D.length];
  for (const distance of [-25, 0, 25]) {
    const p = D.opening.map((v,i) => v + distance * normal[i]);
    assert.ok(inside(p, E.water));
    assert.ok(!inside(p, E.westLand) && !inside(p, E.eastLand));
  }
});
