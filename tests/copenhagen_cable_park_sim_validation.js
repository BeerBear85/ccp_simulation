// Headless validation of src/physics.js against behavioral and numerical invariants.
// "Physics and Simulation of a Cable-Park Wakeboard Rider" (2026-09-24).
// Run: node tests/copenhagen_cable_park_sim_validation.js (no build required).
const assert = require('node:assert/strict');
const { PHYS, createSim } = require('../src/physics.js');
const D = Math.PI / 180;
let checkedSteps = 0;
// Broad numerical/behavioral regression limits, not claims of measured accuracy.
function step(s) {
  s.step(); checkedSteps++;
  for (const [key, value] of Object.entries(s.rider)) assert.ok(Number.isFinite(value), `rider.${key} is finite at ${s.t}s`);
  for (const key of ['V', 'E', 'Eres', 'lift', 'trim']) assert.ok(Number.isFinite(s.out[key]), `${key} is finite at ${s.t}s`);
  assert.ok(Number.isFinite(s.line.F) && s.line.F >= 0, 'line tension is finite and non-negative');
}
function straight(physics = {}) {
  return createSim({ cableKmh: 30, wind: 0, obstaclesOn: false, releaseN: 1e9,
    physics: { LINE_LENGTH: 18.5, CABLE_HEIGHT: 10, ...physics },
    layout: { wheels: [[0, 0], [3000, 0], [3000, 400], [0, 400]], obstacles: [] },
    initial: { carrierS: 200, rider: { x: 184, y: 0, z: -0.05, vx: 8.33, psi: 0 } },
  });
}
// Rider-controller til hele runder: kanter ud 5 s før hjørnet og læner efter linens vinkel (god teknik)
function lapCtl(s, G = 1.5, Lout = 20) { const R = s.rider, hx = Math.cos(R.psi), hy = Math.sin(R.psi), hp = s.line.hp, P_ = s.path;
  const cs = ((s.carrier.s % P_.length) + P_.length) % P_.length; let dA = 1e9; for (const g of P_.pieces) if (g.kind === 'arc') { let d = g.s0 - cs; if (d < 0) d += P_.length; dA = Math.min(dA, d); }
  const dx = s.tow.x - hp[0], dy = s.tow.y - hp[1], lat = Math.atan2(dx * hy - dy * hx, dx * hx + dy * hy);
  s.leanCmdIn = Math.max(-45, Math.min(45, G * lat / D + (dA / s.cableSpeed < 5 ? Lout : 0))) * D; s.legCmdIn = s.legBase; }
// 1) Referencecase 14.2
{ const s = straight(); let n = 0, T = 0, N = 0, lw = 0, tau = 0;
  for (let i = 0; i < 240 * 60; i++) { step(s); if (s.t > 30) { n++; T += s.line.F; N += s.out.lift; lw += s.out.lw; tau += s.out.trim / D; } }
  assert.ok(T / n > 50 && T / n < 500, 'steady tow tension stays in the regression envelope');
  assert.ok(N / n > 400 && N / n < 1000, 'planing supports the rider');
  assert.equal(s.out.fall, '');
  console.log(`1) Ligeud 30 km/t: T ${(T / n).toFixed(0)} N (rapport 142), last ${(N / n).toFixed(0)} N (716), λ ${(lw / n / 0.43).toFixed(2)} (2,02), τ ${(tau / n).toFixed(1)}° (5, foreskrevet)`); }
// 2) Progressiv kant 38° + tidsskridtskonvergens
const convergence = [];
for (const dt of [1 / 240, 1 / 480, 1 / 960]) { const s = straight({ DT: dt }); let V = 0, T = 0;
  for (let i = 0; i < Math.round(40 / dt); i++) { const t = s.t; let c = 0; if (t > 15 && t < 17) c = 38 * 0.5 * (1 - Math.cos(Math.PI * (t - 15) / 2)); else if (t >= 17 && t < 19) c = 38;
    s.leanCmdIn = c * D; step(s); if (t > 15 && t < 25) { V = Math.max(V, s.out.V); T = Math.max(T, s.line.F); } }
  convergence.push({ V, T });
  console.log(`2) Kant 38°, dt=1/${Math.round(1 / dt)}: maks fart ${(V * 3.6).toFixed(1)} km/t (rapport 44*), maks T ${T.toFixed(0)} N (706*)`); }
