const test = require('node:test');
const assert = require('node:assert/strict');
const { environment: E } = require('../src/surroundings.js');
const { createSim } = require('../src/physics.js');

function inside(p, polygon) {
  let c = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}

test('source measurement sets the environment scale without moving the riding layout', () => {
  const a = E.project([167, 544]), b = E.project([318, 365]);
  assert.ok(Math.abs(Math.hypot(a[0] - b[0], a[1] - b[1]) - 256.97) < 1e-8);
  const sim = createSim();
  assert.deepEqual(sim.path.wheels, [[5.4,4.2],[77,-51.5],[106.6,-45.5],[173.4,84.6],[157.5,118.2],[116.9,118.4]]);
  for (const p of sim.path.wheels.concat(sim.obs.map(o => [o.x, o.y]))) {
    assert.ok(inside(p, E.water), `Riding feature must lie over water: ${p}`);
    assert.ok(!inside(p, E.westLand) && !inside(p, E.eastLand), `Land must not cover riding feature: ${p}`);
  }
});

test('water continues beyond the front jetties and behind the dam', () => {
  for (const pixel of [[246,690],[285,785],[360,960],[440,1220],[407,406]]) {
    const p = E.project(pixel);
    assert.ok(inside(p, E.water), `Channel/basin connectivity lost at ${pixel}`);
    assert.ok(!inside(p, E.westLand) && !inside(p, E.eastLand));
  }
});

test('both approaches to the dam passage lie in water, outside the land masses', () => {
  const D = E.dam, normal = [(D.a[1]-D.b[1])/D.length, (D.b[0]-D.a[0])/D.length];
  for (const distance of [-25, 0, 25]) {
    const p = D.opening.map((v,i) => v + distance * normal[i]);
    assert.ok(inside(p, E.water));
    assert.ok(!inside(p, E.westLand) && !inside(p, E.eastLand));
  }
});

test('measured hang-around bridge reaches a terrace supported by land', () => {
  const H = E.hangAround, a = H.world(H.bridgeStart), b = H.world(H.bridgeEnd);
  assert.ok(Math.abs(Math.hypot(b[0]-a[0],b[1]-a[1])-103.48)<1e-8);
  const t=H.terrace;
  for(const x of [t.x-t.width/2,t.x,t.x+t.width/2]) for(const z of [t.z-t.depth/2,t.z,t.z+t.depth/2]) {
    assert.ok(inside(H.world([x,z]),E.westLand), `Terrace corner over water: ${x},${z}`);
  }
  for(const f of [0,.25,.5,.75,.9]) {
    assert.ok(inside(a.map((v,i)=>v+(b[i]-v)*f),E.water),'Bridge must span water before landfall');
  }
});

test('marked waterline preserves both straight banks and the measured total', () => {
  const S=E.shorelineCalibration;
  let length=0;
  for(let i=1;i<S.world.length;i++) {
    const a=S.world[i-1],b=S.world[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);length+=len;
    assert.deepEqual(E.west[E.west.indexOf(a)+1],b,'No invented bend between marked vertices');
    const normal=[-(b[1]-a[1])/len,(b[0]-a[0])/len];
    for(const f of [.1,.3,.5,.7,.9]) {
      const p=a.map((v,j)=>v+(b[j]-v)*f);
      const land=p.map((v,j)=>v-normal[j]*3),water=p.map((v,j)=>v+normal[j]*3);
      assert.ok(inside(land,E.westLand)&&!inside(land,E.water),'Land side of marked bank');
      assert.ok(inside(water,E.water)&&!inside(water,E.westLand),'Water side of marked bank');
    }
  }
  assert.ok(Math.abs(length-196.92)<1e-8);
  S.controlPixels.forEach((p,i)=>{
    const q=E.shorelineProject(p),r=S.controlWorld[i];
    assert.ok(Math.hypot(q[0]-r[0],q[1]-r[1])<7,'Jetty registration residual under 7 m');
  });
});
