# CCP surroundings reconstruction

Implementation update: images 9923–9925 now provide a 256.97 m measurement and plan views. The calibrated surroundings are implemented in the simulator; see [implementation, assumptions and previews](ccp_surroundings_implementation.md). The earlier oblique trace and rough dimension ranges below are retained as the initial evidence assessment and are superseded for runtime placement.

## 1. Reconstructed environment

CCP occupies an irregular part of a larger water channel beside industrial land. The wakeboard area is not a separate rectangular lake. Its defining geometry is a relatively straight building-side bank, a transverse dam at the far end, and a curved opposite bank that changes the water width and direction. Water continues beyond the course's pale jetty structures.

This reconstruction combines seven supplied screenshots: six Google Earth oblique views and the ground-level Street View image 9920. It describes their imagery, not necessarily today's site: screenshot capture times do not establish the age of the underlying imagery. Street View and the 3D imagery may show different dates.

[View the geometry diagram](ccp_surroundings_trace.svg) · [Editable geometry and evidence](ccp_surroundings_geometry.json)

### Orientation and cross-referencing

To avoid mistaking screen direction for compass direction, this report uses:

- **Back:** the dam.
- **Front:** the jetty/start side and continuing channel.
- **Building side:** the comparatively straight bank beside the large sloping-roof building.
- **Opposite side:** the curved bank with broad pale ground, industrial yards and a road.

| Image | Contribution | Matching landmarks |
|---|---|---|
| 9917 | Best overall shoreline and relative layout | Dam, power plant, straight bank, bent opposite bank, jetty corners, green land farther along the channel |
| 9916 | Clearest dam face and opening | Same power-plant facade and chimneys behind the dam |
| 9913 | Relationship between dam, obstacles and jetties | Opening, building-side road, two obstacle corridors and bent jetty |
| 9912 | Building-side skyline and bank profile | Very large sloping-roof building, road at water edge, course masts and jetty |
| 9918 | Reverse-side view of shore and course structures | Broad road/embankment, industrial yards, start structures and angular jetty |
| 9919 | Tank-side skyline and bank, viewed across the course | White cylindrical tanks, stockpiles, near-bank road, start platform and jetty |
| 9920 | Ground-level bank materials and cable structure | Same tank-side skyline; stone slope, bank stairs, near-bank paved path, leaning lattice mast and elevated cable |

The power plant labelled “HOFOR - Amagerværk…” in 9917 also appears beyond the dam in 9916 and 9913. The conspicuous sloping-roof building is a separate, side-of-course landmark in 9912. These two masses must not be merged or put on the same viewing axis.

The screenshot compass rotates between views; screen-up is not a common north direction. The accompanying diagram deliberately retains 9917's oblique orientation. Only the optional approximate world coordinates inherit east/north axes from the existing repository.

### Water outline: directly observed

Starting at the dam's building-side junction and following the water around:

1. The building-side shore runs diagonally along a largely straight engineered bank. A road runs immediately behind it. This creates the clearest long alignment beside the riding area.
2. Towards the front, the bank reaches the start/access structures. The actual shore continues beyond those structures; the pale angular jetty is not a shoreline.
3. Farther along, the land edge turns around a greener area with small waterfront structures. It is curved and locally indented, rather than a continuation of a straight retaining wall.
4. Across the channel, the opposite bank has a substantial inward projection. From the dam it first rounds through a bend, then turns towards the water, before sweeping away along a longer curved embankment. The two banks are not parallel.
5. At the back, the dam crosses to the opposite bank. A separate body of water lies beyond it beside the power plant.

This produces a basin that broadens away from the dam and transitions into a bending channel. The full channel extends outside the useful image coverage. A model must retain that open continuation instead of adding an invented end bank.

The long pale/brown bands visible through or at the water recur in 9917, 9916, 9913 and 9912. Their existence is visible, but their physical nature is uncertain: sediment, aquatic vegetation, shallow features and rendering artefacts are all possible contributors. Darker water alongside them is not enough evidence to declare a deep navigable channel. Do not turn those bands into dry islands, raised walls or surveyed depth contours.

### Dam and passage

**Observed:** A raised linear crossing with pale, textured sides spans the back of the course. A narrow continuous-looking crest sits above a dark opening. Water is visible on both sides. The opening is visible in both 9916 and 9913; 9917 places it within the overall crossing.

**Estimated:** The opening is off-centre, towards the opposite-bank end—roughly two-thirds to four-fifths of the way from the building-side end. Perspective and uncertainty about the exact end of the crossing prevent a tighter ratio. The most plausible interpretation is a short water passage beneath a bridge-like section of the dam/causeway.

**Unknown:** Internal cross-section, length, ceiling shape, submerged invert, material, any gate or grille, water-level difference and flow direction. The visible dark mouth is approximately rectangular in the rendered images, but that does not establish a rectangular tunnel interior.

