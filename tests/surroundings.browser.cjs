/* Browser geometry and visual acceptance for the measured surroundings.
 * NODE_PATH may point at an installed Playwright; uses Edge on Windows.
 */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:process.env.CCP_BROWSER_CHANNEL||(process.platform==='win32'?'msedge':undefined),args:['--enable-unsafe-swiftshader']});
  try{
    const page=await browser.newPage({viewport:{width:1500,height:1000},deviceScaleFactor:1});
    if(process.env.CCP_BROWSER_VENDOR){
      await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({path:path.join(process.env.CCP_BROWSER_VENDOR,r.request().url().split('/').pop()),contentType:'text/javascript'}));
      await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({body:'',contentType:'text/css'}));
    }
    const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('Browser:',e.message);});
    page.on('requestfailed',r=>console.error('Request failed:',r.url(),r.failure()?.errorText));
    await page.goto('file:///'+path.resolve(__dirname,'../dist/copenhagen_cable_park_sim.html').replaceAll('\\','/')+'#start-area');
    await page.waitForFunction(()=>window.__ccpDebug,{},{timeout:45000});
    // No Surroundings camera in the UI (debug only, removed): position the orbit camera from the data instead.
    const view=async name=>{await page.evaluate(n=>{const d=__ccpDebug,c=CCP_SURROUNDINGS.cameras[n];d.setCam('orbit');
      d.persp.position.set(c.position[0],c.position[2],-c.position[1]);d.controls.target.set(c.target[0],c.target[2],-c.target[1]);d.controls.update();},name);
      await page.waitForTimeout(250);};
    await view('overview');
    const checks=await page.evaluate(()=>{
      const d=__ccpDebug,E=CCP_SURROUNDINGS,D=E.dam;d.scene.updateMatrixWorld(true);
      const dam=d.surroundings.getObjectByName('Dam with water passage'),ray=new THREE.Raycaster();
      const normal=dam.userData.normal;
      const hitsAt=(side,height)=>{
        const from=new THREE.Vector3(D.opening[0]+normal[0]*side,height,-D.opening[1]-normal[1]*side);
        ray.set(from,new THREE.Vector3(-Math.sign(side)*normal[0],0,Math.sign(side)*normal[1]));ray.far=44;
        return ray.intersectObject(d.surroundings,true).filter(h=>h.distance<Math.abs(side)+D.toeWidth/2+.1).map(h=>({name:h.object.name,d:h.distance}));
      };
      const openingRays=[-22,22].flatMap(side=>[.25,1,2].map(z=>({side,z,hits:hitsAt(side,z)})));
      ray.set(new THREE.Vector3(D.opening[0],.2,-D.opening[1]),new THREE.Vector3(0,1,0));ray.far=8;
      const roof=ray.intersectObject(dam,true)[0];
      const {roadX,shoreX}=d.startArea.userData.access;
      return {openingRays,roof:roof&&{name:roof.object.name,height:roof.point.y},roadX,shoreX,
        measurements:E.calibration.pixels.map(E.project),render:window.__gfxInfo(),groups:d.surroundings.children.map(o=>o.name)};
    });
    for(const r of checks.openingRays)assert.equal(r.hits.length,0,'Water passage blocked: '+JSON.stringify(r));
    assert.equal(checks.roof.name,'Passage roof');assert.ok(Math.abs(checks.roof.height-2.6)<.001);
    assert.ok(checks.roadX<checks.shoreX&&checks.shoreX<-6.5,'Start access must meet bank before road');
    assert.ok(Math.abs(Math.hypot(...checks.measurements[0].map((v,i)=>v-checks.measurements[1][i]))-256.97)<1e-8);
    assert.match(await page.locator('#btnPlay').innerText(),/Run$/);
    if(await page.locator('#btnInfo').getAttribute('aria-pressed')==='true')await page.locator('#btnInfo').click();
    const out=path.resolve(__dirname,'../docs/screenshots');fs.mkdirSync(out,{recursive:true});
    await page.evaluate(()=>__ccpDebug.setCam('hang-around'));
    await page.waitForTimeout(250);
    await page.locator('#view').screenshot({path:path.join(out,'hang-around-overview.png')});
    const hangChecks=await page.evaluate(()=>{
      const d=__ccpDebug,m=d.startArea,H=m.userData.hangAround;
      const b=m.userData.bridges.find(b=>b.name==='Long transverse walkway');
      const ray=new THREE.Raycaster();d.scene.updateMatrixWorld(true);
      const terrain=d.surroundings.getObjectByName('Land and bank slopes');
      const ground=[];
      for(const x of [H.terrace.x-10,H.terrace.x+10]) for(const z of [H.terrace.z-13,H.terrace.z+13]) {
        ray.set(m.localToWorld(new THREE.Vector3(x,6,z)),new THREE.Vector3(0,-1,0));
        ground.push(ray.intersectObject(terrain,true)[0]?.point.y);
      }
      d.persp.position.copy(m.localToWorld(new THREE.Vector3(38,45,160)));
      d.controls.target.copy(m.localToWorld(new THREE.Vector3(-4,1,132)));d.controls.update();
      return {length:Math.hypot(b.b[0]-b.a[0],b.b[2]-b.a[2]),end:b.b,arrival:H.arrival,ground};
    });
    assert.ok(Math.abs(hangChecks.length-103.48)<1e-8);
    assert.deepEqual(hangChecks.end,hangChecks.arrival);
    assert.ok(hangChecks.ground.every(h=>Math.abs(h-.8)<.001),'Terrace requires rendered land underneath');
    await page.waitForTimeout(250);
    await page.locator('#view').screenshot({path:path.join(out,'hang-around-detail.png')});
    const shorePlan=await page.evaluate(()=>{
      const d=__ccpDebug,m=d.startArea,ray=new THREE.Raycaster();
      const terrain=d.surroundings.getObjectByName('Land and bank slopes'),points=CCP_SURROUNDINGS.shorelineCalibration.world;
      for(let i=1;i<points.length;i++) {
        const a=points[i-1],b=points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
        const n=[-(b[1]-a[1])/len,(b[0]-a[0])/len];
        for(const f of [.2,.5,.8]) for(const side of [-1,1]) {
          const p=a.map((v,j)=>v+(b[j]-v)*f+side*n[j]*5);
          ray.set(new THREE.Vector3(p[0],8,-p[1]),new THREE.Vector3(0,-1,0));
          const hits=ray.intersectObject(terrain,true);
          if((side<0)!==(hits.length>0))throw new Error('Rendered bank does not follow marked waterline');
        }
      }
      const aspect=d.renderer.domElement.width/d.renderer.domElement.height;
      const cam=new THREE.OrthographicCamera(-120*aspect,120*aspect,120,-120,.1,1500);
      cam.position.copy(m.localToWorld(new THREE.Vector3(25,500,90)));
      cam.up.copy(new THREE.Vector3(0,0,-1).transformDirection(m.matrixWorld));
      cam.lookAt(m.localToWorld(new THREE.Vector3(25,0,90)));
      d.renderer.render(d.scene,cam);
      return d.renderer.domElement.toDataURL('image/png').split(',')[1];
    });
    fs.writeFileSync(path.join(out,'hang-around-plan.png'),Buffer.from(shorePlan,'base64'));
    await view('overview');
    await page.locator('#view').screenshot({path:path.join(out,'surroundings-overview.png')});
    for(const name of ['dam','tanks']){
      await view(name);
      await page.locator('#view').screenshot({path:path.join(out,'surroundings-'+name+'.png')});
    }
    const png=await page.evaluate(()=>{
      const d=__ccpDebug,aspect=d.renderer.domElement.width/d.renderer.domElement.height;
      const camera=new THREE.OrthographicCamera(-400*aspect,400*aspect,400,-400,.1,3000);
      camera.position.set(160,1200,-110);camera.up.set(0,0,-1);camera.lookAt(160,0,-110);
      d.scene.updateMatrixWorld(true);d.renderer.render(d.scene,camera);
      return d.renderer.domElement.toDataURL('image/png').split(',')[1];
    });
    fs.writeFileSync(path.join(out,'surroundings-plan.png'),Buffer.from(png,'base64'));
    await page.setViewportSize({width:390,height:844});
    await page.waitForTimeout(150);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Camera controls fit mobile width');
    assert.deepEqual(errors,[]);console.log(JSON.stringify(checks,null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
