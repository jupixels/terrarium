// ===================== math =====================
const M4 = {
  create() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
  perspective(fovy, aspect, n, f) {
    const t = 1 / Math.tan(fovy / 2), m = new Float32Array(16);
    m[0] = t / aspect; m[5] = t; m[10] = (f + n) / (n - f); m[11] = -1; m[14] = 2 * f * n / (n - f); return m;
  },
  ortho(l, r, b, t, n, f) {
    const m = new Float32Array(16);
    m[0] = 2 / (r - l); m[5] = 2 / (t - b); m[10] = -2 / (f - n);
    m[12] = -(r + l) / (r - l); m[13] = -(t + b) / (t - b); m[14] = -(f + n) / (f - n); m[15] = 1; return m;
  },
  lookAt(e, c, up) {
    let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2];
    let l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
    let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    const m = new Float32Array(16);
    m[0] = xx; m[1] = yx; m[2] = zx; m[4] = xy; m[5] = yy; m[6] = zy; m[8] = xz; m[9] = yz; m[10] = zz;
    m[12] = -(xx * e[0] + xy * e[1] + xz * e[2]); m[13] = -(yx * e[0] + yy * e[1] + yz * e[2]);
    m[14] = -(zx * e[0] + zy * e[1] + zz * e[2]); m[15] = 1; return m;
  },
  mul(a, b) {
    const o = new Float32Array(16);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s;
    }
    return o;
  },
  invert(m) {
    const inv = new Float32Array(16);
    inv[0] = m[5]*m[10]*m[15]-m[5]*m[11]*m[14]-m[9]*m[6]*m[15]+m[9]*m[7]*m[14]+m[13]*m[6]*m[11]-m[13]*m[7]*m[10];
    inv[4] = -m[4]*m[10]*m[15]+m[4]*m[11]*m[14]+m[8]*m[6]*m[15]-m[8]*m[7]*m[14]-m[12]*m[6]*m[11]+m[12]*m[7]*m[10];
    inv[8] = m[4]*m[9]*m[15]-m[4]*m[11]*m[13]-m[8]*m[5]*m[15]+m[8]*m[7]*m[13]+m[12]*m[5]*m[11]-m[12]*m[7]*m[9];
    inv[12] = -m[4]*m[9]*m[14]+m[4]*m[10]*m[13]+m[8]*m[5]*m[14]-m[8]*m[6]*m[13]-m[12]*m[5]*m[10]+m[12]*m[6]*m[9];
    inv[1] = -m[1]*m[10]*m[15]+m[1]*m[11]*m[14]+m[9]*m[2]*m[15]-m[9]*m[3]*m[14]-m[13]*m[2]*m[11]+m[13]*m[3]*m[10];
    inv[5] = m[0]*m[10]*m[15]-m[0]*m[11]*m[14]-m[8]*m[2]*m[15]+m[8]*m[3]*m[14]+m[12]*m[2]*m[11]-m[12]*m[3]*m[10];
    inv[9] = -m[0]*m[9]*m[15]+m[0]*m[11]*m[13]+m[8]*m[1]*m[15]-m[8]*m[3]*m[13]-m[12]*m[1]*m[11]+m[12]*m[3]*m[9];
    inv[13] = m[0]*m[9]*m[14]-m[0]*m[10]*m[13]-m[8]*m[1]*m[14]+m[8]*m[2]*m[13]+m[12]*m[1]*m[10]-m[12]*m[2]*m[9];
    inv[2] = m[1]*m[6]*m[15]-m[1]*m[7]*m[14]-m[5]*m[2]*m[15]+m[5]*m[3]*m[14]+m[13]*m[2]*m[7]-m[13]*m[3]*m[6];
    inv[6] = -m[0]*m[6]*m[15]+m[0]*m[7]*m[14]+m[4]*m[2]*m[15]-m[4]*m[3]*m[14]-m[12]*m[2]*m[7]+m[12]*m[3]*m[6];
    inv[10] = m[0]*m[5]*m[15]-m[0]*m[7]*m[13]-m[4]*m[1]*m[15]+m[4]*m[3]*m[13]+m[12]*m[1]*m[7]-m[12]*m[3]*m[5];
    inv[14] = -m[0]*m[5]*m[14]+m[0]*m[6]*m[13]+m[4]*m[1]*m[14]-m[4]*m[2]*m[13]-m[12]*m[1]*m[6]+m[12]*m[2]*m[5];
    inv[3] = -m[1]*m[6]*m[11]+m[1]*m[7]*m[10]+m[5]*m[2]*m[11]-m[5]*m[3]*m[10]-m[9]*m[2]*m[7]+m[9]*m[3]*m[6];
    inv[7] = m[0]*m[6]*m[11]-m[0]*m[7]*m[10]-m[4]*m[2]*m[11]+m[4]*m[3]*m[10]+m[8]*m[2]*m[7]-m[8]*m[3]*m[6];
    inv[11] = -m[0]*m[5]*m[11]+m[0]*m[7]*m[9]+m[4]*m[1]*m[11]-m[4]*m[3]*m[9]-m[8]*m[1]*m[7]+m[8]*m[3]*m[5];
    inv[15] = m[0]*m[5]*m[10]-m[0]*m[6]*m[9]-m[4]*m[1]*m[10]+m[4]*m[2]*m[9]+m[8]*m[1]*m[6]-m[8]*m[2]*m[5];
    let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
    det = det ? 1 / det : 0; for (let i = 0; i < 16; i++) inv[i] *= det; return inv;
  },
  xform(m, x, y, z, w) {
    return [m[0]*x+m[4]*y+m[8]*z+m[12]*w, m[1]*x+m[5]*y+m[9]*z+m[13]*w, m[2]*x+m[6]*y+m[10]*z+m[14]*w, m[3]*x+m[7]*y+m[11]*z+m[15]*w];
  },
};
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function hash3(x, y, z) { let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
let _seed = 1;
function srand(s) { _seed = s >>> 0 || 1; }
function rnd() { _seed ^= _seed << 13; _seed >>>= 0; _seed ^= _seed >>> 17; _seed ^= _seed << 5; _seed >>>= 0; return _seed / 4294967296; }
function vnoise(x, z, s) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash3(xi, s, zi), b = hash3(xi + 1, s, zi), c = hash3(xi, s, zi + 1), d = hash3(xi + 1, s, zi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
function fbm(x, z, s) { return vnoise(x, z, s) * 0.55 + vnoise(x * 2.1, z * 2.1, s + 7) * 0.3 + vnoise(x * 4.3, z * 4.3, s + 13) * 0.15; }

// ===================== world =====================
const W = 48, D = 48, H = 40, WL = 13; // water fills y < WL
const B = { AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, SAND: 4, WATER: 5, LOG: 6, LEAVES: 7, ORE: 8, PLANK: 9, ROOF: 10, BRICK: 11,
  WINDOW: 12, SOIL: 13, CROP: 14, ICE: 15, CLOTH: 16, PINE: 17, BURNT: 18, DARK: 19, LANTERN: 20, GOLD: 21, CROP2: 22, CROP3: 23,
  SLATE: 24, CLOTH2: 25, BEDROCK: 26, CLOTH3: 27, ASH: 28 };
// color, flag(1 normal, .5 grassy top, .25 foliage), emissive (0 none, 1 night glow, 2 always), height
const BINFO = [];
function binfo(id, hex, flag = 1, em = 0, h = 1) { BINFO[id] = { c: [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255], flag, em, h }; }
binfo(B.GRASS, 0x4f8a2e, 0.5); binfo(B.DIRT, 0x6b4a2e); binfo(B.STONE, 0x6b6b70); binfo(B.SAND, 0xc9b27a);
binfo(B.WATER, 0x2f6fae); binfo(B.LOG, 0x5a3d22); binfo(B.LEAVES, 0x2f6b25, 0.25); binfo(B.ORE, 0x7d6650);
binfo(B.PLANK, 0x9a6a3a); binfo(B.ROOF, 0xb3342a); binfo(B.BRICK, 0x8c8a86); binfo(B.WINDOW, 0x3a3020, 1, 1);
binfo(B.SOIL, 0x4a321e); binfo(B.CROP, 0x6aa83a, 1, 0, 0.35); binfo(B.ICE, 0xa9d4ee); binfo(B.CLOTH, 0xd8c9a3);
binfo(B.PINE, 0x1e4a2a, 0.25); binfo(B.BURNT, 0x2e2620); binfo(B.DARK, 0x15120f); binfo(B.LANTERN, 0x3a2a10, 1, 1);
binfo(B.GOLD, 0xe0b23a, 1, 0); binfo(B.CROP2, 0x8db63e, 1, 0, 0.6); binfo(B.CROP3, 0xd9b240, 1, 0, 0.8);
binfo(B.SLATE, 0x3d4658); binfo(B.CLOTH2, 0xd9a83a); binfo(B.BEDROCK, 0x3a3a3f); binfo(B.CLOTH3, 0xa8423a); binfo(B.ASH, 0x4a4540);
const FLAMMABLE = { [B.LEAVES]: [0.26, 1.0], [B.PINE]: [0.24, 1.2], [B.LOG]: [0.14, 3.0], [B.PLANK]: [0.18, 2.2], [B.ROOF]: [0.16, 2.0],
  [B.CROP]: [0.35, 0.5], [B.CROP2]: [0.35, 0.5], [B.CROP3]: [0.4, 0.6], [B.CLOTH]: [0.45, 0.8], [B.CLOTH2]: [0.45, 0.8], [B.CLOTH3]: [0.45, 0.8],
  [B.GRASS]: [0.045, 0.4], [B.WINDOW]: [0.15, 1.5] };
const isCrop = t => t === B.CROP || t === B.CROP2 || t === B.CROP3;

const world = {
  v: new Uint8Array(W * D * H),
  owner: new Int16Array(W * D * H), // building id + 1
  burning: new Map(), // idx -> remaining hours
  dirty: new Set(),
  idx(x, y, z) { return x + z * W + y * W * D; },
  inb(x, y, z) { return x >= 0 && y >= 0 && z >= 0 && x < W && y < H && z < D; },
  get(x, y, z) { return (x >= 0 && y >= 0 && z >= 0 && x < W && y < H && z < D) ? this.v[x + z * W + y * W * D] : 0; },
  set(x, y, z, t) {
    if (!this.inb(x, y, z)) return;
    const i = x + z * W + y * W * D;
    if (this.v[i] === t) return;
    this.v[i] = t;
    if (t === B.AIR || t === B.WATER) this.owner[i] = 0;
    this.burning.delete(i);
    this.markDirty(x, y, z);
    if (typeof onWorldChange === 'function') onWorldChange(x, y, z, t);
  },
  markDirty(x, y, z) {
    const cx = x >> 4, cz = z >> 4;
    this.dirty.add(cx + cz * 3);
    const lx = x & 15, lz = z & 15;
    if (lx === 0 && cx > 0) this.dirty.add(cx - 1 + cz * 3);
    if (lx === 15 && cx < 2) this.dirty.add(cx + 1 + cz * 3);
    if (lz === 0 && cz > 0) this.dirty.add(cx + (cz - 1) * 3);
    if (lz === 15 && cz < 2) this.dirty.add(cx + (cz + 1) * 3);
    colDirty.add(x + z * W);
  },
  top(x, z) { // y of topmost non-air non-water block, -1 if none
    for (let y = H - 1; y >= 0; y--) { const t = this.v[x + z * W + y * W * D]; if (t !== B.AIR && t !== B.WATER) return y; }
    return -1;
  },
  topAny(x, z) { for (let y = H - 1; y >= 0; y--) if (this.v[x + z * W + y * W * D] !== B.AIR) return y; return -1; },
};
const colDirty = new Set();
const solidT = t => t !== B.AIR && t !== B.WATER && !isCrop(t);

function genValley(seed) {
  srand(seed);
  world.v.fill(0); world.owner.fill(0); world.burning.clear();
  const so = seed % 1000;
  const hm = new Int16Array(W * D);
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
    let h = 13.6 + (fbm(x / 9, z / 9, so) - 0.5) * 3.2;
    const dm = Math.hypot(x - 10, z - 10);
    h += 18 * Math.pow(Math.max(0, 1 - dm / 21), 1.35) + (fbm(x / 4, z / 4, so + 3) - 0.5) * 3 * Math.max(0, 1 - dm / 22);
    const dl = Math.hypot((x - 33) * 1.0, (z - 33) * 1.15);
    const lk = smooth(11.5, 4, dl + (fbm(x / 5, z / 5, so + 9) - 0.5) * 4);
    h -= lk * 7.5;
    // small ridge near right edge
    h += 3 * smooth(8, 0, Math.abs(x - 44)) * smooth(30, 14, z) * fbm(x / 6, z / 6, so + 21);
    hm[x + z * W] = clamp(Math.round(h), 4, H - 8);
  }
  // soften cliffs so villagers can climb
  for (let pass = 0; pass < 2; pass++) { const c = hm.slice(); for (let z = 1; z < D - 1; z++) for (let x = 1; x < W - 1; x++) { let s = 0; for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) s += c[x + dx + (z + dz) * W]; hm[x + z * W] = Math.round(lerp(c[x + z * W], s / 9, 0.6)); } }
  // flatten start area
  const cx = 21, cz = 20;
  for (let z = cz - 8; z <= cz + 8; z++) for (let x = cx - 8; x <= cx + 8; x++) {
    const d = Math.max(Math.abs(x - cx), Math.abs(z - cz));
    const k = d <= 5 ? 1 : d === 6 ? 0.7 : d === 7 ? 0.45 : 0.2;
    hm[x + z * W] = Math.round(lerp(hm[x + z * W], 14, k));
  }
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
    const h = hm[x + z * W];
    let nearW = false;
    for (let dz = -2; dz <= 2 && !nearW; dz++) for (let dx = -2; dx <= 2; dx++) {
      const xx = x + dx, zz = z + dz; if (xx < 0 || zz < 0 || xx >= W || zz >= D) continue;
      if (hm[xx + zz * W] < WL) { nearW = true; break; }
    }
    for (let y = 0; y < h; y++) {
      let t;
      if (y === 0) t = B.BEDROCK;
      else if (y < h - 4) t = B.STONE;
      else if (y < h - 1) t = (h > 24) ? B.STONE : B.DIRT;
      else t = h > 25 ? B.STONE : B.GRASS;
      if ((t === B.GRASS || t === B.DIRT) && nearW && h <= WL + 1) t = B.SAND;
      if (t === B.STONE && y > 1) {
        const n = hash3(x >> 1, y >> 1, z >> 1);
        const depthBonus = (h - y) > 6 ? 0.06 : 0;
        if (n > 0.93 - depthBonus - (Math.hypot(x - 10, z - 10) < 14 ? 0.05 : 0)) t = B.ORE;
      }
      world.v[world.idx(x, y, z)] = t;
    }
    for (let y = h; y < WL; y++) world.v[world.idx(x, y, z)] = B.WATER;
  }
  // trees
  for (let i = 0; i < 1100; i++) {
    const x = 1 + Math.floor(rnd() * (W - 2)), z = 1 + Math.floor(rnd() * (D - 2));
    if (Math.hypot(x - cx, z - cz) < 7) continue;
    const forest = fbm(x / 7, z / 7, so + 40);
    if (rnd() > forest * forest * 1.9) continue;
    plantTree(x, z, true);
  }
}
function plantTree(x, z, gen) {
  const y = world.top(x, z);
  if (y < 0 || world.get(x, y, z) !== B.GRASS) return false;
  if (world.get(x, y + 1, z) !== B.AIR) return false;
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
    const t = world.get(x + dx, y + 1, z + dz); if (t !== B.AIR && t !== B.LEAVES && t !== B.PINE) return false;
    if (world.owner[world.idx(clamp(x + dx, 0, W - 1), clamp(y, 0, H - 1), clamp(z + dz, 0, D - 1))]) return false;
    if (typeof buildingAt === 'function' && buildingAt(x + dx, z + dz)) return false;
  }
  const S = gen ? (xx, yy, zz, t) => { if (world.inb(xx, yy, zz) && world.v[world.idx(xx, yy, zz)] === B.AIR) world.v[world.idx(xx, yy, zz)] = t; }
                : (xx, yy, zz, t) => { if (world.get(xx, yy, zz) === B.AIR) world.set(xx, yy, zz, t); };
  const pine = y > 17 || hash3(x, 3, z) < 0.25;
  if (pine) {
    const th = 4 + Math.floor(hash3(x, 9, z) * 3);
    for (let k = 1; k <= th; k++) S(x, y + k, z, B.LOG);
    for (let k = 2; k <= th + 2; k++) {
      const r = k > th ? 0 : (th - k) > 2 ? 2 : 1;
      for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) + Math.abs(dz) > r + (r > 1 ? 1 : 0)) continue;
        S(x + dx, y + k, z + dz, B.PINE);
      }
    }
  } else {
    const th = 2 + Math.floor(hash3(x, 5, z) * 2);
    for (let k = 1; k <= th; k++) S(x, y + k, z, B.LOG);
    for (let dy = 0; dy <= 2; dy++) for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
      const d = dx * dx + dz * dz + (dy - 0.6) * (dy - 0.6) * 1.6;
      if (d > 4.6 || (d > 3.2 && hash3(x + dx, y + dy, z + dz) < 0.5)) continue;
      S(x + dx, y + th + dy, z + dz, B.LEAVES);
    }
  }
  return true;
}