The stepped brown feature near the centre of 9920 appears to be an access staircase descending the tank-side stone bank. It does not show an identifiable tunnel mouth. Its exact position along that bank has not been registered, so it is not assigned to the dam opening. The dam-passage interpretation still rests on 9916 and 9913.

For reconstruction, make the dam a solid embankment with an actual opening under its crest and visible water at the mouth. Treat a straight connection through the embankment as a provisional interpretation. A black rectangle pasted on an unbroken wall would misrepresent the likely passage. Do not invent a long tunnel, waterfall, arch, sluice mechanism or upstream/downstream head difference.

### Banks, terrain and landmarks

| Element | Observed form and placement | Uncertain detail |
|---|---|---|
| Building-side bank | Relatively straight shore with road behind; 9920 also shows a paved path with dashed white markings, grass and reeds between pavement and water | Exact path location along bank, path/road separation, bank height and width |
| Opposite bank | Broad engineered slope; 9920 resolves loose angular stone/riprap on the tank-facing section and an apparent staircase descending towards the water | Accurate crest/toe separation, slope angle, stair construction and location, terrain contours |
| Dam | Crest above water, sloped/textured face, local interruption at opening | Elevation, section, exact crest width and portal dimensions |
| Green land beyond start | Grass, scattered trees/shrubs, smaller buildings and projecting waterfront structures | Individual species, surveyed positions and exact shore under vegetation |
| Power plant | Large blocky halls, tall stacks and waterfront frontage beyond dam | Fine facade and equipment detail |
| Sloping-roof building | Dominant wedge-like skyline beside course | Exact footprint, height and roof profile |
| Opposite industrial yards | Large white cylindrical storage tanks form a major skyline in 9919 and 9920, with stockpiles/open yard between tanks and bank; lower halls and distant turbines elsewhere in 9918 | Tank dimensions, exact count and row arrangement, contents, permanence of stockpiles |

Use broad building masses and the correct skyline relationships before facade detail. Google Earth's melted roofs, stretched trees, floating fragments and jagged mast geometry are rendering artefacts, not physical shapes to reproduce.

The new views materially refine the opposite-bank model: use a stone slope and a substantial white tank skyline, rather than generic low industrial buildings alone. At the 9920 viewpoint the order is paved path → grass/reed fringe → water → opposite stone slope → bank crest/yard → tanks. The tank walls are set behind the bank, not placed directly in the water. This ordering is secure; exact distances and elevations are not. The upper tank silhouettes in 9919 are distorted by the 3D mesh; 9920 supports ordinary cylindrical masses without those jagged edges.

The front course structures are low segmented jetties/walkways with angular bends, a shore access connection and a more substantial start/platform area. Their existence and arrangement are visible; whether every segment floats or stands on piles is not established by these screenshots.

### Cable and obstacles

The cable system occupies the dam-side basin, inside the broader water outline. The long riding legs generally follow the length of that basin. One runs near the building-side bank, while the other is farther across the water. The front turning region relates to the angular jetty; the rear turns lie before the dam.

Thin elevated wires are poorly resolved in the oblique 3D views. In 9920, however, a leaning lattice mast, orange padding at its lower structure, an elevated lattice arm with a wheel/sheave assembly, and fine cable/brace lines are visible. This is direct evidence for the cable's elevated structure; it does not establish the full loop, exact mast identity, footing construction or cable height. The broad pale polygonal structure near water level is the jetty/walkway system and must not be used as the cable centreline. Mast feet, sheave centres and the cable path also occupy different positions.

9913 shows roughly seven distinguishable white obstacle groups: several towards the building-side riding corridor and several across the basin. Their dominant long axes broadly follow the respective riding corridors, with short or wide ramp-like forms interspersed. White groups can contain multiple parts, and obscured or dark obstacles can disappear into the imagery. Seven is not a reliable total obstacle count.

Exact headings, entry direction, names and clearances cannot be read confidently. The JSON records the visible groups in source-image pixels rather than inventing OA–OI identities. Existing simulator obstacle names and detailed shapes come from other references and should remain a separate evidence layer.

9919 adds side-on silhouettes of several white obstacle groups and the near-bank start/platform arrangement. It supports their placement between the two banks, but cannot independently identify or precisely align every obstacle. The cropped white feature at the right edge of 9920 cannot be matched confidently. No new obstacle count or OA–OI assignment is inferred.

## 2. Coherent spatial model

### Model structure

Use independent layers with explicit relationships:

