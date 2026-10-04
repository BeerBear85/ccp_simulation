# Implemented CCP surroundings

The simulator now uses the supplied plan views to shape the water and banks. The scenery is always shown; the former **Surroundings** camera menu (overview, dam, tank side) was a development aid and has been removed. The viewpoints remain in `CCP_SURROUNDINGS.cameras` and are used by `tests/surroundings.browser.cjs` for screenshots.

[Overview](screenshots/surroundings-overview.png) · [Plan](screenshots/surroundings-plan.png) · [Dam at water level](screenshots/surroundings-dam.png) · [Tank-side view](screenshots/surroundings-tanks.png)

## Geometry and calibration

The marked line in 9923 measures 256.97 m between approximately (167, 544) and (318, 365) image pixels. This supplies a fixed scale of 1.0973 m/pixel. 9925 shows the same line at a wider zoom and 9924 shows it obliquely; these are views of the same measurement, not three independent measurements.

Rotation and translation into the existing east/north simulation coordinates are fitted to four jetty vertices. The fit retains the measured scale; it does not stretch or move the cable or obstacle layout. The control discrepancies are roughly 2–7 m. These discrepancies and hand-picked water edges mean this is a visual reconstruction, not a survey. The marked line follows the bank/road; it is not treated as the exact waterline.

Source 9923 supplies separate traces for the building-side bank, opposite bank, power-station quay and tank-side edge of the basin behind the dam. Sources 9912–9920 supply bank materials, relative elevations, skyline and passage evidence. The earlier affine estimates from oblique 9917 are superseded for runtime placement.

Two land masses define the banks over a continuous water surface. This preserves:

- The straight building-side alignment and changing width of the course basin.
- The rounded bank below the dam and inward projection on the opposite side.
- The channel continuing beyond the jetty.
- The industrial basin behind the dam.
- Water beneath the dam passage.

At the edges of image coverage, simple distant extensions carry the channel to the scene boundary. These are contextual assumptions, not recovered shoreline. There is no artificial wall or end bank closing the channel within the reconstructed area. Pale bands in the imagery are not converted into islands or depth contours.

## Dam and terrain

The dam consists of two sloping stone embankments with a continuous crest road and a separate passage roof and side walls. There is an actual opening in the mesh; neither ground nor a hidden wall closes it.

| Parameter | Implemented value | Evidence status |
|---|---:|---|
| Marked bank segment | 256.97 m | User's Google Earth measurement |
| Dam centreline length | About 215 m | Estimated endpoints on the calibrated plan |
| Opening location | 64% from building-side end | Estimated from 9923 and cross-checked against 9916/9913 |
| Opening width | 7 m | Visual working assumption |
| Opening clearance | 2.6 m above water datum | Visual working assumption |
| Dam crest height | 3.6 m | Visual working assumption |
| Dam crest / toe width | 6 / 20 m | Visual working assumption |
| Near-bank ground | 0.8 m | Retained datum for start-area access |
| Opposite-bank crest | 2.8 m | Visual working assumption |

The passage is a short rectangular interpretation. Its actual internal profile, depth, gates and flow are unknown; no gate, grille, waterfall or submerged floor is invented. The apparent staircase in 9920 is not placed because its plan position remains unresolved.

The near-bank road and separate marked path follow the new shoreline. Grass/reeds occupy the edge; the opposite road follows the raised stone slope. The existing start-area walkway intersects the updated shore and road, retaining the sequence water → bank → road.

## Landmarks and limits

The environment includes a separate large sloping-roof building on the building side, power-plant halls and stacks behind the dam, white cylindrical tanks beyond the opposite bank, stockpile masses, low waterfront buildings, and limited vegetation.

Building footprints are approximate interpretations of the plan imagery. Heights, facade treatment, tank dimensions, details beyond the screenshot boundaries and repeated vegetation are schematic. The sloping-roof building retains the earlier model's 12–85 m roof range and 124 m chimney; these were not measured in the new screenshots. Tanks use explicit approximate placements instead of the old randomly populated field.

Surroundings affect rendering only. The cable, riding obstacles and rider dynamics are unchanged; terrain/building collisions and hydrology are not implemented.

## Files and validation

- `src/surroundings.js`: calibration, traced banks, terrain, dam, roads and landmarks. The authoritative runtime model.
- `src/physics.js`: shares the water outline and bank-road alignment with the start-area model.
- `src/template.html`: adds the scene and inspection cameras.
- `build.py`: embeds the surroundings in both standalone outputs.

Static surroundings are batched by material to limit draw calls. The dam remains a named group for inspection.

Validation covers the measured scale; all cable vertices and obstacle centres remaining over water; channel continuation; start-access ordering; six unobstructed rays through the rendered passage from both sides at three elevations; an upward ray hitting the passage roof; camera controls at desktop and mobile widths; and rebuilt artifact freshness. The ordinary simulation, obstacle, autopilot and operator tests also pass. Screenshots use the simulator's pinned Three.js 0.147.0.

