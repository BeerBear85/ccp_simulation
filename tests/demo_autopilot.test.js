// Demo autopilot ("drone flyby"): the rider must get round the course on his own, lap after lap, and land his tricks.
// Run: node --test tests/demo_autopilot.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { createSim, createAutopilot, DEMO_SETTINGS } = require('../src/physics.js');

for (const wind of [0, 4, 8]) {
  test(`demo autopilot rides three laps without a fall (wind ${wind} m/s)`, () => {
    const s = createSim({ ...DEMO_SETTINGS, wind });
    const ap = createAutopilot(s);
    const tricks = new Set();
    while (s.carrier.s < 3 * s.path.length && s.t < 240) {
      ap.update(); s.step();
      assert.equal(s.out.fall, '', `no fall (t ${s.t.toFixed(1)} s, focus ${ap.focus ? ap.focus.p.name : '–'})`);
      if (s.out.lastTrick) tricks.add(s.out.lastTrick.name);
    }
    assert.ok(s.carrier.s >= 3 * s.path.length, 'three laps completed');
    assert.ok([...tricks].some(n => /Tail grab/.test(n)), 'tail grab off the OC ramp');
    assert.ok([...tricks].some(n => /^360/.test(n)), '360 off the OI kicker');
  });
}

test('demo rider goes wide to the right before the corner at tower A and carves in (less rope force)', () => {
  const s = createSim(DEMO_SETTINGS), ap = createAutopilot(s), L = s.path.length;
  const arcA = s.path.pieces.find(g => g.kind === 'arc' && g.len / g.R > 1.6);          // the 96° corner
  const leg = s.path.pieces[s.path.pieces.indexOf(arcA) - 1];
  let lat = null, peak = 0, prev = 0;
  while (s.carrier.s < L + 40) {
    ap.update(); s.step();
    const cs = s.carrier.s % L;
    if (prev < arcA.s0 && cs >= arcA.s0) { const R = s.rider; lat = (R.x - leg.a[0]) * -leg.t[1] + (R.y - leg.a[1]) * leg.t[0]; }   // + = left
    if (cs > arcA.s0 - 60 || s.carrier.s > L) peak = Math.max(peak, s.line.F);
    prev = cs;
  }
  assert.ok(lat < -7, `rider at least 7 m outside (right) at the sheave (${lat.toFixed(1)} m)`);
  assert.ok(peak < 1500, `peak rope force in the corner below the 1.5 kN standard release limit (${peak.toFixed(0)} N)`);
});