for (const value of convergence.slice(0, -1)) {
  const fine = convergence.at(-1);
  assert.ok(Math.abs(value.V / fine.V - 1) < 0.02, 'peak speed converges within 2%');
  assert.ok(Math.abs(value.T / fine.T - 1) < 0.05, 'peak tension converges within 5%');
}
// 3) Energiregnskab på CCP-banen
{ const s = createSim({ cableKmh: 30, obstaclesOn: false, releaseN: 1e9, wind: 0 }); let worst = 0;
  for (let i = 0; i < 240 * 110; i++) { lapCtl(s); step(s); const E = s.energy; worst = Math.max(worst, Math.abs(s.out.E - E.E0 - (E.lineWork + E.waterWork + E.airWork + E.muscleWork))); }
  assert.ok(worst < 0.05 * Math.max(5000, Math.abs(s.energy.lineWork)), 'energy residual stays below the 5% regression budget');
  console.log(`3) Energirest (hel runde med god teknik${s.out.fall ? ', FALD: ' + s.out.fall : ''}): maks ${(worst / 1000).toFixed(2)} kJ ud af ${(s.energy.lineWork / 1000).toFixed(0)} kJ linearbejde (armene har optaget ${(s.energy.armWork / 1000).toFixed(1)} kJ)`); }
// 4) Pop fra fladt vand vs. under linelast
for (const popAt of [0, 19.2]) { const s = straight(); const P = PHYS; let best = null;
  for (let i = 0; i < 240 * 28; i++) { const t = s.t; let c = 0;
    if (popAt) { if (t > 15 && t < 17) c = 38 * 0.5 * (1 - Math.cos(Math.PI * (t - 15) / 2)); else if (t >= 17 && t < 19) c = 38; }
    const pt = popAt || 14.3; s.leanCmdIn = c * D; s.legCmdIn = (t > pt - 0.3 && t <= pt) ? P.LEG_MIN + 0.05 : (t > pt && t < pt + 0.4 ? P.LEG_MAX : P.LEG_NOM);
    step(s); if (s.out.lastAir && t > 13 && (!best || s.out.lastAir.hmax > best.hmax)) best = s.out.lastAir; }
  assert.ok(best && best.dur > 0.1 && best.hmax > 0, 'pop produces a measurable jump');
  console.log(`4) Pop ${popAt ? 'under linelast (kant 38°, slip)' : 'fra fladt vand'}: luft ${best ? best.dur.toFixed(2) : 0} s, højde ${best ? best.hmax.toFixed(2) : 0} m`); }
// 5) Følsomhed (rapport 17): én parameter ad gangen ±20 %, effekt på ligeud-T og maks-T i kantmanøvren
function trial(physics = {}) { const s = straight(physics); let n = 0, T = 0, Tm = 0;
  for (let i = 0; i < 240 * 30; i++) { const t = s.t; let c = 0; if (t > 15 && t < 17) c = 38 * 0.5 * (1 - Math.cos(Math.PI * (t - 15) / 2)); else if (t >= 17 && t < 19) c = 38;
    s.leanCmdIn = c * D; step(s); if (t > 10 && t < 15) { n++; T += s.line.F; } if (t > 15) Tm = Math.max(Tm, s.line.F); }
  assert.ok(T / n > 0 && Number.isFinite(Tm), 'sensitivity trial has finite positive tension');
  return [T / n, Tm]; }
{ const base = trial(); console.log(`5) Følsomhed (basis: ligeud ${base[0].toFixed(0)} N, kant-top ${base[1].toFixed(0)} N):`);
  for (const [k, lbl] of [['RESID_AREA', 'residualdrag'], ['NU_WATER', 'viskositet'], ['LINE_K', 'linestivhed'], ['X_LOAD', 'lastpunkt'], ['CARVE_SLIP', 'carve-slip'], ['SIDE_CLA', 'sidekraft'], ['CDA_AIR', 'luftmodstand']]) {
    const r = [0.8, 1.2].map(f => trial({ [k]: PHYS[k] * f }));
    console.log(`   ${lbl.padEnd(13)} −20 %: ${(100 * (r[0][0] / base[0] - 1)).toFixed(1).padStart(5)} % / ${(100 * (r[0][1] / base[1] - 1)).toFixed(1).padStart(5)} %   +20 %: ${(100 * (r[1][0] / base[0] - 1)).toFixed(1).padStart(5)} % / ${(100 * (r[1][1] / base[1] - 1)).toFixed(1).padStart(5)} %`); } }
