# CopenHill reconstruction

Reconstructed from the embedded Reference A/B and Model views 1–3 in the supplied
`copenhill_3d_model_report.html`. The report contains images, not a mesh.

The model replaces the plain wedge and vertical ribs with rounded corners,
staggered aluminium trays over recessed dark walls, a green roof and ski strip,
walking paths, planting, parapets, lift supports, lighting, service structures,
a Y-shaped facade support and a chimney with two flues.

The centre remains at `environment.project([92,239])`, at the existing ground datum.
The previous 190 × 73 m envelope, 12–85 m roof heights and 124 m stack are retained
as working estimates. The model is rotated 180 degrees relative to the old wedge:
the high end is at the left from the CCP side, matching the report's reference.
These are visual approximations, not measured dimensions; paths and equipment
are representative. There are no building collisions.

`src/copenhill.js` is the reusable Three.js model. `src/surroundings.js` places it;
`build.py` embeds it in both standalone HTML files. The trays and repeated details
use instanced meshes: 17 meshes/draw submissions before extra rendering passes.
No external textures or new network dependencies are required.

Validation: build tests, surroundings regression tests and
`node tests/copenhill.browser.cjs` (Playwright; Edge on Windows). The browser test
checks runtime errors, finite geometry, retained placement, orientation, roof
ray hits and a mesh-count budget, and renders the two views below.

[CCP-side view](screenshots/copenhill-ccp.png) · [Roof view](screenshots/copenhill-roof.png)
