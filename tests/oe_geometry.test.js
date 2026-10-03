const test = require('node:test');
const assert = require('node:assert/strict');
const { createSim, surfaceAt, profileAt } = require('../src/physics.js');

const close = (a, b, message) => assert.ok(Math.abs(a - b) < 1e-9, `${message}: ${a} != ${b}`);
const parts = () => createSim().obs.filter(o => o.id === 'OE');
const local = (parent, child) => [(child.x - parent.x) * parent.ax + (child.y - parent.y) * parent.ay,
  -(child.x - parent.x) * parent.ay + (child.y - parent.y) * parent.ax];

test('OE has three joined assemblies with a steeper ascent and a long shallow descent', () => {
  const [roof, bank, rail] = parts();
  assert.equal(parts().length, 3);
  const peak = roof.prof[1];
  assert.ok(profileAt(roof.prof, peak[0] - 1)[1] > Math.abs(profileAt(roof.prof, peak[0] + 1)[1]));
  close(surfaceAt(roof, peak[0], 0, 0, 0)[0], roof.H, 'crest height');
  assert.ok(surfaceAt(roof, peak[0], roof.W / 4, 0, 0)[0] < roof.H, 'rounded cap');
  const [u, v] = local(roof, bank);
  assert.ok(v > 0, 'bank is on the corrected +v side of the main rail');
  close(v - bank.W / 2, roof.W / 2, 'bank touches rooftop');
  close(u - bank.L / 2, -roof.L / 2, 'upstream entries align');
  const [ru, rv] = local(bank, rail);
  assert.ok(ru - rail.L / 2 > bank.prof[1][0], 'rail entry starts on flat deck');
  assert.ok(ru + rail.L / 2 < bank.L / 2, 'rail ends on deck');
  assert.ok(rv + rail.W / 2 < bank.crossTop[1][0] * bank.W / 2, 'rail fits within mirrored flat deck');
  assert.ok(rv - rail.W / 2 > -bank.W / 2);
});

test('bank has continuous end and side approaches to the same flat deck', () => {
  const [, bank] = parts();
  const deckV = -bank.W / 2 + 0.8;
  close(surfaceAt(bank, -bank.L / 2, deckV, 0, 0)[0], -0.15, 'end toe');
  close(surfaceAt(bank, 0, bank.W / 2, 0, 0)[0], -0.15, 'side toe');
  close(surfaceAt(bank, 0, deckV, 0, 0)[0], bank.H, 'deck height');
  close(surfaceAt(bank, 0, deckV, 0, 0)[2], 0, 'deck is level across');
  assert.ok(surfaceAt(bank, -4, deckV, 0, 0)[1] > 0, 'end approach rises');
  assert.ok(surfaceAt(bank, 0, 0, 0, 0)[2] < 0, 'side approach rises towards the main rail');
  const lip = bank.crossTop[1][0] * bank.W / 2;
  assert.ok(Math.abs(surfaceAt(bank, 0, lip + 1e-6, 0, 0)[0] - bank.H) < 1e-6, 'side meets deck without a step');
  // A board straddling the deck edge rests on its higher side.
  close(surfaceAt(bank, 0, lip + 0.1, 0, 0.2)[0], bank.H, 'board spans deck edge');
});

test('upper round rail starts at deck height and rises to a level run', () => {
  const [, bank, rail] = parts();
  close(surfaceAt(rail, -rail.L / 2, 0, 0, 0)[0], bank.H, 'rail entry');
  assert.ok(surfaceAt(rail, -rail.L / 2 + 0.4, 0, 0, 0)[1] > 0, 'rail ramp');
  close(surfaceAt(rail, 0, 0, 0, 0)[0], rail.H, 'round rail crown');
  close(surfaceAt(rail, 0, 0, 0, 0)[1], 0, 'level rail');
  close(surfaceAt(rail, 0, rail.W / 2, 0, 0)[0], rail.H - rail.W / 2, 'semicircular edge');
  assert.equal(surfaceAt(rail, rail.L / 2 + 0.01, 0, 0, 0), null, 'free exit');
});

test('all OE contact samples stay finite at toes, crests, edges and corners', () => {
  for (const o of parts()) for (let i = 0; i <= 40; i++) for (let j = 0; j <= 20; j++) {
    const u = -o.L / 2 + o.L * i / 40, v = -o.W / 2 + o.W * j / 20;
    for (const [reach, span] of [[0, 0], [0.715, 0.22], [0.22, 0.715]]) {
      const q = surfaceAt(o, u, v, reach, span);
      assert.ok(q && q.every(Number.isFinite), `${o.name} at ${u}, ${v}`);
      assert.ok(q[0] >= (o.baseHeight ?? -0.15) - 1e-9 && q[0] <= o.H + 1e-9);
    }
  }
});
