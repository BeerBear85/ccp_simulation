# OE — fotobaseret model

Modellen følger brugerens fem fotos (9807, 9777, 9778, 9829 og 9743)
og beskrivelsen af tre sammenbyggede dele. Alle mål er skøn.

| Del | Udformning | Anslåede mål |
|---|---|---|
| Hovedrail | Hvid asymmetrisk rooftop med afrundet grå overflade. Én stigning til knækket ved 43 % af længden, derefter et længere, svagt fald til en lodret ende. | 20 × 1 m; maks. 1,5 m; sluthøjde 1 m |
| Bank | Sammenhængende hvid bank op mod hovedrailen, med opkørsel fra enden og den ydre langside til samme flade dæk. | 12 × 5,5 m; dæk 0,72 m over vand; flad bredde 1,6 m |
| Lille rail | Sort rund overflade på en smal hvid understøtning oven på dækket, med en kort skrå opkørsel og et vandret stykke. | 6 m lang; diameter 0,18 m; krone 1,18 m over vand |

Foto 9829 styrer hovedprofilen. Foto 9743 viser bankens åbne side,
flade dæk og den lille rail. De øvrige fotos støtter fortolkningen af
den afrundede hovedrail og de lukkede hvide sider. Samlinger og skrift
er forenklet; antallet af fysiske moduler og præcise samlinger er ukendt.

Hoveddelens placering og længde er bevaret. De to øvrige dele placeres i
hoveddelens lokale koordinater, så banken møder væggen uden mellemrum.
Bankens to opkørsler blandes i det fælles hjørne; hjørnets præcise form
kan ikke fastslås ud fra billederne. Hovedrailens afrunding er modelleret
som en lav halvellipse med 0,2 m højde; den lille rail er halvcirkelformet.

Rendering og kontaktfysik deler længdeprofiler og tværsnit. Bankens hjørne
underinddeles i grafikken for at følge kontaktfladen. Kollisioner bruger
fortsat simulatorens højdebaserede model, ikke en fuld 3D-kollisionsmesh.

Åbn simulatoren med `#oe`, eller vælg **OE detail**. Visningen pauser
simuleringen og kan drejes og zoomes med musen.

Kontrol: `node --test tests/oe_geometry.test.js` tester tilslutninger,
opkørsler, fladt dæk, afrunding, railens placering og endelige kontaktværdier.
