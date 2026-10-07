/* CopenHill reconstructed from the five images in copenhill_3d_model_report.html.
 * Local x rises towards the chimney; y is up. All dimensions are visual estimates.
 * Pure Three.js geometry: no image downloads, DOM textures or extra runtime dependencies.
 */
function createCopenHill(THREE) {
  const root = new THREE.Group(); root.name = 'CopenHill';
  root.userData = { source: 'copenhill_3d_model_report.html, Model views 1–3',
    dimensionsStatus: 'Visual estimates; existing 190 × 73 m footprint and 124 m stack retained' };
  const L=190, W=73, R=7;
  const height=x=>12+73*Math.min(1,Math.max(0,(x+95)/180));
  const mat=(c)=>new THREE.MeshLambertMaterial({color:c});
  const silver=mat(0xbfc6c5), shadow=mat(0x46545a), edge=mat(0xd5d9d5),
    grass=mat(0x647a42), ski=mat(0x8aa966), path=mat(0xc0b49a), foliage=mat(0x455f32);
  const mesh=(g,m,name)=>{const o=new THREE.Mesh(g,m);o.name=name;o.receiveShadow=true;root.add(o);return o;};
  const boxes=new Map();
  function box(m,p,s,rotation=0){
    if(!boxes.has(m))boxes.set(m,[]);
    boxes.get(m).push({p,s,q:new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),rotation)});
  }
  function beam(m,a,b,width=.15){
    if(!boxes.has(m))boxes.set(m,[]);
    const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);
    boxes.get(m).push({p:av.add(bv).multiplyScalar(.5).toArray(),s:[width,d.length(),width],
      q:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize())});
  }
  const ring=[];
  for(const [cx,cz,start] of [[95-R,36.5-R,0],[-95+R,36.5-R,90],[-95+R,-36.5+R,180],[95-R,-36.5+R,270]]){
    for(let i=0;i<=8;i++){const a=(start+i*90/8)*Math.PI/180;ring.push([cx+R*Math.cos(a),cz+R*Math.sin(a)]);}
  }
  const positions=[];
  for(let i=0;i<ring.length;i++){
    const a=ring[i],b=ring[(i+1)%ring.length],p=[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],height(b[0]),b[1]],[a[0],height(a[0]),a[1]]];
    for(const k of [0,2,1,0,3,2])positions.push(...p[k]);
  }
  const walls=new THREE.BufferGeometry();walls.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));walls.computeVertexNormals();
  mesh(walls,shadow,'Recessed facade');
  const roofShape=new THREE.Shape(ring.map(([x,z])=>new THREE.Vector2(x,-z)));
  const roofGeo=new THREE.ShapeGeometry(roofShape);roofGeo.rotateX(-Math.PI/2);
  const rp=roofGeo.attributes.position;
  for(let i=0;i<rp.count;i++)rp.setY(i,height(rp.getX(i))+.05);
  roofGeo.computeVertexNormals();mesh(roofGeo,grass,'Green roof');
  // Staggered aluminium trays over a dark backing. Clip the upper row to the roof,
  // and follow rounded corners instead of drawing the old full-height vertical ribs.
  const lengths=ring.map((a,i)=>Math.hypot(a[0]-ring[(i+1)%ring.length][0],a[1]-ring[(i+1)%ring.length][1]));
  const perimeter=lengths.reduce((a,b)=>a+b,0),count=Math.round(perimeter/4.8),pitch=perimeter/count;
  function perimeterPoint(d){d=(d+perimeter)%perimeter;let i=0;while(d>lengths[i]&&i<lengths.length-1)d-=lengths[i++];
    const a=ring[i],b=ring[(i+1)%ring.length],t=d/lengths[i];return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,Math.atan2(b[1]-a[1],b[0]-a[0])];}
  for(let row=0;row<43;row++)for(let col=0;col<count;col++){
    const [x,z,a]=perimeterPoint((col+.5*(row%2))*pitch),bottom=row*2;
    const top=Math.min(bottom+1.26,height(x)-.32-Math.abs(Math.cos(a))*pitch*.21);
    if(top<=bottom+.15)continue;
    box(silver,[x, (bottom+top)/2,z],[pitch*.92,top-bottom,.78],-a);
    // Short return gives each alternating tray a visible side and recessed opening.
    box(edge,[x+Math.cos(a)*pitch*.43,bottom+.6,z+Math.sin(a)*pitch*.43],[.16,1.1,1.05],-a);
  }
  function strip(name,zAt,width,material,start=-87,end=86,offset=.16){
    const p=[];for(let x=start;x<end;x+=3){const nx=Math.min(x+3,end),z=zAt(x),nz=zAt(nx);
      const v=[[x,height(x)+offset,z-width/2],[nx,height(nx)+offset,nz-width/2],[nx,height(nx)+offset,nz+width/2],[x,height(x)+offset,z+width/2]];
      for(const j of [0,2,1,0,3,2])p.push(...v[j]);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.computeVertexNormals();mesh(g,material,name);
  }
  strip('Ski slope',x=>-7+5*Math.sin((x+65)/40),25,ski);
  strip('Winding rooftop path',x=>23+4*Math.sin(x/13),2.3,path);
  strip('CCP-side roof walk',()=>-32,1.7,path);
  // Parapet and safety rail follow the sloping envelope, including the curved ends.
  for(let i=0;i<ring.length;i++){
    const a=ring[i],b=ring[(i+1)%ring.length];
    beam(edge,[a[0],height(a[0])+.35,a[1]],[b[0],height(b[0])+.35,b[1]],.32);
    beam(edge,[a[0],height(a[0])+1.5,a[1]],[b[0],height(b[0])+1.5,b[1]],.12);
  }
  for(let d=0;d<perimeter;d+=5){const [x,z]=perimeterPoint(d);beam(edge,[x,height(x),z],[x,height(x)+1.5,z],.12);}
  // Roof shrubs, kept out of the piste and walking routes; deterministic layout.
  const plants=[];
  for(let i=0;i<90;i++){
    const x=-83+(i%30)*5.7+Math.sin(i*4.1)*1.2,z=[-27,13,31][Math.floor(i/30)]+Math.sin(i*2.4)*1.8;
    if(Math.abs(z-(23+4*Math.sin(x/13)))<3.2)continue;
    plants.push([x,height(x)+.85,z,1+(.5+.5*Math.sin(i*8))*1.15]);
  }
  const shrubs=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),foliage,plants.length);shrubs.name='Roof planting';
  const dummy=new THREE.Object3D();plants.forEach(([x,y,z,s],i)=>{dummy.position.set(x,y,z);dummy.scale.set(s*1.2,s*.8,s);dummy.updateMatrix();shrubs.setMatrixAt(i,dummy.matrix);});root.add(shrubs);
  // Lift support and slender lighting columns, representative of the model views.
  for(const x of [-65,-25,15,55,82]){
    const y=height(x);beam(edge,[x,y,-23],[x,y+5,-23],.25);
    beam(shadow,[x,y+5,-26],[x,y+5,-20],.25);
    box(edge,[x,y+5.5,-23],[.8,.4,1.3]);
    beam(edge,[x,y,30],[x,y+5.5,30],.18);box(edge,[x,y+5.5,30],[1,.35,.5]);
  }
  beam(shadow,[-80,height(-80)+5,-23],[86,height(86)+5,-23],.07);
  // Small upper lift house and rooftop service equipment, on the garden side.
  box(edge,[78,height(78)+1.6,17],[8,3.2,7]);
  box(edge,[3,height(3)+1.7,24],[10,3.4,7]);
  box(silver,[0,4,-37.2],[30,8,2]);
  for(const x of [-9,0,9])box(shadow,[x,4,-38.25],[4,5,.1]);
  // Distinctive Y-shaped external support visible on the long CCP facade.
  beam(edge,[-49,20,-37.2],[-57,36,-37.2],.45);
  beam(edge,[-49,20,-37.2],[-41,36,-37.2],.45);
  function cylinder(name,x,z,r,bottom,top,material){
    const o=mesh(new THREE.CylinderGeometry(r,r,top-bottom,32),material,name);o.position.set(x,(bottom+top)/2,z);return o;
  }
  cylinder('Chimney silver casing',85,0,4,0,120,edge);
  cylinder('Chimney crown',85,0,4.15,119.5,120.3,silver);
  for(const z of [-1.8,1.8]){
    cylinder('Twin flue',85,z,1.4,120,124,shadow);
    cylinder('Flue rim',85,z,1.48,123.7,124,edge);
    const cap=mesh(new THREE.CircleGeometry(1.3,24),shadow,'Dark flue opening');cap.rotation.x=-Math.PI/2;cap.position.set(85,124.01,z);
  }
  for(const [material,items] of boxes){
    const inst=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),material,items.length);inst.name='CopenHill '+(material===silver?'facade trays':'details');
    items.forEach(({p,s,q},i)=>{dummy.position.set(...p);dummy.scale.set(...s);dummy.quaternion.copy(q);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});
    inst.receiveShadow=true;root.add(inst);
  }
  return root;
}
if(typeof module!=='undefined'&&module.exports)module.exports={createCopenHill};
