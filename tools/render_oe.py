"""Offline OE previews from the simulator's actual mesh builder (no browser).

Requires Node, NumPy and Pillow. A small Three-compatible geometry adapter runs
obstacleGeometry unchanged; a CPU z-buffer renders its vertices and normals.
"""
import json
from pathlib import Path
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'

EXTRACT = r"""
const fs = require('node:fs'), vm = require('node:vm');
class Color {
  constructor(c) { this.r=((c>>16)&255)/255; this.g=((c>>8)&255)/255; this.b=(c&255)/255; }
  clone() { return Object.assign(new Color(0), this); }
  lerp(c,t) { for(const k of ['r','g','b']) this[k]+=(c[k]-this[k])*t; return this; }
  multiplyScalar(t) { for(const k of ['r','g','b']) this[k]*=t; return this; }
}
class Vector3 {
  constructor(x,y,z) { Object.assign(this,{x,y,z}); }
  normalize() { const n=Math.hypot(this.x,this.y,this.z)||1; this.x/=n;this.y/=n;this.z/=n;return this; }
}
class Float32BufferAttribute {
  constructor(a,n) { this.array=Array.from(a);this.itemSize=n;this.count=a.length/n; }
  setXYZ(i,x,y,z) { this.array.splice(i*3,3,x,y,z); }
}
class BufferGeometry {
  constructor() { this.attributes={}; }
  setAttribute(k,a) { this.attributes[k]=a; }
  computeVertexNormals() {
    const p=this.attributes.position.array,n=[];
    for(let i=0;i<p.length;i+=9) {
      const a=p.slice(i+3,i+6).map((v,k)=>v-p[i+k]),b=p.slice(i+6,i+9).map((v,k)=>v-p[i+k]);
      const q=new Vector3(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]).normalize();
      for(let j=0;j<3;j++) n.push(q.x,q.y,q.z);
    }
    this.attributes.normal=new Float32BufferAttribute(n,3);
  }
}
const html=fs.readFileSync('src/template.html','utf8');
const start=html.indexOf('  const WHITE ='),end=html.indexOf('  for (const o of sim.obs)',start);
if(start<0||end<0) throw new Error('Mesh builder not found');
const code=fs.readFileSync('src/physics.js','utf8')+'\n'+html.slice(start,end)+`
JSON.stringify(createSim().obs.filter(o=>o.id==='OE').map(o=>{
  const g=obstacleGeometry(o), a=g.attributes;
  return {name:o.name,offset:o.offset||[0,0],position:a.position.array,color:a.color.array,normal:a.normal.array};
}));`;
console.log(vm.runInNewContext(code,{THREE:{Color,Vector3,Float32BufferAttribute,BufferGeometry},structuredClone}));
"""


def unit(v):
    a = np.array(v, dtype=float)
    return a / max(np.linalg.norm(a), 1e-12)


def mesh():
    result = subprocess.run(['node', '-e', EXTRACT], cwd=ROOT, check=True, capture_output=True, text=True)
    triangles, colors, normals = [], [], []
    for part in json.loads(result.stdout):
        p = np.array(part['position']).reshape(-1, 3)
        n = np.array(part['normal']).reshape(-1, 3)
        u, v = part['offset']
        p = np.column_stack((p[:, 0] + u, -p[:, 2] + v, p[:, 1]))
        n = np.column_stack((n[:, 0], -n[:, 2], n[:, 1]))
        triangles.extend(p.reshape(-1, 3, 3))
        colors.extend(np.array(part['color']).reshape(-1, 3, 3))
        normals.extend(n.reshape(-1, 3, 3))
    return np.array(triangles), np.array(colors), np.array(normals)


def render(triangles, colors, normals, camera, title, filename):
    width, height = 1600, 820
    target = np.array([0, 2.4, 0.4])
    forward = unit(np.array(camera) - target)
    right = unit(np.cross([0, 0, 1], forward))
    up = np.cross(forward, right)
    basis = np.stack((right, up, forward), axis=1)
    points = (triangles - target) @ basis
    extent = np.ptp(points[:, :, :2].reshape(-1, 2), axis=0)
    scale = min((width - 180) / extent[0], (height - 250) / max(extent[1], 1))
    center = (points[:, :, :2].reshape(-1, 2).min(axis=0) + points[:, :, :2].reshape(-1, 2).max(axis=0)) / 2
    points[:, :, 0] = (points[:, :, 0] - center[0]) * scale + width / 2
    points[:, :, 1] = -(points[:, :, 1] - center[1]) * scale + height / 2 + 25
    pixels = np.empty((height, width, 3), dtype=np.uint8)
    pixels[:] = [233, 240, 244]
    depth = np.full((height, width), -np.inf)
    light = unit([-.35, -.5, 1])
    for tri, color, normal in zip(points, colors, normals):
        lo = np.maximum(np.floor(tri[:, :2].min(axis=0)).astype(int), [0, 0])
        hi = np.minimum(np.ceil(tri[:, :2].max(axis=0)).astype(int), [width - 1, height - 1])
        if np.any(hi < lo):
            continue
        a, b, c = tri
        den = (b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
        if abs(den) < 1e-8:
            continue
        yy, xx = np.mgrid[lo[1]:hi[1]+1, lo[0]:hi[0]+1]
        xx, yy = xx + .5, yy + .5
        wa = ((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/den
        wb = ((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/den
        wc = 1-wa-wb
        z = wa*a[2]+wb*b[2]+wc*c[2]
        region = np.s_[lo[1]:hi[1]+1, lo[0]:hi[0]+1]
        mask = (wa >= -1e-7) & (wb >= -1e-7) & (wc >= -1e-7) & (z > depth[region])
        if not mask.any():
            continue
        ns = wa[..., None]*normal[0]+wb[..., None]*normal[1]+wc[..., None]*normal[2]
        ns /= np.maximum(np.linalg.norm(ns, axis=-1, keepdims=True), 1e-9)
        ns *= np.where((ns @ forward) >= 0, 1, -1)[..., None]
        shade = .64 + .36*np.maximum(0, ns @ light)
        rgb = (wa[..., None]*color[0]+wb[..., None]*color[1]+wc[..., None]*color[2])*shade[..., None]
        pixels[region][mask] = np.clip(rgb[mask]*255, 0, 255).astype(np.uint8)
        depth[region][mask] = z[mask]
    img = Image.fromarray(pixels)
    draw = ImageDraw.Draw(img)
    regular = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 23)
    bold = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 38)
    draw.text((54, 38), title, fill='#203644', font=bold)
    draw.text((54, 94), 'Modelgeometri · proportioner estimeret fra fotos', fill='#526b78', font=regular)
    draw.text((54, height-60), 'Lokal 3D-rendering · uden vand, omgivelser og logoer', fill='#526b78', font=regular)
    img.save(OUT / filename)


if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    geometry = mesh()
    views = [([-14, 27, 16], 'OE / Banksiden', 'oe-bank.png'),
             ([0, -30, 5], 'OE / Rooftop-siden', 'oe-rooftop.png'),
             ([0, 2.399, 36], 'OE / Ovenfra', 'oe-plan.png')]
    for camera, title, filename in views:
        render(*geometry, camera, title, filename)
        print(OUT / filename)
