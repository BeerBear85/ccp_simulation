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
- **Obstacles**: layout "O" as revised in `analysis/CCP_detaljeret_analyse_2.html` (26 Sep 2026). Part ends read from Google Earth image 9628.jpg registered to the KML corners; types from the user (O2 rooftop rail + flat side plate, O3 self-built wedge; the UNIT Bump is left out, O4 kicker + wedge); sizes from the report's catalogue references where given (`Hsrc: 'cat'`), otherwise assumed. Profiles: kicker, wedge (planar, optionally tapered via `W0`), bump, rooftop, box, rail, funbox. Catalogue heights are not verified freeboard.
- **Feature contact**: the board is a rigid plank (`surfaceAt`): it rests on its two ends, which spreads a steep toe over the board length and puts the reaction ahead of the feet while the tail is off the feature. O3b's faces slope down to each side from a 0.4 m ridge (`ridge`).
- **Pitch in the air**: the forward/back pitch limits apply only while supported; in the air the rider holds the board level by swinging the legs under the body (`AIR_SWING_MAX`, `AIR_SWING_RATE`, `AIR_LEVEL`) and the pitch is judged at touchdown (`Landed on the nose/tail`). Calibrated so a ≈35° face is rideable above 30 km/h (validation step 12).
- **Rails and boxes** (from the rails report): off the water only contact, rail friction and the line act. Support exists while the board footprint overlaps the feature top, so a boardslide (Q/R on a rail) tolerates ≈ ±0.7 m of side drift and a 50-50 ≈ ±0.2 m. Balance torques are limited to the contact patch (automatic balance lean + 30 % of the player's lean). Being pulled off emerges from the line: v_req = (l̂·v_c)/(l̂·t); slower and the line tightens and pulls sideways, faster and it goes slack. HUD, charts and diagnostics show v_req, speed margin, side pull and offset.
- **Tricks**: nose/tail grabs (W/S) and spins (Q/R: pre-wind before the lip, then angular momentum). A 180 lands you switch.
- Fixed 240 Hz time step, live charts, energy bookkeeping.

All constants are in the `PHYS` block at the top of `src/physics.js`, with unit and source or assumption per line.

## Repository layout

| Path | Content |
|---|---|
| `src/physics.js` | Physics core (constants, layout, simulator). Runs in Node and in the browser. |
| `src/template.html` | UI, rendering and controls. `/*__PHYSICS__*/` is replaced by `physics.js` at build. |
| `build.py` | Builds `dist/copenhagen_cable_park_sim.html` (standalone) and `.frag.html` (artifact body). |
| `dist/` | Built simulator. |
| `tests/copenhagen_cable_park_sim_validation.js` | Headless validation against the physics report (straight case, edge manoeuvre, time-step convergence, energy residual, pop, sensitivity, starts, release limit, corners, wind, tricks, rails). |
| `analysis/` | CCP layout and obstacle analyses (source material). |
| `docs/` | "Physics and Simulation of a Cable-Park Wakeboard Rider" report. |

## Build and test

```bash
python3 build.py
python3 tests/test_build.py
node --test tests/simulation_lifecycle.test.js tests/build_smoke.test.js
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

## Limits

Obstacle positions carry ≈5–10 m uncertainty. No obstacle height is measured: catalogue heights are product heights, not freeboard above the water. Several parameters are assumed and marked as such in `PHYS`. The report's reference numbers come from an illustrative point-mass model, not measurements.