// ===================== mesher =====================
const FACES = [
  { n: [1, 0, 0], c: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]] },
  { n: [-1, 0, 0], c: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]] },
  { n: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] },
  { n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
  { n: [0, 0, 1], c: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]] },
  { n: [0, 0, -1], c: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]] },
];
const AO_CURVE = [0.42, 0.62, 0.8, 1.0];
const FLOATS = 12;
class Buf {
  constructor(n = 1 << 16) { this.a = new Float32Array(n); this.n = 0; }
  reset() { this.n = 0; }
  ensure(k) { if (this.n + k > this.a.length) { const b = new Float32Array(Math.max(this.a.length * 2, this.n + k)); b.set(this.a); this.a = b; } }
  v(x, y, z, nx, ny, nz, r, g, b, f, ao, em) {
    const a = this.a, i = this.n; a[i] = x; a[i + 1] = y; a[i + 2] = z; a[i + 3] = nx; a[i + 4] = ny; a[i + 5] = nz;
    a[i + 6] = r; a[i + 7] = g; a[i + 8] = b; a[i + 9] = f; a[i + 10] = ao; a[i + 11] = em; this.n += 12;
  }
  quads() { return this.n / 48; }
  // axis-aligned box
  box(x0, y0, z0, x1, y1, z1, r, g, b, em = 0, f = 1) {
    this.ensure(6 * 48);
    for (const F of FACES) {
      const n = F.n;
      for (const c of F.c) this.v(c[0] ? x1 : x0, c[1] ? y1 : y0, c[2] ? z1 : z0, n[0], n[1], n[2], r, g, b, f, 1, em);
    }
  }
}
const opq = t => t !== B.AIR && t !== B.WATER && !isCrop(t);
function meshChunk(cx, cz, out, wout) {
  out.reset(); wout.reset();
  const v = world.v, burning = world.burning;
  const x0 = cx * 16, z0 = cz * 16;
  const G = (x, y, z) => (x < 0 || z < 0 || x >= W || z >= D || y >= H) ? 0 : y < 0 ? 3 : v[x + z * W + y * W * D];
  for (let y = 0; y < H; y++) for (let z = z0; z < z0 + 16; z++) for (let x = x0; x < x0 + 16; x++) {
    const i = x + z * W + y * W * D, t = v[i];
    if (t === B.AIR) continue;
    if (t === B.WATER) {
      const above = G(x, y + 1, z);
      for (let f = 0; f < 6; f++) {
        const F = FACES[f], n = F.n;
        const nt = G(x + n[0], y + n[1], z + n[2]);
        const oob = x + n[0] < 0 || x + n[0] >= W || z + n[2] < 0 || z + n[2] >= D;
        if (nt === B.WATER || (opq(nt) && !oob)) continue;
        if (f === 3) continue;
        wout.ensure(48);
        const topH = above === B.WATER ? 1 : 0.86;
        const sh = 0.9 + hash3(x, y, z) * 0.12;
        for (const c of F.c) wout.v(x + c[0], y + (c[1] ? topH : 0), z + c[2], n[0], n[1], n[2], 0.18 * sh, 0.42 * sh, 0.66 * sh, 1, 1, 0);
      }
      continue;
    }
    const info = BINFO[t];
    const hgt = info.h;
    const burn = burning.has(i);
    const vr = 0.9 + hash3(x, y, z) * 0.18;
    let r = info.c[0] * vr, g = info.c[1] * vr, b = info.c[2] * vr, em = info.em, flag = info.flag;
    if (t === B.GRASS && hash3(x, 7, z) > 0.93) { r *= 1.25; g *= 1.12; }
    if (burn) { const fl = hash3(x, y, z); r = 1.0; g = 0.35 + fl * 0.3; b = 0.08; em = 2; flag = 1; }
    for (let f = 0; f < 6; f++) {
      const F = FACES[f], n = F.n;
      const nx = x + n[0], ny = y + n[1], nz = z + n[2];
      const nt = G(nx, ny, nz);
      if (opq(nt) && !(hgt < 1 && f === 2)) continue;
      if (isCrop(t) && isCrop(nt) && f !== 2 && f !== 3) continue;
      out.ensure(48);
      let fr = r, fg = g, fb = b;
      if (t === B.GRASS && f !== 2) { fr = r * 0.62 + 0.42 * 0.38 * vr; fg = g * 0.62 + 0.29 * 0.38 * vr; fb = b * 0.62 + 0.18 * 0.38 * vr; }
      const fflag = (flag === 0.5 && f !== 2) ? 0.75 : flag;
      // AO
      const ao = [1, 1, 1, 1];
      for (let k = 0; k < 4; k++) {
        const c = F.c[k];
        // tangent offsets for corner
        const d = [c[0] * 2 - 1, c[1] * 2 - 1, c[2] * 2 - 1];
        let s1x = nx, s1y = ny, s1z = nz, s2x = nx, s2y = ny, s2z = nz;
        if (n[0] !== 0) { s1y += d[1]; s2z += d[2]; } else if (n[1] !== 0) { s1x += d[0]; s2z += d[2]; } else { s1x += d[0]; s2y += d[1]; }
        const a1 = opq(G(s1x, s1y, s1z)) ? 1 : 0, a2 = opq(G(s2x, s2y, s2z)) ? 1 : 0;
        const a3 = opq(G(s1x + s2x - nx, s1y + s2y - ny, s1z + s2z - nz)) ? 1 : 0;
        ao[k] = AO_CURVE[a1 && a2 ? 0 : 3 - (a1 + a2 + a3)];
      }
      const order = (ao[0] + ao[2] < ao[1] + ao[3]) ? [1, 2, 3, 0] : [0, 1, 2, 3];
      for (const k of order) {
        const c = F.c[k];
        out.v(x + c[0], y + (c[1] ? hgt : 0), z + c[2], n[0], n[1], n[2], fr, fg, fb, fflag, em ? 1 : ao[k], em);
      }
    }
  }
}

