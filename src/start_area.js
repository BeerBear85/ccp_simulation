/* CCP start area reconstructed from the user's photos of 1 October 2026.
 * SI metres; local x follows the through-jetty, local z points towards the lounge.
 * Dimensions/registration are estimates, not a survey. See docs/start_area_model.md.
 * The launch surface uses PHYS exactly; all other geometry is scenery only.
 */
function createStartArea(THREE, P, layout) {
  const root = new THREE.Group(); root.name = 'CCP_control_start_lounge';
  // Google Earth 9860 (plan) + 9861–9864 (oblique): deck/access spine is
  // parallel to the jetty towards TB, independently of the launch carpet.
  const j1 = layout.jetty[1], j2 = layout.jetty[2];
  const yaw = Math.atan2(j2[1] - j1[1], j2[0] - j1[0]);
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const local = (x, y, h = 0.75) => {
    const dx = x - P.DOCK_C[0], dz = -y + P.DOCK_C[1]; return [c * dx - s * dz, h, s * dx + c * dz];
  };
  const world = (x, z) => [P.DOCK_C[0] + c * x + s * z, P.DOCK_C[1] + s * x - c * z];
  const launchYaw = Math.atan2(P.DOCK_DIR[1], P.DOCK_DIR[0]) - yaw;
  const launchPoint = (x, z, h) => [Math.cos(launchYaw) * x + Math.sin(launchYaw) * z, h, -Math.sin(launchYaw) * x + Math.cos(launchYaw) * z];
  root.userData = { source: 'CCP photos 9763, 9800, 9801, 9839; Google Earth 9860–9864', accuracy: 'Photo-based approximation; not surveyed', units: 'metres', deckYaw: yaw, bridges: [] };
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
  // Cabin projects from the water-side corner; no second broad mast platform.
  plankSurface(deck, -5.4, 0.72, 3.8, 3.16, 0.75);
  for (const x of [-7.15, -3.65]) for (const z of [-0.7, 2.15])
    beam(deck, [x, -0.95, z], [x, 0.65, z], 0.15, timber[3]);
  for (const z of [-0.78, 2.25]) box(deck, -5.4, 0.5, z, 3.9, 0.32, 0.16, timber[3]);
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
  // 9763/9800: a long, broad queue ramp descends ALONG the deck, from the
  // lounge end to the low start podium beside the operator. Not a short cross-ramp.
  const qa = launchPoint(-h2, P.DOCK_HALF_W, P.DOCK_TOP);
  const qb = launchPoint(h2 - P.DOCK_RAMP, P.DOCK_HALF_W, P.DOCK_TOP);
  const highOuter = [7.2, 0.75, qb[2]], highInner = [7.2, 0.75, 2.3];
  const lowInner = [qa[0], P.DOCK_TOP, 2.3];
  // The upper end opens onto a full-width timber landing (visible in 9763).
  // This makes the blue ramp a recess along the deck edge, not a projecting flap.
  plankSurface(deck, (7.2 + 11.5) / 2, (qb[2] + 2.3) / 2, 11.5 - 7.2, 2.3 - qb[2], 0.75);
  box(deck, 9.35, 0.5, qb[2] + 0.07, 4.3, 0.32, 0.14, timber[3]);
  for (const x of [7.32, 11.35]) beam(deck, [x, -0.95, qb[2]+0.15], [x, 0.65, qb[2]+0.15], 0.14, timber[3]);
  function slab(parent, points, thickness) {
    const triangles = THREE.ShapeUtils.triangulateShape(points.map(p => new THREE.Vector2(p[0], p[2])), []);
    const top = [], shell = [];
    for (const [ia, ib, ic] of triangles) {
      const a = points[ia], b = points[ib], c = points[ic];
      // Shape triangulation is CCW in x/z; reverse it for upward-facing y normals.
      top.push(...a, ...c, ...b);
      shell.push(a[0], a[1]-thickness, a[2], ...b.map((v,i)=>i===1?v-thickness:v), ...c.map((v,i)=>i===1?v-thickness:v));
    }
    for (let i = 0; i < points.length; i++) {
      const a = points[i], b = points[(i + 1) % points.length];
      const ad = [a[0], a[1]-thickness, a[2]], bd = [b[0], b[1]-thickness, b[2]];
      shell.push(...a, ...b, ...bd, ...a, ...bd, ...ad);
    }
    for (const [vertices, mat] of [[top, blue], [shell, float]]) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      const uv = []; for (let i = 0; i < vertices.length; i += 3) uv.push(vertices[i] / 8, vertices[i + 2] / 3);
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
      mesh(parent, g, mat);
    }
  }
  slab(queue, [qa, qb, highOuter, highInner, lowInner], 0.12);
  // Low landing extends towards the cabin; the simulated launch surface stays
  // at its original position on the water-side of this landing.
  const landing = group('Low blue landing beside cabin - visual only');
  const upstream = launchPoint(-h2, -P.DOCK_HALF_W, P.DOCK_TOP);
  slab(landing, [[-3.5, P.DOCK_TOP, upstream[2]], upstream, qa, lowInner, [-3.5, P.DOCK_TOP, 2.3]], 0.16);
  beam(queue, lowInner.map((v,i)=>i===1?v+0.04:v), highInner.map((v,i)=>i===1?v+0.04:v), 0.035, timber[1]);
  beam(queue, qb, highOuter, 0.025, steel);
  root.userData.accessRamp = { low: [qa, qb], high: [highOuter, highInner], length: 7.2 - (qa[0]+qb[0])/2, drop: 0.75 - P.DOCK_TOP };
  // Leave a two-metre opening onto the transverse walkway beside the seats.
  for (const [x0, x1] of [[-5.9, -4.1], [-1.9, -0.2]]) {
    for (const x of [x0, x1]) beam(detail, [x, 0.75, 9.65], [x, 1.75, 9.65], 0.035, steel);
    for (let i = 0; i < 12; i++) {
      const u = i / 12, v = (i + 1) / 12;
      beam(detail, [x0 + (x1 - x0) * u, 1.65 - 0.2 * Math.sin(Math.PI * u), 9.65],
        [x0 + (x1 - x0) * v, 1.65 - 0.2 * Math.sin(Math.PI * v), 9.65], 0.018, rope);
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
  // Connected walkways: road spine, two water-side fingers, continuation towards
  // TB and the long perpendicular branch. Ends meet deck edges, never run across it.
  const bridges = group('Connected access walkways');
  function walkway(name, a, b, width = 2, railings = false, openings = []) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const horizontal = Math.hypot(d.x, d.z), n = Math.ceil(horizontal / 0.23);
    const segment = new THREE.Group(); bridges.add(segment);
    segment.position.copy(A).add(B).multiplyScalar(0.5);
    segment.rotation.y = -Math.atan2(d.z, d.x);
    segment.rotation.z = Math.atan2(d.y, horizontal);
    for (let i = 0; i < n; i++) box(segment, -d.length() / 2 + (i + 0.5) * d.length() / n, -0.045, 0,
      d.length() / n - 0.006, 0.09, width, timber[i % 4]);
    for (const z of [-width / 2 + 0.08, width / 2 - 0.08]) box(segment, 0, -0.20, z, d.length(), 0.3, 0.14, timber[3]);
    const bays = Math.max(1, Math.ceil(horizontal / 3.2));
    for (let k = 0; k <= bays; k++) {
      const u = k / bays, v = A.clone().lerp(B, u), nx = -d.z / horizontal, nz = d.x / horizontal;
      for (const sign of [-1, 1]) {
        const x = v.x + sign * nx * (width / 2 - 0.15), z = v.z + sign * nz * (width / 2 - 0.15);
        beam(bridges, [x, -0.8, z], [x, v.y - 0.1, z], 0.085, timber[3]);
        if (railings && !(sign === 1 && openings.some(gapX => Math.abs(x - gapX) < 1.1)))
          beam(bridges, [x, v.y, z], [x, v.y + 0.95, z], 0.028, steel);
      }
    }
    if (railings) for (const sign of [-1, 1]) {
      const nx = -d.z / horizontal * (width / 2 - 0.15) * sign, nz = d.x / horizontal * (width / 2 - 0.15) * sign;
      for (let k = 0; k < bays; k++) for (let t = 0; t < 6; t++) {
        const u = (k + t / 6) / bays, v = (k + (t + 1) / 6) / bays;
        const p = A.clone().lerp(B, u), q = A.clone().lerp(B, v);
        if (sign === 1 && openings.some(gapX => Math.abs((p.x + q.x) / 2 - gapX) < 1.1)) continue;
        beam(bridges, [p.x + nx, p.y + 0.87 - 0.12 * Math.sin(t / 6 * Math.PI), p.z + nz],
          [q.x + nx, q.y + 0.87 - 0.12 * Math.sin((t + 1) / 6 * Math.PI), q.z + nz], 0.015, rope);
      }
    }
    root.userData.bridges.push({ name, a, b, width, worldA: world(a[0], a[2]), worldB: world(b[0], b[2]) });
  }
  // Intersect the access spine with the existing shoreline/road instead of
  // terminating an arbitrary bridge endpoint in the water (the previous bug).
  const spineZ = 5.0;
  function spineIntersection(polyline, edgeInset = 0) {
    const hits = [];
    for (let i = 1; i < polyline.length; i++) {
      const a = local(...polyline[i - 1]), b = local(...polyline[i]);
      if (Math.abs(b[2] - a[2]) < 1e-8) continue;
      const t = (spineZ - a[2]) / (b[2] - a[2]);
      const x = a[0] + t * (b[0] - a[0]);
      // Shift a road-centre intersection to its near edge, accounting for angle.
      const edgeOffset = edgeInset * Math.hypot(b[0] - a[0], b[2] - a[2]) / Math.abs(b[2] - a[2]);
      if (t >= 0 && t <= 1 && x < -6.5) hits.push(x + edgeOffset);
    }
    if (!hits.length) throw new Error('Start-area access spine does not intersect its mapped shoreline/road');
    return Math.max(...hits);
  }
  const shoreX = spineIntersection([...layout.water, layout.water[0]]);
  const roadX = spineIntersection(layout.surroundings.roads[0].pts, layout.surroundings.roads[0].w / 2);
  walkway('Road access over water', [-6.5, 0.75, spineZ], [shoreX + 1.2, 0.75, spineZ], 2.2, true, [-16.5, shoreX + 5.5]);
  // Rise before reaching the bank: the land surface is 0.8 m high.
  walkway('Bank transition ramp', [shoreX + 1.2, 0.75, spineZ], [shoreX, 0.91, spineZ], 2.2, true);
  walkway('Shore approach to road', [shoreX, 0.91, spineZ], [roadX, 0.89, spineZ], 2.2, true);
  walkway('Inner finger pier', [-16.5, 0.75, spineZ - 1.1], [-16.5, 0.75, -9], 1.8);
  walkway('Shore-side finger pier', [shoreX + 5.5, 0.75, spineZ - 1.1], [shoreX + 5.5, 0.75, -9], 1.8);
  const end = local(...j2), cross = local(...layout.jettyLand[1]), junction = local(...j1);
  walkway('Through-jetty towards TB', [11.5, 0.75, junction[2]], end, 2.4);
  walkway('Long transverse walkway', [-3, 0.75, 9.8], cross, 2.0);
  root.userData.access = { spineZ, shoreX, roadX };
  if (layout) {
    const mast = group('Start mast - lattice and drive'), column = group('Start mast - single anchored column');
    const m = layout.masts[0], w = layout.wheels[0];
    const ox = w[0] - m.x, oy = w[1] - m.y, length = Math.hypot(ox, oy);
    const ax = m.x + ox * 0.5, ay = m.y + oy * 0.5, H = P.MAST_HEIGHT + 1.5;
    function lattice(parent, a, b, width, count) {
      const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), dir = B.clone().sub(A).normalize();
      const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 0, 1)).normalize().multiplyScalar(width / 2);
      const other = new THREE.Vector3().crossVectors(dir, side).normalize().multiplyScalar(width / 2);
      const offsets = [side.clone().add(other), side.clone().sub(other), side.clone().negate().sub(other), side.clone().negate().add(other)];
      for (const off of offsets) beam(parent, A.clone().add(off).toArray(), B.clone().add(off).toArray(), 0.038, steel);
      for (let i = 0; i < count; i++) for (let j = 0; j < 4; j++) {
        const p = A.clone().lerp(B, i / count), q = A.clone().lerp(B, (i + 1) / count);
        beam(parent, p.clone().add(offsets[j]).toArray(), q.clone().add(offsets[(j + 1) % 4]).toArray(), 0.017, steel);
        beam(parent, p.clone().add(offsets[j]).toArray(), p.clone().add(offsets[(j + 1) % 4]).toArray(), 0.022, steel);
      }
    }
    // 9801/9839: ONE raked lattice column, anchored at the water end of the
    // inner finger pier, not two A-frame legs standing on the lounge deck.
    const foot = local(m.x, m.y, 0.9);
    const foundation = group('Single mast foot at inner finger pier');
    box(foundation, foot[0], 0.79, foot[2], 0.95, 0.08, 0.95, steel);
    beam(foundation, [foot[0], -0.9, foot[2]], [foot[0], 0.8, foot[2]], 0.22, dark);
    for (const dx of [-0.34, 0.34]) for (const dz of [-0.34, 0.34])
      beam(foundation, [foot[0]+dx,0.81,foot[2]+dz], [foot[0]+dx,0.9,foot[2]+dz], 0.035, steel);
    lattice(column, foot, local(ax, ay, H), 0.64, 14);
    // The boom connects to the inclined column at its actual height, below the apex.
    const joinH = P.MAST_HEIGHT + 0.4, tJoin = (joinH - foot[1]) / (H - foot[1]);
    const joinX = m.x + (ax - m.x) * tJoin, joinY = m.y + (ay - m.y) * tJoin;
    lattice(mast, local(joinX, joinY, joinH), local(w[0], w[1], P.MAST_HEIGHT), 0.5, 10);
    root.userData.startMast = { foot, footWorld: [m.x,m.y], mainColumns: 1, footingCount: 1 };
    for (const sign of [-1, 1]) beam(mast, local(ax, ay, H + 0.2), local(w[0], w[1] + sign * 0.5, P.MAST_HEIGHT), 0.013, steel);
    beam(mast, local(w[0], w[1], P.MAST_HEIGHT), local(w[0], w[1], P.CABLE_HEIGHT), 0.09, steel);
    const wheel = mesh(mast, new THREE.TorusGeometry(P.WHEEL_RADIUS, 0.08, 8, 32), black, ...local(w[0], w[1], P.CABLE_HEIGHT)); wheel.rotation.x = Math.PI / 2;
    const drive = local(w[0], w[1], P.MAST_HEIGHT + 0.24);
    box(mast, drive[0], drive[1], drive[2], 1.6, 0.45, 1.2, roof);
    box(mast, drive[0] - 0.38, drive[1] + 0.37, drive[2], 0.56, 0.4, 0.5, steel);
    for (const dx of [-0.9, 0.9]) for (const dz of [-0.7, 0.7]) beam(mast, [drive[0] + dx, drive[1], drive[2] + dz], [drive[0] + dx, drive[1] + 1.05, drive[2] + dz], 0.025, steel);
    for (const dz of [-0.7, 0.7]) beam(mast, [drive[0] - 0.9, drive[1] + 1.05, drive[2] + dz], [drive[0] + 0.9, drive[1] + 1.05, drive[2] + dz], 0.025, steel);
    const points = [[-6.85, 3.05, 0.65], local(m.x + ox * 0.17, m.y + oy * 0.17, 4.0), local(ax, ay, H)];
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
  // Cabin is at the road-end, water-side corner, as in all five Earth views.
  cabin.position.set(-0.95, 0, -1.95);
  // Rotate only the physical launch surface back to its original world frame.
  launch.rotation.y = launchYaw;
  root.position.set(P.DOCK_C[0], 0, -P.DOCK_C[1]);
  root.rotation.y = yaw;
  return root;
}

if (typeof module !== 'undefined' && module.exports) module.exports = { createStartArea };
