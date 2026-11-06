// ===================== game definitions =====================
const HOUR_SEC = 3;            // real seconds per game hour at x1
const WALK = 7;                // tiles per game hour
const ERAS = ['Camp', 'Village', 'Town'];
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
const RES = ['food', 'wood', 'stone', 'ore', 'favor'];
const RES_COL = { food: [0.85, 0.35, 0.25], wood: [0.55, 0.36, 0.18], stone: [0.6, 0.62, 0.68], ore: [0.75, 0.55, 0.3], favor: [1, 0.85, 0.4] };

function T(list) { return list; }
const BDEF = {
  campfire: { name: 'Campfire', w: 3, d: 3, cost: {}, era: 0, hours: 0, drop: true, hidden: true, desc: 'The heart of your people. Resources are brought here.',
    tmpl() { const c = []; for (const [x, z] of [[0, 1], [2, 1], [1, 0], [1, 2]]) c.push([x, 0, z, B.STONE]); c.push([1, 0, 1, B.LANTERN]); return c; } },
  tent: { name: 'Tent', w: 3, d: 3, cost: { wood: 10 }, era: 0, hours: 3, house: 2, desc: 'Simple shelter for 2 villagers.',
    tmpl() { const c = []; for (let z = 0; z < 3; z++) { c.push([0, 0, z, B.CLOTH], [2, 0, z, B.CLOTH], [1, 1, z, B.CLOTH3]); } c.push([1, 0, 0, B.CLOTH]); return c; } },
  lumber: { name: 'Lumber Camp', w: 3, d: 3, cost: { wood: 15 }, era: 0, hours: 4, jobs: 2, desc: '2 woodcutters fell nearby trees. Trees slowly regrow — or don’t, if you clear them all.',
    tmpl() { const c = []; for (const [x, z] of [[0, 0], [2, 0], [0, 2], [2, 2]]) c.push([x, 0, z, B.LOG], [x, 1, z, B.LOG]);
      for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) c.push([x, 2, z, B.PLANK]); c.push([1, 0, 0, B.LOG], [1, 0, 1, B.LOG]); return c; } },
  dock: { name: 'Fishing Dock', w: 2, d: 2, cost: { wood: 20 }, era: 0, hours: 4, jobs: 2, desc: '2 fishers catch food. Must touch the lake. Ice in winter halves the catch.',
    tmpl() { return [[0, -1, 0, B.PLANK], [1, -1, 0, B.PLANK], [0, -1, 1, B.PLANK], [1, -1, 1, B.PLANK], [0, 0, 0, B.LOG], [0, 1, 0, B.LOG], [0, 2, 0, B.LANTERN], [1, 0, 1, B.PLANK]]; } },
  cottage: { name: 'Cottage', w: 4, d: 4, cost: { wood: 35 }, era: 1, hours: 8, house: 4, desc: 'A warm home for 4 villagers.',
    tmpl() { const c = [];
      for (let y = 0; y < 2; y++) for (let x = 0; x < 4; x++) for (let z = 0; z < 4; z++) {
        if (x > 0 && x < 3 && z > 0 && z < 3) continue;
        const corner = (x === 0 || x === 3) && (z === 0 || z === 3);
        let t = corner ? B.LOG : B.PLANK;
        if (y === 1 && !corner && ((x === 2 && z === 3) || (x === 0 && z === 1) || (x === 3 && z === 2) || (x === 1 && z === 0))) t = B.WINDOW;
        if (x === 1 && z === 3) t = B.DARK;
        c.push([x, y, z, t]);
      }
      for (let x = 0; x < 4; x++) for (let z = 0; z < 4; z++) c.push([x, 2, z, B.ROOF]);
      for (let x = 0; x < 4; x++) for (let z = 1; z < 3; z++) c.push([x, 3, z, B.ROOF]);
      c.push([3, 3, 0, B.BRICK], [3, 4, 0, B.BRICK]); return c; } },
  farm: { name: 'Farm', w: 5, d: 5, cost: { wood: 20 }, era: 1, hours: 3, jobs: 2, walk: true, desc: '2 farmers grow crops. Big harvests, but nothing grows in winter and floods ruin fields.',
    tmpl() { const c = []; for (let x = 0; x < 5; x++) for (let z = 0; z < 5; z++) c.push([x, -1, z, B.SOIL]);
      for (const [x, z] of [[0, 0], [4, 0], [0, 4], [4, 4]]) c.push([x, 0, z, B.LOG]); return c; } },
  quarry: { name: 'Quarry', w: 3, d: 3, cost: { wood: 25 }, era: 1, hours: 4, jobs: 2, desc: '2 quarrymen dig the land nearby for stone (and ore). They reshape the terrain — watch the lake!',
    tmpl() { return [[0, 0, 0, B.STONE], [1, 0, 0, B.STONE], [0, 1, 0, B.STONE], [0, 0, 1, B.STONE], [2, 0, 2, B.LOG], [2, 1, 2, B.LOG], [2, 2, 2, B.LOG], [1, 2, 2, B.PLANK], [0, 2, 2, B.PLANK]]; } },
  storehouse: { name: 'Storehouse', w: 3, d: 3, cost: { wood: 40 }, era: 1, hours: 6, drop: true, desc: 'Holds +150 of each resource and gives workers a closer drop-off point.',
    tmpl() { const c = []; for (let y = 0; y < 2; y++) for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) {
        if (x === 1 && z === 1) continue; c.push([x, y, z, (x === 1 && z === 2) ? B.DARK : ((x + z) % 2 ? B.PLANK : B.LOG)]); }
      for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) c.push([x, 2, z, B.PLANK]); for (let x = 0; x < 3; x++) c.push([x, 3, 1, B.PLANK]); return c; } },
  well: { name: 'Well', w: 3, d: 3, cost: { wood: 10, stone: 15 }, era: 1, hours: 3, desc: 'Villagers form bucket brigades and douse fires within 9 tiles. Small mood boost.',
    tmpl() { const c = []; for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) c.push([x, 0, z, (x === 1 && z === 1) ? B.DARK : B.BRICK]);
      for (const [x, z] of [[0, 0], [2, 0], [0, 2], [2, 2]]) c.push([x, 1, z, B.LOG]);
      for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) c.push([x, 2, z, B.ROOF]); c.push([1, 3, 1, B.ROOF]); return c; } },
  shrine: { name: 'Shrine', w: 3, d: 3, cost: { wood: 20, stone: 25 }, era: 1, hours: 5, jobs: 1, desc: 'A priest generates Favor. Raises mood of nearby homes.',
    tmpl() { const c = []; for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) c.push([x, 0, z, B.BRICK]);
      for (const [x, z] of [[0, 0], [2, 0], [0, 2], [2, 2]]) c.push([x, 1, z, B.BRICK]); c.push([1, 1, 1, B.LANTERN]);
      for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) c.push([x, 2, z, (x === 1 && z === 1) ? B.GOLD : B.SLATE]); c.push([1, 3, 1, B.GOLD]); return c; } },
  stonehouse: { name: 'Stone House', w: 4, d: 4, cost: { wood: 20, stone: 50 }, era: 2, hours: 10, house: 6, desc: 'Sturdy home for 6. Stone doesn’t burn (but the roof does).',
    tmpl() { const c = [];
      for (let y = 0; y < 3; y++) for (let x = 0; x < 4; x++) for (let z = 0; z < 4; z++) {
        if (x > 0 && x < 3 && z > 0 && z < 3) continue;
        let t = B.BRICK; const corner = (x === 0 || x === 3) && (z === 0 || z === 3);
        if (y === 1 && !corner && (x + z) % 2 === 0) t = B.WINDOW; if (x === 1 && z === 3 && y < 2) t = B.DARK;
        c.push([x, y, z, t]);
      }
      for (let x = 0; x < 4; x++) for (let z = 0; z < 4; z++) c.push([x, 3, z, B.ROOF]);
      for (let x = 0; x < 4; x++) for (let z = 1; z < 3; z++) c.push([x, 4, z, B.ROOF]);
      c.push([0, 4, 0, B.BRICK], [0, 5, 0, B.BRICK]); return c; } },
  mine: { name: 'Mine', w: 3, d: 3, cost: { wood: 40, stone: 30 }, era: 2, hours: 8, jobs: 2, desc: '2 miners dig deep for ore. Must be built on rock or high ground.',
    tmpl() { const c = []; for (let x = 0; x < 3; x++) for (let z = 0; z < 2; z++) for (let y = 0; y < 3; y++) c.push([x, y, z, B.STONE]);
      c.push([0, 0, 2, B.LOG], [2, 0, 2, B.LOG], [0, 1, 2, B.LOG], [2, 1, 2, B.LOG], [1, 0, 2, B.DARK], [1, 1, 2, B.DARK], [0, 2, 2, B.LANTERN], [1, 2, 2, B.LOG], [2, 2, 2, B.LOG]); return c; } },
  market: { name: 'Market', w: 4, d: 4, cost: { wood: 60, stone: 40 }, era: 2, hours: 10, desc: 'A lively market. Big mood boost for nearby homes.',
    tmpl() { const c = []; for (const [x, z] of [[0, 0], [3, 0], [0, 3], [3, 3]]) c.push([x, 0, z, B.LOG], [x, 1, z, B.LOG]);
      for (let x = 0; x < 4; x++) for (let z = 0; z < 4; z++) c.push([x, 2, z, x % 2 ? B.CLOTH3 : B.CLOTH]);
      c.push([1, 0, 1, B.PLANK], [2, 0, 1, B.PLANK], [1, 0, 2, B.CLOTH2], [2, 0, 2, B.PLANK]); return c; } },
  temple: { name: 'Temple', w: 4, d: 4, cost: { wood: 50, stone: 100 }, era: 2, hours: 14, jobs: 2, desc: '2 priests generate lots of Favor. Large mood boost.',
    tmpl() { const c = []; for (let x = 0; x < 4; x++) for (let z = 0; z < 4; z++) c.push([x, 0, z, B.BRICK]);
      for (let y = 1; y < 4; y++) for (const [x, z] of [[0, 0], [3, 0], [0, 3], [3, 3]]) c.push([x, y, z, B.BRICK]);
      c.push([1, 1, 1, B.GOLD], [2, 1, 1, B.LANTERN], [1, 1, 2, B.LANTERN], [2, 1, 2, B.GOLD]);
      for (let x = 0; x < 4; x++) for (let z = 0; z < 4; z++) c.push([x, 4, z, B.SLATE]);
      for (let x = 1; x < 3; x++) for (let z = 1; z < 3; z++) c.push([x, 5, z, B.SLATE], [x, 6, z, B.GOLD]); return c; } },
  tower: { name: 'Great Tower', w: 4, d: 4, cost: { wood: 150, stone: 250, ore: 40, favor: 30 }, era: 2, hours: 44, wonder: true,
    desc: 'A tower to the lid of the world. Complete it to win. You\u2019ll need a Storehouse to hold enough stone.',
    tmpl(base) { const c = []; const top = H - 2 - base;
      for (let y = 0; y < top; y++) for (let x = 0; x < 4; x++) for (let z = 0; z < 4; z++) {
        if (x > 0 && x < 3 && z > 0 && z < 3) continue;
        const corner = (x === 0 || x === 3) && (z === 0 || z === 3);
        let t = (y % 6 === 5) ? B.SLATE : B.BRICK;
        if (!corner && y % 3 === 1 && y > 0) t = B.WINDOW;
        if (x === 1 && z === 3 && y < 2) t = B.DARK;
        if (y >= top - 2 && corner) t = B.GOLD;
        c.push([x, y, z, t]);
      }
      c.push([1, top - 1, 1, B.LANTERN], [2, top - 1, 2, B.LANTERN]); return c; } },
};
const BUILD_ORDER = ['tent', 'lumber', 'dock', 'cottage', 'farm', 'quarry', 'storehouse', 'well', 'shrine', 'stonehouse', 'mine', 'market', 'temple', 'tower'];
const POWERS = {
  rain: { name: 'Rain Cloud', favor: 6, desc: 'Summon rain over an area for 3 hours. Puts out fires and makes crops grow faster.' },
  bolt: { name: 'Lightning', favor: 8, desc: 'Strike the land. Blasts blocks and starts fires. Terrifies anyone nearby.' },
  bless: { name: 'Blessing', favor: 10, desc: 'Lift the spirits of villagers in a wide area for several days.' },
  raise: { name: 'Raise Land', favor: 1, desc: 'Add earth (1 Favor per block). Build dikes against floods or firebreaks. Hold to paint.' },
  lower: { name: 'Lower Land', favor: 1, desc: 'Remove the top block (1 Favor each). Dig channels to drain water. Hold to paint.' },
};
const ERA_REQ = [
  { to: 'Village', pop: 8, res: { wood: 40, food: 30 }, bld: { lumber: 1, dock: 1 } },
  { to: 'Town', pop: 18, res: { wood: 120, stone: 80 }, bld: { farm: 2, shrine: 1 } },
];
const NAMES = ['Ada', 'Bram', 'Cora', 'Dov', 'Edda', 'Finn', 'Greta', 'Hal', 'Ines', 'Jory', 'Kesh', 'Lena', 'Milo', 'Nell', 'Oswin', 'Pia', 'Quill', 'Rosa',
  'Sven', 'Tilda', 'Ulf', 'Vera', 'Wren', 'Yara', 'Zeb', 'Alba', 'Bo', 'Cass', 'Dag', 'Elin', 'Fern', 'Gus', 'Hild', 'Ivo', 'Juna', 'Kit', 'Lark', 'Moss',
  'Nils', 'Orla', 'Pell', 'Rhea', 'Sage', 'Tove', 'Una', 'Vik', 'Wynn', 'Ash', 'Bea', 'Cole', 'Dina', 'Ezra', 'Faye', 'Gil', 'Hana', 'Iris', 'Jem', 'Kai'];
