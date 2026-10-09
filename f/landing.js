// Вариант F «Два настроения»: один лендинг, два мира.
// День («Уютно») — мир C: солнце, девочки гуляют по странице, кофе по клику, конфетти.
// Ночь («Смелее») — мир E: лампы, курсор-взгляд, румянец, ревность, шкала симпатии.
// Скелет и содержание — из A. Переключатель тона и слайдер часов двигают один и тот же режим.
import { PRESETS, randomGirl, paint } from "../girls.js";
import { Fx } from "../c/fx.js";
import { sprite, sun, cloud } from "../c/sprites.js";
import { OfficeF } from "./office-f.js";
import { Roam } from "./roam.js";
import { Gaze, drawFx } from "./gaze.js";
import { moon, star } from "./sky.js";
import { tr, LINES, NAMES, unfi } from "./i18n-f.js";

const root = document.documentElement;
root.classList.add("js");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = {
  get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* приватное окно */ } },
};
const q = new URLSearchParams(location.search);
let lang = q.get("lang") ?? store.get("oib.lang", navigator.language?.startsWith("ru") ? "ru" : "en");
if (lang !== "ru" && lang !== "en") lang = "ru";
let mode = root.dataset.mode === "night" ? "night" : "day"; // выставлен в <head> до отрисовки
const night = () => mode === "night";
const roamOK = innerWidth > 560; // на телефоне девочки не гуляют по тексту — остаются в офисе
const narrow = innerWidth < 760;
const t = (k) => tr(lang, mode, k, !roamOK);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const now = () => performance.now() / 1000;
const isNightHour = (h) => h >= 19 || h < 7;

// ---------- реплики и обращение ----------
const addrOf = (c) => (c.call === "name" && c.yourName ? c.yourName : tr(lang, "night", c.call === "chief" ? "chief" : "boss"));
function fill(s, c) {
  if (!s.includes("{b}")) return unfi(s);
  const out = s.replaceAll("{b}", addrOf(c));
  return unfi(s.startsWith("{b}") ? out[0].toUpperCase() + out.slice(1) : out);
}
const lines = (kind) => {
  const set = LINES[lang][mode];
  if (night() && kind === "pushup") kind = "idle"; // ночью без отжиманий
  return pick(set[kind] ?? set.idle);
};

// ---------- сотрудницы ----------
const cast = {
  iskra: { ...PRESETS[0], id: "iskra", call: "boss" },
  yuki: { ...PRESETS[3], outfit: "hoodie", id: "yuki", call: "chief" },
  momo: { ...PRESETS[1], id: "momo", call: "boss" },
  nori: { ...PRESETS[2], id: "nori", call: "chief" },
};
const nameOf = (c) => (c.hired ? c.name : NAMES[lang][c.id]);
const still = (cv, c) => { const loop = (ms) => { paint(cv, c, "idle", reduced ? 1 : ms / 1000); requestAnimationFrame(loop); }; requestAnimationFrame(loop); };
still(document.getElementById("brandCv"), cast.iskra);
still(document.getElementById("yukiCv"), cast.yuki);
for (const cv of document.querySelectorAll(".ava")) still(cv, cast.yuki);

// ---------- небо ----------
document.getElementById("sunSlot").append(sun(6));
document.getElementById("moonSlot").append(moon(6));
[[8, 14, 90], [62, 8, 130], [30, 30, 70]].forEach(([l, top, d], i) => {
  const c = cloud(i === 1 ? 8 : 6);
  c.style.cssText += `;left:${l}%;top:${top}%;animation-duration:${d}s;animation-delay:-${i * 31}s`;
  document.getElementById("clouds").append(c);
});
[[6, 90, 1], [18, 40, 0], [27, 150, 0], [36, 64, 1], [52, 30, 0], [58, 170, 0], [66, 84, 1], [78, 44, 0], [88, 120, 0], [95, 60, 1], [12, 210, 0], [47, 230, 0]].forEach(([l, top, big]) => {
  const s = star(3, !!big);
  s.style.left = l + "%"; s.style.top = top + "px";
  document.getElementById("stars").append(s);
});
if (roamOK) document.getElementById("hintCup").append(sprite("cup", 3));

