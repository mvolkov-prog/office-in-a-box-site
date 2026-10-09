import { W, H, PRESETS, randomGirl, paint } from "./girls.js";

const KIND = { fox: "Лиса", cat: "Кошка", bunny: "Зайка", wolf: "Волчица" };
const OUTFIT = { office: "офис", hoodie: "худи", dress: "платье", sport: "спорт" };
const STYLE = { bob: "каре", long: "длинные", twin: "хвостики", pony: "хвост" };
const LINES = {
  idle: ["Ммм, кофе…", "Опять понедельник?", "Где мой степлер?", "Привет 👋"],
  pushup: ["Раз… два…", "Ещё десять!", "За зелёный пайплайн!"],
  spin: ["Та-дам!", "Как я тебе?", "Новое платье!"],
  walk: ["Сейчас вернусь", "Иду за кофе", "Совещание? Уже бегу"],
  poke: ["Ой! Что, босс?", "Не смотри так 😳", "Я работаю, честно!", "Похвалишь?"],
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- живой офис в шапке ----------
const office = document.getElementById("office");
const SCALE = () => (office.clientWidth < 600 ? 3 : 4);
const actors = PRESETS.map((c, i) => {
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  cv.setAttribute("aria-label", c.name);
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  office.append(cv, bubble);
  const a = { c, cv, bubble, x: 0.15 + i * 0.23, act: "idle", target: null, until: 0, dir: 1, sayUntil: 0 };
  cv.onclick = () => { a.act = "spin"; a.until = performance.now() / 1000 + 1.6; a.target = null; say(a, pick(LINES.poke)); };
  return a;
});

function say(a, text) {
  a.bubble.textContent = text;
  a.bubble.classList.add("on");
  a.sayUntil = performance.now() / 1000 + 2.4;
}

function decide(a, t) {
  const r = Math.random();
  if (r < 0.45) { a.act = "walk"; a.target = 0.08 + Math.random() * 0.84; a.until = t + 12; }
  else if (r < 0.65) { a.act = "pushup"; a.until = t + 3 + Math.random() * 3; }
  else if (r < 0.75) { a.act = "spin"; a.until = t + 1.6; }
  else { a.act = "idle"; a.until = t + 2 + Math.random() * 4; }
  if (Math.random() < 0.3 && actors.every((o) => o.sayUntil < t)) say(a, pick(LINES[a.act]));
}

let last = 0;
function tick(ms) {
  const t = ms / 1000, dt = Math.min(0.05, t - last); last = t;
  const s = SCALE(), Wd = office.clientWidth, floorTop = office.clientHeight - 54;
  for (const a of actors) {
    if (!reduced && t > a.until) decide(a, t);
    if (a.act === "walk" && a.target != null) {
      const d = a.target - a.x;
      a.dir = d >= 0 ? 1 : -1;
      a.x += a.dir * Math.min(Math.abs(d), (60 / Wd) * dt);
      if (Math.abs(d) < 0.002) { a.act = "idle"; a.until = t + 1 + Math.random() * 2; a.target = null; }
    }
    paint(a.cv, a.c, reduced ? "idle" : a.act, t + a.x * 7, a.act === "walk" && a.dir < 0);
    a.cv.style.width = W * s + "px"; a.cv.style.height = H * s + "px";
    const left = a.x * Wd - (W * s) / 2;
    a.cv.style.left = left + "px";
    a.cv.style.top = floorTop - 45 * s + 10 + "px";
    a.bubble.style.left = a.x * Wd + "px";
    a.bubble.style.top = floorTop - 40 * s + "px";
    if (t > a.sayUntil) a.bubble.classList.remove("on");
  }
  genTick(t);
  requestAnimationFrame(tick);
}

// ---------- генератор ----------
const genCv = document.getElementById("genCv");
genCv.style.width = W * 5 + "px"; genCv.style.height = H * 5 + "px";
let girl = { ...PRESETS[0] };
let genAct = "idle";
function syncChips() {
  for (const b of document.querySelectorAll(".chip")) {
    const v = b.dataset.k === "act" ? genAct : girl[b.dataset.k];
    b.setAttribute("aria-pressed", String(v === b.dataset.v));
  }
  document.getElementById("genName").textContent = KIND[girl.kind] ?? "Новенькая";
  document.getElementById("genMeta").textContent = `${OUTFIT[girl.outfit]} · ${STYLE[girl.style]}`;
}
for (const b of document.querySelectorAll(".chip")) {
  b.onclick = () => {
    if (b.dataset.k === "act") genAct = b.dataset.v;
    else girl = { ...girl, [b.dataset.k]: b.dataset.v };
    syncChips();
  };
}
document.getElementById("genRand").onclick = () => { girl = randomGirl(); syncChips(); };
syncChips();
function genTick(t) { paint(genCv, girl, reduced ? "idle" : genAct, t); }

requestAnimationFrame(tick);
