// Headless validering af copenhagen_cable_park_sim.html mod rapporten
// "Physics and Simulation of a Cable-Park Wakeboard Rider" (2026-09-24).
// Kør:  node tests/copenhagen_cable_park_sim_validation.js   (finder dist/copenhagen_cable_park_sim.html)
const fs = require('fs'), path = require('path'), vm = require('vm');
const cand = [path.join(__dirname, 'copenhagen_cable_park_sim.html'), path.join(__dirname, '..', 'dist', 'copenhagen_cable_park_sim.html')];
const html = fs.readFileSync(cand.find(f => fs.existsSync(f)), 'utf8');
const src = html.slice(html.indexOf('const PHYS = {'), html.indexOf("if (typeof module !== 'undefined'"));
function fresh() { const ctx = {}; vm.createContext(ctx); vm.runInContext(src + '\nthis.M={PHYS,LAYOUT,createSim};', ctx); return ctx.M; }
const D = Math.PI / 180;
function straight(M, L0 = 18.5, H = 10, dt = 1 / 240) {
  M.PHYS.LINE_LENGTH = L0; M.PHYS.CABLE_HEIGHT = H; M.PHYS.DT = dt; M.LAYOUT.wheels = [[0, 0], [3000, 0], [3000, 400], [0, 400]];
  const s = M.createSim({ cableKmh: 30 }); s.obstaclesOn = false; s.releaseN = 1e9; s.setWind(0); s.carrier.s = 200; s.step();
  Object.assign(s.rider, { x: s.carrier.x - 16, y: 0, z: -0.05, vx: 8.33, vy: 0, vz: 0, psi: 0 });
  Object.assign(s.tow, { x: s.carrier.x, y: s.carrier.y, vx: 8.33, vy: 0 }); return s;
}
// Rider-controller til hele runder: kanter ud 5 s før hjørnet og læner efter linens vinkel (god teknik)
function lapCtl(s, G = 1.5, Lout = 20) { const R = s.rider, hx = Math.cos(R.psi), hy = Math.sin(R.psi), hp = s.line.hp, P_ = s.path;
  const cs = ((s.carrier.s % P_.length) + P_.length) % P_.length; let dA = 1e9; for (const g of P_.pieces) if (g.kind === 'arc') { let d = g.s0 - cs; if (d < 0) d += P_.length; dA = Math.min(dA, d); }
  const dx = s.tow.x - hp[0], dy = s.tow.y - hp[1], lat = Math.atan2(dx * hy - dy * hx, dx * hx + dy * hy);
  s.leanCmdIn = Math.max(-45, Math.min(45, G * lat / D + (dA / s.cableSpeed < 5 ? Lout : 0))) * D; s.legCmdIn = s.legBase; }
// 1) Referencecase 14.2
{ const M = fresh(), s = straight(M); let n = 0, T = 0, N = 0, lw = 0, tau = 0;
  for (let i = 0; i < 240 * 60; i++) { s.step(); if (s.t > 30) { n++; T += s.line.F; N += s.out.lift; lw += s.out.lw; tau += s.out.trim / D; } }
  console.log(`1) Ligeud 30 km/t: T ${(T / n).toFixed(0)} N (rapport 142), last ${(N / n).toFixed(0)} N (716), λ ${(lw / n / 0.43).toFixed(2)} (2,02), τ ${(tau / n).toFixed(1)}° (5, foreskrevet)`); }
// 2) Progressiv kant 38° + tidsskridtskonvergens
for (const dt of [1 / 240, 1 / 480, 1 / 960]) { const M = fresh(), s = straight(M, 18.5, 10, dt); let V = 0, T = 0;
  for (let i = 0; i < Math.round(40 / dt); i++) { const t = s.t; let c = 0; if (t > 15 && t < 17) c = 38 * 0.5 * (1 - Math.cos(Math.PI * (t - 15) / 2)); else if (t >= 17 && t < 19) c = 38;
    s.leanCmdIn = c * D; s.step(); if (t > 15 && t < 25) { V = Math.max(V, s.out.V); T = Math.max(T, s.line.F); } }
  console.log(`2) Kant 38°, dt=1/${Math.round(1 / dt)}: maks fart ${(V * 3.6).toFixed(1)} km/t (rapport 44*), maks T ${T.toFixed(0)} N (706*)`); }
