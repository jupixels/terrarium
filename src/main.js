// ===================== audio =====================
// Sound effects, ambience and music generated with ElevenLabs; files live in audio/.
const AUDIO = {
  click: ['click', 0.35], place: ['place', 0.6], hammer: [['hammer1', 'hammer2'], 0.32], complete: ['complete', 0.5],
  chop: ['chop', 0.4], mine: [['mine1', 'mine2'], 0.35], thunder: ['thunder', 0.85], error: ['error', 0.45],
  notify: ['notify', 0.45], birth: ['birth', 0.45], bless: ['bless', 0.55], era: ['era', 0.7], alarm: ['alarm', 0.45],
  death: ['death', 0.5], dig: [['dig1', 'dig2'], 0.4], victory: ['victory', 0.75], collapse: ['collapse', 0.7],
  a_rain: ['rain', 1], a_fire: ['fire', 1], a_wind: ['wind', 1], a_birds: ['birds', 1], a_night: ['night', 1],
  m_day: ['music_day', 1], m_night: ['music_night', 1],
};
const SND = {
  sfx: null, muted: false, musicOn: true, vol: 0.7, loops: null, ready: false,
  async init() {
    try {
      this.sfx = new SFX({ base: 'audio/' });
      const map = {}; for (const k in AUDIO) { const [f, v] = AUDIO[k]; map[k] = { src: Array.isArray(f) ? f.map(x => x + '.mp3') : f + '.mp3', volume: v }; }
      this.sfx.setVolume('master', this.muted ? 0 : this.vol); this.sfx.setVolume('music', this.musicOn ? 0.42 : 0);
      await this.sfx.load(map);
      this.loops = {}; for (const k of ['a_rain', 'a_fire', 'a_wind', 'a_birds', 'a_night']) this.loops[k] = this.sfx.loop(k, { volume: 0, fadeIn: 0.01 });
      this.loops.m_day = this.sfx.loop('m_day', { volume: 0, fadeIn: 0.01, bus: 'music' }); this.loops.m_night = this.sfx.loop('m_night', { volume: 0, fadeIn: 0.01, bus: 'music' });
      this.ready = true;
    } catch (e) { console.warn(e); }
  },
  play(n, o) { if (this.sfx && this.ready && !this.muted) try { this.sfx.play(n, o || {}); } catch (e) {} },
  setMuted(m) { this.muted = m; if (this.sfx) this.sfx.setVolume('master', m ? 0 : this.vol); },
  setMusic(on) { this.musicOn = on; if (this.sfx) this.sfx.setVolume('music', on ? 0.42 : 0); },
  setVol(v) { this.vol = v; if (this.sfx && !this.muted) this.sfx.setVolume('master', v); },
  updAmb(o) {
    if (!this.ready) return; const L = this.loops, f = 1.2;
    L.a_rain.setVolume(o.rain * 0.55, f); L.a_fire.setVolume(o.fire * 0.4, 0.4); L.a_wind.setVolume(o.wind * 0.18, f);
    L.a_birds.setVolume(o.birds * 0.35, f); L.a_night.setVolume(o.crickets * 0.16, f);
    L.m_day.setVolume(o.musicDay, 2.5); L.m_night.setVolume(o.musicNight, 2.5);
  },
};

// ===================== icons =====================
function isoIcon(cells, size = 64, extra) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  if (!cells.length) { if (extra) extra(g, size); return c; }
  const set = new Set(cells.map(([x, y, z]) => x + ',' + y + ',' + z));
  const P = (x, y, z) => [(x - z), (x + z) * 0.5 - y * 1.1];
  let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
  for (const [x, y, z] of cells) for (const [a, b, d] of [[0, 0, 0], [1, 0, 0], [0, 0, 1], [1, 0, 1], [0, 1, 0], [1, 1, 0], [0, 1, 1], [1, 1, 1]]) { const p = P(x + a, y + b, z + d); mnx = Math.min(mnx, p[0]); mxx = Math.max(mxx, p[0]); mny = Math.min(mny, p[1]); mxy = Math.max(mxy, p[1]); }
  const sc = Math.min((size - 8) / (mxx - mnx), (size - 8) / (mxy - mny));
  const ox = size / 2 - (mnx + mxx) / 2 * sc, oy = size / 2 - (mny + mxy) / 2 * sc;
  const S = (x, y, z) => { const p = P(x, y, z); return [ox + p[0] * sc, oy + p[1] * sc]; };
  const sorted = cells.slice().sort((a, b) => (a[0] + a[2] + a[1] * 0.5) - (b[0] + b[2] + b[1] * 0.5) || a[1] - b[1]);
  const col = (t, k) => { const i = BINFO[t] || { c: [1, 0, 1] }; let [r, gg, b] = t.c ? t.c : i.c; return `rgb(${r * 255 * k | 0},${gg * 255 * k | 0},${b * 255 * k | 0})`; };
  const quad = (pts, fill) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = fill; g.fill(); g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 0.6; g.stroke(); };
  for (const [x, y, z, t] of sorted) {
    const tt = typeof t === 'object' ? t : t;
    const has = (a, b, d) => set.has((x + a) + ',' + (y + b) + ',' + (z + d));
    if (!has(0, 1, 0)) quad([S(x, y + 1, z), S(x + 1, y + 1, z), S(x + 1, y + 1, z + 1), S(x, y + 1, z + 1)], col(tt, 1.08));
    if (!has(0, 0, 1)) quad([S(x, y, z + 1), S(x + 1, y, z + 1), S(x + 1, y + 1, z + 1), S(x, y + 1, z + 1)], col(tt, 0.78));
    if (!has(1, 0, 0)) quad([S(x + 1, y, z), S(x + 1, y, z + 1), S(x + 1, y + 1, z + 1), S(x + 1, y + 1, z)], col(tt, 0.6));
  }
  if (extra) extra(g, size);
  return c;
}
function bldIcon(type) {
  const def = BDEF[type]; let cells = def.tmpl(6).map(([x, y, z, t]) => [x, y + 1, z, t]);
  if (type === 'tower') cells = BDEF.tower.tmpl(H - 14).map(([x, y, z, t]) => [x, y + 1, z, t]);
  if (type === 'farm') { cells = cells.map(c => c[1] === 0 ? c : c); for (let x = 1; x < 4; x++) for (let z = 1; z < 4; z++) cells.push([x, 1, z, (x + z) % 2 ? B.CROP3 : B.CROP2]); }
  for (let x = -1; x <= def.w; x++) for (let z = -1; z <= def.d; z++) if (!cells.some(c => c[0] === x && c[2] === z && c[1] <= 0)) cells.push([x, 0, z, (x < 0 || z < 0 || x >= def.w || z >= def.d) ? B.GRASS : B.GRASS]);
  if (type === 'dock') { cells = cells.filter(c => !(c[1] === 0 && c[0] >= 2)); for (let z = -1; z <= 2; z++) for (let x = 2; x <= 3; x++) cells.push([x, -1, z, B.WATER]); cells.push([2, 0, 0, B.PLANK], [2, 0, 1, B.PLANK], [3, 0, 0, B.PLANK], [3, 0, 1, B.PLANK]); }
  return isoIcon(cells);
}
function powerIcon(p) {
  const S = 64;
  if (p === 'inspect') return isoIcon([], S, g => { g.strokeStyle = '#dfe7f3'; g.lineWidth = 5; g.beginPath(); g.arc(27, 27, 13, 0, 7); g.stroke(); g.lineWidth = 7; g.beginPath(); g.moveTo(37, 37); g.lineTo(52, 52); g.stroke(); g.fillStyle = 'rgba(160,200,255,0.35)'; g.beginPath(); g.arc(27, 27, 11, 0, 7); g.fill(); });
  if (p === 'rain') return isoIcon([[0, 3, 0, B.CLOTH], [1, 3, 0, B.CLOTH], [1, 3, 1, B.CLOTH], [0, 3, 1, B.CLOTH], [1, 4, 0, B.CLOTH], [2, 3, 0, B.CLOTH], [0, 0, 0, { c: [0.3, 0.6, 0.95] }], [2, 1, 1, { c: [0.3, 0.6, 0.95] }], [1, 0, 2, { c: [0.3, 0.6, 0.95] }]].map(c => (c[3] === B.CLOTH ? [c[0], c[1], c[2], { c: [0.72, 0.75, 0.82] }] : c)), S);
  if (p === 'bolt') return isoIcon([], S, g => { g.fillStyle = '#ffe066'; g.strokeStyle = '#8a6a00'; g.lineWidth = 2; g.beginPath(); [[36, 4], [16, 34], [30, 34], [22, 60], [48, 24], [33, 24], [44, 4]].forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.fill(); g.stroke(); });
  if (p === 'bless') return isoIcon([], S, g => { g.fillStyle = '#ffd36b'; for (const [x, y, r] of [[32, 30, 20], [14, 14, 8], [50, 50, 7]]) { g.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, rr = k % 2 ? r * 0.3 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); } });
  if (p === 'raise' || p === 'lower') {
    const cells = [[0, 0, 0, B.DIRT], [1, 0, 0, B.DIRT], [0, 0, 1, B.DIRT], [1, 0, 1, B.DIRT], [0, 1, 0, p === 'raise' ? B.GRASS : B.DIRT], [1, 1, 1, p === 'raise' ? B.GRASS : B.DIRT]];
    if (p === 'raise') cells.push([0, 2, 0, B.GRASS], [1, 1, 0, B.GRASS], [0, 1, 1, B.GRASS]);
    return isoIcon(cells, S, g => { g.fillStyle = p === 'raise' ? '#8ef08e' : '#ff9d7a'; g.strokeStyle = '#111'; g.lineWidth = 2; g.beginPath();
      const up = p === 'raise'; const y0 = up ? 6 : 26, y1 = up ? 26 : 6; [[50, y0], [60, y1 === 26 ? 18 : 14], [54, y1 === 26 ? 18 : 14], [54, y1], [46, y1], [46, y1 === 26 ? 18 : 14], [40, y1 === 26 ? 18 : 14]].forEach((q, i) => i ? g.lineTo(q[0], up ? q[1] : 32 - q[1]) : g.moveTo(q[0], up ? q[1] : 32 - q[1])); g.closePath(); g.fill(); g.stroke(); });
  }
  if (p === 'demolish') return isoIcon([[0, 0, 0, B.PLANK], [1, 0, 0, B.PLANK], [0, 1, 0, B.ROOF], [1, 1, 0, B.ROOF], [0, 0, 1, B.PLANK], [1, 0, 1, B.PLANK]], S, g => { g.strokeStyle = '#ff5050'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(12, 12); g.lineTo(52, 52); g.moveTo(52, 12); g.lineTo(12, 52); g.stroke(); });
}
function resIcon(k) {
  const m = ({ food: [{ c: [0.86, 0.3, 0.22] }], wood: [B.LOG], stone: [B.STONE], ore: [B.ORE], favor: [B.GOLD] }[k] || [B.GOLD])[0];
  if (k === 'pop') return isoIcon([[0, 0, 0, { c: [0.25, 0.22, 0.3] }], [0, 1, 0, { c: [0.3, 0.45, 0.8] }], [0, 2, 0, { c: [0.95, 0.75, 0.6] }]], 32);
  if (k === 'food') return isoIcon([[0, 0, 0, m], [1, 0, 0, { c: [0.95, 0.7, 0.2] }], [0, 0, 1, { c: [0.35, 0.55, 0.85] }], [0, 1, 0, m]], 32);
  return isoIcon([[0, 0, 0, m], [1, 0, 0, m], [0, 0, 1, m], [0, 1, 0, m]], 32);
}

