/* =====================================================================
 *  FYSIKKONSTANTER — alle samlet her. Enhed + kilde/antagelse pr. linje.
 *  Koordinater: x = øst, y = nord, z = op (m). Origo = mast A ved starterbryggen.
 * ===================================================================== */
const PHYS = {
  // --- Generelt ---
  G:            9.81,    // m/s²   tyngdeacceleration. Kilde: standard
  RHO_WATER:    1000,    // kg/m³  havnevand (~1005–1015 i Sydhavnen). Antaget, afrundet
  RHO_AIR:      1.225,   // kg/m³  luft ved 15 °C. Kilde: ISA
  DT:           1 / 240, // s      fast fysik-tidsskridt (240 Hz). Kilde: prompt

  // --- Kabelanlæg ---
  CABLE_HEIGHT: 9.0,     // m      kabelhøjde over vandspejl. Kilde: prompt (rapport: 8,5–11,5 m i praksis)
  MAST_HEIGHT:  10.5,    // m      A-rammens top. Antaget ud fra fotos (hjul lige under toppen)
  // Hjulenes placering (kabelbanen) er målt direkte i Google Earth (se LAYOUT.wheels); masternes udhæng følger heraf (15–20 m).
  WHEEL_RADIUS: 1.0,     // m      hjørnehjul (Ø 2 m); kablet løber om hjulets yderside. Antaget
  HANGER_F:     1.5,     // Hz     carrier-ophængets egenfrekvens: trækpunktet følger kablet med 2.-ordens eftergivelighed (rapport 10). Antaget
  HANGER_ZETA:  0.9,     // –      dæmpning af carrier-ophænget. Antaget
  CABLE_SPEED_KMH: 30,   // km/t   standardhastighed; justerbar 20–35. Antaget (typisk fullsize 28–32 km/t)
  CABLE_SPEED_MIN: 20,   // km/t   Kilde: prompt
  CABLE_SPEED_MAX: 35,   // km/t   Kilde: prompt
  // Omløbsretning: mod uret (A→F→E→D→C→B). Kilde: bekræftet af bruger

  // --- Line (fjeder-dæmper, kun træk) ---
  LINE_LENGTH:  20.0,    // m      hvilelængde carrier→håndtag. Kilde: prompt (IWWF 2026: ≥ 17,80 m på fullsize)
  LINE_K:       800,     // N/m    effektiv serie-stivhed: PE-line (~4 % stræk ved 1 kN) + riderens arme/ben. Antaget
  LINE_C:       200,     // N·s/m  dæmpning ved stræk (ζ≈0,4). Antaget
  LINE_C_REC:   700,     // N·s/m  dæmpning når linen trækker sig sammen: arme/ben giver ikke energien tilbage (ingen slangebøsse). Antaget
  LINE_CF_MAX:  700,     // N      maks. dæmpningskraft: armene giver efter ved et ryk (kraftbegrænset). Antaget
  RELEASE_N:    1500,    // N      default release limit: above this the rider loses the cable (= fall). Adjustable in the UI (0.8–3 kN). Source: user; deep-water start loads 2.0–2.5 BW (Runciman 2011, PMC case study)
  RELEASE_TIME: 0.03,    // s      time above the limit before the handle is lost (filters single-step spikes). Assumed
  WARN_FRAC:    0.80,    // –      UI warning at 80 % of the release limit. Assumed

  // --- Arms/shoulders: yielding element in series with the line (start and corner jerks) ---
  ARM_YIELD:    950,     // N      arms give way (eccentric) above this line force. Assumed ≈1.2 BW; technique sources: elbows in, handle at the hips
  ARM_TRAVEL:   0.45,    // m      hands can travel from hip to straight arms. Assumed (arm length ≈0.6 m, bent → straight)
  STROKE_STAND: 0.30,    // m      extra stroke during a standing start: leaning back → upright over the board. Assumed
  STROKE_SIT:   0.85,    // m      extra stroke during a sitting start: from sitting behind the heels to standing over the board. Assumed
  ARM_V_MAX:    3.0,     // m/s    max yield speed of the arms. Assumed
  ARM_RET_V:    0.35,    // m/s    rate at which the rider pulls the handle back to the hip when the load drops. Assumed
  ARM_RET_FRAC: 0.75,    // –      arms only return when F < this × ARM_YIELD. Assumed

  // --- Start dock (carpet) and start modes ---
  DOCK_C:       [3.29, -7.17], // m   floating carpet start dock alongside the jetty head near mast A. Assumed (position not measured)
  DOCK_DIR:     [0.996, -0.090], // – dock axis = line direction at the moment the line comes taut (solved from the cable path)
  DOCK_LEN:     4.0,     // m      carpet length. Assumed
  DOCK_HALF_W:  0.8,     // m      half width. Assumed
  DOCK_TOP:     0.25,    // m      carpet surface above the water (floating pontoon). Assumed
  DOCK_RAMP:    1.2,     // m      front section that slopes down into the water. Assumed
  MU_CARPET:    0.12,    // –      wet carpet ↔ board base (sliding). Assumed (wet PE on synthetic carpet ≈0.1–0.2)
  JUMP_VF:      2.6,     // m/s    forward speed from the jump-start take-off. Assumed (standing jump ≈2–3 m/s)
  JUMP_VZ:      1.3,     // m/s    upward speed at take-off. Assumed
  JUMP_LEAD:    0.45,    // s      jump when the line will be taut in ≈ this time (flight time ≈0.3 s). Technique: jump just before the pull
  SIT_LEG:      0.55,    // m      hip height in the sitting start (deep squat). Technique: KiteSista, Miami Ski Nautique
  SIT_SHIFT:   -0.12,    // m      weight on the back foot / nose up in the sitting start. Technique: ~70 % on the back foot
  SIT_STAND_V:  3.5,     // m/s    the rider stands up above this speed (board planing). Assumed

  // --- Rider: board+fødder og overkrop forbundet af ben (knæ) langs kropsaksen; yaw + roll/læn ---
  RIDER_MASS:   80,      // kg     rider + board i alt. Antaget
  BOARD_MASS:   6,       // kg     board + bindinger + fødder/underben (resten er "overkrop"). Antaget
  RIDER_IZZ:    12,      // kg·m²  carve-authority gain (N·m per rad/s × CARVE_TAU) and fallback yaw inertia when YAW_I_FROM_BODY is false. Assumed
  YAW_I_FROM_BODY: true, // –      use the segment model for yaw inertia (body + board) instead of RIDER_IZZ
  BOARD_YAW_I:  1.1,     // kg·m²  board + bindings about the vertical axis (≈ m L²/12 with 6 kg, 1.42 m). Computed
  ROLL_I_BOARD: 0.3,     // kg·m²  board + feet contribution to roll inertia. Assumed
  PITCH_I_BOARD: 1.5,    // kg·m²  board + feet contribution to fore–aft inertia. Assumed
  RIDER_IXX:    14,      // kg·m²  (old lumped roll inertia; now computed from the segment model). Reference only
  UPPER_CG:     0.25,    // m      overkroppens tyngdepunkt over hoften. Antaget
  HANDLE_ABOVE_HIP: 0.15, // m      hænderne holder håndtaget ved navlen (let bøjede arme) ≈ i tyngdepunktets højde. Antaget; rapport 7.1: linen angriber i hænderne, ikke i COM
  // Ben/knæ: hoftehøjde ℓ over boardet (langs kropsaksen). Håndtaget holdes i hoftehøjde.
  LEG_MIN:      0.50,    // m      helt sammenbøjet (mekanisk stop). Antaget
  LEG_NOM:      0.85,    // m      normal kørestilling (let bøjede knæ). Antaget
  LEG_MAX:      0.98,    // m      strakte ben (mekanisk stop). Antaget
  LEG_K:        8000,    // N/m    benenes stivhed om ønsket længde (muskel-"servo"). Antaget
  LEG_C:        900,     // N·s/m  bendæmpning om den ønskede benhastighed (ζ≈0,6 mod overkrop). Antaget
  // --- Multi-body rider (reduced coordinates): board → ankles → knees (2-link legs) → hip → trunk/head, arms to the handle ---
  // Leg force is no longer a constant: it follows from knee torque capacity and knee geometry, F = 2·τ_knee(β)/|dℓ/dβ|.
  STATURE:      1.80,    // m      rider height. Assumed (anthropometric scaling of de Leva 1996, ref. 1.741 m)
  THIGH_LEN:    0.437,   // m      hip–knee joint centre. de Leva 1996 (422 mm) × 1.80/1.741
  SHANK_LEN:    0.449,   // m      knee–ankle joint centre. de Leva 1996 (434 mm) × 1.80/1.741
  ANKLE_H:      0.09,    // m      ankle joint above the board top (foot + binding). Assumed
  STANCE:       0.54,    // m      distance between the bindings (goofy, right foot forward). Assumed (typical 50–60 cm)
  KNEE_TQ:      [[0.0, 1.45], [0.47, 1.79], [1.05, 3.19], [1.66, 2.78], [2.2, 2.2]], // [flexion rad, N·m/kg per leg] isometric knee extension. Frontiers in Physiology 2021 meta-analysis (men: 1.79 at 10–45°, 3.19 at 50–70°, 2.78 at 80–110°); ends extrapolated
  KNEE_MASS:    78,      // kg     body mass used to scale knee torque. Assumed (rider 80 kg incl. board)
  ECC_FACTOR:   1.4,     // –      eccentric/isometric torque ratio when absorbing. Assumed (literature ≈1.2–1.5)
  LEG_V0:       3.5,     // m/s    leg extension velocity at which force reaches zero: linear lower-limb force–velocity profile of jumping (Samozino et al.; typical V0 ≈ 3–4 m/s)
  LEG_SYNERGY:  1.85,    // –      hip and ankle extensors add to the knee in a two-legged push. Calibrated so the push force at 60–110° knee flexion averages ≈35 N/kg (jump force–velocity profiles: F0 ≈ 30–40 N/kg)
  LEG_F_CAP:    4500,    // N      cap near the straight-knee singularity. Assumed
  // Fore–aft lean of the body relative to the board (in the board's plane). The rider balances by moving the centre
  // of pressure between the bindings (±COP_MAX); the moment balance replaces the old LINE_PITCH_COMP assumption.
  PITCH_KP:     3000,    // N·m/rad  balance gain (must exceed N·h ≈ 800 N·m for stability). Assumed
  PITCH_KD:     260,     // N·m·s/rad  damping (ζ≈0,7). Assumed
  PITCH_C:      30,      // N·m·s  passive damping. Assumed
  COP_MAX:      0.27,    // m      centre of pressure can move at most to either binding (STANCE/2). Geometry
  HANDLE_RANGE: 0.25,    // m      the arms can raise/lower the handle this much relative to the hip to balance with the line (handle above the CoM tips the rider forward). Assumed
  HIP_TAU_MAX:  150,     // N·m    hip strategy: extra fore–aft balance torque from swinging the legs/board under the body. Assumed (hip extensor/flexor capacity ≈200–300 N·m)
  HANDLE_RATE:  2.5,     // m/s    how fast the arms move the handle up/down. Assumed
  PITCH_REF_MAX: 40,     // °      largest intended lean-back. Assumed
  PITCH_REF_TAU: 0.15,   // s      reaction time of the balance target. Assumed (postural reactions ≈ 0.1–0.2 s)
  PITCH_FALL_BACK: 60,   // °      sat down behind the board. Assumed
  PITCH_FALL_FWD:  35,   // °      pulled over the nose. Assumed
  LEG_F_MIN:   -300,     // N      maks. trækkraft (løfte boardet med bindingerne). Antaget
  LEG_RATE:     4.5,     // m/s    hvor hurtigt ønsket benlængde kan ændres (afsæt ≈2,5–3 m/s ved vertikalt spring). Antaget
  LEG_STOP_K:   6.0e4,   // N/m    stivhed i mekanisk stop (knæ helt bøjet/strakt). Antaget
  LEG_STOP_C:   2000,    // N·s/m  dæmpning i stop. Antaget
  BOTTOM_OUT_V: 3.0,     // m/s    rammer rideren LEG_MIN hurtigere end dette, falder han (bundet ud). Antaget
  LEAN_KP:      4000,    // N·m/rad  riderens balancestyring mod ønsket læn (≈5× m·g·h). Antaget
  LEAN_KD:      300,     // N·m·s/rad  muskeldæmpning (ζ≈0,7). Antaget
  LEAN_TAU_MAX: 1500,    // N·m    maks. balancemoment (ankler/knæ/hofte + håndtag). Antaget
  LEAN_STOP_K:  20000,   // N·m/rad  bracing stiffness beyond LEAN_MAX_DEG. Assumed
  LEAN_STOP_TAU: 1500,   // N·m    max. bracing torque (a hard line pull can still topple the rider). Assumed
  LEAN_MAX_DEG: 45,      // °      max. commanded lean (= edge). Limited to 45° (user)
  LEAN_RATE_DEG: 120,    // °/s    hvor hurtigt ønsket læn kan ændres. Antaget
  FALL_DEG:     72,      // °      rideren falder over denne læn. Antaget
  CDA_AIR:      0.60,    // m²     Cd·A for rider i luft. Kilde: rapport 3.2 (0,5–0,8 m²)

  // --- Board / hydrodynamik: reduceret "M2"-model jf. rapporten (Savitsky-planing + rocker + added mass) ---
  // Løft:  N = ½ρ b² τ^1,1 (0,0120 √λ V² + 0,0055 λ^2,5 g b)   [τ = effektiv indfaldsvinkel i grader, λ = l_w / b]
  //        (= Savitsky C_L0 = τ^1,1 (0,0120 λ^0,5 + 0,0055 λ^2,5 / C_V²), C_V = V/√(g b); skrevet så V = 0 er defineret)
  // Kant:  C_Lβ = C_L0 − 0,0065 β C_L0^0,6   (kant φ behandlet som asymmetrisk deadrise; klampet nedad)
  // Trim:  ikke foreskrevet. Løses hvert skridt af momentligevægt: Savitskys trykcentrum
  //        l_p = l_w (0,75 − 1/(5,21 C_V²/λ² + 2,39)) skal ligge under riderens last (fodtryk for/bag).
  // Rocker: lokal indfaldsvinkel α(x) = θ + dr/dx (rapport 4.6). Halen er bøjet op, så den våde hale ser
  //        en MINDRE indfaldsvinkel end midten: θ_board = τ_eff + 4h(L − l_w)/L².
  // Drag:  trykdrag N·sin τ (løftet står vinkelret på bunden) + ITTC-57-friktion på S_w = l_w b /(cos τ cos φ)
  //        + residual (spray/3D/finner, rapport 4.3) + pløjedrag i deplacementsfasen.
  // Heave: added mass m_a = ρ π b² l_w / 8 og asymmetrisk slamming ṁ_a·w ved vandindtræden (rapport 7.2, 11.2).
  BOARD_AREA:   0.40,    // m²     planform (hydrostatisk opdrift ved lav fart/dyb start). Kilde: typiske mål 138–144 × 42–44 cm
  BOARD_LEN:    1.42,    // m      boardlængde. Kilde: rapportens referencecase (1,42 × 0,43 m)
  BOARD_BEAM:   0.43,    // m      bredde. Kilde: rapportens referencecase
  ROCKER_H:     0.06,    // m      kontinuerlig rocker (6 cm). Kilde: typiske cableboards 5–7 cm
  NU_WATER:     1.19e-6, // m²/s   kinematisk viskositet, 15 °C. Kilde: ITTC
  X_LOAD:       0.66,    // m      riderens lastpunkt målt fra halen (lidt bag midten = vægt på bagerste fod). Antaget
  FOOT_SHIFT_MAX: 0.15,  // m      hvor langt rideren kan flytte lasten frem/tilbage med fodtryk (rapport 6.3). Antaget
  TRIM_MIN:     1.0,     // °      mindste effektive indfaldsvinkel. Antaget
  TRIM_MAX:     22,      // °      største (næsen højt, halen dybt). Antaget
  PITCH_TAU:    0.08,    // s      tidskonstant for boardets pitch mod ligevægt (pitch-inerti). Antaget
  RESID_AREA:   6.0e-4,  // m²     residual drag-areal (spray, 3D-kanter, finner): ≈20 N ved 30 km/t som i rapportens regner. Kilde: rapport 14.2
  ADDED_MASS:   true,    //        heave-added-mass + slamming til/fra
  ENTRY_MIN_DEG: 9.6,    // °      mindste indtrædningsvinkel ved slamming = rocker-hældningen ved halen atan(4h/L). Beregnet
  CD_PLOW:      1.0,     // –      pløjedrag på neddykket front ved lav fart. Antaget (stump flade)
  CATCH_GAIN:   3.0,     // –      sidekraft-forstærkning når boardet glider mod den nedsænkede rail ("fanger kanten"). Antaget
  D_MAX:        0.40,    // m      maks. effektiv dykning. Antaget
  HEAVE_C:      300,     // N·s/m  resterende lodret dæmpning (bølgedannelse). Hovedparten kommer nu fra w/U-leddet i indfaldsvinklen. Antaget
  VENT_START:   45,      // °      kant hvor ventilation begynder: luft suges ned langs railen, våd flade og løft tabes (rapport 4.4, 5.7). Antaget
  VENT_SPAN:    25,      // °      kantinterval hvor ventilationen udvikler sig fuldt. Antaget
  VENT_LOSS:    0.45,    // –      maks. tab af løft/sidekraft ved fuld ventilation. Antaget
  ROLL_C_W:     12,      // N·m·s per m/s  roll-dæmpning fra vandet ∝ fart (rail der presses ned/op mod vand, rapport 4.8: p/U). Antaget
  ANKLE_MAX:    25,      // °      hvor meget rideren kan kante boardet i forhold til kroppen med ankler/knæ (bruges i luften). Antaget
  ANKLE_RATE:   150,     // °/s    hastighed for ankel-kant. Antaget
  SIDE_AREA:    0.03,    // m²     rail + finner, sideflade. Antaget
  SIDE_CLA:     3.0,     // 1/rad  løftkurvehældning for sideslip. Antaget (lav-AR flade)
  FIN_AREA:     0.008,   // m²     4 finner à ~20 cm². Kilde: typisk finsæt
  FIN_CLA:      3.0,     // 1/rad  Antaget
  FIN_ARM:      0.5,     // m      finnernes afstand bag tyngdepunkt. Antaget
  YAW_C:        60,      // N·m·s  yaw-dæmpning (luft/krop). Antaget
  YAW_C_AIR:    0.5,     // N·m·s  yaw damping in the air (aerodynamic, spinning body). Assumed
  YAW_C_W:      10,      // N·m·s per m/s  yaw-dæmpning fra vandet, ∝ fart. Antaget
  // Carving: et kantet board med rocker følger sin skrå rail. Kurveradius R = (L²/8h)·CARVE_SLIP / sin(kant).
  CARVE_SLIP:   2.2,     // –      faktor mellem geometrisk rail-radius (L²/8h ≈ 4,1 m) og faktisk carve-radius pga. slip. Antaget
  CARVE_TAU:    0.25,    // s      hvor hurtigt vandet drejer boardet ind på railens kurve. Antaget
  PIVOT_K:      400,     // N·m/rad  riderens aktive drej af boardet med fødderne ved stor sideslip. Antaget
  PIVOT_TAU_MAX: 180,    // N·m    maks. drejemoment fra fødderne. Antaget
  PIVOT_DEAD:   15,      // °      sideslip der accepteres før rideren drejer boardet aktivt. Antaget
  CD_SLIP:      1.1,     // –      tværdrag når boardet glider sidelæns (flad plade ≈1,1–1,2). Kilde: Hoerner, Fluid-Dynamic Drag
  SLIP_PLATE:   0.25,    // –      andel af boardfladen der skubber vand ved sideslip. Antaget
  ROLL_C:       40,      // N·m·s  roll-dæmpning fra vand/luft. Antaget
  FALLEN_CDA:   0.6,     // m²     Cd·A for rider i vandet efter fald. Antaget

  // --- Obstakler (kontakt) ---
  OBS_K:        1.0e5,   // N/m    kontaktstivhed board↔obstakel (benene er nu modelleret separat). Antaget
  OBS_C:        800,     // N·s/m  kontaktdæmpning (mod 6 kg board). Antaget
  MU_SLIDE:     0.10,    // –      friktion board på vådt HDPE/glasfiber. Antaget (PE mod PE vådt ≈0,1)
  MU_RAIL:      0.15,    // –      friktion board-base på stålrail. Antaget
  STEP_MAX:     0.35,    // m      højeste kant rideren kan "træde op på" uden kollision. Antaget
  RAIL_TOL:     0.15,    // m      halv boardbredde: rail rammes hvis |sideafstand| < rail/2 + dette. Antaget
  ENTRY_LEN:    4.0,     // m      afrundet indkørsel på box/rail/funbox (maks. 45 % af længden). Antaget
  // --- Water surface: wind chop (JONSWAP, fetch-limited) + the board's own wake ---
  WIND_DEFAULT: 4.0,     // m/s    10 m wind speed (adjustable 0–10 in the UI). Assumed light breeze
  WIND_FROM:    250,     // °      wind direction (from), WSW — prevailing in Copenhagen. Assumed
  FETCH:        250,     // m      open water upwind across the lake. Estimated from the layout
  CHOP_N:       8,       // –      number of wave components. Assumed
  CHOP_SPREAD:  35,      // °      directional spread (±). Assumed (cos²-like)
  WAKE_H0:      0.05,    // m      wake crest height 2 m behind the board at 30 km/h and 700 N load; scales with load and 1/speed (each capped at 1.5×). Assumed (small planing board)
  WAKE_R0:      2.0,     // m      reference distance for WAKE_H0
  WAKE_TD:      20,      // s      decay time of the wake (dispersion + dissipation). Assumed
  WAKE_TMAX:    25,      // s      wake history kept
  WAKE_DT:      0.1,     // s      wake sampling interval
  WAKE_ANG_C:   0.224,   // –      max-amplitude wake angle φ = C/Fr_L (Darmon, Benzaquen & Raphaël 2014; Rabaud & Moisy 2013), capped at the Kelvin angle 19.47°
  // --- Tricks in the air: grabs and spins ---
  // Spins obey angular momentum (report 6.2): the rider starts the rotation at take-off by twisting against the lip/edge
  // (pre-wind), and in the air only the line can add yaw torque (handle pulled to the side / behind the back). Tucking
  // reduces the yaw inertia, so the spin speeds up (I·ω conserved).
  SPIN_POP:     4.5,     // rad/s  max. yaw rate from a full pre-wind at take-off (≈ 180° in 0.7 s). Assumed
  SPIN_WIND_T:  0.4,     // s      time to build a full pre-wind while still on the water/ramp. Assumed
  SPIN_LEVER:   0.08,    // m      effective lever of the line about the spin axis, averaged over the rotation (handle held near the hip, passed behind the back). Assumed
  SPIN_TAU_MAX: 40,      // N·m    max. yaw torque from the line in the air. Assumed; gives ≈1 rev/s for a pre-wound 360, as seen on cable kickers
  SPOT_DEG:     40,      // °      within this of straight/switch the rider 'spots' the landing and aligns the board. Assumed
  LAND_TWIST_MAX: 40,    // °      board more than this off the flight direction (or its reverse) at touchdown = fall. Assumed
  GRAB_REACH:   0.25,    // s      hand travel from the handle to the board edge. Assumed
  GRAB_LEG:     0.62,    // m      hip height while grabbing (tucked). Assumed
  GRAB_GRIP:    0.6,     // –      one hand on the handle: release limit × this while grabbing. Assumed
  GRAB_MIN:     0.2,     // s      a grab must be held this long to count. Assumed
  LAND_VZ_MAX:  9.0,     // m/s    lodret landingshastighed der altid giver fald (~4 m frit fald). Antaget
};

