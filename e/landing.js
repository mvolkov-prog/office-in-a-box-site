// Вариант E «Мой первый день в роли босса»: курсор — взгляд босса, клик — похвала.
import { PRESETS, randomGirl, paint } from "../girls.js";
import { Office } from "../scene.js";
import { T, LINES } from "./i18n-e.js";

document.documentElement.classList.add("js");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = {
  get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* приватное окно */ } },
};
let lang = store.get("oib.lang", navigator.language?.startsWith("ru") ? "ru" : "en");
if (!T[lang]) lang = "ru";
let tone = store.get("oib.e.tone", "bold");
// Pixelify Sans склеивает «fi» в «A» даже с liga 0 — разбиваем пару невидимым ZWNJ
const unfi = (s) => s.replace(/f(?=[iíl])/g, "f‌");
const t = (k) => unfi(T[lang][k] ?? T.ru[k] ?? k);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const now = () => performance.now() / 1000;
const visits = +store.get("oib.e.visits", "0");
store.set("oib.e.visits", String(visits + 1));

// ---------- симпатия: хранится у посетителя ----------
let aff = {};
try { aff = JSON.parse(store.get("oib.e.aff", "{}")) || {}; } catch { aff = {}; }
const getAff = (id) => Math.max(0, Math.min(10, +aff[id] || 0));
function addAff(id, d) {
  const was = getAff(id);
  aff[id] = Math.min(10, was + d);
  store.set("oib.e.aff", JSON.stringify(aff));
  renderRoster();
  return { was, now: aff[id] };
}

// ---------- героини ----------
const NAMES = { ru: { iskra: "Искра", yuki: "Юки", momo: "Момо", nori: "Нори" }, en: { iskra: "Iskra", yuki: "Yuki", momo: "Momo", nori: "Nori" } };
const cast = [
  { ...PRESETS[0], id: "iskra", call: "boss" },
  { ...PRESETS[3], outfit: "hoodie", id: "yuki", call: "chief" },
  { ...PRESETS[1], id: "momo", call: "boss" },
  { ...PRESETS[2], id: "nori", call: "chief" },
];
const nameOf = (c) => (c.hired ? c.name : NAMES[lang][c.id]);
const addrOf = (c) => (c.call === "name" && c.yourName ? c.yourName : t(c.call === "chief" ? "chief" : "boss"));
const fill = (s, c) => {
  const out = s.replaceAll("{b}", addrOf(c));
  return s.startsWith("{b}") ? out[0].toUpperCase() + out.slice(1) : out;
};
const lines = (kind) => {
  const set = LINES[lang][tone];
  if (kind === "hello" && visits > 0 && Math.random() < 0.5) return pick(lang === "ru" ? ["С возвращением, {b}", "Я скучала, {b}"] : ["Welcome back, {b}", "I missed you, {b}"]);
  if (kind === "pushup") kind = "idle"; // отжимания в этой версии не показываем
  return pick(set[kind] ?? set.idle);
};

// ---------- пиксельные оверлеи: сердечко над головой, румянец, подмигивание ----------
const HEART = [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."];
const OFF = 12; // оверлей выше девочки на 12 пикселей — там живёт сердечко
function drawFx(cv, c, fx, tt) {
  const ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, cv.width, cv.height);
  const px = (x, y, col) => { ctx.fillStyle = col; ctx.fillRect(x, y + OFF, 1, 1); };
  if (fx.heart) {
    const bob = reduced ? 0 : Math.round(Math.sin(tt * 5) * 0.6);
    const y0 = -11 + bob;
    HEART.forEach((row, y) => [...row].forEach((ch, x) => ch === "X" && px(20 + x, y0 + y, y === 1 && x === 1 ? "#ffd0dc" : y > 2 ? "#c23a5e" : "#ec5c82")));
  }
  if (fx.jealous) { // облачко досады: три пикселя-«пуфа»
    const y0 = -9;
    [[18, 0], [19, -1], [20, 0], [22, -2], [23, -3], [24, -2], [26, 0], [27, -1], [28, 0]].forEach(([x, y]) => px(x, y0 + y, "#b7a4c9"));
  }
  if (!fx.face) return;
  if (fx.blush) {
    for (const [x, y] of [[17, 14], [18, 14], [19, 14], [28, 14], [29, 14], [30, 14]]) px(x, y, "#ef6f8e");
    px(18, 15, "#e05a7c"); px(29, 15, "#e05a7c");
  }
  if (fx.wink) {
    for (let y = 11; y <= 13; y++) for (let x = 26; x <= 28; x++) px(x, y, c.skin);
    px(26, 12, "#2a1a24"); px(27, 11, "#2a1a24"); px(28, 12, "#2a1a24");
  }
}

