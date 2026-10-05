// Evaluate an autopilot config: per-corner peak line force over laps 2..N, falls, shore margin, unplanned contacts
const path = require('path');
const P = require(process.env.PHYS || require('path').join(__dirname, '../../src/physics.js'));
function inPoly(x, y, Pg) { let c = false; for (let i = 0, j = Pg.length - 1; i < Pg.length; j = i++) if ((Pg[i][1] > y) !== (Pg[j][1] > y) && x < (Pg[j][0] - Pg[i][0]) * (y - Pg[i][1]) / (Pg[j][1] - Pg[i][1]) + Pg[i][0]) c = !c; return c; }
function segD(x, y, a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy))); return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy); }
function shoreDist(x, y) { const W = P.LAYOUT.water; let d = 1e9; for (let i = 0; i < W.length; i++) d = Math.min(d, segD(x, y, W[i], W[(i + 1) % W.length]));
  const J = P.LAYOUT.jetty; for (let i = 0; i < J.length - 1; i++) d = Math.min(d, segD(x, y, J[i], J[i + 1]));
  return inPoly(x, y, W) ? d : -d; }
const TOW = ['TB', 'TC', 'TD', 'TE', 'TF', 'TA'];   // arc piece 1,3,..,11 = wheel 1..5,0
function run(cfg = {}, { wind = 0, laps = 3, trace = false } = {}) {
  const s = P.createSim({ ...P.DEMO_SETTINGS, wind, ...(cfg.sim || {}) });
  const ap = P.createAutopilot(s, cfg.ap || {});
  const L = s.path.length, arcs = s.path.pieces.filter(g => g.kind === 'arc');
  const res = { fall: '', corner: {}, legPeak: 0, minShore: 1e9, contacts: new Set(), tricks: new Set(), peak: 0, peakAt: null, tr: [], vmax: 0, vmaxAt: null, lat: {}, vc: {}, imp: {}, vCorner: {}, vOA: 0 };
  for (const id of TOW) res.corner[id] = 0;
  let k = 0, prevCs = 0;
  const legs = s.path.pieces.map((g, i) => s.path.pieces[i - 1]);
  while (s.carrier.s < (laps + 1) * L && s.t < 400) {
    ap.update(); s.step(); k++;
    if (s.out.fall) { res.fall = s.out.fall + ' @' + s.t.toFixed(1) + ' cs ' + (s.carrier.s % L).toFixed(0); break; }
    if (s.out.lastTrick) res.tricks.add(s.out.lastTrick.name);
    if (s.carrier.s < L) continue;   // skip the start lap
    const cs = s.carrier.s % L, F = s.line.F;
    arcs.forEach((g, i) => { const leg = s.path.pieces[s.path.pieces.indexOf(g) - 1]; if (prevCs < g.s0 && cs >= g.s0 && !(TOW[i] in res.lat)) res.lat[TOW[i]] = +(-((s.rider.x - leg.a[0]) * -leg.t[1] + (s.rider.y - leg.a[1]) * leg.t[0])).toFixed(1); });
    prevCs = cs;
    if (s.out.contact && s.out.contact !== 'start dock') res.contacts.add(s.out.contact);
    res.minShore = Math.min(res.minShore, shoreDist(s.rider.x, s.rider.y));
    // nearest corner (by carrier arclength, window −8 s … +10 s)
    let best = null;
    arcs.forEach((g, i) => { let d = cs - g.s0; if (d > L / 2) d -= L; if (d < -L / 2) d += L; const t = d / s.cableSpeed; if (t > -8 && t < 10 && (!best || Math.abs(t) < Math.abs(best.t))) best = { id: TOW[i], t }; });
    const key = best ? best.id : 'leg'; const Vh = Math.hypot(s.rider.vx, s.rider.vy) * 3.6;
    if (['line', 'wide', 'turn-in'].includes(ap.phase) && !s.jump) res.vCorner[key] = Math.max(res.vCorner[key] || 0, Vh);
    if (ap.focus && /OA/.test(ap.focus.p.name) && ap.phase === 'approach') res.vOA = Math.max(res.vOA, Vh);
    res.imp[key] = (res.imp[key] || 0) + Math.max(0, F - 600) * P.PHYS.DT; res.vc[key] = Math.max(res.vc[key] || 0, Math.hypot(s.rider.vx, s.rider.vy) * 3.6);
    if (best) res.corner[best.id] = Math.max(res.corner[best.id], F); else res.legPeak = Math.max(res.legPeak, F);
    const V = Math.hypot(s.rider.vx, s.rider.vy) * 3.6; if (V > res.vmax) { res.vmax = V; res.vmaxAt = { cs: +cs.toFixed(1), phase: ap.phase, air: !!s.jump }; }
    if (F > res.peak) { res.peak = F; res.peakAt = { cs: +cs.toFixed(1), phase: ap.phase, focus: ap.focus ? ap.focus.p.name : '' }; }
    if (trace && k % 4 === 0) res.tr.push([+s.t.toFixed(2), +cs.toFixed(1), +s.rider.x.toFixed(2), +s.rider.y.toFixed(2), +F.toFixed(0), ap.phase, +(s.rider.psi * 180 / Math.PI).toFixed(1), +s.tow.x.toFixed(2), +s.tow.y.toFixed(2), +(Math.hypot(s.rider.vx, s.rider.vy) * 3.6).toFixed(2)]);
  }
  res.contacts = [...res.contacts]; res.tricks = [...res.tricks];
  return res;
}
module.exports = { run, shoreDist, TOW };
if (require.main === module) {
  const cfg = process.argv[2] ? JSON.parse(process.argv[2]) : {};
  for (const w of [0, 4, 8]) { const r = run(cfg, { wind: w }); delete r.tr; console.log('wind', w, JSON.stringify(r)); }
}
