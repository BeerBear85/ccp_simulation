"""Build the single-file simulator: inserts src/physics.js into src/template.html.
Outputs dist/copenhagen_cable_park_sim.html (standalone) and dist/copenhagen_cable_park_sim.frag.html (artifact body)."""
import os
root=os.path.dirname(os.path.abspath(__file__))
t=open(os.path.join(root,'src','template.html'), encoding='utf-8').read(); p=open(os.path.join(root,'src','physics.js'), encoding='utf-8').read()
import base64
vest=base64.b64encode(open(os.path.join(root,'src','vest_texture.jpg'),'rb').read()).decode('ascii')
face=base64.b64encode(open(os.path.join(root,'src','face_texture.jpg'),'rb').read()).decode('ascii')
frag=t.replace('/*__PHYSICS__*/',p).replace('/*__VEST_TEX__*/','data:image/jpeg;base64,'+vest).replace('/*__FACE_TEX__*/','data:image/jpeg;base64,'+face)
os.makedirs(os.path.join(root,'dist'),exist_ok=True)
open(os.path.join(root,'dist','copenhagen_cable_park_sim.frag.html'),'w', encoding='utf-8', newline='\n').write(frag)
i=frag.index('</style>')+len('</style>')
sa='<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+frag[:i]+'\n</head>\n<body>'+frag[i:]+'\n</body>\n</html>\n'
open(os.path.join(root,'dist','copenhagen_cable_park_sim.html'),'w', encoding='utf-8', newline='\n').write(sa)
