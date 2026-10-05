// Export geometry + rider traces (lap 2, wind given) for plotting: node export.js out.json name=cfg.json ...
const fs = require('fs'); const P = require('../../src/physics.js'); const { run } = require('./evalr.js');
const s = P.createSim(P.DEMO_SETTINGS);
const geo = { water: P.LAYOUT.water, jetty: P.LAYOUT.jetty, wheels: s.path.wheels, masts: P.LAYOUT.masts,
  obs: s.obs.map(o => ({ name: o.name, x: o.x, y: o.y, ax: o.ax, ay: o.ay, L: o.L, W: o.W })), path: [] };
for (let q = 0; q < s.path.length; q += 1) { const p = P.pathAt(s.path, q); geo.path.push([+p.x.toFixed(2), +p.y.toFixed(2)]); }
const traces = {};
const wind = +(process.env.WIND || 0);
for (const a of process.argv.slice(3)) {
  const [name, file] = a.split('='); const cfg = file === '-' ? {} : JSON.parse(fs.readFileSync(file, 'utf8'));
  const r = run(cfg, { wind, laps: 1, trace: true });
  traces[name] = { tr: r.tr, corner: r.corner, leg: r.legPeak, fall: r.fall, shore: r.minShore, tricks: r.tricks, contacts: r.contacts };
}
fs.writeFileSync(process.argv[2], JSON.stringify({ geo, traces }));