const JOB_NAME = { lumber: 'Woodcutter', dock: 'Fisher', farm: 'Farmer', quarry: 'Quarryman', mine: 'Miner', shrine: 'Priest', temple: 'Priest', build: 'Builder' };
const JOB_COL = { lumber: [0.25, 0.5, 0.25], dock: [0.2, 0.4, 0.75], farm: [0.85, 0.7, 0.25], quarry: [0.55, 0.55, 0.6], mine: [0.35, 0.3, 0.3],
  shrine: [0.92, 0.92, 0.9], temple: [0.92, 0.92, 0.9], build: [0.9, 0.5, 0.15], none: [0.62, 0.42, 0.3] };

// ===================== state =====================
let G;
const bmap = new Int16Array(W * D); // building id+1 per column
function buildingAt(x, z) { if (x < 0 || z < 0 || x >= W || z >= D) return null; const id = bmap[x + z * W]; return id ? G.bmap.get(id - 1) : null; }
const walkH = new Int16Array(W * D), walkOK = new Uint8Array(W * D);

function newGame(seed) {
  G = { t: 6, speed: 1, paused: false, res: { food: 40, wood: 40, stone: 0, ore: 0, favor: 25 }, era: 0, vill: [], blds: [], bmap: new Map(), nextB: 0, nextV: 0,
    log: [], rain: null, clouds: [], storm: null, grief: 0, lowMoodH: 0, over: null, stats: { peak: 0, built: 0, deaths: 0, born: 0 }, nameI: 0,
    waterActive: new Set(), saplings: [], fireAcc: 0, waterAcc: 0, particles: [], bolts: [], flash: 0, seed, eraReady: false, season: 0, frozen: false, lastWarn: -99, dayWeather: null };
  bmap.fill(0);
  genValley(seed);
  for (let i = 0; i < W * D; i++) colDirty.add(i);
  updateWalk(); labelComponents();
  const cf = placeBuilding('campfire', 20, 19, true); cf.done = true; finishBuilding(cf, true);
  let tents = 0;
  for (const [x, z] of [[16, 16], [24, 16], [16, 20], [25, 20], [20, 15], [15, 24], [26, 24], [12, 18], [28, 17]]) { if (tents >= 2) break; const tb = placeBuilding('tent', x, z, true); if (tb) { finishBuilding(tb, true); tents++; } }
  for (let i = 0; i < 6; i++) spawnVillager(21 + (i % 3) - 1 + 0.5, 23 + (i / 3 | 0) + 0.5);
  assignHomes(); assignJobs();
  addLog('Your people arrive in the valley. Build shelter and find food before winter.', 'good');
  addLog('Tip: build a Fishing Dock on the lakeshore and a Lumber Camp near the trees.');
}

function addLog(msg, kind = '') { G.log.unshift({ msg, kind, t: G.t }); if (G.log.length > 40) G.log.pop(); if (typeof UI !== 'undefined') UI.logDirty = true; }
const hourOf = () => G.t % 24, dayOf = () => Math.floor(G.t / 24);
const seasonOf = () => Math.floor(dayOf() / 3) % 4;
const isNight = () => { const h = hourOf(); return h >= 21 || h < 6; };

// ===================== walk grid & pathfinding =====================
const TREEISH = t => t === B.LOG || t === B.LEAVES || t === B.PINE;
function groundTop(x, z) { for (let y = H - 1; y >= 0; y--) { const t = world.v[world.idx(x, y, z)]; if (t === B.AIR || TREEISH(t) || isCrop(t)) continue; return y; } return -1; }
function updateWalkCol(x, z) {
  const i = x + z * W;
  let y = H - 1, t = 0;
  for (; y >= 0; y--) { t = world.v[world.idx(x, y, z)]; if (t !== B.AIR && !isCrop(t) && t !== B.LEAVES && t !== B.PINE) break; }
  walkH[i] = y + 1;
  const b = buildingAt(x, z);
  let ok = y >= 0 && t !== B.WATER && t !== B.LOG && !world.burning.has(world.idx(x, y, z));
  if (b && !(BDEF[b.type].walk && b.done)) ok = false;
  const above = world.get(x, y + 1, z);
  if (ok && (above === B.WATER || above === B.LOG)) ok = false;
  walkOK[i] = ok ? 1 : 0;
}
const comp = new Int32Array(W * D); let mainComp = 1;
function labelComponents() {
  comp.fill(0); let label = 0, bestN = 0; const q = new Int32Array(W * D);
  for (let s0 = 0; s0 < W * D; s0++) {
    if (!walkOK[s0] || comp[s0]) continue;
    label++; let qh = 0, qt = 0; q[qt++] = s0; comp[s0] = label; let n = 0;
    while (qh < qt) { const c = q[qh++]; n++; const x = c % W, z = (c / W) | 0, h = walkH[c];
      if (x > 0) { const m = c - 1; if (walkOK[m] && !comp[m] && Math.abs(walkH[m] - h) <= 1) { comp[m] = label; q[qt++] = m; } }
      if (x < W - 1) { const m = c + 1; if (walkOK[m] && !comp[m] && Math.abs(walkH[m] - h) <= 1) { comp[m] = label; q[qt++] = m; } }
      if (z > 0) { const m = c - W; if (walkOK[m] && !comp[m] && Math.abs(walkH[m] - h) <= 1) { comp[m] = label; q[qt++] = m; } }
      if (z < D - 1) { const m = c + W; if (walkOK[m] && !comp[m] && Math.abs(walkH[m] - h) <= 1) { comp[m] = label; q[qt++] = m; } }
    }
    if (n > bestN) { bestN = n; mainComp = label; }
  }
}
const inMain = (x, z) => x >= 0 && z >= 0 && x < W && z < D && walkOK[x + z * W] === 1 && comp[x + z * W] === mainComp;
function updateWalk() { if (!colDirty.size) return; for (const c of colDirty) updateWalkCol(c % W, (c / W) | 0); colDirty.clear(); labelComponents(); if (G) for (const b of G.blds) if (b.entry && !inMain(b.entry[0], b.entry[1])) computeEntry(b); }
const walkable = (x, z) => x >= 0 && z >= 0 && x < W && z < D && walkOK[x + z * W] === 1;