/* Anlæggets geometri: hjul (kabelbane) målt i Google Earth; mastfødder på jetty/kyst/mole. */
const LAYOUT = {
  // Hjulcentre = kabelbanens hjørner. MÅLT: brugerens Google Earth-polygon "ccp" (KML), omkreds 520 m, areal 15 413 m².
  // Omregnet fra lat/lon til lokale meter med origo 55.681713 N, 12.622169 Ø (mast A-området).
  wheels: [[5.4, 4.2], [77.0, -51.5], [106.6, -45.5], [173.4, 84.6], [161.2, 130.4], [116.9, 118.4]],
  // Mastfødder (A-rammer på jetty/kyst/mole), som hælder ind over vandet med en bom ud til hjulet.
  masts: [ // rækkefølge = omløbsretning (mod uret)
    { id: 'A', x: -3.0,  y: -8.0,  role: 'Drive/start',  status: 'antaget' },
    { id: 'F', x: 81.9,  y: -71.4, role: 'Jetty south',  status: 'målt' },     // jettypunkt nærmest hjul 2 (20,5 m udhæng)
    { id: 'E', x: 114.8, y: -63.3, role: 'Jetty corner', status: 'målt' },     // brugerens måling: 20 m mast→hjul
    { id: 'D', x: 188.3, y: 83.0,  role: 'East',         status: 'antaget' },  // 15 m ud fra hjulet
    { id: 'C', x: 166.0, y: 145.0, role: 'NE by mole',   status: 'antaget' },
    { id: 'B', x: 109.3, y: 131.3, role: 'North shore',  status: 'målt' },     // satellit (pæl+skygge) = 15 m ud fra hjulet
  ],
  // Vandkontur: NV-kyst og mole fra Google Earth (brugerens skærmbillede, ±3 m); syd/øst fra satellit (±15 m).
  water: [[-76,-37],[-25,22.4],[42,84.5],[93.8,134.9],[138.1,179.4],[148,196],[162.2,151.2],[181.6,120.8],
          [212.8,72.4],[246,19.4],[264.5,-67.6],[260.2,-171],[-37.2,-171],[-97.5,-102]],
  jetty: [[-6.7,6.2],[1.1,-10.6],[58.5,-74.7],[112.8,-65.0],[143.5,-23.0]],   // Google Earth 2D (brugerens skærmbillede, 0,22 m/px)
  jettyLand: [[1.1,-10.6],[-51.7,-60.3]],
  // Obstacles: layout "O" (Google Earth standard layer, 6/9/2023) from the user's obstacle analysis (25 Sep 2026).
  // Each feature is drawn as its sub-contours with their own axis (planform read from the analysis' north-up model,
  // 3.7 px/m, relative to T1). Positions carry ≈5–10 m absolute uncertainty. X1 (unconfirmed dark linear candidate)
  // is not included. The analysis gives NO heights or types: types follow its planform interpretation, heights are
  // typical values and marked as assumed. Direction of travel along each part follows the nearest cable leg.
  obstacleLayout: 'O (2023 standard layer)',
  obstacles: [
    // Road side (T6→T1, travel towards SW)
    { id: 'O1', tag: true, name: 'O1 box',  type: 'box',    x: 116.6, y: 113.5, dir: [0.661, 0.750], L: 5.8,  W: 4.2, H: 0.45 },  // broad light end
    { id: 'O1',            name: 'O1 rail', type: 'rail',   x: 109.3, y: 105.8, dir: [0.699, 0.715], L: 15.2, W: 0.3, H: 0.55, color: 0x3a4046 },  // long dark rail/wall form
    { id: 'O2', tag: true, name: 'O2 rail', type: 'rail',   x: 82.85, y: 91.5,  dir: [0.660, 0.751], L: 19.8, W: 0.3, H: 0.5 },   // long narrow rail. Moved 3 m NW, away from the cable line (drawn 1.6 m from it; user: no obstacle directly under the cable)
    { id: 'O2',            name: 'O2 side box', type: 'box', x: 83.95, y: 94.7, dir: [0.685, 0.728], L: 6.3,  W: 1.7, H: 0.4 },   // side-offset wide section (moved with the rail)
    { id: 'O3', tag: true, name: 'O3 kicker', type: 'kicker', x: 86.8, y: 79.4, dir: [0.443, 0.897], L: 11.8, W: 3.0, H: 1.2 },  // tapered, kicker-like planform
    { id: 'O3',            name: 'O3 side box', type: 'box', x: 89.4, y: 80.3,  dir: [0.416, 0.910], L: 3.6,  W: 3.2, H: 0.3 },   // short side part
    { id: 'O4', tag: true, name: 'O4 kicker', type: 'kicker', x: 54.8, y: 68.2, dir: [0.759, 0.651], L: 3.9,  W: 2.8, H: 0.6 },   // separate wide small part upstream of the rail: read as a kick-in (assumed). Moved 4 m W + 4 m N (see O4 rail)
    { id: 'O4',            name: 'O4 rail', type: 'rail',   x: 54.3,  y: 63.5,  dir: [0.665, 0.747], L: 7.9,  W: 0.3, H: 0.5 },   // short rail. Drawn 0.2 m from the cable line; moved 4 m W + 4 m N as the analysis did for H4 (user: no obstacle lies directly under the cable)
    // East side (T3→T4, travel towards NNE)
    { id: 'O5', tag: true, name: 'O5 rail/box', type: 'box', x: 137.9, y: 27.4, dir: [0.420, 0.908], L: 15.2, W: 1.1, H: 0.45 },  // narrow, almost straight
    { id: 'O6', tag: true, name: 'O6 box',  type: 'box',    x: 137.4, y: 4.4,   dir: [0.494, 0.869], L: 14.7, W: 0.9, H: 0.45 },  // narrow long part
    { id: 'O6',            name: 'O6 ramp', type: 'funbox', x: 136.0, y: 4.3,   dir: [0.501, 0.866], L: 8.7,  W: 2.4, H: 0.8 },   // broad side/ramp section
    { id: 'O7', tag: true, name: 'O7 box',  type: 'box',    x: 107.6, y: -36.0, dir: [0.380, 0.925], L: 14.9, W: 3.1, H: 0.45 },  // broad southern part
    { id: 'O7',            name: 'O7 rail/box', type: 'box', x: 110.1, y: -33.3, dir: [0.441, 0.897], L: 21.9, W: 1.1, H: 0.45 },  // full length incl. narrow extension
  ],

  // Orange bøjer ~4 m inde fra jettyen (set i videoen). Kun visuelle.
  buoys: [[24.2,-30.4],[44.3,-52.8],[74.1,-67.9],[95.8,-64.0],[120.3,-47.9],[131.1,-33.2]],
};

