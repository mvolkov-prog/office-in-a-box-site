// Маленькие пиксельные штучки: чашка, сердце, звезда, солнце, облако. Рисуются из строк.
const COL = { n: "#1d2147", w: "#ffffff", c: "#7a3f22", s: "#8f9bc4", p: "#ff5d8f", y: "#ffd23f", o: "#ff9f1c", b: "#e3f1ff", l: "#cfe3f7" };
const ART = {
  cup: ["..s..s.....", "...s..s....", "...........", "nnnnnnnnn..", "nwwwwwwwnnn", "nwccccwwn.n", "nwwwwwwwn.n", ".nwwwwwnnnn", "..nnnnnn..."],
  heart: [".nn.nn.", "nppnppn", "npppppn", ".npppn.", "..npn..", "...n..."],
  star: ["...n...", "..nyn..", "nnnyynn".replace("nnnyynn", "nnyyynn"), ".nyyyn.", "nyyyyyn", "nyynyyn", ".n...n."],
};
export function sprite(name, scale = 4) {
  const rows = ART[name], cv = document.createElement("canvas");
  cv.width = rows[0].length; cv.height = rows.length;
  cv.style.width = cv.width * scale + "px"; cv.style.height = cv.height * scale + "px";
  cv.setAttribute("aria-hidden", "true");
  const ctx = cv.getContext("2d");
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (COL[ch]) { ctx.fillStyle = COL[ch]; ctx.fillRect(x, y, 1, 1); } }));
  return cv;
}
export function sun(scale = 5) {
  const N = 17, cv = document.createElement("canvas"); cv.width = cv.height = N;
  const ctx = cv.getContext("2d"), c = 8;
  const dot = (x, y, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, 1, 1); };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const d = Math.hypot(x - c, y - c);
    if (d <= 4.6) dot(x, y, d > 3.6 ? "#ff9f1c" : "#ffd23f");
    else if ((x === c || y === c || Math.abs(x - c) === Math.abs(y - c)) && d >= 6.2 && d <= 8.2) dot(x, y, "#ffb81f");
  }
  cv.style.width = cv.style.height = N * scale + "px"; cv.setAttribute("aria-hidden", "true");
  return cv;
}
export function cloud(scale = 5) {
  const w = 22, h = 9, cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d");
  const blobs = [[6, 6, 5, 3], [12, 4, 6, 4], [17, 6, 4, 3]];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let inn = false;
    for (const [cx, cy, rx, ry] of blobs) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) inn = true;
    if (inn && y <= 7) { ctx.fillStyle = y >= 6 ? "#d4e9fb" : "#ffffff"; ctx.fillRect(x, y, 1, 1); }
  }
  cv.style.width = w * scale + "px"; cv.style.height = h * scale + "px"; cv.setAttribute("aria-hidden", "true");
  return cv;
}