// ---------- офис на первом экране ----------
const officeEl = document.getElementById("heroOffice");
const fx = new Fx(document.getElementById("fx"), reduced);
const hero = new OfficeF(officeEl, {
  layout: narrow
    ? [{ kind: "coffee", x: 0.16 }, { kind: "window", x: 0.5 }, { kind: "desk", x: 0.5 }, { kind: "sofa", x: 0.84 }]
    : [{ kind: "cooler", x: 0.07 }, { kind: "coffee", x: 0.2 }, { kind: "window", x: 0.3 }, { kind: "desk", x: 0.38 }, { kind: "desk", x: 0.58 }, { kind: "sofa", x: 0.85 }],
  girls: [], lines, fill, calm: night, scale: () => 3, reduced, hour: night() ? 22 : 13, pin: { index: 1 },
  onRemove: (g) => gaze.untrack(g),
});
hero.setSky(night() ? 22 : 13, night() ? 12 : 15);
const gaze = new Gaze({ office: hero, stage: document.getElementById("stage"), roster: document.getElementById("roster"), lines, t, nameOf, store, reduced });
const hire = (c, opts) => { const g = hero.addGirl(c, opts); gaze.track(g); return g; };

// по странице гуляют только днём и только на широком экране
const roam = roamOK ? new Roam(document.getElementById("roam"), { lines: (k) => unfi(lines(k)), reduced, fx, scale: 2 }) : null;
const stageEl = document.getElementById("stage");
if (roam) {
  roam.add({ ...cast.momo }, { on: stageEl });
  roam.add({ ...cast.nori }, { on: stageEl });
  addEventListener("load", () => roam.scan());
  roam.setActive(!night());
}

// ночью все, кто гулял, возвращаются в офис; днём снова выбегают
const visitors = new Map(); // девочка со страницы → её копия в офисе
function bringIn(delay = 500) {
  if (!roam) return;
  roam.girls.slice(-4).forEach((rg, i) => setTimeout(() => {
    if (!night() || visitors.has(rg)) return;
    const c = rg.c.outfit === "sport" ? { ...rg.c, outfit: "hoodie" } : rg.c; // ночной дресс-код
    visitors.set(rg, hire(c, { fromDoor: !reduced, x: reduced ? 0.55 + i * 0.1 : undefined }));
  }, reduced ? 0 : delay + i * 500));
}
function sendOut() { for (const [, g] of visitors) hero.removeGirl(g); visitors.clear(); }

// один момент на загрузке: сотрудницы заходят по одной
const first = roam ? ["iskra", "yuki"] : ["iskra", "yuki", "momo", "nori"];
first.forEach((id, i) => setTimeout(() => hire({ ...cast[id] }, { fromDoor: !reduced, x: reduced ? 0.15 + i * 0.2 : undefined }), reduced ? 0 : 350 + i * 650));
if (roam && night()) bringIn(350 + first.length * 650);
if (night()) gaze.glance(reduced ? 0 : 4200);

