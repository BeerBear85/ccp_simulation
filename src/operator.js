/* Presentation only: simulation inputs, sampling and history remain in template.html. */
const CCP_OPERATOR = (() => {
  'use strict';
  const CONFIG = {
    speed: { label: 'Rider speed', unit: 'km/h', min: 0, max: 60, major: 10, minor: 2, decimals: 1, scaleDecimals: 0, zones: [] },
    tension: { label: 'Line tension', unit: 'kN', min: 0, max: 1.8, major: 0.2, minor: 0.05, decimals: 2, scaleDecimals: 1,
      zones: [
        { from: 0.8, to: 1.0, exclusive: false, tone: 'yellow', label: 'Caution' },
        { from: 1.0, to: Infinity, exclusive: true, tone: 'red', label: 'High tension' },
      ] },
    dampingSeconds: 0.09,
    panel: { defaultWidth: 400, minWidth: 320, maxWidth: 640, minMain: 740, overlayBelow: 1100 },
  };
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const zoneFor = (config, value) => config.zones.find(z => (z.exclusive ? value > z.from : value >= z.from) && value <= z.to);
  const angleFor = (config, value) => -135 + 270 * (clamp(value, config.min, config.max) - config.min) / (config.max - config.min);
  // Fast attack, damped return: upward excursions are never averaged away.
  const damp = (previous, target, seconds, reducedMotion = false) => target >= previous || reducedMotion
    ? target : target + (previous - target) * Math.exp(-Math.max(0, seconds) / CONFIG.dampingSeconds);

  class AnalogGauge {
    constructor(host, config) {
      this.config = config;
      this.value = this.needleValue = config.min;
      this.pendingHigh = -Infinity;
      this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
      const point = (angle, radius) => {
        const a = angle * Math.PI / 180;
        return [150 + Math.sin(a) * radius, 150 - Math.cos(a) * radius];
      };
      const arc = (from, to, radius) => {
        const a = angleFor(config, from), b = angleFor(config, to);
        return `M ${point(a, radius)} A ${radius} ${radius} 0 ${b - a > 180 ? 1 : 0} 1 ${point(b, radius)}`;
      };
      let ticks = '';
      const count = Math.round((config.max - config.min) / config.minor);
      for (let i = 0; i <= count; i++) {
        const value = config.min + i * config.minor, angle = angleFor(config, value);
        const major = Math.abs((value - config.min) / config.major - Math.round((value - config.min) / config.major)) < 1e-7;
        const [x1, y1] = point(angle, major ? 104 : 111), [x2, y2] = point(angle, 119);
        ticks += `<line class="gauge-tick ${major ? 'major' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
        if (major) {
          const [x, y] = point(angle, 91);
          ticks += `<text class="gauge-scale" x="${x}" y="${y}">${value.toFixed(config.scaleDecimals)}</text>`;
        }
      }
      host.classList.add('gauge');
      host.innerHTML = `<h2>${config.label}</h2>
        <svg viewBox="0 0 300 280" role="img">
          <path class="gauge-track" d="${arc(config.min, config.max, 126)}"/>
          ${config.zones.map(z => `<path class="gauge-zone ${z.tone}" d="${arc(z.from, Math.min(z.to, config.max), 126)}"/>`).join('')}
          ${ticks}
          <g class="gauge-needle"><path d="M 148 90 L 150 31 L 152 90 Z"/></g>
          <text class="gauge-value" x="150" y="150"></text>
          <text class="gauge-unit" x="150" y="177">${config.unit}</text>
          <text class="gauge-status" x="150" y="245"></text>
        </svg>
        <p class="gauge-caption">${config.zones.length ? config.zones.map(z => `<span class="${z.tone}">${z.label} ${Number.isFinite(z.to) ? z.from.toFixed(1) + '–' + z.to.toFixed(1) : '> ' + z.from.toFixed(1)}</span>`).join(' · ') + ' ' + config.unit : 'Live rider speed · ' + config.min + '–' + config.max + ' ' + config.unit}</p>`;
      this.svg = host.querySelector('svg');
      this.needle = host.querySelector('.gauge-needle');
      this.number = host.querySelector('.gauge-value');
      this.status = host.querySelector('.gauge-status');
      this.render(0);
    }
    observe(value) {
      this.value = value;
      // Keep every physics-step excursion until a frame can draw it. This does not alter recorded samples.
      this.pendingHigh = Math.max(this.pendingHigh, value);
    }
    reset(value) {
      this.value = this.needleValue = value;
      this.pendingHigh = -Infinity;
      this.render(0);
    }
    render(seconds) {
      const c = this.config, zone = zoneFor(c, this.value);
      const target = clamp(Math.max(this.value, this.pendingHigh), c.min, c.max);
      this.needleValue = damp(this.needleValue, target, seconds, this.reducedMotion.matches);
      this.pendingHigh = -Infinity;
      this.needle.setAttribute('transform', `rotate(${angleFor(c, this.needleValue)} 150 150)`);
      const formatted = this.value.toFixed(c.decimals);
      this.number.textContent = formatted;
      this.number.setAttribute('class', 'gauge-value' + (zone ? ' ' + zone.tone : ''));
      this.status.setAttribute('class', 'gauge-status' + (zone ? ' ' + zone.tone : ''));
      this.status.textContent = (zone ? '⚠ ' + zone.label : 'Live reading') + (this.value > c.max ? ' · Above scale' : '');
      this.svg.setAttribute('aria-label', `${c.label}: ${formatted} ${c.unit}${zone ? ', ' + zone.label : ''}${this.value > c.max ? ', above scale' : ''}`);
    }
  }

  function setupPanel(doc = document) {
    const app = doc.querySelector('.app'), panel = doc.getElementById('telemetryPanel');
    const toggle = doc.getElementById('btnPanel'), grip = doc.getElementById('panelResize');
    const cfg = CONFIG.panel;
    let open = false, width = cfg.defaultWidth;
    try {
      const saved = JSON.parse(localStorage.getItem('ccpOperatorPanel'));
      if (saved && typeof saved.open === 'boolean') open = saved.open;
      if (saved && Number.isFinite(saved.width)) width = clamp(saved.width, cfg.minWidth, cfg.maxWidth);
    } catch (e) { /* Storage can be disabled or contain a stale value. */ }
    const maxWidth = () => Math.max(Math.min(cfg.minWidth, innerWidth), Math.min(cfg.maxWidth,
      innerWidth < cfg.overlayBelow ? innerWidth : innerWidth - cfg.minMain));
    function apply() {
      const actual = Math.min(width, maxWidth());
      app.style.setProperty('--telemetry-width', actual + 'px');
      app.classList.toggle('panel-open', open);
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      grip.setAttribute('aria-valuemin', String(Math.min(cfg.minWidth, maxWidth())));
      grip.setAttribute('aria-valuemax', String(maxWidth()));
      grip.setAttribute('aria-valuenow', String(Math.round(actual)));
    }
    function save() { try { localStorage.setItem('ccpOperatorPanel', JSON.stringify({ open, width })); } catch (e) {} }
    function setOpen(value) {
      open = value;
      if (!open && panel.contains(doc.activeElement)) toggle.focus();
      apply(); save();
    }
    toggle.onclick = () => setOpen(!open);
    doc.getElementById('btnPanelClose').onclick = () => setOpen(false);
    addEventListener('resize', apply);
    addEventListener('keydown', e => {
      if (!doc.getElementById('cover').classList.contains('gone') || e.ctrlKey || e.metaKey || e.altKey || e.repeat ||
          e.target.closest('input, select, textarea, [contenteditable="true"]')) return;
      if (e.key.toLowerCase() === 'l') { e.preventDefault(); setOpen(!open); }
    });
    let drag = null;
    grip.onpointerdown = e => {
      if (e.button !== 0) return;
      drag = { x: e.clientX, width: panel.getBoundingClientRect().width };
      grip.setPointerCapture(e.pointerId); e.preventDefault();
    };
    grip.onpointermove = e => {
      if (!drag) return;
      width = clamp(drag.width + drag.x - e.clientX, Math.min(cfg.minWidth, maxWidth()), maxWidth()); apply();
    };
    const finish = () => { if (drag) { drag = null; save(); } };
    grip.onpointerup = finish; grip.onpointercancel = finish; grip.onlostpointercapture = finish;
    grip.onkeydown = e => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault(); e.stopPropagation();
      const actual = panel.getBoundingClientRect().width;
      width = e.key === 'Home' ? cfg.minWidth : e.key === 'End' ? maxWidth() : actual + (e.key === 'ArrowLeft' ? 20 : -20);
      width = clamp(width, Math.min(cfg.minWidth, maxWidth()), maxWidth()); apply(); save();
    };
    apply();
    return { setOpen, get isOpen() { return open; } };
  }
  return { CONFIG, AnalogGauge, setupPanel, zoneFor, angleFor, damp };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = CCP_OPERATOR;
