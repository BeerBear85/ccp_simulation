"""Build the single-file simulator: inserts src/physics.js into src/template.html.
Outputs dist/copenhagen_cable_park_sim.html (standalone) and dist/copenhagen_cable_park_sim.frag.html (artifact body)."""
import os
root=os.path.dirname(os.path.abspath(__file__))
t=open(os.path.join(root,'src','template.html'), encoding='utf-8').read(); p=open(os.path.join(root,'src','physics.js'), encoding='utf-8').read()
import base64
vest=base64.b64encode(open(os.path.join(root,'src','vest_texture.jpg'),'rb').read()).decode('ascii')
face=base64.b64encode(open(os.path.join(root,'src','face_texture.jpg'),'rb').read()).decode('ascii')
area=open(os.path.join(root,'src','start_area.js'), encoding='utf-8').read()
surroundings=open(os.path.join(root,'src','surroundings.js'), encoding='utf-8').read()
operator=open(os.path.join(root,'src','operator.js'), encoding='utf-8').read()
operator_css=open(os.path.join(root,'src','operator.css'), encoding='utf-8').read()
frag=t.replace('/*__PHYSICS__*/',p).replace('/*__START_AREA__*/',area).replace('/*__VEST_TEX__*/','data:image/jpeg;base64,'+vest).replace('/*__FACE_TEX__*/','data:image/jpeg;base64,'+face)
frag=frag.replace('/*__OPERATOR__*/',operator).replace('/*__OPERATOR_CSS__*/',operator_css)
frag=frag.replace('/*__SURROUNDINGS__*/',surroundings)
frag=frag.replace('/*__DRONE__*/',open(os.path.join(root,'src','drone.js'), encoding='utf-8').read())
hill=base64.b64encode(open(os.path.join(root,'src','copenhill_visual_proxy.glb'),'rb').read()).decode('ascii')
frag=frag.replace('/*__COPENHILL__*/',"const COPENHILL_GLB='"+hill+"';\n"+open(os.path.join(root,'src','copenhill.js'), encoding='utf-8-sig').read())
os.makedirs(os.path.join(root,'dist'),exist_ok=True)
open(os.path.join(root,'dist','copenhagen_cable_park_sim.frag.html'),'w', encoding='utf-8', newline='\n').write(frag)
i=frag.index('</style>')+len('</style>')
sa='<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+frag[:i]+'\n</head>\n<body>'+frag[i:]+'\n</body>\n</html>\n'
open(os.path.join(root,'dist','copenhagen_cable_park_sim.html'),'w', encoding='utf-8', newline='\n').write(sa)
