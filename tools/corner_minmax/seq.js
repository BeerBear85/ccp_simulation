// Sequential per-corner optimisation driver: node seq.js <name> <base.json> <order TA,TE,...> <rounds>
const { execFileSync } = require('child_process'); const fs = require('fs');
const [,, name, baseFile, order, rounds] = process.argv;
let base = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
const { run } = require('./evalr.js');
const P = base.space || { offset: [0, 18], lead: [0, 10], turnIn: [0, 4], carve: [0, 45], carveFor: [0, 5], edge: [0, 45], vmax: [0.5, 5] } ||  { offset: [0, 18], lead: [0, 10], turnIn: [0, 4], carve: [0, 45], carveFor: [0, 5], edge: [0, 45] };
const DEF = { edge: 20, offset: 6, lead: 0, turnIn: 0, carve: 0, carveFor: 0, vmax: 4 };
const winds = base.winds || [0, 8];
const stat = cfg => { const R = winds.map(w => run(cfg, { wind: w, laps: 2 })); const c = {}; for (const r of R) for (const [k, v] of Object.entries(r.corner)) c[k] = Math.max(c[k] || 0, v);
  return { c, leg: Math.max(...R.map(r => r.legPeak)), R }; };
const okRun = r => !r.fall && (!base.vCap || r.vmax <= base.vCap + 0.05) && Object.entries(base.latMin || {}).every(([id, m]) => r.lat[id] >= m - 0.05) && r.minShore >= (base.shoreMin ?? 4) - 0.01 && r.contacts.every(c => (base.allowContacts || []).includes(c)) && (base.needTricks || []).every(t => r.tricks.some(n => new RegExp(t).test(n)));
for (let rd = 0; rd < +(rounds || 1); rd++) for (const id of order.split(',')) {
  const st = stat(base), other = Math.max(st.leg, ...Object.entries(st.c).filter(([k]) => k !== id).map(([, v]) => v));
  const cur = { ...DEF, ...((base.ap.corners || {})[id] || {}) };
  const spec = { name: `${name}_${id}_${rd}`, base, focus: [id], otherRef: other, winds, laps: 2, lambda: 10, gens: base.gens || 14, sigma: 0.2, shoreMin: base.shoreMin ?? 4,
    allowContacts: base.allowContacts || [], needTricks: base.needTricks || [], needContacts: base.needContacts || [], vCap: base.vCap, latMin: base.latMin,
    params: Object.entries(P).map(([k, [lo, hi]]) => [id, k, lo, hi, Math.min(hi, Math.max(lo, cur[k]))]) };
  fs.writeFileSync(spec.name + '.json', JSON.stringify(spec));
  execFileSync('node', ['opt.js', spec.name + '.json'], { stdio: 'inherit' });
  const best = JSON.parse(fs.readFileSync(spec.name + '.best.json', 'utf8'));
  for (const k of ['shoreMin', 'allowContacts', 'needTricks', 'needContacts', 'space', 'winds', 'gens', 'vCap', 'latMin']) if (base[k] !== undefined) best.cfg[k] = base[k];
  const st2 = stat(best.cfg); const pk1 = Math.max(st.leg, ...Object.values(st.c)), pk2 = Math.max(st2.leg, ...Object.values(st2.c));
  const bad = st => st.R.reduce((a, r) => a + (base.vCap ? Object.values(r.vc).reduce((q, v) => q + Math.max(0, v - base.vCap), 0) : 0) * 300 + Object.entries(base.latMin || {}).reduce((b, [i, m]) => b + 150 * Math.max(0, m - (r.lat[i] ?? 0)), 0), 0);
  const ok = st2.R.every(r => !r.fall && r.minShore >= (base.shoreMin ?? 4) - 0.01 && r.contacts.every(c => (base.allowContacts || []).includes(c))) && (bad(st2) < bad(st) - 1 || (st2.R.every(okRun) && st2.c[id] < st.c[id] - 1 && pk2 <= pk1 + 15));
  fs.appendFileSync(name + '.seq.log', `round ${rd} ${id}: corner ${st.c[id].toFixed(0)} -> ${st2.c[id].toFixed(0)}, overall ${pk1.toFixed(0)} -> ${pk2.toFixed(0)} ${ok ? 'ACCEPT' : 'reject'} ${JSON.stringify(best.cfg.ap.corners[id])} corners ${JSON.stringify(Object.fromEntries(Object.entries(st2.c).map(([k, v]) => [k, Math.round(v)])))} shore ${st2.R.map(r => r.minShore.toFixed(1))} vmax ${st2.R.map(r => r.vmax.toFixed(1))} lat ${JSON.stringify(st2.R[0].lat)} fall ${st2.R.map(r => r.fall)}\n`);
  if (ok) { base = best.cfg; fs.writeFileSync(name + '.cur.json', JSON.stringify(base, null, 1)); }
}
fs.appendFileSync(name + '.seq.log', 'SEQ DONE\n');
