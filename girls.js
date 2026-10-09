// Пиксельные девочки кодом (копия spikes/pixel/pixel.js без страницы): фигуры на сетке 48×48 + автотень и автоконтур.
// Внешность — данные (вид, причёска, одежда, палитра), кадры рисуются функциями.
export const W = 48, H = 48, FLOOR = 45;

// ---------- сетка ----------
class Grid {
  constructor() { this.c = new Array(W * H).fill(null); }
  set(x, y, col) { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < W && y < H && col) this.c[y * W + x] = col; }
  get(x, y) { return x >= 0 && y >= 0 && x < W && y < H ? this.c[y * W + x] : null; }
  rect(x0, y0, x1, y1, col) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, col); }
  ellipse(cx, cy, rx, ry, col) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
        if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) this.set(x, y, col);
  }
  line(x0, y0, x1, y1, col, w = 1) {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2));
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n;
      if (w <= 1) this.set(Math.round(x), Math.round(y), col);
      else this.ellipse(x, y, w / 2, w / 2, col);
    }
  }
  poly(pts, col) {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++)
      for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i], [xj, yj] = pts[j];
          if (yi > y + 0.5 !== yj > y + 0.5 && x + 0.5 < ((xj - xi) * (y + 0.5 - yi)) / (yj - yi) + xi) inside = !inside;
        }
        if (inside) this.set(x, y, col);
      }
  }
}

// ---------- цвет ----------
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (rgb) => "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const shade = (h, k) => toHex(hex(h).map((v) => v * k));
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));

/** Тень снизу-справа (свет сверху-слева) и контур темнее соседнего цвета. */
function finish(g) {
  const out = new Grid();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = g.get(x, y);
    if (!c) continue;
    const edge = !g.get(x + 1, y + 1) || !g.get(x + 1, y);
    out.set(x, y, edge ? shade(c, 0.82) : c);
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g.get(x, y)) continue;
    const n = [g.get(x - 1, y), g.get(x + 1, y), g.get(x, y - 1), g.get(x, y + 1)].find(Boolean);
    if (n) out.set(x, y, mix(shade(n, 0.38), "#1c1424", 0.4));
  }
  return out;
}

// ---------- внешность ----------
const SKINS = ["#f6d3bd", "#eec0a0", "#d9a07a", "#fbe0cf"];
export const PRESETS = [
  { name: "Лиса", kind: "fox", hair: "#e0642a", eye: "#3fa765", style: "bob", outfit: "office", top: "#f4f1ec", vest: "#26304a", bottom: "#26304a", legs: "#4a3328", shoes: "#1d2236", ear: "#f6e6d6", skin: SKINS[0] },
  { name: "Кошка", kind: "cat", hair: "#a98ad8", eye: "#3db0a0", style: "long", outfit: "hoodie", top: "#7f8be0", vest: "#7f8be0", bottom: "#2f3a5c", legs: "#f6d3bd", shoes: "#eeeeee", ear: "#f2c7d8", skin: SKINS[3] },
  { name: "Зайка", kind: "bunny", hair: "#f0cc6a", eye: "#c25a7a", style: "twin", outfit: "dress", top: "#e8879b", vest: "#e8879b", bottom: "#e8879b", legs: "#fbe0cf", shoes: "#8a4a3a", ear: "#f6c9d3", skin: SKINS[3] },
  { name: "Волчица", kind: "wolf", hair: "#8fa2c4", eye: "#e0a83a", style: "pony", outfit: "sport", top: "#2fb3a0", vest: "#2fb3a0", bottom: "#23283a", legs: "#eec0a0", shoes: "#f2f2f2", ear: "#dfe5ef", skin: SKINS[1] },
];

