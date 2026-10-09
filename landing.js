import { PRESETS, randomGirl, paint } from "./girls.js";
import { Office } from "./scene.js";
import { T, LINES } from "./i18n.js";

document.documentElement.classList.add("js");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = {
  get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* приватное окно */ } },
};
let lang = store.get("oib.lang", navigator.language?.startsWith("ru") ? "ru" : "en");
let tone = store.get("oib.tone", "cozy");
const t = (k) => T[lang][k] ?? T.ru[k] ?? k;
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
  restartCode();
}
for (const b of document.querySelectorAll("[data-lang]")) b.onclick = () => { lang = b.dataset.lang; store.set("oib.lang", lang); applyI18n(); };
for (const b of document.querySelectorAll("[data-tone]")) b.onclick = () => { tone = b.dataset.tone; store.set("oib.tone", tone); applyI18n(); };

// ---------- девочки ----------
const iskra = { ...PRESETS[0] };
const yuki = { ...PRESETS[3] };
const cast = [iskra, yuki, { ...PRESETS[1] }, { ...PRESETS[2] }];
const still = (cv, c, act = "idle") => { const loop = (ms) => { paint(cv, c, reduced ? "idle" : act, ms / 1000); requestAnimationFrame(loop); }; requestAnimationFrame(loop); };
still(document.getElementById("brandCv"), iskra);
still(document.getElementById("yukiCv"), yuki);
for (const cv of document.querySelectorAll(".ava")) still(cv, yuki);
still(document.getElementById("tierPx"), iskra);
still(document.getElementById("tierHd"), { ...PRESETS[1] }, "spin");

// ---------- офис на первом экране: по твоим часам ----------
const narrow = innerWidth < 760;
const heroLayout = narrow
  ? [{ kind: "coffee", x: 0.16 }, { kind: "window", x: 0.5 }, { kind: "desk", x: 0.5 }, { kind: "sofa", x: 0.84 }]
  : [{ kind: "cooler", x: 0.07 }, { kind: "coffee", x: 0.2 }, { kind: "window", x: 0.3 }, { kind: "desk", x: 0.38 }, { kind: "desk", x: 0.58 }, { kind: "sofa", x: 0.85 }];
const scale = () => 3;
const now = new Date();
const hero = new Office(document.getElementById("heroOffice"), {
  layout: heroLayout, girls: [], lines, scale, reduced, hour: now.getHours() + now.getMinutes() / 60, pin: { index: 1 },
});
// один момент на загрузке: сотрудницы заходят по одной
cast.forEach((c, i) => setTimeout(() => hero.addGirl(c, { fromDoor: !reduced, x: reduced ? 0.15 + i * 0.2 : undefined }), reduced ? 0 : 350 + i * 650));

// ---------- редактор: Юки правит тест ----------
const CODE = [
  [["c", "// Юки: дата приходит строкой — чиню парсер"]],
  [["k", "import"], ["", " { parseUser } "], ["k", "from"], ["s", " \"./api\""], ["", ";"]],
  [["", ""]],
  [["f", "test"], ["", "("], ["s", "\"парсит дату регистрации\""], ["", ", () => {"]],
  [["", "  "], ["k", "const"], ["", " u = parseUser({ joined: "], ["s", "\"2026-10-09\""], ["", " });"]],
  [["", "  "], ["f", "expect"], ["", "(u.joined).toBeInstanceOf(Date);"]],
  [["", "});"]],
];
const codeEl = document.getElementById("code");
const toolEl = document.getElementById("tool");
const TOOLS = { ru: ["читает src/api.test.ts", "запускает: pnpm test", "правит src/api.ts", "43 из 43 зелёные"], en: ["reading src/api.test.ts", "running: pnpm test", "editing src/api.ts", "43 of 43 green"] };
let codeTimer = 0;
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
  const total = CODE.reduce((s, l) => s + l.reduce((a, [, x]) => a + x.length, 0) + 1, 0);
  let n = reduced ? total : 0, step = 0;
  toolEl.textContent = TOOLS[lang][0];
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

