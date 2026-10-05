import json, sys, math
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection
from matplotlib.patches import Polygon

d = json.load(open(sys.argv[1])); out = sys.argv[2]; names = sys.argv[3].split(',')
labels = dict(x.split('=') for x in sys.argv[4].split(';')) if len(sys.argv) > 4 else {}
G = d['geo']; T = d['traces']
for n in T:
    tr = T[n]['tr']; keep = [tr[0]]
    for p in tr[1:]:
        if p[1] >= keep[-1][1]: keep.append(p)
    T[n]['tr'] = keep
fig = plt.figure(figsize=(15, 12)); gs = fig.add_gridspec(3, len(names), height_ratios=[3, 1.1, 1.0])
norm = plt.Normalize(0, 1600); cmap = plt.get_cmap('turbo')
for i, n in enumerate(names):
    ax = fig.add_subplot(gs[0, i])
    ax.add_patch(Polygon(G['water'], closed=True, fc='#dcebf2', ec='#7aa0b0', lw=0.8, zorder=0))
    j = G['jetty']; ax.plot([p[0] for p in j], [p[1] for p in j], color='#8a6d48', lw=4, zorder=1)
    pth = G['path'] + [G['path'][0]]; ax.plot([p[0] for p in pth], [p[1] for p in pth], color='#555', lw=1, ls='--', zorder=2)
    for m, w in zip(G['masts'], G['wheels']):
        ax.plot(*w, 'ks', ms=4, zorder=3); ax.annotate(m['id'], w, xytext=(5, 5), textcoords='offset points', fontsize=9, weight='bold')
    for o in G['obs']:
        ax_, ay_ = o['ax'], o['ay']; hl, hw = o['L'] / 2, o['W'] / 2
        c = [(o['x'] + sx * hl * ax_ - sy * hw * ay_, o['y'] + sx * hl * ay_ + sy * hw * ax_) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
        ax.add_patch(Polygon(c, closed=True, fc='#f4f4f4', ec='#333', lw=0.7, zorder=3))
    for nm in sorted(set(o['name'].split()[0] for o in G['obs'])):
        oo = [o for o in G['obs'] if o['name'].startswith(nm)][0]; ax.annotate(nm, (oo['x'], oo['y']), xytext=(-14, 6), textcoords='offset points', fontsize=7, color='#333')
    tr = T[n]['tr']; xy = [(p[2], p[3]) for p in tr]; F = [p[4] for p in tr]
    segs = [[xy[k], xy[k + 1]] for k in range(len(xy) - 1)]
    lc = LineCollection(segs, cmap=cmap, norm=norm, lw=2.2, zorder=4); lc.set_array(F[:-1]); ax.add_collection(lc)
    k = max(range(len(F)), key=lambda q: F[q]); ax.plot(*xy[k], 'o', mfc='none', mec='red', ms=12, mew=2, zorder=5)
    ax.annotate(f"max {F[k]:.0f} N", xy[k], xytext=(8, -14), textcoords='offset points', color='red', fontsize=9, weight='bold')
    ax.set_xlim(-30, 200); ax.set_ylim(-80, 150); ax.set_aspect('equal'); ax.grid(alpha=0.2)
    ax.set_title(labels.get(n, n), fontsize=11)
    last = lc
fig.colorbar(last, ax=fig.axes, fraction=0.025, pad=0.01, label='Line force (N)', shrink=0.6, anchor=(0, 0.9))
ax2 = fig.add_subplot(gs[1, :])
for n in names:
    tr = T[n]['tr']; ax2.plot([p[1] for p in tr], [p[4] for p in tr], lw=1.2, label=f"{labels.get(n, n)} (max {max(p[4] for p in tr):.0f} N)")
sheaves = {}
L = len(G['path'])
ax2.set_xlabel('Carrier position along the cable from TA (m)'); ax2.set_ylabel('Line force (N)'); ax2.set_xlim(0, L)
ax2.legend(fontsize=9, loc='upper left', framealpha=0.9); ax2.grid(alpha=0.3)
if len(sys.argv) > 5:
    for kv in sys.argv[5].split(','):
        nm, s0 = kv.split(':'); ax2.axvline(float(s0), color='#999', lw=0.8, ls=':'); ax2.text(float(s0), -60, nm, fontsize=9, ha='center', va='top', weight='bold')
ax2.set_ylim(-140, None)
ax3 = fig.add_subplot(gs[2, :], sharex=ax2)
for n in names:
    tr = T[n]['tr']; ax3.plot([p[1] for p in tr], [p[9] for p in tr], lw=1.2, label=f"{labels.get(n, n)} (max {max(p[9] for p in tr):.1f} km/h)")
ax3.axhline(38, color='red', lw=1, ls='--'); ax3.text(5, 38.4, '38 km/h', color='red', fontsize=8)
ax3.set_ylabel('Rider speed (km/h)'); ax3.set_xlabel('Carrier position along the cable from TA (m)'); ax3.grid(alpha=0.3); ax3.legend(fontsize=9, loc='lower left', framealpha=0.9)
ax3.set_ylim(15, None)
fig.savefig(out, dpi=110, bbox_inches='tight')