// ===================== UI =====================
const $ = id => document.getElementById(id);
const SVGI = {
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3l5-4v13l-5-4H4z" fill="currentColor" stroke="none"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9.5h3l5-4v13l-5-4H4z" fill="currentColor" stroke="none"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.8"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/></svg>',
  cursor: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3.5l13 7.2-5.6 1.6 3.4 6-2.6 1.4-3.3-6L6 17.6z"/></svg>',
  hammer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6l4 4M12.5 7.5l-8 8a1.4 1.4 0 0 0 2 2l8-8"/><path d="M11 4.5c2-1.5 4.5-1.5 6.5.5l2 2-3 3-1.5-1.5"/></svg>',
  note: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 17.5V6.2a1 1 0 0 1 .78-.98l9-2A1 1 0 0 1 20 4.2v11.3" fill="none" stroke="currentColor" stroke-width="2"/><ellipse cx="6.5" cy="17.5" rx="3" ry="2.4"/><ellipse cx="17.5" cy="15.5" rx="3" ry="2.4"/></svg>',
  center: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/><circle cx="12" cy="12" r="7.5"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 4h11l3 3v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>',
  house: '<svg class="ic" viewBox="0 0 26 26"><path d="M4 12.5L13 5l9 7.5" fill="none" stroke="#d6b266" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 11.5V21h13v-9.5" fill="#3a4a35" stroke="#d6b266" stroke-width="1.6"/><rect x="11" y="15" width="4" height="6" fill="#f2bd55"/></svg>',
  rain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 15a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8a3.5 3.5 0 0 1 0 7z" fill="currentColor" stroke="none" opacity=".85"/><path d="M8 18l-1 2.5M12 18l-1 2.5M16 18l-1 2.5"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2L5 13.5h6L9.5 22 19 9.5h-6z"/></svg>',
  snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/></svg>',
};
function moodFace(m) {
  const c = m >= 55 ? '#a8d06f' : m >= 35 ? '#f2bd55' : '#f26b4c';
  const k = (m - 50) / 50 * 3.2;
  return `<svg class="ic" viewBox="0 0 26 26"><circle cx="13" cy="13" r="10.5" fill="${c}"/><circle cx="9.5" cy="11" r="1.4" fill="#1a1a12"/><circle cx="16.5" cy="11" r="1.4" fill="#1a1a12"/><path d="M8.5 ${16.5 - k * 0.3} Q13 ${16.5 + k} 17.5 ${16.5 - k * 0.3}" fill="none" stroke="#1a1a12" stroke-width="1.8" stroke-linecap="round"/></svg>`;
}
const CATS = [
  { id: 'homes', name: 'Homes', items: ['tent', 'cottage', 'stonehouse'] },
  { id: 'food', name: 'Food', items: ['dock', 'farm'] },
  { id: 'industry', name: 'Industry', items: ['lumber', 'quarry', 'storehouse', 'mine'] },
  { id: 'community', name: 'Community', items: ['well', 'shrine', 'market', 'temple'] },
  { id: 'wonder', name: 'Wonder', items: ['tower'] },
  { id: 'powers', name: 'Powers', items: ['rain', 'bolt', 'bless', 'raise', 'lower'] },
];
const SEASON_COL = ['#9fd36c', '#f0c75a', '#e0823f', '#a9d6f2'];
function arcPath(cx, cy, r, a0, a1) {
  const p = a => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}