// ---------- распорядок дня ----------
const day = new Office(document.getElementById("dayOffice"), {
  layout: narrow
    ? [{ kind: "coffee", x: 0.15 }, { kind: "window", x: 0.5 }, { kind: "desk", x: 0.5 }, { kind: "sofa", x: 0.85 }]
    : [{ kind: "cooler", x: 0.07 }, { kind: "coffee", x: 0.2 }, { kind: "window", x: 0.36 }, { kind: "desk", x: 0.38 }, { kind: "desk", x: 0.55 }, { kind: "window", x: 0.7 }, { kind: "plant", x: 0.72 }, { kind: "sofa", x: 0.88 }],
  girls: cast.map((c) => ({ ...c })), lines, scale: () => 3, reduced, hour: 15,
});
const hourEl = document.getElementById("hour"), clockEl = document.getElementById("clock");
hourEl.oninput = () => {
  const v = +hourEl.value, h = Math.floor(v) % 24, m = Math.round((v % 1) * 60);
  clockEl.textContent = `${h}:${String(m).padStart(2, "0")}`;
  day.setHour(v % 24);
};

// ---------- отдел кадров ----------
const HAIR = ["#e0642a", "#a98ad8", "#f0cc6a", "#8fa2c4", "#3a2a2a", "#e9e4dc", "#5fbf9a", "#d94f6a"];
const NAMES = { ru: ["Искорка", "Мята", "Пуговка", "Ласка", "Вишня", "Тучка", "Ириска", "Кнопка"], en: ["Sparky", "Minty", "Button", "Cherry", "Cloudy", "Toffee", "Pixel", "Maple"] };
let girl = { ...PRESETS[0] };
let badge = 7;
const hireCv = document.getElementById("hireCv");
let hireAct = "idle", hireUntil = 0;
const hireLoop = (ms) => {
  const s = ms / 1000;
  if (s > hireUntil) hireAct = "idle";
  paint(hireCv, girl, reduced ? "idle" : hireAct, s);
  requestAnimationFrame(hireLoop);
};
requestAnimationFrame(hireLoop);
const twirl = () => { hireAct = "spin"; hireUntil = performance.now() / 1000 + 1.2; };

const sw = document.getElementById("swatches");
for (const c of HAIR) {
  const b = Object.assign(document.createElement("button"), { type: "button", className: "swatch" });
  b.style.background = c;
  b.dataset.color = c;
  b.setAttribute("aria-label", c);
  b.onclick = () => { girl = { ...girl, hair: c }; syncHire(); twirl(); };
  sw.appendChild(b);
}
for (const group of document.querySelectorAll(".chips[data-k]")) {
  for (const b of group.querySelectorAll(".chip")) b.onclick = () => { girl = { ...girl, [group.dataset.k]: b.dataset.v }; syncHire(); twirl(); };
}
function syncHire() {
  for (const group of document.querySelectorAll(".chips[data-k]"))
    for (const b of group.querySelectorAll(".chip")) b.setAttribute("aria-pressed", String(girl[group.dataset.k] === b.dataset.v));
  for (const b of sw.children) b.setAttribute("aria-pressed", String(b.dataset.color === girl.hair));
  document.getElementById("hireRole").textContent = t(`role.${girl.kind}`);
}
document.getElementById("randBtn").onclick = () => {
  girl = randomGirl();
  document.getElementById("hireName").value = pick(NAMES[lang]);
  syncHire(); twirl();
};
const toast = document.getElementById("toast");
document.getElementById("hireBtn").onclick = () => {
  if (hero.girls.length >= 8) hero.removeOldest();
  hero.addGirl({ ...girl, name: document.getElementById("hireName").value }, { fromDoor: true });
  badge += 1;
  document.getElementById("badgeNo").textContent = `№ ${String(badge).padStart(3, "0")}`;
  toast.textContent = t("hire.hired");
  setTimeout(() => (toast.textContent = ""), 3500);
};

// ---------- подвал ----------
new Office(document.getElementById("footOffice"), {
  layout: [{ kind: "plant", x: 0.08 }, { kind: "cooler", x: 0.92 }],
  girls: cast.map((c) => ({ ...c })), lines, scale: () => 2, floorH: 30, reduced, hour: 21,
});

applyI18n();