// 6) Start: spidskraft pr. teknik (impuls–bevægelsesmængde, serie-eftergivelighed, arm/krop-slag)
for (const kmh of [20, 30, 35]) { const out = [];
  for (const mode of ['slide', 'jump']) { const s = createSim({ cableKmh: kmh, obstaclesOn: false, releaseN: 1e9, wind: 0, startMode: mode });
    let pk = 0; for (let i = 0; i < 240 * 8; i++) { s.legCmdIn = s.legBase; step(s); pk = Math.max(pk, s.line.F); }
    assert.ok(pk > 100 && pk < 5000, 'start peak stays within the numerical sanity envelope');
    out.push(`${mode} ${(pk / 1000).toFixed(2)} kN (${(pk / (80 * 9.81)).toFixed(1)} BW)`); }
  console.log(`6) Start ${kmh} km/t: ${out.join(' · ')}`); }
// 7) Slip-grænse: taber kablet over grænsen (fald), holder under den
for (const lim of [500, 3000]) { const s = createSim({ cableKmh: 30, obstaclesOn: false, releaseN: lim, wind: 0, startMode: 'slide' });
  for (let i = 0; i < 240 * 8 && !s.out.fall; i++) { s.legCmdIn = s.legBase; step(s); }
  assert.equal(s.line.attached, lim === 3000, 'low release limit drops the handle; high limit holds');
  if (lim === 500) assert.match(s.out.fall, /^Lost the cable:/);
  console.log(`7) Grænse ${(lim / 1000).toFixed(1)} kN, glidestart 30 km/t: ${s.out.fall || 'holder (ingen fald)'}`); }
// 8) Hjørneteknik ved 1,5 kN: passiv rider vs. rider der kanter ud 5 s før hjørnet og læner efter linens vinkel
function lap(kmh, G, Lout) { const s = createSim({ cableKmh: kmh, obstaclesOn: false, startMode: 'jump', wind: 0 }); let pk = 0; const P_ = s.path;
  for (let i = 0; i < 240 * 120; i++) { if (G) lapCtl(s, G, Lout); else { s.leanCmdIn = 0; s.legCmdIn = s.legBase; } step(s);
    if (s.t > 6) pk = Math.max(pk, s.line.F); if (s.out.fall) return s.out.fall; if (s.carrier.s > P_.length) break; }
  return `hel runde, top ${pk.toFixed(0)} N`; }
for (const kmh of [20, 30, 35]) {
  const passive = lap(kmh, 0, 0), controlled = lap(kmh, 1.5, 20);
  assert.match(passive, /^Lost the cable:/, 'passive rider loses the handle in a corner');
  if (kmh <= 30) assert.match(controlled, /^hel runde/, 'controlled rider completes the lap');
  console.log(`8) ${kmh} km/t, grænse 1,5 kN: passiv → ${passive} · god teknik → ${controlled}`);
}
// 9) Vandoverflade: vind-krusninger (JONSWAP, fetch 250 m) + eget kølvand. Ligeud 30 km/t: boardets lodrette bevægelse og linekraft
for (const U of [0, 4, 8]) { const s = straight(); s.setWind(U); let n = 0, z = 0, z2 = 0, T = 0, T2 = 0, sl = 0;
  for (let i = 0; i < 240 * 40; i++) { step(s); if (s.t > 10) { n++; const h = s.rider.z; z += h; z2 += h * h; T += s.line.F; T2 += s.line.F ** 2; sl = Math.max(sl, s.out.slam || 0); } }
  const zs = Math.sqrt(Math.max(0, z2 / n - (z / n) ** 2)), Ts = Math.sqrt(Math.max(0, T2 / n - (T / n) ** 2));
  assert.ok(Number.isFinite(zs) && Number.isFinite(Ts), 'wave statistics are finite');
  assert.equal(s.out.fall, '', 'straight riding remains stable in wind');
  assert.equal(s.chop.Hs > 0, U > 0, 'wind produces waves; calm water has no wind chop');
  console.log(`9) Vind ${U} m/s (Hs ${(s.chop.Hs * 100).toFixed(1)} cm, Tp ${s.chop.Tp.toFixed(2)} s): board-heave rms ${(zs * 100).toFixed(1)} cm, T ${(T / n).toFixed(0)} ± ${Ts.toFixed(0)} N, maks slamming ${sl.toFixed(0)} N${s.out.fall ? ', FALD: ' + s.out.fall : ''}`); }
{ const s = createSim({ cableKmh: 30, obstaclesOn: false, releaseN: 1e9, wind: 0 }); let cross = 0;
  for (let i = 0; i < 240 * 70 && !s.out.fall; i++) { lapCtl(s); step(s); if (Math.abs(s.out.eta) > 0.01) cross++; }
  console.log(`9) Eget kølvand (vindstille, én runde): boardet står i kølvand > 1 cm i ${(cross / 240).toFixed(1)} s${s.out.fall ? ' · FALD: ' + s.out.fall : ''}`); }
