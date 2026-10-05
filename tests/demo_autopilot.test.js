// Demo autopilot ("drone flyby"): the rider must get round the course on his own, lap after lap, and land his tricks.
// Run: node --test tests/demo_autopilot.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { createSim, createAutopilot, DEMO_SETTINGS, FREE_RIDE_CORNERS, FREE_RIDE_GAINS } = require('../src/physics.js');

// Laps 2.. (the start is left out), as in docs/corner_minmax.md: largest line force, largest speed in the corner phases
// (line / wide / turn-in, on the water), largest speed on the run-up to the OA rail, offset outside the cable at each sheave
function ride(s, ap, laps) {
  const L = s.path.length, arcs = s.path.pieces.filter(g => g.kind === 'arc');
  const o = { peak: 0, vCorner: 0, vOA: 0, out: {}, jerkTA: 0 }; let prev = 0; const Fb = [];
  const arcTA = arcs.find(g => g.len / g.R > 1.6);
  while (s.carrier.s < (laps + 1) * L && s.t < 400) {
    ap.update(); s.step();
    assert.equal(s.out.fall, '', `no fall (t ${s.t.toFixed(1)} s, phase ${ap.phase})`);
    const cs = s.carrier.s % L;
    if (s.carrier.s >= L) {
      const V = Math.hypot(s.rider.vx, s.rider.vy) * 3.6;
      o.peak = Math.max(o.peak, s.line.F);
      Fb.push(s.line.F); if (Fb.length > 24) Fb.shift();   // rise of the line force over 0.1 s near the TA sheave (the 'jerk')
      let d = cs - arcTA.s0; if (d > L / 2) d -= L; if (d < -L / 2) d += L;
      if (Math.abs(d / s.cableSpeed) < 6) o.jerkTA = Math.max(o.jerkTA, (s.line.F - Fb[0]) / (23 / 240));
      if (['line', 'wide', 'turn-in'].includes(ap.phase) && !s.jump) o.vCorner = Math.max(o.vCorner, V);
      if (ap.focus && /OA/.test(ap.focus.p.name) && ap.phase === 'approach') o.vOA = Math.max(o.vOA, V);
      for (const g of arcs) if (prev < g.s0 && cs >= g.s0) {
        const leg = s.path.pieces[s.path.pieces.indexOf(g) - 1], R = s.rider;
        o.out[s.path.pieces.indexOf(g)] = -((R.x - leg.a[0]) * -leg.t[1] + (R.y - leg.a[1]) * leg.t[0]);   // + = right of the cable
      }
    }
    prev = cs;
  }
  return o;
}
const TD_ARC = 5;   // arc piece index of the TD sheave

for (const wind of [0, 4, 8]) {
  test(`demo autopilot rides three laps without a fall (wind ${wind} m/s)`, () => {
    const s = createSim({ ...DEMO_SETTINGS, wind });
    const ap = createAutopilot(s);
    const tricks = new Set(), rails = new Set();
    while (s.carrier.s < 3 * s.path.length && s.t < 240) {
      ap.update(); s.step();
      assert.equal(s.out.fall, '', `no fall (t ${s.t.toFixed(1)} s, focus ${ap.focus ? ap.focus.p.name : '–'})`);
      if (s.out.lastTrick) tricks.add(s.out.lastTrick.name);
      if (s.out.rail) rails.add(s.out.rail.name);
    }
    assert.ok(s.carrier.s >= 3 * s.path.length, 'three laps completed');
    assert.ok([...tricks].some(n => /Tail grab/.test(n)), 'tail grab off the OC ramp');
    assert.ok([...tricks].some(n => /^360/.test(n)), '360 off the OI kicker');
    assert.ok(rails.has('OA rising rail'), 'slide on the OA rail');
  });
}

// Corner technique (docs/corner_minmax.md): max 38 km/h round the corners and on the run-up from TA to OA
for (const wind of [0, 10]) {
  test(`demo rider: ≤ 38 km/h round the corners and to OA, 8 m out at TD, line force ≤ 1 kN, smooth at TA (wind ${wind} m/s)`, () => {
    const s = createSim({ ...DEMO_SETTINGS, wind }), o = ride(s, createAutopilot(s), 2);
    assert.ok(o.vCorner < 38, `corner speed ${o.vCorner.toFixed(2)} km/h`);
    assert.ok(o.vOA < 38, `OA run-up ${o.vOA.toFixed(2)} km/h`);
    assert.ok(o.out[TD_ARC] >= 7.95, `TD offset ${o.out[TD_ARC].toFixed(1)} m`);
    assert.ok(o.peak < 1000, `peak ${o.peak.toFixed(0)} N`);
    assert.ok(o.jerkTA < 5000, `line force rise at TA ${o.jerkTA.toFixed(0)} N/s`);
  });
  test(`free riding: ≤ 38 km/h, 8 m right of the cable at TD, line force below 0.75 kN (wind ${wind} m/s)`, () => {
    const s = createSim({ ...DEMO_SETTINGS, wind });
    const o = ride(s, createAutopilot(s, { plan: [], corners: FREE_RIDE_CORNERS, gains: FREE_RIDE_GAINS }), 2);
    assert.ok(o.vCorner < 38, `speed ${o.vCorner.toFixed(2)} km/h`);
    assert.ok(o.out[TD_ARC] >= 7.95, `TD offset ${o.out[TD_ARC].toFixed(1)} m`);
    assert.ok(o.peak < 750, `peak ${o.peak.toFixed(0)} N`);
  });
}

test('riding the line through the corners (no set-ups) gives a far larger peak and speed', () => {
  const none = Object.fromEntries(['TA', 'TB', 'TC', 'TD', 'TE', 'TF'].map(id => [id, { lead: 0, carve: 0, carveFor: 0 }]));
  const s = createSim(DEMO_SETTINGS), o = ride(s, createAutopilot(s, { plan: [], corners: none, gains: FREE_RIDE_GAINS }), 1);
  assert.ok(o.peak > 1500, `line rider peak ${o.peak.toFixed(0)} N`);
  assert.ok(o.vCorner > 40, `line rider speed ${o.vCorner.toFixed(1)} km/h`);
});
