# Copenhagen Cable Park Simulator

Interactive 3D physics simulator of the full-size cable at Copenhagen Cable Park (CCP), in one self-contained HTML file (Three.js from a CDN).

Open `dist/copenhagen_cable_park_sim.html` in a browser.

## What it models

- **Cable and carrier**: constant speed (20–35 km/h) on the 520 m loop from the user's KML polygon (T1–T6), counter-clockwise, with a compliant carrier hanger.
- **Cable**: deflects sideways and down under the line force as a taut string between the sheaves (pretension 20 kN assumed); stiff near a sheave, soft mid-span.
- **Line**: sags under its own weight; tension-only spring-damper, arm/body stroke that yields above ≈0.95 kN, adjustable release limit (default 1.5 kN).
- **Rider**: reduced-coordinate multi-body model. Knee-torque-limited legs (de Leva 1996 segments), fore–aft balance with ankle and hip strategies, arms that raise/lower the handle, pose-dependent inertia.
- **Board and water**: Savitsky planing with trim from moment balance, rocker, ITTC-57 friction, added mass and slamming, edge/sideslip, ventilation. Water surface with fetch-limited JONSWAP chop and the board's own wake.
- **Starts**: sliding (carpet dock) and jump start.
- **Obstacles**: layout OA–OI from `analysis/CCP_layout_rapport.html` (photos 1 Oct 2026, updated 3 Oct 2026): the report's group centres, axes and working sizes (L × W × max. height above the water, photo estimates). Shapes follow the report's text and 3D illustrations: OA rising rail, OB box with dark entry ramp + bump, OC cocks & balls (black-topped rail between two ramps), OD low rooftop, OE asymmetrical round-topped rooftop + joined bank with end/side approaches and a flat deck + small black round rail with its own entry ramp, OF three-section rail (up, level, down to ≈0.4 m) + white flat-top kicker on the left + black kicker on the right, both mid-rail, OG symmetric wedge with 0.4 m flat centre rail, OH black kicker, OI white kicker with a higher right top. Shape fields per part: `top` (straight-section top line), `ridge` + `edgeDrop` (flat top with sloped or chamfered sides), `W0` (taper), `Hl` (top tilted across), `color`/`topColor`/`accent`/`pipe` (appearance only). Part offsets inside a group are estimates from the illustrations. Towers are named TA–TF as in the report.
- **Feature contact**: the board is a rigid plank (`surfaceAt`): it rests on its two ends, which spreads a steep toe over the board length and puts the reaction ahead of the feet while the tail is off the feature. OG's faces slope down to each side from its 0.4 m flat centre rail (`ridge`); chamfered boxes use `ridge` + `edgeDrop`; OI's top tilts across (`Hl`).
- **Pitch in the air**: the forward/back pitch limits apply only while supported; in the air the rider holds the board level by swinging the legs under the body (`AIR_SWING_MAX`, `AIR_SWING_RATE`, `AIR_LEVEL`) and the pitch is judged at touchdown (`Landed on the nose/tail`). Calibrated so a ≈35° face is rideable above 30 km/h (validation step 12).
- **Rails and boxes** (from the rails report): off the water only contact, rail friction and the line act. Support exists while the board footprint overlaps the feature top, so a boardslide (Q/R on a rail) tolerates ≈ ±0.7 m of side drift and a 50-50 ≈ ±0.2 m. Balance torques are limited to the contact patch (automatic balance lean + 30 % of the player's lean). Being pulled off emerges from the line: v_req = (l̂·v_c)/(l̂·t); slower and the line tightens and pulls sideways, faster and it goes slack. HUD, charts and diagnostics show v_req, speed margin, side pull and offset.
- **Tricks**: nose/tail grabs (W/S) and spins (Q/R: pre-wind before the lip, then angular momentum). A 180 lands you switch.
- Fixed 240 Hz time step, live charts, energy bookkeeping.

All constants are in the `PHYS` block at the top of `src/physics.js`, with unit and source or assumption per line.

## Graphics

- **CopenHill**: reconstructed from the supplied model report, with staggered aluminium facade trays, rounded corners, green ski roof, paths, planting and twin chimney flues. See [model details and previews](docs/copenhill_model.md).

- **CCP hang-around area on land**: the connecting walkway follows the 103.48 m measurement in image 9935. A simple timber terrace, black hut, pale-roof clubhouse/annexes, picnic tables, bank seating and trees follow images 9932–9936. Open with `#hang-around` for a paused overview. The local shoreline is refined around the terrace; widths, buildings and heights remain visual estimates. See `docs/start_area_model.md`.

- **OE**: rebuilt from photos 9807, 9777, 9778, 9829 and 9743 as three joined assemblies. Select **OE detail** or open with `#oe` for a paused orbit view. Geometry and contact share the bank and rounded rail surfaces. Dimensions remain estimates; see `docs/oe_model.md`.

- **Control cabin, start and lounge**: reconstruction from the user's CCP photos and Google Earth views 9860–9864. The deck follows the through-jetty, with a road-side cabin, stepped seating, lattice mast, road access, two finger piers and a transverse walkway. Select **Start / lounge** for a paused orbit view, or open the simulator with `#start-area`. Dimensions are estimated; the launch retains its original world position, orientation and contact geometry independently of the deck. See `docs/start_area_model.md` for sources, assumptions and GLB export.

- **Obstacle decals and algae** (appearance only, from the layout report's illustrations): printed lettering on OC, OE, OF, OG, OH and OI in a plain bold typeface (not the brands' logo artwork), fitted inside each face; green-brown algae at the water line on every obstacle, drawn in the obstacle shader from height. Shapes, sizes, positions and contact are unchanged.
- **Sky and sun**: gradient sky with sun disc, halo and drifting clouds, drawn at the far plane in one pass. Sun from the south-west, 26° up (late afternoon); the directional light and fog match it.
- **Water**: Fresnel mix (scaled to 55 %, lake water is not a mirror) of the body colour and a softened planar reflection of the scene, blended 60/40 with the sky (mirror camera with an oblique near plane, as three.js `Reflector`), tiled ripple normals scaled with the wind, sun glitter, wake foam and the rider's shadow as a soft ellipse along the sun. With the reflection pass off, the water reflects the analytic sky.
- **Shadows**: one 1024² shadow map in a 24 m box that follows the rider; only the rider casts, the dock, jetty, obstacles and grass receive.
- **Surroundings**: irregular channel and adjoining industrial basin traced from the supplied plan views, scaled by the marked 256.97 m segment. Includes a dam with an open water passage, stone slopes, shore path, curved road, sloping-roof landmark, power plant and white tanks. Heights and unmeasured detail remain estimates; see `docs/ccp_surroundings_implementation.md`.
- **Quality** (Settings → Graphics quality): High (pixel ratio ≤ 2, reflection at ½ resolution, shadows), Medium (≤ 1.5, ⅓ resolution, shadows), Low (1, no reflection pass, no shadows). Auto starts at Medium on phones and High elsewhere and steps down one level after 3 s below ≈40 fps. A fixed choice is kept in `localStorage`.

## Repository layout

| Path | Content |
|---|---|
| `src/physics.js` | Physics core (constants, layout, simulator). Runs in Node and in the browser. |
| `src/surroundings.js` | Calibrated shoreline and visual environment; shared water/road data for start access. |
| `src/template.html` | UI, rendering and controls. `/*__PHYSICS__*/` is replaced by `physics.js` at build. |
| `src/vest_texture.jpg` | Print of the rider's vest (Follow, photo of the back); inlined as a data URI by `build.py`. |
| `src/face_texture.jpg` | The rider's face (photo of the user, cropped and feathered to skin colour); projected onto the front of the head, inlined by `build.py`. |
| `build.py` | Builds `dist/copenhagen_cable_park_sim.html` (standalone) and `.frag.html` (artifact body). |
| `dist/` | Built simulator. |
| `tests/demo_autopilot.test.js` | The drone-flyby demo rider rides three laps without a fall in 0, 4 and 8 m/s wind, lands a tail grab and a 360 and slides OA; round the corners and to OA he stays below 38 km/h, 8 m out at TD, with a peak line force below 1 kN and the line force at TA rising slower than 5 kN/s; free riding with `FREE_RIDE_CORNERS` stays below 38 km/h, 8 m out at TD and below 0.75 kN. |
| `tests/copenhagen_cable_park_sim_validation.js` | Headless validation against the physics report (straight case, edge manoeuvre, time-step convergence, energy residual, pop, sensitivity, starts, release limit, corners, wind, tricks, rails). |
| `analysis/` | CCP layout and obstacle analyses (source material). |
| `docs/` | "Physics and Simulation of a Cable-Park Wakeboard Rider" report. |

## Build and test

```bash
python3 build.py
python3 tests/test_build.py
node --test tests/simulation_lifecycle.test.js tests/build_smoke.test.js tests/oe_geometry.test.js tests/demo_autopilot.test.js
node tests/copenhagen_cable_park_sim_validation.js
```

On Windows, use `python` if `python3` is unavailable. The build reads and writes UTF-8 explicitly.
The physics validation imports `src/physics.js` directly and exits with an error on failed checks.
It checks finite state and non-negative tension at every step, steady planing, time-step convergence
(2% peak speed / 5% peak tension), a 5% energy-residual budget, starts, release, corners, wind,
tricks and rail exits. These are regression limits, not measured accuracy claims. The built-file
smoke test separately rejects stale artifacts and checks that their embedded physics matches source.

## Simulation setup and reset

`createSim(options)` owns an independent copy of its physics constants and layout. Supported options:
`physics` and `layout` (partial overrides), `cableKmh`, `wind`, `obstaclesOn`, `releaseN`,
`footShift`, `startMode` (`slide` or `jump`), and optional `initial` physical conditions.
Arrays in overrides replace the default arrays; they are copied, not shared between runs.

```js
const { createSim } = require('./src/physics.js');
const sim = createSim({
  wind: 0,
  obstaclesOn: false,
  physics: { DT: 1 / 480 },
});
sim.step();
sim.reset();
```

Construction and `reset()` use the same initialization path. Reset keeps live settings, clears
held simulation commands, run history, contact state and diagnostics, and returns time to zero
without taking a hidden physics step. The browser also clears its input and display history.
Run records such as `rider`, `line` and `out` are replaced; read them from `sim` after resetting.

For a headless scenario, pass `initial: { carrierS, rider: { x, y, z, vx, vy, vz, psi, ... } }`
to construction, or pass that same object to `sim.reset(initial)`. Rider fields are physical
positions, velocities, angles and pose values in the model's SI coordinates. Omitted fields
use the dock pose defaults. The simulator initializes the carrier, tow point, line geometry,
controls, contact memory and energy bookkeeping together. Custom scenarios disable the automatic
dock jump and extra start stroke. Forces/work start at zero and are evaluated on the first step.
Calling `reset()` again replays the copied scenario. `setStartMode('slide' | 'jump')` clears the
custom scenario; the following reset starts from the selected dock position.

## Controls

- ← / → (A/D): lean. ↑ / ↓: pop / crouch.
- W / S: nose / tail grab in the air. Q / R: spin left / right.
- Space: pause. `.`: single step.

## Drone flyby (demo)

**DRONE FLYBY** on the start screen (or `D` there, or the URL hash `#flyby`) starts a demo: a director camera
flies over the park while a demo rider runs the course on his own. The rider is `createAutopilot(sim)` in
`src/physics.js`; it sets only the player's inputs (lean, legs, spin, grab) and follows `DEMO_PLAN`: a popped
tail grab off the OC left ramp, a 360 to the right with a nose grab off the OI kicker (crossed 26° to the right) and a
boardslide on the OA rising rail. Each corner is ridden with the technique in `DEMO_CORNERS` (edge-out, set-up line
outside the cable, carve in), chosen so the largest line force over a lap is as small as possible (min-max) while the
rider stays at or below 38 km/h before and after the corners and on the run-up to OA (run-ups to jumps exempt):
≈0.95 kN at TA with a smooth last turn (rope slack ≈0.75 s, taking up at ≈3.5 kN/s), 8.4 m outside the cable at TD.
Without features, `FREE_RIDE_CORNERS` gives ≈0.72 kN at ≤38 km/h.
Analysis, trade-offs and limits: `docs/corner_minmax.md` (scripts in `tools/corner_minmax/`).
While the demo runs the cable speed is 30 km/h and
the release limit 2.5 kN (`DEMO_SETTINGS`); both are given back afterwards. Airtime plays in slow motion, tricks
are called out on screen, and after a fall the ride restarts by itself. The camera is one continuously flying drone with no cuts: it opens with a spiral sweep round the park that closes in
on the rider, then flies like a real drone (top speed 80 km/h, limited acceleration) between chase, orbit, side,
high, hover-ahead and low framings, keeping to the inside of the cable loop so its path is shorter than the rider's.
Ahead of each demo feature it flies to a vantage point beside the feature on the inside and films the trick from there.
Its speed is shown in the demo bar. Esc, a riding key or
**Take control** hands the rider to the player mid-ride.

## Limits

Obstacle positions carry ≈5–10 m uncertainty. No obstacle size is measured: the report's dimensions are photo estimates, and the layout of parts inside a group (e.g. OF's section lengths) is read from generated illustrations. Several parameters are assumed and marked as such in `PHYS`. The report's reference numbers come from an illustrative point-mass model, not measurements.