// 10) Tricks på O3-kickeren (30 km/t): pre-wind + linemoment + grab. Spin følger impulsmomentet (I·ω bevares i luften)
function trick(plan) { const s = createSim({ cableKmh: 30, wind: 0 }); const ob = s.obs.find(o => o.name === 'O3 kicker'), g = s.path.pieces.filter(g => g.kind === 'line')[ob.leg];
  const uu = (ob.x - g.a[0]) * g.t[0] + (ob.y - g.a[1]) * g.t[1];
  s.reset({ carrierS: g.s0 + uu - 40 + Math.sqrt(Math.max(1, 19.6 ** 2 - 8.1 ** 2 - ob.off ** 2)),
    rider: { x: ob.x - ob.ax * 40, y: ob.y - ob.ay * 40, z: -0.03, vx: ob.ax * 8.33, vy: ob.ay * 8.33, psi: ob.yaw, theta: 0.1 } });
  const R = s.rider;
  let tA = null, pv = 0;
  for (let i = 0; i < 240 * 12; i++) { const rx = R.x - ob.x, ry = R.y - ob.y, u = rx * ob.ax + ry * ob.ay, v = -rx * ob.ay + ry * ob.ax, vd = (v - pv) * 240; pv = v;
    s.leanCmdIn = (u < ob.L / 2 && R.z < 0.05 && !s.jump ? Math.max(-55, Math.min(55, 40 * v + 25 * vd)) : 0) * D; s.legCmdIn = s.legBase;
    if (s.jump && tA === null) tA = s.t; const c = plan(u - ob.L / 2, tA === null ? null : s.t - tA); s.spinIn = c.spin || 0; s.grabIn = c.grab || 0; step(s);
    if (s.out.fall) return 'FALD: ' + s.out.fall; if (tA !== null && !s.jump && s.out.lastTrick) return `${s.out.lastTrick.name} (luft ${s.out.lastTrick.dur.toFixed(2)} s${s.switchStance ? ', lander switch' : ''})`; }
  return 'ingen landing'; }
