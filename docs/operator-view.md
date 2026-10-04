# Operator view

The main view now has two reusable SVG gauges, an integrated control bar and the existing live 3D camera. The gauges are half their original dial dimensions, with transparent backgrounds over the camera's lower-right corner. Their centre fill has been removed; text shadows keep readings visible over the scene. The fixed sidebar is replaced by a collapsible telemetry panel. The app retains its existing dark theme and fonts; no dependencies were added.

## Behaviour

- Rider controls sit in two compact rows over the lower-left camera corner, with transparent button backgrounds. They no longer reserve space in the upper control bar. On narrow camera views they move above the gauges to avoid overlap.
- Rider speed: 0–60 km/h. Line tension: 0–1.8 kN, yellow from 0.8 through 1.0, red strictly above 1.0. Values are centred inside each dial; caution and high tension also have a warning symbol and text.
- Gauge configuration lives in `CCP_OPERATOR.CONFIG` in `src/operator.js`. Rising needle values are immediate; falling values use 90 ms damping. Physics-step excursions between rendered frames reach the needle. The number always shows the current, unfiltered value, including values above the scale. Reduced motion removes return damping.
- **Graphs & log** or `L` toggles the panel. Drag its left edge to resize; keyboard users can focus the divider and use arrow keys, Home or End. Width and open state are stored with guarded localStorage access.
- The panel pushes the main view at widths of 1100 px and above; below that it becomes an overlay with a close button. Its width is bounded so desktop gauges remain readable.
- Graphs, Log, Settings and Guide are panel tabs. Graph history continues at the existing 30 Hz with its five-minute capacity while closed. Closing, opening, resizing and switching tabs do not clear it. Reset retains its existing history-clearing behaviour.
- Log contains the existing live diagnostics. There was no separate persistent event log. No log fields, units, acquisition intervals or zone-crossing events were added.
- Gauge warning thresholds are independent of the existing adjustable handle-release limit. The graphs retain their existing units and release-limit lines.

## Changed files

| File | Change |
|---|---|
| `src/operator.js` | Shared gauge, range/zone configuration, peak-preserving needle presentation and panel persistence/resizing. |
| `src/operator.css` | Responsive operator layout, colour tokens, gauge styling, integrated controls and telemetry panel. |
| `src/template.html` | Main layout, existing controls relocated, panel tabs and live gauge wiring. |
| `build.py` | Inlines the two new UI sources into both existing HTML outputs. |
| `tests/operator.test.js` | Zone boundaries, overflow, damping and between-frame excursions. |
| `tests/operator.browser.cjs` | Browser acceptance checks and reproducible screenshots using an existing Playwright installation. |
| `tests/build_smoke.test.js` | Checks that built HTML contains current operator sources. |
| `docs/screenshots/` | Four requested screenshots. |

Existing changes in `README.md`, `src/physics.js` and the template were preserved. The physics source was not edited for this redesign.

## Verification

- JavaScript suite: 17 tests passed, including existing physics lifecycle, geometry, autopilot and build checks.
- Python build test passed, including Windows encoding handling.
- Headless Edge acceptance checks: layout, control actions, camera choices, warning boundaries, out-of-range values, keyboard toggling, resize bounds, persistence, storage denial and continuous history.
- At 1280×720 and 1920×1080: both gauges visible side by side; controls contained without overlap; no horizontal scrolling, panel open or closed. At 1280 px, resizing was also checked at the 320 px minimum and 540 px maximum. The overlay breakpoint was checked at 1024 px.
- Screenshots use real simulation readings, paused at the same point for comparison. The restricted test environment used local copies of the app's existing CDN scripts and fonts, without changing app dependencies.

| Size | Panel closed | Panel open |
|---|---|---|
| 1280×720 | [Screenshot](screenshots/operator-1280x720-closed.png) | [Screenshot](screenshots/operator-1280x720-open.png) |
| 1920×1080 | [Screenshot](screenshots/operator-1920x1080-closed.png) | [Screenshot](screenshots/operator-1920x1080-open.png) |

## Running the checks

```sh
python build.py
node --test tests/*.test.js
python -m unittest discover -s tests -p 'test_*.py'
python -m http.server 8765 --bind 127.0.0.1
```

With the server running and an existing Playwright installation available to Node:

```sh
node tests/operator.browser.cjs
```

Optional environment variables: `CCP_BASE_URL`, `CCP_BROWSER_CHANNEL`, and `CCP_BROWSER_VENDOR` (local copies of existing CDN resources for restricted networks). Browser tests are separate from the dependency-free Node suite.

## Open questions

None blocking. The existing start screen, 3D scene, adjustable release limit and Reset semantics are retained.
