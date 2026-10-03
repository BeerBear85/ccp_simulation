"""Export the built, photo-based CCP start area to GLB and capture its preview.

Requires Python Playwright and its Chromium browser. Run `python build.py` first.
Three.js and its matching exporter/loader are loaded from the simulator's pinned CDN.
"""
import base64
import json
from pathlib import Path
import struct

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist"

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 1000})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto((OUT / "copenhagen_cable_park_sim.html").as_uri() + "#start-area")
    page.wait_for_function("window.__ccpDebug !== undefined")
    # Exercise the real camera button, including its pause behaviour.
    page.locator("#camStart").click()
    assert page.locator("#camStart").get_attribute("aria-pressed") == "true"
    assert page.locator("#btnPlay").inner_text() == "Run"
    if page.locator("#btnInfo").get_attribute("aria-pressed") == "true":
        page.locator("#btnInfo").click()
    geometry_check = page.evaluate("""() => {
      const d = window.__ccpDebug, model = d.startArea;
      model.updateMatrixWorld(true);
      const launch = model.getObjectByName('Start carpet - physics surface');
      const ray = new THREE.Raycaster(), errors = [];
      for (const u of [-1.2, 0, 1.3]) for (const v of [-0.4, 0.4]) {
        const x = PHYS.DOCK_C[0] + u * PHYS.DOCK_DIR[0] - v * PHYS.DOCK_DIR[1];
        const y = PHYS.DOCK_C[1] + u * PHYS.DOCK_DIR[1] + v * PHYS.DOCK_DIR[0];
        ray.set(new THREE.Vector3(x, 5, -y), new THREE.Vector3(0, -1, 0));
        const hit = ray.intersectObject(launch, true)[0], contact = d.sim.dockAt(x, y);
        if (!hit || !contact || Math.abs(hit.point.y - contact.h) > 0.004) errors.push({u,v,height:hit?.point.y,expected:contact?.h});
      }
      const {roadX, shoreX} = model.userData.access;
      if (!(roadX < shoreX && shoreX < -6.5)) errors.push('Road/shore/access order is invalid');
      if (model.userData.bridges.length !== 7) errors.push('Missing walkway segment');
      const approach = model.userData.bridges.find(b => b.name === 'Shore approach to road');
      if (Math.min(approach.a[1], approach.b[1]) <= 0.8) errors.push('Road approach buried below ground');
      const direction = new THREE.Vector3(1, 0, 0).transformDirection(model.matrixWorld);
      const expected = new THREE.Vector3(LAYOUT.jetty[2][0]-LAYOUT.jetty[1][0],0,-LAYOUT.jetty[2][1]+LAYOUT.jetty[1][1]).normalize();
      if (direction.dot(expected) < 0.999999) errors.push('Deck not aligned with through-jetty');
      const ramp = model.getObjectByName('Blue access apron - visual only');
      const rampHeights = [2,4,6].map(x => {
        const pos = model.localToWorld(new THREE.Vector3(x, 5, 1.2));
        ray.set(pos, new THREE.Vector3(0,-1,0));
        return ray.intersectObject(ramp,true)[0]?.point.y;
      });
      if (!(rampHeights[0] > PHYS.DOCK_TOP && rampHeights[0] < rampHeights[1] && rampHeights[1] < rampHeights[2] && rampHeights[2] < 0.75))
        errors.push({message:'Access ramp must rise continuously towards lounge',rampHeights});
      const column = model.getObjectByName('Start mast - single anchored column');
      const foot = model.userData.startMast.foot;
      const pier = model.userData.bridges.find(b => b.name === 'Inner finger pier');
      if (Math.hypot(foot[0]-pier.b[0],foot[2]-pier.b[2]) > 0.01) errors.push('Mast is not at inner pier end');
      // Inspect the actual lower column vertices, so a second spread foot cannot
      // pass merely by keeping a metadata count of one.
      const lower = [];
      column.traverse(o => { if (o.isMesh) {
        const p = o.geometry.attributes.position;
        for(let i=0;i<p.count;i++) if(p.getY(i)<1.3) lower.push([p.getX(i),p.getZ(i)]);
      }});
      if (!lower.length || [0,1].some(axis=>Math.max(...lower.map(p=>p[axis]))-Math.min(...lower.map(p=>p[axis]))>1.2))
        errors.push('Mast must have one compact foot, not a spread A-frame');
      if (errors.length) throw new Error(JSON.stringify(errors));
      return {launchContactSamples: 6, walkwaySegments: 7, deckYawDegrees:model.userData.deckYaw*180/Math.PI, rampHeights, singleMastFoot:foot};
    }""")
    page.add_script_tag(url="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/exporters/GLTFExporter.js")
    encoded = page.evaluate("""async () => {
      const model = window.__ccpDebug.startArea.clone(true);
      model.position.set(0, 0, 0); model.rotation.set(0, 0, 0); model.updateMatrixWorld(true);
      const data = await new Promise((resolve, reject) => new THREE.GLTFExporter().parse(model, resolve, reject, {binary:true}));
      return await new Promise(resolve => {
        const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(new Blob([data]));
      });
    }""")
    binary = base64.b64decode(encoded)
    magic, version, size = struct.unpack_from("<III", binary)
    assert magic == 0x46546C67 and version == 2 and size == len(binary)
    json_length, chunk_type = struct.unpack_from("<II", binary, 12)
    assert chunk_type == 0x4E4F534A
    manifest = json.loads(binary[20:20 + json_length])
    assert manifest["meshes"] and manifest["materials"]
    (OUT / "ccp_control_start_lounge.glb").write_bytes(binary)
    # Read the exported binary back with the same renderer, rather than only checking its header.
    page.add_script_tag(url="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/loaders/GLTFLoader.js")
    loaded = page.evaluate("""async encoded => {
      const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
      const gltf = await new Promise((resolve, reject) => new THREE.GLTFLoader().parse(bytes.buffer, '', resolve, reject));
      let meshes = 0; gltf.scene.traverse(o => { if (o.isMesh) meshes++; });
      const size = new THREE.Box3().setFromObject(gltf.scene).getSize(new THREE.Vector3()).toArray();
      if (!size.every(Number.isFinite)) throw new Error('Non-finite exported bounds');
      return { meshes, size };
    }""", encoded)
    assert loaded["meshes"] > 0
    page.screenshot(path=str(OUT / "start-area-preview.png"))
    # Additional close inspection of cabin, queue apron and lounge.
    page.evaluate("""() => {
      const d = window.__ccpDebug;
      d.persp.position.copy(d.startArea.localToWorld(new THREE.Vector3(14, 8, -14)));
      d.controls.target.copy(d.startArea.localToWorld(new THREE.Vector3(1, 1.2, 4)));
      d.controls.update();
    }""")
    page.wait_for_timeout(250)
    page.locator("#view").screenshot(path=str(OUT / "start-area-detail.png"))
    page.evaluate("""() => {
      const d = window.__ccpDebug;
      d.persp.position.copy(d.startArea.localToWorld(new THREE.Vector3(4, 12, -39)));
      d.controls.target.copy(d.startArea.localToWorld(new THREE.Vector3(-6, 4, -1)));
      d.controls.update();
    }""")
    page.wait_for_timeout(250)
    page.locator("#view").screenshot(path=str(OUT / "start-area-mast.png"))
    plan = page.evaluate("""() => {
      const d = window.__ccpDebug, aspect = d.renderer.domElement.width / d.renderer.domElement.height;
      const camera = new THREE.OrthographicCamera(-47, 47, 47/aspect, -47/aspect, 0.1, 1000);
      camera.position.copy(d.startArea.localToWorld(new THREE.Vector3(-18, 120, 3)));
      camera.up.copy(new THREE.Vector3(0, 0, -1).transformDirection(d.startArea.matrixWorld));
      camera.lookAt(d.startArea.localToWorld(new THREE.Vector3(-18, 0, 3)));
      d.renderer.render(d.scene, camera);
      return d.renderer.domElement.toDataURL('image/png').split(',')[1];
    }""")
    (OUT / "start-area-plan.png").write_bytes(base64.b64decode(plan))
    assert not errors, errors
    print(json.dumps({"file": str(OUT / "ccp_control_start_lounge.glb"), "bytes": len(binary), "roundtrip": loaded, "geometry": geometry_check, "browser_errors": errors}))
    browser.close()