// ---------- редактор: Юки правит тест ----------
const CODE_BY = {
  ru: [
    [["c", ""]],
    [["k", "import"], ["", " { parseUser } "], ["k", "from"], ["s", " \"./api\""], ["", ";"]],
    [["", ""]],
    [["f", "test"], ["", "("], ["s", "\"парсит дату регистрации\""], ["", ", () => {"]],
    [["", "  "], ["k", "const"], ["", " u = parseUser({ joined: "], ["s", "\"2026-10-09\""], ["", " });"]],
    [["", "  "], ["f", "expect"], ["", "(u.joined).toBeInstanceOf(Date);"]],
    [["", "});"]],
  ],
  en: [
    [["c", ""]],
    [["k", "import"], ["", " { parseUser } "], ["k", "from"], ["s", " \"./api\""], ["", ";"]],
    [["", ""]],
    [["f", "test"], ["", "("], ["s", "\"parses the signup date\""], ["", ", () => {"]],
    [["", "  "], ["k", "const"], ["", " u = parseUser({ joined: "], ["s", "\"2026-10-09\""], ["", " });"]],
    [["", "  "], ["f", "expect"], ["", "(u.joined).toBeInstanceOf(Date);"]],
    [["", "});"]],
  ],
};
const TOOLS = { ru: ["читает src/api.test.ts", "запускает: pnpm test", "правит src/api.ts", "43 из 43 зелёные"], en: ["reading src/api.test.ts", "running: pnpm test", "editing src/api.ts", "43 of 43 green"] };
const codeEl = document.getElementById("code"), toolEl = document.getElementById("tool");
let CODE = CODE_BY.ru, codeTimer = 0;
function renderCode(n) {
  let left = n, html = "";
  for (const line of CODE) {
    for (const [cls, text] of line) {
      if (left <= 0) break;
      const part = text.slice(0, left);
      left -= part.length;
      const safe = part.replace(/&/g, "&amp;").replace(/</g, "&lt;");
      html += cls ? `<span class="${cls}">${safe}</span>` : safe;
    }
    if (left <= 0) break;
    html += "\n"; left -= 1;
  }
  codeEl.innerHTML = html + '<span class="cur"></span>';
}
function restartCode() {
  clearInterval(codeTimer);
  CODE = CODE_BY[lang].map((l, i) => (i === 0 ? [["c", t("editor.comment").replaceAll("‌", "")]] : l));
  const total = CODE.reduce((s, l) => s + l.reduce((a, [, x]) => a + x.length, 0) + 1, 0);
  let n = reduced ? total : 0, step = 0;
  toolEl.textContent = TOOLS[lang][reduced ? 3 : 0];
  renderCode(n);
  if (reduced) return;
  codeTimer = setInterval(() => {
    n += 1 + (Math.random() < 0.3 ? 1 : 0);
    if (n % 60 === 0) toolEl.textContent = TOOLS[lang][(++step) % TOOLS[lang].length];
    if (n > total + 90) { n = 0; step = 0; toolEl.textContent = TOOLS[lang][0]; }
    renderCode(Math.min(n, total));
  }, 55);
}

// ---------- переписка появляется, когда до неё доскроллили ----------
const msgs = [...document.querySelectorAll("#msgs li")];
if (!reduced) {
  msgs.forEach((li) => li.classList.add("wait"));
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    obs.disconnect();
    msgs.forEach((li, i) => setTimeout(() => { li.classList.add("shown"); li.classList.remove("wait"); }, 250 + i * 520));
  }, { threshold: 0.15 }).observe(document.getElementById("msgs"));
}

// ---------- распорядок дня: слайдер двигает и офис, и всю страницу ----------
const dayOffice = new OfficeF(document.getElementById("dayOffice"), {
  layout: narrow
    ? [{ kind: "coffee", x: 0.15 }, { kind: "window", x: 0.5 }, { kind: "desk", x: 0.5 }, { kind: "sofa", x: 0.85 }]
    : [{ kind: "cooler", x: 0.07 }, { kind: "coffee", x: 0.2 }, { kind: "window", x: 0.36 }, { kind: "desk", x: 0.38 }, { kind: "desk", x: 0.55 }, { kind: "window", x: 0.7 }, { kind: "plant", x: 0.72 }, { kind: "sofa", x: 0.88 }],
  girls: Object.values(cast).map((c) => ({ ...c })), lines, fill, calm: night, scale: () => 3, reduced, hour: 15,
});
const hourEl = document.getElementById("hour"), clockEl = document.getElementById("clock"), wordEl = document.getElementById("clockWord");
function showClock() {
  const v = +hourEl.value, h = Math.floor(v) % 24, m = Math.round((v % 1) * 60);
  const clock = `${h}:${String(m).padStart(2, "0")}`, word = t(isNightHour(h + m / 60) ? "day.night" : "day.dayword");
  clockEl.textContent = clock;
  wordEl.textContent = word;
  hourEl.setAttribute("aria-valuetext", `${clock}, ${word}`);
}
hourEl.oninput = () => {
  const h = +hourEl.value % 24;
  showClock();
  dayOffice.setHour(h);
  const want = isNightHour(h) ? "night" : "day";
  if (want !== mode) setMode(want, "slider");
};
function syncSlider() {
  if (isNightHour(+hourEl.value % 24) !== night()) {
    hourEl.value = night() ? 22 : 15;
    dayOffice.setHour(+hourEl.value % 24);
  }
  showClock();
}
if (night()) syncSlider();

