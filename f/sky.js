// Ночное небо к дневному из c/sprites.js: луна-серп и звёзды-крестики, пикселями.
const canvas = (w, h, scale) => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  cv.style.width = w * scale + "px"; cv.style.height = h * scale + "px";
  cv.setAttribute("aria-hidden", "true");
  return cv;
};

export function moon(scale = 5) {
  const N = 15, cv = canvas(N, N, scale), ctx = cv.getContext("2d");
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const inA = Math.hypot(x - 7, y - 7) <= 6.4, inB = Math.hypot(x - 10.5, y - 5) <= 5.6;
    if (!inA || inB) continue;
    ctx.fillStyle = Math.hypot(x - 10.5, y - 5) <= 6.8 ? "#f4d79a" : "#ffe9b8";
    ctx.fillRect(x, y, 1, 1);
  }
  return cv;
}

export function star(scale = 3, big = false) {
  const N = big ? 5 : 3, cv = canvas(N, N, scale), ctx = cv.getContext("2d"), c = (N - 1) / 2;
  ctx.fillStyle = "#ffe9c4";
  for (let i = 0; i < N; i++) { ctx.fillRect(c, i, 1, 1); ctx.fillRect(i, c, 1, 1); }
  if (big) { ctx.fillStyle = "#fff6e4"; ctx.fillRect(c, c, 1, 1); }
  return cv;
}