const UI = {
  tool: 'inspect', cat: 'homes', brush: 2, sel: null, hover: null, logDirty: true, follow: false, demoPending: null, lastLogTop: null,
  init() {
    this.icons = {};
    for (const t of BUILD_ORDER) this.icons[t] = bldIcon(t);
    for (const p of ['rain', 'bolt', 'bless', 'raise', 'lower']) this.icons[p] = powerIcon(p);
    this.resImg = {}; for (const k of RES) this.resImg[k] = resIcon(k).toDataURL();
    // resource strip
    const names = { food: 'Food', wood: 'Wood', stone: 'Stone', ore: 'Ore', favor: 'Favor' };
    let h = '';
    for (const k of RES) h += `<div class="chip" id="rc-${k}"><img src="${this.resImg[k]}" alt=""><div><div class="v" id="rv-${k}">0</div><div class="n">${names[k]}</div></div>${k !== 'favor' ? `<div class="meter"><i id="rm-${k}"></i></div>` : ''}</div>`;
    h += `<div class="rule"></div><div class="chip" id="rc-pop">${SVGI.house}<div><div class="v" id="rv-pop">0</div><div class="n">People</div></div><div class="meter"><i id="rm-pop"></i></div></div>`;
    h += `<div class="chip" id="rc-mood"><span id="ri-mood"></span><div><div class="v" id="rv-mood">0%</div><div class="n">Mood</div></div></div>`;
    $('hud-res').innerHTML = h;
    $('rc-mood').title = 'Average mood. If it stays below 22% for a whole day, your people leave.';
    $('rc-favor').title = 'Favor: earned by happy villagers and priests, spent on god powers.';
    // controls
    $('btn-pause').innerHTML = SVGI.pause; $('btn-sound').innerHTML = SVGI.sound; $('btn-help').innerHTML = SVGI.help;
    $('btn-pause').onclick = () => this.togglePause();
    $('speed').onclick = e => { const s = e.target.dataset.s; if (s) this.setSpeed(+s); };
    $('btn-sound').onclick = () => this.toggleMute();
    $('btn-music').innerHTML = SVGI.note; $('btn-music').onclick = () => { SND.setMusic(!SND.musicOn); this.syncCtl(); };
    $('volume').oninput = e => SND.setVol(e.target.value / 100);
    $('btn-help').onclick = () => $('help').classList.toggle('on');
    $('btn-save').innerHTML = SVGI.save; $('btn-save').onclick = () => SaveUI.open('game');
    $('btn-center').innerHTML = SVGI.center; $('btn-center').onclick = () => resetCam();
    $('help').onclick = () => $('help').classList.remove('on');
    $('size-minus').onclick = () => this.setBrush(this.brush - 1);
    $('size-plus').onclick = () => this.setBrush(this.brush + 1);
    $('goals').addEventListener('click', e => { if (e.target.id === 'btn-era') advanceEra(); else if (e.target.closest('.gh')) { this.goalsOpen = !this.goalsOpen; $('goals').classList.toggle('closed', !this.goalsOpen); this.layout(); } });
    this.goalsOpen = innerWidth >= 700; $('goals').classList.toggle('closed', !this.goalsOpen);
    addEventListener('resize', () => this.layout());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this.layout());
    $('insp').addEventListener('click', e => this.inspClick(e));
    const side = document.querySelectorAll('.tool2');
    side[0].innerHTML = `${SVGI.cursor}Select<kbd>Esc</kbd>`; side[1].innerHTML = `${SVGI.hammer}Demolish<kbd>X</kbd>`;
    side.forEach(b => b.onclick = () => this.setTool(b.dataset.tool));
    $('tabs').onclick = e => { const c = e.target.closest('button'); if (c) { this.cat = c.dataset.cat; this.buildToolbar(); SND.play('click', { volume: 0.4 }); } };
    $('slots').addEventListener('mouseleave', () => $('tip').classList.remove('on'));
    this.buildToolbar();
  },
  catItems(c) { return CATS.find(x => x.id === (c || this.cat)).items; },
  locked(id) { return BDEF[id] && BDEF[id].era > G.era ? BDEF[id].era : 0; },
  costOf(id) { return BDEF[id] ? BDEF[id].cost : POWERS[id] ? { favor: POWERS[id].favor } : {}; },
  nameOf(id) { return BDEF[id] ? BDEF[id].name : POWERS[id] ? POWERS[id].name : id; },
  buildToolbar() {
    $('tabs').innerHTML = CATS.map(c => `<button data-cat="${c.id}" class="${c.id === this.cat ? 'on' : ''} ${c.items.every(i => this.locked(i)) ? 'dim' : ''}">${c.name}</button>`).join('') + '<span class="hint"><kbd>Tab</kbd> next tab, <kbd>E</kbd> build at cursor</span>';
    const el = $('slots'); el.innerHTML = '';
    this.catItems().forEach((id, i) => {
      const b = document.createElement('button'); const lk = this.locked(id);
      b.className = 'slot' + (lk ? ' locked' : '') + (this.tool === id ? ' on' : ''); b.dataset.tool = id;
      const cv = document.createElement('canvas'); cv.width = cv.height = 64; cv.getContext('2d').drawImage(this.icons[id], 0, 0); b.appendChild(cv);
      const cost = this.costOf(id);
      b.insertAdjacentHTML('beforeend', `<span class="key">${i + 1}</span><span class="nm">${this.nameOf(id)}</span><span class="cost">${Object.entries(cost).map(([k, v]) => `<span data-r="${k}" data-n="${v}"><img src="${this.resImg[k]}" alt="${k}">${v}${id === 'raise' || id === 'lower' ? '/block' : ''}</span>`).join('')}</span>${lk ? `<span class="lock">${ERAS[lk]} era</span>` : ''}`);
      b.onmouseenter = () => this.showTip(id, b); b.onfocus = () => this.showTip(id, b);
      b.onclick = () => { if (lk) { this.toast(`Reach the ${ERAS[lk]} era to unlock the ${this.nameOf(id)}`); SND.play('error'); return; } this.setTool(this.tool === id ? 'inspect' : id); };
      el.appendChild(b);
    });
    document.querySelectorAll('.tool2').forEach(b => b.classList.toggle('on', b.dataset.tool === this.tool));
    $('brush').classList.toggle('on', this.tool === 'raise' || this.tool === 'lower');
    this.refreshCosts();
  },
  refreshCosts() { for (const s of document.querySelectorAll('.slot .cost span')) s.classList.toggle('no', (G.res[s.dataset.r] || 0) < +s.dataset.n); },
  showTip(id, el) {
    const def = BDEF[id], tip = $('tip'); const lk = this.locked(id);
    const tags = [];
    if (def && def.house) tags.push(`Houses ${def.house}`); if (def && def.jobs) tags.push(`${def.jobs} worker${def.jobs > 1 ? 's' : ''}`); if (def && def.hours) tags.push(`${def.hours}h to build`);
    const short = Object.entries(this.costOf(id)).filter(([k, v]) => (G.res[k] || 0) < v).map(([k, v]) => `Need ${Math.ceil(v - G.res[k])} more ${k}`);
    tip.innerHTML = `<h4>${this.nameOf(id)}</h4><p>${def ? def.desc : POWERS[id].desc}</p><div class="tags">${tags.map(t => `<span>${t}</span>`).join('')}${lk ? `<span class="no">Unlocks in the ${ERAS[lk]} era</span>` : short.map(t => `<span class="no">${t}</span>`).join('')}</div>`;
    const r = el.getBoundingClientRect(), tr = $('tray').getBoundingClientRect();
    tip.style.left = clamp(r.left + r.width / 2 - 140, 8, innerWidth - 288) + 'px'; tip.style.top = ''; tip.style.bottom = (innerHeight - tr.top + 10) + 'px';
    tip.classList.add('on');
  },
  setTool(id) {
    this.tool = id; this.demoPending = null;
    if (id !== 'inspect' && id !== 'demolish') { const c = CATS.find(c => c.items.includes(id)); if (c && c.id !== this.cat) this.cat = c.id; }
    this.buildToolbar();
    SND.play('click', { volume: 0.45 });
  },
  setBrush(n) { this.brush = clamp(n, 1, 4); $('size-val').textContent = this.brush; },
  syncCtl() {
    $('btn-pause').innerHTML = G.paused ? SVGI.play : SVGI.pause; $('btn-pause').classList.toggle('on', G.paused); $('btn-pause').title = G.paused ? 'Resume (Space)' : 'Pause (Space)';
    for (const b of document.querySelectorAll('#speed button')) b.classList.toggle('on', +b.dataset.s === G.speed);
    $('btn-sound').innerHTML = SND.muted ? SVGI.mute : SVGI.sound; $('btn-music').classList.toggle('off', !SND.musicOn); $('btn-music').title = SND.musicOn ? 'Turn music off' : 'Turn music on';
  },
  togglePause() { G.paused = !G.paused; this.syncCtl(); },
  setSpeed(s) { G.speed = s; if (G.paused) G.paused = false; this.syncCtl(); },
  cycleSpeed() { this.setSpeed(G.speed === 1 ? 2 : G.speed === 2 ? 4 : 1); },
  toggleMute() { SND.setMuted(!SND.muted); this.syncCtl(); },
  toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('on'), 2400); },
  banner(title, sub) { const b = $('banner'); b.innerHTML = `<h3>${title}</h3><p>${sub}</p>`; b.classList.add('on'); this.layout(); clearTimeout(this._bt); this._bt = setTimeout(() => { b.classList.remove('on'); this.layout(); }, 5000); },
  showEnd() {
    const o = G.over, s = G.stats, day = dayOf();
    const e = $('end'); e.className = 'on ' + (o.win ? 'win' : 'lose');
    e.innerHTML = `<div class="card glass framed"><h2>${o.win ? 'Your people reached the sky' : 'Your civilization has collapsed'}</h2><p>${o.reason}</p>
      <div class="stats"><div><b>${day + 1}</b><span>days</span></div><div><b>${ERAS[G.era]}</b><span>era</span></div><div><b>${s.peak}</b><span>peak population</span></div><div><b>${s.built}</b><span>buildings</span></div><div><b>${s.deaths}</b><span>lost</span></div></div>
      <div class="btns">${o.win ? '<button id="btn-watch">Keep watching</button>' : ''}${!o.win && Saves.latest() ? '<button id="btn-load">Load a save</button>' : ''}<button id="btn-again" class="primary">Start a new valley</button></div></div>`;
    $('btn-again').onclick = () => { e.className = ''; startGame((Math.random() * 1e6) | 0); };
    if ($('btn-watch')) $('btn-watch').onclick = () => { e.className = ''; };
    if ($('btn-load')) $('btn-load').onclick = () => { e.className = ''; SaveUI.open('game'); };
  },
  drawDial() {
    const h = hourOf(), dd = dayOf(), yf = ((dd % 12) + h / 24) / 12, se = seasonOf();
    const cx = 34, cy = 34; let s = '';
    for (let i = 0; i < 4; i++) { const a0 = -Math.PI / 2 + i * Math.PI / 2 + 0.07, a1 = a0 + Math.PI / 2 - 0.14; s += `<path d="${arcPath(cx, cy, 30.5, a0, a1)}" stroke="${SEASON_COL[i]}" stroke-width="4" fill="none" stroke-linecap="round" opacity="${i === se ? 1 : 0.28}"/>`; }
    const ya = -Math.PI / 2 + yf * Math.PI * 2;
    s += `<circle cx="${cx + 30.5 * Math.cos(ya)}" cy="${cy + 30.5 * Math.sin(ya)}" r="3.4" fill="#f3d999" stroke="#1a1a12" stroke-width="1.2"/>`;
    const day = smooth(-0.12, 0.22, Math.sin((h - 6) / 12 * Math.PI));
    const sky = `rgb(${lerp(22, 140, day) | 0},${lerp(30, 196, day) | 0},${lerp(58, 236, day) | 0})`;
    const th = (h - 12) / 24 * Math.PI * 2, sx = cx + 14 * Math.sin(th), sy = cy - 14 * Math.cos(th), mx = cx - 14 * Math.sin(th), my = cy + 14 * Math.cos(th);
    s += `<defs><clipPath id="dc"><circle cx="${cx}" cy="${cy}" r="22"/></clipPath><radialGradient id="sg"><stop offset="0" stop-color="#fff3c4"/><stop offset=".55" stop-color="#ffd76a"/><stop offset="1" stop-color="#ffd76a" stop-opacity="0"/></radialGradient></defs>`;
    s += `<circle cx="${cx}" cy="${cy}" r="24.5" fill="#0d120f" stroke="#d6b266" stroke-width="1.4"/>`;
    s += `<g clip-path="url(#dc)"><rect x="0" y="0" width="68" height="68" fill="${sky}"/>`;
    if (day < 0.6) for (const [a, b] of [[24, 22], [40, 18], [31, 27], [45, 28], [20, 30]]) s += `<circle cx="${a}" cy="${b}" r=".7" fill="#fff" opacity="${(1 - day) * 0.8}"/>`;
    s += `<circle cx="${sx}" cy="${sy}" r="8" fill="url(#sg)"/><circle cx="${sx}" cy="${sy}" r="3.8" fill="#ffe08a"/>`;
    s += `<circle cx="${mx}" cy="${my}" r="3.2" fill="#e3e9f6"/><circle cx="${mx + 1.4}" cy="${my - 0.8}" r="2.6" fill="${sky}"/>`;
    s += `<rect x="0" y="${cy}" width="68" height="34" fill="${se === 3 ? '#cfd9e3' : '#26361f'}"/><path d="M12 ${cy} H56" stroke="#d6b266" stroke-width=".8" opacity=".7"/></g>`;
    $('dial').innerHTML = s;
    $('date').textContent = `${SEASONS[se]}, year ${Math.floor(dd / 12) + 1}`;
    const left = 2 - dd % 3, nextS = SEASONS[(se + 1) % 4].toLowerCase();
    $('clock').textContent = `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.floor((h % 1) * 6) * 10).padStart(2, '0')}, ${left ? `${left + 1} days until ${nextS}` : `${nextS} tomorrow`}`;
    $('clock').title = 'Each season lasts 3 days. A year is 12 days.';
    const w = $('weather'); let wh = '', bad = false;
    if (G.rain) { wh = SVGI.rain + (G.rain.heavy ? 'Heavy storm' : 'Raining'); bad = G.rain.heavy; }
    else if (G.storm) { wh = SVGI.bolt + 'Thunderstorm'; bad = true; }
    else if (G.frozen) wh = SVGI.snow + 'Lake frozen';
    if (w.dataset.h !== wh) { w.innerHTML = wh.replace(/<svg /g, '<svg width="14" height="14" '); w.dataset.h = wh; }
    w.classList.toggle('on', !!wh); w.classList.toggle('bad', bad);
  },
  update() {
    const r = G.res, pop = G.vill.length, cap = housingCap(), avg = avgMood();
    for (const k of RES) {
      $('rv-' + k).textContent = Math.floor(r[k]);
      if (k !== 'favor') { const c = storeCap(k), full = r[k] >= c; $('rm-' + k).style.width = Math.min(100, r[k] / c * 100) + '%'; $('rc-' + k).classList.toggle('full', full);
        $('rc-' + k).title = `${Math.floor(r[k])} of ${c} storage${full ? '. Full: build a Storehouse to hold more.' : ''}`; }
    }
    $('rc-food').classList.toggle('low', r.food < pop * 2);
    $('rv-pop').textContent = `${pop}/${cap}`; $('rm-pop').style.width = Math.min(100, pop / Math.max(1, cap) * 100) + '%';
    $('rc-pop').classList.toggle('low', pop > cap); $('rc-pop').title = pop > cap ? `${pop - cap} villager${pop - cap > 1 ? 's have' : ' has'} no home` : `${cap - pop} free bed${cap - pop === 1 ? '' : 's'}`;
    const mi = Math.round(avg / 5); if ($('ri-mood').dataset.m != mi) { $('ri-mood').innerHTML = moodFace(avg); $('ri-mood').dataset.m = mi; }
    $('rv-mood').textContent = Math.round(avg) + '%'; $('rc-mood').classList.toggle('low', avg < 35);
    this.drawDial(); this.refreshCosts();
    // goals
    const st = eraStatus(); let head = '', body = '';
    const chev = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
    if (st) {
      const done = st.items.filter(i => i.ok).length;
      head = `<h2>Next era: ${st.to}</h2><span class="sum">${done}/${st.items.length}</span>`;
      body += `<div class="sub">Meet every goal, then advance</div>`;
      for (const it of st.items) body += `<div class="req ${it.ok ? 'ok' : ''}"><span class="tick"></span><span>${it.label}</span><span class="cnt">${Math.min(it.cur, it.need)}/${it.need}</span><span class="bar"><i style="width:${Math.min(100, it.cur / it.need * 100)}%"></i></span></div>`;
    } else {
      const tw = G.blds.find(b => b.type === 'tower'); const p = tw ? Math.min(100, tw.progress / BDEF.tower.hours * 100) : 0;
      head = `<h2>Raise the Great Tower</h2><span class="sum">${Math.floor(p)}%</span>`;
      body += `<div class="sub">${tw ? (tw.done ? 'Complete' : 'Under construction') : 'Build it from the Wonder tab to win'}</div><div class="bigbar"><i style="width:${p}%"></i></div>`;
      if (!tw) body += Object.entries(BDEF.tower.cost).map(([k, v]) => `<div class="req ${G.res[k] >= v ? 'ok' : ''}"><span class="tick"></span><span>${v} ${k}</span><span class="cnt">${Math.min(v, Math.floor(G.res[k]))}/${v}</span></div>`).join('');
      else body += `<div class="req"><span></span><span>${tw.workers.length} builder${tw.workers.length === 1 ? '' : 's'} at work</span><span></span></div>`;
    }
    let gh = `<button class="gh" aria-expanded="${this.goalsOpen}">${head}${chev}</button><div class="gbody">${body}</div>`;
    if (st && st.ready) gh += `<button id="btn-era">Advance to the ${st.to} era</button>`;
    if (G.lowMoodH > 0) gh += `<div class="despair"><b>Your people are in despair.</b> They leave in ${24 - G.lowMoodH} hours unless mood rises above 22%.</div>`;
    if ($('goals').dataset.h !== gh) { $('goals').innerHTML = gh; $('goals').dataset.h = gh; }
    // chronicle
    if (this.logDirty) {
      this.logDirty = false; const top = G.log[0];
      const items = G.log.slice(0, 5).reverse();
      $('log').innerHTML = items.map((l, i) => `<div class="e ${l.kind} ${l === top && top !== this.lastLogTop ? 'new' : ''}" style="opacity:${0.4 + 0.6 * (i + 1) / items.length}">${l.msg}</div>`).join('');
      this.lastLogTop = top;
    }
    this.updInsp();
    this.layout();
  },
  layout() {
    const vw = innerWidth, vh = innerHeight, narrow = vw < 760, M = narrow ? 8 : 16, GAP = narrow ? 8 : 12;
    document.body.classList.toggle('narrow', narrow); document.body.classList.toggle('short', vh < 760);
    const R = el => el.getBoundingClientRect();
    const dial = $('hud-dial'), res = $('hud-res'), ctl = $('hud-ctl'), goals = $('goals'), log = $('log'), insp = $('insp'), tray = $('tray');
    for (const [el, k, v] of [[dial, 'left', M], [dial, 'top', M], [ctl, 'right', M], [ctl, 'top', M]]) el.style[k] = v + 'px';
    tray.style.bottom = M + 'px'; tray.style.maxWidth = (vw - 2 * M) + 'px';
    const d = R(dial), c = R(ctl);
    res.classList.remove('compact', 'tiny'); let rw = R(res).width;
    const room = c.left - d.right - 2 * GAP; let wrapped = false;
    if (rw > room) { res.classList.add('compact'); rw = R(res).width; if (rw > room) wrapped = true; }
    if (wrapped && rw > vw - 2 * M) { res.classList.add('tiny'); rw = R(res).width; }
    let rTop = M, rLeft = clamp((vw - rw) / 2, d.right + GAP, c.left - GAP - rw);
    if (wrapped) { // tuck it under the controls, right-aligned; only drop below the dial if it can't fit beside it
      rTop = c.bottom + GAP; rLeft = vw - M - rw;
      if (rLeft < d.right + GAP && rTop < d.bottom) { rTop = Math.max(d.bottom, c.bottom) + GAP; rLeft = Math.max(M, (vw - rw) / 2); }
    }
    res.style.left = rLeft + 'px'; res.style.top = rTop + 'px';
    const rr = { left: rLeft, right: rLeft + rw, bottom: rTop + R(res).height };
    const topBand = Math.max(d.bottom, c.bottom, rr.bottom);
    const t = R(tray);
    const overlapX = (l, r) => t.left < r + GAP && t.right > l - GAP;
    // left column: goals then log
    const gw = Math.min(252, vw - 2 * M); goals.style.width = gw + 'px'; goals.style.left = M + 'px';
    const gTop = (wrapped && rr.left < M + gw + GAP ? rr.bottom : d.bottom) + GAP;
    goals.style.top = gTop + 'px';
    const gLimit = (overlapX(M, M + gw) ? t.top : vh - M) - GAP;
    goals.style.maxHeight = Math.max(60, gLimit - gTop) + 'px';
    const g = R(goals);
    const lw = Math.min(320, vw - 2 * M); log.style.width = lw + 'px'; log.style.left = M + 'px';
    const lBottom = overlapX(M, M + lw) ? vh - t.top + GAP : M;
    const lTop = g.bottom + GAP, lMax = vh - lBottom - lTop;
    log.style.bottom = lBottom + 'px'; log.style.maxHeight = Math.max(0, lMax) + 'px'; log.style.display = lMax < 44 ? 'none' : '';
    { const kids = Array.from(log.children); kids.forEach(k => k.style.display = ''); let used = 0;
      for (let i = kids.length - 1; i >= 0; i--) { used += kids[i].offsetHeight + (i < kids.length - 1 ? 4 : 0); if (used > lMax) kids[i].style.display = 'none'; } }
    // inspector on the right
    const iw = Math.min(270, vw - 2 * M); insp.style.width = iw + 'px'; insp.style.right = M + 'px';
    let iTop = (wrapped && rr.right > vw - M - iw - GAP ? rr.bottom : c.bottom) + GAP;
    if (vw < gw + iw + 2 * M + GAP) iTop = Math.max(iTop, g.bottom + GAP);
    insp.style.top = iTop + 'px';
    insp.style.maxHeight = Math.max(120, (overlapX(vw - M - iw, vw - M) ? t.top : vh - M) - GAP - iTop) + 'px';
    // inspector wins over the log on small screens
    const ib = insp.classList.contains('on') ? R(insp) : null;
    if (ib && ib.left < M + lw + GAP && log.style.display !== 'none') { const lb = R(log); if (lb.bottom > ib.top && lb.top < ib.bottom) log.style.display = 'none'; }
    // toast: centred just above the tray (or above the log if the log sits there)
    const toast = $('toast'); let tb = vh - t.top + GAP;
    const lb2 = log.style.display === 'none' ? null : R(log);
    if (lb2 && lb2.height > 4 && (vw - toast.offsetWidth) / 2 < lb2.right + GAP) tb = vh - lb2.top + GAP;
    toast.style.top = 'auto'; toast.style.bottom = tb + 'px';
    // banner: in the clear space between the side panels
    const banner = $('banner');
    const gl = g.width > 0 ? g.right + GAP : M, gr = ib ? ib.left - GAP : vw - M;
    let bl = gl, br = gr, bTop = Math.max(vh * 0.2, topBand + 40);
    const bannerOn = banner.classList.contains('on');
    insp.style.visibility = narrow && bannerOn ? 'hidden' : '';
    if (br - bl < 320) { bl = M; br = vw - M; bTop = Math.max(topBand, g.bottom) + GAP; }
    const bh = banner.querySelector('h3'); if (bh) bh.style.fontSize = clamp((br - bl) / 9.5, 24, 56) + 'px';
    banner.style.left = ((bl + br) / 2) + 'px'; banner.style.width = Math.min(720, br - bl) + 'px'; banner.style.top = bTop + 'px';
  },
  portrait(v) {
    const sc = JOB_COL[v.slot ? v.slot.kind : 'none'] || JOB_COL.none, sk = [lerp(0.95, 0.55, v.skin), lerp(0.78, 0.4, v.skin), lerp(0.62, 0.28, v.skin)];
    return isoIcon([[0, 0, 0, { c: [0.22, 0.2, 0.26] }], [0, 1, 0, { c: sc }], [0, 2, 0, { c: sk }]], 64);
  },
  updInsp() {
    const s = this.sel, el = $('insp'); let h = '', key = '';
    const meter = (p, c) => `<span class="m"><i style="width:${clamp(p, 0, 100)}%;background:${c}"></i></span>`;
    if (s && s.v && G.vill.includes(s.v)) {
      const v = s.v; const job = v.slot ? (JOB_NAME[v.slot.kind] || 'Worker') : 'Forager';
      const mood = Math.round(v.mood), mc = mood >= 55 ? 'var(--moss)' : mood >= 30 ? 'var(--amber)' : 'var(--ember)';
      key = 'v' + v.id + job;
      h = `<div class="ih"><span class="pslot"></span><div><h3>${v.name}</h3><div class="role">${job}${v.slot ? ' at the ' + BDEF[v.slot.b.type].name : ''}</div></div></div>
        <div class="stat"><span>Now</span><b>${v.act}</b></div>
        <div class="stat"><span>Mood</span><b>${mood}%</b>${meter(mood, mc)}</div>
        <div class="stat"><span>Health</span><b>${Math.round(v.health)}%</b>${meter(v.health, 'var(--sky)')}</div>
        <div class="stat"><span>Meals</span><b class="${v.missed ? 'warnline' : ''}">${v.missed ? v.missed + ' missed' : 'Fed'}</b></div>
        <div class="stat"><span>Home</span><b class="${v.home ? '' : 'warnline'}">${v.home ? BDEF[v.home.type].name : 'Homeless'}</b></div>
        ${v.carry ? `<div class="stat"><span>Carrying</span><b>${v.carry.n} ${v.carry.type}</b></div>` : ''}
        <div class="acts"><button data-a="follow" class="${this.follow ? 'on' : ''}">${this.follow ? 'Stop following' : 'Follow'}</button></div>`;
    } else if (s && s.b && G.blds.includes(s.b)) {
      const b = s.b, def = BDEF[b.type]; key = 'b' + b.id;
      h = `<div class="ih"><span class="pslot"></span><div><h3>${def.name}</h3><div class="role">${!b.done ? 'Under construction' : def.house ? 'Home' : def.jobs ? 'Workplace' : 'Building'}</div></div></div>`;
      if (!b.done) { const p = Math.min(100, b.progress / def.hours * 100); h += `<div class="stat"><span>Built</span><b>${Math.floor(p)}%</b>${meter(p, 'var(--brass)')}</div><div class="stat"><span>Builders</span><b>${b.workers.length}</b></div>`; }
      else {
        h += `<div class="idesc">${def.desc}</div>`;
        if (def.house) h += `<div class="stat"><span>Residents</span><b>${b.residents.length} of ${def.house}</b><span class="names">${b.residents.map(v => v.name).join(', ') || 'Nobody yet'}</span></div>`;
        if (def.jobs) h += `<div class="stat"><span>Workers</span><b>${b.workers.length} of ${def.jobs}</b><span class="names">${b.workers.map(v => v.name).join(', ') || (b.paused ? 'Work is paused' : 'Waiting for free villagers')}</span></div>`;
        if (b.crops) { const arr = Array.from(b.crops), ripe = arr.filter(c => c >= 3).length, g = arr.reduce((a, c) => a + c, 0) / 21 / 3 * 100; h += `<div class="stat"><span>Crops</span><b>${seasonOf() === 3 ? 'Dormant' : Math.round(g) + '% grown'}</b>${meter(g, 'var(--moss)')}</div><div class="stat"><span>Ready to harvest</span><b>${ripe}</b></div>`; }
        if (b.health < 1) h += `<div class="stat"><span>Condition</span><b class="warnline">${Math.round(b.health * 100)}%</b>${meter(b.health * 100, 'var(--ember)')}</div>`;
        if (b.flooded) h += `<div class="stat"><span class="warnline">Flooding</span><b class="warnline">Drain it with Lower Land</b></div>`;
      }
      if (b.type !== 'campfire') h += `<div class="acts">${(def.jobs || !b.done) ? `<button data-a="pause">${b.paused ? 'Resume work' : 'Pause work'}</button>` : ''}<button data-a="demolish" class="danger ${this.demoPending === b ? 'arm' : ''}">${this.demoPending === b ? 'Click to confirm' : 'Demolish'}</button></div>`;
    } else this.sel = null;
    if (h) h = `<button class="iclose" data-a="close" aria-label="Close">${SVGI.close}</button>` + h;
    el.classList.toggle('on', !!h);
    if (el.dataset.h !== h) {
      el.innerHTML = h; el.dataset.h = h;
      const ps = el.querySelector('.pslot');
      if (ps) { const c = s.v ? this.portrait(s.v) : (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const ic = this.icons[s.b.type]; if (ic) cv.getContext('2d').drawImage(ic, 0, 0); else cv.getContext('2d').drawImage(isoIcon(BDEF[s.b.type].tmpl(1).map(([x, y, z, t]) => [x, y, z, t])), 0, 0); return cv; })(); ps.replaceWith(c); }
    }
  },
  inspClick(e) {
    const btn = e.target.closest('button'); const a = btn && btn.dataset.a; if (!a || !this.sel) return;
    if (a === 'close') { this.sel = null; this.follow = false; }
    if (a === 'follow') this.follow = !this.follow;
    if (a === 'pause' && this.sel.b) { this.sel.b.paused = !this.sel.b.paused; assignJobs(); }
    if (a === 'demolish' && this.sel.b) { if (this.demoPending === this.sel.b) { demolish(this.sel.b); this.sel = null; this.demoPending = null; SND.play('place'); } else this.demoPending = this.sel.b; }
    SND.play('click', { volume: 0.45 }); this.updInsp();
  },
};