// 3) Energiregnskab på CCP-banen
{ const M = fresh(), s = M.createSim({ cableKmh: 30 }); s.obstaclesOn = false; s.releaseN = 1e9; s.setWind(0); let worst = 0;
  for (let i = 0; i < 240 * 110; i++) { lapCtl(s); s.step(); const E = s.energy; worst = Math.max(worst, Math.abs(s.out.E - E.E0 - (E.lineWork + E.waterWork + E.airWork + E.muscleWork))); }
  console.log(`3) Energirest (hel runde med god teknik${s.out.fall ? ', FALD: ' + s.out.fall : ''}): maks ${(worst / 1000).toFixed(2)} kJ ud af ${(s.energy.lineWork / 1000).toFixed(0)} kJ linearbejde (armene har optaget ${(s.energy.armWork / 1000).toFixed(1)} kJ)`); }
// 4) Pop fra fladt vand vs. under linelast
for (const popAt of [0, 19.2]) { const M = fresh(), s = straight(M, 18.5, 10); const P = M.PHYS; let best = null;
  for (let i = 0; i < 240 * 28; i++) { const t = s.t; let c = 0;
    if (popAt) { if (t > 15 && t < 17) c = 38 * 0.5 * (1 - Math.cos(Math.PI * (t - 15) / 2)); else if (t >= 17 && t < 19) c = 38; }
    const pt = popAt || 14.3; s.leanCmdIn = c * D; s.legCmdIn = (t > pt - 0.3 && t <= pt) ? P.LEG_MIN + 0.05 : (t > pt && t < pt + 0.4 ? P.LEG_MAX : P.LEG_NOM);
    s.step(); if (s.out.lastAir && t > 13 && (!best || s.out.lastAir.hmax > best.hmax)) best = s.out.lastAir; }
  console.log(`4) Pop ${popAt ? 'under linelast (kant 38°, slip)' : 'fra fladt vand'}: luft ${best ? best.dur.toFixed(2) : 0} s, højde ${best ? best.hmax.toFixed(2) : 0} m`); }
// 5) Følsomhed (rapport 17): én parameter ad gangen ±20 %, effekt på ligeud-T og maks-T i kantmanøvren
function trial(mod) { const M = fresh(); mod(M.PHYS); const s = straight(M); let n = 0, T = 0, Tm = 0;
  for (let i = 0; i < 240 * 30; i++) { const t = s.t; let c = 0; if (t > 15 && t < 17) c = 38 * 0.5 * (1 - Math.cos(Math.PI * (t - 15) / 2)); else if (t >= 17 && t < 19) c = 38;
    s.leanCmdIn = c * D; s.step(); if (t > 10 && t < 15) { n++; T += s.line.F; } if (t > 15) Tm = Math.max(Tm, s.line.F); }
  return [T / n, Tm]; }
{ const base = trial(() => {}); console.log(`5) Følsomhed (basis: ligeud ${base[0].toFixed(0)} N, kant-top ${base[1].toFixed(0)} N):`);
  for (const [k, lbl] of [['RESID_AREA', 'residualdrag'], ['NU_WATER', 'viskositet'], ['LINE_K', 'linestivhed'], ['X_LOAD', 'lastpunkt'], ['CARVE_SLIP', 'carve-slip'], ['SIDE_CLA', 'sidekraft'], ['CDA_AIR', 'luftmodstand']]) {
    const r = [0.8, 1.2].map(f => trial(P => { P[k] *= f; }));
    console.log(`   ${lbl.padEnd(13)} −20 %: ${(100 * (r[0][0] / base[0] - 1)).toFixed(1).padStart(5)} % / ${(100 * (r[0][1] / base[1] - 1)).toFixed(1).padStart(5)} %   +20 %: ${(100 * (r[1][0] / base[0] - 1)).toFixed(1).padStart(5)} % / ${(100 * (r[1][1] / base[1] - 1)).toFixed(1).padStart(5)} %`); } }