export function randomGirl() {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const hue = () => toHex([0, 0, 0].map(() => 60 + Math.random() * 180));
  const base = pick(PRESETS);
  return {
    ...base, name: "Новенькая",
    kind: pick(["fox", "cat", "bunny", "wolf"]), style: pick(["bob", "long", "twin", "pony"]),
    outfit: pick(["office", "hoodie", "dress", "sport"]),
    hair: pick(["#e0642a", "#a98ad8", "#f0cc6a", "#8fa2c4", "#3a2a2a", "#e9e4dc", "#5fbf9a", "#d94f6a"]),
    eye: pick(["#3fa765", "#3db0a0", "#c25a7a", "#e0a83a", "#4a7ad9"]),
    top: hue(), vest: hue(), bottom: hue(), skin: pick(SKINS),
  };
}

// ---------- части ----------
function ears(g, c, cx, top, side) {
  const inner = c.ear, hair = c.hair;
  const pair = side ? [cx - 1] : [cx - 5, cx + 5];
  for (const ex of pair) {
    if (c.kind === "bunny") {
      g.ellipse(ex, top - 3, 1.6, 5, hair); g.ellipse(ex, top - 3, 0.6, 3.5, inner);
    } else {
      const h = c.kind === "cat" ? 4 : 6;
      g.poly([[ex - 3, top + 2], [ex, top - h], [ex + 3, top + 2]], hair);
      g.poly([[ex - 1.5, top + 1], [ex, top - h + 3], [ex + 1.5, top + 1]], inner);
    }
  }
}

function tail(g, c, x0, y0, dir, sway = 0) {
  const tip = c.kind === "fox" ? "#f6efe6" : c.kind === "wolf" ? "#dfe5ef" : c.hair;
  if (c.kind === "bunny") { g.ellipse(x0 + dir * 2, y0, 2.5, 2.5, "#fbf6f0"); return; }
  if (c.kind === "cat") {
    g.line(x0, y0, x0 + dir * 5, y0 - 3 + sway, c.hair, 2);
    g.line(x0 + dir * 5, y0 - 3 + sway, x0 + dir * 6, y0 - 9 + sway, c.hair, 2);
    return;
  }
  // лиса / волк — пушистый
  g.ellipse(x0 + dir * 4, y0 - 3 + sway / 2, 3.5, 5, c.hair);
  g.ellipse(x0 + dir * 6, y0 - 7 + sway, 2.6, 3.2, tip);
}

function eyesFront(g, c, cx, y, blink) {
  for (const ex of [cx - 3.5, cx + 3.5]) {
    const x = Math.round(ex);
    if (blink) { g.rect(x - 1, y + 1, x + 1, y + 1, "#3a2430"); continue; }
    g.rect(x - 1, y, x + 1, y, "#2a1a24");
    g.rect(x - 1, y + 1, x, y + 2, c.eye);
    g.set(x + 1, y + 1, shade(c.eye, 0.6)); g.set(x + 1, y + 2, shade(c.eye, 0.6));
    g.set(x - 1, y + 1, "#ffffff");
  }
  g.set(cx - 5, y + 3, "#f19aa0"); g.set(cx + 5, y + 3, "#f19aa0");
  g.set(cx, y + 4, shade(c.skin, 0.7));
}

function hairFront(g, c, cx, cy, view) {
  const hd = c.hair;
  if (view === "back") { g.ellipse(cx, cy, 7, 6.8, hd); return; }
  // чёлка: верх головы и зубчики
  for (let y = cy - 7; y <= cy - 2; y++)
    for (let x = cx - 7; x <= cx + 7; x++)
      if (((x - cx) / 7) ** 2 + ((y - cy) / 6.8) ** 2 <= 1) g.set(x, y, hd);
  for (let x = cx - 6; x <= cx + 6; x += 3) g.rect(x, cy - 1, x + 1, cy, hd);
  if (view === "front") { g.rect(cx - 7, cy - 3, cx - 6, cy + 5, hd); g.rect(cx + 6, cy - 3, cx + 7, cy + 5, hd); }
}