// ===================== input =====================
const canvas = document.getElementById('view');
const inp = { drag: null, mx: -1, my: -1, eHeld: false, paintT: 0, moved: 0 };
function pickAt(px, py) {
  if (px < 0) return { hit: null, v: null };
  const r = cam.ray(px, py, canvas.clientWidth, canvas.clientHeight);
  const hit = raycast(r.o, r.d, true);
  let hv = null, best = 1e9;
  for (const v of G.vill) {
    if (v.inside || v.hidden) continue;
    const p = [v.x - r.o[0], v.y + 0.45 - r.o[1], v.z - r.o[2]]; const t = p[0] * r.d[0] + p[1] * r.d[1] + p[2] * r.d[2];
    if (t < 0) continue; const dd = Math.hypot(p[0] - r.d[0] * t, p[1] - r.d[1] * t, p[2] - r.d[2] * t);
    if (dd < 0.75 && t < best) { best = t; hv = v; }
  }
  if (hv && hit) { const ht = Math.hypot(hit.x + .5 - r.o[0], hit.y + .5 - r.o[1], hit.z + .5 - r.o[2]); if (ht < best - 1.5) hv = null; }
  return { hit, v: hv };
}
function ghostOrigin(type, hit) { const d = BDEF[type]; return [hit.x - Math.floor((d.w - 1) / 2), hit.z - Math.floor((d.d - 1) / 2)]; }
function selectAt() {
  const { hit, v } = pickAt(inp.mx, inp.my);
  if (v) { UI.sel = { v }; UI.follow = false; SND.play('click', { volume: 0.5 }); }
  else if (hit && buildingAt(hit.x, hit.z)) { UI.sel = { b: buildingAt(hit.x, hit.z) }; UI.follow = false; SND.play('click', { volume: 0.5 }); }
  else UI.sel = null;
  UI.demoPending = null; UI.updInsp();
}
function useTool(first) {
  if (!G || G.over) return;
  const t = UI.tool;
  if (t === 'inspect') { if (first) selectAt(); return; }
  const { hit } = pickAt(inp.mx, inp.my);
  if (!hit) return;
  if (t === 'demolish') {
    if (!first) return;
    const b = buildingAt(hit.x, hit.z); if (!b || b.type === 'campfire') { UI.toast('Point at a building, then press E to demolish it'); return; }
    if (UI.demoPending === b) { demolish(b); UI.demoPending = null; SND.play('place'); } else { UI.demoPending = b; UI.toast(`Press E again to demolish the ${BDEF[b.type].name}`); }
    return;
  }
  if (BDEF[t]) {
    if (!first) return;
    const def = BDEF[t];
    if (def.era > G.era) return;
    if (t === 'tower' && G.blds.some(b => b.type === 'tower')) { UI.toast('You can only build one Great Tower'); SND.play('error'); return; }
    const [x0, z0] = ghostOrigin(t, hit);
    const info = footprintInfo(t, x0, z0);
    if (info.bad) { UI.toast(info.bad); SND.play('error'); return; }
    if (!canAfford(def.cost)) { UI.toast('Not enough ' + Object.keys(def.cost).filter(k => G.res[k] < def.cost[k]).join(' or ')); SND.play('error'); return; }
    placeBuilding(t, x0, z0); SND.play('place');
    return;
  }
  if (POWERS[t]) {
    if ((t === 'raise' || t === 'lower') && G.res.favor < 1) { if (first) { UI.toast('Not enough Favor'); SND.play('error'); } return; }
    if (!first && !(t === 'raise' || t === 'lower')) return;
    usePower(t, hit, UI.brush);
  }
}
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('pointerdown', e => {
  canvas.setPointerCapture(e.pointerId);
  inp.mx = e.offsetX; inp.my = e.offsetY; inp.lx = e.clientX; inp.ly = e.clientY; inp.moved = 0;
  inp.drag = e.button === 0 ? 'orbit' : 'pan'; inp.touch = e.pointerType === 'touch';
  if (e.button === 1) e.preventDefault();
});
canvas.addEventListener('pointermove', e => {
  inp.mx = e.offsetX; inp.my = e.offsetY;
  if (!inp.drag) return;
  const dx = e.clientX - inp.lx, dy = e.clientY - inp.ly; inp.lx = e.clientX; inp.ly = e.clientY;
  inp.moved += Math.abs(dx) + Math.abs(dy);
  if (inp.moved < 4) return;
  if (inp.drag === 'orbit') { cam.yaw -= dx * 0.006; cam.pitch += dy * 0.005; cam.auto = false; canvas.style.cursor = 'grabbing'; }
  else {
    const s = cam.dist * 0.0016; const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    cam.target[0] = clamp(cam.target[0] - (dx * cy - dy * sy) * s, 0, W); cam.target[2] = clamp(cam.target[2] - (-dx * sy - dy * cy) * s, 0, D); UI.follow = false;
  }
});
canvas.addEventListener('pointerup', () => {
  if (inp.drag === 'orbit' && inp.moved < 5) { if (inp.touch && UI.tool !== 'inspect') useTool(true); else selectAt(); }
  inp.drag = null; canvas.style.cursor = '';
});
canvas.addEventListener('pointerleave', () => { if (!inp.drag) inp.mx = -1; });
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  if (e.ctrlKey) { UI.setBrush(UI.brush + (e.deltaY < 0 ? 1 : -1)); return; }
  cam.dist *= Math.exp(e.deltaY * 0.0012);
}, { passive: false });
addEventListener('keyup', e => { if (e.key.toLowerCase() === 'e') inp.eHeld = false; });
addEventListener('blur', () => { inp.eHeld = false; });
addEventListener('keydown', e => {
  if (!started || e.target.tagName === 'INPUT') return;
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && k === 's') { e.preventDefault(); SaveUI.open('game'); return; }
  if ($('saves').classList.contains('on')) { if (k === 'escape') SaveUI.close(); return; }
  if (e.code.startsWith('Digit')) { const n = +e.code.slice(5); const id = UI.catItems()[n - 1]; if (id) { const b = document.querySelector(`.slot[data-tool="${id}"]`); b && b.click(); } return; }
  if (k === 'tab') { e.preventDefault(); const i = CATS.findIndex(c => c.id === UI.cat); UI.cat = CATS[(i + (e.shiftKey ? CATS.length - 1 : 1)) % CATS.length].id; UI.buildToolbar(); return; }
  if (k === 'e') { if (!e.repeat) { inp.eHeld = true; inp.paintT = 0; useTool(true); } return; }
  if (k === ' ') { e.preventDefault(); UI.togglePause(); }
  else if (k === 't') UI.cycleSpeed();
  else if (k === 'x') UI.setTool('demolish');
  else if (k === 'r') resetCam();
  else if (k === 'c') cam.auto = !cam.auto;
  else if (k === 'm') UI.toggleMute();
  else if (k === 'h') document.body.classList.toggle('hide-ui');
  else if (k === 'f' && UI.sel && UI.sel.v) UI.follow = !UI.follow;
  else if (k === '[') UI.setBrush(UI.brush - 1);
  else if (k === ']') UI.setBrush(UI.brush + 1);
  else if (k === 'escape') { UI.setTool('inspect'); UI.sel = null; $('help').classList.remove('on'); }
  else if (k === '?' || k === '/') $('help').classList.toggle('on');
});

