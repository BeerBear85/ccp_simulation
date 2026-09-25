"""Build the single-file simulator: inserts src/physics.js into src/template.html.
Outputs dist/copenhagen_cable_park_sim.html (standalone) and dist/copenhagen_cable_park_sim.frag.html (artifact body)."""
import re
import os
root=os.path.dirname(os.path.abspath(__file__))
t=open(os.path.join(root,'src','template.html')).read(); p=open(os.path.join(root,'src','physics.js')).read()
frag=t.replace('/*__PHYSICS__*/',p)
os.makedirs(os.path.join(root,'dist'),exist_ok=True)
open(os.path.join(root,'dist','copenhagen_cable_park_sim.frag.html'),'w').write(frag)
i=frag.index('</style>')+len('</style>')
sa='<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+frag[:i]+'\n</head>\n<body>'+frag[i:]+'\n</body>\n</html>\n'
open(os.path.join(root,'dist','copenhagen_cable_park_sim.html'),'w').write(sa)
