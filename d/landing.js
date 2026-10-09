// Вариант D — «Эпизод 1»: опенинг, экран выбора персонажа, сцена визуальной новеллы, призыв новенькой.
import { PRESETS, randomGirl, paint } from "../girls.js";
import { Office } from "../scene.js";
import { T, LINES } from "./i18n-d.js";

const $ = (id) => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = {
  get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* приватное окно */ } },
};
let lang = store.get("oib.lang", navigator.language?.startsWith("ru") ? "ru" : "en");
let tone = store.get("oib.tone", "cozy");
// Pixelify Sans склеивает «fi» в «A» даже с liga 0 — разбиваем пару невидимым ZWNJ
const unfi = (s) => s.replace(/f(?=[iíl])/g, "f‌");
// «Смелее» берёт ключ.bold, если он есть
const raw = (k) => (tone === "bold" && T[lang][k + ".bold"]) || T[lang][k] || T.ru[k] || k;
const t = (k) => unfi(raw(k));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const lines = (kind) => unfi(pick(LINES[lang][tone][kind] ?? LINES[lang][tone].idle));

// ---------- опенинг: один раз на загрузке, всё время — в CSS ----------
const opening = $("opening");
function endOpening() {
  if (!opening || opening.classList.contains("done")) return;
  opening.classList.add("done");
  setTimeout(() => opening.remove(), 380);
  removeEventListener("keydown", onKey);
}
const onKey = (e) => { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") endOpening(); };
if (opening) {
  if (reduced) opening.remove();
  else {
    opening.addEventListener("click", endOpening);
    addEventListener("keydown", onKey);
    opening.addEventListener("animationend", (e) => { if (e.target === opening && e.animationName === "op-out") opening.remove(); });
  }
}

// ---------- язык и тон ----------
function applyI18n() {
  document.documentElement.lang = lang;
  document.title = `${T[lang].brand} — ${T[lang].ep1}`;
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll("[data-i18n-aria]")) el.setAttribute("aria-label", raw(el.dataset.i18nAria));
  for (const el of document.querySelectorAll("[data-i18n-alt]")) el.alt = raw(el.dataset.i18nAlt);
  for (const el of document.querySelectorAll("[data-i18n-list]")) {
    el.replaceChildren(...t(el.dataset.i18nList).split("|").map((s) => Object.assign(document.createElement("li"), { textContent: s })));
  }
  for (const b of document.querySelectorAll("[data-lang]")) b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
  for (const b of document.querySelectorAll("[data-tone]")) b.setAttribute("aria-pressed", String(b.dataset.tone === tone));
  const nm = $("hireName");
  if ([...NAMES.ru, ...NAMES.en].includes(nm.value)) nm.value = NAMES[lang][Math.max(0, NAMES.ru.indexOf(nm.value), NAMES.en.indexOf(nm.value))];
  syncHire();
  vnRender(true);
}
for (const b of document.querySelectorAll("[data-lang]")) b.onclick = () => { lang = b.dataset.lang; store.set("oib.lang", lang); applyI18n(); };
for (const b of document.querySelectorAll("[data-tone]")) b.onclick = () => { tone = b.dataset.tone; store.set("oib.tone", tone); applyI18n(); };

// ---------- пиксельные версии: один цикл на все маленькие холсты ----------
const BY = { iskra: PRESETS[0], momo: PRESETS[1], nori: PRESETS[2], yuki: PRESETS[3] };
const cast = [BY.iskra, BY.yuki, BY.momo, BY.nori].map((c) => ({ ...c }));
const minis = [];
for (const card of document.querySelectorAll(".card")) minis.push({ cv: card.querySelector("canvas"), c: BY[card.dataset.girl], act: "idle" });
minis.push({ cv: $("tierPx"), c: BY.iskra, act: "idle" }, { cv: $("tierHd"), c: BY.momo, act: "spin" }, { cv: $("tierArtPx"), c: BY.iskra, act: "idle" });
const miniLoop = (ms) => {
  for (const m of minis) if (m.cv) paint(m.cv, m.c, reduced ? "idle" : m.act, ms / 1000 + minis.indexOf(m) * 0.7);
  requestAnimationFrame(miniLoop);
};
requestAnimationFrame(miniLoop);