// ===================== environment & dynamic render =====================
function environment() {
  const h = hourOf(), a = (h - 6) / 12 * Math.PI, el = Math.sin(a);
  const day = smooth(-0.12, 0.22, el);
  let sd = [Math.cos(a) * 0.72, Math.max(0.12, el), 0.5];
  if (day < 0.5) sd = [0.35, 0.85, -0.45];
  let l = Math.hypot(...sd); sd = sd.map(v => v / l);
  const warm = smooth(0.0, 0.45, el);
  const dusk = [0.95, 0.55, 0.32], noon = [0.82, 0.78, 0.7], moon = [0.13, 0.16, 0.28];
  let sun = day > 0.5 ? dusk.map((c, i) => lerp(c, noon[i], warm)) : moon;
  if (day > 0.3 && day < 0.7) { const k = (day - 0.3) / 0.4; sun = moon.map((c, i) => lerp(c, (dusk[i] * 0.6), k)); }
  const over = (G.rain ? (G.rain.heavy ? 0.6 : 0.4) : 0) + (G.storm ? 0.3 : 0);
  sun = sun.map(c => c * (1 - over * 0.7));
  const sky = [lerp(0.1, 0.33, day), lerp(0.12, 0.36, day), lerp(0.22, 0.42, day)].map(c => c * (1 - over * 0.25) + over * 0.04);
  const ground = [lerp(0.05, 0.2, day), lerp(0.05, 0.18, day), lerp(0.08, 0.15, day)];
  const dd = dayOf(), seasonT = (dd % 12) / 3 + (h / 24) / 3;
  const snow = G.frozen ? smooth(9, 9.4, seasonT) : (seasonOf() === 0 && dd >= 12 ? 1 - smooth(0, 0.35, seasonT) : 0);
  const autumn = seasonOf() === 2 ? smooth(6, 6.6, seasonT) : seasonOf() === 3 ? 1 - smooth(9, 9.3, seasonT) : 0;
  return { sunDir: sd, sunCol: sun, sky, ground, night: 1 - day, snow, autumn, time: performance.now() / 1000, flash: G.flash, day, over };
}
let bgKey = '';
function setBackground(env) {
  const d = env.day, o = env.over;
  const mix = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));
  let c1 = mix([26, 30, 46], [198, 190, 200], d), c2 = mix([8, 9, 15], [128, 116, 132], d);
  c1 = mix(c1, [110, 114, 124], o * 0.6 * d); c2 = mix(c2, [70, 72, 80], o * 0.6 * d);
  if (G.flash > 0.05) { c1 = mix(c1, [230, 235, 255], G.flash * 0.6); }
  const key = c1 + '|' + c2;
  if (key !== bgKey) { bgKey = key; document.body.style.background = `radial-gradient(ellipse at 50% 40%, rgb(${c1}) 0%, rgb(${c2}) 85%)`; }
}
const dyn = new Buf(1 << 17), dynT = new Buf(1 << 16);
const rainDrops = [];
function drawVillager(v, sel) {
  const s = 0.82, bob = v.walking ? Math.abs(Math.sin(v.anim * 2.2)) * 0.07 : 0;
  const x = v.x, z = v.z, y = v.y + bob;
  const job = v.slot ? v.slot.kind : 'none'; const sc = JOB_COL[job] || JOB_COL.none;
  const skin = [lerp(0.95, 0.55, v.skin), lerp(0.78, 0.4, v.skin), lerp(0.62, 0.28, v.skin)];
  if (v.sleepOut) { dyn.box(x - 0.18, v.y, z - 0.42, x + 0.18, v.y + 0.22, z + 0.3, sc[0], sc[1], sc[2]); dyn.box(x - 0.13, v.y, z + 0.3, x + 0.13, v.y + 0.24, z + 0.55, skin[0], skin[1], skin[2]); return; }
  const w = 0.17 * s, leg = 0.28 * s, body = 0.34 * s, hd = 0.14 * s;
  const sw = v.walking ? Math.sin(v.anim * 2.2) * 0.06 : 0;
  dyn.box(x - w, y, z - w + sw, x - 0.01, y + leg, z + w * 0.6 + sw, 0.22, 0.2, 0.26);
  dyn.box(x + 0.01, y, z - w - sw, x + w, y + leg, z + w * 0.6 - sw, 0.22, 0.2, 0.26);
  dyn.box(x - w * 1.15, y + leg, z - w, x + w * 1.15, y + leg + body, z + w, sc[0], sc[1], sc[2]);
  dyn.box(x - hd, y + leg + body, z - hd, x + hd, y + leg + body + hd * 2, z + hd, skin[0], skin[1], skin[2]);
  const hc = [[0.2, 0.13, 0.08], [0.55, 0.35, 0.15], [0.85, 0.7, 0.35], [0.12, 0.1, 0.1]][(v.id * 7) % 4];
  dyn.box(x - hd * 1.05, y + leg + body + hd * 1.5, z - hd * 1.05, x + hd * 1.05, y + leg + body + hd * 2.15, z + hd * 1.05, hc[0], hc[1], hc[2]);
  const top = y + leg + body + hd * 2.2;
  if (v.working) { const k = Math.sin(v.anim * 5) * 0.18; dyn.box(x + w * 1.2, y + leg + body * 0.6 + k, z - 0.04, x + w * 1.2 + 0.08, y + leg + body * 0.6 + k + 0.3, z + 0.04, 0.45, 0.32, 0.2); }
  if (v.carry) { const c = RES_COL[v.carry.type]; dyn.box(x - 0.13, top + 0.02, z - 0.13, x + 0.13, top + 0.26, z + 0.13, c[0], c[1], c[2]); }
  if (sel) { const yy = top + 0.5 + Math.sin(performance.now() / 300) * 0.08; dyn.box(x - 0.12, yy, z - 0.12, x + 0.12, yy + 0.24, z + 0.12, 1, 0.85, 0.3, 2); }
  if (v.missed >= 2 || v.mood < 25) { const yy = top + 0.35; dyn.box(x - 0.04, yy + 0.12, z - 0.04, x + 0.04, yy + 0.4, z + 0.04, 1, 0.25, 0.2, 2); dyn.box(x - 0.04, yy, z - 0.04, x + 0.04, yy + 0.08, z + 0.04, 1, 0.25, 0.2, 2); }
}
function buildDynamic(env, rdt, realDt) {
  dyn.reset(); dynT.reset();
  for (const v of G.vill) if (!v.inside && !v.hidden) drawVillager(v, UI.sel && UI.sel.v === v);
  // particles
  const ps = G.particles;
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i]; p.life -= rdt; if (p.life <= 0) { ps[i] = ps[ps.length - 1]; ps.pop(); continue; }
    p.vy -= p.g * rdt; p.x += p.vx * rdt; p.y += p.vy * rdt; p.z += p.vz * rdt;
    const s = p.s * (p.smoke ? 1 + (2 - p.life) * 0.6 : 1) * (p.sparkle ? 1 : Math.min(1, p.life * 2 + 0.2));
    const target = (p.smoke || p.tr) ? dynT : dyn;
    target.box(p.x - s, p.y - s, p.z - s, p.x + s, p.y + s, p.z + s, p.c[0], p.c[1], p.c[2], p.em || (p.sparkle ? 2 : 0));
  }
  if (ps.length > 1500) ps.splice(0, ps.length - 1500);
  // chimney smoke
  if (Math.random() < rdt * 4) for (const b of G.blds) if (b.done && (b.type === 'cottage' || b.type === 'stonehouse') && b.residents.length && Math.random() < 0.35) {
    const [cx, cy, cz] = b.type === 'cottage' ? [b.x + 3.5, b.base + 5.1, b.z + 0.5] : [b.x + 0.5, b.base + 6.1, b.z + 0.5];
    if (world.get(Math.floor(cx), Math.floor(cy) - 1, Math.floor(cz)) === B.BRICK) G.particles.push({ x: cx, y: cy, z: cz, vx: 0.25, vy: 0.7, vz: 0.05, life: 2.5, c: [0.75, 0.75, 0.78], s: 0.16, g: -0.05, smoke: 1 });
  }
  // campfire flames
  const cf = G.blds[0]; if (cf && Math.random() < rdt * 12) G.particles.push({ x: cf.x + 1.5 + (Math.random() - .5) * .4, y: cf.base + 1.0, z: cf.z + 1.5 + (Math.random() - .5) * .4, vx: 0, vy: 1.2, vz: 0, life: 0.5, c: [1, 0.6, 0.15], s: 0.1, g: -1, em: 2 });
  // rain & snow
  const raining = !!G.rain, sp = G.paused ? 0 : 1;
  const want = (raining ? (G.rain.heavy ? 700 : 380) : 0) + G.clouds.length * 120;
  const snowing = G.frozen && env.snow > 0.5;
  while (rainDrops.length < (snowing ? 260 : want)) {
    let x, z; const c = G.clouds.length && (!raining || Math.random() < 0.3) ? G.clouds[(Math.random() * G.clouds.length) | 0] : null;
    if (c) { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * c.r; x = c.x + Math.cos(a) * r; z = c.z + Math.sin(a) * r; } else { x = Math.random() * W; z = Math.random() * D; }
    rainDrops.push({ x: clamp(x, 0, W - 0.1), z: clamp(z, 0, D - 0.1), y: H - 2 - Math.random() * 6, snow: snowing });
    if (!raining && !G.clouds.length && !snowing) break;
  }
  for (let i = rainDrops.length - 1; i >= 0; i--) {
    const d = rainDrops[i]; d.y -= rdt * (d.snow ? 2.5 : 26) * sp; if (d.snow) d.x += Math.sin(d.y + i) * rdt * 0.5;
    const ty = world.topAny(clamp(d.x | 0, 0, W - 1), clamp(d.z | 0, 0, D - 1)) + 1;
    if (d.y < ty || (rainDrops.length > (snowing ? 260 : want) && Math.random() < 0.05)) { rainDrops[i] = rainDrops[rainDrops.length - 1]; rainDrops.pop(); continue; }
    if (d.snow) dynT.box(d.x - 0.06, d.y, d.z - 0.06, d.x + 0.06, d.y + 0.12, d.z + 0.06, 1.4, 1.4, 1.5, 2);
    else dynT.box(d.x - 0.025, d.y, d.z - 0.025, d.x + 0.025, d.y + 0.55, d.z + 0.025, 0.55, 0.7, 1.0, 2);
  }
  // clouds
  const cloudAt = (cx, cz, r, k) => { for (let j = 0; j < 7; j++) { const a = j * 0.9 + k, rr = r * (0.3 + 0.5 * hash3(j, k | 0, 3)); const x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr, s = 1.5 + hash3(j, 2, k | 0) * 2;
    dynT.box(clamp(x - s, 0, W), H - 3.5, clamp(z - s, 0, D), clamp(x + s, 0, W), H - 1.8 + hash3(j, 5, 1), clamp(z + s, 0, D), 0.75, 0.77, 0.82); } };
  for (const c of G.clouds) cloudAt(c.x, c.z, c.r, c.x);
  if (raining || G.storm) for (let k = 0; k < 6; k++) cloudAt(8 + (k % 3) * 16, 12 + (k / 3 | 0) * 24, 10, k * 3.1);
  // lightning bolts
  for (let i = G.bolts.length - 1; i >= 0; i--) {
    const b = G.bolts[i]; b.t -= realDt; if (b.t <= 0) { G.bolts.splice(i, 1); continue; }
    let px = b.x, pz = b.z, py = H - 1.5; srand((b.seed | 0) + 1);
    while (py > b.y + 1) { const ny = Math.max(b.y + 1, py - 1.2 - rnd() * 1.2); const nx = px + (rnd() - .5) * 1.4, nz = pz + (rnd() - .5) * 1.4;
      const steps = Math.ceil(Math.hypot(nx - px, ny - py, nz - pz) / 0.18);
      for (let k = 0; k < steps; k++) { const t = k / steps, x = lerp(px, nx, t), y = lerp(py, ny, t), z = lerp(pz, nz, t); dyn.box(x - 0.09, y - 0.09, z - 0.09, x + 0.09, y + 0.09, z + 0.09, 1.3, 1.35, 1.6, 2); }
      px = nx; pz = nz; py = ny; }
    const k2 = Math.ceil((py - b.y - 0.5) / 0.18); for (let k = 0; k < k2; k++) { const y = py - k * 0.18; dyn.box(b.x - 0.09, y - 0.09, b.z - 0.09, b.x + 0.09, y + 0.09, b.z + 0.09, 1.3, 1.35, 1.6, 2); }
  }
  if (G.bolts.length > 6) G.bolts.splice(0, G.bolts.length - 6);
  G.flash = Math.max(0, G.flash - realDt * 4);
  // tool previews
  const hv = UI.hover;
  if (hv && hv.hit && !G.over) {
    const t = UI.tool, hit = hv.hit;
    if (BDEF[t] && BDEF[t].era <= G.era) {
      const def = BDEF[t]; const [x0, z0] = ghostOrigin(t, hit); const info = footprintInfo(t, x0, z0);
      const ok = !info.bad && canAfford(def.cost);
      const base = info.base || (groundTop(clamp(hit.x, 0, W - 1), clamp(hit.z, 0, D - 1)) + 1);
      const c = ok ? [0.45, 1.0, 0.55] : [1.0, 0.35, 0.3];
      let cells = def.tmpl(base); if (cells.length > 200) cells = cells.filter((q, i) => q[1] < 3 || i % 3 === 0);
      for (const [dx, dy, dz] of cells) dynT.box(x0 + dx + 0.04, base + dy + 0.04, z0 + dz + 0.04, x0 + dx + 0.96, base + dy + 0.96, z0 + dz + 0.96, c[0], c[1], c[2], 2);
      for (let z = z0; z < z0 + def.d; z++) for (let x = x0; x < x0 + def.w; x++) { const y = groundTop(clamp(x, 0, W - 1), clamp(z, 0, D - 1)) + 1; dynT.box(x + 0.02, y, z + 0.02, x + 0.98, y + 0.06, z + 0.98, c[0], c[1], c[2], 2); }
      if (def.jobs && (t === 'lumber' || t === 'quarry')) ringPreview(x0 + def.w / 2, z0 + def.d / 2, t === 'lumber' ? 17 : 6.5, [0.9, 0.9, 0.6]);
      if (t === 'well') ringPreview(x0 + 1.5, z0 + 1.5, 9.5, [0.5, 0.75, 1]);
    } else if (POWERS[t]) {
      const r = t === 'rain' ? 7 : t === 'bless' ? 12 : t === 'bolt' ? 1.2 : UI.brush - 0.5;
      ringPreview(hit.x + 0.5, hit.z + 0.5, r, t === 'bolt' ? [1, 0.9, 0.3] : t === 'lower' ? [1, 0.55, 0.4] : t === 'rain' ? [0.5, 0.75, 1] : [0.6, 1, 0.6]);
      if (t === 'raise' || t === 'lower') { const rr = UI.brush - 1; for (let dz = -rr; dz <= rr; dz++) for (let dx = -rr; dx <= rr; dx++) { if (dx * dx + dz * dz > rr * rr + 0.5) continue; const x = hit.x + dx, z = hit.z + dz; if (x < 0 || z < 0 || x >= W || z >= D) continue; const y = world.topAny(x, z) + 1; const c = t === 'raise' ? [0.6, 1, 0.6] : [1, 0.55, 0.4]; dynT.box(x + 0.05, y - (t === 'lower' ? 1 : 0), z + 0.05, x + 0.95, y + (t === 'raise' ? 1 : 0.04), z + 0.95, c[0], c[1], c[2], 2); } }
    } else if (t === 'demolish' || t === 'inspect') {
      const b = buildingAt(hit.x, hit.z); if (b && b.type !== 'campfire' || (b && t === 'inspect')) highlight(b, t === 'demolish' ? [1, 0.3, 0.25] : [0.7, 0.85, 1]);
    }
  }
  if (UI.sel && UI.sel.b && G.blds.includes(UI.sel.b)) highlight(UI.sel.b, UI.demoPending === UI.sel.b ? [1, 0.3, 0.25] : [1, 0.85, 0.4]);
}
function highlight(b, c) {
  for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) { if (x > b.x && x < b.x + b.w - 1 && z > b.z && z < b.z + b.d - 1) continue; dynT.box(x, b.base - 0.02, z, x + 1, b.base + 0.08, z + 1, c[0], c[1], c[2], 2); }
}
function ringPreview(cx, cz, r, c) {
  const n = Math.max(12, Math.floor(r * 7));
  for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (x < 0 || z < 0 || x >= W || z >= D) continue; const y = world.topAny(x | 0, z | 0) + 1; dynT.box(x - 0.15, y, z - 0.15, x + 0.15, y + 0.12, z + 0.15, c[0], c[1], c[2], 2); }
}
function collectLights(env) {
  const L = []; const n = env.night; const fl = 0.85 + Math.sin(performance.now() / 90) * 0.08 + Math.random() * 0.07;
  const cf = G.blds[0]; if (cf) L.push([cf.x + 1.5, cf.base + 1.3, cf.z + 1.5, 7 + n * 3, 1.0 * fl * (0.4 + n), 0.55 * fl * (0.4 + n), 0.2 * (0.4 + n)]);
  if (world.burning.size) { let k = 0; for (const [i] of world.burning) { if (k++ % Math.max(1, Math.ceil(world.burning.size / 10)) !== 0) continue; L.push([i % W + 0.5, ((i / (W * D)) | 0) + 1, (((i / W) | 0) % D) + 0.5, 6, 1.3 * fl, 0.55 * fl, 0.15]); if (L.length > 12) break; } }
  if (n > 0.05) for (const b of G.blds) {
    if (L.length >= 32) break; if (!b.done) continue;
    const def = BDEF[b.type];
    if (def.house && b.residents.some(v => v.inside)) L.push([b.x + b.w / 2, b.base + 1.4, b.z + b.d + 0.4, 5.5, 1.0 * n, 0.62 * n, 0.28 * n]);
    else if (['shrine', 'temple', 'mine', 'dock', 'tower'].includes(b.type)) {
      const lc = b.cells.find(c => c[3] === B.LANTERN && world.get(c[0], c[1], c[2]) === B.LANTERN);
      if (lc) L.push([lc[0] + 0.5, lc[1] + 0.5, lc[2] + 0.5, b.type === 'tower' ? 10 : 5, 1.0 * n, 0.7 * n, 0.32 * n]);
    }
  }
  return L;
}