/* ---------------- Kabelbane: lige stykker + buer om hjulene ---------------- */
function buildPath(wheelsIn, P) {
  const n = wheelsIn.length;
  const unit = (x, y) => { const l = Math.hypot(x, y); return [x / l, y / l]; };
  const wheels = wheelsIn.map(w => [w[0], w[1]]);
  const R = P.WHEEL_RADIUS, pieces = []; let L = 0;
  const segT = [];
  for (let i = 0; i < n; i++) segT.push(unit(wheels[(i + 1) % n][0] - wheels[i][0], wheels[(i + 1) % n][1] - wheels[i][1]));
  for (let i = 0; i < n; i++) {
    const c0 = wheels[i], c1 = wheels[(i + 1) % n], t = segT[i], rgt = [t[1], -t[0]];
    const a = [c0[0] + rgt[0] * R, c0[1] + rgt[1] * R], len = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]);
    pieces.push({ kind: 'line', s0: L, len, a, t }); L += len;
    // bue om hjul i+1: fra højre-normal på dette ben til højre-normal på næste (venstresving)
    const t2 = segT[(i + 1) % n];
    const a0 = Math.atan2(rgt[1], rgt[0]);
    let da = Math.atan2(-t2[0], t2[1]) - a0; while (da < 0) da += 2 * Math.PI; while (da > 2 * Math.PI) da -= 2 * Math.PI;
    pieces.push({ kind: 'arc', s0: L, len: R * da, c: c1, a0, R }); L += R * da;
  }
  return { pieces, length: L, wheels };
}
function pathAt(path, s) {
  s = ((s % path.length) + path.length) % path.length;
  let k = 0; while (k < path.pieces.length - 1 && s > path.pieces[k].s0 + path.pieces[k].len) k++;
  const g = path.pieces[k], u = s - g.s0;
  if (g.kind === 'line') return { x: g.a[0] + g.t[0] * u, y: g.a[1] + g.t[1] * u, tx: g.t[0], ty: g.t[1], k };
  const ang = g.a0 + u / g.R;
  return { x: g.c[0] + g.R * Math.cos(ang), y: g.c[1] + g.R * Math.sin(ang), tx: -Math.sin(ang), ty: Math.cos(ang), k };
}

/* ---------------- Obstakler: lokal ramme + højdeprofil ---------------- */
// u = langs kørselsretningen (−L/2 … L/2), v = til venstre. Profil = [(u, h)] lineært interpoleret.
function obstacleProfile(o, P) {
  // Afrundede overgange (som rigtige obstakler): kicker = parabel (flad ved vandet, ~30° ved lip),
  // box/rail/funbox = smoothstep-indkørsel (vandret i begge ender).
  const a = -o.L / 2, b = o.L / 2, lo = -0.15, N = 12, pts = [];
  const ss = x => x * x * (3 - 2 * x);
  if (o.type === 'kicker') { for (let i = 0; i <= N; i++) { const x = i / N; pts.push([a + x * o.L, lo + (o.H - lo) * x * x]); } return pts; }
  const e = Math.min(P.ENTRY_LEN, o.L * 0.45);
  for (let i = 0; i <= N; i++) { const x = i / N; pts.push([a + x * e, lo + (o.H - lo) * ss(x)]); }
  if (o.type === 'funbox') { for (let i = 0; i <= N; i++) { const x = i / N; pts.push([b - e + x * e, o.H - (o.H - lo) * ss(x)]); } }
  else pts.push([b, o.H]);
  return pts;
}
function buildObstacles(path, P) {
  const legs = path.pieces.filter(g => g.kind === 'line');
  return LAYOUT.obstacles.map(o => {
    let best = null, bd = 1e9, bu = 0;
    for (const g of legs) {
      const u = Math.max(0, Math.min(g.len, (o.x - g.a[0]) * g.t[0] + (o.y - g.a[1]) * g.t[1]));
      const d = Math.hypot(g.a[0] + g.t[0] * u - o.x, g.a[1] + g.t[1] * u - o.y); if (d < bd) { bd = d; best = g; bu = u; }
    }
    // Axis from the analysis if given, oriented along the direction of travel of the nearest leg
    let ax = best.t[0], ay = best.t[1];
    if (o.dir) { const n = Math.hypot(o.dir[0], o.dir[1]), sg = Math.sign(o.dir[0] * ax + o.dir[1] * ay) || 1; ax = sg * o.dir[0] / n; ay = sg * o.dir[1] / n; }
    const off = best.t[0] * (o.y - best.a[1]) - best.t[1] * (o.x - best.a[0]);
    return { ...o, ax, ay, off, leg: legs.indexOf(best), yaw: Math.atan2(ay, ax), prof: obstacleProfile(o, P), halfW: o.W / 2 + (o.type === 'rail' ? P.RAIL_TOL : 0) };
  });
}
function profileAt(prof, u) {  // returnerer [h, dh/du] eller null uden for profilen
  if (u < prof[0][0] || u > prof[prof.length - 1][0]) return null;
  for (let i = 0; i < prof.length - 1; i++) {
    const [u0, h0] = prof[i], [u1, h1] = prof[i + 1];
    if (u <= u1) { const s = (h1 - h0) / (u1 - u0); return [h0 + s * (u - u0), s]; }
  }
  return null;
}