// ---------- офис на первом экране ----------
const narrow = innerWidth < 760;
const stage = document.getElementById("stage");
const officeEl = document.getElementById("heroOffice");
const layout = narrow
  ? [{ kind: "coffee", x: 0.13 }, { kind: "window", x: 0.5 }, { kind: "desk", x: 0.5 }, { kind: "sofa", x: 0.86 }]
  : [{ kind: "cooler", x: 0.05 }, { kind: "coffee", x: 0.15 }, { kind: "window", x: 0.3 }, { kind: "desk", x: 0.34 }, { kind: "desk", x: 0.52 }, { kind: "plant", x: 0.66 }, { kind: "window", x: 0.74 }, { kind: "sofa", x: 0.87 }];
const hero = new Office(officeEl, {
  layout, girls: [], lines, reduced, hour: 22, pin: { index: 1 },
  scale: () => (innerWidth < 760 ? 3 : 4), floorH: narrow ? 48 : 64,
});
hero.hour = 12; // за окном ночь, но в офисе ещё кипит работа: задержались ради босса

// реплики подставляют обращение конкретной девочки
const baseSay = hero.say.bind(hero);
hero.say = (g, text, sec) => baseSay(g, text && unfi(fill(text, g.c)), sec);
const baseDecide = hero.decide.bind(hero);
hero.decide = (g, tt) => {
  if (g.hold && tt < g.hold) return; // подошла ревновать — стоит рядом
  baseDecide(g, tt);
  if (g.act === "pushup") g.act = "idle";
  if (g.next === "pushup") g.next = "idle";
};
const fx = new Map();
function track(g) {
  const cv = document.createElement("canvas");
  cv.width = 48; cv.height = 48 + OFF;
  cv.className = "fx";
  cv.setAttribute("aria-hidden", "true");
  officeEl.appendChild(cv);
  fx.set(g, { cv, heart: 0, blush: 0, wink: 0, jealous: 0 });
  g.cv.addEventListener("click", () => praise(g));
}
function hire(c, opts) {
  const g = hero.addGirl(c, opts);
  track(g);
  return g;
}

// ---------- взгляд босса ----------
let gaze = null, gazeFrom = 0, gazeScored = false, lastJealous = 0;
const react = (g, kind) => {
  const f = fx.get(g), tt = now();
  if (!f || tt < (f.cool ?? 0)) return;
  f.cool = tt + 2.4;
  const sitting = !!g.spot?.sit && g.act !== "walk";
  const r = Math.random();
  if (kind === "look") {
    f.blush = tt + 2.6;
    if (r < 0.3 && tone === "bold") f.wink = tt + 0.9;
    else if (r < 0.5 && !sitting && !reduced && g.act !== "walk") { g.act = "spin"; g.until = tt + 0.8; }
    if (r > 0.25) f.heart = tt + 1.4;
    hero.say(g, lines("look"));
  }
};
function hitGirl(x, y) {
  let best = null, bd = Infinity;
  for (const g of hero.girls) {
    const r = g.cv.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    if (x < r.left + r.width * 0.28 || x > r.right - r.width * 0.28 || y < r.top + r.height * 0.02 || y > r.top + r.height * 0.94) continue;
    const d = Math.abs(x - cx);
    if (d < bd) { bd = d; best = g; }
  }
  return best;
}
function setGaze(g) {
  if (g === gaze) return;
  gaze = g; gazeFrom = now(); gazeScored = false;
  if (g) react(g, "look");
  for (const li of document.querySelectorAll("#roster li")) li.classList.toggle("seen", !!g && li.dataset.id === g.c.id);
}
stage.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") setGaze(hitGirl(e.clientX, e.clientY)); });
stage.addEventListener("pointerleave", () => setGaze(null));

function praise(g) {
  const f = fx.get(g), tt = now();
  if (f) { f.heart = tt + 1.6; f.blush = tt + 3; f.cool = tt + 2.4; }
  const { was, now: n } = addAff(g.c.id, 1);
  if (n >= 10 && was < 10) setTimeout(() => hero.say(g, lines("max"), 3.2), 50);
  pulse(g.c.id);
}