function updHint() {
  const el = $('hint'), t = UI.tool, h = UI.hover;
  if (t === 'inspect' || inp.drag || inp.mx < 0 || !h || !h.hit || G.over) { el.classList.remove('on'); return; }
  let txt = '', bad = '';
  if (BDEF[t]) { const def = BDEF[t]; const [x0, z0] = ghostOrigin(t, h.hit); const info = footprintInfo(t, x0, z0);
    bad = info.bad || (!canAfford(def.cost) ? 'Not enough ' + Object.keys(def.cost).filter(k => G.res[k] < def.cost[k]).join(' or ') : ''); txt = `Build ${def.name}`; }
  else if (t === 'demolish') { const b = buildingAt(h.hit.x, h.hit.z); txt = b && b.type !== 'campfire' ? (UI.demoPending === b ? `Confirm demolishing the ${BDEF[b.type].name}` : `Demolish ${BDEF[b.type].name}`) : 'Point at a building'; if (!b) bad = txt; }
  else if (POWERS[t]) { txt = t === 'raise' ? 'Hold to raise land' : t === 'lower' ? 'Hold to lower land' : POWERS[t].name; if (G.res.favor < POWERS[t].favor) bad = 'Not enough Favor'; }
  const html = `<kbd>E</kbd>${bad || txt}`; if (el.dataset.h !== html) { el.innerHTML = html; el.dataset.h = html; }
  el.classList.add('on'); el.classList.toggle('bad', !!bad);
  el.style.left = Math.min(inp.mx + 18, innerWidth - el.offsetWidth - 8) + 'px'; el.style.top = (inp.my + 20) + 'px';
}
function resetCam() { UI.follow = false; cam.auto = false; cam.goTo = { yaw: -0.72, pitch: 0.52, dist: 92, target: [W / 2, 11, D / 2] };
  // take the short way round
  const tw = Math.PI * 2; cam.yaw = ((cam.yaw - cam.goTo.yaw + Math.PI) % tw + tw) % tw - Math.PI + cam.goTo.yaw; }
