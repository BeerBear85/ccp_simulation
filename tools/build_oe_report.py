"""Build a portable Danish OE report with embedded model images and source photos."""
import base64
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PHOTOS = ROOT / '.codex-remote-attachments/01a1010f-8ea8-7962-97e7-6dbe580ec608/d9b28ff6-318b-4ef5-a60a-b9d27e9f5aa1'


def figure(path, alt, caption, css=''):
    mime = 'image/png' if path.suffix == '.png' else 'image/jpeg'
    data = base64.b64encode(path.read_bytes()).decode('ascii')
    return f'<figure class="{css}"><img src="data:{mime};base64,{data}" alt="{escape(alt)}"><figcaption>{caption}</figcaption></figure>'


bank = figure(ROOT / 'dist/oe-bank.png', 'OE-modellen set fra banksiden med hovedrail, bred sideopkørsel, fladt dæk og lille sort rail.',
              'Model · Banksiden viser de tre dele og deres indbyrdes placering. Vand, omgivelser og logoer er udeladt i denne rendering.')
roof = figure(ROOT / 'dist/oe-rooftop.png', 'OE-modellens asymmetriske rooftop-profil fra den modsatte side.',
              'Model · Hovedrailen har en kortere stigning og et længere, svagt fald. Indkørslen ses til venstre i denne visning.')
plan = figure(ROOT / 'dist/oe-plan.png', 'OE-modellen ovenfra: hovedrail langs kanten og bank med lille rail ved siden af.',
              'Model · Planen viser bankens bredde, det flade dæk og den lille rails placering. Indkørslen ligger til venstre.')
profile_photo = figure(PHOTOS / '4-9829.jpg', 'Referencefoto 9829: OE set omtrent vinkelret på hovedrailens lange side.',
                       'Foto 9829 · Det tydeligste grundlag for hovedrailens asymmetriske længdeprofil.')
bank_photo = figure(PHOTOS / '5-9743.jpg', 'Referencefoto 9743: OE set fra banksiden med bred opkørsel, dæk og mindre sort rail.',
                    'Foto 9743 · Grundlag for bankens sideopkørsel, flade top og den mindre sorte rail.')
other_photos = ''.join(figure(PHOTOS / filename, f'Referencefoto {number}: OE fra en skrå vinkel.', caption)
                       for filename, number, caption in [
                           ('1-9807.jpg', '9807', 'Foto 9807 · Hvid sidevæg, grå afrundet overflade og branding.'),
                           ('2-9777.jpg', '9777', 'Foto 9777 · Endeflade og afrundet tværsnit; dele af banken ses bagved.'),
                           ('3-9778.jpg', '9778', 'Foto 9778 · Supplerende vinkel på hovedrail og sammensætning; personer skjuler dele af geometrien.')])