function hairBack(g, c, cx, cy, view, dir = 1) {
  const hd = shade(c.hair, 0.9);
  const len = c.style === "long" ? 15 : c.style === "bob" ? 6 : 4;
  if (view === "front" || view === "back") {
    g.ellipse(cx, cy, 8, 7.5, hd);
    if (c.style === "long" || c.style === "bob") g.rect(cx - 8, cy, cx + 8, cy + len, hd);
    if (c.style === "twin") for (const s of [-1, 1]) g.ellipse(cx + s * 9, cy + 6, 2.5, 6, hd);
    if (c.style === "pony" && view === "back") g.ellipse(cx, cy + 8, 2.5, 6, hd);
  } else {
    g.ellipse(cx - dir * 1.5, cy, 7.5, 7.2, hd);
    if (c.style === "long" || c.style === "bob") g.rect(cx - dir * 7 - (dir > 0 ? 0 : 4), cy, cx - dir * 7 + (dir > 0 ? 4 : 0), cy + len, hd);
    if (c.style === "pony") g.ellipse(cx - dir * 8, cy + 3, 2.5, 6, hd);
    if (c.style === "twin") g.ellipse(cx - dir * 7, cy + 6, 2.5, 6, hd);
  }
}

// ---------- тело анфас / со спины ----------
function bodyFront(g, c, cx, back, breathe) {
  const legs = c.legs, shoes = c.shoes;
  // ноги и обувь
  g.rect(cx - 4, 34, cx - 2, 43, legs); g.rect(cx + 1, 34, cx + 3, 43, legs);
  g.rect(cx - 5, 43, cx - 2, 44, shoes); g.rect(cx + 1, 43, cx + 4, 44, shoes);
  // низ
  if (c.outfit === "dress" || c.outfit === "office") g.poly([[cx - 5, 29], [cx + 5, 29], [cx + 7, 35], [cx - 7, 35]], c.bottom);
  else g.rect(cx - 5, 29, cx + 4, 33, c.bottom);
  // руки
  const arm = c.outfit === "sport" ? c.skin : c.top;
  g.rect(cx - 8, 20, cx - 7, 29, arm); g.rect(cx + 6, 20, cx + 7, 29, arm);
  g.rect(cx - 8, 30, cx - 7, 31, c.skin); g.rect(cx + 6, 30, cx + 7, 31, c.skin);
  // торс: грудь шире талии
  const t = c.top;
  g.poly([[cx - 6, 19], [cx + 6, 19], [cx + 6, 25 - breathe], [cx + 4, 29], [cx - 5, 29], [cx - 6, 25 - breathe]], t);
  if (c.outfit === "sport") { g.rect(cx - 5, 25 - breathe, cx + 4, 29, c.skin); g.set(cx - 0, 27, shade(c.skin, 0.8)); }
  if (c.outfit === "office" && !back) {
    g.poly([[cx - 6, 19], [cx - 2, 19], [cx - 1, 29], [cx - 5, 29], [cx - 6, 25]], c.vest);
    g.poly([[cx + 1, 19], [cx + 6, 19], [cx + 6, 25], [cx + 4, 29], [cx + 1, 29]], c.vest);
    g.rect(cx - 1, 20, cx, 25, "#1d2236");
  }
  if (c.outfit === "hoodie" && !back) { g.rect(cx - 1, 20, cx - 1, 24, "#f2f2f2"); g.rect(cx + 1, 20, cx + 1, 24, "#f2f2f2"); }
  if (!back) for (const s of [-1, 1]) { // складки под грудью, а не полоса через весь торс
    const x = cx + s * 3 - (s > 0 ? 1 : 0);
    g.rect(x - 1, 24 - breathe, x + 1, 24 - breathe, shade(t, 0.86));
  }
  // шея
  g.rect(cx - 1, 17, cx, 18, c.skin);
}