// ревность: долго смотришь на одну — другая подходит и встаёт рядом
function jealousy(tt) {
  if (!gaze || reduced || tt - gazeFrom < 3 || tt - lastJealous < 12) return;
  const rivals = hero.girls.filter((g) => g !== gaze && !g.pinned && g.act !== "walk");
  if (!rivals.length) return;
  lastJealous = tt;
  const r = pick(rivals), side = gaze.x > 0.5 ? -1 : 1;
  const x = Math.max(0.05, Math.min(0.95, gaze.x + side * ((30 * hero.s) / hero.Wd)));
  hero.free(r);
  hero.go(r, x, null, "idle");
  r.until = tt + 30; r.hold = tt + 9; r.jealousOf = gaze;
}
function jealousArrive(tt) {
  for (const g of hero.girls) {
    if (!g.jealousOf || g.act === "walk") continue;
    const target = g.jealousOf;
    g.jealousOf = null;
    g.until = tt + 7;
    const f = fx.get(g);
    if (f) { f.jealous = tt + 3.2; f.cool = tt + 4; }
    hero.say(g, lines("jealous"), 3);
    setTimeout(() => { const ft = fx.get(target); if (ft) ft.blush = now() + 2.5; hero.say(target, lines("reply"), 2.8); }, 1500);
  }
}

// ---------- кадр: оверлеи следуют за девочками ----------
const fxLoop = (ms) => {
  const tt = ms / 1000, s = hero.s;
  if (gaze && !gazeScored && tt - gazeFrom > 1.5) { gazeScored = true; addAff(gaze.c.id, 0.5); }
  jealousy(tt); jealousArrive(tt);
  for (const [g, f] of fx) {
    const on = { heart: tt < f.heart || (gaze === g && tt - gazeFrom > 1.5), blush: tt < f.blush || gaze === g, wink: tt < f.wink, jealous: tt < f.jealous };
    on.face = g.act !== "walk" && g.act !== "spin";
    const any = on.heart || on.jealous || (on.face && (on.blush || on.wink));
    f.cv.style.display = any ? "block" : "none";
    if (!any) continue;
    f.cv.style.width = 48 * s + "px"; f.cv.style.height = (48 + OFF) * s + "px";
    f.cv.style.left = g.cv.style.left;
    f.cv.style.top = parseFloat(g.cv.style.top) - OFF * s + "px";
    drawFx(f.cv, g.c, on, tt);
  }
  requestAnimationFrame(fxLoop);
};
requestAnimationFrame(fxLoop);

// ---------- шкала симпатии ----------
const heartSvg = (cls) => `<svg class="h ${cls}" viewBox="0 0 7 6" aria-hidden="true" shape-rendering="crispEdges"><path d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z"/><path class="half" d="M1 0h2v1h1v5H3V5H2V4H1V3H0V1h1z"/></svg>`;
const rosterEl = document.getElementById("roster");
const minis = new Map();
function renderRoster() {
  const list = hero.girls.length ? hero.girls.map((g) => g.c) : cast;
  const ids = list.map((c) => c.id).join();
  if (rosterEl.dataset.ids !== ids) {
    rosterEl.dataset.ids = ids;
    rosterEl.replaceChildren(...list.map((c) => {
      const li = document.createElement("li");
      li.dataset.id = c.id;
      li.innerHTML = `<button type="button" class="who"><canvas width="48" height="48" aria-hidden="true"></canvas><span class="nm"></span><span class="role"></span><span class="hearts" aria-hidden="true">${heartSvg("").repeat(5)}</span><span class="lvl"></span></button>`;
      const b = li.querySelector("button");
      const g = () => hero.girls.find((x) => x.c.id === c.id);
      b.onclick = () => { const x = g(); if (x) { hero.poke(x); praise(x); } };
      b.onfocus = () => setGaze(g() ?? null);
      b.onblur = () => setGaze(null);
      minis.set(c.id, { cv: li.querySelector("canvas"), c });
      return li;
    }));
  }
  for (const li of rosterEl.children) {
    const c = list.find((x) => x.id === li.dataset.id), a = getAff(c.id);
    li.querySelector(".nm").textContent = nameOf(c);
    li.querySelector(".role").textContent = t(c.hired ? "role.new" : `role.${c.kind}`);
    li.querySelector(".lvl").textContent = t(`lvl.${Math.min(5, Math.floor(a / 2))}`);
    [...li.querySelectorAll(".h")].forEach((h, i) => h.setAttribute("class", `h ${a >= (i + 1) * 2 ? "full" : a >= i * 2 + 1 ? "halfon" : ""}`));
    li.querySelector("button").setAttribute("aria-label", `${t("roster.praise")}: ${nameOf(c)}. ${t("roster.label")} ${Math.floor(a)}/10, ${t(`lvl.${Math.min(5, Math.floor(a / 2))}`)}`);
  }
}
function pulse(id) {
  const li = rosterEl.querySelector(`li[data-id="${id}"]`);
  if (!li || reduced) return;
  li.classList.remove("pulse"); void li.offsetWidth; li.classList.add("pulse");
}
const miniLoop = (ms) => {
  for (const [, { cv, c }] of minis) if (cv.isConnected) paint(cv, c, "idle", ms / 1000);
  requestAnimationFrame(miniLoop);
};
requestAnimationFrame(miniLoop);

