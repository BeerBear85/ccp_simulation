/* CCP start area reconstructed from the user's photos of 1 October 2026.
 * SI metres; local x follows DOCK_DIR, local z points towards the lounge.
 * Dimensions/registration are estimates, not a survey. See docs/start_area_model.md.
 * The launch surface uses PHYS exactly; all other geometry is scenery only.
 */
function createStartArea(THREE, P, layout) {
  const root = new THREE.Group(); root.name = 'CCP_control_start_lounge';
  root.userData = { source: 'CCP photos 2026-10-01', accuracy: 'Photo-based approximation; not surveyed', units: 'metres' };
  const material = (name, color, roughness = 0.85, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness }); m.name = name; return m;
  };
  const timber = [0x898477, 0x827c70, 0x989082, 0x777568].map((c, i) => material('Weathered timber ' + i, c));
  const dark = material('Black vertical cladding', 0x252b2c);
  const seams = material('Cladding battens', 0x363b3a);
  const roof = material('Dark roof flashing', 0x45494a, 0.72, 0.2);
  const steel = material('Galvanised steel', 0xa0a7a6, 0.5, 0.5);
  const blue = material('Blue start carpet', 0x124ae0);
  const float = material('Pontoon edge', 0x353e43);
  const glass = material('Smoky cabin windows', 0x394e58, 0.24, 0.25);
  const white = material('Off white', 0xe0e1d6);
  const black = material('Rubber and equipment', 0x171d20);
  const orange = material('Orange cable sleeve', 0xe07836);
  const rope = material('Pale rope', 0xc8c6b6);
  const groups = {};
  function group(name) { const g = new THREE.Group(); g.name = name; root.add(g); groups[name] = g; return g; }
  const deck = group('Timber deck and piles'), cabin = group('Control cabin'), seats = group('Stepped lounge seating');
  const launch = group('Start carpet - physics surface'), queue = group('Blue access apron - visual only');
  const detail = group('Railings and equipment');
  function mesh(parent, geometry, mat, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geometry, mat); m.position.set(x, y, z); m.receiveShadow = true; parent.add(m); return m;
  }
  function box(parent, x, y, z, w, h, d, mat) { return mesh(parent, new THREE.BoxGeometry(w, h, d), mat, x, y, z); }
  function beam(parent, a, b, radius, mat) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const m = mesh(parent, new THREE.CylinderGeometry(radius, radius, A.distanceTo(B), 8), mat);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.sub(A).normalize()); return m;
  }
  function plankSurface(parent, x, z, width, depth, top, salt = 0) {
    const n = Math.ceil(width / 0.19), pitch = width / n;
    for (let i = 0; i < n; i++) box(parent, x - width / 2 + (i + 0.5) * pitch, top - 0.045, z,
      pitch - 0.007, 0.09, depth, timber[(i * 7 + salt) % timber.length]);
  }
  // A broad deck behind the start, with the open water edge kept free of rails.
  plankSurface(deck, 2.5, 6.05, 18, 7.5, 0.75);
  plankSurface(deck, -6.2, 0.9, 4.5, 2.8, 0.75);
  for (const x of [-8.3, -4.1]) for (const z of [-0.35, 2.15])
    beam(deck, [x, -0.95, z], [x, 0.65, z], 0.15, timber[3]);
  for (const z of [-0.45, 2.25]) box(deck, -6.2, 0.5, z, 4.6, 0.32, 0.16, timber[3]);
  for (const z of [2.35, 6.0, 9.7]) {
    box(deck, 2.5, 0.49, z, 18.1, 0.34, 0.18, timber[3]);
    for (const x of [-6.25, -3.4, -0.5, 2.4, 5.3, 8.2, 11.25])
      beam(deck, [x, -0.95, z], [x, 0.58, z], 0.14, timber[3]);
  }
  for (const x of [-6.45, 11.45]) box(deck, x, 0.52, 6.05, 0.18, 0.34, 7.6, timber[3]);
  // Three banks of bleacher-like timber seats visible along the outer edge.
  for (let bank = 0; bank < 3; bank++) {
    const x = 2.5 + bank * 3.05;
    for (let step = 0; step < 3; step++) {
      const z = 7.35 + step * 0.76, top = 0.75 + (step + 1) * 0.38;
      box(seats, x, (top + 0.75) / 2, z, 2.85, top - 0.75, 0.74, timber[3]);
      plankSurface(seats, x, z, 2.86, 0.75, top, bank + step);
      for (let r = 0; r <= step; r++) box(seats, x, 0.92 + r * 0.38, z - 0.382, 2.86, 0.34, 0.025, timber[(bank + r) % 4]);
    }
    box(seats, x, 1.85, 9.38, 2.9, 0.9, 0.12, timber[1]);
    for (const sx of [-1.3, 1.3]) box(seats, x + sx, 1.55, 9.45, 0.1, 1.65, 0.1, timber[3]);
  }
  // Low operator hut, not a tall observation tower. Open service bay faces the start.
  const cx = -4.45, cz = 2.63, floor = 0.75, top = 3.45;
  box(cabin, cx, floor + 0.045, cz, 3.0, 0.09, 3.05, timber[3]);
  box(cabin, cx, 2.1, 4.12, 3.0, 2.7, 0.12, dark);
  box(cabin, -5.89, 2.1, cz, 0.12, 2.7, 3.0, dark);
  // Front facade is built around two real window openings.
  box(cabin, cx, 1.36, 1.14, 3, 1.22, 0.12, dark);
  box(cabin, cx, 3.15, 1.14, 3, 0.6, 0.12, dark);
  for (const x of [-5.76, -4.47, -3.13]) box(cabin, x, 2.41, 1.14, 0.28, 0.88, 0.12, dark);
  for (const x of [-5.12, -3.81]) {
    box(cabin, x, 2.41, 1.115, 1.03, 0.82, 0.13, steel);
    box(cabin, x, 2.41, 1.035, 0.91, 0.70, 0.035, glass);
  }
  // Right wall: doorway towards the rear, waist-high operator counter at the front.
  box(cabin, -2.99, 3.2, cz, 0.12, 0.5, 3.0, dark);
  box(cabin, -2.99, 1.2, 1.86, 0.12, 0.9, 1.5, dark);
  box(cabin, -2.99, 2.1, 4.02, 0.12, 2.7, 0.3, dark);
  box(cabin, -2.99, 2.1, 2.74, 0.1, 2.7, 0.12, steel);
  box(cabin, -2.85, 1.69, 1.86, 0.65, 0.09, 1.58, timber[3]);
  box(cabin, -3.46, 1.76, 1.92, 0.50, 0.16, 0.6, roof);
  box(cabin, -3.58, 2.03, 1.97, 0.08, 0.35, 0.46, black);
  box(cabin, -3.53, 2.04, 1.97, 0.012, 0.27, 0.36, glass);
  for (let i = 0; i < 4; i++) box(cabin, -3.27, 1.852, 1.75 + i * 0.1, 0.055, 0.025, 0.055, i === 0 ? orange : white);
  // Open door, swung out along the rear edge; no fake dark solid box interior.
  const door = box(cabin, -2.42, 1.88, 3.76, 1.05, 2.25, 0.09, dark); door.rotation.y = -0.25;
  box(cabin, -2.05, 1.84, 3.65, 0.07, 0.12, 0.06, steel);
  for (let i = 0; i < 21; i++) {
    const x = cx - 1.45 + i * 0.145;
    box(cabin, x, 2.1, 4.19, 0.025, 2.7, 0.025, seams);
    box(cabin, x, 1.36, 1.065, 0.025, 1.2, 0.025, seams);
  }
  for (let i = 0; i < 21; i++) box(cabin, -5.965, 2.1, 1.15 + i * 0.145, 0.025, 2.7, 0.025, seams);
  box(cabin, cx + 0.12, top + 0.04, cz - 0.08, 3.55, 0.13, 3.45, roof);
  // Small window high on the rear facade and the white sponsor panel on the end.
  box(cabin, -4.65, 2.81, 4.21, 0.8, 0.38, 0.045, white);
  box(cabin, -4.65, 2.81, 4.24, 0.67, 0.25, 0.018, glass);
  box(cabin, -5.99, 2.59, 2.6, 0.035, 0.50, 2.50, white);
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 192;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#e5e6dd'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#20272a'; ctx.font = 'bold 110px Arial'; ctx.textAlign = 'center'; ctx.fillText('CITY LIFT A/S', 512, 135);
    const map = new THREE.CanvasTexture(c); map.encoding = THREE.sRGBEncoding;
    const sign = mesh(cabin, new THREE.PlaneGeometry(2.45, 0.46), new THREE.MeshBasicMaterial({ map }), -6.013, 2.59, 2.6);
    sign.rotation.y = -Math.PI / 2;
  }
  // Exact existing contact surface. Its colour is corrected from green to photo blue.
  const h2 = P.DOCK_LEN / 2, flatLength = P.DOCK_LEN - P.DOCK_RAMP, width = 2 * P.DOCK_HALF_W;
  box(launch, -h2 + flatLength / 2, P.DOCK_TOP - 0.2, 0, flatLength, 0.35, width, float);
  box(launch, -h2 + flatLength / 2, P.DOCK_TOP - 0.02, 0, flatLength, 0.04, width, blue);
  const drop = P.DOCK_TOP + 0.15;
  const ramp = box(launch, h2 - P.DOCK_RAMP / 2, P.DOCK_TOP - drop / 2 - 0.02, 0,
    Math.hypot(P.DOCK_RAMP, drop), 0.04, width, blue);
  ramp.rotation.z = -Math.atan2(drop, P.DOCK_RAMP);
  // Broad blue waiting/access apron rises to the timber deck behind the launch strip.
  const apronDepth = 2.3 - P.DOCK_HALF_W, rise = 0.75 - P.DOCK_TOP;
  const apron = box(queue, -0.6, P.DOCK_TOP + rise / 2 - 0.025, P.DOCK_HALF_W + apronDepth / 2,
    3.6, 0.05, Math.hypot(apronDepth, rise), blue); apron.rotation.x = -Math.atan2(rise, apronDepth);
  // Slim timber edging at the water side.
  beam(queue, [-2.4, P.DOCK_TOP, 0.84], [-2.4, 0.75, 2.3], 0.035, timber[1]);
  // Rope railing only at the back approach, leaving the lounge and start edge open.
  for (const x of [-5.9, -3.5, -1.1]) beam(detail, [x, 0.75, 9.65], [x, 1.75, 9.65], 0.035, steel);
  for (let j = 0; j < 2; j++) {
    const x0 = -5.9 + j * 2.4;
    for (let i = 0; i < 12; i++) {
      const u = i / 12, v = (i + 1) / 12;
      beam(detail, [x0 + 2.4 * u, 1.65 - 0.2 * Math.sin(Math.PI * u), 9.65],
        [x0 + 2.4 * v, 1.65 - 0.2 * Math.sin(Math.PI * v), 9.65], 0.018, rope);
    }
  }
  // Equipment resting against the lounge, visible in the source photographs.
  for (let i = 0; i < 3; i++) {
    const board = new THREE.Group(); detail.add(board); board.position.set(0.7 + i * 0.56, 1.42, 6.7); board.rotation.x = -0.2;
    box(board, 0, 0, 0, 0.39, 1.22, 0.035, i === 1 ? blue : white);
    for (const y of [-0.64, 0.64]) { const tip = mesh(board, new THREE.CylinderGeometry(0.195, 0.195, 0.035, 16), i === 1 ? blue : white, 0, y, 0); tip.rotation.x = Math.PI / 2; }
    for (const y of [-0.27, 0.27]) box(board, 0, y, -0.09, 0.16, 0.22, 0.15, black);
  }
  box(detail, 6.2, 1.23, 7.28, 0.58, 0.20, 0.38, black);
  beam(detail, [10.8, 0.75, 9.1], [10.8, 4.1, 9.1], 0.07, timber[3]);
  if (layout) {
    const mast = group('Start mast - lattice and drive'), m = layout.masts[0], w = layout.wheels[0];
    const ox = w[0] - m.x, oy = w[1] - m.y, length = Math.hypot(ox, oy);
    const theta = Math.atan2(P.DOCK_DIR[1], P.DOCK_DIR[0]), c = Math.cos(theta), s = Math.sin(theta);
    const local = (x, y, h) => { const dx = x - P.DOCK_C[0], dz = -y + P.DOCK_C[1]; return [c * dx - s * dz, h, s * dx + c * dz]; };
    const ax = m.x + ox * 0.5, ay = m.y + oy * 0.5, H = P.MAST_HEIGHT + 1.5;
    function lattice(a, b, width, count) {
      const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), dir = B.clone().sub(A).normalize();
      const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 0, 1)).normalize().multiplyScalar(width / 2);
      const other = new THREE.Vector3().crossVectors(dir, side).normalize().multiplyScalar(width / 2);
      const offsets = [side.clone().add(other), side.clone().sub(other), side.clone().negate().sub(other), side.clone().negate().add(other)];
      for (const off of offsets) beam(mast, A.clone().add(off).toArray(), B.clone().add(off).toArray(), 0.038, steel);
      for (let i = 0; i < count; i++) for (let j = 0; j < 4; j++) {
        const p = A.clone().lerp(B, i / count), q = A.clone().lerp(B, (i + 1) / count);
        beam(mast, p.clone().add(offsets[j]).toArray(), q.clone().add(offsets[(j + 1) % 4]).toArray(), 0.017, steel);
        beam(mast, p.clone().add(offsets[j]).toArray(), p.clone().add(offsets[(j + 1) % 4]).toArray(), 0.022, steel);
      }
    }
    const sx = -oy / length * 2.2, sy = ox / length * 2.2;
    for (const sign of [-1, 1]) lattice(local(m.x + sign * sx, m.y + sign * sy, 0.8), local(ax, ay, H), 0.32, 12);
    lattice(local(ax, ay, P.MAST_HEIGHT + 0.4), local(w[0], w[1], P.MAST_HEIGHT), 0.62, 10);
    for (const sign of [-1, 1]) beam(mast, local(ax, ay, H + 0.2), local(w[0], w[1] + sign * 0.5, P.MAST_HEIGHT), 0.013, steel);
    beam(mast, local(w[0], w[1], P.MAST_HEIGHT), local(w[0], w[1], P.CABLE_HEIGHT), 0.09, steel);
    const wheel = mesh(mast, new THREE.TorusGeometry(P.WHEEL_RADIUS, 0.08, 8, 32), black, ...local(w[0], w[1], P.CABLE_HEIGHT)); wheel.rotation.x = Math.PI / 2;
    const drive = local(w[0], w[1], P.MAST_HEIGHT + 0.24);
    box(mast, drive[0], drive[1], drive[2], 1.6, 0.45, 1.2, roof);
    box(mast, drive[0] - 0.38, drive[1] + 0.37, drive[2], 0.56, 0.4, 0.5, steel);
    for (const dx of [-0.9, 0.9]) for (const dz of [-0.7, 0.7]) beam(mast, [drive[0] + dx, drive[1], drive[2] + dz], [drive[0] + dx, drive[1] + 1.05, drive[2] + dz], 0.025, steel);
    for (const dz of [-0.7, 0.7]) beam(mast, [drive[0] - 0.9, drive[1] + 1.05, drive[2] + dz], [drive[0] + 0.9, drive[1] + 1.05, drive[2] + dz], 0.025, steel);
    const points = [[-5.9, 3.05, 4.25], local(m.x + ox * 0.17, m.y + oy * 0.17, 4.0), local(ax, ay, H)];
    const conduit = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    mesh(mast, new THREE.TubeGeometry(conduit, 32, 0.085, 8, false), orange);
    for (const sign of [-1, 1]) beam(mast, local(ax, ay, H), local(m.x - ox / length * 9 + sign * 1.5, m.y - oy / length * 9, 0.8), 0.013, steel);
  }
  // Batch static geometry per component/material: detailed planks without hundreds of draw calls.
  for (const parent of Object.values(groups)) {
    const buckets = new Map(); parent.updateMatrixWorld(true);
    parent.traverse(o => {
      if (!o.isMesh) return;
      const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
      if (!buckets.has(o.material)) buckets.set(o.material, []); buckets.get(o.material).push(g);
    });
    const old = []; parent.traverse(o => { if (o.isMesh) old.push(o.geometry); }); parent.clear();
    for (const [mat, geometries] of buckets) {
      const g = new THREE.BufferGeometry();
      for (const attr of ['position', 'normal', 'uv']) {
        const arrays = geometries.map(geo => geo.getAttribute(attr).array), data = new Float32Array(arrays.reduce((n, a) => n + a.length, 0));
        let offset = 0; for (const a of arrays) { data.set(a, offset); offset += a.length; }
        g.setAttribute(attr, new THREE.BufferAttribute(data, attr === 'uv' ? 2 : 3));
      }
      const m = mesh(parent, g, mat); m.name = parent.name + ' / ' + mat.name;
      for (const geo of geometries) geo.dispose();
    }
    for (const geo of old) geo.dispose();
  }
  // Keep the cabin behind the existing mast feet; its absolute registration is estimated.
  cabin.position.z = 1.65;
  root.position.set(P.DOCK_C[0], 0, -P.DOCK_C[1]);
  root.rotation.y = Math.atan2(P.DOCK_DIR[1], P.DOCK_DIR[0]);
  return root;
}

if (typeof module !== 'undefined' && module.exports) module.exports = { createStartArea };