// ===================== renderer =====================
const VS = `#version 300 es
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor; layout(location=2) in vec4 aCol; layout(location=3) in vec2 aAE;
uniform mat4 uVP; uniform mat4 uSVP;
out vec3 vPos; out vec3 vNor; out vec4 vCol; out vec2 vAE; out vec4 vSh;
void main(){ vPos=aPos; vNor=aNor; vCol=aCol; vAE=aAE; vSh=uSVP*vec4(aPos+aNor*0.04,1.0); gl_Position=uVP*vec4(aPos,1.0); }`;
const FS = `#version 300 es
precision highp float; precision highp sampler2DShadow;
in vec3 vPos; in vec3 vNor; in vec4 vCol; in vec2 vAE; in vec4 vSh;
uniform vec3 uSun; uniform vec3 uSunCol; uniform vec3 uSky; uniform vec3 uGround; uniform float uNight; uniform float uSnow; uniform float uAutumn;
uniform vec4 uL[32]; uniform vec3 uLC[32]; uniform int uNL; uniform float uAlpha; uniform float uWater; uniform float uTime; uniform sampler2DShadow uShadow; uniform float uFlash;
out vec4 o;
float shadow(){
  vec3 p=vSh.xyz/vSh.w*0.5+0.5; if(p.x<0.0||p.x>1.0||p.y<0.0||p.y>1.0) return 1.0;
  float s=0.0; vec2 ts=vec2(1.0/2048.0);
  for(int i=-1;i<=1;i++) for(int j=-1;j<=1;j++) s+=texture(uShadow, vec3(p.xy+vec2(i,j)*ts*1.2, p.z-0.0015));
  return s/9.0;
}
void main(){
  vec3 c=vCol.rgb; float f=vCol.a; vec3 n=normalize(vNor);
  if(f<0.3){ // foliage
    c=mix(c, vec3(0.75,0.42,0.12)*(0.8+0.4*fract(sin(dot(floor(vPos),vec3(12.9,78.2,37.7)))*43758.5)), uAutumn*0.75);
    c=mix(c, vec3(0.86,0.9,0.95), uSnow*(n.y>0.5?0.85:0.25));
  } else if(f<0.6){ c=mix(c, vec3(0.92,0.95,1.0), uSnow*(n.y>0.5?0.95:0.0)); c=mix(c, c*vec3(1.12,0.95,0.7), uAutumn*0.25); }
  else if(f<0.9){ c=mix(c, vec3(0.88,0.91,0.96), uSnow*0.15); }
  float ao=vAE.x; float em=vAE.y;
  float sh=shadow();
  float nd=max(dot(n,uSun),0.0);
  vec3 amb=mix(uGround,uSky,n.y*0.5+0.5);
  vec3 lit=amb*ao + uSunCol*nd*sh*(0.55+0.45*ao);
  for(int i=0;i<32;i++){ if(i>=uNL) break; vec3 d=uL[i].xyz-vPos; float l=length(d); float r=uL[i].w;
    float att=max(0.0,1.0-l/r); att*=att; lit+=uLC[i]*att*(0.35+0.65*max(dot(n,d/l),0.0))*(0.5+0.5*ao); }
  lit+=vec3(0.75,0.8,1.0)*uFlash;
  vec3 col=c*lit;
  if(em>1.5){ col=c*(1.2+0.25*sin(uTime*18.0+vPos.x*3.0+vPos.y*5.0)); }
  else if(em>0.5){ col=mix(col, vec3(1.0,0.72,0.32)*1.25, uNight); }
  if(uWater>0.5){ // water
    float spec=pow(max(dot(reflect(-uSun,n),vec3(0.0,1.0,0.0)),0.0),12.0);
    float w=0.04*sin(vPos.x*1.7+uTime*1.6)+0.04*sin(vPos.z*2.1-uTime*1.3);
    col=c*(amb*1.1+uSunCol*(0.45+0.4*sh))*(1.0+w)+uSunCol*spec*0.08*sh;
    for(int i=0;i<32;i++){ if(i>=uNL) break; vec3 d=uL[i].xyz-vPos; float l=length(d); float att=max(0.0,1.0-l/uL[i].w); col+=uLC[i]*att*att*0.6; }
    o=vec4(col,uAlpha); return;
  }
  o=vec4(col,uAlpha);
}`;
const SVS = `#version 300 es
layout(location=0) in vec3 aPos; uniform mat4 uVP; void main(){ gl_Position=uVP*vec4(aPos,1.0); }`;
const SFS = `#version 300 es
precision mediump float; out vec4 o; void main(){ o=vec4(1.0); }`;
const LVS = `#version 300 es
layout(location=0) in vec3 aPos; layout(location=1) in vec4 aCol; uniform mat4 uVP; out vec4 vC; void main(){ vC=aCol; gl_Position=uVP*vec4(aPos,1.0); }`;
const LFS = `#version 300 es
precision mediump float; in vec4 vC; out vec4 o; void main(){ o=vC; }`;

