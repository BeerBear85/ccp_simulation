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
    assert not errors, errors
    print(json.dumps({"file": str(OUT / "ccp_control_start_lounge.glb"), "bytes": len(binary), "roundtrip": loaded, "browser_errors": errors}))
    browser.close()