function drawFront(c, t, back = false) {
  const g = new Grid();
  const cx = 24, cy = 11;
  const breathe = Math.floor(t * 1.2) % 2;
  const blink = !back && t % 4 < 0.15;
  if (back) tail(g, c, cx + 1, 30, 1, Math.sin(t * 3) * 1.5);
  hairBack(g, c, cx, cy, back ? "back" : "front");
  if (!back) tail(g, c, cx + 6, 31, 1, Math.sin(t * 3) * 1.5);
  bodyFront(g, c, cx, back, breathe);
  g.ellipse(cx - 0.5, cy, 6.5, 6.5, c.skin);
  ears(g, c, cx - 0.5, cy - 5, false);
  hairFront(g, c, cx - 0.5, cy, back ? "back" : "front");
  if (!back) eyesFront(g, c, cx - 0.5, cy, blink);
  if (back) hairBack(g, c, cx, cy, "back");
  if (back) ears(g, c, cx - 0.5, cy - 5, false);
  return finish(g);
}

// ---------- сбоку ----------
function drawSide(c, t, walking) {
  const g = new Grid();
  const cx = 24, cy = 11, d = 1;
  const ph = walking ? t * 9 : 0;
  const swing = walking ? Math.sin(ph) : 0;
  const bob = walking ? (Math.abs(Math.cos(ph)) > 0.7 ? 0 : 1) : 0;
  const hipY = 32 + bob;
  const leg = (s, col) => {
    const fx = cx + s * 5, fy = 43 + bob - (s > 0 ? Math.max(0, swing) * 2 : 0);
    const kx = cx + s * 2.5, ky = hipY + 6;
    g.line(cx, hipY, kx, ky, col, 3); g.line(kx, ky, fx, fy, col, 3);
    g.rect(Math.round(fx) - 1, Math.round(fy), Math.round(fx) + 2, Math.round(fy) + 1, shade(c.shoes, col === c.legs ? 1 : 0.75));
  };
  // дальние рука и нога
  leg(-swing, shade(c.legs, 0.8));
  const armCol = c.outfit === "sport" ? c.skin : c.top;
  g.line(cx, 21 + bob, cx + swing * 4, 29 + bob, shade(armCol, 0.8), 2);
  hairBack(g, c, cx, cy + bob, "side", d);
  tail(g, c, cx - 4, 30 + bob, -1, Math.sin(t * 3) * 1.5);
  leg(swing, c.legs);
  // юбка/шорты
  if (c.outfit === "dress" || c.outfit === "office") g.poly([[cx - 4, 29 + bob], [cx + 4, 29 + bob], [cx + 6, 35 + bob], [cx - 6, 35 + bob]], c.bottom);
  else g.rect(cx - 4, 29 + bob, cx + 4, 33 + bob, c.bottom);
  // торс сбоку, грудь вперёд
  g.poly([[cx - 3, 19 + bob], [cx + 3, 19 + bob], [cx + 5, 22 + bob], [cx + 4, 25 + bob], [cx + 3, 29 + bob], [cx - 3, 29 + bob]], c.top);
  if (c.outfit === "office") g.poly([[cx - 3, 19 + bob], [cx + 1, 19 + bob], [cx + 1, 29 + bob], [cx - 3, 29 + bob]], c.vest);
  if (c.outfit === "sport") g.rect(cx - 3, 26 + bob, cx + 3, 29 + bob, c.skin);
  g.rect(cx - 1, 17 + bob, cx, 18 + bob, c.skin);
  // голова
  g.ellipse(cx, cy + bob, 6.5, 6.5, c.skin);
  ears(g, c, cx - 1, cy - 5 + bob, true);
  hairFront(g, c, cx, cy + bob, "side");
  g.rect(cx - 7, cy - 2 + bob, cx - 2, cy + 4 + bob, c.hair);
  const ex = cx + 3;
  if (t % 4 < 0.15) g.rect(ex, cy + 1 + bob, ex + 1, cy + 1 + bob, "#3a2430");
  else { g.rect(ex, cy + bob, ex + 1, cy + bob, "#2a1a24"); g.rect(ex, cy + 1 + bob, ex + 1, cy + 2 + bob, c.eye); g.set(ex, cy + 1 + bob, "#ffffff"); }
  g.set(ex + 1, cy + 3 + bob, "#f19aa0");
  g.set(cx + 5, cy + 4 + bob, shade(c.skin, 0.7));
  // ближняя рука
  g.line(cx, 21 + bob, cx - swing * 4, 29 + bob, armCol, 2);
  g.rect(Math.round(cx - swing * 4), 30 + bob, Math.round(cx - swing * 4) + 1, 31 + bob, c.skin);
  return finish(g);
}