/* ---------------- Body model (de Leva 1996 segments, scaled) ---------------- */
// Returns knee flexion β, |dℓ/dβ| and the rider's inertia about his centre of mass for the current leg length.
const DELEVA = { // male: mass fraction, CoM from proximal end, radius of gyration (mean of sagittal/transverse, longitudinal). de Leva 1996
  head: [0.0694, 0.5002, 0.369, 0.312], trunk: [0.4346, 0.5138, 0.317, 0.169], uarm: [0.0271, 0.5772, 0.277, 0.158],
  farm: [0.0162, 0.4574, 0.271, 0.121], hand: [0.0061, 0.79, 0.57, 0.401], thigh: [0.1416, 0.4095, 0.329, 0.149],
  shank: [0.0433, 0.4395, 0.252, 0.103], foot: [0.0137, 0.4415, 0.251, 0.124] };
function kneeGeom(P, leg) {
  const T = P.THIGH_LEN, S = P.SHANK_LEN, la = Math.max(Math.abs(T - S) + 0.05, Math.min(T + S - 1e-4, leg - P.ANKLE_H));
  const cb = Math.max(-1, Math.min(1, (la * la - T * T - S * S) / (2 * T * S))), beta = Math.acos(cb);  // flexion: 0 = straight
  return { beta, la, arm: T * S * Math.sin(beta) / la };
}
function kneeTorque(P, beta) {          // isometric, per leg (N·m)
  const t = P.KNEE_TQ; let k = 1; while (k < t.length - 1 && beta > t[k][0]) k++;
  const a = t[k - 1], b = t[k], u = Math.max(0, Math.min(1, (beta - a[0]) / (b[0] - a[0])));
  return (a[1] + u * (b[1] - a[1])) * P.KNEE_MASS;
}
function legForceMax(P, leg, legv) {    // max. force along the body axis from both legs, with Hill force–velocity
  const g = kneeGeom(P, leg), F0 = Math.min(P.LEG_F_CAP, P.LEG_SYNERGY * 2 * kneeTorque(P, g.beta) / Math.max(g.arm, 0.03));
  if (legv <= 0) return F0 * Math.min(P.ECC_FACTOR, 1 + (P.ECC_FACTOR - 1) * (-legv / 0.5));   // eccentric: up to ECC_FACTOR
  return F0 * Math.max(0, 1 - legv / P.LEG_V0);                             // concentric: linear force–velocity
}
function bodyInertia(P, leg, mass) {    // about the CoM: [roll (board axis), pitch (across the board), yaw]
  const s = P.STATURE / 1.741, T = P.THIGH_LEN, S = P.SHANK_LEN, g = kneeGeom(P, leg), segs = [];
  const add = (key, p0, p1) => segs.push({ key, p0, p1 });
  const ah = P.ANKLE_H, hh = leg, uF = P.STANCE / 2, uH = 0.1 * s;
  for (const sgn of [1, -1]) {                                              // coords [u along board, a anterior, z up]
    const A = [sgn * uF, 0, ah], Hp = [sgn * uH, 0, hh], m = [(A[0] + Hp[0]) / 2, 0, (A[2] + Hp[2]) / 2];
    const half = Math.hypot(Hp[0] - A[0], Hp[2] - A[2]) / 2, off = Math.sqrt(Math.max(0, S * S - half * half));
    const K = [m[0], off, m[2]];                                            // knee forward (anterior)
    add('foot', [sgn * uF, 0.12 * s, 0.03], [sgn * uF, -0.1, 0.03]); add('shank', K, A); add('thigh', Hp, K);
  }
  const sh = hh + 0.52 * s, Ht = [0, 0, hh], Sh = [0, 0, sh];
  add('trunk', Sh, Ht); add('head', [0, 0, sh + 0.24 * s], [0, 0, sh]);
  for (const sgn of [1, -1]) { const S0 = [sgn * 0.19 * s, 0, sh], E = [sgn * 0.12, 0.2, sh - 0.25], W = [sgn * 0.09, 0.42, hh + 0.12];
    add('uarm', S0, E); add('farm', E, W); add('hand', W, [sgn * 0.09, 0.5, hh + 0.12]); }
  const pts = segs.map(q => { const d = DELEVA[q.key], c = q.p0.map((v, i) => v + d[1] * (q.p1[i] - v)), len = Math.hypot(...q.p1.map((v, i) => v - q.p0[i]));
    return { m: d[0] * mass, c, len, dir: q.p1.map((v, i) => (v - q.p0[i]) / (len || 1)), rt: d[2], rl: d[3] }; });
  const M = pts.reduce((a, q) => a + q.m, 0), cg = [0, 1, 2].map(i => pts.reduce((a, q) => a + q.m * q.c[i], 0) / M);
  const I = [0, 0, 0];                                                     // about u, a, z axes through the CoM
  for (const q of pts) { const r = q.c.map((v, i) => v - cg[i]), It = q.m * (q.rt * q.len) ** 2, Il = q.m * (q.rl * q.len) ** 2;
    for (let ax = 0; ax < 3; ax++) { const o = [0, 1, 2].filter(i => i !== ax); const along = q.dir[ax] ** 2;
      I[ax] += q.m * (r[o[0]] ** 2 + r[o[1]] ** 2) + Il * along + It * (1 - along); } }
  return { roll: I[0], pitch: I[1], yaw: I[2], cgz: cg[2], beta: g.beta };
}

/* ---------------- Water surface ---------------- */
// Fetch-limited JONSWAP: gHs/U² = 0.0016 (gF/U²)^½, gTp/U = 0.286 (gF/U²)^⅓ (Hasselmann et al. 1973). Spectrum shape with γ = 3.3,
// discretised into CHOP_N components with a directional spread; amplitudes scaled so Σa²/2 = Hs²/16 (m0 = Hs²/16).
function buildChop(P, U) {
  if (!(U > 0.3)) return { comps: [], Hs: 0, Tp: 0, lp: 0 };
  const g = P.G, Fh = g * P.FETCH / (U * U), Hs = 0.0016 * Math.sqrt(Fh) * U * U / g, Tp = 0.286 * Math.cbrt(Fh) * U / g, fp = 1 / Tp;
  const to = (90 - (P.WIND_FROM + 180)) * Math.PI / 180;               // travel direction as a math angle (x = east, y = north)
  let seed = 12345; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const comps = [], N = P.CHOP_N;
  for (let i = 0; i < N; i++) {
    const f = fp * (0.8 + 1.7 * i / (N - 1)), sg = f <= fp ? 0.07 : 0.09;
    const S = Math.pow(f / fp, -5) * Math.exp(-1.25 * Math.pow(f / fp, -4)) * Math.pow(3.3, Math.exp(-((f - fp) ** 2) / (2 * sg * sg * fp * fp)));
    const dir = to + (2 * rnd() - 1) * P.CHOP_SPREAD * Math.PI / 180, w = 2 * Math.PI * f, k = w * w / g;
    comps.push({ S, kx: k * Math.cos(dir), ky: k * Math.sin(dir), w, ph: 2 * Math.PI * rnd() });
  }
  const sum = comps.reduce((a, c) => a + c.S, 0);
  for (const c of comps) c.a = Math.sqrt(2 * (Hs * Hs / 16) * c.S / sum);
  return { comps, Hs, Tp, lp: g * Tp * Tp / (2 * Math.PI) };
}
function chopAt(ch, x, y, t, ux, uy, Lavg) {      // elevation, gradient and ∂η/∂t; optional averaging over a length along (ux, uy)
  let eta = 0, gx = 0, gy = 0, et = 0;
  for (const c of ch.comps) { const th = c.kx * x + c.ky * y - c.w * t + c.ph, cs = Math.cos(th), sn = Math.sin(th);
    let a = c.a; if (Lavg) { const z = 0.5 * (c.kx * ux + c.ky * uy) * Lavg; a *= Math.abs(z) < 1e-6 ? 1 : Math.sin(z) / z; }   // the board spans short waves
    eta += a * cs; gx -= a * c.kx * sn; gy -= a * c.ky * sn; et += a * c.w * sn; }
  return { eta, gx, gy, et };
}

