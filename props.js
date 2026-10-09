// Пиксельная мебель кодом — тот же приём, что у девочек: фигуры на сетке + автотень и контур.
import { Grid, finish, shade, hex, W, H } from "./girls.js";

const WOOD = "#b8754a", WOOD_D = "#8f5536", NAVY = "#2e3a63", CREAM = "#efe2c8", GREEN = "#5cae7a";

export function paintGrid(cv, g) {
  const ctx = cv.getContext("2d");
  const img = ctx.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    const col = g.c[i];
    if (!col) continue;
    const [r, gg, b] = hex(col);
    img.data.set([r, gg, b, 255], i * 4);
  }
  ctx.putImageData(img, 0, 0);
}

/** Стол спереди: столешница и панель. Закрывает ноги той, кто «сидит». glow — цвет экрана ноутбука. */
export function deskFront(glow = "#8fd3ff") {
  const g = new Grid();
  g.rect(2, 29, 45, 31, WOOD);
  g.rect(2, 31, 45, 31, WOOD_D);
  g.rect(4, 32, 43, 44, NAVY);
  g.rect(6, 34, 20, 38, shade(NAVY, 1.25));
  g.rect(12, 36, 14, 36, "#d9c08a");
  g.rect(4, 44, 6, 45, NAVY); g.rect(41, 44, 43, 45, NAVY);
  // ноутбук сбоку, экраном к ней
  g.poly([[30, 17], [41, 17], [42, 28], [31, 28]], "#3b4250");
  g.poly([[31, 18], [40, 18], [41, 27], [32, 27]], glow);
  g.rect(28, 28, 44, 28, "#c7ccd6");
  // кружка и лампа
  g.rect(8, 25, 11, 28, CREAM); g.set(12, 26, CREAM); g.set(12, 27, CREAM);
  g.line(5, 28, 5, 18, "#3b4250", 1); g.line(5, 18, 9, 15, "#3b4250", 1);
  g.poly([[7, 13], [12, 13], [13, 17], [6, 17]], "#e6a94a");
  return finish(g);
}

/** Свет лампы и экрана — отдельный слой, чтобы гасить днём и зажигать вечером. */
export function deskGlow(glow = "#8fd3ff") {
  const g = new Grid();
  // сплошной конус света; мягкость даёт screen-смешивание и прозрачность слоя в scene.js
  for (let y = 17; y <= 28; y++) for (let x = 2; x <= 16; x++) if (Math.hypot(x - 9, y - 17) < 9 - (y - 17) * 0.15) g.set(x, y, y < 23 ? "#ffd98a" : "#e9b86a");
  for (let y = 18; y <= 27; y++) for (let x = 26; x <= 30; x++) g.set(x, y, glow);
  return g;
}

export function coffee() {
  const g = new Grid();
  g.rect(8, 30, 30, 44, NAVY); g.rect(8, 29, 30, 29, WOOD);
  g.rect(11, 33, 18, 41, shade(NAVY, 1.25)); g.rect(21, 33, 27, 41, shade(NAVY, 1.25));
  g.rect(12, 15, 24, 28, "#3b4250");
  g.rect(14, 17, 22, 21, "#262b36"); g.set(16, 19, "#ff8f6b"); g.set(19, 19, "#86e3c3");
  g.rect(16, 24, 19, 24, "#c7ccd6");
  g.rect(16, 26, 19, 28, CREAM);
  g.rect(26, 26, 28, 28, "#d9705a");
  return finish(g);
}

export function sofaBack() {
  const g = new Grid();
  g.rect(3, 22, 44, 36, "#c96f5b");
  g.rect(5, 24, 23, 34, shade("#c96f5b", 1.1)); g.rect(25, 24, 42, 34, shade("#c96f5b", 1.1));
  return finish(g);
}

export function sofaFront() {
  const g = new Grid();
  g.rect(3, 35, 44, 41, "#d98470");
  g.rect(1, 28, 5, 42, "#b85f4c"); g.rect(42, 28, 46, 42, "#b85f4c");
  g.rect(4, 42, 6, 44, WOOD_D); g.rect(41, 42, 43, 44, WOOD_D);
  g.rect(36, 26, 41, 33, "#f0c35c"); // подушка
  return finish(g);
}

export function plant() {
  const g = new Grid();
  g.poly([[17, 34], [31, 34], [29, 44], [19, 44]], "#c27a52");
  g.rect(17, 34, 31, 35, shade("#c27a52", 1.15));
  for (const [x, y, rx, ry] of [[24, 24, 3, 9], [18, 26, 3, 6], [30, 25, 3, 7], [21, 18, 2, 6], [28, 17, 2, 6], [24, 14, 2, 5]])
    g.ellipse(x, y, rx, ry, GREEN);
  g.ellipse(26, 22, 1.5, 4, shade(GREEN, 1.2));
  return finish(g);
}

export function cooler() {
  const g = new Grid();
  g.rect(15, 26, 31, 44, "#e7e9ef");
  g.rect(18, 30, 28, 33, "#c7ccd6"); g.set(20, 31, "#5aa6e6"); g.set(26, 31, "#e65a5a");
  g.ellipse(23, 17, 7, 9, "#9fd6f5");
  g.rect(21, 7, 25, 9, "#7cc3ea");
  g.ellipse(20, 15, 1.5, 4, "#d6f0ff");
  return finish(g);
}

export function shelf() {
  const g = new Grid();
  g.rect(8, 6, 39, 44, WOOD);
  g.rect(10, 8, 37, 17, "#5b4a3b"); g.rect(10, 20, 37, 29, "#5b4a3b"); g.rect(10, 32, 37, 42, "#5b4a3b");
  const books = ["#e07a5f", "#81b29a", "#f2cc8f", "#6f7fd6", "#ff8fb4", "#86e3c3"];
  let x = 11;
  for (let i = 0; i < 9; i++) { const w = 2 + (i % 2); g.rect(x, 10 + (i % 3), x + w - 1, 17, books[i % books.length]); x += w + 1; }
  g.rect(12, 23, 20, 29, "#efe2c8"); g.rect(24, 22, 26, 29, "#6f7fd6"); g.rect(27, 24, 29, 29, "#e07a5f");
  g.ellipse(18, 38, 4, 4, "#5cae7a"); g.rect(28, 34, 35, 42, "#2e3a63");
  return finish(g);
}

/** Окно с городом. sky — [верх, низ], lit — доля горящих окон. */
export function windowView(sky, lit, seed = 3) {
  const g = new Grid();
  g.rect(2, 4, 45, 38, "#e8dcc4");
  for (let y = 6; y <= 36; y++) {
    const t = (y - 6) / 30;
    const [a, b] = sky.map(hex);
    const col = "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
    g.rect(4, y, 43, y, col);
  }
  let r = seed;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  let x = 4;
  while (x < 43) {
    const w = 4 + Math.floor(rnd() * 5), h = 8 + Math.floor(rnd() * 16);
    g.rect(x, 37 - h, Math.min(43, x + w - 1), 36, "#2a2747");
    for (let yy = 37 - h + 2; yy < 35; yy += 3) for (let xx = x + 1; xx < Math.min(43, x + w - 1); xx += 2) if (rnd() < lit) g.set(xx, yy, "#ffd27a");
    x += w;
  }
  g.rect(23, 4, 24, 38, "#e8dcc4"); g.rect(2, 20, 45, 21, "#e8dcc4");
  g.rect(1, 38, 46, 40, "#cdbd9f");
  return finish(g);
}