function astar(sx, sz, goals) { // goals: array of [x,z]; returns path of [x,z] (excluding start) or null
  if (!goals.length) return null;
  const goalSet = new Set(goals.map(g => g[0] + g[1] * W));
  const start = sx + sz * W;
  if (goalSet.has(start)) return [];
  const hx = goals.reduce((a, g) => a + g[0], 0) / goals.length, hz = goals.reduce((a, g) => a + g[1], 0) / goals.length;
  const gS = new Float32Array(W * D).fill(1e9), from = new Int32Array(W * D).fill(-1), closed = new Uint8Array(W * D);
  const heap = []; const push = (f, n) => { heap.push([f, n]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0]; const last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = i * 2 + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  gS[start] = 0; push(0, start);
  const dirs = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.41], [1, -1, 1.41], [-1, 1, 1.41], [-1, -1, 1.41]];
  let it = 0;
  while (heap.length && it++ < 4000) {
    const [, n] = pop(); if (closed[n]) continue; closed[n] = 1;
    if (goalSet.has(n)) { const p = []; let c = n; while (c !== start) { p.push([c % W, (c / W) | 0]); c = from[c]; } return p.reverse(); }
    const x = n % W, z = (n / W) | 0, h = walkH[n];
    for (const [dx, dz, cost] of dirs) {
      const nx = x + dx, nz = z + dz; if (nx < 0 || nz < 0 || nx >= W || nz >= D) continue;
      const m = nx + nz * W;
      if (closed[m]) continue;
      const isGoal = goalSet.has(m);
      if (!walkOK[m] && !isGoal) continue;
      if (Math.abs(walkH[m] - h) > 1) continue;
      if (dx && dz && (!walkable(x + dx, z) || !walkable(x, z + dz))) continue;
      const g = gS[n] + cost + Math.abs(walkH[m] - h) * 0.5;
      if (g < gS[m]) { gS[m] = g; from[m] = n; push(g + Math.hypot(nx - hx, nz - hz) * 0.9, m); }
    }
  }
  return null;
}
function ringCells(x0, z0, w, d, r = 1) { const c = []; for (let z = z0 - r; z < z0 + d + r; z++) for (let x = x0 - r; x < x0 + w + r; x++) { if (x >= x0 && x < x0 + w && z >= z0 && z < z0 + d) continue; if (walkable(x, z)) c.push([x, z]); } return c; }

// ===================== buildings =====================
function footprintInfo(type, x0, z0) {
  const def = BDEF[type]; let mn = 99, mx = -1, sum = 0, bad = null, waterNear = false; const hs = [];
  if (x0 < 0 || z0 < 0 || x0 + def.w > W || z0 + def.d > D) return { bad: 'Out of bounds' };
  for (let z = z0; z < z0 + def.d; z++) for (let x = x0; x < x0 + def.w; x++) {
    if (buildingAt(x, z)) { bad = 'Something is already built here'; continue; }
    const eb = G.blds.find(o => o.entry && o.entry[0] === x && o.entry[1] === z && o.type !== 'farm');
    if (eb) { bad = `That would block the door of the ${BDEF[eb.type].name}`; continue; }
    const gt = groundTop(x, z); const t = world.get(x, gt, z);
    if (t === B.WATER || t === B.ICE) { bad = 'Can’t build on water'; }
    if (world.get(x, gt + 1, z) === B.WATER) bad = 'Can’t build on water';
    hs.push(gt); mn = Math.min(mn, gt); mx = Math.max(mx, gt); sum += gt;
  }
  if (bad) return { bad };
  if (mx - mn > (type === 'tower' ? 1 : 2)) return { bad: 'Ground is too steep — flatten it with Raise/Lower Land' };
  hs.sort((a, b) => a - b);
  const base = hs[hs.length >> 1] + 1;
  if (type === 'dock') {
    for (let z = z0 - 2; z < z0 + def.d + 2; z++) for (let x = x0 - 2; x < x0 + def.w + 2; x++) { const tp = world.topAny(clamp(x, 0, W - 1), clamp(z, 0, D - 1)); if (world.get(clamp(x, 0, W - 1), tp, clamp(z, 0, D - 1)) === B.WATER || world.get(clamp(x, 0, W - 1), tp, clamp(z, 0, D - 1)) === B.ICE) waterNear = true; }
    if (!waterNear) return { bad: 'Docks must be built at the water’s edge' };
  }
  if (type === 'mine') {
    const cx = x0 + 1, cz = z0 + 1, t = world.get(cx, groundTop(cx, cz), cz);
    if (!(t === B.STONE || t === B.ORE || base >= 19)) return { bad: 'Mines need rocky or high ground (try the mountain)' };
  }
  const top = def.tmpl(base).reduce((m, c) => Math.max(m, c[1]), 0);
  if (base + top >= H - 1) return { bad: 'Too high — it would hit the lid' };
  if (G && G.blds.length && !def.walk) { // don't let a building cut the village apart
    const saved = []; for (let z = z0; z < z0 + def.d; z++) for (let x = x0; x < x0 + def.w; x++) { saved.push(walkOK[x + z * W]); walkOK[x + z * W] = 0; }
    labelComponents();
    let ok = true, who = null;
    for (const o of G.blds) { if (!o.entry || BDEF[o.type].walk) continue; if (!inMain(o.entry[0], o.entry[1]) && !ringCells(o.x, o.z, o.w, o.d, 1).some(c => inMain(c[0], c[1]))) { ok = false; who = o; break; } }
    const reach = ringCells(x0, z0, def.w, def.d, 1).some(c => inMain(c[0], c[1]));
    let k = 0; for (let z = z0; z < z0 + def.d; z++) for (let x = x0; x < x0 + def.w; x++) walkOK[x + z * W] = saved[k++];
    labelComponents();
    if (!ok) return { bad: `That would cut off the ${BDEF[who.type].name} — villagers couldn\u2019t reach it` };
    if (!reach) return { bad: 'Villagers couldn\u2019t reach this spot' };
  }
  return { base };
}
function storeCap(k) { return k === 'favor' ? 1e9 : 150 + 150 * count('storehouse'); }
function canAfford(cost) { for (const k in cost) if ((G.res[k] || 0) < cost[k]) return false; return true; }
function pay(cost, sign = -1) { for (const k in cost) G.res[k] += sign * cost[k]; }
function chopTreeAt(x, y, z) { // flood-remove connected log/leaves; returns logs count
  const stack = [[x, y, z]]; let logs = 0, n = 0; const seen = new Set();
  while (stack.length && n < 260) {
    const [a, b, c] = stack.pop(); const i = world.idx(a, b, c); if (seen.has(i)) continue; seen.add(i);
    const t = world.get(a, b, c); if (!TREEISH(t)) continue;
    if (Math.abs(a - x) > 3 || Math.abs(c - z) > 3) continue;
    if (world.owner[i]) continue;
    world.set(a, b, c, B.AIR); n++; if (t === B.LOG) logs++;
    for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) stack.push([a + dx, b + dy, c + dz]);
  }
  return logs;
}
function placeBuilding(type, x0, z0, free = false) {
  const def = BDEF[type]; const info = footprintInfo(type, x0, z0);
  if (info.bad) return null;
  const base = info.base;
  if (!free) pay(def.cost);
  const b = { id: G.nextB++, type, x: x0, z: z0, w: def.w, d: def.d, base, cells: [], placed: 0, progress: 0, done: false, health: 1, workers: [], residents: [],
    entry: null, crops: null, tend: -99, paused: false, bornT: G.t, lost: 0 };
  G.blds.push(b); G.bmap.set(b.id, b);
  // clear trees and level ground
  for (let z = z0 - 1; z < z0 + def.d + 1; z++) for (let x = x0 - 1; x < x0 + def.w + 1; x++) {
    const inside = x >= x0 && x < x0 + def.w && z >= z0 && z < z0 + def.d;
    if (!world.inb(x, 0, z)) continue;
    for (let y = H - 1; y >= 0; y--) { const t = world.get(x, y, z); if (t === B.LOG && (inside || y >= base)) { const l = chopTreeAt(x, y, z); if (!free) G.res.wood += l; } }
  }
  for (let z = z0; z < z0 + def.d; z++) for (let x = x0; x < x0 + def.w; x++) {
    bmap[x + z * W] = b.id + 1;
    for (let y = base; y < H; y++) { const t = world.get(x, y, z); if (t !== B.AIR) world.set(x, y, z, B.AIR); }
    for (let y = 1; y < base; y++) { const t = world.get(x, y, z); if (t === B.AIR || t === B.WATER || TREEISH(t) || isCrop(t)) world.set(x, y, z, y === base - 1 ? B.GRASS : B.DIRT); }
    colDirty.add(x + z * W);
  }
  let cells = def.tmpl(base).map(([dx, dy, dz, t]) => [x0 + dx, base + dy, z0 + dz, t]);
  if (type === 'dock') { // extend pier over water
    let best = null, bestN = 0;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let n = 0; const ext = [];
      for (let k = 1; k <= 5; k++) for (let s = 0; s < 2; s++) {
        const x = dx > 0 ? x0 + 1 + k : dx < 0 ? x0 - k : x0 + s, z = dz > 0 ? z0 + 1 + k : dz < 0 ? z0 - k : z0 + s;
        if (!world.inb(x, 0, z)) continue; const tp = world.topAny(x, z); const t = world.get(x, tp, z);
        if ((t === B.WATER || t === B.ICE) && tp < base) { n++; ext.push([x, base - 1, z, B.PLANK]); }
      }
      if (n > bestN) { bestN = n; best = ext; }
    }
    if (best) cells = cells.concat(best.slice(0, 8));
  }
  cells.sort((a, b) => a[1] - b[1] || hash3(a[0], 1, a[2]) - hash3(b[0], 1, b[2]));
  b.cells = cells;
  if (type === 'farm') { b.crops = new Float32Array(25).fill(0); }
  updateWalk();
  computeEntry(b);
  for (const o of G.blds) if (o !== b && o.entry && !walkable(o.entry[0], o.entry[1])) computeEntry(o);
  for (const v of G.vill) { const fx = Math.floor(v.x), fz = Math.floor(v.z); if (!v.inside && fx >= x0 && fx < x0 + def.w && fz >= z0 && fz < z0 + def.d) rescue(v); }
  if (!free) { addLog(`Construction of a ${def.name} has begun.`); assignJobs(); }
  return b;
}
function computeEntry(b) {
  const cf = G.blds[0];
  const tx = cf ? cf.x + 1 : W / 2, tz = cf ? cf.z + 3 : D / 2;
  let ring = ringCells(b.x, b.z, b.w, b.d, 1);
  const rm = ring.filter(c => inMain(c[0], c[1])); if (rm.length) ring = rm;
  // prefer front (+z) side
  ring.sort((p, q) => (q[1] >= b.z + b.d ? -3 : 0) + Math.hypot(p[0] - tx, p[1] - tz) * 0.1 - ((p[1] >= b.z + b.d ? -3 : 0) + Math.hypot(q[0] - tx, q[1] - tz) * 0.1));
  b.entry = ring[0] || [clamp(b.x + 1, 0, W - 1), clamp(b.z + b.d, 0, D - 1)];
}
function placeCells(b, upto) {
  while (b.placed < upto && b.placed < b.cells.length) {
    const [x, y, z, t] = b.cells[b.placed++];
    const cur = world.get(x, y, z);
    if (TREEISH(cur)) chopTreeAt(x, y, z);
    world.set(x, y, z, t); world.owner[world.idx(x, y, z)] = b.id + 1;
    if (Math.random() < 0.3) puff(x + 0.5, y + 0.5, z + 0.5, [0.75, 0.68, 0.55], 2);
  }
}
function finishBuilding(b, silent) {
  placeCells(b, b.cells.length); b.done = true; b.progress = BDEF[b.type].hours;
  b.total = b.cells.length;
  for (const v of G.vill) if (v.slot && v.slot.b === b) { v.slot = null; v.q = []; }
  b.workers = [];
  for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) colDirty.add(x + z * W);
  updateWalk(); computeEntry(b);
  if (b.type === 'farm') syncCrops(b);
  if (!silent) {
    G.stats.built++;
    addLog(`${BDEF[b.type].name} completed.`, 'good'); SND.play('complete');
    if (b.type === 'tower') { victory(); }
  }
  assignJobs(); assignHomes();
}
function removeBuilding(b, reason) {
  for (const [x, y, z] of b.cells) { const i = world.idx(x, y, z); if (world.owner[i] === b.id + 1) { const t = world.get(x, y, z); world.set(x, y, z, b.type === 'dock' || t === B.SOIL ? (t === B.SOIL ? B.DIRT : B.AIR) : B.AIR); if (Math.random() < 0.4) puff(x + .5, y + .5, z + .5, [0.4, 0.38, 0.35], 2); } }
  if (b.crops) for (let k = 0; k < 25; k++) { const x = b.x + k % 5, z = b.z + ((k / 5) | 0); if (isCrop(world.get(x, b.base, z))) world.set(x, b.base, z, B.AIR); }
  for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) { bmap[x + z * W] = 0; colDirty.add(x + z * W); }
  G.blds.splice(G.blds.indexOf(b), 1); G.bmap.delete(b.id);
  for (const v of G.vill) { if (v.home === b) { v.home = null; if (v.inside) exitHome(v); } if (v.slot && v.slot.b === b) { v.slot = null; v.q = []; } if (v.target && v.target.b === b) v.q = []; }
  updateWalk(); for (const o of G.blds) computeEntry(o); assignHomes(); assignJobs();
  if (reason) addLog(reason, 'bad');
}
function demolish(b) {
  if (b.type === 'campfire') return;
  const def = BDEF[b.type]; const refund = {};
  const f = b.done ? 0.5 : 1;
  for (const k in def.cost) refund[k] = Math.floor(def.cost[k] * f);
  pay(refund, 1);
  removeBuilding(b);
  addLog(`${def.name} demolished.`);
}
function syncCrops(b) {
  for (let k = 0; k < 25; k++) {
    const dx = k % 5, dz = (k / 5) | 0; if ((dx === 0 || dx === 4) && (dz === 0 || dz === 4)) continue;
    const x = b.x + dx, z = b.z + dz, y = b.base; const cur = world.get(x, y, z);
    if (cur === B.WATER) { b.crops[k] = 0; continue; }
    if (world.get(x, y - 1, z) !== B.SOIL) continue;
    const s = b.crops[k]; const want = s < 0.05 ? B.AIR : s < 1.5 ? B.CROP : s < 3 ? B.CROP2 : B.CROP3;
    if (cur !== want && (cur === B.AIR || isCrop(cur))) world.set(x, y, z, want);
  }
}