// 6) Start: spidskraft pr. teknik (impuls–bevægelsesmængde, serie-eftergivelighed, arm/krop-slag)
for (const kmh of [20, 30, 35]) { const out = [];
  for (const mode of ['slide', 'jump', 'sit']) { const M = fresh(), s = M.createSim({ cableKmh: kmh }); s.obstaclesOn = false; s.releaseN = 1e9; s.setWind(0); s.setStartMode(mode); s.reset();
    let pk = 0; for (let i = 0; i < 240 * 8; i++) { s.legCmdIn = s.legBase; s.step(); pk = Math.max(pk, s.line.F); }
    out.push(`${mode} ${(pk / 1000).toFixed(2)} kN (${(pk / (80 * 9.81)).toFixed(1)} BW)`); }
  console.log(`6) Start ${kmh} km/t: ${out.join(' · ')}`); }
// 7) Slip-grænse: taber kablet over grænsen (fald), holder under den
for (const lim of [1000, 1500]) { const M = fresh(), s = M.createSim({ cableKmh: 30 }); s.obstaclesOn = false; s.releaseN = lim; s.setWind(0); s.setStartMode('slide'); s.reset();
  for (let i = 0; i < 240 * 8 && !s.out.fall; i++) { s.legCmdIn = s.legBase; s.step(); }
  console.log(`7) Grænse ${(lim / 1000).toFixed(1)} kN, glidestart 30 km/t: ${s.out.fall || 'holder (ingen fald)'}`); }
// 8) Hjørneteknik ved 1,5 kN: passiv rider vs. rider der kanter ud 5 s før hjørnet og læner efter linens vinkel
function lap(kmh, G, Lout) { const M = fresh(), s = M.createSim({ cableKmh: kmh }); s.obstaclesOn = false; s.setStartMode('jump'); s.reset(); s.setWind(0); let pk = 0; const P_ = s.path;
  for (let i = 0; i < 240 * 120; i++) { if (G) lapCtl(s, G, Lout); else { s.leanCmdIn = 0; s.legCmdIn = s.legBase; } s.step();
    if (s.t > 6) pk = Math.max(pk, s.line.F); if (s.out.fall) return s.out.fall; if (s.carrier.s > P_.length) break; }
  return `hel runde, top ${pk.toFixed(0)} N`; }
for (const kmh of [20, 30, 35]) console.log(`8) ${kmh} km/t, grænse 1,5 kN: passiv → ${lap(kmh, 0, 0)} · god teknik → ${lap(kmh, 1.5, 20)}`);
// 9) Vandoverflade: vind-krusninger (JONSWAP, fetch 250 m) + eget kølvand. Ligeud 30 km/t: boardets lodrette bevægelse og linekraft
for (const U of [0, 4, 8]) { const M = fresh(), s = straight(M); s.setWind(U); let n = 0, z = 0, z2 = 0, T = 0, T2 = 0, sl = 0;
  for (let i = 0; i < 240 * 40; i++) { s.step(); if (s.t > 10) { n++; const h = s.rider.z; z += h; z2 += h * h; T += s.line.F; T2 += s.line.F ** 2; sl = Math.max(sl, s.out.slam || 0); } }
  const zs = Math.sqrt(Math.max(0, z2 / n - (z / n) ** 2)), Ts = Math.sqrt(Math.max(0, T2 / n - (T / n) ** 2));
  console.log(`9) Vind ${U} m/s (Hs ${(s.chop.Hs * 100).toFixed(1)} cm, Tp ${s.chop.Tp.toFixed(2)} s): board-heave rms ${(zs * 100).toFixed(1)} cm, T ${(T / n).toFixed(0)} ± ${Ts.toFixed(0)} N, maks slamming ${sl.toFixed(0)} N${s.out.fall ? ', FALD: ' + s.out.fall : ''}`); }
{ const M = fresh(), s = M.createSim({ cableKmh: 30 }); s.obstaclesOn = false; s.releaseN = 1e9; s.setWind(0); let cross = 0;
  for (let i = 0; i < 240 * 70 && !s.out.fall; i++) { lapCtl(s); s.step(); if (Math.abs(s.out.eta) > 0.01) cross++; }
  console.log(`9) Eget kølvand (vindstille, én runde): boardet står i kølvand > 1 cm i ${(cross / 240).toFixed(1)} s${s.out.fall ? ' · FALD: ' + s.out.fall : ''}`); }
