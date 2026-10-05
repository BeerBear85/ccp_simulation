// Separable CMA-ES over the per-corner technique; objective = worst peak line force (min-max) + penalties.
const { fork } = require('child_process');
const fs = require('fs');
const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));   // { name, base, params: [[corner, key, lo, hi, x0]], winds, laps, lambda, gens, sigma, shoreMin, allowContacts }
const out = spec.name;
if (process.argv[3] === 'worker') {
  const { run } = require('./evalr.js');
  process.on('message', ({ id, cfg: cfg0 }) => {
    let J = 0, worst = 0, detail = [];
    for (const pt of (spec.perturb || [null])) for (const w of spec.winds) {
      const cfg = JSON.parse(JSON.stringify(cfg0)); if (pt) cfg.ap.corners[pt[0]][pt[1]] += pt[2];
      const r = run(cfg, { wind: w, laps: spec.laps });
      let pen = 0;
      if (r.fall) pen += 5000;
      if (r.minShore < spec.shoreMin) pen += 300 * (spec.shoreMin - r.minShore);
      const bad = r.contacts.filter(c => !(spec.allowContacts || []).includes(c)); pen += 2000 * bad.length;
      if (spec.vCap) for (const v of Object.values(spec.vMode === 'corner' ? r.vCorner : r.vc)) pen += (spec.vW || 300) * Math.max(0, v - spec.vCap);
      if (spec.vOA) pen += (spec.vW || 300) * Math.max(0, r.vOA - spec.vOA);
      for (const [id, m] of Object.entries(spec.latMin || {})) if (!(r.lat[id] >= m)) pen += 150 * (m - (r.lat[id] ?? 0));
      for (const c of spec.needContacts || []) if (!r.contacts.includes(c)) pen += 3000;
      for (const t of spec.needTricks || []) if (!r.tricks.some(n => new RegExp(t).test(n))) pen += 3000;
      const cp = Object.values(r.corner), pk = Math.max(r.legPeak, ...cp);
      let j = pk + 0.05 * cp.reduce((a, b) => a + b, 0) / cp.length + pen;
      if (spec.focus) { const oth = Math.max(r.legPeak, ...Object.entries(r.corner).filter(([k]) => !spec.focus.includes(k)).map(([, v]) => v));
        j = Math.max(...spec.focus.map(k => r.corner[k])) + 0.5 * Math.max(0, oth - (spec.otherRef || 0)) + pen + (spec.impW || 0) * spec.focus.reduce((q, k) => q + (r.imp[k] || 0), 0); }
      J = Math.max(J, j); worst = Math.max(worst, pk);
      detail.push({ w, pk: Math.round(pk), vmax: +r.vmax.toFixed(1), vCorner: Math.max(0, ...Object.values(r.vCorner)).toFixed(1), vOA: r.vOA.toFixed(1), lat: r.lat, corner: Object.fromEntries(Object.entries(r.corner).map(([k, v]) => [k, Math.round(v)])), leg: Math.round(r.legPeak), shore: +r.minShore.toFixed(1), fall: r.fall, bad, tricks: r.tricks });
    }
    process.send({ id, J, worst, detail });
  });
  return;
}
const n = spec.params.length, lam = spec.lambda || 12, mu = Math.floor(lam / 2);
const wts = Array.from({ length: mu }, (_, i) => Math.log(mu + 0.5) - Math.log(i + 1)); const sw = wts.reduce((a, b) => a + b); for (let i = 0; i < mu; i++) wts[i] /= sw;
const mueff = 1 / wts.reduce((a, b) => a + b * b, 0);
const cs = (mueff + 2) / (n + mueff + 5), ds = 1 + 2 * Math.max(0, Math.sqrt((mueff - 1) / (n + 1)) - 1) + cs, chiN = Math.sqrt(n) * (1 - 1 / (4 * n) + 1 / (21 * n * n));
const cc = (4 + mueff / n) / (n + 4 + 2 * mueff / n), c1 = 2 / ((n + 1.3) ** 2 + mueff) * (n + 2) / 3, cmu = Math.min(1 - c1, 2 * (mueff - 2 + 1 / mueff) / ((n + 2) ** 2 + mueff) * (n + 2) / 3);
let m = spec.params.map(p => (p[4] - p[2]) / (p[3] - p[2])), sigma = spec.sigma || 0.2, D = Array(n).fill(1), ps = Array(n).fill(0), pc = Array(n).fill(0);
const randn = () => { let u = 0, v = 0; while (!u) u = Math.random(); v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const toCfg = x => { const cfg = JSON.parse(JSON.stringify(spec.base || {})); cfg.ap = cfg.ap || {}; cfg.ap.corners = cfg.ap.corners || {};
  spec.params.forEach((p, i) => { const v = p[2] + Math.max(0, Math.min(1, x[i])) * (p[3] - p[2]); if (p[0] === 'gains' || p[0] === 'plan') return; (cfg.ap.corners[p[0]] = cfg.ap.corners[p[0]] || {})[p[1]] = +v.toFixed(3); });
  // plan params: p[0]==='plan' -> p[1] = 'idx.key'
  spec.params.forEach((p, i) => { if (p[0] !== 'gains') return; const v = p[2] + Math.max(0, Math.min(1, x[i])) * (p[3] - p[2]); (cfg.ap.gains = cfg.ap.gains || {})[p[1]] = +v.toFixed(3); });
  spec.params.forEach((p, i) => { if (p[0] !== 'plan') return; const v = p[2] + Math.max(0, Math.min(1, x[i])) * (p[3] - p[2]); const [k, key] = p[1].split('.'); cfg.ap.plan[+k][key] = +v.toFixed(3); });
  return cfg; };
const workers = [0, 1].map(() => fork(__filename, [process.argv[2], 'worker']));
let best = { J: Infinity }, nid = 0;
const evalAll = cfgs => new Promise(res => { const R = new Array(cfgs.length); let next = 0, done = 0;
  const go = wk => { if (next >= cfgs.length) return; const id = next++; wk.once('message', r => { R[id] = r; done++; if (done === cfgs.length) res(R); else go(wk); }); wk.send({ id, cfg: cfgs[id] }); };
  workers.forEach(go); });
(async () => {
  const r0 = (await evalAll([toCfg(m)]))[0]; best = { J: r0.J, x: m.slice(), cfg: toCfg(m), detail: r0.detail };
  fs.writeFileSync(out + '.best.json', JSON.stringify(best, null, 1));
  fs.appendFileSync(out + '.log', `start J ${r0.J.toFixed(0)} ${JSON.stringify(r0.detail)}\n`);
  for (let g = 0; g < (spec.gens || 40); g++) {
    const Z = [], X = [];
    for (let k = 0; k < lam; k++) { const z = Array.from({ length: n }, randn); Z.push(z); X.push(m.map((mi, i) => mi + sigma * D[i] * z[i])); }
    const R = await evalAll(X.map(toCfg));
    // boundary penalty
    const J = R.map((r, k) => r.J + 200 * X[k].reduce((a, x) => a + (x < 0 ? -x : x > 1 ? x - 1 : 0), 0));
    const idx = J.map((_, i) => i).sort((a, b) => J[a] - J[b]);
    if (J[idx[0]] < best.J) { best = { J: J[idx[0]], x: X[idx[0]].slice(), cfg: toCfg(X[idx[0]]), detail: R[idx[0]].detail }; fs.writeFileSync(out + '.best.json', JSON.stringify(best, null, 1)); }
    const old = m.slice(); m = Array(n).fill(0); const zw = Array(n).fill(0);
    for (let k = 0; k < mu; k++) for (let i = 0; i < n; i++) { m[i] += wts[k] * X[idx[k]][i]; zw[i] += wts[k] * Z[idx[k]][i]; }
    for (let i = 0; i < n; i++) ps[i] = (1 - cs) * ps[i] + Math.sqrt(cs * (2 - cs) * mueff) * zw[i];
    const psn = Math.sqrt(ps.reduce((a, b) => a + b * b, 0)); const hs = psn / Math.sqrt(1 - (1 - cs) ** (2 * (g + 1))) < (1.4 + 2 / (n + 1)) * chiN ? 1 : 0;
    for (let i = 0; i < n; i++) { pc[i] = (1 - cc) * pc[i] + hs * Math.sqrt(cc * (2 - cc) * mueff) * (m[i] - old[i]) / sigma;
      let C = D[i] * D[i]; let rank = 0; for (let k = 0; k < mu; k++) rank += wts[k] * (D[i] * Z[idx[k]][i]) ** 2;
      C = (1 - c1 - cmu) * C + c1 * pc[i] * pc[i] + cmu * rank; D[i] = Math.sqrt(Math.max(1e-8, C)); }
    sigma *= Math.exp((cs / ds) * (psn / chiN - 1)); sigma = Math.min(sigma, 0.5);
    fs.appendFileSync(out + '.log', `gen ${g} best ${best.J.toFixed(0)} genbest ${J[idx[0]].toFixed(0)} median ${J[idx[mu]].toFixed(0)} sigma ${sigma.toFixed(3)}\n`);
  }
  fs.appendFileSync(out + '.log', 'DONE\n'); workers.forEach(w => w.kill()); process.exit(0);
})();
