# CCP kontrolkabine, start og lounge

Modellen er håndmodelleret efter brugerens fotos fra 1. oktober 2026. Den er en
visuel rekonstruktion, ikke fotogrammetri eller en opmåling. Geometrien ligger i
`src/start_area.js` og indlejres i simulatoren ved `python build.py`.

## Fotogrundlag

Originalerne ligger i brugerens `Photos/CCP`-mappe. De vigtigste referencer er:

- `OA_OB_OC_OD_TA_TB_TC_controltower_start_lounge_IMG20261001164327.heic`:
  panorama af dæk, kabine, start og trappesæder.
- `OB_OC_OD_OE_OF_OG_OH_OI_TA_TD_TE_TF_controltower_start_lounge_IMG20261001164407.heic`:
  sort endevæg med CITY LIFT A/S-skilt, fladt tag og orange kabelbeskyttelse.
- `OA_OB_OC_OD_TA_TD_controltower_start_IMG20261001164253.heic`:
  åben operatørside og blå startflade.
- `OE_OF_OG_OH_OI_TA_controltower_start_IMG20261001162052.heic` og
  `TA_controltower_start_IMG20261001162100.heic`: blå adgangsflade, niveauer og kanten mod vandet.
- `TA_controltower_start_lounge_IMG20261001170529.heic`,
  `TA_controltower_start_lounge_IMG20261001171133.heic` og
  `TA_controltower_start_lounge_IMG20261001171134.heic`:
  modsatte side, pæle, kabinevinduer, mast og siddepladser.
- `OA_OB_OC_TB_TC_start_lounge_IMG20261001164249.heic`: trappesæder og trædæk.

## Synlige detaljer og skøn

Fotos understøtter den lave sorte kontrolkabine, lodret beklædning, næsten fladt
tag med udhæng, vinduer, åben betjeningsside, hvidt sponsorskilt, blåt starttæppe,
vejrbidt trædæk på pæle, trappesæder, tovgelænder og mastens gitterkonstruktion.

Følgende er skøn, valgt for at passe ind i simulatorens koordinater:

| Del | Antaget størrelse |
|---|---|
| Hoveddæk | 18 × 7,5 m, overflade 0,75 m over vand |
| Kabine | 3 × 3 m, væghøjde 2,7 m over dækket |
| Lounge | Tre sektioner, tre trin, trinhøjde 0,38 m |
| Pæle | Diameter ca. 0,28 m; skjult længde er illustrativ |
| Mast | Eksisterende mastfod, hjulposition og kabelhøjde fra LAYOUT/PHYS |

Mål, antal pæle/brædder, præcis orientering, indretning, udstyr og skjulte sider
er ikke verificeret. Betjeningspult, boards og tasker er forenklede illustrationer.
Skiltet er gengivet som tekst; fotos og personer er ikke brugt som teksturer.
Panoramafotos kan forvrænge vinkler og proportioner. En kendt dæklængde og et mål
på kabinen vil gøre en senere skalering mere pålidelig.

## Samspil med simulatoren

- Lokalt x følger `PHYS.DOCK_DIR`, y er op, z går fra startfladen ind mod loungen.
- Modellen registreres ved `PHYS.DOCK_C`; meter er fælles enhed.
- Starttæppets kontaktflade bruger fortsat `DOCK_LEN`, `DOCK_HALF_W`, `DOCK_TOP`
  og `DOCK_RAMP`. Den er blevet blå som på billederne.
- Den bredere adgangsflade, dæk, kabine, sæder og mast er kun visuelle. Der er
  ingen ny kollisionsfysik på disse dele.
- Den gamle skematiske pavillon/platform og startmastens simple rør erstattes.
- Kameraet **Start / lounge** pauser simuleringen og kan drejes/zoomes som Orbit.
  `#start-area` åbner direkte i denne visning. **Run** starter simuleringen igen.
- Statiske detaljer samles efter materiale og del for at begrænse draw calls.

## Eksport

`python tools/export_start_area.py` eksporterer den byggede scene via den samme
Three.js-version som simulatoren og genindlæser GLB-filen som kontrol. Scriptet
kræver Python Playwright, Chromium og adgang til det eksisterende Three.js-CDN.

- `dist/ccp_control_start_lounge.glb`: selvstændig model med materialer og skilt.
  Lokalt nulpunkt ved startfladen, y op, meter; vand/omgivelser/rider er udeladt.
- `dist/start-area-preview.png`: oversigt i simulatoren.
- `dist/start-area-detail.png`: nærvisning.

GLB-filen kan importeres i et 3D-program og kræver ikke de originale fotos.