// ===================== villagers =====================
function spawnVillager(x, z) {
  const name = NAMES[G.nameI++ % NAMES.length] + (G.nameI > NAMES.length ? ' ' + 'II III IV V'.split(' ')[Math.min(3, (G.nameI / NAMES.length | 0) - 1)] : '');
  const v = { id: G.nextV++, name, x, z, y: walkH[clamp(x | 0, 0, W - 1) + clamp(z | 0, 0, D - 1) * W], q: [], path: null, slot: null, home: null, carry: null,
    mood: 60, missed: 0, health: 100, bless: 0, fear: 0, inside: false, anim: Math.random() * 10, work: 0, hue: Math.random(), skin: Math.random(), act: 'Idle', target: null };
  G.vill.push(v); G.stats.peak = Math.max(G.stats.peak, G.vill.length);
  return v;
}
function killVillager(v, why) {
  G.vill.splice(G.vill.indexOf(v), 1);
  G.grief += 10; G.stats.deaths++;
  addLog(`${v.name} ${why}.`, 'bad'); SND.play('death');
  if (UI.sel && UI.sel.v === v) UI.sel = null;
  assignHomes(); assignJobs();
}
function assignHomes() {
  const houses = G.blds.filter(b => b.done && BDEF[b.type].house);
  for (const b of houses) b.residents = b.residents.filter(v => G.vill.includes(v) && v.home === b);
  for (const v of G.vill) {
    if (v.home && G.blds.includes(v.home)) continue;
    v.home = null;
    let best = null, bd = 1e9;
    for (const b of houses) { if (b.residents.length >= BDEF[b.type].house) continue; const d = Math.hypot(b.x - v.x, b.z - v.z); if (d < bd) { bd = d; best = b; } }
    if (best) { v.home = best; best.residents.push(v); }
  }
}
function housingCap() { return G.blds.reduce((s, b) => s + (b.done && BDEF[b.type].house ? BDEF[b.type].house : 0), 0); }
function count(type, done = true) { return G.blds.filter(b => b.type === type && (!done || b.done)).length; }

function assignJobs() {
  if (!G) return;
  const pop = G.vill.length;
  const slots = [];
  const foodLow = G.res.food < pop * 3;
  let builderCap = Math.max(2, Math.ceil(pop * 0.45));
  for (const b of G.blds) {
    if (b.paused) continue;
    if (!b.done && BDEF[b.type].hours) { const n = b.type === 'tower' ? 5 : 3; for (let k = 0; k < n; k++) slots.push({ b, k, kind: 'build', pr: 3 - k * 0.3 - b.bornT * 1e-4 }); }
    else if (b.done && BDEF[b.type].jobs) {
      const out = { lumber: 'wood', dock: 'food', farm: 'food', quarry: 'stone', mine: 'ore' }[b.type];
      for (let k = 0; k < BDEF[b.type].jobs; k++) {
        let pr = 1.2 - k * 0.2;
        if (out) {
          const target = { food: Math.max(40, pop * 6), wood: 90, stone: 90, ore: 40 }[out];
          pr = 1 + 2 * (1 - Math.min(1, G.res[out] / target)) - k * 0.2;
          if (G.res[out] >= storeCap(out)) pr = 0.15;
          if (out === 'food' && foodLow) pr = 3.5 - k * 0.2;
        }
        if (b.type === 'farm' && seasonOf() === 3) pr = 0.1;
        slots.push({ b, k, kind: b.type, pr });
      }
    }
  }
  slots.sort((a, b) => b.pr - a.pr);
  const active = []; let nb = 0;
  for (const s of slots) { if (active.length >= pop) break; if (s.kind === 'build') { if (nb >= builderCap) continue; nb++; } active.push(s); }
  const key = s => s.b.id + ':' + s.k + ':' + s.kind;
  const keys = new Set(active.map(key));
  const taken = new Set();
  for (const v of G.vill) { if (v.slot && keys.has(key(v.slot)) && !taken.has(key(v.slot))) taken.add(key(v.slot)); else if (v.slot) { v.slot = null; v.q = []; v.carry && v.q.push({ k: 'deliver' }); } }
  for (const s of active) {
    if (taken.has(key(s))) continue;
    let best = null, bd = 1e9;
    for (const v of G.vill) { if (v.slot) continue; const d = Math.hypot(v.x - s.b.x, v.z - s.b.z); if (d < bd) { bd = d; best = v; } }
    if (!best) break;
    best.slot = s; taken.add(key(s)); best.q = best.carry ? [{ k: 'deliver' }] : [];
  }
  for (const b of G.blds) b.workers = G.vill.filter(v => v.slot && v.slot.b === b);
}
function dropoffs() { return G.blds.filter(b => b.done && BDEF[b.type].drop); }
function nearestDrop(v) { let best = null, bd = 1e9; for (const b of dropoffs()) { const d = Math.hypot(b.x + 1 - v.x, b.z + 1 - v.z); if (d < bd) { bd = d; best = b; } } return best; }
function moodMult(v) { return 0.55 + 0.65 * v.mood / 100; }