// 10) Tricks på O3-kickeren (30 km/t): pre-wind + linemoment + grab. Spin følger impulsmomentet (I·ω bevares i luften)
function trick(plan) { const M = fresh(), s = M.createSim({ cableKmh: 30 }); s.setWind(0); const ob = s.obs.find(o => o.name === 'O3 kicker'), g = s.path.pieces.filter(g => g.kind === 'line')[ob.leg];
  const uu = (ob.x - g.a[0]) * g.t[0] + (ob.y - g.a[1]) * g.t[1]; s.carrier.s = g.s0 + uu - 40 + Math.sqrt(Math.max(1, 19.6 ** 2 - 8.1 ** 2 - ob.off ** 2)); s.step();
  Object.assign(s.tow, { x: s.carrier.x, y: s.carrier.y, vx: s.carrier.vx, vy: s.carrier.vy }); const R = s.rider;
  Object.assign(R, { x: ob.x - ob.ax * 40, y: ob.y - ob.ay * 40, z: -0.03, vx: ob.ax * 8.33, vy: ob.ay * 8.33, vz: 0, psi: ob.yaw, r: 0, phi: 0, p: 0, theta: 0.1, q: 0 }); s.jump = null; s.out.lastTrick = null;
  let tA = null, pv = 0;
  for (let i = 0; i < 240 * 12; i++) { const rx = R.x - ob.x, ry = R.y - ob.y, u = rx * ob.ax + ry * ob.ay, v = -rx * ob.ay + ry * ob.ax, vd = (v - pv) * 240; pv = v;
    s.leanCmdIn = (u < ob.L / 2 && R.z < 0.05 && !s.jump ? Math.max(-55, Math.min(55, 40 * v + 25 * vd)) : 0) * D; s.legCmdIn = s.legBase;
    if (s.jump && tA === null) tA = s.t; const c = plan(u - ob.L / 2, tA === null ? null : s.t - tA); s.spinIn = c.spin || 0; s.grabIn = c.grab || 0; s.step();
    if (s.out.fall) return 'FALD: ' + s.out.fall; if (tA !== null && !s.jump && s.out.lastTrick) return `${s.out.lastTrick.name} (luft ${s.out.lastTrick.dur.toFixed(2)} s${s.switchStance ? ', lander switch' : ''})`; }
  return 'ingen landing'; }
for (const [n, p] of [['lige hop', () => ({})], ['nose grab 0,15–0,65 s', (d, ta) => ({ grab: ta !== null && ta > 0.15 && ta < 0.65 ? 1 : 0 })],
  ['nose grab holdt til landing', (d, ta) => ({ grab: ta !== null && ta > 0.1 ? 1 : 0 })], ['Q pre-wind 3,5 m før kanten', (d, ta) => ({ spin: d > -3.5 && ta === null ? 1 : 0 })],
  ['Q pre-wind + i luften + nose grab', (d, ta) => ({ spin: d > -3.5 && (ta === null || ta < 0.8) ? 1 : 0, grab: ta !== null && ta > 0.15 && ta < 0.6 ? 1 : 0 })]])
  console.log(`10) ${n}: ${trick(p)}`);