const R = {
  init(canvas) {
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: false });
    if (!gl) throw new Error('WebGL2 is not available in this browser.');
    this.gl = gl; this.canvas = canvas;
    const mk = (vs, fs) => {
      const p = gl.createProgram();
      for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
        const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        gl.attachShader(p, s);
      }
      gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); const nm = a.name.replace('[0]', ''); u[nm] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    this.main = mk(VS, FS); this.shad = mk(SVS, SFS); this.line = mk(LVS, LFS);
    // shared index buffer
    const maxQ = 1 << 18; const idx = new Uint32Array(maxQ * 6);
    for (let q = 0; q < maxQ; q++) { const b = q * 4; idx.set([b, b + 1, b + 2, b, b + 2, b + 3], q * 6); }
    this.ibo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    this.chunks = []; this.wchunks = [];
    for (let i = 0; i < 9; i++) { this.chunks.push(this.mkMesh()); this.wchunks.push(this.mkMesh()); }
    this.dyn = this.mkMesh(); this.dynT = this.mkMesh(); this.base = this.mkMesh();
    this.scratch = new Buf(1 << 20); this.wscratch = new Buf(1 << 18);
    // plinth
    const bb = new Buf(4096);
    bb.box(-1.2, -2.2, -1.2, W + 1.2, -0.0, D + 1.2, 0.16, 0.1, 0.07);
    bb.box(-1.5, -2.6, -1.5, W + 1.5, -2.1, D + 1.5, 0.1, 0.065, 0.05);
    this.upload(this.base, bb);
    // shadow map
    this.smSize = 2048;
    this.smTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, this.smTex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, this.smSize, this.smSize);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.smFB = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, this.smFB);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.smTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // lines (tank)
    this.lineVAO = gl.createVertexArray(); this.lineVBO = gl.createBuffer();
    this.glassVAO = gl.createVertexArray(); this.glassVBO = gl.createBuffer();
    this.buildTank();
  },
  mkMesh() {
    const gl = this.gl, vao = gl.createVertexArray(), vbo = gl.createBuffer();
    gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    const S = FLOATS * 4;
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, S, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, S, 12);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, S, 24);
    gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 2, gl.FLOAT, false, S, 40);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bindVertexArray(null);
    return { vao, vbo, q: 0, cap: 0 };
  },
  upload(m, buf) {
    const gl = this.gl; gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo);
    const bytes = buf.n * 4;
    if (bytes > m.cap) { m.cap = Math.max(bytes, m.cap * 1.5) | 0; gl.bufferData(gl.ARRAY_BUFFER, m.cap, gl.DYNAMIC_DRAW); }
    if (buf.n) gl.bufferSubData(gl.ARRAY_BUFFER, 0, buf.a, 0, buf.n);
    m.q = buf.quads();
  },
  remeshAll() { for (let i = 0; i < 9; i++) world.dirty.add(i); this.flushDirty(99); },
  flushDirty(max = 3) {
    let k = 0;
    for (const c of world.dirty) {
      world.dirty.delete(c);
      meshChunk(c % 3, (c / 3) | 0, this.scratch, this.wscratch);
      this.upload(this.chunks[c], this.scratch); this.upload(this.wchunks[c], this.wscratch);
      if (++k >= max) break;
    }
  },
  buildTank() {
    const gl = this.gl, e = 0.25, x0 = -e, y0 = -0.05, z0 = -e, x1 = W + e, y1 = H + 0.5, z1 = D + e;
    const P = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
    const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    const L = [];
    for (const [a, b] of E) { for (const p of [P[a], P[b]]) L.push(p[0], p[1], p[2], 0.85, 0.9, 1.0, 0.55); }
    this.lineN = L.length / 7;
    gl.bindVertexArray(this.lineVAO); gl.bindBuffer(gl.ARRAY_BUFFER, this.lineVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(L), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 12);
    const Fc = [[0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7], [4, 5, 6, 7]];
    const G = [];
    for (const f of Fc) {
      for (const k of [0, 1, 2, 0, 2, 3]) { const p = P[f[k]]; const top = p[1] > 1 ? 1 : 0; G.push(p[0], p[1], p[2], 0.75, 0.85, 1.0, top ? 0.03 : 0.1); }
    }
    this.glassN = G.length / 7;
    gl.bindVertexArray(this.glassVAO); gl.bindBuffer(gl.ARRAY_BUFFER, this.glassVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(G), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 12);
    gl.bindVertexArray(null);
  },
  draw(cam, env, lights, dynBuf, dynTBuf) {
    const gl = this.gl, c = this.canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(c.clientWidth * dpr), h = Math.floor(c.clientHeight * dpr);
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    this.upload(this.dyn, dynBuf); this.upload(this.dynT, dynTBuf);
    // shadow pass
    const sd = env.sunDir, ctr = [W / 2, H / 2 - 6, D / 2];
    const sv = M4.lookAt([ctr[0] + sd[0] * 80, ctr[1] + sd[1] * 80, ctr[2] + sd[2] * 80], ctr, Math.abs(sd[1]) > 0.99 ? [0, 0, 1] : [0, 1, 0]);
    const svp = M4.mul(M4.ortho(-42, 42, -42, 42, 1, 170), sv);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.smFB); gl.viewport(0, 0, this.smSize, this.smSize);
    gl.clear(gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
    gl.colorMask(false, false, false, false);
    gl.useProgram(this.shad.p); gl.uniformMatrix4fv(this.shad.u.uVP, false, svp);
    for (const m of this.chunks) if (m.q) { gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES, m.q * 6, gl.UNSIGNED_INT, 0); }
    if (this.dyn.q) { gl.bindVertexArray(this.dyn.vao); gl.drawElements(gl.TRIANGLES, this.dyn.q * 6, gl.UNSIGNED_INT, 0); }
    gl.colorMask(true, true, true, true);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const P = this.main; gl.useProgram(P.p);
    gl.uniformMatrix4fv(P.u.uVP, false, cam.vp); gl.uniformMatrix4fv(P.u.uSVP, false, svp);
    gl.uniform3fv(P.u.uSun, sd); gl.uniform3fv(P.u.uSunCol, env.sunCol); gl.uniform3fv(P.u.uSky, env.sky); gl.uniform3fv(P.u.uGround, env.ground);
    gl.uniform1f(P.u.uNight, env.night); gl.uniform1f(P.u.uSnow, env.snow); gl.uniform1f(P.u.uAutumn, env.autumn);
    gl.uniform1f(P.u.uTime, env.time); gl.uniform1f(P.u.uFlash, env.flash); gl.uniform1f(P.u.uAlpha, 1); gl.uniform1f(P.u.uWater, 0);
    const LA = new Float32Array(128), LC = new Float32Array(96);
    const nl = Math.min(32, lights.length);
    for (let i = 0; i < nl; i++) { const L = lights[i]; LA.set([L[0], L[1], L[2], L[3]], i * 4); LC.set([L[4], L[5], L[6]], i * 3); }
    gl.uniform4fv(P.u.uL, LA); gl.uniform3fv(P.u.uLC, LC); gl.uniform1i(P.u.uNL, nl);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.smTex); gl.uniform1i(P.u.uShadow, 0);
    for (const m of this.chunks) if (m.q) { gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES, m.q * 6, gl.UNSIGNED_INT, 0); }
    for (const m of [this.base, this.dyn]) if (m.q) { gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES, m.q * 6, gl.UNSIGNED_INT, 0); }
    // transparent: water, dynamic transparent
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    gl.uniform1f(P.u.uAlpha, 0.78); gl.uniform1f(P.u.uWater, 1);
    for (const m of this.wchunks) if (m.q) { gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES, m.q * 6, gl.UNSIGNED_INT, 0); }
    gl.uniform1f(P.u.uAlpha, 0.55); gl.uniform1f(P.u.uWater, 0);
    if (this.dynT.q) { gl.disable(gl.CULL_FACE); gl.bindVertexArray(this.dynT.vao); gl.drawElements(gl.TRIANGLES, this.dynT.q * 6, gl.UNSIGNED_INT, 0); gl.enable(gl.CULL_FACE); }
    // glass
    gl.useProgram(this.line.p); gl.uniformMatrix4fv(this.line.u.uVP, false, cam.vp);
    gl.disable(gl.CULL_FACE);
    gl.bindVertexArray(this.glassVAO); gl.drawArrays(gl.TRIANGLES, 0, this.glassN);
    gl.bindVertexArray(this.lineVAO); gl.drawArrays(gl.LINES, 0, this.lineN);
    gl.depthMask(true); gl.disable(gl.BLEND); gl.enable(gl.CULL_FACE);
    gl.bindVertexArray(null);
  },
};

