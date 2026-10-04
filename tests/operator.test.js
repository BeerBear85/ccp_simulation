const test = require('node:test');
const assert = require('node:assert/strict');
const { CONFIG, zoneFor, angleFor, damp, AnalogGauge } = require('../src/operator.js');

test('tension boundaries are inclusive yellow at 0.8 and 1.0, red strictly above 1.0', () => {
  assert.equal(zoneFor(CONFIG.tension, 0.7999), undefined);
  assert.equal(zoneFor(CONFIG.tension, 0.8).tone, 'yellow');
  assert.equal(zoneFor(CONFIG.tension, 1).tone, 'yellow');
  assert.equal(zoneFor(CONFIG.tension, 1.0001).tone, 'red');
  assert.equal(zoneFor(CONFIG.tension, 2.4).tone, 'red');
  assert.equal(zoneFor(CONFIG.speed, 42), undefined);
});

test('needle clamps to the scale and damping does not suppress rising peaks', () => {
  assert.equal(angleFor(CONFIG.speed, 75), angleFor(CONFIG.speed, 60));
  assert.equal(angleFor(CONFIG.tension, 2.4), angleFor(CONFIG.tension, 1.8));
  assert.equal(angleFor(CONFIG.tension, -1), angleFor(CONFIG.tension, 0));
  assert.equal(damp(0.5, 1.7, 1 / 60), 1.7);
  assert.ok(damp(1.7, 0.5, 1 / 60) > 0.5);
  assert.ok(damp(1.7, 0.5, 1 / 60) < 1.7);
  assert.equal(damp(1.7, 0.5, 1 / 60, true), 0.5);
});

test('a short excursion between frames reaches the needle while the number stays current', () => {
  const element = () => ({textContent: '', attributes: {}, setAttribute(k, v) { this.attributes[k] = v; }});
  const gauge = Object.create(AnalogGauge.prototype);
  Object.assign(gauge, {config:CONFIG.tension, value:0, needleValue:0, pendingHigh:-Infinity,
    reducedMotion:{matches:false}, needle:element(), number:element(), status:element(), svg:element()});
  gauge.observe(2.4);
  gauge.observe(0.4);
  gauge.render(1 / 60);
  assert.equal(gauge.needleValue, 1.8);
  assert.equal(gauge.number.textContent, '0.40');
  gauge.render(1 / 60);
  assert.ok(gauge.needleValue < 1.8 && gauge.needleValue > 0.4);
  gauge.observe(2.4);
  gauge.render(1 / 60);
  assert.equal(gauge.number.textContent, '2.40');
  assert.match(gauge.status.textContent, /Above scale/);
  assert.match(gauge.number.attributes.class, /red/);
  gauge.reset(0);
  assert.equal(gauge.needleValue, 0);
});