html = '''<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Fotobaseret rapport om OE ved Copenhagen Cable Park: rooftop, bank og lille rund rail. Modelbilleder, referencefotos og estimerede mål.">
<title>OE — obstacle-rapport · Copenhagen Cable Park</title>
<style>
:root{--ink:#183644;--muted:#556e79;--line:#d9e3e6;--paper:#fff;--bg:#edf2f3;--accent:#006b71;--warm:#f5eddb}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.65 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1160px;margin:36px auto;background:var(--paper);box-shadow:0 12px 44px #1836440a}
header{padding:52px 62px 38px;border-top:7px solid var(--accent)}
.eyebrow{text-transform:uppercase;letter-spacing:.16em;font-size:12px;font-weight:650;color:var(--accent)}
h1{font-size:clamp(38px,6vw,64px);line-height:1.08;letter-spacing:-.04em;margin:18px 0 20px;max-width:850px}
.lead{font-size:21px;line-height:1.55;max-width:870px;margin:0 0 22px}
.meta{display:flex;flex-wrap:wrap;gap:8px 26px;color:var(--muted);font-size:14px}
nav{display:flex;flex-wrap:wrap;gap:10px 26px;padding:18px 62px;border-block:1px solid var(--line);font-size:14px}
a{color:var(--accent);text-underline-offset:4px}a:focus-visible{outline:3px solid var(--accent);outline-offset:5px}
section{padding:36px 62px 10px;scroll-margin-top:24px}h2{font-size:29px;line-height:1.25;letter-spacing:-.025em;margin:0 0 22px}h3{font-size:20px;margin:0 0 10px}
p{margin:0 0 17px}.intro{max-width:900px}.note{border-left:4px solid #ae8130;background:var(--warm);padding:18px 22px;font-size:15px;margin:22px 0}
figure{margin:0 0 25px;border:1px solid var(--line);background:#f6f8f9;overflow:hidden}
img{display:block;width:100%;height:auto}figcaption{padding:14px 18px;font-size:14px;line-height:1.55;color:var(--muted);background:#fff}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin:26px 0}.card{border-top:3px solid var(--accent);padding-top:15px}.num{display:block;font-size:12px;color:var(--accent);letter-spacing:.13em;margin-bottom:10px}.card p{font-size:15px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}.grid-three{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.table-wrap{overflow-x:auto;margin-bottom:22px}table{border-collapse:collapse;width:100%;font-size:15px}caption{text-align:left;color:var(--muted);font-size:14px;padding:0 0 12px}th,td{padding:13px 14px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{background:#eaf1f2;font-weight:600}td:first-child{white-space:nowrap}
ul{padding-left:23px;margin:0 0 22px}li{margin:9px 0}.small{font-size:14px;color:var(--muted)}code{background:#edf2f3;border-radius:3px;padding:2px 5px;font-size:.88em}
footer{margin-top:30px;padding:25px 62px 36px;border-top:1px solid var(--line);color:var(--muted);font-size:13px}
@media(max-width:760px){main{margin:0}header{padding:30px 23px}nav{padding:16px 23px}section{padding:28px 23px 5px}.cards,.grid,.grid-three{grid-template-columns:1fr}footer{padding:24px}.lead{font-size:19px}th,td{padding:10px}}
@media print{body{background:#fff;font-size:10pt}main{max-width:none;margin:0;box-shadow:none}header,section{padding:18px 0 6px}header{border-top-width:3px}h1{font-size:32pt}h2{font-size:19pt}.lead{font-size:13pt}nav{display:none}figure,.card,tr,.note{break-inside:avoid}h2,h3{break-after:avoid}img{max-height:170mm;object-fit:contain}.grid-three{grid-template-columns:1fr 1fr 1fr}footer{padding:16px 0}.note{font-size:10pt}figcaption{font-size:9pt}.meta{font-size:9pt}@page{size:A4;margin:16mm}
</style>
</head>
<body><main>
<header>
<div class="eyebrow">Copenhagen Cable Park / Fotobaseret rekonstruktion</div>
<h1>OE — rooftop, bank<br>og rund rail</h1>
<p class="lead">En sammensat obstacle med tre tydelige funktionelle dele: en lang asymmetrisk hovedrail, en bred bank med flad top og en mindre sort rail oven på banken.</p>
<div class="meta"><span>Rapport: 4. oktober 2026</span><span>Grundlag: fem brugerfotos og brugerens beskrivelse</span><span>Status: model, ikke opmåling</span></div>
</header>
<nav aria-label="Rapportens indhold"><a href="#opbygning">Opbygning</a><a href="#model">Modelvisninger</a><a href="#maal">Mål og proportioner</a><a href="#fotos">Fotogrundlag</a><a href="#usikkerhed">Usikkerheder</a><a href="#simulator">Simulator</a></nav>
<section id="opbygning">
<h2>01 / Opbygning</h2>
<p class="intro">OE kan ikke beskrives dækkende som én almindelig rampe. Hovedrailen og banken ligger langs hinanden, mens den mindre rail står på bankens flade dæk. Modellen behandler konstruktionen som tre sammenbyggede enheder.</p>
<div class="cards">
<article class="card"><span class="num">DEL 01</span><h3>Asymmetrisk rooftop</h3><p>En hvid hoveddel med grå, afrundet top. Fra den lave indkørsel stiger railen til et knæk. Derefter følger et længere og svagere fald til en lodret afslutning over vandet. De to hældninger er forskellige.</p></article>
<article class="card"><span class="num">DEL 02</span><h3>Bank med fladt dæk</h3><p>En bred, hvid bank ligger direkte op mod hoveddelen. Banken har opkørsel både fra enden og fra den ydre langside. Begge opkørsler fører til samme flade dæk ved hovedrailen.</p></article>
<article class="card"><span class="num">DEL 03</span><h3>Mindre rund rail</h3><p>En smal sort rail ligger oven på bankens dæk. Den har en kort skrå opkørsel til et vandret stykke. Modellen viser den sorte runde overflade på en smal hvid understøtning.</p></article>
</div>
<aside class="note">Tre funktionelle dele er en fortolkning af billederne og brugerens beskrivelse. Antallet af fysiske moduler, skruer og samlinger er ikke dokumenteret.</aside>
</section>
<section id="model"><h2>02 / Modelvisninger</h2>
<p>Disse billeder er renderet direkte fra simulatorens modelgeometri. De viser form og sammensætning med neutral baggrund. Visningerne er ikke fotogrammetri.</p>
__BANK__
<div class="grid">__ROOF____PLAN__</div>
</section>
<section id="maal"><h2>03 / Mål og proportioner</h2>
<p>Tabellen angiver de værdier, der er anvendt i modellen. Ingen af målene er opmålt på stedet. Højder er angivet i forhold til simulatorens nominelle vandoverflade.</p>
<div class="table-wrap"><table><caption>Modelmål — alle værdier er skøn</caption><thead><tr><th scope="col">Del</th><th scope="col">Længde × bredde</th><th scope="col">Højde</th><th scope="col">Profil og detaljer</th></tr></thead><tbody>
<tr><td>Hovedrail</td><td>20 × 1,0 m</td><td>Top: 1,50 m<br>Afslutning: 1,00 m</td><td>Knæk 8,6 m fra indkørslen, svarende til 43 % af længden. Afrunding som en lav halvellipse med 0,20 m højde.</td></tr>
<tr><td>Bank</td><td>12 × 5,5 m</td><td>Dæk: 0,72 m</td><td>Fladt dæk 1,6 m bredt. Endens opkørsel er 3,24 m lang; sideopkørslen optager de resterende 3,9 m af bredden.</td></tr>
<tr><td>Lille rail</td><td>6 × 0,18 m</td><td>Krone: 1,18 m<br>Over dækket: 0,46 m</td><td>Rund top med 0,18 m diameter. Skrå indgang 1,38 m lang, efterfulgt af et vandret stykke.</td></tr>
</tbody></table></div>
<p>Det samlede ydre omrids spænder over cirka 20 × 6,5 m. Det er ikke et fuldt rektangel: banken ligger kun langs en del af hovedrailens længde. Bankens indkørsel flugter med hovedrailens start. Banken og den lille rail er spejlet til den modsatte side af hovedrailen og flyttet 8 m tilbage mod starten efter brugerens rettelse den 4. oktober 2026.</p>
<p class="small">Rampetæerne starter 0,15 m under den nominelle vandoverflade i simulatoren. Dette er en modelleringsdetalje, der giver en sammenhængende overgang fra vand til obstacle.</p>
</section>
<section id="fotos"><h2>04 / Fotogrundlag</h2>
<p>De fem referencefotos er leveret af brugeren. Foto 9829 og 9743 er de vigtigste for selve formen; de øvrige vinkler understøtter fortolkningen af overflader og ender.</p>
<div class="grid">__PROFILE_PHOTO____BANK_PHOTO__</div>
<div class="grid-three">__OTHER_PHOTOS__</div>
<p class="small">Model og referencefoto kan være set fra modsatte retninger. Sammenlign indkørsel, knæk og afslutning, frem for venstre og højre på billederne.</p>
</section>
<section id="usikkerhed"><h2>05 / Hvad er sikkert — og hvad er et skøn?</h2>
<div class="grid"><div><h3>Understøttet af materialet</h3><ul>
<li>Hoveddelen har en asymmetrisk rooftop-profil med et tydeligt knæk.</li>
<li>Hoveddelens sider er hvide, og toppen er grå og afrundet.</li>
<li>Den modsatte side rummer en bred bank og et fladt dæk.</li>
<li>En mindre sort rail står på dækket; brugerens beskrivelse angiver en rampeopkørsel.</li>
</ul></div><div><h3>Valgt i modellen</h3><ul>
<li>Alle mål, hældninger og præcise placeringer mellem delene.</li>
<li>Bankens hjørne, hvor opkørsel fra enden og siden mødes. Modellen blander de to flader.</li>
<li>Hovedrailens præcise runding og den lille rails understøtning.</li>
<li>Panelinddeling, samlinger og forenklet skrift på hoveddelen.</li>
</ul></div></div>
<aside class="note">Den vigtigste næste kontrol er et mål på hovedrailens samlede længde samt et skråt foto ovenfra af banken. Det vil især afklare bankens udstrækning, hjørne og den lille rails placering.</aside>
</section>
<section id="simulator"><h2>06 / Implementering og kontrol</h2>
<p>De tre dele er placeret i et fælles lokalt koordinatsystem. Banken møder hoveddelen uden mellemrum, og den lille rails indgang starter i dækhøjde. Grafik og kontaktfysik deler længdeprofiler og tværsnit.</p>
<p>Simulatoren bruger fortsat højdebaseret kontakt mellem board og obstacle. Modellen beskriver derfor overfladerne, men er ikke en fuld mekanisk model af konstruktionen eller dens samlinger.</p>
<p>De automatiske geometritest kontrollerer delenes tilslutning, begge opkørsler, det flade dæk, den lille rails placering og afrunding samt kontaktberegningernes numeriske værdier. Geometri-, build- og fysiktest bestod ved modelopdateringen.</p>
<p>Vælg <em>OE detail</em> i simulatoren for en pauset visning, der kan drejes og zoomes. Simulatoren kan også åbnes med adresseendelsen <code>#oe</code>.</p>
<p class="small">Kildegeometri: <code>src/physics.js</code> og <code>src/template.html</code>. Geometritest: <code>tests/oe_geometry.test.js</code>. Modelnoter: <code>docs/oe_model.md</code>.</p>
</section>
<footer>OE · Copenhagen Cable Park · 4. oktober 2026<br>Denne rapport indeholder alle billeder og al formatering i én HTML-fil. Den kan læses offline og udskrives fra en browser.</footer>
</main></body></html>
'''

for key, value in {'BANK': bank, 'ROOF': roof, 'PLAN': plan, 'PROFILE_PHOTO': profile_photo,
                   'BANK_PHOTO': bank_photo, 'OTHER_PHOTOS': other_photos}.items():
    html = html.replace(f'__{key}__', value)

output = ROOT / 'docs/OE_rapport.html'
output.write_text(html, encoding='utf-8', newline='\n')
print(f'{output} ({output.stat().st_size:,} bytes)')