function findTree(cx, cz, r, v) {
  let best = null, bd = 1e9;
  for (let z = Math.max(0, cz - r); z < Math.min(D, cz + r); z++) for (let x = Math.max(0, cx - r); x < Math.min(W, cx + r); x++) {
    const gt = groundTop(x, z); if (gt < 0 || world.get(x, gt + 1, z) !== B.LOG || buildingAt(x, z) || world.owner[world.idx(x, gt + 1, z)]) continue;
    if (G.vill.some(o => o !== v && o.target && o.target.tree && o.target.tree[0] === x && o.target.tree[1] === z)) continue;
    if (!(inMain(x + 1, z) || inMain(x - 1, z) || inMain(x, z + 1) || inMain(x, z - 1))) continue;
    const d = Math.hypot(x - cx, z - cz) + Math.hypot(x - v.x, z - v.z) * 0.3; if (d < bd) { bd = d; best = [x, z, gt + 1]; }
  }
  return best;
}
function plantSapling(x, z) {
  if (x < 1 || z < 1 || x >= W - 1 || z >= D - 1) return false;
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (buildingAt(x + dx, z + dz)) return false;
  const gt = groundTop(x, z); if (world.get(x, gt, z) !== B.GRASS || world.get(x, gt + 1, z) !== B.AIR) return false;
  if (G.saplings.some(s => Math.abs(s.x - x) < 2 && Math.abs(s.z - z) < 2)) return false;
  world.set(x, gt + 1, z, B.LEAVES); G.saplings.push({ x, z, y: gt + 1, t: G.t + 18 + Math.random() * 8 }); return true;
}
function findSaplingSpot(cx, cz, r) {
  for (let k = 0; k < 30; k++) { const x = Math.round(cx + (Math.random() - 0.5) * 2 * r), z = Math.round(cz + (Math.random() - 0.5) * 2 * r);
    if (x < 1 || z < 1 || x >= W - 1 || z >= D - 1 || !inMain(x, z)) continue; const gt = groundTop(x, z); if (world.get(x, gt, z) !== B.GRASS || world.get(x, gt + 1, z) !== B.AIR) continue;
    let ok = true; for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (buildingAt(x + dx, z + dz)) ok = false; if (ok) return [x, z]; }
  return null;
}
function findDig(b) {
  let best = null, bs = -1e9; const cx = b.x + 1, cz = b.z + 1;
  for (let z = Math.max(0, cz - 6); z <= Math.min(D - 1, cz + 6); z++) for (let x = Math.max(0, cx - 6); x <= Math.min(W - 1, cx + 6); x++) {
    if (buildingAt(x, z)) continue; let near = false; for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { const o = buildingAt(x + dx, z + dz); if (o && o !== b) near = true; } if (near) continue;
    const y = world.top(x, z); if (y <= 2) continue; const t = world.get(x, y, z); if (world.get(x, y + 1, z) !== B.AIR) continue;
    if (TREEISH(t) || t === B.WATER || t === B.ICE || world.owner[world.idx(x, y, z)]) continue;
    const score = y * 2 + (t === B.STONE ? 3 : t === B.ORE ? 6 : 0) - Math.hypot(x - cx, z - cz) * 0.6 + hash3(x, y, z);
    if (score > bs) { bs = score; best = [x, y, z]; }
  }
  return best;
}
function walkTo(v, goals, then) { v.q.unshift({ k: 'walk', goals }); }
function decide(v) {
  const h = hourOf();
  v.target = null;
  if (v.carry) { const d = nearestDrop(v); if (d) { v.q.push({ k: 'walk', goals: [d.entry], act: 'Hauling ' + v.carry.type }, { k: 'drop' }); return; } }
  if (isNight()) {
    if (v.home) { v.q.push({ k: 'walk', goals: [v.home.entry], act: 'Going home' }, { k: 'enter' }); }
    else { const cf = G.blds[0]; v.q.push({ k: 'walk', goals: ringCells(cf.x, cf.z, 3, 3, 2).slice(0, 12), act: 'Looking for a place to sleep' }, { k: 'sleepout' }); }
    return;
  }
  const s = v.slot;
  if (s) {
    const b = s.b; v.target = { b };
    if (s.kind === 'build') { v.q.push({ k: 'walk', goals: ringCells(b.x, b.z, b.w, b.d, 1), act: 'Walking to build site' }, { k: 'work', h: 1, act: 'Building ' + BDEF[b.type].name, fx: 'hammer', fn: () => buildTick(b, moodMult(v)) }); return; }
    if (s.kind === 'lumber') {
      const tr = findTree(b.x + 1, b.z + 1, 17, v);
      if (!tr) {
        const sp = findSaplingSpot(b.x + 1, b.z + 1, 9);
        if (G.t - (b.warn || -99) > 24) { b.warn = G.t; addLog('A Lumber Camp ran out of trees. Woodcutters are planting saplings.', 'warn'); }
        if (!sp) { v.act = 'No trees nearby!'; v.q.push({ k: 'wait', h: 1.5 }); return; }
        v.q.push({ k: 'walk', goals: [sp], act: 'Planting saplings' }, { k: 'work', h: 1.2, act: 'Planting saplings', fn: () => { let n = 0; for (const [dx, dz] of [[1, 0], [0, 1], [-1, 0], [0, -1], [2, 2], [-2, 2], [2, -2]]) if (n < 3 && plantSapling(sp[0] + dx, sp[1] + dz)) n++; } });
        return;
      }
      v.target = { b, tree: tr };
      v.q.push({ k: 'walk', goals: [[tr[0] + 1, tr[1]], [tr[0] - 1, tr[1]], [tr[0], tr[1] + 1], [tr[0], tr[1] - 1]].filter(c => inMain(c[0], c[1])), act: 'Heading to a tree' },
        { k: 'work', h: 1.6, act: 'Chopping wood', fx: 'chop', fn: () => { const n = chopTreeAt(tr[0], tr[2], tr[1]); if (n) v.carry = { type: 'wood', n: 4 + n * 2 }; if (Math.random() < 0.7) plantSapling(tr[0], tr[1]); } });
      return;
    }
    if (s.kind === 'dock') { v.q.push({ k: 'walk', goals: [b.entry], act: 'Going fishing' }, { k: 'work', h: 2.8, act: G.frozen ? 'Ice fishing' : 'Fishing', fn: () => { const nd = count('dock'); const n = 3 * (G.frozen ? 0.5 : 1) * (nd <= 2 ? 1 : 2 / nd); v.carry = { type: 'food', n: Math.max(1, Math.round(n + Math.random() * 0.6 - 0.3)) }; } }); return; }
    if (s.kind === 'farm') {
      v.q.push({ k: 'walk', goals: [[b.x + 1 + (Math.random() * 3 | 0), b.z + 1 + (Math.random() * 3 | 0)]], act: 'Tending crops' },
        { k: 'work', h: 1.2, act: 'Tending crops', fn: () => { b.tend = G.t; let n = 0; for (let k = 0; k < 25 && n < 6; k++) if (b.crops[k] >= 3) { b.crops[k] = 0.01; n++; } syncCrops(b); if (n) v.carry = { type: 'food', n: Math.round(n * 1.6) }; } });
      return;
    }
    if (s.kind === 'quarry') {
      const dg = findDig(b);
      if (!dg) { v.q.push({ k: 'wait', h: 1.5 }); v.act = 'Nothing left to dig'; return; }
      v.target = { b, dig: dg };
      const goals = []; for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if ((dx || dz) && walkable(dg[0] + dx, dg[2] + dz)) goals.push([dg[0] + dx, dg[2] + dz]);
      if (walkable(dg[0], dg[2])) goals.push([dg[0], dg[2]]);
      v.q.push({ k: 'walk', goals, act: 'Walking to the dig' }, { k: 'work', h: 1.8, act: 'Quarrying stone', fx: 'mine', fn: () => {
        const t = world.get(dg[0], dg[1], dg[2]); if (t === B.AIR || TREEISH(t) || t === B.WATER) return;
        world.set(dg[0], dg[1], dg[2], B.AIR); puff(dg[0] + .5, dg[1] + .5, dg[2] + .5, BINFO[t].c, 6);
        const below = world.get(dg[0], dg[1] - 1, dg[2]); if (below === B.DIRT && Math.random() < 0.5) world.set(dg[0], dg[1] - 1, dg[2], B.GRASS);
        wakeWaterAround(dg[0], dg[1], dg[2]);
        v.carry = t === B.ORE ? { type: 'ore', n: 3 } : t === B.STONE || t === B.BRICK || t === B.BEDROCK ? { type: 'stone', n: 5 } : { type: 'stone', n: 2 };
      } });
      return;
    }
    if (s.kind === 'mine') { v.q.push({ k: 'walk', goals: [b.entry], act: 'Going to the mine' }, { k: 'work', h: 3, act: 'Mining ore', fx: 'mine', hide: true, fn: () => { v.carry = Math.random() < 0.55 ? { type: 'ore', n: 3 } : { type: 'stone', n: 6 }; } }); return; }
    if (s.kind === 'shrine' || s.kind === 'temple') { v.q.push({ k: 'walk', goals: [b.entry], act: 'Going to pray' }, { k: 'work', h: 3, act: 'Praying', fn: () => { G.res.favor += s.kind === 'temple' ? 3 : 2; } }); return; }
  }
  // gather wood by hand when stocks are low
  const cf = G.blds[0];
  if (G.res.wood < 30 && (G.res.food > G.vill.length * 3 || v.id % 2 === 0) && !G.vill.some(o => o !== v && o.target && o.target.sticks)) {
    const tr = findTree(cf.x + 1, cf.z + 1, 24, v);
    if (tr) {
      v.target = { sticks: 1, tree: tr };
      const goals = [[tr[0] + 1, tr[1]], [tr[0] - 1, tr[1]], [tr[0], tr[1] + 1], [tr[0], tr[1] - 1]].filter(c => inMain(c[0], c[1]));
      v.q.push({ k: 'walk', goals, act: 'Gathering sticks' }, { k: 'work', h: 1.8, act: 'Gathering sticks', fx: 'chop', fn: () => { v.carry = { type: 'wood', n: 3 }; } });
      return;
    }
  }
  // forage
  let pick = null;
  for (let tries = 0; tries < 20 && !pick; tries++) {
    const x = clamp(cf.x + 1 + Math.round((Math.random() - 0.5) * 22), 0, W - 1), z = clamp(cf.z + 1 + Math.round((Math.random() - 0.5) * 22), 0, D - 1);
    if (inMain(x, z) && world.get(x, walkH[x + z * W] - 1, z) === B.GRASS) pick = [x, z];
  }
  if (!pick) { v.q.push({ k: 'wait', h: 1 }); return; }
  const se = seasonOf();
  v.q.push({ k: 'walk', goals: [pick], act: 'Foraging' }, { k: 'work', h: 2, act: se === 3 ? 'Searching the snow for food' : 'Gathering berries', fn: () => { const n = se === 3 ? (Math.random() < 0.3 ? 1 : 0) : se === 2 ? 2 : 1; if (n) v.carry = { type: 'food', n }; } });
}
function buildTick(b, mult) {
  if (!G.blds.includes(b) || b.done) return;
  b.progress += mult;
  const def = BDEF[b.type];
  placeCells(b, Math.floor(b.cells.length * Math.min(1, b.progress / def.hours)));
  if (b.progress >= def.hours) finishBuilding(b);
}
function nearestWalkable(x, z, preferX, preferZ) {
  let best = null, bd = 1e9;
  for (let r = 0; r < 40 && !best; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue; const xx = x + dx, zz = z + dz; if (!inMain(xx, zz)) continue;
    const d = Math.hypot(dx, dz) + (preferX !== undefined ? Math.hypot(xx - preferX, zz - preferZ) * 0.01 : 0); if (d < bd) { bd = d; best = [xx, zz]; }
  }
  return best;
}
function rescue(v, toCamp) { // move a trapped villager to somewhere reachable
  const cf = G.blds[0];
  const c = toCamp ? nearestWalkable(cf.entry[0], cf.entry[1]) : nearestWalkable(Math.floor(v.x), Math.floor(v.z));
  if (!c) return; puff(v.x, v.y + 0.5, v.z, [0.8, 0.8, 0.8], 3);
  v.x = c[0] + 0.5; v.z = c[1] + 0.5; v.y = walkH[c[0] + c[1] * W]; v.q = [];
}
function exitHome(v) { v.inside = false; if (v.home) { v.x = v.home.entry[0] + 0.5; v.z = v.home.entry[1] + 0.5; v.y = walkH[v.home.entry[0] + v.home.entry[1] * W]; if (!walkable(v.home.entry[0], v.home.entry[1])) rescue(v); } }
function stepVillager(v, dt) {
  v.anim += dt * 6;
  if (v.inside) { if (!isNight() && hourOf() >= 6) { exitHome(v); v.q = []; } else return; }
  if (v.sleepOut) { if (!isNight()) { v.sleepOut = false; v.q = []; } else return; }
  if (!v.q.length) decide(v);
  const a = v.q[0]; if (!a) return;
  if (a.act) v.act = a.act;
  if (a.k === 'walk') {
    if (!a.path) {
      const sx = clamp(Math.floor(v.x), 0, W - 1), sz = clamp(Math.floor(v.z), 0, D - 1);
      a.path = a.goals && a.goals.length ? astar(sx, sz, a.goals) : null;
      if (!a.path) {
        v.lastFail = { act: a.act, main: mainComp, from: [sx, sz, walkOK[sx + sz * W], walkH[sx + sz * W], comp[sx + sz * W]], goals: (a.goals || []).slice(0, 4).map(g => [g[0], g[1], walkOK[g[0] + g[1] * W], walkH[g[0] + g[1] * W], comp[g[0] + g[1] * W]]) };
        v.q = []; v.stuck = (v.stuck || 0) + 1; v.act = 'Can’t find a way'; G.stats.fails = (G.stats.fails || 0) + 1;
        if (v.stuck >= 3) { rescue(v, true); v.stuck = 0; G.stats.rescues = (G.stats.rescues || 0) + 1; }
        else v.q.push({ k: 'wait', h: 0.3 + Math.random() * 0.5 });
        return;
      }
      v.stuck = 0;
    }
    if (!a.path.length) { v.q.shift(); return; }
    const [nx, nz] = a.path[0];
    if (!walkOK[nx + nz * W] && a.path.length > 1) { a.path = null; return; }
    const tx = nx + 0.5, tz = nz + 0.5, dx = tx - v.x, dz = tz - v.z, dist = Math.hypot(dx, dz);
    const step = WALK * dt * (G.frozen && !v.home ? 0.85 : 1);
    if (dist <= step) { v.x = tx; v.z = tz; a.path.shift(); }
    else { v.x += dx / dist * step; v.z += dz / dist * step; v.dir = Math.atan2(dx, dz); }
    const ci = clamp(Math.floor(v.x), 0, W - 1) + clamp(Math.floor(v.z), 0, D - 1) * W;
    v.y = lerp(v.y, walkH[ci], Math.min(1, dt * 20));
    v.walking = true;
    return;
  }
  v.walking = false;
  const ci = clamp(Math.floor(v.x), 0, W - 1) + clamp(Math.floor(v.z), 0, D - 1) * W;
  v.y = lerp(v.y, walkH[ci], Math.min(1, dt * 20));
  if (a.k === 'work') {
    if (a.t === undefined) a.t = a.h;
    a.t -= dt * moodMult(v); v.working = true; v.hidden = !!a.hide;
    if (a.fx && Math.random() < dt * 2.2 && camNear(v)) SND.play(a.fx, { vary: 0.08, volume: 0.35 });
    if (a.t <= 0) { v.q.shift(); v.working = false; v.hidden = false; a.fn && a.fn(); if (v.carry && v.q.length === 0) { const d = nearestDrop(v); if (d) v.q.push({ k: 'walk', goals: [d.entry], act: 'Hauling ' + v.carry.type }, { k: 'drop' }); } }
    return;
  }
  v.working = false;
  if (a.k === 'wait') { if (a.t === undefined) a.t = a.h; a.t -= dt; if (a.t <= 0) v.q.shift(); return; }
  if (a.k === 'drop') { if (v.carry) { const k = v.carry.type, c = storeCap(k); if (G.res[k] >= c) { if (G.t - (G.fullWarn || -99) > 12) { G.fullWarn = G.t; addLog(`Storage is full of ${k}! Build a Storehouse to hold more.`, 'warn'); } } else { G.res[k] = Math.min(c, G.res[k] + v.carry.n); floatText(v, '+' + v.carry.n, RES_COL[k]); } v.carry = null; } v.q.shift(); return; }
  if (a.k === 'enter') { v.q.shift(); if (v.home && isNight()) { v.inside = true; v.act = 'Sleeping at home'; } return; }
  if (a.k === 'sleepout') { v.q.shift(); if (isNight()) { v.sleepOut = true; v.act = 'Sleeping by the fire'; } return; }
  v.q.shift();
}
function camNear(v) { return Math.hypot(v.x - cam.target[0], v.z - cam.target[2]) < cam.dist * 0.35; }

