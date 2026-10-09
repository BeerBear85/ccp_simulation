/* Drone flyby camera: ONE continuously flying camera, no cuts. It starts with a wide sweep round the park and then flies
 * as a real drone would: a point mass chasing a framing goal with a top speed of 80 km/h (VMAX) and limited acceleration,
 * keeping to the inside of the cable loop (left of travel; the loop runs counter-clockwise). Framings change smoothly
 * every few seconds; ahead of a demo feature it flies to a vantage point beside the feature and films the trick.
 * Terrain guard: the drone never flies into the land, its trees or bank buildings, and it climbs so that the line of
 * sight to the rider clears the land (towers may still block the view briefly). Coordinates: x east, y north, z up (m).
 * Pure: no Three.js or DOM, so tests can fly it headless.
 */
function createDroneGuard(E, opt = {}) {
  const o = Object.assign({
    water: 2.5,   // m  lowest altitude over open water (above wake and chop)
    land: 14,     // m  lowest altitude over or near land: trees ≈9 m, clubhouse/awning, bank buildings. Assumed
    sight: 11,    // m  the sight line to the rider must pass this high over land (trees + margin). Assumed
    margin: 8,    // m  horizontal clearance from the shoreline before the land floor applies
    max: 45,      // m  ceiling for the sight-line climb
    ahead: 1.5    // s  look-ahead along the velocity, so the drone climbs before it reaches the bank
  }, opt);
  const inPoly = (x, y, P) => { let c = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; }
    return c; };
  const land = (x, y) => inPoly(x, y, E.westLand) || inPoly(x, y, E.eastLand);
  const nearLand = (x, y, r = o.margin) => land(x, y) ||
    [[1, 0], [-1, 0], [0, 1], [0, -1], [.7, .7], [-.7, .7], [.7, -.7], [-.7, -.7]].some(([a, b]) => land(x + a * r, y + b * r));
  const floorAt = (x, y) => nearLand(x, y) ? o.land : o.water;
  // altitude at (x, y) needed for the sight line to a target at (tx, ty, tz) to clear the land by o.sight
  function sightAt(x, y, tx, ty, tz) {
    let need = 0;
    for (let k = 1; k < 12; k++) { const s = k / 12;
      if (land(tx + (x - tx) * s, ty + (y - ty) * s)) need = Math.max(need, tz + (o.sight - tz) / s); }
    return need;
  }
  const minAlt = (x, y, tx, ty, tz) => Math.min(o.max, Math.max(floorAt(x, y), sightAt(x, y, tx, ty, tz)));
  // true while the straight sight line drone → rider passes below o.sight - 2 over land (trees/bank in the way)
  function blocked(p, tx, ty, tz) {
    for (let k = 1; k < 12; k++) { const s = k / 12, x = tx + (p[0] - tx) * s, y = ty + (p[1] - ty) * s;
      if (land(x, y) && tz + (p[2] - tz) * s < o.sight - 2) return true; }
    return false;
  }
  return { opt: o, land, nearLand, floorAt, sightAt, minAlt, blocked };
}