// ---------- отдел кадров ----------
const HAIR = ["#e0642a", "#a98ad8", "#f0cc6a", "#8fa2c4", "#3a2a2a", "#e9e4dc", "#5fbf9a", "#d94f6a"];
const HAIRNAME = { ru: ["рыжий", "сиреневый", "жёлтый", "серо-голубой", "тёмный", "белый", "мятный", "малиновый"], en: ["orange", "lilac", "yellow", "blue-grey", "dark", "white", "mint", "raspberry"] };
const NEW_NAMES = { ru: ["Искорка", "Мята", "Пуговка", "Ласка", "Вишня", "Тучка", "Ириска", "Кнопка"], en: ["Sparky", "Minty", "Button", "Cherry", "Cloudy", "Toffee", "Pixel", "Maple"] };
let girl = { ...PRESETS[0], call: "boss" };
let badge = 7;
const nameIn = document.getElementById("hireName"), yourIn = document.getElementById("yourName");
if (lang === "en") nameIn.value = NEW_NAMES.en[0];
const hireCv = document.getElementById("hireCv"), hireFx = document.getElementById("hireFx"), previewSay = document.getElementById("previewSay");
let hireAct = "idle", hireUntil = 0, previewBlush = 0;
requestAnimationFrame(function hireLoop(ms) {
  const s = ms / 1000;
  if (s > hireUntil) hireAct = "idle";
  paint(hireCv, girl, reduced ? "idle" : hireAct, s);
  const on = night() ? { face: hireAct === "idle", blush: s < previewBlush, heart: s < previewBlush } : {};
  drawFx(hireFx, girl, on, s, reduced);
  requestAnimationFrame(hireLoop);
});
const twirl = () => { hireAct = "spin"; hireUntil = now() + 1.2; };
document.getElementById("photo").addEventListener("pointerenter", () => (previewBlush = now() + 2.4));

const sw = document.getElementById("swatches");
for (const c of HAIR) {
  const b = Object.assign(document.createElement("button"), { type: "button", className: "swatch" });
  b.style.background = c;
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
  [...sw.children].forEach((b, i) => { b.setAttribute("aria-pressed", String(b.dataset.color === girl.hair)); b.setAttribute("aria-label", `${t("hire.color")}: ${HAIRNAME[lang][i]}`); });
  document.getElementById("hireRole").textContent = t(`role.${girl.kind}`);
  document.getElementById("yourNameRow").hidden = girl.call !== "name";
  previewSay.textContent = fill(t("hire.preview"), { ...girl, yourName: yourIn.value.trim() });
}
document.getElementById("randBtn").onclick = () => {
  girl = { ...randomGirl(), call: girl.call };
  if (night() && girl.outfit === "sport") girl.outfit = "hoodie";
  nameIn.value = pick(NEW_NAMES[lang]);
  syncHire(); twirl();
};
const toast = document.getElementById("toast");
let hiredN = 0, toastT = 0;
const officeHired = [];
document.getElementById("hireForm").onsubmit = (e) => {
  e.preventDefault();
  const c = { ...girl, id: `new${++hiredN}`, hired: true, name: nameIn.value.trim() || pick(NEW_NAMES[lang]), yourName: yourIn.value.trim() };
  const r = document.getElementById("hireBtn").getBoundingClientRect();
  let full = false;
  if (roam && !night()) {
    // днём (C): выбегает на страницу, конфетти
    if (roam.girls.length >= 6) roam.removeOldest();
    roam.add(c, { fromEdge: true });
    fx.burst(r.left + r.width / 2, r.top, 90);
  } else {
    // ночью (E) и на телефоне: входит в офис наверху
    if (officeHired.length >= 3) { hero.removeGirl(officeHired.shift()); full = true; }
    officeHired.push(hire(c, { fromDoor: !reduced, x: reduced ? 0.12 : undefined }));
    fx.burst(r.left + r.width / 2, r.top, 70, night() ? ["#ec5c82", "#f4b862", "#ffb3c6", "#f6ebe2"] : undefined);
  }
  badge += 1;
  document.getElementById("badgeNo").textContent = `№ ${String(badge).padStart(3, "0")}`;
  const parts = [`${t("hire.hired")} ${full ? t("hire.full") + " " : ""}`];
  if (night() || !roam) parts.push(Object.assign(document.createElement("a"), { href: "#top", textContent: t("hire.look") }));
  toast.replaceChildren(...parts);
  clearTimeout(toastT); toastT = setTimeout(() => toast.replaceChildren(), 8000);
};

