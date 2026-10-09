const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.platform==='win32'?'msedge':undefined,args:['--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///'+path.resolve(__dirname,'../dist/copenhagen_cable_park_sim.html').replaceAll('\\','/')+'#start-area');
 await page.waitForFunction(()=>window.__ccpDebug,{}, {timeout:45000});
 console.log(await page.evaluate(()=>{
 const d=__ccpDebug,m=d.scene.getObjectByName('CopenHill');if(!m)throw Error('Missing CopenHill');
 m.updateMatrixWorld(true);let instances=0,meshes=0;
 m.traverse(o=>{if(!o.isMesh)return;meshes++;if(o.isInstancedMesh)instances+=o.count;
 for(const v of o.geometry.attributes.position.array)if(!Number.isFinite(v))throw Error('Invalid geometry');});
 if(meshes!==1||m.userData.sourceMeshes!==1223||m.userData.source!=='copenhill_visual_proxy.glb')throw Error('Supplied model missing or not merged');
 const expected=CCP_SURROUNDINGS.project([92,239]);
 if(Math.abs(m.position.x-expected[0])>1e-6||Math.abs(m.position.z+expected[1])>1e-6)throw Error('Landmark moved');
 if(Math.abs(m.rotation.y-213*Math.PI/180)>1e-6)throw Error('CCP-facing silhouette reversed');
 const isolated=createCopenHill(THREE);isolated.updateMatrixWorld(true);
 const size=new THREE.Box3().setFromObject(isolated).getSize(new THREE.Vector3());
 if(Math.abs(size.x-190.82)>.02||Math.abs(size.y-126)>.02||Math.abs(size.z-86.555)>.02)throw Error('Proxy dimensions changed');
 for(const x of [-65,0,65]){
 const hits=new THREE.Raycaster(new THREE.Vector3(x,140,0),new THREE.Vector3(0,-1,0)).intersectObject(isolated,true);
 if(!hits.length||hits[0].point.y<10||hits[0].point.y>90)throw Error('Missing roof surface');
 }
 return {meshes,instances,position:m.position.toArray(),bounds:new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3()).toArray()};
 }));
 for(const [name,p,t] of [['ccp',[-5,24,-275],[0,49,0]],['roof',[-185,190,-210],[0,46,0]]]){
 const png=await page.evaluate(({p,t})=>{
 const d=__ccpDebug,m=d.scene.getObjectByName('CopenHill');d.setCam('orbit');
 d.persp.position.copy(m.localToWorld(new THREE.Vector3(...p)));d.controls.target.copy(m.localToWorld(new THREE.Vector3(...t)));d.controls.update();
 d.renderer.render(d.scene,d.persp);return d.renderer.domElement.toDataURL('image/png').split(',')[1];
 },{p,t});
 const out=path.resolve(__dirname,'../docs/screenshots');fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'copenhill-'+name+'.png'),Buffer.from(png,'base64'));
 }
 if(errors.length)throw Error(errors.join('\n'));console.log('Browser geometry and rendering passed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