// ---------- офис на первом экране: живёт по твоим часам ----------
const narrow = innerWidth < 760;
const now = new Date();
const hero = new Office($("heroOffice"), {
  layout: narrow
    ? [{ kind: "coffee", x: 0.14 }, { kind: "window", x: 0.5 }, { kind: "desk", x: 0.52 }, { kind: "sofa", x: 0.85 }]
    : [{ kind: "cooler", x: 0.05 }, { kind: "coffee", x: 0.15 }, { kind: "window", x: 0.3 }, { kind: "desk", x: 0.32 }, { kind: "shelf", x: 0.46 }, { kind: "desk", x: 0.58 }, { kind: "window", x: 0.74 }, { kind: "plant", x: 0.7 }, { kind: "sofa", x: 0.88 }],
  girls: [], lines, scale: () => (innerWidth < 560 ? 2 : 3), reduced, hour: now.getHours() + now.getMinutes() / 60, pin: { index: 1 },
});
// сотрудницы заходят после опенинга, по одной
const enterAt = reduced ? 0 : 2900;
cast.forEach((c, i) => setTimeout(() => hero.addGirl(c, { fromDoor: !reduced, x: reduced ? 0.15 + i * 0.2 : undefined }), reduced ? 0 : enterAt + i * 600));

// ---------- состав: экран выбора персонажа ----------
const cards = [...document.querySelectorAll(".card")];
const POSE = { iskra: ["iskra-wave", "iskra-idle"], yuki: ["yuki-wave", "yuki-idle"], momo: ["momo-wave", "momo-work"], nori: ["nori-wave", "nori-work"] };
function choose(card) {
  for (const c of cards) {
    const on = c === card;
    c.classList.toggle("on", on);
    c.setAttribute("aria-current", String(on));
    c.querySelector(".art").src = `assets/${POSE[c.dataset.girl][on ? 0 : 1]}.webp`;
    const m = minis.find((x) => x.cv === c.querySelector("canvas"));
    if (m) m.act = on && !reduced ? "spin" : "idle";
  }
  if (!reduced) setTimeout(() => { const m = minis.find((x) => x.cv === card.querySelector("canvas")); if (m) m.act = "idle"; }, 1600);
}
for (const card of cards) {
  card.tabIndex = 0;
  card.addEventListener("click", () => choose(card));
  card.addEventListener("focus", () => choose(card));
  card.addEventListener("mouseenter", () => { if (matchMedia("(hover: hover)").matches) choose(card); });
}
cards.forEach((c) => c.classList.add("ready"));
choose(cards[0]);

// ---------- эпизод 2: сцена визуальной новеллы ----------
const SCRIPT = [
  { who: "me", k: "vn.1" },
  { who: "yuki", k: "vn.2", pose: "yuki-idle" },
  { who: "sys", k: "vn.t1", pose: "yuki-work" },
  { who: "sys", k: "vn.t2", pose: "yuki-work", mark: "bad" },
  { who: "yuki", k: "vn.3", pose: "yuki-idle" },
  { who: "me", k: "vn.4" },
  { who: "sys", k: "vn.t3", pose: "yuki-work" },
  { who: "sys", k: "vn.t4", pose: "yuki-work", mark: "ok" },
  { who: "yuki", k: "vn.5", pose: "yuki-wave" },
];
const vnGirl = $("vnGirl"), vnName = $("vnName"), vnText = $("vnText"), vnLive = $("vnLive"), vnLog = $("vnLog");
const vnNext = $("vnNext"), vnReplay = $("vnReplay");
let step = -1, typing = 0, shown = 0, full = "";
function vnType(text) {
  clearInterval(typing);
  full = text; shown = reduced ? text.length : 0;
  vnText.textContent = full.slice(0, shown);
  if (reduced) return;
  typing = setInterval(() => {
    shown += 1;
    vnText.textContent = full.slice(0, shown);
    if (shown >= full.length) clearInterval(typing);
  }, 24);
}
function vnRender(instant = false) {
  vnLog.replaceChildren();
  for (const s of SCRIPT.slice(0, step + 1)) if (s.who === "sys") vnLog.append(Object.assign(document.createElement("li"), { textContent: raw(s.k), className: s.mark ?? "" }));
  if (step < 0) { vnName.textContent = t("name.yuki"); vnText.textContent = ""; return; }
  if (step >= SCRIPT.length) {
    vnName.textContent = t("name.yuki"); vnName.className = "vn-name";
    vnText.className = "vn-text"; vnText.textContent = t("vn.end"); vnLive.textContent = t("vn.end");
    vnNext.disabled = true;
    return;
  }
  vnNext.disabled = false;
  const s = SCRIPT[step];
  vnName.textContent = s.who === "me" ? t("vn.me") : s.who === "sys" ? t("vn.sys") : t("name.yuki");
  vnName.className = `vn-name ${s.who === "yuki" ? "" : s.who}`;
  vnText.className = `vn-text ${s.who === "sys" ? "sys" : ""}`;
  vnGirl.classList.toggle("away", s.who === "me");
  if (s.pose) vnGirl.className = `sprite vn-girl ${s.pose}`;
  const text = raw(s.k);
  vnLive.textContent = `${vnName.textContent}: ${text}`;
  if (instant) { clearInterval(typing); vnText.textContent = text; full = text; shown = text.length; } else vnType(text);
}
function vnAdvance() {
  if (shown < full.length) { clearInterval(typing); shown = full.length; vnText.textContent = full; return; } // дописать реплику целиком
  if (step >= SCRIPT.length) return;
  step += 1;
  vnRender();
}
vnNext.addEventListener("click", (e) => { e.stopPropagation(); vnAdvance(); });
vnReplay.addEventListener("click", (e) => { e.stopPropagation(); step = 0; vnGirl.className = "sprite vn-girl yuki-idle"; vnRender(); vnNext.focus(); });
$("vn").querySelector(".vn-box").addEventListener("click", vnAdvance);
new IntersectionObserver(([e], obs) => {
  if (!e.isIntersecting) return;
  obs.disconnect();
  if (step < 0) { step = 0; vnRender(); }
}, { threshold: 0.35 }).observe($("vn"));

