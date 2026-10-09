import { PRESETS, randomGirl, paint } from "../girls.js";
import { Office } from "../scene.js";
import { T, LINES } from "./i18n-b.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = {
  get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* приватное окно */ } },
};
const q = new URLSearchParams(location.search);
let lang = q.get("lang") ?? store.get("oib.lang", navigator.language?.startsWith("ru") ? "ru" : "en");
let tone = q.get("tone") ?? store.get("oib.tone", "cozy");
// У Pixelify Sans лигатура «fi» склеивается в «A» — разбиваем её невидимым соединителем.
const unlig = (s) => s.replace(/f(?=[iíl])/g, "f‌");
const t = (k) => unlig(T[lang][k] ?? T.ru[k] ?? k);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const lines = (kind) => pick(LINES[lang][tone][kind] ?? LINES[lang][tone].idle);
const $ = (id) => document.getElementById(id);

// ---------- язык и тон ----------
function applyI18n() {
  document.documentElement.lang = lang;
  document.title = t("brand");
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll("[data-i18n-list]"))
    el.replaceChildren(...t(el.dataset.i18nList).split("|").map((s) => Object.assign(document.createElement("li"), { textContent: s })));
  const b = tone === "bold" ? ".bold" : "";
  for (const k of ["t1", "t2", "t3"]) $(k).textContent = t(`hero.${k}` + b); $("lead").textContent = t("hero.lead" + b);
  for (const el of document.querySelectorAll("[data-lang]")) el.setAttribute("aria-pressed", String(el.dataset.lang === lang));
  for (const el of document.querySelectorAll("[data-tone]")) el.setAttribute("aria-pressed", String(el.dataset.tone === tone));
  syncHire();
  buildTicker();
}
for (const b of document.querySelectorAll("[data-lang]")) b.onclick = () => { lang = b.dataset.lang; store.set("oib.lang", lang); applyI18n(); };
for (const b of document.querySelectorAll("[data-tone]")) b.onclick = () => { tone = b.dataset.tone; store.set("oib.tone", tone); applyI18n(); };

// ---------- бегущая строка: всё, что они говорят в этом тоне ----------
function buildTicker() {
  const all = Object.values(LINES[lang][tone]).flat();
  const row = all.map((s) => Object.assign(document.createElement("span"), { textContent: s }));
  $("ticker").replaceChildren(...row, ...row.map((n) => n.cloneNode(true)));
}

// ---------- девочки ----------
const iskra = { ...PRESETS[0] }, yuki = { ...PRESETS[3] };
const cast = [iskra, yuki, { ...PRESETS[1] }, { ...PRESETS[2] }];
const still = (cv, c, act = "idle") => { const loop = (ms) => { paint(cv, c, reduced ? "idle" : act, ms / 1000); requestAnimationFrame(loop); }; requestAnimationFrame(loop); };
still($("brandCv"), iskra);
for (const cv of document.querySelectorAll(".ava")) still(cv, yuki);
still($("tierPx"), iskra);
still($("tierHd"), { ...PRESETS[1] }, "spin");

// ---------- сцена на стене: масштаб из CSS-переменной, высота считается там же ----------
const stage = $("heroOffice");
const scaleOf = () => +getComputedStyle(document.documentElement).getPropertyValue("--s") || 7;
const layoutFor = (s) => s >= 7
  ? [{ kind: "cooler", x: 0.08 }, { kind: "coffee", x: 0.24 }, { kind: "plant", x: 0.4 }, { kind: "desk", x: 0.56 }, { kind: "sofa", x: 0.86 }]
  : s >= 5
    ? [{ kind: "coffee", x: 0.12 }, { kind: "desk", x: 0.45 }, { kind: "sofa", x: 0.84 }]
    : [{ kind: "desk", x: 0.3 }, { kind: "sofa", x: 0.78 }];
const now = new Date();
const hero = new Office(stage, {
  layout: layoutFor(scaleOf()), girls: [], lines, scale: scaleOf, reduced, floorH: 48,
  hour: now.getHours() + now.getMinutes() / 60, pin: { index: 1 },
});
// единственный авторский момент: сотрудницы заходят по одной, большие, поверх заголовка
cast.forEach((c, i) => setTimeout(() => hero.addGirl(c, { fromDoor: !reduced, x: reduced ? 0.15 + i * 0.22 : undefined }), reduced ? 0 : 400 + i * 700));

// ---------- отдел кадров ----------
const HAIR = ["#e0642a", "#a98ad8", "#f0cc6a", "#8fa2c4", "#3a2a2a", "#e9e4dc", "#5fbf9a", "#d94f6a"];
const NAMES = { ru: ["Искорка", "Мята", "Пуговка", "Ласка", "Вишня", "Тучка", "Ириска", "Кнопка"], en: ["Sparky", "Minty", "Button", "Cherry", "Cloudy", "Toffee", "Pixel", "Maple"] };
let girl = { ...PRESETS[0] };
const hireCv = $("hireCv");
let hireAct = "idle", hireUntil = 0;
const hireLoop = (ms) => { const s = ms / 1000; if (s > hireUntil) hireAct = "idle"; paint(hireCv, girl, reduced ? "idle" : hireAct, s); requestAnimationFrame(hireLoop); };
requestAnimationFrame(hireLoop);
const twirl = () => { hireAct = "spin"; hireUntil = performance.now() / 1000 + 1.2; };

const sw = $("swatches");
for (const c of HAIR) {
  const b = Object.assign(document.createElement("button"), { type: "button", className: "swatch" });
  b.style.background = c; b.dataset.color = c; b.setAttribute("aria-label", c);
  b.onclick = () => { girl = { ...girl, hair: c }; syncHire(); twirl(); };
  sw.appendChild(b);
}
for (const group of document.querySelectorAll(".chips[data-k]"))
  for (const b of group.querySelectorAll(".chip")) b.onclick = () => { girl = { ...girl, [group.dataset.k]: b.dataset.v }; syncHire(); twirl(); };
function syncHire() {
  for (const group of document.querySelectorAll(".chips[data-k]"))
    for (const b of group.querySelectorAll(".chip")) b.setAttribute("aria-pressed", String(girl[group.dataset.k] === b.dataset.v));
  for (const b of sw.children) b.setAttribute("aria-pressed", String(b.dataset.color === girl.hair));
  $("hireRole").textContent = t(`role.${girl.kind}`);
}
$("randBtn").onclick = () => { girl = randomGirl(); $("hireName").value = pick(NAMES[lang]); syncHire(); twirl(); };
const toast = $("toast");
let toastTimer = 0;
$("hireForm").onsubmit = (e) => {
  e.preventDefault();
  if (hero.girls.length >= 8) hero.removeOldest();
  hero.addGirl({ ...girl, name: $("hireName").value }, { fromDoor: true });
  const up = Object.assign(document.createElement("a"), { href: "#top", textContent: t("hire.look") });
  toast.replaceChildren(document.createTextNode(t("hire.hired")), up);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.replaceChildren(), 6000);
};

// ---------- подвал: вечер ----------
new Office($("footOffice"), {
  layout: [{ kind: "plant", x: 0.1 }, { kind: "sofa", x: 0.5 }, { kind: "cooler", x: 0.9 }],
  girls: cast.map((c) => ({ ...c })), lines, scale: () => 3, floorH: 36, reduced, hour: 21,
});

applyI18n();