// ===================== water & fire =====================
const N6 = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0]];
function onWorldChange(x, y, z, t) {
  if (!G) return;
  if (t === B.WATER) G.waterActive.add(world.idx(x, y, z));
  wakeWaterAround(x, y, z);
}
function wakeWaterAround(x, y, z) {
  for (const [dx, dy, dz] of N6) { const a = x + dx, b = y + dy, c = z + dz; if (world.get(a, b, c) === B.WATER) G.waterActive.add(world.idx(a, b, c)); }
}
const passable = t => t === B.AIR || isCrop(t);
function waterTick() {
  const act = Array.from(G.waterActive); G.waterActive.clear();
  for (let k = act.length - 1; k > 0; k--) { const j = Math.random() * (k + 1) | 0; [act[k], act[j]] = [act[j], act[k]]; }
  let n = 0;
  for (const i of act) {
    if (n++ > 1800) { G.waterActive.add(i); continue; }
    if (world.v[i] !== B.WATER) continue;
    const x = i % W, z = ((i / W) | 0) % D, y = (i / (W * D)) | 0;
    const below = world.get(x, y - 1, z);
    if (y > 0 && passable(below)) { world.set(x, y, z, B.AIR); world.set(x, y - 1, z, B.WATER); continue; }
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].sort(() => Math.random() - 0.5);
    let moved = false; const flat = [];
    for (const [dx, dz] of dirs) {
      const nx = x + dx, nz = z + dz; if (nx < 0 || nz < 0 || nx >= W || nz >= D) continue;
      const nt = world.get(nx, y, nz); if (!passable(nt)) continue;
      if (passable(world.get(nx, y - 1, nz))) { world.set(x, y, z, B.AIR); world.set(nx, y, nz, B.WATER); moved = true; break; }
      flat.push([nx, nz]);
    }
    if (moved) continue;
    if (flat.length && Math.random() < 0.55) {
      // only spread if there's water stacked or the source is a sheet that can thin out
      const [nx, nz] = flat[(Math.random() * flat.length) | 0];
      world.set(x, y, z, B.AIR); world.set(nx, y, nz, B.WATER); continue;
    }
    if (flat.length) G.waterActive.add(i);
  }
  // evaporation / freezing
  const se = seasonOf();
  const ev = se === 1 ? 0.12 : se === 3 ? 0.015 : 0.05;
  for (let s = 0; s < 40; s++) {
    const x = (Math.random() * W) | 0, z = (Math.random() * D) | 0; const y = world.topAny(x, z);
    if (y < 0 || world.get(x, y, z) !== B.WATER) continue;
    if (G.frozen && Math.random() < 0.3) { world.set(x, y, z, B.ICE); continue; }
    if (y <= WL - 1) continue;
    let iso = true; for (const [dx, , dz] of N6.slice(0, 4)) if (world.get(x + dx, y, z + dz) === B.WATER) iso = false;
    if (Math.random() < (iso ? 0.5 : ev) * (G.rain ? 0.2 : 1)) world.set(x, y, z, B.AIR);
  }
}
function ignite(x, y, z) {
  const t = world.get(x, y, z); const f = FLAMMABLE[t]; if (!f) return false;
  const i = world.idx(x, y, z); if (world.burning.has(i)) return false;
  world.burning.set(i, f[1] * (0.7 + Math.random() * 0.6)); world.markDirty(x, y, z); colDirty.add(x + z * W);
  return true;
}
function rainingAt(x, z) {
  if (G.rain) return true;
  return G.clouds.some(c => Math.hypot(c.x - x, c.z - z) < c.r);
}
function fireTick(dh) {
  if (!world.burning.size) return;
  const many = world.burning.size > 350;
  const wells = G.blds.filter(b => b.type === 'well' && b.done);
  const doused = new Map();
  for (const [i, rem] of Array.from(world.burning)) {
    const x = i % W, z = ((i / W) | 0) % D, y = (i / (W * D)) | 0;
    const t = world.v[i];
    if (!FLAMMABLE[t]) { world.burning.delete(i); continue; }
    if (rainingAt(x, z) && Math.random() < dh * 6) { world.burning.delete(i); world.markDirty(x, y, z); colDirty.add(x + z * W); puff(x + .5, y + 1, z + .5, [0.6, 0.6, 0.65], 1); continue; }
    let w = null; for (const b of wells) { if (Math.hypot(b.x + 1 - x, b.z + 1 - z) < 9.5) { w = b; break; } }
    if (w && (doused.get(w) || 0) < 3 && Math.random() < dh * 3) { doused.set(w, (doused.get(w) || 0) + 1); world.burning.delete(i); world.markDirty(x, y, z); colDirty.add(x + z * W); splash(x + .5, y + 1, z + .5); continue; }
    const r = rem - dh;
    if (Math.random() < dh * 3) ember(x + Math.random(), y + 1, z + Math.random());
    for (const [dx, dy, dz] of N6) {
      const nt = world.get(x + dx, y + dy, z + dz); const f = FLAMMABLE[nt]; if (!f) continue;
      let p = f[0] * dh * 7 * (dy > 0 ? 1.8 : dy < 0 ? 0.5 : 1);
      if (many) p *= 0.4; if (seasonOf() === 1) p *= 1.35; if (seasonOf() === 3) p *= 0.5;
      if (Math.random() < p) ignite(x + dx, y + dy, z + dz);
    }
    if (r <= 0) {
      world.burning.delete(i);
      const own = world.owner[i];
      if (t === B.GRASS) world.set(x, y, z, B.BURNT);
      else { world.set(x, y, z, B.AIR); puff(x + .5, y + .5, z + .5, [0.25, 0.23, 0.22], 2); }
      if (own) { const b = G.bmap.get(own - 1); if (b && b.type !== 'campfire') { b.lost++; if (b.done && b.lost > b.total * 0.25) burnDown(b); } }
      if (isCrop(t)) { const fb = buildingAt(x, z); if (fb && fb.crops) fb.crops[(z - fb.z) * 5 + (x - fb.x)] = 0; }
      const bl = world.get(x, y - 1, z); if (bl === B.GRASS && Math.random() < 0.5) world.set(x, y - 1, z, B.BURNT);
    } else world.burning.set(i, r);
  }
}
function burnDown(b) {
  const def = BDEF[b.type];
  if (def.house) for (const v of b.residents.slice()) if (v.inside && Math.random() < 0.5) killVillager(v, 'died in the fire');
  for (const [x, y, z] of b.cells) if (FLAMMABLE[world.get(x, y, z)] && Math.random() < 0.6) ignite(x, y, z);
  removeBuilding(b, `The ${def.name} burned down!`);
  SND.play('alarm');
}
function strike(x, z, byPlayer) {
  let y = world.topAny(x, z); if (y < 0) return;
  G.bolts.push({ x: x + 0.5, z: z + 0.5, y, t: 0.35, seed: Math.random() * 1000 }); G.flash = 1;
  SND.play('thunder', { vary: 0.1 });
  for (let dy = 0; dy < 2; dy++) for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
    if (Math.abs(dx) + Math.abs(dz) > 1) continue;
    const yy = y - dy, t = world.get(x + dx, yy, z + dz);
    if (t === B.BEDROCK || t === B.AIR) continue;
    if (dy === 0 && !(dx || dz) || Math.random() < 0.35) {
      if (t === B.WATER) { world.set(x + dx, yy, z + dz, B.AIR); continue; }
      const own = world.owner[world.idx(x + dx, yy, z + dz)];
      world.set(x + dx, yy, z + dz, B.AIR); puff(x + dx + .5, yy + .5, z + dz + .5, BINFO[t].c, 4);
      if (own) { const b = G.bmap.get(own - 1); if (b && b.type !== 'campfire') { b.lost++; if (b.done && b.lost > b.total * 0.25) burnDown(b); } }
    }
  }
  for (let dy = -2; dy <= 2; dy++) for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) if (Math.random() < 0.55) ignite(x + dx, y + dy, z + dz);
  wakeWaterAround(x, y, z);
  for (const v of G.vill.slice()) {
    const d = Math.hypot(v.x - x - 0.5, v.z - z - 0.5);
    if (d < 1.6 && !v.inside) killVillager(v, 'was struck by lightning');
    else if (d < 10) v.fear = Math.min(40, v.fear + (byPlayer ? 25 : 12));
  }
}