// ---------- отжимания ----------
function drawPushup(c, t) {
  const g = new Grid();
  const k = (1 - Math.cos(t * 4)) / 2; // 0 — руки прямые, 1 — внизу
  const sy = Math.round(35 + k * 5); // плечи
  const hy = Math.round(39 + k * 3); // бёдра
  const footX = 6, footY = 43;
  const shX = 31, hipX = 18;
  tail(g, c, hipX - 2, hy - 1, -1, Math.sin(t * 5) * 1.5);
  // дальняя рука
  const armCol = c.outfit === "sport" ? c.skin : c.top;
  const elbow = [shX - k * 3, sy + (44 - sy) / 2 + k];
  g.line(shX - 1, sy, elbow[0] - 1, elbow[1], shade(armCol, 0.8), 2);
  g.line(elbow[0] - 1, elbow[1], shX - 1, 44, shade(armCol, 0.8), 2);
  // ноги
  g.line(hipX, hy, footX + 2, footY - 1, c.legs, 3);
  g.rect(footX - 1, footY - 1, footX + 1, footY + 1, c.shoes);
  // низ
  if (c.outfit === "dress" || c.outfit === "office") g.poly([[hipX - 5, hy - 2], [hipX + 4, hy - 3], [hipX + 4, hy + 2], [hipX - 6, hy + 3]], c.bottom);
  else g.line(hipX - 3, hy, hipX + 3, hy - 0.5, c.bottom, 4);
  // торс
  g.line(hipX + 3, hy - 0.5, shX, sy, c.top, 5);
  if (c.outfit === "office") g.line(hipX + 3, hy - 1.5, shX, sy - 1, c.vest, 2.5);
  // голова: смотрит вперёд-вниз
  const hx = shX + 6, hyy = sy - 3;
  hairBack(g, c, hx, hyy, "side", 1);
  g.ellipse(hx, hyy, 6, 6, c.skin);
  ears(g, c, hx - 1, hyy - 5, true);
  hairFront(g, c, hx, hyy, "side");
  g.rect(hx - 6, hyy - 2, hx - 2, hyy + 4, c.hair);
  g.rect(hx + 3, hyy, hx + 4, hyy, "#2a1a24"); g.rect(hx + 3, hyy + 1, hx + 4, hyy + 2, c.eye); g.set(hx + 3, hyy + 1, "#fff");
  g.set(hx + 4, hyy + 3, "#f19aa0");
  // ближняя рука
  g.line(shX, sy, elbow[0], elbow[1], armCol, 2);
  g.line(elbow[0], elbow[1], shX, 44, armCol, 2);
  g.rect(shX, 44, shX + 1, 44, c.skin);
  return finish(g);
}

// ---------- кадр по действию ----------
export function frame(c, act, t) {
  if (act === "walk") return { g: drawSide(c, t, true), flip: false };
  if (act === "pushup") return { g: drawPushup(c, t), flip: false };
  if (act === "spin") {
    const i = Math.floor(t * 5) % 4;
    if (i === 0) return { g: drawFront(c, t), flip: false };
    if (i === 1) return { g: drawSide(c, t, false), flip: false };
    if (i === 2) return { g: drawFront(c, t, true), flip: false };
    return { g: drawSide(c, t, false), flip: true };
  }
  return { g: drawFront(c, t), flip: false };
}

export function paint(cv, c, act, t, mirror = false) {
  const ctx = cv.getContext("2d");
  const { g, flip } = frame(c, act, t);
  const img = ctx.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    const col = g.c[i];
    if (!col) continue;
    const [r, gg, b] = hex(col);
    const x = i % W, y = (i / W) | 0;
    const j = (y * W + (flip !== mirror ? W - 1 - x : x)) * 4;
    img.data[j] = r; img.data[j + 1] = gg; img.data[j + 2] = b; img.data[j + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

