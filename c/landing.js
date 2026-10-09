import { PRESETS, randomGirl, paint } from "../girls.js";
import { Office } from "../scene.js";
import { tr, LINES } from "./i18n-c.js";
import { Roam } from "./roam.js";
import { Fx } from "./fx.js";
import { sprite, sun, cloud } from "./sprites.js";

document.documentElement.classList.add("js");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = {
  get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* приватное окно */ } },
};
let lang = store.get("oib.lang", navigator.language?.startsWith("ru") ? "ru" : "en");
let tone = store.get("oib.tone", "cozy");
const t = (k) => tr(lang, tone, k);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const lines = (kind) => pick(LINES[lang][tone][kind] ?? LINES[lang][tone].idle);

// ---------- язык и тон ----------
function applyI18n() {
  document.documentElement.lang = lang;
  document.title = t("brand");
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll("[data-i18n-list]")) {
    el.replaceChildren(...t(el.dataset.i18nList).split("|").map((s) => Object.assign(document.createElement("li"), { textContent: s })));
  }
  for (const b of document.querySelectorAll("[data-lang]")) b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
  for (const b of document.querySelectorAll("[data-tone]")) b.setAttribute("aria-pressed", String(b.dataset.tone === tone));
  syncHire();
}
for (const b of document.querySelectorAll("[data-lang]")) b.onclick = () => { lang = b.dataset.lang; store.set("oib.lang", lang); applyI18n(); };
for (const b of document.querySelectorAll("[data-tone]")) b.onclick = () => { tone = b.dataset.tone; store.set("oib.tone", tone); applyI18n(); };

// ---------- небо ----------
document.getElementById("sunSlot").append(sun(6));
[[8, 14, 90], [62, 8, 130], [30, 30, 70]].forEach(([l, top, d], i) => {
  const c = cloud(i === 1 ? 8 : 6); c.style.cssText += `;position:absolute;left:${l}%;top:${top}%;animation-duration:${d}s;animation-delay:-${i * 31}s`;
  document.getElementById("clouds").append(c);
});
document.getElementById("hintCup").append(sprite("cup", 3));

// ---------- девочки ----------
const iskra = { ...PRESETS[0] }, yuki = { ...PRESETS[3] };
const still = (cv, c, act = "idle") => { const loop = (ms) => { paint(cv, c, reduced ? "idle" : act, ms / 1000); requestAnimationFrame(loop); }; requestAnimationFrame(loop); };
still(document.getElementById("brandCv"), iskra);
for (const cv of document.querySelectorAll(".ava")) still(cv, yuki);
still(document.getElementById("tierPx"), iskra);
still(document.getElementById("tierHd"), { ...PRESETS[1] }, "spin");

// ---------- домашний офис: две девочки на работе ----------
const narrow = innerWidth < 760;
const heroLayout = narrow
  ? [{ kind: "coffee", x: 0.17 }, { kind: "window", x: 0.52 }, { kind: "desk", x: 0.52 }, { kind: "sofa", x: 0.86 }]
  : [{ kind: "coffee", x: 0.12 }, { kind: "window", x: 0.5 }, { kind: "desk", x: 0.37 }, { kind: "desk", x: 0.62 }, { kind: "sofa", x: 0.88 }];
const hero = new Office(document.getElementById("heroOffice"), {
  layout: heroLayout, girls: [], lines, scale: () => (narrow ? 2 : 3), reduced, hour: 13, pin: { index: 0 }, floorH: narrow ? 40 : 56,
});
[iskra, yuki].forEach((c, i) => setTimeout(() => hero.addGirl({ ...c }, { fromDoor: !reduced, x: reduced ? 0.3 + i * 0.25 : undefined }), reduced ? 0 : 300 + i * 700));

// ---------- по странице ----------
const fx = new Fx(document.getElementById("fx"), reduced);
const roam = new Roam(document.getElementById("roam"), { lines, reduced, fx, scale: 2 });
const runaways = [{ ...PRESETS[2] }, { ...PRESETS[1] }];
setTimeout(() => runaways.forEach((c, i) => roam.add(c, { on: document.querySelectorAll("[data-perch]")[i === 0 ? 0 : 1] })), 60);
addEventListener("load", () => roam.scan());