1. **Water:** course basin, continuing front channel and industrial basin behind dam. Keep the front channel open at the model boundary. A zero-elevation surface is a modelling datum, not a surveyed water level.
2. **Land boundaries:** separate building-side and opposite-side polylines. Preserve their bends and changing separation. Avoid smoothing away the opposite-bank projection.
3. **Terrain strips:** water edge, slope and road/crest where visible. Heights remain unset until supported by better evidence.
4. **Dam assembly:** embankment, crest, visible portal and a provisional under-crest passage. Connect to the water behind it.
5. **Course infrastructure:** access connection, jetties, start platform, tower feet, elevated sheaves and cable as separate objects.
6. **Obstacles:** independent objects with uncertain placement/orientation metadata.
7. **Context:** power-plant blocks/stacks beyond dam, sloping-roof building beside straight bank, cylindrical white tanks and industrial yards opposite, greener land towards front. Keep the unregistered bank staircase as a separate evidence item until it can be placed.

From water level, the dam should form a low barrier across the far view with a local dark opening; the power plant rises behind it. Turning towards the building side reveals the long bank/road and much larger sloping-roof silhouette. Turning towards the tank-side sector reveals a stone embankment with broad white cylindrical tanks above its crest; other directions show lower industrial yards. At the front, jetties lie across parts of the view while water visibly continues beyond them. The leaning mast and overhead arm should have a recognisable silhouette against the sky rather than a warped Google Earth mesh.

### Scale and provisional dimensions

The seven screenshots have no scale bar, camera calibration or readable coordinates. They cannot alone establish accurate metres. The additional ground-level image improves material and structural interpretation, but does not justify narrowing the existing dimension ranges. Tank diameters, path width, stair risers and mast height are not known scale references here.

The repository provides a secondary scale reference: `src/physics.js` records earlier Google Earth jetty coordinates and a cable polygon originally described as 520 m in perimeter. The original KML was not inspected, and current cable coordinates include later adjustments.

To make the reconstruction reusable, four recognisable jetty vertices in 9917 were manually matched to the existing jetty coordinates. A least-squares affine transformation maps image pixels to approximate local metres. This corrects rotation and unequal image-axis scales, but **does not remove perspective**. Controls are clustered near the jetty, so extrapolation towards the dam and lower channel is particularly uncertain.

| Feature | Rough working range, conditional on prior jetty scale |
|---|---:|
| Dam crossing, bank to bank | 130–210 m |
| Building-side distance, start region to dam | 180–290 m |
| Upper course-basin width, near dam | 120–210 m |
| Middle/front course-basin width | 170–300 m |
| Channel width beside the greener land farther forward | 150–300 m |
| Channel length shown beyond jetty region to the trace cut | 250–450 m; not total channel length |

These are deliberately broad blockout ranges, not measured bounds or statistical confidence intervals. Widths use approximate cross-bank sections, not screen-horizontal pixel counts; the sections are not guaranteed to be exactly normal to the local channel axis. Their reliable implication is the changing width and curved continuation, not the last metre.

Portal width/height, water depths, bank elevations, cable height and building heights remain unknown. Assigning exact values would add unsupported information.

### Delivered geometry and how to use it

`ccp_surroundings_geometry.json` includes:

- Manual 9917 image-space traces for both banks, dam crest, opening location, jetties/access and visible industrial-basin shore.
- Source IDs and evidence descriptions per feature.
- The four registration controls and complete affine transform.
- Provisional local east/north coordinates rounded to 5 m, explicitly marked as approximate.
- Existing cable coordinates as a separate prior-data layer; their screenshot alignment is estimated.
- 9913 obstacle-group image positions without unsupported identities.
- Water connectivity and null values for unknown elevations, passage dimensions and bathymetry.
- Additional observations from 9919 and 9920: tank skyline, stone bank, apparent bank stairs, foreground path/fringe and elevated mast structure. These have source-image regions but no invented world coordinates; the 9917 affine transform must not be applied to another view.

The image traces are the primary deliverable. The approximate metre coordinates are a starting blockout, not a replacement survey. Their rounding is not an accuracy claim. The affine fit's roughly 1–4 m control residuals do not measure shoreline accuracy or validate extrapolation.

`ccp_surroundings_trace.svg` is an oblique evidence diagram, not a rectified plan. It preserves the traced visible bank shape. Contextual building and terrain symbols are illustrative; the dashed cable is aligned prior geometry. The lower dashed edge is a documentation cut, never a physical bank. The 9919/9920 update adds bank and skyline evidence without moving shoreline vertices or inventing a plan position for the stairs.

The initial assessment did not change runtime geometry. The subsequent measured implementation is documented in [the implementation note](ccp_surroundings_implementation.md).

### What would resolve the main uncertainty

The most useful next reference is a north-up, top-down view with a scale bar or coordinate-marked shoreline, including both ends of the dam and the continuing channel. A ground-level view of the portal would resolve its section and relationship to water level. A known dam length or independently verified jetty segment would improve scale.

The key decision is whether the next stage needs visual recognisability or metre-level fidelity. These screenshots support a recognisable environment and defensible topology; they do not support an exact terrain or engineering model.