// ===================== particles =====================
function puff(x, y, z, c, n) { for (let k = 0; k < n; k++) G.particles.push({ x, y, z, vx: (Math.random() - .5) * 2, vy: Math.random() * 2 + 1, vz: (Math.random() - .5) * 2, life: 0.6 + Math.random() * 0.4, c, s: 0.16, g: 6 }); }
function ember(x, y, z) { G.particles.push({ x, y, z, vx: (Math.random() - .5) * 0.6, vy: 1.5 + Math.random() * 1.5, vz: (Math.random() - .5) * 0.6, life: 0.9 + Math.random(), c: [1, 0.55, 0.15], s: 0.12, g: -0.3, em: 2 });
  if (Math.random() < 0.5) G.particles.push({ x, y: y + 0.5, z, vx: 0.3, vy: 1.2, vz: 0.1, life: 2, c: [0.25, 0.24, 0.24], s: 0.35, g: -0.2, smoke: 1 }); }
function splash(x, y, z) { for (let k = 0; k < 5; k++) G.particles.push({ x, y, z, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 2, vz: (Math.random() - .5) * 2, life: 0.6, c: [0.5, 0.7, 1], s: 0.12, g: 9, tr: 1 }); }
function floatText(v, txt, c) { G.particles.push({ x: v.x, y: v.y + 1.4, z: v.z, vx: 0, vy: 0.8, vz: 0, life: 1.3, c, s: 0.22, g: 0, sparkle: 1 }); }

// ===================== hourly / sim =====================
function hourly() {
  const h = Math.round(hourOf()) % 24, day = dayOf(), se = seasonOf();
  // seasons
  if (h === 0) {
    const sNow = se;
    if (sNow !== G.season) {
      G.season = sNow;
      if (sNow === 3) { G.frozen = true; addLog('Winter has come. The lake freezes and crops wither. Hope you stored food!', 'warn'); SND.play('alarm');
        for (const b of G.blds) if (b.crops) { b.crops.fill(0); syncCrops(b); }
        for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) { const y = world.topAny(x, z); if (world.get(x, y, z) === B.WATER) world.set(x, y, z, B.ICE); } }
      if (sNow === 0) { G.frozen = false; addLog(`Spring of year ${Math.floor(day / 12) + 1}. The ice melts and snowmelt swells the streams.`, 'good');
        for (let i = 0; i < world.v.length; i++) if (world.v[i] === B.ICE) { world.v[i] = B.WATER; G.waterActive.add(i); world.markDirty(i % W, (i / (W * D)) | 0, ((i / W) | 0) % D); }
        for (let k = 0; k < 70; k++) { const x = 4 + (Math.random() * 14 | 0), z = 4 + (Math.random() * 14 | 0); const y = world.topAny(x, z); if (y < H - 2) world.set(x, y + 1, z, B.WATER); } }
      if (sNow === 1) addLog('Summer. Dry heat — beware of lightning and wildfires.', 'warn');
      if (sNow === 2) addLog('Autumn. Crops grow fast and foraging is plentiful. Stockpile food for winter.');
      assignJobs();
    }
  }
  if (h === 6) rollWeather();
  // weather schedule
  const W8 = G.dayWeather;
  if (W8) {
    if (W8.kind === 'rain' && h === W8.start) { G.rain = { rate: W8.rate, until: G.t + W8.dur, heavy: W8.heavy }; addLog(W8.heavy ? 'A great storm breaks! Heavy rain may flood the lowlands.' : 'It begins to rain.', W8.heavy ? 'bad' : ''); if (W8.heavy) SND.play('alarm'); }
    if (W8.kind === 'storm' && h >= W8.start && h < W8.start + W8.dur) {
      if (h === W8.start) { addLog('A dry thunderstorm rolls over the valley…', 'bad'); G.storm = { until: G.t + W8.dur }; }
      if (Math.random() < W8.p * (dayOf() < 12 ? 0.55 : 1)) { let bx = 0, bz = 0, by = -1; for (let k = 0; k < 3; k++) { const x = 2 + (Math.random() * (W - 4) | 0), z = 2 + (Math.random() * (D - 4) | 0), y = world.topAny(x, z); if (y > by) { by = y; bx = x; bz = z; } } strike(bx, bz, false); }
    }
  }
  if (G.rain && G.t >= G.rain.until) { G.rain = null; addLog('The rain stops.'); }
  if (G.storm && G.t >= G.storm.until) G.storm = null;
  // meals
  if (h === 12 || h === 19) {
    let missed = 0;
    for (const v of G.vill.slice()) {
      if (G.res.food >= 1) { G.res.food -= 1; v.missed = 0; }
      else { v.missed++; missed++; if (v.missed >= 5) killVillager(v, 'starved to death'); }
    }
    if (missed) { addLog(`${missed} villager${missed > 1 ? 's' : ''} went hungry!`, 'bad'); }
  }
  // cold
  if (h === 2 && se === 3) for (const v of G.vill.slice()) if (!v.home) { v.health -= 34; if (v.health <= 0) killVillager(v, 'froze to death without a home'); }
  for (const v of G.vill) if (v.home && v.missed === 0) v.health = Math.min(100, v.health + 1);
  // crops
  for (const b of G.blds) if (b.crops && b.done) {
    if (se === 3) continue;
    let rate = 0.075 * (se === 2 ? 1.5 : 1) * (rainingAt(b.x + 2, b.z + 2) ? 1.6 : 1) * (G.t - b.tend < 8 ? 1 : 0.3);
    for (let k = 0; k < 25; k++) {
      const x = b.x + k % 5, z = b.z + ((k / 5) | 0);
      if (world.get(x, b.base, z) === B.WATER) { b.crops[k] = 0; continue; }
      if (world.get(x, b.base - 1, z) === B.SOIL && b.crops[k] < 3) b.crops[k] = Math.min(3, b.crops[k] + rate * (0.8 + Math.random() * 0.4));
    }
    syncCrops(b);
  }
  // floods damage buildings
  for (const b of G.blds.slice()) {
    if (!b.done || b.type === 'dock' || b.type === 'farm' || b.type === 'campfire') continue;
    let wet = 0; for (let z = b.z - 1; z <= b.z + b.d; z++) for (let x = b.x - 1; x <= b.x + b.w; x++) if (world.get(x, b.base, z) === B.WATER && world.get(x, b.base - 1, z) !== B.AIR) wet++;
    b.flooded = wet >= 5;
    if (b.flooded) { b.health -= 0.07; if (h % 3 === 0 && b.health > 0) addLog(`The ${BDEF[b.type].name} is flooding!`, 'warn');
      if (b.health <= 0) { for (const v of b.residents.slice()) if (v.inside && Math.random() < 0.3) killVillager(v, 'drowned in the flood'); removeBuilding(b, `The ${BDEF[b.type].name} was swept away by the flood!`); SND.play('alarm'); } }
  }
  // saplings
  for (let i = G.saplings.length - 1; i >= 0; i--) { const sp = G.saplings[i]; if (world.get(sp.x, sp.y, sp.z) !== B.LEAVES) { G.saplings.splice(i, 1); continue; }
    if (G.t >= sp.t && se !== 3) { world.set(sp.x, sp.y, sp.z, B.AIR); plantTree(sp.x, sp.z, false); G.saplings.splice(i, 1); } }
  // regrowth
  for (let k = 0; k < 3; k++) {
    const x = 1 + (Math.random() * (W - 2) | 0), z = 1 + (Math.random() * (D - 2) | 0);
    let near = false; for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (buildingAt(x + dx * 2, z + dz * 2)) near = true;
    if (near || se === 3) continue;
    let trees = 0; for (let dz = -4; dz <= 4; dz += 2) for (let dx = -4; dx <= 4; dx += 2) { const gt = groundTop(x + dx, z + dz); if (TREEISH(world.get(x + dx, gt + 1, z + dz))) trees++; }
    if (trees > 0 || Math.random() < 0.15) plantTree(x, z, false);
  }
  for (let k = 0; k < 25; k++) { const x = Math.random() * W | 0, z = Math.random() * D | 0, y = world.top(x, z); if (world.get(x, y, z) === B.BURNT && Math.random() < 0.15 && !world.burning.has(world.idx(x, y, z))) world.set(x, y, z, B.GRASS); }
  // mood
  const amen = G.blds.filter(b => b.done && ['shrine', 'temple', 'market', 'well'].includes(b.type));
  const AM = { shrine: 7, temple: 12, market: 10, well: 4 };
  for (const v of G.vill) {
    let m = 52;
    m += v.home ? 12 : (se === 3 ? -28 : -16);
    m -= v.missed * 14;
    const hx = v.home ? v.home.x : G.blds[0].x, hz = v.home ? v.home.z : G.blds[0].z;
    let am = 0; for (const b of amen) if (Math.hypot(b.x - hx, b.z - hz) < 15) am += AM[b.type]; m += Math.min(24, am);
    if (v.home && v.home.type === 'stonehouse') m += 5;
    if (v.home && v.home.flooded) m -= 12;
    m += v.bless - v.fear - G.grief;
    if (world.burning.size > 40) m -= 6;
    if (G.rain && !v.home) m -= 5;
    v.target_m = clamp(m, 0, 100);
    v.mood = lerp(v.mood, v.target_m, 0.18);
    v.bless = Math.max(0, v.bless - 0.35); v.fear = Math.max(0, v.fear - 0.8);
  }
  G.grief = Math.max(0, G.grief * 0.97 - 0.15);
  // favor from happiness
  const pop = G.vill.length, avg = avgMood();
  G.res.favor += Math.max(0, Math.sqrt(pop) * 0.08 * (avg - 45) / 55);
  // growth
  if (h % 6 === 0 && pop > 0 && housingCap() > pop && G.res.food >= pop * 3 && avg >= 48 && pop < 70) {
    const cf = G.blds[0]; const home = G.blds.find(b => b.done && BDEF[b.type].house && b.residents.length < BDEF[b.type].house);
    const at = home ? home.entry : [cf.x + 1, cf.z + 3];
    const nv = spawnVillager(at[0] + 0.5, at[1] + 0.5);
    G.stats.born++;
    addLog(pop >= 2 && Math.random() < 0.6 ? `A child, ${nv.name}, is born!` : `A traveler, ${nv.name}, joins your people.`, 'good'); SND.play('birth');
    assignHomes(); assignJobs();
  }
  if (h % 2 === 0) assignJobs();
  // collapse checks
  if (pop === 0) return collapse('Every last villager is gone. Your civilization has died out.');
  if (avg < 22) {
    G.lowMoodH++;
    if (G.lowMoodH === 1 || G.lowMoodH % 8 === 0) { addLog(`Your people are in despair! If mood stays this low for ${24 - G.lowMoodH} more hours, they will abandon you.`, 'bad'); SND.play('alarm'); }
    if (G.lowMoodH >= 24) return collapse('Starving, homeless and afraid, your people lost all faith and scattered into the wilderness.');
  } else G.lowMoodH = Math.max(0, G.lowMoodH - 2);
  if (avg < 35 && G.t - G.lastWarn > 18 && avg >= 22) { G.lastWarn = G.t; addLog('The villagers are unhappy. Check food, homes and amenities.', 'warn'); }
  if (G.res.food < pop * 2 && h === 8 && pop) addLog('Food stores are running low!', 'warn');
  checkEra();
}
function avgMood() { return G.vill.length ? G.vill.reduce((s, v) => s + v.mood, 0) / G.vill.length : 0; }
function rollWeather() {
  const se = seasonOf(), day = dayOf(); G.dayWeather = null;
  if (day < 2) return;
  const e = G.era;
  if (se === 0 && Math.random() < 0.5) { const heavy = e >= 1 && Math.random() < 0.3 + e * 0.1; G.dayWeather = { kind: 'rain', start: 9 + (Math.random() * 6 | 0), dur: heavy ? 12 + (Math.random() * 6 | 0) : 5 + (Math.random() * 5 | 0), rate: heavy ? 70 + e * 15 : 22, heavy }; }
  if (se === 1 && Math.random() < 0.38 + e * 0.08) { G.dayWeather = { kind: 'storm', start: 12 + (Math.random() * 5 | 0), dur: 5, p: 0.35 + e * 0.12 }; }
  if (se === 2 && Math.random() < 0.3) G.dayWeather = { kind: 'rain', start: 10 + (Math.random() * 6 | 0), dur: 4 + (Math.random() * 4 | 0), rate: 18, heavy: false };
}
function eraStatus() {
  if (G.era >= ERA_REQ.length) return null;
  const r = ERA_REQ[G.era]; const items = [];
  items.push({ label: `${r.pop} villagers`, ok: G.vill.length >= r.pop, cur: G.vill.length, need: r.pop });
  for (const k in r.bld) items.push({ label: `${r.bld[k]} ${BDEF[k].name}${r.bld[k] > 1 ? 's' : ''}`, ok: count(k) >= r.bld[k], cur: count(k), need: r.bld[k] });
  for (const k in r.res) items.push({ label: `${r.res[k]} ${k}`, ok: G.res[k] >= r.res[k], cur: Math.floor(G.res[k]), need: r.res[k] });
  return { to: r.to, items, ready: items.every(i => i.ok) };
}
function checkEra() { const s = eraStatus(); const was = G.eraReady; G.eraReady = !!(s && s.ready); if (G.eraReady && !was) { addLog(`You can advance to the ${s.to} era!`, 'good'); SND.play('notify'); } }
function advanceEra() {
  const s = eraStatus(); if (!s || !s.ready) return;
  pay(ERA_REQ[G.era].res); G.era++; G.eraReady = false;
  SND.play('era'); UI.banner(`The ${ERA_REQ[G.era - 1].to} era`, G.era === 1 ? 'Cottages, farms, quarries, wells and shrines are ready to build.' : 'Stone houses, mines, markets and temples are ready, and so is the Great Tower.');
  addLog(`Your people enter the ${ERA_REQ[G.era - 1].to} era!`, 'good');
  G.res.favor += 10;
  UI.buildToolbar();
}
function collapse(reason) { if (G.over) return; G.over = { win: false, reason }; SND.play('collapse'); UI.showEnd(); }
function victory() { if (G.over) return; G.over = { win: true, reason: 'The Great Tower touches the lid of the world. Your people gaze out through the glass at what lies beyond.' }; SND.play('victory'); UI.showEnd(); }