// ---------- переписка появляется по скроллу ----------
const msgs = [...document.querySelectorAll("#msgs li")];
if (!reduced) {
  msgs.forEach((li) => li.classList.add("wait"));
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    obs.disconnect();
    msgs.forEach((li, i) => setTimeout(() => li.classList.remove("wait"), 250 + i * 560));
  }, { threshold: 0.25 }).observe(document.getElementById("msgs"));
}

// ---------- отдел кадров ----------
const HAIR = ["#e0642a", "#a98ad8", "#f0cc6a", "#8fa2c4", "#3a2a2a", "#e9e4dc", "#5fbf9a", "#d94f6a"];
const NAMES = { ru: ["Искорка", "Мята", "Пуговка", "Ласка", "Вишня", "Тучка", "Ириска", "Кнопка"], en: ["Sparky", "Minty", "Button", "Cherry", "Cloudy", "Toffee", "Pixel", "Maple"] };
const HAIRNAME = { ru: ["рыжий", "сиреневый", "жёлтый", "серо-голубой", "тёмный", "белый", "мятный", "малиновый"], en: ["orange", "lilac", "yellow", "blue-grey", "dark", "white", "mint", "raspberry"] };
let girl = { ...PRESETS[0] }, badge = 7;
const hireCv = document.getElementById("hireCv");
let hireAct = "idle", hireUntil = 0;
requestAnimationFrame(function hl(ms) {
  const s = ms / 1000;
  if (s > hireUntil) hireAct = "idle";
  paint(hireCv, girl, reduced ? "idle" : hireAct, s);
  requestAnimationFrame(hl);
});
const twirl = () => { hireAct = "spin"; hireUntil = performance.now() / 1000 + 1.2; };
const sw = document.getElementById("swatches");
HAIR.forEach((c, i) => {
  const b = Object.assign(document.createElement("button"), { type: "button", className: "swatch" });
  b.style.background = c; b.dataset.color = c;
  b.onclick = () => { girl = { ...girl, hair: c }; syncHire(); twirl(); };
  sw.appendChild(b);
});
for (const group of document.querySelectorAll(".chips[data-k]"))
  for (const b of group.querySelectorAll(".chip")) b.onclick = () => { girl = { ...girl, [group.dataset.k]: b.dataset.v }; syncHire(); twirl(); };
function syncHire() {
  for (const group of document.querySelectorAll(".chips[data-k]"))
    for (const b of group.querySelectorAll(".chip")) b.setAttribute("aria-pressed", String(girl[group.dataset.k] === b.dataset.v));
  [...sw.children].forEach((b, i) => { b.setAttribute("aria-pressed", String(b.dataset.color === girl.hair)); b.setAttribute("aria-label", `${t("hire.color")}: ${HAIRNAME[lang][i]}`); });
  document.getElementById("hireRole").textContent = t(`role.${girl.kind}`);
}
document.getElementById("randBtn").onclick = () => {
  girl = randomGirl();
  document.getElementById("hireName").value = pick(NAMES[lang]);
  syncHire(); twirl();
};
const toast = document.getElementById("toast");
let toastT = 0;
document.getElementById("hireBtn").onclick = (e) => {
  if (roam.girls.length >= 6) roam.removeOldest();
  roam.add({ ...girl, name: document.getElementById("hireName").value }, { fromEdge: true });
  const r = e.currentTarget.getBoundingClientRect();
  fx.burst(r.left + r.width / 2, r.top, 90);
  badge += 1;
  document.getElementById("badgeNo").textContent = `№ ${String(badge).padStart(3, "0")}`;
  toast.textContent = t("hire.hired");
  clearTimeout(toastT); toastT = setTimeout(() => (toast.textContent = ""), 4000);
};

// ---------- подвал ----------
new Office(document.getElementById("footOffice"), {
  layout: [{ kind: "plant", x: 0.08 }, { kind: "sofa", x: 0.5 }, { kind: "cooler", x: 0.92 }],
  girls: [{ ...PRESETS[2] }, { ...PRESETS[3] }], lines, scale: () => 2, floorH: 30, reduced, hour: 14,
});

applyI18n();