// ---------- эпизод 3: призыв новенькой ----------
const HAIR = ["#e0642a", "#a98ad8", "#f0cc6a", "#8fa2c4", "#3a2a2a", "#e9e4dc", "#5fbf9a", "#d94f6a"];
const HAIR_NAME = {
  ru: ["рыжий", "сиреневый", "пшеничный", "серебристый", "каштановый", "платиновый", "мятный", "вишнёвый"],
  en: ["ginger", "lilac", "wheat", "silver", "chestnut", "platinum", "mint", "cherry"],
};
const NAMES = { ru: ["Искорка", "Мята", "Пуговка", "Ласка", "Вишня", "Тучка", "Ириска", "Кнопка"], en: ["Sparky", "Minty", "Button", "Weasel", "Cherry", "Cloudy", "Toffee", "Pixel"] };
let girl = { ...PRESETS[0] };
let badge = 7;
const hireCv = $("hireCv"), summon = $("summon");
let hireAct = "idle", hireUntil = 0;
const hireLoop = (ms) => {
  const s = ms / 1000;
  if (s > hireUntil) hireAct = "idle";
  paint(hireCv, girl, reduced ? "idle" : hireAct, s);
  requestAnimationFrame(hireLoop);
};
requestAnimationFrame(hireLoop);
const twirl = () => { hireAct = "spin"; hireUntil = performance.now() / 1000 + 1.2; };

const sw = $("swatches");
HAIR.forEach((c, i) => {
  const b = Object.assign(document.createElement("button"), { type: "button", className: "swatch" });
  b.style.background = c;
  b.dataset.color = c;
  b.dataset.i = i;
  b.onclick = () => { girl = { ...girl, hair: c }; syncHire(); twirl(); };
  sw.appendChild(b);
});
for (const group of document.querySelectorAll(".chips[data-k]")) {
  for (const b of group.querySelectorAll(".chip")) b.onclick = () => { girl = { ...girl, [group.dataset.k]: b.dataset.v }; syncHire(); twirl(); };
}
function syncHire() {
  for (const group of document.querySelectorAll(".chips[data-k]"))
    for (const b of group.querySelectorAll(".chip")) b.setAttribute("aria-pressed", String(girl[group.dataset.k] === b.dataset.v));
  for (const b of sw.children) {
    b.setAttribute("aria-pressed", String(b.dataset.color === girl.hair));
    b.setAttribute("aria-label", HAIR_NAME[lang][b.dataset.i]);
  }
  $("hireRole").textContent = t(`role.${girl.kind}`);
}
$("randBtn").onclick = () => {
  girl = randomGirl();
  $("hireName").value = pick(NAMES[lang]);
  syncHire(); twirl();
};
const toast = $("toast");
let toastTimer = 0;
$("hireBtn").onclick = () => {
  if (hero.girls.length >= 8) hero.removeOldest();
  const name = $("hireName").value.trim() || pick(NAMES[lang]);
  hero.addGirl({ ...girl, name }, { fromDoor: true });
  badge += 1;
  $("badgeNo").textContent = `№ ${String(badge).padStart(3, "0")}`;
  summon.classList.remove("flash");
  void summon.offsetWidth; // перезапустить вспышку
  summon.classList.add("flash");
  twirl();
  toast.textContent = t("hire.hired");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.textContent = ""), 4000);
};

// ---------- подвал ----------
new Office($("footOffice"), {
  layout: [{ kind: "plant", x: 0.06 }, { kind: "sofa", x: 0.5 }, { kind: "cooler", x: 0.94 }],
  girls: cast.map((c) => ({ ...c })), lines, scale: () => 2, floorH: 30, reduced, hour: 21,
});

applyI18n();
