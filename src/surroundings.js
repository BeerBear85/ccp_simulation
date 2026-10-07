/* CCP surroundings reconstructed from user images 9912–9938.
 * 9923/9925 are plan views; 9924 confirms the same 256.97 m measurement.
 * Positions use existing simulation metres (east, north); elevations are visual estimates.
 * No network, Three.js or DOM dependency until createCCPSurroundings is called.
 */
const CCP_SURROUNDINGS = (() => {
  const calibration = {
    source: '9923', measuredLength: 256.97,
    pixels: [[167,544],[318,365]],
    metresPerPixel: 1.0973010184910204, angle: -0.030986477448252548, translation: [-189.3084742552346,616.2772959010238],
    registration: 'Fixed measured scale; rotation/translation fitted to four existing jetty vertices.',
    controlPixels: [[185,563],[249,621],[298,615],[320,574]], controlWorld: [[1.1,-10.6],[58.5,-74.7],[112.8,-65],[143.5,-23]]
  };
  const project = ([u,v]) => {
    const c = Math.cos(calibration.angle), s = Math.sin(calibration.angle), k = calibration.metresPerPixel;
    return [k*(c*u+s*v)+calibration.translation[0], k*(s*u-c*v)+calibration.translation[1]];
  };
  const map = pts => pts.map(project);
  // Manual water-edge traces, independent of the yellow line (which follows the bank/road).
  const westPixels = [[323,376],[288,416],[247,463],[207,509],[174,550],[132,595],
    [88,640],[65,661],[76,685],[103,704],[143,724],[156,756],[174,790]];
  const eastPixels = [[410,530],[421,550],[427,573],[425,591],[413,608],[389,630],
    [366,650],[347,675],[351,705],[366,749],[386,790]];
  const plantPixels = [[323,376],[333,353],[344,331],[375,315],[404,304],[444,279],[506,245],[582,202]];
  const tankPixels = [[410,530],[441,539],[487,516],[531,491],[582,465]];
  const coarseWest = map(westPixels);
  // 9937 and 9938 show the SAME two-segment waterline measurement.
  // Its 196.92 m total fixes scale; four jetty controls fix rotation/translation.
  // Image coordinates are hand-picked: registration remains approximate.
  const shorelineCalibration = {
    sources: ['9937','9938'], measuredLength: 196.92,
    pixels: [[222,474],[126,600],[190,724]],
    controlPixels: [[253,506],[346,594],[427,580],[463,526]],
    controlWorld: calibration.controlWorld,
    angle: -0.01997516980260799, pixelCentre: [372.25,551.5], worldCentre: [78.975,-43.325]
  };
  const S=shorelineCalibration;
  S.metresPerPixel=S.measuredLength/S.pixels.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-S.pixels[i][0],p[1]-S.pixels[i][1]),0);
  const shorelineProject=([u,v])=>{
    const x=u-S.pixelCentre[0],y=v-S.pixelCentre[1],c=Math.cos(S.angle),s=Math.sin(S.angle);
    return [S.worldCentre[0]+S.metresPerPixel*(c*x+s*y),S.worldCentre[1]+S.metresPerPixel*(s*x-c*y)];
  };
  S.world=S.pixels.map(shorelineProject);
  // 9932–9936 define the simple hang-around model and the measured bridge.
  // The later marked waterline determines its corrected landfall below.
  const hangAround = {
    source: '9932–9936; length measurement in 9935', measuredLength: 103.48,
    origin: [3.29,-7.17], yaw: -0.8404864029051407,
    bridgeStart: [-3,9.8],
    terrace: { width: 23, depth: 28, top: 1.05 }
  };
  hangAround.world = ([x,z]) => [hangAround.origin[0]+Math.cos(hangAround.yaw)*x+Math.sin(hangAround.yaw)*z,
    hangAround.origin[1]+Math.sin(hangAround.yaw)*x-Math.cos(hangAround.yaw)*z];
  const hangLocal=([x,y])=>{
    const dx=x-hangAround.origin[0],dy=y-hangAround.origin[1],c=Math.cos(hangAround.yaw),s=Math.sin(hangAround.yaw);
    return [c*dx+s*dy,s*dx-c*dy];
  };
  // Meet the measured second bank segment while preserving the 103.48 m bridge.
  const [corner,tip]=S.world.slice(1).map(hangLocal),start=hangAround.bridgeStart;
  const delta=tip.map((v,i)=>v-corner[i]),relative=corner.map((v,i)=>v-start[i]);
  const qa=delta[0]**2+delta[1]**2,qb=2*(delta[0]*relative[0]+delta[1]*relative[1]);
  const qc=relative[0]**2+relative[1]**2-hangAround.measuredLength**2;
  const t=(-qb+Math.sqrt(qb*qb-4*qa*qc))/(2*qa);
  // Set the endpoint 1.5 m landward, supporting the full bridge/terrace join.
  const endX=corner[0]+t*delta[0]-1.5;
  hangAround.bridgeEnd=[endX,start[1]+Math.sqrt(hangAround.measuredLength**2-(endX-start[0])**2)];
  hangAround.terrace.x=hangAround.bridgeEnd[0]-10.4;
  hangAround.terrace.z=hangAround.bridgeEnd[1]+14;
  const west = coarseWest.slice(0,4).concat(S.world,coarseWest.slice(10));
  const east = map(eastPixels), plant = map(plantPixels), tank = map(tankPixels);
  // Continue beyond screenshot cuts. These distant extensions are explicitly unsurveyed,
  // and meet the scene boundary: there is no invented bank closing the channel.
  const westExtended = west.concat([project([240,1030]),project([430,1420]),[500,-1800]]);
  const eastExtended = east.concat([project([490,1030]),project([690,1420]),[800,-1800]]);
  const plantExtended = plant.concat([[900,650],[1800,850]]);
  const tankExtended = tank.concat([[900,300],[1800,400]]);
  const westLand = [...westExtended].reverse().concat(plantExtended.slice(1),[[1800,1800],[-1800,1800],[-1800,-1800]]);
  const eastLand = tankExtended.concat([[1800,-1800]], [...eastExtended].reverse());
  const water = [...westExtended].reverse().concat(plantExtended.slice(1), [...tankExtended].reverse(), eastExtended.slice(1));
  function offset(pts, distance) {
    return pts.map((p,i) => {
      const a = pts[Math.max(0,i-1)], b = pts[Math.min(pts.length-1,i+1)], dx=b[0]-a[0],dy=b[1]-a[1], l=Math.hypot(dx,dy);
      return [p[0]-dy/l*distance,p[1]+dx/l*distance];
    });
  }
  // Keep the road's earlier alignment behind the peninsula, rather than bending it through the terrace.
  const road = offset(coarseWest.concat(westExtended.slice(west.length)), -15);
  const damA = project([318,365]), damB = project([415,535]);
  const dam = {a:damA,b:damB,openingFraction:0.64,openingWidth:7,crestWidth:6,toeWidth:20,
    crestHeight:3.6,clearance:2.6,source:'9916, 9913, 9923',dimensionsStatus:'Opening exists; section and heights estimated.'};
  dam.length=Math.hypot(damB[0]-damA[0],damB[1]-damA[1]);
  dam.opening=damA.map((v,i)=>v+(damB[i]-v)*dam.openingFraction);
  return { calibration, project, offset, west, east, plant, tank, westExtended, eastExtended,
    westLand,eastLand,water,dam,road,hangAround,shorelineCalibration,shorelineProject, ground:0.8,
    shorelinePixels:{west:westPixels,east:eastPixels,plant:plantPixels,tank:tankPixels},
    assumptions: ['Vertical dimensions are visual estimates.','Geometry beyond image boundaries is contextual continuation.',
      'No hydrology or bank/building collisions.','Unregistered stairs in 9920 are not placed at the tunnel.'],
    cameras: {
      overview:{position:[-230,-350,340],target:[140,115,0]},
      dam:{position:[dam.opening[0]-35*(damA[1]-damB[1])/dam.length,dam.opening[1]-35*(damB[0]-damA[0])/dam.length,1.65],target:[dam.opening[0],dam.opening[1],1.3]},
      tanks:{position:[75,32,1.65],target:[405,25,10]}
    }
  };
})();