/* ---------------- Simulator ---------------- */
function createSim(opts = {}) {
  const P = PHYS, D2R = Math.PI / 180;
  const path = buildPath(LAYOUT.wheels, P);
  const sim = {
    path, t: 0, obs: buildObstacles(path, P), obstaclesOn: true,
    cableSpeed: (opts.cableKmh ?? P.CABLE_SPEED_KMH) / 3.6, // m/s
    leanCmdIn: 0,   // rad, input fra UI (før rate-begrænsning)
    leanCmd: 0,     // rad, rate-begrænset ønsket læn
    carrier: { s: 0, x: 0, y: 0, z: P.CABLE_HEIGHT, vx: 0, vy: 0, tx: 1, ty: 0 },
    tow: { x: 0, y: 0, z: P.CABLE_HEIGHT, vx: 0, vy: 0, vz: 0 },   // trækpunkt under carrieren (eftergiveligt ophæng)
    footShift: 0,   // m, fodtryk: + = vægt frem, − = vægt tilbage (styres fra UI)
    energy: { lineWork: 0, waterWork: 0, airWork: 0, muscleWork: 0, E0: null },
    // board-reference: x,y,z = boardets bund; phi = læn/kant (+ = højre rail ned), p = rollrate
    rider: { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, psi: 0, r: 0, phi: 0, p: 0, leg: 0.85, legv: 0, tau: 0.1, ankle: 0, arm: 0, theta: 0, q: 0 },
    wind: P.WIND_DEFAULT, chop: buildChop(P, P.WIND_DEFAULT), trail: [], _trailT: -1,
    spinIn: 0, grabIn: 0, windup: 0, windDir: 0, switchStance: false, grab: { type: 0, reach: 0 },
    strokeMax: P.ARM_TRAVEL, startMode: 'slide', releaseN: P.RELEASE_N, legBase: P.LEG_NOM, autoStand: false, jumpArmed: false,
    legCmdIn: 0.85, legCmd: 0.85, // m, ønsket hoftehøjde (input / rate-begrænset)
    line: { F: 0, stretch: 0, slack: true, attached: true, over: 0 },
    out: { V: 0, Vc: 0, angle: 0, inWater: true, drag: 0, lift: 0, warn: false, tau: 0, fall: '', contact: '', Fc: 0, air: false, lastAir: null },
    jump: null,
  };
  // Start dock geometry: u along the carpet axis (0 = centre), v across; surface height h(u)
  const DK = { ax: P.DOCK_DIR[0], ay: P.DOCK_DIR[1] };
  function dockAt(x, y) {
    const rx = x - P.DOCK_C[0], ry = y - P.DOCK_C[1];
    const u = rx * DK.ax + ry * DK.ay, v = -rx * DK.ay + ry * DK.ax, h2 = P.DOCK_LEN / 2;
    if (Math.abs(v) > P.DOCK_HALF_W || u < -h2 || u > h2) return null;
    const r0 = h2 - P.DOCK_RAMP, drop = P.DOCK_TOP + 0.15;              // ramp ends 0.15 m under water
    if (u <= r0) return { h: P.DOCK_TOP, slope: 0 };
    return { h: P.DOCK_TOP - drop * (u - r0) / P.DOCK_RAMP, slope: -drop / P.DOCK_RAMP };
  }
  sim.dockAt = dockAt;
  sim.setWind = U => { sim.wind = Math.max(0, U); sim.chop = buildChop(P, sim.wind); };
  // The board's own wake: sampled track points; each leaves two divergent crests at ±r·tan φ behind the board,
  // φ = WAKE_ANG_C/Fr_L (Mach-like regime at Fr_L > 0.5), wavelength from the Kelvin dispersion relation for that angle.
  function wakeParams(V) {
    const Fr = V / Math.sqrt(P.G * P.BOARD_LEN), phi = Math.min(19.47 * D2R, P.WAKE_ANG_C / Math.max(Fr, 0.5));
    const tp = Math.tan(phi), tt = Math.max(0.36, (1 + Math.sqrt(Math.max(0, 1 - 8 * tp * tp))) / (4 * tp));   // tanφ = tanθ/(1+2tan²θ)
    const c2 = 1 / (1 + tt * tt), lam = 2 * Math.PI * V * V * c2 / P.G;
    return { phi, tp, lam: Math.max(0.3, lam) };
  }
  function wakeOne(p, x, y, t) {                    // one track sample's contribution (0 outside its crests)
    const age = t - p.t; if (age < 0.4 || age > P.WAKE_TMAX) return 0;
    const dx = x - p.x, dy = y - p.y, ds = p.V * P.WAKE_DT, a = dx * p.ux + dy * p.uy;
    if (Math.abs(a) > 2.5 * ds) return 0;
    const r = p.V * age, yw = r * p.tp, b = Math.abs(-dx * p.uy + dy * p.ux) - yw;
    if (Math.abs(b) > p.lam) return 0;
    const A = P.WAKE_H0 * Math.min(1.5, p.N / 700) * Math.min(1.5, 8.33 / p.V) * Math.sqrt(P.WAKE_R0 / Math.max(r, P.WAKE_R0)) * Math.exp(-age / P.WAKE_TD);
    return A * Math.exp(-((a / ds) ** 2)) / 1.7725 * Math.cos(2 * Math.PI * b / p.lam) * Math.exp(-((b / (0.5 * p.lam)) ** 2));
  }
  function wakeEta(x, y, t) { let eta = 0; for (const p of sim.trail) eta += wakeOne(p, x, y, t); return eta; }
  sim.wakeOne = wakeOne;
  sim.wakeParams = wakeParams; sim.wakeEta = wakeEta;
  sim.waterAt = function (x, y, t, ux, uy, Lavg) {  // chop + wake: elevation, gradient, ∂η/∂t (board-averaged if Lavg)
    const c = chopAt(sim.chop, x, y, t, ux, uy, Lavg); if (!sim.trail.length) return c;
    const h = 0.05, w0 = wakeEta(x, y, t);
    c.eta += w0; c.gx += (wakeEta(x + h, y, t) - w0) / h; c.gy += (wakeEta(x, y + h, t) - w0) / h; c.et += (wakeEta(x, y, t + 0.02) - w0) / 0.02;
    return c;
  };
  const dockPt = u => [P.DOCK_C[0] + u * DK.ax, P.DOCK_C[1] + u * DK.ay];
  sim.setStartMode = m => { sim.startMode = ['slide', 'jump', 'sit'].includes(m) ? m : 'slide'; };
  sim.reset = function () {
    // Start at the start dock, facing along the first leg (A→F). The carrier leaves sheave A; the line tightens after ~2 s.
    const psi0 = Math.atan2(DK.ay, DK.ax), mode = sim.startMode;
    let x, y, z, leg = P.LEG_NOM;
    if (mode === 'sit') { [x, y] = dockPt(P.DOCK_LEN / 2 + 2.0); z = -0.25; leg = P.SIT_LEG; }     // in the water just off the carpet
    else if (mode === 'jump') { [x, y] = dockPt(P.DOCK_LEN / 2 - P.DOCK_RAMP - 0.3); z = P.DOCK_TOP; }  // at the edge before the ramp
    else { [x, y] = dockPt(-1.2); z = P.DOCK_TOP; }                                                   // standing on the carpet
    Object.assign(sim.rider, { x, y, z, vx: 0, vy: 0, vz: 0, r: 0, phi: 0, p: 0, leg, legv: 0, ankle: 0, tau: 0.1, arm: 0, psi: psi0, theta: mode === 'sit' ? 0.35 : 0.05, q: 0, hOff: 0 });
    sim._cop = 0; sim._thRef = undefined;
    sim.carrier.s = 0;
    placeCarrier(); Object.assign(sim.tow, { x: sim.carrier.x, y: sim.carrier.y, z: P.CABLE_HEIGHT, vx: sim.carrier.vx, vy: sim.carrier.vy, vz: 0 });
    Object.assign(sim.energy, { lineWork: 0, waterWork: 0, airWork: 0, muscleWork: 0, armWork: 0, E0: null });
    Object.assign(sim.line, { F: 0, attached: true, over: 0, slack: true, hp: [x, y, z + leg] });
    sim.legCmd = sim.legCmdIn = sim.legBase = leg;
    sim.autoStand = mode === 'sit'; sim.jumpArmed = mode === 'jump'; sim.startShift = mode === 'sit' ? P.SIT_SHIFT : 0;
    sim.out.fall = ''; sim.out.lastAir = null; sim.out.contact = ''; sim.out.startEvent = ''; sim.jump = null; sim.t = 0; sim.leanCmd = 0;
    sim.trail = []; sim._trailT = -1; sim.windup = 0; sim.windDir = 0; sim.switchStance = false; sim.grab = { type: 0, reach: 0 }; sim.out.lastTrick = null; sim._IzzPrev = null;
    sim.out.startPeak = 0; sim.strokeMax = P.ARM_TRAVEL + (mode === 'sit' ? P.STROKE_SIT : P.STROKE_STAND); sim._onDock = mode !== 'sit';
    for (const ob of sim.obs) ob.inContact = false;
    placeCarrier();
  };
  function placeCarrier() {
    const c = sim.carrier, p = pathAt(path, c.s);
    c.x = p.x; c.y = p.y; c.tx = p.tx; c.ty = p.ty;
    c.vx = c.tx * sim.cableSpeed; c.vy = c.ty * sim.cableSpeed;
  }
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  /* ---------- Vandmodel: returnerer kraft (på boardet), yaw-moment og diagnostik ---------- */
  function savitskyN(tauDeg, lam, V, b) {           // Savitsky C_L0 som kraft (N)
    return 0.5 * P.RHO_WATER * b * b * Math.pow(tauDeg, 1.1) * (0.0120 * Math.sqrt(lam) * V * V + 0.0055 * Math.pow(lam, 2.5) * P.G * b);
  }
  function cpFromTail(lw, V, b) {                   // Savitskys trykcentrum, målt fra halen (m)
    const lam = Math.max(0.3, lw / b), Cv2 = V * V / (P.G * b);
    return lw * (0.75 - 1 / (5.21 * Cv2 / (lam * lam) + 2.39));
  }
  function solveTrim(d, V, xload) {                 // momentligevægt: trykcentrum under lasten
    const b = P.BOARD_BEAM, Lb = P.BOARD_LEN, lwOf = t => Math.min(Lb, d / Math.sin(t));
    let lo = P.TRIM_MIN * D2R, hi = P.TRIM_MAX * D2R;
    const tFull = Math.asin(Math.min(1, d / Lb));  // under denne trim er hele boardet vådt
    if (cpFromTail(lwOf(Math.max(lo, tFull)), V, b) < xload) return Math.max(lo, tFull);  // trykcentret når ikke frem: fuldt vådt
    if (cpFromTail(lwOf(hi), V, b) > xload) return hi;
    for (let k = 0; k < 24; k++) { const mid = 0.5 * (lo + hi); if (cpFromTail(lwOf(mid), V, b) > xload) lo = mid; else hi = mid; }
    return 0.5 * (lo + hi);
  }
  function hydroWrench(s) {
    const { R, depth, V, inWater, attached, fwd, rgt, up, sp, cp, hx, hy, F, m, dt } = s, wr = s.wrel ?? R.vz;
    const out = { F: [0, 0, 0], Mz: 0, lift: 0, drag: 0, beta: 0, rCarve: 0, trim: 0, lw: 0, Df: 0, lp: 0, ma: 0, slam: 0, pitch: 0, Cv: 0, Re: 0 };
    if (!inWater) { R.tau += (6 * D2R - R.tau) * Math.min(1, dt / 0.3); out.pitch = R.tau; return out; }
    const b = P.BOARD_BEAM, Lb = P.BOARD_LEN, dd = Math.min(depth, P.D_MAX), q = 0.5 * P.RHO_WATER * V * V;
    const th = attached ? R.phi + R.ankle : 0;                                  // boardets kant = kroppens læn + ankel-kant
    const spB = Math.sin(th), cpB = Math.cos(th);
    out.Cv = V / Math.sqrt(P.G * b);
    // Trim fra momentligevægt (fodtryk flytter lasten), med pitch-inerti som 1.-ordens forsinkelse
    // Linens pitch-moment: træk fremad i hoftehøjde tipper rideren frem. Rideren udligner det meste ved at læne sig
    // tilbage; resten må vandet tage ved at flytte trykcentret frem (rapport 3.1 og 7.1: linemomentet er ikke valgfrit).
    // Load point = the rider's centre of pressure, from the fore–aft balance of the multi-body rider (step 6b)
    const xload = P.X_LOAD + Math.max(-P.COP_MAX, Math.min(P.COP_MAX, sim._cop || 0));
    out.xLine = sim._cop || 0;
    const tauEq = solveTrim(dd, V, xload);
    R.tau += (tauEq - R.tau) * Math.min(1, dt / P.PITCH_TAU);
    const tau = R.tau, tauDeg = tau / D2R;
    const lw = Math.min(Lb, dd / Math.max(Math.sin(tau), 0.01)), lam = Math.max(0.05, lw / b);
    out.trim = tau; out.lw = lw; out.lp = cpFromTail(lw, V, b);
    out.pitch = tau + 4 * P.ROCKER_H * (Lb - lw) / (Lb * Lb);                   // boardets pitch inkl. rocker-korrektion
    // Bundnormal: rullet om længdeaksen (kant) og tippet bagud (trim)
    // Near standstill the lift is hydrostatic and acts vertically on the whole body (no N·sin τ push backwards); the
    // tilt towards the Savitsky pressure-drag direction is blended in below ≈3 m/s. Assumed blend.
    const sT = Math.sin(tau) * Math.min(1, (V / 3) * (V / 3));
    const nb = attached ? [cpB * up[0] + spB * rgt[0] - sT * fwd[0], cpB * up[1] + spB * rgt[1] - sT * fwd[1], cpB * Math.cos(tau)] : up;
    // Ventilation ved dyb kant: glat overgang (rapport 13.6: ingen spring i koefficienterne)
    const vx_ = Math.max(0, Math.min(1, (Math.abs(th) / D2R - P.VENT_START) / P.VENT_SPAN)), vent = 1 - P.VENT_LOSS * vx_ * vx_ * (3 - 2 * vx_);
    out.vent = vent;
    if (attached) {
      // Dynamisk indfaldsvinkel α = τ + w/U (rapport 4.6): synker boardet (w < 0), rammer vandet det skarpere
      const tauDyn = Math.max(0.3, Math.min(P.TRIM_MAX + 8, tauDeg + Math.atan2(-wr, Math.max(V, 0.5)) / D2R));   // w relative to the (moving) surface
      const N0 = savitskyN(tauDyn, lam, V, b), CL0 = N0 / (q * b * b + 1e-6), bet = Math.abs(th) / D2R;
      const dead = 1 - 0.0065 * bet * Math.pow(Math.max(CL0, 1e-4), -0.4);
      out.lift = N0 * (0.25 + 0.75 / (1 + Math.exp(-(dead - 0.25) / 0.08)) * Math.max(0, Math.min(1, dead + 0.75)) ) * vent;   // glat klampning
    }
    // Hydrostatik: Savitskys λ^2,5-led dækker den våde kile; ekstra opdrift kun når boardet er helt vådt og synker dybere (dyb start)
    const buoy = P.RHO_WATER * P.G * P.BOARD_AREA * Math.max(0, dd - Lb * Math.sin(tau));
    for (let i = 0; i < 3; i++) out.F[i] += out.lift * nb[i];                   // inkl. trykdrag N·sin τ
    out.F[2] += buoy - P.HEAVE_C * wr;
    // Added mass og slamming (asymmetrisk: kun ved indtræden, ingen sug ved udtræden)
    if (P.ADDED_MASS) {
      out.ma = P.RHO_WATER * Math.PI * b * b * lw / 8;
      if (wr < 0 && lw < Lb) {
        const sEntry = Math.sin(Math.max(tau, P.ENTRY_MIN_DEG * D2R));
        out.slam = P.RHO_WATER * Math.PI * b * b / 8 * wr * wr / sEntry;   // = ṁ_a · |w|
        out.F[2] += out.slam;
      }
    }
    if (V > 1e-4) {
      // Friktion (ITTC-1957) over S_w = l_w b /(cos τ cos φ) + residual (spray/3D/finner) + pløjedrag ved lav fart
      out.Re = Math.max(1e4, V * Math.max(lw, 0.05) / P.NU_WATER);
      const Cf = 0.075 / Math.pow(Math.log10(out.Re) - 2, 2);
      out.Df = q * (lw * b / (Math.cos(tau) * Math.max(0.35, Math.cos(th)))) * Cf;
      const Dres = q * P.RESID_AREA * (1 + 2 * Math.sin(Math.abs(th)));          // spray vokser med kant
      const Dp = q * b * Math.max(0, dd - 0.03) * P.CD_PLOW * Math.exp(-((out.Cv / 1.5) ** 4));   // forsvinder når boardet planer (C_V > ~2)
      let drag = out.Df + Dres + Dp; out.Dres = Dres; out.Dplow = Dp; out.Dpress = out.lift * Math.sin(tau);
      out.F[0] -= drag * R.vx / V; out.F[1] -= drag * R.vy / V;
      const vf = R.vx * hx + R.vy * hy, vl = R.vx * rgt[0] + R.vy * rgt[1];
      const beta = Math.atan2(vl, Math.abs(vf) + 0.3);                          // sideslip: + = glider mod højre
      const imm2 = Math.min(lw / 0.3, 2), sb = Math.sin(beta), cb = Math.cos(beta);
      // Sidekraft Y = q S C_Y(φ, β): kant og sideslip er uafhængige tilstande (rapport 5.2).
      // Kantens bidrag ligger allerede i den tiltede normal; her er sideslip-delen fra rail + finner.
      // Fanger kanten: glider mod den nedsænkede rail. Glat funktion af (β, φ) i stedet for et spring.
      const same = attached ? 1 / (1 + Math.exp(-(beta * Math.sign(th || 1)) / (3 * D2R))) : 0;
      const catchK = 1 + P.CATCH_GAIN * Math.abs(spB) * same * Math.min(1, Math.abs(th) / (5 * D2R));
      const fs = -q * P.SIDE_AREA * P.SIDE_CLA * sb * cb * imm2 * catchK * vent;
      out.F[0] += fs * rgt[0]; out.F[1] += fs * rgt[1];
      const dslip = q * (P.SIDE_AREA * P.CD_SLIP + P.BOARD_AREA * P.SLIP_PLATE * Math.abs(sb)) * sb * sb * imm2;
      out.F[0] -= dslip * R.vx / V; out.F[1] -= dslip * R.vy / V; drag += dslip; out.Dslip = dslip;
      out.Mz += -q * P.FIN_AREA * P.FIN_CLA * sb * cb * P.FIN_ARM * Math.sign(vf || 1) - P.YAW_C_W * V * R.r;
      if (attached) {
        const dz = P.PIVOT_DEAD * D2R, ex = Math.abs(beta) > dz ? beta - Math.sign(beta) * dz : 0;
        out.Mz += -Math.max(-P.PIVOT_TAU_MAX, Math.min(P.PIVOT_TAU_MAX, P.PIVOT_K * ex));
        const Rgeo = Lb * Lb / (8 * P.ROCKER_H);
        out.rCarve = -Math.sign(vf || 1) * V * Math.sin(th) / (Rgeo * P.CARVE_SLIP);
        const grip = Math.min(1, lw / (0.5 * Lb)) * Math.min(1, V / 4);
        out.Mz += P.RIDER_IZZ * (out.rCarve - R.r) / P.CARVE_TAU * grip;          // carve authority (hydrodynamic gain, calibrated with RIDER_IZZ)
      }
      out.drag = drag; out.beta = beta;
    }
    return out;
  }

  sim.step = function () {
    const dt = P.DT, R = sim.rider, C = sim.carrier, m = P.RIDER_MASS, L = sim.line;
    // 1) Carrier: kinematisk, konstant hastighed langs kablet (inkl. buer om hjulene)
    C.s += sim.cableSpeed * dt; placeCarrier();
    // 1b) Trækpunkt: carrierens ophæng følger kablet med 2.-ordens eftergivelighed (ingen uendelig skarpe retningsskift)
    { const T = sim.tow, w = 2 * Math.PI * P.HANGER_F, z = P.HANGER_ZETA;
      const ax = w * w * (C.x - T.x) + 2 * z * w * (C.vx - T.vx), ay = w * w * (C.y - T.y) + 2 * z * w * (C.vy - T.vy);
      T.vx += ax * dt; T.vy += ay * dt; T.x += T.vx * dt; T.y += T.vy * dt; }
    // 2) Ønsket læn: rate-begrænset
    const maxd = P.LEAN_RATE_DEG * D2R * dt, lim = P.LEAN_MAX_DEG * D2R;
    const want = Math.max(-lim, Math.min(lim, sim.leanCmdIn * (sim.switchStance ? -1 : 1)));   // riding switch: the board frame is reversed
    sim.leanCmd += Math.max(-maxd, Math.min(maxd, want - sim.leanCmd));
    // Boardets akser
    const hx = Math.cos(R.psi), hy = Math.sin(R.psi);
    const fwd = [hx, hy, 0], rgt = [hy, -hx, 0], up = [0, 0, 1];
    const sp = Math.sin(R.phi), cp = Math.cos(R.phi);
    // Body axis: rolled about the board axis (lean/edge) and tilted back in the board's plane (fore–aft balance)
    const st = Math.sin(R.theta), ct = Math.cos(R.theta);
    const nrm = [ct * (cp * up[0] + sp * rgt[0]) - st * fwd[0], ct * (cp * up[1] + sp * rgt[1]) - st * fwd[1], ct * cp];
    const BI = bodyInertia(P, R.leg, P.RIDER_MASS - P.BOARD_MASS);          // pose-dependent inertia (de Leva segments)
    const Izz = BI.yaw + P.BOARD_YAW_I;
    // 3) Linekraft (kun træk) i håndtaget
    // benlængde-kommando (rate-begrænset)
    const grabbing = sim.jump && sim.grab.type && sim.grab.reach > 0;
    const lwant = grabbing ? P.GRAB_LEG : Math.max(P.LEG_MIN, Math.min(P.LEG_MAX, sim.legCmdIn)), lstep = P.LEG_RATE * dt;
    const legPrev = sim.legCmd; sim.legCmd += Math.max(-lstep, Math.min(lstep, lwant - sim.legCmd)); const legCmdV = (sim.legCmd - legPrev) / dt;
    const hH = R.leg + P.HANDLE_ABOVE_HIP + (R.hOff || 0);                   // hOff: arms raise/lower the handle (balance)
    const hp = [R.x + hH * nrm[0], R.y + hH * nrm[1], R.z + hH * nrm[2]];
    const TW = sim.tow;
    let d = [TW.x - hp[0], TW.y - hp[1], TW.z - hp[2]];
    const dist = Math.hypot(d[0], d[1], d[2]); d = [d[0] / dist, d[1] / dist, d[2] / dist];
    let e = dist - P.LINE_LENGTH - R.arm;                                      // the arms extend the hands towards the carrier
    const vh = [R.vx + R.legv * nrm[0], R.vy + R.legv * nrm[1], R.vz + R.legv * nrm[2]];   // håndtagets hastighed
    let edot = (TW.vx - vh[0]) * d[0] + (TW.vy - vh[1]) * d[1] + (0 - vh[2]) * d[2];
    const lineF = (e, ed) => (L.attached && e > 0) ? Math.max(0, P.LINE_K * e + Math.max(-P.LINE_CF_MAX, Math.min(P.LINE_CF_MAX, (ed > 0 ? P.LINE_C : P.LINE_C_REC) * ed))) : 0;
    let F = lineF(e, edot);
    // 3a) Jump start: take off just before the line comes taut, so the jerk has a smaller Δv to deliver
    if (L.attached && sim.jumpArmed && e < 0 && edot > 0.5 && -e / edot < P.JUMP_LEAD) {
      const hl = Math.hypot(d[0], d[1]) || 1, m2 = R.vx * R.vx + R.vy * R.vy + R.vz * R.vz;
      R.vx += P.JUMP_VF * d[0] / hl; R.vy += P.JUMP_VF * d[1] / hl; R.vz += P.JUMP_VZ;
      sim.energy.muscleWork += 0.5 * m * (R.vx * R.vx + R.vy * R.vy + R.vz * R.vz - m2);   // the legs deliver the take-off energy
      sim.jumpArmed = false; sim.out.startEvent = 'Jump start';
    }
    // 3b) Arms/shoulders: a force-limited, dissipative element in series with the line. Above ARM_YIELD the hands
    //     travel towards the carrier (eccentric work, energy is not returned); at low load the rider pulls them back to the hip.
    let dArm = 0;
    if (L.attached) {
      // During the start the whole body adds stroke (lean-back → upright, or sitting → standing); afterwards only the arms
      if (sim.strokeMax > P.ARM_TRAVEL && Math.hypot(R.vx, R.vy) > 0.9 * sim.cableSpeed) sim.strokeMax = P.ARM_TRAVEL;
      if (F > P.ARM_YIELD && R.arm < sim.strokeMax)
        dArm = Math.min((F - P.ARM_YIELD) / (P.LINE_K + (edot > 0 ? P.LINE_C : P.LINE_C_REC) / dt), P.ARM_V_MAX * dt, sim.strokeMax - R.arm);
      else if ((F < P.ARM_RET_FRAC * P.ARM_YIELD || R.arm > sim.strokeMax) && R.arm > 0) dArm = -Math.min(R.arm, P.ARM_RET_V * dt);
      if (dArm) { R.arm += dArm; e -= dArm; edot -= dArm / dt; F = lineF(e, edot); sim.energy.armWork = (sim.energy.armWork || 0) + F * dArm; }
      // (work the line does on the hands relative to the body; absorbed by the arms, never reaches the body's kinetic energy)
    }
    const Fl = [F * d[0], F * d[1], F * d[2]];
    // 4) Tyngde + luftdrag (på tyngdepunkt)
    const Fw = [0, 0, 0];               // vandkræfter, angriber i boardet
    const mb = P.BOARD_MASS, mu = m - mb;
    const Fo = [0, 0, -mu * P.G];       // overkrop: tyngde + luftdrag (+ line)
    Fw[2] -= mb * P.G;                  // boardets egen tyngde
    const Va = Math.hypot(R.vx, R.vy, R.vz);
    const cda = L.attached ? P.CDA_AIR : P.FALLEN_CDA;
    const rho = (!L.attached && R.z < 0) ? P.RHO_WATER : P.RHO_AIR;
    if (Va > 1e-6) { const q = 0.5 * rho * Va * cda; Fo[0] -= q * R.vx; Fo[1] -= q * R.vy; Fo[2] -= q * R.vz; }
    // 5) Hydrodynamik: samlet i én model-funktion (rapport 13.3), så den senere kan udskiftes med et kalibreret kort
    const WS = sim.waterAt(R.x, R.y, sim.t, Math.cos(R.psi), Math.sin(R.psi), 1.0);                                  // local water surface (chop + wake)
    const depth = WS.eta - R.z, V = Math.hypot(R.vx, R.vy), inWater = depth > 0;
    const wrel = R.vz - (WS.et + R.vx * WS.gx + R.vy * WS.gy);                // vertical velocity relative to the moving surface
    const H = hydroWrench({ R, depth, V, inWater, wrel, attached: L.attached, fwd, rgt, up, sp, cp, hx, hy, F, m, dt, Ffwd: dot(Fl, fwd) });
    sim._Nprev = H.lift || sim._Nprev;
    for (let i = 0; i < 3; i++) Fw[i] += H.F[i];
    let Mz = -(sim.jump ? P.YAW_C_AIR : P.YAW_C) * R.r + H.Mz;                   // in the air only aerodynamic yaw damping
    const MrollW = inWater ? -P.ROLL_C_W * V * R.p : 0;
    const { lift, drag, beta, rCarve, trim, lw, Df } = H;
    // 5a) I luften: rideren drejer boardet ind mod flyveretningen før landing (fødder/hofter)
    if (!inWater && L.attached && V > 2) {
      // heading error to the nearest of straight or switch (twin-tip board): + = nose left of the flight direction
      const e0 = Math.atan2(Math.sin(R.psi - Math.atan2(R.vy, R.vx)), Math.cos(R.psi - Math.atan2(R.vy, R.vx)));
      const ba = Math.abs(e0) <= Math.PI / 2 ? e0 : e0 - Math.PI * Math.sign(e0);
      // Spotting the landing: only when not spinning and already close to straight or switch; otherwise the spin runs free
      if (!(sim.jump && (sim.spinIn || Math.abs(ba) > P.SPOT_DEG * D2R || (R.vz > 0 && Math.abs(R.r) > 1))))   // spot only on the way down
        Mz += -Math.max(-P.PIVOT_TAU_MAX, Math.min(P.PIVOT_TAU_MAX, P.PIVOT_K * 2 * ba)) - 20 * R.r;
    }
    // Spin in the air: the only external yaw torque available is the line, via the handle held off to the side
    if (sim.jump && L.attached && sim.spinIn) Mz += sim.spinIn * Math.min(P.SPIN_TAU_MAX, F * P.SPIN_LEVER);
    // 5b) Obstakler: penalty-kontakt med normalkraft + Coulomb-friktion (angriber i boardet)
    let contactName = '', Fc = 0;
    if (L.attached && sim.obstaclesOn) for (const ob of sim.obs) {
      const rx = R.x - ob.x, ry = R.y - ob.y;
      const u = rx * ob.ax + ry * ob.ay, v = -rx * ob.ay + ry * ob.ax;
      const hp_ = Math.abs(v) <= ob.halfW ? profileAt(ob.prof, u) : null;
      if (!hp_ || R.z >= hp_[0]) { ob.inContact = false; continue; }
      const pen = hp_[0] - R.z;
      if (!ob.inContact && pen > P.STEP_MAX) {   // ramte en kant/side: kollision
        L.attached = false; sim.out.fall = `Collision with ${ob.name}`; ob.inContact = false; break;
      }
      ob.inContact = true;
      const sl = hp_[1], nl = Math.hypot(sl, 1);
      const n = [-sl * ob.ax / nl, -sl * ob.ay / nl, 1 / nl];
      const vn = R.vx * n[0] + R.vy * n[1] + R.vz * n[2];
      const N = Math.max(0, P.OBS_K * pen / nl - P.OBS_C * vn);
      const vt = [R.vx - vn * n[0], R.vy - vn * n[1], R.vz - vn * n[2]], vtl = Math.hypot(vt[0], vt[1], vt[2]);
      const mu = ob.type === 'rail' ? P.MU_RAIL : P.MU_SLIDE;
      for (let i = 0; i < 3; i++) Fw[i] += N * n[i] - (vtl > 1e-3 ? mu * N * vt[i] / vtl : 0);
      contactName = ob.name; Fc += N;
    }
    // 5c) Start dock: carpet on a floating pontoon, low sliding friction (sliding start)
    let onDock = false;
    if (L.attached) {
      const dk = dockAt(R.x, R.y);
      if (dk && R.z < dk.h && (sim._onDock || dk.h - R.z < 0.12)) {        // only from above: under the pontoon there is no contact
        const pen = dk.h - R.z, sl = dk.slope, nl = Math.hypot(sl, 1), ax = P.DOCK_DIR[0], ay = P.DOCK_DIR[1];
        const n = [-sl * ax / nl, -sl * ay / nl, 1 / nl];
        const vn = R.vx * n[0] + R.vy * n[1] + R.vz * n[2];
        const N = Math.max(0, P.OBS_K * pen / nl - P.OBS_C * vn);
        const vt = [R.vx - vn * n[0], R.vy - vn * n[1], R.vz - vn * n[2]], vtl = Math.hypot(vt[0], vt[1], vt[2]);
        for (let i = 0; i < 3; i++) Fw[i] += N * n[i] - (vtl > 1e-3 ? P.MU_CARPET * N * vt[i] / vtl : 0);
        Fc += N; onDock = N > 0; if (!contactName) contactName = 'start dock';
      }
    }
    sim._onDock = onDock;
    // Sitting start: stand up once the board is planing
    if (sim.autoStand && L.attached && V > P.SIT_STAND_V) { sim.autoStand = false; sim.startShift = 0; sim.legBase = P.LEG_NOM; sim.out.startEvent = 'Standing up'; }
    const supported = inWater || Fc > 0;

    // 6) Roll (stift legeme om længdeaksen gennem tyngdepunktet)
    let tau = 0;
    if (L.attached) {
      const hcg = mu * (R.leg + P.UPPER_CG) / m;                                                   // samlet CG over board
      const rB = [-hcg * nrm[0], -hcg * nrm[1], -hcg * nrm[2]];                                     // board rel. CG
      const k = R.leg + P.HANDLE_ABOVE_HIP - hcg, rH = [k * nrm[0], k * nrm[1], k * nrm[2]];                               // håndtag rel. CG
      const tExt = dot(cross(rB, Fw), fwd) + dot(cross(rH, Fl), fwd);
      tau = Math.max(-P.LEAN_TAU_MAX, Math.min(P.LEAN_TAU_MAX, P.LEAN_KP * (sim.leanCmd - R.phi) - P.LEAN_KD * R.p));
      // Lean stop at LEAN_MAX_DEG: the rider braces against leaning further (limited torque, so a hard pull can still topple him)
      const over = Math.abs(R.phi) - P.LEAN_MAX_DEG * D2R;
      if (over > 0) tau -= Math.sign(R.phi) * Math.min(P.LEAN_STOP_TAU, P.LEAN_STOP_K * over + P.LEAN_KD * 2 * Math.max(0, Math.sign(R.phi) * R.p));
      // I luften kan riderens muskler ikke ændre kroppens samlede impulsmoment (rapport 6.2): kun linens moment og
      // luftdæmpning virker på kroppens roll. Rideren kan i stedet kante BOARDET i forhold til kroppen med anklerne.
      const tRoll = supported ? tExt + tau - P.ROLL_C * R.p + MrollW : dot(cross(rH, Fl), fwd) - P.ROLL_C * R.p;
      const aRate = P.ANKLE_RATE * D2R * dt, aMax = P.ANKLE_MAX * D2R;
      const aWant = supported ? 0 : Math.max(-aMax, Math.min(aMax, -R.phi));        // i luften: fladt board til landing
      R.ankle += Math.max(-aRate, Math.min(aRate, aWant - R.ankle));
      R.p += tRoll / (BI.roll + P.ROLL_I_BOARD) * dt; R.phi += R.p * dt;
    } else { R.p = 0; R.phi += (Math.PI / 2 * Math.sign(R.phi || 1) - R.phi) * Math.min(1, 3 * dt); }
    // 6b) Fore–aft balance (body pitch in the board's plane). The water reaction must pass through the centre of mass:
    //     the rider aims for θ_ref = atan(backward water force / normal force), offset by the foot-pressure input, and
    //     corrects by moving the centre of pressure between the bindings (limited to ±COP_MAX).
    let copCmd = 0;
    if (L.attached) {
      const hcg = mu * (R.leg + P.UPPER_CG) / m;
      const rB = [-hcg * nrm[0], -hcg * nrm[1], -hcg * nrm[2]], k = hH - hcg, rH = [k * nrm[0], k * nrm[1], k * nrm[2]];
      const Mline = dot(cross(rH, Fl), rgt), Mw = dot(cross(rB, Fw), rgt);
      const Fperp = dot(Fl, fwd) * Math.cos(R.theta) + Fl[2] * Math.sin(R.theta);      // line force across the body axis (in the board plane)
      const Nsup = Math.max(0, dot(Fw, nrm)), Dback = Math.max(0, -dot(Fw, fwd));
      const shift = Math.max(-P.FOOT_SHIFT_MAX, Math.min(P.FOOT_SHIFT_MAX, sim.footShift + (sim.startShift || 0)));
      // Equilibrium: the water force, seen in the fore–aft plane of the rolled body, points through the centre of mass
      const nR = [cp * up[0] + sp * rgt[0], cp * up[1] + sp * rgt[1], cp], Fn = dot(Fw, nR);
      const thEq = Math.atan2(Dback, Math.max(Fn, 0.6 * m * P.G));
      const want = Math.max(-10 * D2R, Math.min(P.PITCH_REF_MAX * D2R, thEq - shift / Math.max(hcg, 0.4)));
      sim._thRef = (sim._thRef ?? want) + (want - (sim._thRef ?? want)) * Math.min(1, dt / P.PITCH_REF_TAU);
      const thRef = sim._thRef;
      let tp = 0;
      // Sitting in the water before the pull: the life vest and the water behind the rider carry the body, so the
      // balance is not limited to the bindings (no pitch fall until the rider has stood up)
      const sitting = sim.autoStand && R.z < 0;
      const tWant = P.PITCH_KP * (thRef - R.theta) - P.PITCH_KD * R.q;
      if (sitting) { tp = tWant; copCmd = 0; }
      else if (supported) {
        // Ankle strategy: move the centre of pressure along the board between the bindings (changes the board's trim);
        // the moment is COP × vertical support force. Hip strategy: swing legs and board under the body with the hip
        // muscles (Horak & Nashner 1986), limited torque.
        const Nc = Math.max(0, Fw[2]);
        const tc = Math.max(-Nc * P.COP_MAX, Math.min(Nc * P.COP_MAX, tWant)); copCmd = Nc > 30 ? tc / Nc : 0;
        tp = tc + Math.max(-P.HIP_TAU_MAX, Math.min(P.HIP_TAU_MAX, tWant - tc));
      }
      // What the feet cannot deliver, the arms try with the line: raise the handle to tip forward, lower it to tip back
      const rest = tWant - tp, hWant = Math.abs(Fperp) > 50 ? Math.max(-P.HANDLE_RANGE, Math.min(P.HANDLE_RANGE, -rest / Fperp)) : 0;
      R.hOff = (R.hOff || 0) + Math.max(-P.HANDLE_RATE * dt, Math.min(P.HANDLE_RATE * dt, hWant - (R.hOff || 0)));
      const Mp = (supported ? Mline + Mw + tp : Mline) - P.PITCH_C * R.q;
      R.q += Mp / (BI.pitch + P.PITCH_I_BOARD) * dt; R.theta += R.q * dt;
      if (!supported) R.theta += (0 - R.theta) * 0;                          // in the air: angular momentum is kept (report 6.2)
    } else { R.q = 0; R.theta *= 1 - Math.min(1, 3 * dt); }
    sim._cop = copCmd;
    // 7) Translation + yaw (semi-implicit Euler)
    // Ben: kraft langs kropsaksen n mellem board og overkrop (servo + mekaniske stop)
    let Fleg = 0;
    if (L.attached) {
      Fleg = mu * P.G * nrm[2] + P.LEG_K * (sim.legCmd - R.leg) + P.LEG_C * (legCmdV - R.legv);   // feedforward + servo om ønsket bane
      const Fcap = legForceMax(P, R.leg, R.legv);                           // knee torque × geometry × force–velocity
      Fleg = Math.max(P.LEG_F_MIN, Math.min(Fcap, Fleg));
      // Pop = maximal push: full force until the legs are straight (not servo controlled)
      if (sim.legCmdIn >= P.LEG_MAX - 1e-3 && R.leg < P.LEG_MAX - 0.04 && R.legv > -0.3 && (inWater || Fc > 0)) Fleg = Fcap;
    }
    if (R.leg < P.LEG_MIN) Fleg += P.LEG_STOP_K * (P.LEG_MIN - R.leg) - P.LEG_STOP_C * Math.min(0, R.legv);
    if (R.leg > P.LEG_MAX) Fleg -= P.LEG_STOP_K * (R.leg - P.LEG_MAX) + P.LEG_STOP_C * Math.max(0, R.legv);
    const Fu = [Fl[0] + Fo[0], Fl[1] + Fo[1], Fl[2] + Fo[2]];        // på overkrop
    const Fb = Fw;                                                   // på board
    const Fun = dot(Fu, nrm), Fbn = dot(Fb, nrm);
    // tværs af n: stift koblet (samlet masse); langs n: to masser med benkraft imellem
    // Board + medsvingende vand (added mass). Asymmetrisk: vandet kan ikke holde boardet fast, når det accelererer
    // op og ud (ingen sug ved udtræden, rapport 7.6) — så bruges kun boardets egen masse.
    const aOut = (Fbn - Fleg) / mb, exiting = aOut > 0 && R.vz > -0.05;
    const mbEff = mb + (L.attached && !exiting ? H.ma : 0);
    const aN_b = (Fbn - Fleg) / mbEff;
    const aPerp = [0, 1, 2].map(i => ((Fu[i] - Fun * nrm[i]) + (Fb[i] - Fbn * nrm[i])) / m);
    const legAcc = (Fleg + Fun) / mu - aN_b;
    // Effekt-regnskab (rapport 8): kablets effekt og arbejde fra vand, luft og muskler
    const vU = [R.vx + R.legv * nrm[0], R.vy + R.legv * nrm[1], R.vz + R.legv * nrm[2]];
    const Pcable = F * (d[0] * TW.vx + d[1] * TW.vy);                            // T q·v_trækpunkt
    const Pline = dot(Fl, vU), Pwater = (Fw[0]) * R.vx + (Fw[1]) * R.vy + (Fw[2] + mb * P.G) * R.vz;
    const Pair = (Fo[0]) * vU[0] + (Fo[1]) * vU[1] + (Fo[2] + mu * P.G) * vU[2], Pmus = Fleg * R.legv;
    const EN = sim.energy; EN.lineWork += Pline * dt; EN.waterWork += Pwater * dt; EN.airWork += Pair * dt; EN.muscleWork += Pmus * dt;
    R.vx += (aPerp[0] + aN_b * nrm[0]) * dt; R.vy += (aPerp[1] + aN_b * nrm[1]) * dt; R.vz += (aPerp[2] + aN_b * nrm[2]) * dt;
    R.legv += legAcc * dt; R.leg += R.legv * dt;
    R.x += R.vx * dt; R.y += R.vy * dt; R.z += R.vz * dt;
    if (L.attached && R.leg < P.LEG_MIN - 0.02 && R.legv < -P.BOTTOM_OUT_V) { L.attached = false; sim.out.fall = `Knees bottomed out (${(-R.legv).toFixed(1)} m/s)`; }
    sim._Izz = P.YAW_I_FROM_BODY ? Izz : P.RIDER_IZZ;
    if (sim.jump && sim._IzzPrev) R.r *= sim._IzzPrev / sim._Izz;               // in the air: I·ω conserved when tucking/extending
    sim._IzzPrev = sim._Izz;
    R.r += Mz / sim._Izz * dt; R.psi += R.r * dt;
    if (R.z < -1.5) { R.z = -1.5; R.vz = Math.max(0, R.vz); }
    // 8) Fald: håndtag glipper ved ryk, eller for meget læn
    if (L.attached) {
      const relN = sim.releaseN * (sim.grab.reach > 0 ? P.GRAB_GRIP : 1);          // one hand off the handle while grabbing
      L.over = F > relN ? L.over + dt : 0;
      if (L.over > P.RELEASE_TIME) { L.attached = false; sim.out.fall = `Lost the cable: ${F.toFixed(0)} N > ${(relN / 1000).toFixed(1)} kN limit${relN < sim.releaseN ? ' (one hand)' : ''}`; }
      else if (Math.abs(R.phi) > P.FALL_DEG * D2R) { L.attached = false; sim.out.fall = `Fell: lean ${(R.phi / D2R).toFixed(0)}°`; }
      else if (R.theta > P.PITCH_FALL_BACK * D2R && !sim.autoStand) { L.attached = false; sim.out.fall = `Sat down: leaned back ${(R.theta / D2R).toFixed(0)}°`; }
      else if (R.theta < -P.PITCH_FALL_FWD * D2R) { L.attached = false; sim.out.fall = `Pulled over the nose (${(-R.theta / D2R).toFixed(0)}° forward)`; }
    }
    // 8b) Hop: luftfase = hverken i vand eller på obstakel. Mål tid og højde, tjek landing.
    const airborne = L.attached && !supported && R.z - WS.eta > 0.02;
    // Pre-wind while still supported (Q/R held before the lip)
    if (!airborne) {
      if (sim.spinIn && supported) { sim.windDir = sim.spinIn; sim.windup = Math.min(1, sim.windup + dt / P.SPIN_WIND_T); }
      else sim.windup = Math.max(0, sim.windup - dt / 0.3);
    }
    if (airborne && !sim.jump) {
      sim.jump = { t0: sim.t, hmax: R.z, from: sim.out.contact || 'water', rot: 0, grabs: {} };
      if (sim.windup > 0.05) R.r += sim.windDir * P.SPIN_POP * sim.windup;       // take-off twist against the lip
      sim.windup = 0;
    }
    // Grabs (only in the air): the hand travels to the nose/tail, then the grab time counts
    const gIn = sim.jump ? sim.grabIn : 0, G = sim.grab;
    if (gIn && (G.type === gIn || G.reach <= 0)) { G.type = gIn; G.reach = Math.min(1, G.reach + dt / P.GRAB_REACH); }
    else { G.reach = Math.max(0, G.reach - dt / 0.12); if (G.reach <= 0) G.type = 0; }
    if (sim.jump) {
      sim.jump.hmax = Math.max(sim.jump.hmax, R.z); sim.jump.rot += R.r * dt;
      if (G.type && G.reach >= 1) { const k = G.type > 0 ? 'Nose grab' : 'Tail grab'; sim.jump.grabs[k] = (sim.jump.grabs[k] || 0) + dt; }
      if (!airborne) {
        const dur = sim.t - sim.jump.t0, J = sim.jump;
        if (dur > 0.15) sim.out.lastAir = { dur, hmax: J.hmax, from: J.from, vz: R.vz };
        if (L.attached) {
          const vh = Math.atan2(R.vy, R.vx), e = Math.atan2(Math.sin(R.psi - vh), Math.cos(R.psi - vh)), off = Math.min(Math.abs(e), Math.PI - Math.abs(e));
          if (R.vz < -P.LAND_VZ_MAX) { L.attached = false; sim.out.fall = `Hard landing: ${(-R.vz).toFixed(1)} m/s vertical`; }
          else if (G.reach > 0.3) { L.attached = false; sim.out.fall = `Landed still holding the ${G.type > 0 ? 'nose' : 'tail'}`; }
          else if (Math.hypot(R.vx, R.vy) > 2 && off > P.LAND_TWIST_MAX * D2R) { L.attached = false; sim.out.fall = `Landed sideways (${(off / D2R).toFixed(0)}° off)`; }
          else {
            if (Math.abs(e) > Math.PI / 2) {                                        // landed switch: twin-tip board, flip the board frame
              R.psi += Math.PI; sim.switchStance = !sim.switchStance;
              R.phi = -R.phi; R.p = -R.p; R.ankle = -R.ankle; R.theta = -R.theta; R.q = -R.q; sim.leanCmd = -sim.leanCmd; sim._cop = -(sim._cop || 0); sim._thRef = undefined;
            }
            const deg = Math.round(Math.abs(J.rot) / Math.PI) * 180, grabs = Object.entries(J.grabs).filter(([, t]) => t >= P.GRAB_MIN).map(([k]) => k);
            const name = [deg ? `${deg} ${J.rot > 0 ? 'left' : 'right'}` : '', ...grabs].filter(Boolean).join(' + ');
            if (dur > 0.15) sim.out.lastTrick = { name: name || 'Straight air', deg, dir: Math.sign(J.rot), grabs, dur, t: sim.t, switchLanding: sim.switchStance };
          }
        }
        sim.jump = null;
      }
    }
    // 9) Output
    L.F = F; L.stretch = e; L.slack = !L.attached || e <= 0; L.hp = hp;
    const o = sim.out;
    o.V = Math.hypot(R.vx, R.vy, R.vz); o.Vc = Math.hypot(C.vx, C.vy);
    o.angle = Math.acos(Math.max(-1, Math.min(1, d[0] * C.tx + d[1] * C.ty))) / D2R; // 0° = lige bag carrier (3D)
    o.inWater = inWater; o.drag = drag; o.lift = lift; o.tau = tau;
    o.warn = F > P.WARN_FRAC * sim.releaseN; o.dock = onDock; o.arm = R.arm; if (sim.t < 15) o.startPeak = Math.max(o.startPeak || 0, F); o.contact = contactName; o.Fc = Fc; o.air = airborne; o.Fleg = Fleg; o.beta = beta; o.rCarve = rCarve; o.trim = trim; o.lw = lw; o.Df = Df; o.Dw = drag + lift * Math.sin(trim);
    o.pitch = H.pitch; o.theta = R.theta; o.cop = sim._cop; o.Ilean = BI.roll; o.beta_knee = BI.beta; o.FlegMax = legForceMax(P, R.leg, R.legv); o.lp = H.lp; o.ma = H.ma; o.slam = H.slam; o.Cv = H.Cv; o.Re = H.Re; o.Pcable = Pcable; o.Pline = Pline;
    o.Dpress = H.Dpress || 0; o.Dres = H.Dres || 0; o.Dslip = H.Dslip || 0; o.Dplow = H.Dplow || 0; o.vent = H.vent ?? 1; o.xLine = H.xLine || 0;
    o.Fr = V / Math.sqrt(P.G * P.BOARD_LEN); o.We = P.RHO_WATER * V * V * P.BOARD_LEN / 0.072; o.stretch = e; o.ankle = R.ankle;
    // Mekanisk energi (kinetisk + potentiel + elastisk i linen) til energitjek
    const vU2 = [R.vx + R.legv * nrm[0], R.vy + R.legv * nrm[1], R.vz + R.legv * nrm[2]];
    const Ek = 0.5 * mb * (R.vx * R.vx + R.vy * R.vy + R.vz * R.vz) + 0.5 * mu * dot(vU2, vU2);
    const Ep = mb * P.G * R.z + mu * P.G * (R.z + R.leg * nrm[2]), Ee = e > 0 && L.attached ? 0.5 * P.LINE_K * e * e : 0;   // e already includes the arm extension
    o.E = Ek + Ep + Ee; if (EN.E0 === null) EN.E0 = o.E;
    o.Eres = o.E - EN.E0 - (EN.lineWork + EN.waterWork + EN.airWork + EN.muscleWork);
    // Wake sampling (planing only)
    if (inWater && L.attached && V > 4 && sim.t - sim._trailT >= P.WAKE_DT) {
      const wp = wakeParams(V); sim._trailT = sim.t;
      sim.trail.push({ x: R.x, y: R.y, t: sim.t, ux: R.vx / V, uy: R.vy / V, V, N: Math.max(0, H.lift || 0), tp: wp.tp, lam: wp.lam });
      while (sim.trail.length && sim.t - sim.trail[0].t > P.WAKE_TMAX) sim.trail.shift();
    }
    o.eta = WS.eta; o.wrel = wrel; o.Hs = sim.chop.Hs; o.Tp = sim.chop.Tp;
    sim.t += dt;
  };
  sim.reset();
  return sim;
}

if (typeof module !== 'undefined' && module.exports) module.exports = { PHYS, LAYOUT, createSim, buildPath, pathAt, profileAt, bodyInertia, legForceMax, kneeGeom };