// ===================== main loop =====================
let started = false, last = performance.now(), uiT = 0;
function startGame(seed) {
  newGame(seed);
  R.remeshAll();
  UI.sel = null; UI.cat = 'homes'; UI.setTool('inspect'); UI.logDirty = true; rainDrops.length = 0;
  G.season = seasonOf();
  cam.yaw = -0.72; cam.pitch = 0.52; cam.dist = 92; cam.target = [W / 2, 11, D / 2];
  UI.syncCtl();
}
function frame(now) {
  const rdt = Math.min(0.1, (now - last) / 1000); last = now;
  try {
    if (G && started && !G.paused && !G.over) {
      let gdt = rdt * G.speed / HOUR_SEC;
      while (gdt > 0) { const s = Math.min(gdt, 0.04); simStep(s); gdt -= s; if (G.over) break; }
    }
    if (G && started && inp.eHeld && (UI.tool === 'raise' || UI.tool === 'lower')) { inp.paintT += rdt; if (inp.paintT > 0.14) { inp.paintT = 0; useTool(false); } }
    if (G) {
      if (started) updHint();
      if (started) { const p = pickAt(inp.mx, inp.my); UI.hover = p; if (!inp.drag) canvas.style.cursor = p.v || (p.hit && buildingAt(p.hit.x, p.hit.z)) ? 'pointer' : 'grab'; }
      R.flushDirty(world.burning.size ? 9 : 4);
      if (cam.auto || !started) cam.yaw += rdt * 0.05;
      if (cam.goTo) { const k = 1 - Math.exp(-rdt * 6), q = cam.goTo; cam.yaw = lerp(cam.yaw, q.yaw, k); cam.pitch = lerp(cam.pitch, q.pitch, k); cam.dist = lerp(cam.dist, q.dist, k); for (let i = 0; i < 3; i++) cam.target[i] = lerp(cam.target[i], q.target[i], k);
        if (Math.abs(cam.yaw - q.yaw) + Math.abs(cam.dist - q.dist) / 50 + Math.abs(cam.target[0] - q.target[0]) / 20 + Math.abs(cam.target[2] - q.target[2]) / 20 < 0.002 || inp.drag) cam.goTo = null; }
      if (UI.follow && UI.sel && UI.sel.v && G.vill.includes(UI.sel.v)) { const v = UI.sel.v; cam.target[0] = lerp(cam.target[0], v.x, rdt * 4); cam.target[1] = lerp(cam.target[1], v.y, rdt * 4); cam.target[2] = lerp(cam.target[2], v.z, rdt * 4); }
      cam.update(canvas.clientWidth / Math.max(1, canvas.clientHeight));
      const env = environment(); setBackground(env);
      buildDynamic(env, G.paused ? 0 : rdt, rdt);
      R.draw(cam, env, collectLights(env), dyn, dynT);
      if (UI.thumbReq) { const cb = UI.thumbReq; UI.thumbReq = null; cb(SaveUI.makeThumb()); }
      if (started) {
        uiT += rdt; if (uiT > 0.2) { uiT = 0; UI.update(); }
        const nt = env.night, quiet = G.rain || G.storm ? 0.3 : 1;
        SND.updAmb({ rain: G.rain ? (G.rain.heavy ? 1 : 0.65) : G.clouds.length ? 0.35 : 0, fire: Math.min(1, world.burning.size / 50), wind: G.frozen ? 1 : G.storm ? 0.7 : 0.2,
          birds: G.frozen ? 0 : (1 - nt) * quiet, crickets: G.frozen ? 0 : nt * quiet, musicDay: G.over ? 0 : 1 - nt, musicNight: G.over ? 0 : nt });
      }
    }
  } catch (e) { showError(e); return; }
  requestAnimationFrame(frame);
}
function showError(e) { const el = $('error'); el.textContent = 'Something went wrong:\n\n' + (e && e.stack || e); el.classList.add('open'); console.error(e); }
try {
  R.init(canvas);
  newGame(1337); R.remeshAll(); G.season = seasonOf();
  UI.init();
  requestAnimationFrame(frame);
} catch (e) { showError(e); }
// ===================== saving UI =====================
const SaveUI = {
  mode: 'game', pendingOverwrite: null, wasPaused: false, lastThumb: null,
  thumb(cb) { UI.thumbReq = cb; },
  makeThumb() {
    try { const c = document.createElement('canvas'); c.width = 200; c.height = 125; const g = c.getContext('2d');
      const sw = canvas.width, sh = canvas.height, ar = 200 / 125; let w = sw * 0.72, h = w / ar; if (h > sh * 0.8) { h = sh * 0.8; w = h * ar; }
      g.fillStyle = '#4a4550'; g.fillRect(0, 0, 200, 125); g.drawImage(canvas, (sw - w) / 2, (sh - h) / 2 + sh * 0.04, w, h, 0, 0, 200, 125);
      return c.toDataURL('image/jpeg', 0.72); } catch (e) { return null; }
  },
  autosave(withThumb) {
    if (!started || !G || G.over) return;
    const go = t => { if (t) this.lastThumb = t; Saves.write('auto', t || this.lastThumb); };
    if (withThumb) this.thumb(go); else go(null);
  },
  label(m) { return `${ERAS[m.era]} era, ${SEASONS[m.season].toLowerCase()} of year ${m.year}`; },
  when(t) {
    const d = new Date(t), now = new Date(), time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return `today at ${time}`;
    const y = new Date(now); y.setDate(now.getDate() - 1); if (d.toDateString() === y.toDateString()) return `yesterday at ${time}`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` at ${time}`;
  },
  open(mode) {
    this.mode = mode; this.pendingOverwrite = null;
    if (mode === 'game' && G) { this.wasPaused = G.paused; G.paused = true; UI.syncCtl(); }
    if (mode === 'game') this.thumb(t => { this.freshThumb = t; this.render(); }); else this.render();
    $('saves-bg').classList.add('on'); $('saves').classList.add('on');
  },
  close() {
    $('saves-bg').classList.remove('on'); $('saves').classList.remove('on');
    if (this.mode === 'game' && G && started) { G.paused = this.wasPaused; UI.syncCtl(); }
  },
  render() {
    const inGame = this.mode === 'game';
    let h = `<button class="iclose" data-s="close" aria-label="Close">${SVGI.close}</button><h2>${inGame ? 'Save or load' : 'Load a game'}</h2><div class="slots">`;
    for (const { slot, meta } of Saves.list()) {
      const name = slot === 'auto' ? 'Autosave' : `Slot ${slot}`;
      const arm = this.pendingOverwrite === slot;
      h += `<div class="srow ${meta ? '' : 'empty'}"><div class="sthumb">${meta && meta.thumb ? `<img src="${meta.thumb}" alt="">` : ''}</div><div class="sinfo"><div class="sname">${name}</div>`;
      h += meta ? `<div class="sdesc">${this.label(meta)}</div><div class="smeta">${meta.pop} ${meta.pop === 1 ? 'villager' : 'villagers'}, saved ${this.when(meta.time)}</div>`
                : `<div class="smeta">${slot === 'auto' ? 'Saves every morning and when you close the page' : 'Empty'}</div>`;
      h += `</div><div class="sacts">`;
      if (inGame && !(G && G.over) && slot !== 'auto') h += `<button data-s="save" data-slot="${slot}" class="${arm ? 'arm' : 'primary'}">${arm ? 'Replace it?' : meta ? 'Save here' : 'Save'}</button>`;
      if (meta) h += `<button data-s="load" data-slot="${slot}">Load</button>`;
      if (meta && slot !== 'auto') h += `<button data-s="del" data-slot="${slot}" class="del" aria-label="Delete ${name}">${SVGI.close}</button>`;
      h += `</div></div>`;
    }
    h += `</div>${inGame ? '' : ''}`;
    $('saves').innerHTML = h;
  },
  click(e) {
    const b = e.target.closest('button'); if (!b) return; const a = b.dataset.s, slot = b.dataset.slot;
    SND.play('click', { volume: 0.45 });
    if (a === 'close') return this.close();
    if (a === 'save') {
      if (Saves.meta(slot) && this.pendingOverwrite !== slot) { this.pendingOverwrite = slot; return this.render(); }
      this.pendingOverwrite = null;
      if (Saves.write(slot, this.freshThumb || this.lastThumb)) { UI.toast(`Saved to slot ${slot}`); SND.play('complete', { volume: 0.5 }); } else UI.toast('Couldn’t save: this browser’s storage is full or turned off');
      return this.render();
    }
    if (a === 'load') {
      const data = Saves.read(slot); if (!data) { UI.toast('That save couldn’t be read'); return; }
      try {
        if (!started) beginSession();
        restoreGame(data); afterLoad();
        this.mode = 'game'; this.close(); G.paused = false; UI.syncCtl();
        UI.toast(`Loaded ${slot === 'auto' ? 'the autosave' : 'slot ' + slot}`);
      } catch (err) { console.error(err); UI.toast(err.message || 'That save couldn’t be loaded'); }
      return;
    }
    if (a === 'del') { if (b.classList.contains('arm')) { Saves.remove(slot); this.render(); refreshStart(); } else { b.classList.add('arm'); b.innerHTML = 'Delete?'; } }
  },
};
function afterLoad() {
  R.remeshAll(); rainDrops.length = 0; G.particles = []; G.bolts = [];
  UI.sel = null; UI.follow = false; UI.cat = 'homes'; UI.setTool('inspect'); UI.logDirty = true; UI.lastLogTop = null;
  UI.syncCtl(); UI.update();
}
function beginSession() { $('start').classList.add('gone'); document.body.classList.remove('pre'); started = true; SND.init(); }
function refreshStart() {
  const latest = Saves.latest(), el = $('start-btns');
  el.innerHTML = latest ? `<button class="play" data-a="continue">Continue</button><div class="sub"><button data-a="new">New game</button><button data-a="load">Load a save</button></div>`
                        : `<button class="play" data-a="new">Play</button>`;
  if (latest) el.querySelector('[data-a="continue"]').title = SaveUI.label(latest.meta);
}
$('start-btns').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const a = b.dataset.a;
  if (a === 'new') { beginSession(); startGame((Math.random() * 1e6) | 0); UI.banner('The Camp era', 'Build shelter, find food, and get through your first winter.'); }
  if (a === 'continue') { const l = Saves.latest(); const data = l && Saves.read(l.slot); try { beginSession(); restoreGame(data); afterLoad(); UI.toast('Welcome back'); } catch (err) { console.error(err); startGame((Math.random() * 1e6) | 0); UI.toast('Your save couldn’t be loaded, so a new valley was started'); } }
  if (a === 'load') SaveUI.open('start');
});
$('saves').addEventListener('click', e => SaveUI.click(e));
$('saves-bg').addEventListener('click', () => SaveUI.close());
addEventListener('pagehide', () => SaveUI.autosave(false));
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') SaveUI.autosave(false); });
function onNewDay() { SaveUI.autosave(true); }
refreshStart();
window.__T = { get G() { return G; }, comp, get mainComp() { return mainComp; }, astar, walkOK, walkH, updateWalk, simStep, world, placeBuilding, advanceEra, cam, usePower, strike, BDEF, footprintInfo, assignJobs };