function createDrone(sim, E, obstacles, opt = {}) {
  const VMAX = 80 / 3.6, AMAX = 7, K = 1.1;   // m/s, m/s², 1/s (approach gain)
  const MODES = ['chase', 'orbit', 'side', 'high', 'ahead', 'low'], FEAT = ['side', 'front', 'high'];
  const guard = createDroneGuard(E, opt);
  const d = { mode: 'intro', t0: 0, n: 0, nFeat: 0, featP: null, fview: 'side', p: [0, 0, 0], v: [0, 0, 0], g: null, gv: [0, 0, 0],
    look: null, dir: { x: 1, y: 0 }, last: 0, speed: 0, a0: 0, ahead: null, guard };
  d.reset = now => Object.assign(d, { mode: 'intro', t0: now, n: 0, featP: null, g: null, last: 0, v: [0, 0, 0], look: null });
  function setMode(mode, now) { d.mode = mode; d.t0 = now; d.a0 = Math.atan2(d.p[1] - sim.rider.y, d.p[0] - sim.rider.x); d.ahead = null; }
  // returns { p: camera position, look: point the gimbal aims at } in sim coordinates
  d.update = (now, R, f) => {
    const dt = Math.min(0.1, now - (d.last || now)); d.last = now;
    const t = now - d.t0;
    const vv = Math.hypot(R.vx, R.vy); if (vv > 1) { const k = Math.min(1, dt * 2); d.dir.x += (R.vx / vv - d.dir.x) * k; d.dir.y += (R.vy / vv - d.dir.y) * k; }
    const dl = Math.hypot(d.dir.x, d.dir.y) || 1, dx = d.dir.x / dl, dy = d.dir.y / dl, nx = -dy, ny = dx;   // n = left of travel = inside
    const rz = Math.max(R.z, 0), tz = rz + 0.9;
    let g, lx = R.x + dx * 2, ly = R.y + dy * 2, lz = rz + 0.9;
    if (d.mode === 'intro') {   // scripted spiral: a wide sweep round the park closing in on the rider at the start (≤ 80 km/h)
      const T = 8, q = Math.min(1, t / T), e = q * q * (3 - 2 * q), a = 3.6 + 0.128 * t;
      const cx = 92 + (R.x - 92) * e, cy = 30 + (R.y - 30) * e, rad = 165 + (40 - 165) * e;
      g = [cx + rad * Math.cos(a), cy + rad * Math.sin(a), 75 + (14 - 75) * e];
      g[2] = Math.max(g[2], guard.minAlt(g[0], g[1], R.x, R.y, tz));
      lx = 92 + (R.x - 92) * e; ly = 30 + (R.y - 30) * e; lz = 0;
      if (dt > 0.005) { d.v = g.map((x, i) => (x - d.p[i]) / dt); const sp = Math.hypot(...d.v); if (sp > VMAX) d.v = d.v.map(x => x * VMAX / sp); }
      d.p = g; if (t > T) setMode('chase', now);
    } else {
      if (f && f.p !== d.featP && f.u > -f.p.ob.L / 2 - 50) { d.featP = f.p; d.fview = FEAT[d.nFeat++ % FEAT.length]; setMode('feature', now); }
      if (d.mode === 'feature' && (!f || f.p !== d.featP)) setMode(MODES[d.n++ % MODES.length], now);
      if (!f) d.featP = null;
      if (d.mode !== 'feature' && t > 6.5) setMode(MODES[d.n++ % MODES.length], now);
      switch (d.mode) {
        case 'chase': g = [R.x - dx * 8 + nx * 4, R.y - dy * 8 + ny * 4, rz + 3.5]; lx = R.x + dx * 4; ly = R.y + dy * 4; break;
        case 'low': g = [R.x - dx * 5 + nx * 2.5, R.y - dy * 5 + ny * 2.5, rz + 2.5]; lx = R.x + dx * 6; ly = R.y + dy * 6; lz = rz + 1.1; break;
        case 'side': g = [R.x + nx * 11 + dx * 2, R.y + ny * 11 + dy * 2, 4]; break;
        case 'high': g = [R.x - dx * 14 + nx * 18, R.y - dy * 14 + ny * 18, 24]; lx = R.x + dx * 10; ly = R.y + dy * 10; lz = 0; break;
        case 'orbit': { const a = d.a0 + 0.35 * t; g = [R.x + 16 * Math.cos(a), R.y + 16 * Math.sin(a), rz + 7]; break; }
        case 'ahead': { if (!d.ahead) d.ahead = [R.x + dx * 55 + nx * 5, R.y + dy * 55 + ny * 5, 4.5]; g = d.ahead.slice(); break; }
        case 'feature': {
          const ob = d.featP.ob, at = (u, v, h) => [ob.x + ob.ax * u - ob.ay * v, ob.y + ob.ay * u + ob.ax * v, h];
          g = d.fview === 'side' ? at(ob.L / 2 + 2, ob.W / 2 + 8, 4.5) : d.fview === 'front' ? at(ob.L / 2 + 20, 6, 5) : at(ob.L / 2, 9, 14);
          lx = R.x; ly = R.y; lz = rz + 0.8; break; }
      }
      // a goal over or near land: mirror the sideways offset to the water side of the rider if that is clear
      if (guard.nearLand(g[0], g[1])) {
        const ox = g[0] - R.x, oy = g[1] - R.y, side = ox * nx + oy * ny, m = [g[0] - 2 * side * nx, g[1] - 2 * side * ny, g[2]];
        if (!guard.nearLand(m[0], m[1])) g = m;
      }
      g[2] = Math.max(g[2], guard.minAlt(g[0], g[1], R.x, R.y, tz));
      const gvNew = d.g && dt > 0 ? g.map((x, i) => (x - d.g[i]) / dt) : [0, 0, 0];
      d.gv = d.gv.map((x, i) => x + (gvNew[i] - x) * Math.min(1, dt * 4)); d.g = g;
      let vd = g.map((x, i) => d.gv[i] + K * (x - d.p[i]));
      for (const [mx, my] of obstacles) {   // keep clear of the towers, booms and sheaves (they reach ≈11 m up)
        const ex = d.p[0] - mx, ey = d.p[1] - my, r = Math.hypot(ex, ey);
        if (r < 7 && r > 1e-3 && d.p[2] < 12) { vd[0] += ex / r * (7 - r) * 3; vd[1] += ey / r * (7 - r) * 3; }
      }
      // terrain: climb before the bank (look-ahead along the velocity), whatever the framing asks for
      const T = guard.opt.ahead, px = d.p[0] + d.v[0] * T, py = d.p[1] + d.v[1] * T;
      const need = Math.max(guard.minAlt(d.p[0], d.p[1], R.x, R.y, tz), guard.minAlt(px, py, R.x, R.y, tz));
      if (d.p[2] < need) vd[2] = Math.max(vd[2], (need - d.p[2]) * 2.5);
      const sp = Math.hypot(...vd); if (sp > VMAX) vd = vd.map(x => x * VMAX / sp);
      const dv = vd.map((x, i) => x - d.v[i]), dm = Math.hypot(...dv), amax = AMAX * dt;
      d.v = d.v.map((x, i) => x + (dm > amax ? dv[i] * amax / dm : dv[i]));
      d.p = d.p.map((x, i) => x + d.v[i] * dt);
      // hard floor: never inside the ground, trees or bank buildings
      d.p[2] = Math.max(d.p[2], 1.0, guard.land(d.p[0], d.p[1]) ? guard.opt.sight : 0);
    }
    d.speed = Math.hypot(...d.v);
    const L = [lx, ly, lz];
    if (!d.look) d.look = L.slice(); else { const k = 1 - Math.exp(-dt / 0.2); d.look = d.look.map((x, i) => x + (L[i] - x) * k); }   // gimbal
    return { p: d.p, look: d.look };
  };
  return d;
}
if (typeof module !== 'undefined' && module.exports) module.exports = { createDrone, createDroneGuard };