for (const [n, p, expected] of [['lige hop', () => ({}), /^Straight air/],
  ['nose grab 0,15–0,65 s', (d, ta) => ({ grab: ta !== null && ta > 0.15 && ta < 0.65 ? 1 : 0 }), /^Nose grab/],
  ['nose grab holdt til landing', (d, ta) => ({ grab: ta !== null && ta > 0.1 ? 1 : 0 }), /^FALD: Landed still holding the nose/],
  ['Q pre-wind 3,5 m før kanten', (d, ta) => ({ spin: d > -3.5 && ta === null ? 1 : 0 }), /^180 left.*lander switch/],
  ['Q pre-wind + i luften + nose grab', (d, ta) => ({ spin: d > -3.5 && (ta === null || ta < 0.8) ? 1 : 0, grab: ta !== null && ta > 0.15 && ta < 0.6 ? 1 : 0 }), /^FALD: Landed sideways/]]) {
  const result = trick(p);
  assert.match(result, expected, n);
  console.log(`10) ${n}: ${result}`);
}
// 11) Rails (rails-rapporten): v_req = (l̂·v_c)/(l̂·t). Lige kabel langs x, lige rail 4 m til siden, vinklet α væk fra kablet.
//     Rideren sættes på railens flade top med farten v; ingen styring (auto-balance). Forventet: under v_req strammes linen og
//     sidetrækket fører rideren af railen; over v_req går linen slap og rideren glider til enden (kun friktion bremser).
function railLab(alphaDeg, vKmh, o = {}) {
  const a = alphaDeg * D, L = 16, H = 0.5, y0 = 4, xs = 300;
  const s = createSim({ cableKmh: 30, wind: 0, releaseN: o.rel ?? PHYS.RELEASE_N,
    physics: { ENTRY_LEN: 0.01 },
    layout: { wheels: [[0, 0], [3000, 0], [3000, -400], [0, -400]],
      obstacles: [{ id: 'T', name: 'lab rail', type: 'rail', x: xs + Math.cos(a) * L / 2, y: y0 + Math.sin(a) * L / 2, dir: [Math.cos(a), Math.sin(a)], L, W: 0.1, H }] },
  });
  const ob = s.obs[0], v = vKmh / 3.6, u0 = -L / 2 + 0.3, rx = ob.x + ob.ax * u0, ry = ob.y + ob.ay * u0;
  const dz = PHYS.CABLE_HEIGHT - (H + 1.0), hor = Math.sqrt((PHYS.LINE_LENGTH - 0.02) ** 2 - dz * dz);
  s.reset({ carrierS: rx + Math.sqrt(hor * hor - ry * ry) - 1,
    rider: { x: rx, y: ry, z: H + 0.001, vx: ob.ax * v, vy: ob.ay * v, psi: ob.yaw, theta: 0.1, leg: 0.85 } });
  const vReq = s.railPreview(ob); let Tmax = 0, Eres = 0;
  for (let i = 0; i < 240 * 6; i++) { s.leanCmdIn = 0; s.legCmdIn = s.legBase; s.spinIn = o.slide && s.out.rail ? 1 : 0; step(s); if (s.out.rail) Tmax = Math.max(Tmax, s.line.F);
    Eres = Math.max(Eres, Math.abs(s.out.Eres)); if (s.out.fall || (!s.out.rail && s.out.lastRail)) break; }
  const lr = s.out.lastRail;
  assert.ok(lr && lr.dur > 0, 'rail run records an exit');
  assert.equal(s.out.fall, '', 'rail scenario stays attached through the exit');
  if (alphaDeg === 0 && vKmh >= 36) assert.equal(lr.result, 'rode to the end', 'parallel rail is completed with sufficient entry speed');
  if (alphaDeg > 0 && vKmh === 30) assert.equal(lr.result, 'pulled off the side', 'insufficient entry speed loses side support');
  return { vReq: vReq * 3.6, lr, fall: s.out.fall, Tmax, Eres }; }
{ const rows = []; for (const al of [0, 20, 30]) { const r0 = railLab(al, 30); const cells = [];
    for (const v of [30, 36, 42, 48]) { const r = railLab(al, v); cells.push(`${v}: ${r.lr ? (r.lr.result === 'rode to the end' ? 'hele railen' : r.lr.result === 'pulled off the side' ? `trukket af efter ${r.lr.dur.toFixed(2)} s` : 'fald') : 'fald: ' + r.fall}`); }
    rows.push(`   α ${String(al).padStart(2)}° (v_req ${r0.vReq.toFixed(1)} km/t; simpel V/cos α = ${(30 / Math.cos(al * D)).toFixed(1)}): ${cells.join(' · ')}`); }
  console.log('11) Rail-lab, kabel 30 km/t, rail 16 m, 4 m fra kablet, indgangsfart (km/t) → udfald:\n' + rows.join('\n')); }
for (const [lbl, o] of [['50-50', {}], ['boardslide', { slide: 1 }]]) { const r = railLab(20, 36, o);
  console.log(`11) α 20°, 36 km/t, ${lbl}: ${r.lr ? r.lr.result + ` efter ${r.lr.dur.toFixed(2)} s, maks sidetræk ${r.lr.maxSide.toFixed(0)} N` : 'fald: ' + r.fall}`); }
console.log('* Rapportens tal stammer fra en illustrativ punktmassemodel, ikke fra målinger.');

console.log(`PASS: all behavioral and numerical checks (${checkedSteps} physics steps).`);