// ---------- один момент на загрузке: входят по одной, потом все разом смотрят на тебя ----------
cast.forEach((c, i) => setTimeout(() => {
  hire(c, { fromDoor: !reduced, x: reduced ? [0.2, 0.34, 0.6, 0.8][i] : undefined });
  renderRoster();
}, reduced ? 0 : 300 + i * 750));
if (!reduced) setTimeout(() => {
  hero.girls.forEach((g, i) => setTimeout(() => { const f = fx.get(g); if (f) { f.heart = now() + 1.6; f.blush = now() + 2; } }, i * 140));
}, 300 + cast.length * 750 + 2600);

// ---------- переписка в дневнике ----------
const yuki = cast[1];
const avas = [...document.querySelectorAll(".ava")];
const avaLoop = (ms) => { for (const cv of avas) paint(cv, yuki, "idle", ms / 1000); requestAnimationFrame(avaLoop); };
requestAnimationFrame(avaLoop);
const brand = document.getElementById("brandCv");
const brandLoop = (ms) => { paint(brand, cast[0], "idle", reduced ? 1 : ms / 1000); requestAnimationFrame(brandLoop); };
requestAnimationFrame(brandLoop);

// ---------- анкета ----------
const HAIR = ["#e0642a", "#a98ad8", "#f0cc6a", "#8fa2c4", "#3a2a2a", "#e9e4dc", "#5fbf9a", "#d94f6a"];
const NEW_NAMES = { ru: ["Вишня", "Ириска", "Пуговка", "Мята", "Тучка", "Ласка", "Кнопка", "Зефирка"], en: ["Cherry", "Toffee", "Button", "Minty", "Cloudy", "Maple", "Pixel", "Mochi"] };
let girl = { ...PRESETS[2], hair: "#d94f6a", style: "long", call: "boss" };
const nameIn = document.getElementById("hireName"), yourIn = document.getElementById("yourName");
nameIn.value = NEW_NAMES[lang][0];
const hireCv = document.getElementById("hireCv"), hireFx = document.getElementById("hireFx");
const previewSay = document.getElementById("previewSay");
let hireAct = "idle", hireUntil = 0, previewBlush = 0;
const hireLoop = (ms) => {
  const s = ms / 1000;
  if (s > hireUntil) hireAct = "idle";
  paint(hireCv, girl, reduced ? "idle" : hireAct, s);
  const on = { face: hireAct === "idle", blush: s < previewBlush, heart: s < previewBlush };
  drawFx(hireFx, girl, on, s);
  requestAnimationFrame(hireLoop);
};
requestAnimationFrame(hireLoop);
const twirl = () => { hireAct = "spin"; hireUntil = now() + 1.1; };
document.querySelector(".preview").addEventListener("pointerenter", () => (previewBlush = now() + 2.4));