// 11) Rails (rails-rapporten): v_req = (l̂·v_c)/(l̂·t). Lige kabel langs x, lige rail 4 m til siden, vinklet α væk fra kablet.
//     Rideren sættes på railens flade top med farten v; ingen styring (auto-balance). Forventet: under v_req strammes linen og
//     sidetrækket fører rideren af railen; over v_req går linen slap og rideren glider til enden (kun friktion bremser).
function railLab(alphaDeg, vKmh, o = {}) { const M = fresh(); M.LAYOUT.wheels = [[0, 0], [3000, 0], [3000, -400], [0, -400]];
  const a = alphaDeg * D, L = 16, H = 0.5, y0 = 4, xs = 300; M.PHYS.ENTRY_LEN = 0.01;
  M.LAYOUT.obstacles = [{ id: 'T', name: 'lab rail', type: 'rail', x: xs + Math.cos(a) * L / 2, y: y0 + Math.sin(a) * L / 2, dir: [Math.cos(a), Math.sin(a)], L, W: 0.1, H }];
  const s = M.createSim({ cableKmh: 30 }); s.setWind(0); if (o.model) s.setLineModel(o.model); if (o.rel) s.releaseN = o.rel;
  const ob = s.obs[0], R = s.rider, v = vKmh / 3.6, u0 = -L / 2 + 0.3, rx = ob.x + ob.ax * u0, ry = ob.y + ob.ay * u0;
  const dz = M.PHYS.CABLE_HEIGHT - (H + 1.0), hor = Math.sqrt((M.PHYS.LINE_LENGTH - 0.02) ** 2 - dz * dz);
  s.carrier.s = rx + Math.sqrt(hor * hor - ry * ry) - 1; s.step(); Object.assign(s.tow, { x: s.carrier.x, y: s.carrier.y, vx: s.carrier.vx, vy: s.carrier.vy });
  Object.assign(R, { x: rx, y: ry, z: H + 0.001, vx: ob.ax * v, vy: ob.ay * v, vz: 0, psi: ob.yaw, r: 0, phi: 0, p: 0, theta: 0.1, q: 0, leg: 0.85, legv: 0, arm: 0 });
  s.line.hp = [rx, ry, H + 1]; Object.assign(s.energy, { lineWork: 0, waterWork: 0, airWork: 0, muscleWork: 0, E0: null }); const vReq = s.railPreview(ob); let Tmax = 0, Eres = 0;
  for (let i = 0; i < 240 * 6; i++) { s.leanCmdIn = 0; s.legCmdIn = s.legBase; s.spinIn = o.slide && s._onRail ? 1 : 0; s.step(); if (s.out.rail) Tmax = Math.max(Tmax, s.line.F);
    Eres = Math.max(Eres, Math.abs(s.out.Eres)); if (s.out.fall || (!s._railRun && s.out.lastRail)) break; }
  const lr = s.out.lastRail; return { vReq: vReq * 3.6, lr, fall: s.out.fall, Tmax, Eres }; }
{ const rows = []; for (const al of [0, 20, 30]) { const r0 = railLab(al, 30); const cells = [];
    for (const v of [30, 36, 42, 48]) { const r = railLab(al, v); cells.push(`${v}: ${r.lr ? (r.lr.result === 'rode to the end' ? 'hele railen' : r.lr.result === 'pulled off the side' ? `trukket af efter ${r.lr.dur.toFixed(2)} s` : 'fald') : 'fald: ' + r.fall}`); }
    rows.push(`   α ${String(al).padStart(2)}° (v_req ${r0.vReq.toFixed(1)} km/t; simpel V/cos α = ${(30 / Math.cos(al * D)).toFixed(1)}): ${cells.join(' · ')}`); }
  console.log('11) Rail-lab, kabel 30 km/t, rail 16 m, 4 m fra kablet, indgangsfart (km/t) → udfald:\n' + rows.join('\n')); }
for (const [lbl, o] of [['50-50', {}], ['boardslide', { slide: 1 }]]) { const r = railLab(20, 36, o);
  console.log(`11) α 20°, 36 km/t, ${lbl}: ${r.lr ? r.lr.result + ` efter ${r.lr.dur.toFixed(2)} s, maks sidetræk ${r.lr.maxSide.toFixed(0)} N` : 'fald: ' + r.fall}`); }
for (const model of ['spring', 'rigid']) { const r = railLab(20, 34, { model, rel: 1e9 });
  console.log(`11) Linemodel ${model}, α 20°, 34 km/t: ${r.lr ? r.lr.result : 'fald: ' + r.fall}, maks linekraft på railen ${r.Tmax.toFixed(0)} N, energirest ${(r.Eres / 1000).toFixed(2)} kJ`); }
{ const out = []; for (const mode of ['slide', 'jump']) { const M = fresh(), s = M.createSim({ cableKmh: 30 }); s.obstaclesOn = false; s.releaseN = 1e9; s.setWind(0); s.setLineModel('rigid'); s.setStartMode(mode); s.reset();
    let pk = 0; for (let i = 0; i < 240 * 8; i++) { s.legCmdIn = s.legBase; s.step(); pk = Math.max(pk, s.line.F); } out.push(`${mode} ${(pk / 1000).toFixed(1)} kN`); }
  console.log(`11) Start 30 km/t med ustrækbar line: ${out.join(' · ')} (fjeder: se 6)`); }
console.log('* Rapportens tal stammer fra en illustrativ punktmassemodel, ikke fra målinger.');
