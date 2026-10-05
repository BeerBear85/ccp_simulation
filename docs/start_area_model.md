# CCP kontrolkabine, start og lounge

Modellen er håndmodelleret efter brugerens fotos fra 1. oktober 2026. Den er en
visuel rekonstruktion, ikke fotogrammetri eller en opmåling. Geometrien ligger i
`src/start_area.js` og indlejres i simulatoren ved `python build.py`.

## Fotogrundlag

Originalerne ligger i brugerens `Photos/CCP`-mappe. De vigtigste referencer er:

- De supplerende fotos `9763.jpg`, `9800.jpg`, `9801.jpg` og `9839.jpg`:
  den brede, lange blå rampe langs dækkets kant og det lave startpodie ved
  kabinen. `9801` og `9839` viser én skrå gittermast med ét fæste ved enden af
  den inderste sidebro, ikke en A-ramme med to ben på loungedækket.

- Google Earth-billederne `9860.jpg`–`9864.jpg`, tilføjet 3. oktober 2026:
  `9860` bruges til planens retninger og forbindelser, de øvrige fire vinkler til
  at kontrollere kabinens hjørneplacering, sæder og sidebroer. Billederne viser,
  at basen følger den gennemgående bro, ikke starttæppets retning.

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
| Blå adgangsrampe | Ca. 7,1 m lang, ca. 2,3 m bred, fald 0,5 m; fotoskøn |
| Mast | Én 0,64 m bred gittermast; fod ved inderste sidebros vandende |
| Gangbroer | Bredde 1,8–2,4 m; adgang til vej, to sidearme og lang tværbro |

Mål, antal pæle/brædder, præcis orientering, indretning, udstyr og skjulte sider
er ikke verificeret. Betjeningspult, boards og tasker er forenklede illustrationer.
Skiltet er gengivet som tekst; fotos og personer er ikke brugt som teksturer.
Panoramafotos kan forvrænge vinkler og proportioner. En kendt dæklængde og et mål
på kabinen vil gøre en senere skalering mere pålidelig.

## Samspil med simulatoren

- Lokalt x følger `LAYOUT.jetty[1] → LAYOUT.jetty[2]`, y er op, z går fra
  vandsiden mod loungen. Det giver ca. −48,2° i verdensplanet, en korrektion på
  ca. 43° fra den første models retning på −5,2°.
- Modellen registreres ved `PHYS.DOCK_C`; meter er fælles enhed.
- Kabinen står på et fremspring i det hjørne, der vender mod vejen og vandet.
- Den gennemgående bro fortsætter fra dækkets ende mod TB. Tværbroen går ud
  ved siden af sæderne gennem en åbning i rækværket. Adgangsbroen har to
  sidearme mod vandet og åbninger i tovrækværket ved deres tilslutninger.
- Adgangsbroen skærer den eksisterende kystlinje og fortsætter som rampe til
  vejens nærmeste kant. Den gamle, korte brostump og overlappende flader er
  fjernet fra scenen. Både broerne og deres understøtning indgår i GLB-filen.
- Broernes forbindelser og relative retning følger de nye billeder. Deres
  absolutte længder tilpasses simulatorens eksisterende, omtrentlige kyst- og
  vejkort; de er ikke opmålt direkte fra Google Earth-skærmbillederne.
- Starttæppets kontaktflade bruger fortsat `DOCK_LEN`, `DOCK_HALF_W`, `DOCK_TOP`
  og `DOCK_RAMP`, samt den oprindelige position og retning i verden.
  Startfladen modroteres i forhold til dækket. En lang blå rampe falder fra
  trælandingen ved loungen til podiet ved kabinen. Den har underbygning,
  kantlister og en lav blå landing på kabinesiden.
- TA-mastens visuelle fod er flyttet til ca. `[-1,01; 11,12]` m i verdensplanet,
  svarende til sidebroens ende `[-16,5; -9]` i dækkets lokale plan. Den har ét
  samlet fodbeslag og én skrå gitterstamme. Bardunerne er tynde afstivningswirer,
  ikke ekstra mastben. Hjulets position og kabelhøjden er uændrede.
- Den bredere adgangsflade, dæk, kabine, sæder og mast er kun visuelle. Der er
  ingen ny kollisionsfysik på disse dele.
- Den gamle skematiske pavillon/platform og startmastens simple rør erstattes.
- Kameraet **Start / lounge** pauser simuleringen og kan drejes/zoomes som Orbit.
  `#start-area` åbner direkte i denne visning. **Run** starter simuleringen igen.
- Statiske detaljer samles efter materiale og del for at begrænse draw calls.

## Hang-around-området på land (9932–9936)

Gangbroen fra startdækket til området på land er nu 103,48 m i plan, som målt
i billede 9935. Den erstatter den tidligere korte tværbro. Retningen er senere
justeret lidt efter vandlinjen i 9937–9938; placeringen er ikke landmålt.
Broen stiger svagt fra 0,75 til 1,05 m og er skønnet 2 m bred.

Området er en enkel model med en ca. 23 × 28 m træterrasse, en lille sort hytte,
en lav hovedbygning med lyst tag, en smal anneksbygning, fem borde/bænkesæt,
siddeplateau ved broen og seks træer. Terrassekanten møder broen i samme højde.
Kystlinjen følger nu de to rette stræk og knækket i brugerens gule markering
i 9937–9938, med en samlet længde på 196,92 m. Det erstatter det første skøn
af halvøens form. Broens landfæste og terrassen er flyttet ca. 2,4 m sidelæns
for at møde den nye kyst. Vejen beholder sin tidligere linjeføring bag området. Bygninger, inventar,
bredder, beplantning og højder er visuelle skøn. Delene er kun scenografi.

Åbn simulatoren med `#hang-around` for en pauset oversigt med drej/zoom.
[Oversigt](screenshots/hang-around-overview.png) · [Detalje](screenshots/hang-around-detail.png) · [Vandkant i plan](screenshots/hang-around-plan.png).
Kontrol omfatter længden i plan, vand under broens spænd, land under terrassen,
broens tilslutning og browserrendering uden JavaScript-fejl.

## Eksport af startområdet

De eksisterende GLB- og `dist/start-area-*.png`-filer er fra den tidligere
startområdemodel og er ikke geneksporteret med hang-around-udvidelsen.
Den opdaterede model findes i simulatorens HTML og i billederne ovenfor.

`python tools/export_start_area.py` eksporterer den byggede scene via den samme
Three.js-version som simulatoren og genindlæser GLB-filen som kontrol. Scriptet
kræver Python Playwright, Chromium og adgang til det eksisterende Three.js-CDN.

- `dist/ccp_control_start_lounge.glb`: selvstændig model med materialer og skilt.
  Lokalt nulpunkt ved startfladen, y op, meter; vand/omgivelser/rider er udeladt.
- `dist/start-area-preview.png`: oversigt i simulatoren.
- `dist/start-area-detail.png`: nærvisning.
- `dist/start-area-plan.png`: planvisning til kontrol af orientering og broer.
- `dist/start-area-mast.png`: samlet vandvendt visning af rampe, kabine og enkeltmast.

Eksportkontrollen efterprøver også dækkets retning, syv brosegmenter,
rækkefølgen dæk–kyst–vej og seks punkter på startfladen mod fysikkens kontaktflade.
Den kontrollerer også, at adgangsrampen stiger mod loungen, og at mastens nederste
geometri er samlet ved ét fæste præcis ved den inderste sidebros ende.

GLB-filen kan importeres i et 3D-program og kræver ikke de originale fotos.