function createCCPSurroundings(THREE, environment = CCP_SURROUNDINGS) {
  const E=environment, root=new THREE.Group(); root.name='CCP reconstructed surroundings';
  root.userData={calibration:E.calibration,assumptions:E.assumptions};
  const V=([x,y],z=0)=>new THREE.Vector3(x,z,-y), project=E.project;
  const group=name=>{const g=new THREE.Group();g.name=name;root.add(g);return g;};
  const terrain=group('Land and bank slopes'), roads=group('Roads and shore path'),
    industrial=group('Industrial landmarks'), vegetation=group('Shore vegetation'), dam=group('Dam with water passage');
  let seed=99123; const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const texture=(kind)=>{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
    const ctx=canvas.getContext('2d');ctx.fillStyle=kind==='stone'?'#77796e':kind==='grass'?'#778062':'#a9a592';ctx.fillRect(0,0,256,256);
    for(let i=0;i<(kind==='stone'?550:4200);i++){
      const x=random()*256,y=random()*256;
      if(kind==='stone'){
        const r=3+random()*9, v=100+Math.floor(random()*65);
        ctx.fillStyle='rgb('+v+','+(v+1)+','+(v-8)+')';ctx.strokeStyle='#64665e';ctx.lineWidth=1;
        ctx.beginPath();for(let j=0;j<5;j++){const a=j/5*Math.PI*2;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.7;j?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();ctx.stroke();
      } else {ctx.fillStyle=random()<.5?'rgba(40,48,28,.12)':'rgba(226,224,197,.15)';ctx.fillRect(x,y,1+random()*3,1+random()*3);}
    }
    const tex=new THREE.CanvasTexture(canvas);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=4;return tex;
  };
  const material=(color,map)=>new THREE.MeshLambertMaterial({color,map:map||null,side:THREE.DoubleSide});
  const grass=material(0xffffff,texture('grass')), gravel=material(0xe3e0d2,texture('gravel')),
    rock=material(0xd5d3c3,texture('stone')), asphalt=material(0x62666a), pathMat=material(0x777c7a),
    concrete=material(0xb6b9b3), white=material(0xe4e5db), dark=material(0x4b5459),
    tankMat=material(0xf0eee5), trim=material(0x999e9b), roof=material(0x67835b), soil=material(0x8b8570);
  const add=(parent,geometry,mat,name)=>{const o=new THREE.Mesh(geometry,mat);o.name=name||'';o.receiveShadow=true;parent.add(o);return o;};
  function poly(parent,points,z,mat,name){
    const shape=new THREE.Shape(points.map(p=>new THREE.Vector2(...p))),g=new THREE.ShapeGeometry(shape);
    g.rotateX(-Math.PI/2);
    const pos=g.attributes.position,uv=g.attributes.uv;
    for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/5,-pos.getZ(i)/5);
    const m=add(parent,g,mat,name);m.position.y=z;return m;
  }
  function box(parent,p,l,w,h,angle,mat,z=E.ground,name){
    const m=add(parent,new THREE.BoxGeometry(l,h,w),mat,name);m.position.copy(V(p,z+h/2));m.rotation.y=angle;return m;
  }
  function ribbon(parent,points,width,z,mat,name){
    const a=E.offset(points,-width/2),b=E.offset(points,width/2);return poly(parent,a.concat([...b].reverse()),z,mat,name);
  }
  function bank(points,side,height,width){
    const crest=E.offset(points,side*width),positions=[],uvs=[];
    for(let i=0;i<points.length-1;i++){
      const p=[V(points[i],-.65),V(points[i+1],-.65),V(crest[i+1],height),V(crest[i],height)];
      for(const j of [0,1,2,0,2,3]){positions.push(...p[j]);uvs.push(p[j].x/3,(-p[j].z+p[j].y)/3);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.computeVertexNormals();add(terrain,g,rock,'Sloped stone bank');
    return crest;
  }
  // Continuous water is underneath these two land masses, including beneath the dam.
  poly(terrain,E.westLand,E.ground,grass,'Building-side land');
  poly(terrain,E.eastLand,E.ground,gravel,'Tank-side land');
  bank(E.westExtended,-1,.8,2.8);
  const eastCrest=bank(E.eastExtended,1,2.8,7);
  bank(E.plant,1,1.6,3);bank(E.tank,-1,2.8,5);
  // Raised apron behind the tank-side slope; finish back to the lower yard.
  poly(terrain,eastCrest.concat([...E.offset(E.eastExtended,32)].reverse()),2.8,gravel,'Raised bank apron');
  const topApron=E.offset(E.eastExtended,32),lowApron=E.offset(E.eastExtended,44),ap=[];
  for(let i=0;i<topApron.length-1;i++)for(const [p,z] of [[topApron[i],2.8],[topApron[i+1],2.8],[lowApron[i+1],.8],[topApron[i],2.8],[lowApron[i+1],.8],[lowApron[i],.8]])ap.push(...V(p,z));
  const ag=new THREE.BufferGeometry();ag.setAttribute('position',new THREE.Float32BufferAttribute(ap,3));ag.computeVertexNormals();add(terrain,ag,soil);
  poly(terrain,[[25,440],[291,206],[173,4],[-195,241]].map(project),.82,gravel,'Building-side service yard');
  ribbon(roads,E.road,7.5,.87,asphalt,'Bank road');
  const path=E.offset(E.road,8.3);
  ribbon(roads,path,3.2,.89,pathMat,'Shore path');
  const eastRoad=E.offset(E.eastExtended,13);
  ribbon(roads,eastRoad,7,2.84,asphalt,'Curved opposite-bank road');
  // Short dashed markings on the near path, aligned with each segment.
  for(let i=0;i<path.length-1;i++){
    const a=path[i],b=path[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),angle=Math.atan2(b[1]-a[1],b[0]-a[0]);
    for(let t=4;t<l-2;t+=9)box(roads,[a[0]+(b[0]-a[0])*t/l,a[1]+(b[1]-a[1])*t/l],2.5,.12,.012,angle,white,.903);
  }
  ribbon(roads,[E.road[0],project([305,329]),project([350,270]),project([409,247])],8,.9,asphalt,'Power station approach');

  // Dam: two trapezoidal earth/rock bodies and an actual rectangular water opening.
  const D=E.dam,dx=(D.b[0]-D.a[0])/D.length,dy=(D.b[1]-D.a[1])/D.length;
  const point=(u,v=0)=>[D.a[0]+u*dx-v*dy,D.a[1]+u*dy+v*dx],angle=Math.atan2(dy,dx);
  const gap=[D.length*D.openingFraction-D.openingWidth/2,D.length*D.openingFraction+D.openingWidth/2];
  function damBody(lo,hi){
    const cross=[[-D.toeWidth/2,-1],[-D.crestWidth/2,D.crestHeight],[D.crestWidth/2,D.crestHeight],[D.toeWidth/2,-1]];
    const vertices=[];
    const tri=(a,b,c)=>vertices.push(...a,...b,...c);
    const a=cross.map(([v,z])=>V(point(lo,v),z)),b=cross.map(([v,z])=>V(point(hi,v),z));
    for(let j=0;j<4;j++){const k=(j+1)%4;tri(a[j],b[j],b[k]);tri(a[j],b[k],a[k]);}
    for(let j=1;j<3;j++){tri(a[0],a[j],a[j+1]);tri(b[0],b[j+1],b[j]);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    const uv=[];for(let i=0;i<vertices.length;i+=3)uv.push(vertices[i]/3,(-vertices[i+2]+vertices[i+1])/3);
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();add(dam,g,rock,'Dam embankment');
  }
  damBody(-5,gap[0]-.15);damBody(gap[1]+.15,D.length+5);
  box(dam,D.opening,D.openingWidth,D.toeWidth,D.crestHeight-D.clearance,angle,concrete,D.clearance,'Passage roof');
  for(const u of gap)box(dam,point(u+(u===gap[0]?-.35:.35)),.7,D.toeWidth,D.clearance+1,angle,concrete,-1,'Passage side wall');
  box(dam,point(D.length/2),D.length+10,4.5,.07,angle,asphalt,D.crestHeight+.01,'Dam crest road');
  dam.userData={...D,gap,normal:[-dy,dx]};
  // No floor, gate, grille or invented stairs inside the passage.

  // Industrial masses: footprints from 9923, facade/roof heights estimated.
  const block=(pixel,l,w,h,angleDeg,mat,name)=>box(industrial,project(pixel),l,w,h,angleDeg*Math.PI/180,mat,E.ground,name);
  const plantMat=material(0x939d9d),hallMat=material(0xc2c5c1),brick=material(0x7e7770),blue=material(0x648296);
  const halls=[
    [[385,210],108,50,27,32,plantMat],[[444,180],100,55,36,32,brick],
    [[486,229],110,49,24,32,hallMat],[[354,165],67,46,44,32,brick],
    [[490,125],90,58,49,32,plantMat],[[537,180],67,38,20,32,hallMat],
    [[379,277],67,29,14,32,hallMat],[[529,86],82,44,48,32,brick],
    [[107,464],108,39,11,38,hallMat],[[73,421],78,29,10,38,dark],
    [[230,396],54,24,7,40,hallMat],[[198,297],54,32,9,33,hallMat]
  ];
  for(const [p,l,w,h,a,m] of halls){
    const o=block(p,l,w,h,a,m,'Industrial hall');
    box(industrial,project(p),l+1,w+1,.8,a*Math.PI/180,dark,E.ground+h);
    // Horizontal bands and roof plant improve the water-level silhouette without fictitious signage.
    for(let z=5;z<h-3;z+=6)box(industrial,project(p),l+.12,w+.12,.8,a*Math.PI/180,trim,E.ground+z);
    if(h>20)box(industrial,project(p),l*.35,w*.3,3,a*Math.PI/180,plantMat,E.ground+h);
  }
  function cylinder(parent,p,r,h,mat,z=E.ground,name){
    const m=add(parent,new THREE.CylinderGeometry(r,r,h,28),mat,name);m.position.copy(V(p,z+h/2));return m;
  }
  for(const [p,h,r] of [[[373,105],95,3],[[489,75],108,3.4],[[543,127],88,2.8]]){
    const pos=project(p);cylinder(industrial,pos,r,h,white,E.ground,'Power plant stack');
    cylinder(industrial,pos,r*1.02,7,dark,E.ground+h-7);
  }
  // Individual tank silhouettes, not the previous random field. Centres/diameters beyond
  // visible imagery are contextual estimates; no claim that every tank is surveyed.
  const tanks=[[570,500,22,19],[593,537,21,18],[617,574,19,17],[624,479,25,21],
    [647,519,23,20],[669,561,22,19],[681,474,24,20],[704,516,23,20],
    [726,559,24,21],[743,472,26,22],[766,518,24,20],[788,562,23,19]];
  for(const [u,v,r,h] of tanks){
    const p=project([u,v]);cylinder(industrial,p,r,h,tankMat,.8,'White cylindrical storage tank');
    cylinder(industrial,p,r+.3,.4,trim,.85);
    cylinder(industrial,p,r+.18,.35,white,.8+h);
    const cap=add(industrial,new THREE.ConeGeometry(r,.9,28),tankMat);
    cap.position.copy(V(p,.8+h+.45));
  }
  for(const [u,v,r,h] of [[470,587,24,8],[494,625,20,7],[455,707,25,6],[548,603,16,7]]){
    const p=project([u,v]);const mound=add(industrial,new THREE.ConeGeometry(r,h,9),soil,'Stockpile (approximate)');
    mound.position.copy(V(p,.8+h/2));
  }
  // Low waterfront structures and green land beyond the course.
  block([83,704],32,17,4,35,dark,'Front waterfront building');
  block([127,755],19,12,3,20,hallMat,'Small waterfront building');
  const treePos=[];
  for(let i=1;i<8;i++){const a=E.west[i-1],b=E.west[i];for(let t=10;t<Math.hypot(b[0]-a[0],b[1]-a[1]);t+=25){
    const f=t/Math.hypot(b[0]-a[0],b[1]-a[1]),p=[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f];
    const q=E.offset([a,p,b],-22)[1];treePos.push([...q,4+random()*3]);}}
  for(let i=0;i<35;i++){const p=project([65+random()*50,735+random()*120]);treePos.push([...p,4+random()*4]);}
  // Shoreline changes must not plant procedural trees through the terrace/buildings.
  const H=E.hangAround,T=H.terrace;
  for(let i=treePos.length-1;i>=0;i--){
    const dx=treePos[i][0]-H.origin[0],dy=treePos[i][1]-H.origin[1];
    const x=Math.cos(H.yaw)*dx+Math.sin(H.yaw)*dy,z=Math.sin(H.yaw)*dx-Math.cos(H.yaw)*dy;
    if(x>T.x-13&&x<T.x+13&&z>T.z-16&&z<T.z+53)treePos.splice(i,1);
  }
  const dummy=new THREE.Object3D(),trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.22,.35,1,5),material(0x67584a),treePos.length),
    crowns=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),material(0x65784b),treePos.length);
  treePos.forEach(([x,y,h],i)=>{
    dummy.position.copy(V([x,y],.8+h*.25));dummy.scale.set(1,h*.5,1);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
    dummy.position.copy(V([x,y],.8+h*.73));dummy.scale.set(h*.35,h*.48,h*.34);dummy.rotation.y=random()*6;dummy.updateMatrix();crowns.setMatrixAt(i,dummy.matrix);
  });vegetation.add(trunks,crowns);
  const reedPositions=[];
  for(let i=0;i<E.west.length-1;i++){
    const a=E.west[i],b=E.west[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let d=0;d<len;d+=1.7){const f=d/len,p=[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f];reedPositions.push(p);}
  }
  const reeds=new THREE.InstancedMesh(new THREE.ConeGeometry(.55,1,4),material(0x85835a),reedPositions.length);
  reedPositions.forEach((p,i)=>{dummy.position.copy(V(p,.45));dummy.scale.set(1,.6+random()*.8,1);dummy.rotation.set(0,random()*6,.1);dummy.updateMatrix();reeds.setMatrixAt(i,dummy.matrix);});vegetation.add(reeds);

  // Merge static mesh geometry by material, retaining the dam group for inspection/raycast tests.
  function batch(parent){
    parent.updateMatrixWorld(true);const buckets=new Map(),remove=[];
    parent.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material))return;
      const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);
      const b=buckets.get(o.material)||{p:[],n:[],uv:[]};buckets.set(o.material,b);
      const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
      for(let i=0;i<p.count;i++){b.p.push(p.getX(i),p.getY(i),p.getZ(i));b.n.push(n.getX(i),n.getY(i),n.getZ(i));b.uv.push(uv?uv.getX(i):0,uv?uv.getY(i):0);}
      g.dispose();remove.push(o);
    });
    for(const o of remove){o.parent.remove(o);o.geometry.dispose();}
    for(const [mat,b] of buckets){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));
      g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));g.computeBoundingSphere();add(parent,g,mat,'Batched '+parent.name);}
  }
  for(const g of [terrain,roads,industrial])batch(g);
  // Add the instanced landmark after environment batching to preserve its local transform.
  const copenhill=createCopenHill(THREE),cp=project([92,239]);
  copenhill.position.copy(V(cp,E.ground));copenhill.rotation.y=(33+180)*Math.PI/180; // High end at the left when seen from CCP, as in the report.
  root.add(copenhill);
  return root;
}
if(typeof module!=='undefined'&&module.exports)module.exports={environment:CCP_SURROUNDINGS,createCCPSurroundings};
