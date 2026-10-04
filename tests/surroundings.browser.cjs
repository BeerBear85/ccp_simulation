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
    await page.goto('file:///'+path.resolve(__dirname,'../dist/copenhagen_cable_park_sim.html').replaceAll('\\','/')+'#surroundings');
    await page.waitForFunction(()=>window.__ccpDebug,{},{timeout:45000});
    await page.locator('#camSurroundings').click();
    await page.waitForTimeout(600);
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
    await page.locator('#view').screenshot({path:path.join(out,'surroundings-overview.png')});
    for(const name of ['dam','tanks']){
      await page.locator('#selSurroundings').selectOption(name);
      await page.waitForTimeout(250);
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
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Surroundings camera controls fit mobile width');
    assert.deepEqual(errors,[]);console.log(JSON.stringify(checks,null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
