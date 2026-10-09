# CopenHill supplied model

The simulator now uses the user's `copenhill_visual_proxy.glb`, stored unchanged
in `src/copenhill_visual_proxy.glb`, replacing the procedural reconstruction.
The supplied Google Earth image `9953.jpg` provides visual context.

The GLB is embedded as base64 by `build.py`; opening the standalone HTML does not
require fetching a separate model. `src/copenhill.js` reads this static asset's
positions, indices and vertex colours and merges its 1,223 meshes into one mesh.
Triangle geometry and colours are retained, with flat normals calculated for
lighting and double-sided rendering for the roof's thin surfaces.

Source coordinates are Z-up, with the high end at X=0. The conversion is
`(X,Y,Z) -> (95-X,Z,Y)`, preserving metres and winding. Placement remains at
`environment.project([92,239])`, the existing ground datum and 213-degree heading.
The main building is 190 by 82 metres, with an 18–82 metre roof and chimney
outlets reaching 126 metres. These are proxy dimensions, not surveyed dimensions.
The model remains visual scenery without building collisions.

Validation: build tests, surroundings regression tests and
`node tests/copenhill.browser.cjs` check embedded source, finite geometry,
source mesh count, dimensions, placement, roof ray hits and browser errors.

[CCP-side view](screenshots/copenhill-ccp.png) · [Roof view](screenshots/copenhill-roof.png)