const sw = document.getElementById("swatches");
for (const c of HAIR) {
  const b = Object.assign(document.createElement("button"), { type: "button", className: "swatch" });
  b.style.setProperty("--c", c);
  b.dataset.color = c;
  b.onclick = () => { girl = { ...girl, hair: c }; syncHire(); twirl(); };
  sw.appendChild(b);
}
for (const group of document.querySelectorAll(".chips[data-k]")) {
  for (const b of group.querySelectorAll(".chip")) b.onclick = () => {
    girl = { ...girl, [group.dataset.k]: b.dataset.v };
    syncHire();
    if (group.dataset.k === "call") { previewBlush = now() + 2; if (b.dataset.v === "name") yourIn.focus(); } else twirl();
  };
}
yourIn.oninput = () => syncHire();
function syncHire() {
  for (const group of document.querySelectorAll(".chips[data-k]"))
    for (const b of group.querySelectorAll(".chip")) b.setAttribute("aria-pressed", String(girl[group.dataset.k] === b.dataset.v));
  [...sw.children].forEach((b, i) => { b.setAttribute("aria-pressed", String(b.dataset.color === girl.hair)); b.setAttribute("aria-label", `${t("f.color")} ${i + 1}`); });
  document.getElementById("yourNameRow").hidden = girl.call !== "name";
  previewSay.textContent = unfi(fill(T[lang]["hire.preview"], { ...girl, yourName: yourIn.value.trim() }));
}
document.getElementById("randBtn").onclick = () => {
  girl = { ...randomGirl(), call: girl.call };
  if (girl.outfit === "sport") girl.outfit = "hoodie";
  nameIn.value = pick(NEW_NAMES[lang]);
  syncHire(); twirl();
};
const toast = document.getElementById("toast");
let hiredN = 0, toastTimer = 0;
document.getElementById("hireForm").onsubmit = (e) => {
  e.preventDefault();
  const c = { ...girl, id: `new${++hiredN}`, hired: true, name: nameIn.value.trim() || pick(NEW_NAMES[lang]), yourName: yourIn.value.trim() };
  const hired = hero.girls.filter((g) => g.c.hired);
  let full = false;
  if (hired.length >= 3) {
    const g = hired[0];
    hero.girls.splice(hero.girls.indexOf(g), 1);
    hero.free(g); g.cv.remove(); g.bubble.remove(); fx.get(g)?.cv.remove(); fx.delete(g);
    full = true;
  }
  hire(c, { fromDoor: !reduced, x: reduced ? 0.12 : undefined });
  if (reduced) hero.say(hero.girls.at(-1), lines("hello"));
  renderRoster();
  const look = Object.assign(document.createElement("a"), { href: "#top", className: "inline", textContent: t("hire.look") });
  toast.replaceChildren(`${t("hire.hired")} ${full ? t("hire.full") + " " : ""}`, look);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.replaceChildren(), 9000);
};

// ---------- подарить портрет ----------
for (const b of document.querySelectorAll("[data-gift]")) {
  b.onclick = () => {
    const id = b.dataset.gift;
    for (const o of document.querySelectorAll("[data-gift]")) if (o !== b) { o.classList.remove("given"); o.querySelector(".say").textContent = ""; }
    b.classList.add("given");
    b.querySelector(".say").textContent = t(`gift.${id}`);
    addAff(id, 1);
  };
}

// ---------- подвал: офис засыпает ----------
const foot = new Office(document.getElementById("footOffice"), {
  layout: [{ kind: "plant", x: 0.06 }, { kind: "sofa", x: 0.5 }, { kind: "cooler", x: 0.94 }],
  girls: cast.map((c) => ({ ...c })), lines: (k) => (k === "sofa" || k === "idle" ? T[lang]["foot.bye"] : lines(k)), scale: () => 2, floorH: 30, reduced, hour: 23,
});
const footSay = foot.say.bind(foot);
foot.say = (g, text, sec) => footSay(g, text && unfi(fill(text, g.c)), sec);

// ---------- язык и тон ----------
function applyI18n() {
  document.documentElement.lang = lang;
  document.title = t("brand");
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll("[data-i18n-label]")) el.setAttribute("aria-label", t(el.dataset.i18nLabel));
  for (const el of document.querySelectorAll(".frame")) el.querySelector(".nm").textContent = NAMES[lang][el.dataset.gift];
  for (const b of document.querySelectorAll("[data-lang]")) b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
  for (const b of document.querySelectorAll("[data-tone]")) b.setAttribute("aria-pressed", String(b.dataset.tone === tone));
  document.querySelector(".skip").textContent = lang === "ru" ? "К содержанию" : "Skip to content";
  document.documentElement.dataset.tone = tone;
  syncHire();
  renderRoster();
}
for (const b of document.querySelectorAll("[data-lang]")) b.onclick = () => { lang = b.dataset.lang; store.set("oib.lang", lang); applyI18n(); };
for (const b of document.querySelectorAll("[data-tone]")) b.onclick = () => {
  tone = b.dataset.tone; store.set("oib.e.tone", tone); applyI18n();
  const g = hero.girls.find((x) => !x.pinned);
  if (g) hero.say(g, lines(tone === "bold" ? "look" : "poke"));
};

applyI18n();
