// ===================== save / load =====================
const SAVE_PREFIX = 'terrarium.save.';
const SAVE_SLOTS = ['auto', '1', '2', '3'];
const SAVE_VERSION = 1;

function b64FromBytes(u8) { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
function bytesFromB64(b) { const s = atob(b), u8 = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i); return u8; }
// run-length encode a typed array as (value, count) Uint16 pairs
function rle(arr) {
  const out = []; let i = 0;
  while (i < arr.length) { const v = arr[i] & 0xffff; let n = 1; while (i + n < arr.length && (arr[i + n] & 0xffff) === v && n < 65535) n++; out.push(v, n); i += n; }
  return b64FromBytes(new Uint8Array(new Uint16Array(out).buffer));
}
function unrle(b64, target) {
  const u8 = bytesFromB64(b64), p = new Uint16Array(u8.buffer, u8.byteOffset, u8.byteLength >> 1); let k = 0;
  for (let i = 0; i < p.length; i += 2) { const v = p[i], n = p[i + 1]; target.fill(target instanceof Int16Array && v > 32767 ? v - 65536 : v, k, k + n); k += n; }
}

function serializeGame() {
  const V_KEYS = ['id', 'name', 'x', 'z', 'y', 'carry', 'mood', 'missed', 'health', 'bless', 'fear', 'inside', 'anim', 'hue', 'skin', 'act', 'sleepOut', 'stuck', 'dir'];
  const B_KEYS = ['id', 'type', 'x', 'z', 'w', 'd', 'base', 'cells', 'placed', 'progress', 'done', 'health', 'entry', 'tend', 'paused', 'bornT', 'lost', 'total', 'warn', 'flooded'];
  const g = {};
  for (const k of ['t', 'speed', 'res', 'era', 'nextB', 'nextV', 'rain', 'clouds', 'storm', 'grief', 'lowMoodH', 'stats', 'nameI', 'saplings', 'seed', 'fireAcc', 'waterAcc',
    'frozen', 'season', 'dayWeather', 'eraReady', 'lastWarn', 'fullWarn']) g[k] = G[k];
  g.log = G.log.slice(0, 20);
  g.waterActive = Array.from(G.waterActive).slice(0, 20000);
  g.blds = G.blds.map(b => { const o = {}; for (const k of B_KEYS) o[k] = b[k]; if (b.crops) o.crops = Array.from(b.crops, c => Math.round(c * 100) / 100); return o; });
  g.vill = G.vill.map(v => { const o = {}; for (const k of V_KEYS) o[k] = v[k]; o.home = v.home ? v.home.id : null; o.slot = v.slot ? { b: v.slot.b.id, k: v.slot.k, kind: v.slot.kind } : null; return o; });
  return {
    v: SAVE_VERSION, g,
    world: { v: rle(world.v), owner: rle(world.owner), burning: Array.from(world.burning) },
    cam: { yaw: cam.yaw, pitch: cam.pitch, dist: cam.dist, target: cam.target.slice() },
  };
}

function restoreGame(data) {
  if (!data || data.v !== SAVE_VERSION) throw new Error('This save was made by a different version of the game.');
  const g = data.g;
  G = { t: 6, speed: 1, paused: false, res: {}, era: 0, vill: [], blds: [], bmap: new Map(), nextB: 0, nextV: 0, log: [], rain: null, clouds: [], storm: null, grief: 0,
    lowMoodH: 0, over: null, stats: { peak: 0, built: 0, deaths: 0, born: 0 }, nameI: 0, waterActive: new Set(), saplings: [], fireAcc: 0, waterAcc: 0, particles: [], bolts: [],
    flash: 0, seed: 0, eraReady: false, season: 0, frozen: false, lastWarn: -99, dayWeather: null };
  for (const k in g) if (!['blds', 'vill', 'waterActive'].includes(k)) G[k] = g[k];
  G.paused = false; G.over = null;
  G.waterActive = new Set(g.waterActive || []);
  world.v.fill(0); world.owner.fill(0); world.burning.clear();
  unrle(data.world.v, world.v); unrle(data.world.owner, world.owner);
  for (const [i, r] of data.world.burning) world.burning.set(i, r);
  bmap.fill(0);
  for (const o of g.blds) {
    const b = Object.assign({ cells: [], workers: [], residents: [], crops: null, health: 1, lost: 0 }, o);
    if (o.crops) b.crops = Float32Array.from(o.crops);
    b.workers = []; b.residents = [];
    G.blds.push(b); G.bmap.set(b.id, b);
    for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) bmap[x + z * W] = b.id + 1;
  }
  for (const o of g.vill) {
    const v = Object.assign({ q: [], path: null, target: null, work: 0 }, o);
    v.home = o.home !== null ? G.bmap.get(o.home) || null : null;
    const sb = o.slot ? G.bmap.get(o.slot.b) : null;
    v.slot = sb ? { b: sb, k: o.slot.k, kind: o.slot.kind } : null;
    v.q = []; v.working = false; v.walking = false; v.hidden = false;
    G.vill.push(v);
    if (v.home) v.home.residents.push(v);
  }
  for (let i = 0; i < W * D; i++) colDirty.add(i);
  updateWalk(); labelComponents();
  for (const b of G.blds) if (!b.entry || !inMain(b.entry[0], b.entry[1])) computeEntry(b);
  assignHomes(); assignJobs();
  if (data.cam) { cam.yaw = data.cam.yaw; cam.pitch = data.cam.pitch; cam.dist = data.cam.dist; cam.target = data.cam.target.slice(); cam.goTo = null; }
}

const Saves = {
  key: s => SAVE_PREFIX + s,
  meta(slot) { try { const raw = localStorage.getItem(this.key(slot) + '.meta'); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } },
  list() { return SAVE_SLOTS.map(s => ({ slot: s, meta: this.meta(s) })); },
  latest() { let best = null; for (const s of SAVE_SLOTS) { const m = this.meta(s); if (m && (!best || m.time > best.meta.time)) best = { slot: s, meta: m }; } return best; },
  write(slot, thumb) {
    if (!G || G.over) return false;
    const data = JSON.stringify(serializeGame());
    const meta = { time: Date.now(), era: G.era, season: seasonOf(), year: Math.floor(dayOf() / 12) + 1, day: dayOf(), pop: G.vill.length, thumb: thumb || null };
    try {
      localStorage.setItem(this.key(slot), data);
      localStorage.setItem(this.key(slot) + '.meta', JSON.stringify(meta));
      return true;
    } catch (e) {
      try { // retry without the picture if space is tight
        meta.thumb = null; localStorage.setItem(this.key(slot), data); localStorage.setItem(this.key(slot) + '.meta', JSON.stringify(meta)); return true;
      } catch (e2) { return false; }
    }
  },
  read(slot) { try { const raw = localStorage.getItem(this.key(slot)); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } },
  remove(slot) { try { localStorage.removeItem(this.key(slot)); localStorage.removeItem(this.key(slot) + '.meta'); } catch (e) {} },
};
