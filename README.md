# Copenhagen Cable Park Simulator

Interactive 3D physics simulator of the full-size cable at Copenhagen Cable Park (CCP), in one self-contained HTML file (Three.js from a CDN).

Open `dist/copenhagen_cable_park_sim.html` in a browser.

## What it models

- **Cable and carrier**: constant speed (20–35 km/h) on the 520 m loop from the user's KML polygon (T1–T6), counter-clockwise, with a compliant carrier hanger.
- **Line**: tension-only spring-damper, arm/body stroke that yields above ≈0.95 kN, adjustable release limit (default 1.5 kN).
- **Rider**: reduced-coordinate multi-body model. Knee-torque-limited legs (de Leva 1996 segments), fore–aft balance with ankle and hip strategies, arms that raise/lower the handle, pose-dependent inertia.
- **Board and water**: Savitsky planing with trim from moment balance, rocker, ITTC-57 friction, added mass and slamming, edge/sideslip, ventilation. Water surface with fetch-limited JONSWAP chop and the board's own wake.
- **Starts**: sliding (carpet dock), jump and sitting start.
- **Obstacles**: layout "O" (Google Earth standard layer, 2023) from `analysis/CCP_obstacle_analyse.html`, with sub-contours and axes. Heights and types are assumptions.
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
| `tests/copenhagen_cable_park_sim_validation.js` | Headless validation against the physics report (straight case, edge manoeuvre, time-step convergence, energy residual, pop, sensitivity, starts, release limit, corners, wind, tricks). |
| `analysis/` | CCP layout and obstacle analyses (source material). |
| `docs/` | "Physics and Simulation of a Cable-Park Wakeboard Rider" report. |

## Build and test

```bash
python3 build.py
node tests/copenhagen_cable_park_sim_validation.js
```

## Controls

- ← / → (A/D): lean. ↑ / ↓: pop / crouch.
- W / S: nose / tail grab in the air. Q / R: spin left / right.
- Space: pause. `.`: single step.

## Limits

Obstacle positions carry ≈5–10 m uncertainty, and no obstacle heights are documented. Several parameters are assumed and marked as such in `PHYS`. The report's reference numbers come from an illustrative point-mass model, not measurements.