// ===================== camera =====================
const cam = {
  yaw: -0.72, pitch: 0.52, dist: 92, target: [W / 2, 11, D / 2], vp: null, inv: null, eye: [0, 0, 0], auto: false,
  update(aspect) {
    this.pitch = clamp(this.pitch, 0.08, 1.45); this.dist = clamp(this.dist, 18, 170);
    const cp = Math.cos(this.pitch);
    this.eye = [this.target[0] + Math.sin(this.yaw) * cp * this.dist, this.target[1] + Math.sin(this.pitch) * this.dist, this.target[2] + Math.cos(this.yaw) * cp * this.dist];
    const view = M4.lookAt(this.eye, this.target, [0, 1, 0]);
    this.vp = M4.mul(M4.perspective(0.62, aspect, 0.5, 600), view);
    this.inv = M4.invert(this.vp);
  },
  ray(px, py, w, h) {
    const nx = px / w * 2 - 1, ny = 1 - py / h * 2;
    const a = M4.xform(this.inv, nx, ny, -1, 1), b = M4.xform(this.inv, nx, ny, 1, 1);
    const o = [a[0] / a[3], a[1] / a[3], a[2] / a[3]], e = [b[0] / b[3], b[1] / b[3], b[2] / b[3]];
    const d = [e[0] - o[0], e[1] - o[1], e[2] - o[2]], l = Math.hypot(...d);
    return { o, d: [d[0] / l, d[1] / l, d[2] / l] };
  },
};
// voxel raycast; returns {x,y,z,t,n:[..]} hitting first non-air (water included if includeWater)
function raycast(o, d, includeWater = true) {
  // advance ray into box
  let tmin = 0, tmax = 1e9;
  const lo = [0, 0, 0], hi = [W, H, D];
  for (let a = 0; a < 3; a++) {
    if (Math.abs(d[a]) < 1e-9) { if (o[a] < lo[a] || o[a] > hi[a]) return null; continue; }
    let t1 = (lo[a] - o[a]) / d[a], t2 = (hi[a] - o[a]) / d[a]; if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
  }
  if (tmin > tmax) return null;
  const p = [o[0] + d[0] * (tmin + 1e-4), o[1] + d[1] * (tmin + 1e-4), o[2] + d[2] * (tmin + 1e-4)];
  let x = Math.floor(p[0]), y = Math.floor(p[1]), z = Math.floor(p[2]);
  const st = [Math.sign(d[0]), Math.sign(d[1]), Math.sign(d[2])];
  const td = [Math.abs(1 / d[0]), Math.abs(1 / d[1]), Math.abs(1 / d[2])];
  const tm = [0, 1, 2].map(a => { const c = [x, y, z][a]; return st[a] > 0 ? (c + 1 - p[a]) * td[a] : st[a] < 0 ? (p[a] - c) * td[a] : 1e9; });
  let n = [0, 0, 0];
  // entering face normal
  { let best = -1, bv = -1e9; for (let a = 0; a < 3; a++) { const t1 = st[a] ? ((st[a] > 0 ? lo[a] : hi[a]) - o[a]) / d[a] : -1e9; if (t1 > bv) { bv = t1; best = a; } } n[best] = -st[best]; }
  for (let i = 0; i < 300; i++) {
    if (x < 0 || y < 0 || z < 0 || x >= W || y >= H || z >= D) return null;
    const t = world.v[world.idx(x, y, z)];
    if (t !== B.AIR && (includeWater || t !== B.WATER)) return { x, y, z, t, n };
    if (tm[0] < tm[1] && tm[0] < tm[2]) { x += st[0]; tm[0] += td[0]; n = [-st[0], 0, 0]; }
    else if (tm[1] < tm[2]) { y += st[1]; tm[1] += td[1]; n = [0, -st[1], 0]; }
    else { z += st[2]; tm[2] += td[2]; n = [0, 0, -st[2]]; }
  }
  return null;
}