function simStep(dt) { // dt in game hours
  const before = G.t; G.t += dt;
  if (Math.floor(G.t) !== Math.floor(before)) hourly();
  if (G.over) return;
  for (const v of G.vill.slice()) stepVillager(v, dt);
  // rain
  if (G.rain) {
    const n = G.rain.rate * dt; let k = Math.floor(n) + (Math.random() < n % 1 ? 1 : 0);
    while (k--) { const x = Math.random() * W | 0, z = Math.random() * D | 0; const y = world.topAny(x, z); const t = world.get(x, y, z);
      const soak = (t === B.GRASS || t === B.DIRT || t === B.SAND || t === B.LEAVES || t === B.PINE || t === B.BURNT) ? (G.rain.heavy ? 0.45 : 0.18) : 1;
      if (y < H - 2 && Math.random() < soak && !world.owner[world.idx(x, y, z)] && !buildingAt(x, z)) world.set(x, y + 1, z, B.WATER); }
  }
  for (const c of G.clouds) {
    if (Math.random() < dt * 6) { const a = Math.random() * 6.28, r = Math.random() * c.r; const x = clamp(Math.round(c.x + Math.cos(a) * r), 0, W - 1), z = clamp(Math.round(c.z + Math.sin(a) * r), 0, D - 1); const y = world.topAny(x, z); if (y < H - 2 && !buildingAt(x, z)) world.set(x, y + 1, z, B.WATER); }
    if (Math.random() < dt * 1.5) for (const [i] of world.burning) { const x = i % W, z = ((i / W) | 0) % D; if (Math.hypot(x - c.x, z - c.z) < c.r) { world.burning.delete(i); world.markDirty(x, (i / (W * D)) | 0, z); colDirty.add(x + z * W); } }
  }
  G.clouds = G.clouds.filter(c => G.t < c.until);
  G.fireAcc += dt; while (G.fireAcc > 0.1) { G.fireAcc -= 0.1; fireTick(0.1); }
  G.waterAcc += dt * 26; let wt = 0; while (G.waterAcc > 1 && wt < 6) { G.waterAcc -= 1; waterTick(); wt++; } if (G.waterAcc > 6) G.waterAcc = 0;
  updateWalk();
}

// ===================== powers =====================
function usePower(p, hit, brush) {
  const def = POWERS[p];
  const x = hit.x, z = hit.z;
  if (p === 'raise' || p === 'lower') {
    let used = 0; const r = brush - 1;
    for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dz * dz > r * r + 0.5) continue;
      if (G.res.favor < 1) break;
      const xx = x + dx, zz = z + dz; if (xx < 0 || zz < 0 || xx >= W || zz >= D) continue;
      if (buildingAt(xx, zz)) continue;
      if (p === 'raise') {
        let y = world.top(xx, zz); const t = world.get(xx, y, zz);
        if (TREEISH(t)) { y = groundTop(xx, zz); if (world.get(xx, y + 1, zz) === B.LOG) continue; }
        if (y >= H - 3) continue;
        const ny = y + 1;
        world.set(xx, ny, zz, B.GRASS); if (world.get(xx, y, zz) === B.GRASS) world.set(xx, y, zz, B.DIRT);
        used++;
      } else {
        const y = world.topAny(xx, zz); const t = world.get(xx, y, zz);
        if (y <= 1 || t === B.BEDROCK || world.owner[world.idx(xx, y, zz)]) continue;
        if (TREEISH(t)) { chopTreeAt(xx, y, zz); used++; continue; }
        world.set(xx, y, zz, B.AIR); wakeWaterAround(xx, y, zz);
        const b2 = world.get(xx, y - 1, zz); if (b2 === B.DIRT) world.set(xx, y - 1, zz, B.GRASS);
        used++;
      }
    }
    if (used) { G.res.favor -= used * def.favor; SND.play('dig', { vary: 0.1, volume: 0.6 }); puff(x + .5, hit.y + 1, z + .5, [0.45, 0.33, 0.2], 3); }
    return used > 0;
  }
  if (G.res.favor < def.favor) { UI.toast('Not enough Favor'); SND.play('error'); return false; }
  G.res.favor -= def.favor;
  if (p === 'rain') { G.clouds.push({ x: x + 0.5, z: z + 0.5, r: 7, until: G.t + 3 }); addLog('You summon a rain cloud.'); SND.play('notify'); }
  if (p === 'bolt') { strike(x, z, true); }
  if (p === 'bless') {
    let n = 0; for (const v of G.vill) if (Math.hypot(v.x - x, v.z - z) < 12) { v.bless = Math.min(40, v.bless + 25); v.mood = Math.min(100, v.mood + 8); n++; floatText(v, '♥', [1, 0.85, 0.4]); }
    for (let k = 0; k < 40; k++) G.particles.push({ x: x + (Math.random() - .5) * 16, y: hit.y + 1 + Math.random() * 3, z: z + (Math.random() - .5) * 16, vx: 0, vy: 1.2, vz: 0, life: 1.5 + Math.random(), c: [1, 0.86, 0.45], s: 0.14, g: -0.2, em: 2 });
    addLog(`You bless ${n} villager${n === 1 ? '' : 's'}. Spirits rise.`, 'good'); SND.play('bless');
  }
  return true;
}