// ---------- портреты: днём — посмотреть, ночью — подарить ----------
for (const b of document.querySelectorAll("[data-gift]")) {
  b.onclick = () => {
    const id = b.dataset.gift;
    for (const o of document.querySelectorAll("[data-gift]")) if (o !== b) { o.classList.remove("given"); o.querySelector(".say").textContent = ""; }
    b.classList.add("given");
    b.querySelector(".say").textContent = t(`gift.${id}`);
    if (night()) gaze.addAff(id, 1);
  };
}

// ---------- подвал: днём обед, ночью засыпают ----------
const BYE = { ru: "До завтра, {b}", en: "See you tomorrow, {b}" };
const foot = new OfficeF(document.getElementById("footOffice"), {
  layout: [{ kind: "plant", x: 0.08 }, { kind: "sofa", x: 0.5 }, { kind: "cooler", x: 0.92 }],
  girls: [{ ...cast.nori }, { ...cast.yuki }], lines: (k) => (night() && (k === "sofa" || k === "idle") ? BYE[lang] : lines(k)),
  fill, calm: night, scale: () => 2, floorH: 30, reduced, hour: night() ? 23 : 14,
});

// ---------- язык ----------
function applyI18n() {
  root.lang = lang;
  document.title = t("brand");
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll("[data-i18n-label]")) el.setAttribute("aria-label", t(el.dataset.i18nLabel));
  for (const el of document.querySelectorAll(".frame")) el.querySelector(".nm").textContent = NAMES[lang][el.dataset.gift];
  for (const el of document.querySelectorAll(".frame.given .say")) el.textContent = t(`gift.${el.closest(".frame").dataset.gift}`);
  for (const b of document.querySelectorAll("[data-lang]")) b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
  for (const b of document.querySelectorAll("[data-set-mode]")) b.setAttribute("aria-pressed", String(b.dataset.setMode === mode));
  syncHire();
  restartCode();
  showClock();
  gaze.render();
}
for (const b of document.querySelectorAll("[data-lang]")) b.onclick = () => { lang = b.dataset.lang; store.set("oib.lang", lang); applyI18n(); };

// ---------- смена настроения: один авторский момент ----------
// Палитра течёт через зарегистрированные CSS-переменные, солнце садится, в окнах офиса
// проходит закат (setHour по шагам неба), лампа мигает и загорается, все разом смотрят на тебя.
let switchT = 0;
function setMode(next, from = "toggle") {
  if (next === mode) return;
  mode = next;
  root.dataset.mode = mode;
  if (from === "toggle") store.set("oib.f.mode", mode);
  if (!reduced) { root.classList.add("switching"); clearTimeout(switchT); switchT = setTimeout(() => root.classList.remove("switching"), 2200); }
  document.querySelector('meta[name="theme-color"]').content = night() ? "#1b0f1d" : "#cfeeff";
  applyI18n();
  document.getElementById("modeSaid").textContent = t("mode.said");
  if (night()) { hero.sweep(13, 22, 12); foot.sweep(14, 23, 23); } else { hero.sweep(22, 37, 15); foot.sweep(23, 38, 14); }
  if (from !== "slider") syncSlider();
  if (roam) { if (night()) { roam.setActive(false); bringIn(); } else { sendOut(); roam.setActive(true); } }
  gaze.setActive(night());
  if (night()) gaze.glance(reduced ? 0 : 1600);
  if (night() && girl.outfit === "sport") { girl = { ...girl, outfit: "hoodie" }; syncHire(); }
}
for (const b of document.querySelectorAll("[data-set-mode]")) b.onclick = () => setMode(b.dataset.setMode);

gaze.setActive(night());
applyI18n();
// переходы включаем только после первой отрисовки — чтобы загрузка не «закатывалась»
requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("ready")));
