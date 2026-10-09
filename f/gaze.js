// Ночные механики из E: курсор — взгляд босса (румянец, сердечко, подмигивание),
// ревность через 3 с взгляда на одну, клик — похвала, шкала «Симпатия» у посетителя.
// Днём всё это выключено: setActive(false) прячет оверлеи и не реагирует на взгляд.
import { paint } from "../girls.js";

const HEART = [".XX.XX.", "XXXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."];
export const OFF = 12; // оверлей выше девочки на 12 пикселей — там живёт сердечко
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const now = () => performance.now() / 1000;

/** Сердечко над головой, облачко досады, румянец и подмигивание — поверх кадра девочки 48×48. */
export function drawFx(cv, c, fx, tt, reduced) {
  const ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, cv.width, cv.height);
  const px = (x, y, col) => { ctx.fillStyle = col; ctx.fillRect(x, y + OFF, 1, 1); };
  if (fx.heart) {
    const y0 = -11 + (reduced ? 0 : Math.round(Math.sin(tt * 5) * 0.6));
    HEART.forEach((row, y) => [...row].forEach((ch, x) => ch === "X" && px(20 + x, y0 + y, y === 1 && x === 1 ? "#ffd0dc" : y > 2 ? "#c23a5e" : "#ec5c82")));
  }
  if (fx.jealous) [[18, 0], [19, -1], [20, 0], [22, -2], [23, -3], [24, -2], [26, 0], [27, -1], [28, 0]].forEach(([x, y]) => px(x, -9 + y, "#b7a4c9"));
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

const heartSvg = `<svg class="h" viewBox="0 0 7 6" aria-hidden="true" shape-rendering="crispEdges"><path d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z"/><path class="half" d="M1 0h2v1h1v5H3V5H2V4H1V3H0V1h1z"/></svg>`;

export class Gaze {
  /**
   * @param o.office OfficeF первого экрана
   * @param o.stage элемент, над которым курсор считается взглядом
   * @param o.roster <ul> шкалы симпатии
   * @param o.lines (kind) => реплика ночного тона
   * @param o.t перевод, o.nameOf(c), o.store
   */
  constructor(o) {
    Object.assign(this, o);
    this.fx = new Map();
    this.minis = new Map();
    this.active = false;
    this.gaze = null; this.gazeFrom = 0; this.gazeScored = false; this.lastJealous = 0;
    try { this.aff = JSON.parse(this.store.get("oib.f.aff", "{}")) || {}; } catch { this.aff = {}; }
    const el = o.stage;
    el.addEventListener("pointermove", (e) => { if (this.active && e.pointerType === "mouse") this.setGaze(this.hit(e.clientX, e.clientY)); });
    el.addEventListener("pointerleave", () => this.setGaze(null));
    const loop = (ms) => { this.frame(ms / 1000); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  getAff(id) { return Math.max(0, Math.min(10, +this.aff[id] || 0)); }
  addAff(id, d) {
    const was = this.getAff(id);
    this.aff[id] = Math.min(10, was + d);
    this.store.set("oib.f.aff", JSON.stringify(this.aff));
    this.render();
    return { was, now: this.aff[id] };
  }

  track(g) {
    const cv = document.createElement("canvas");
    cv.width = 48; cv.height = 48 + OFF;
    cv.className = "fx";
    cv.setAttribute("aria-hidden", "true");
    this.office.el.appendChild(cv);
    this.fx.set(g, { cv, heart: 0, blush: 0, wink: 0, jealous: 0 });
    g.cv.addEventListener("click", () => { if (this.active) this.praise(g); });
    this.render();
  }
  untrack(g) {
    this.fx.get(g)?.cv.remove();
    this.fx.delete(g);
    if (this.gaze === g) this.setGaze(null);
    this.render();
  }

  setActive(on) {
    this.active = on;
    if (!on) this.setGaze(null);
    for (const [, f] of this.fx) f.cv.style.display = "none";
    this.render();
  }

  /** Все разом смотрят на тебя: один момент при наступлении ночи. */
  glance(delay = 0) {
    if (this.reduced) return;
    this.office.girls.forEach((g, i) => setTimeout(() => {
      const f = this.fx.get(g);
      if (f && this.active) { f.heart = now() + 1.6; f.blush = now() + 2.2; }
    }, delay + i * 140));
  }

  react(g) {
    const f = this.fx.get(g), tt = now();
    if (!f || tt < (f.cool ?? 0)) return;
    f.cool = tt + 2.4;
    const sitting = !!g.spot?.sit && g.act !== "walk", r = Math.random();
    f.blush = tt + 2.6;
    if (r < 0.3) f.wink = tt + 0.9;
    else if (r < 0.5 && !sitting && !this.reduced && g.act !== "walk") { g.act = "spin"; g.until = tt + 0.8; }
    if (r > 0.25) f.heart = tt + 1.4;
    this.office.say(g, this.lines("look"));
  }

  hit(x, y) {
    let best = null, bd = Infinity;
    for (const g of this.office.girls) {
      const r = g.cv.getBoundingClientRect(), cx = r.left + r.width / 2;
      if (x < r.left + r.width * 0.28 || x > r.right - r.width * 0.28 || y < r.top + r.height * 0.02 || y > r.top + r.height * 0.94) continue;
      const d = Math.abs(x - cx);
      if (d < bd) { bd = d; best = g; }
    }
    return best;
  }

  setGaze(g) {
    if (g === this.gaze) return;
    this.gaze = g; this.gazeFrom = now(); this.gazeScored = false;
    if (g) this.react(g);
    for (const li of this.roster.children) li.classList.toggle("seen", !!g && li.dataset.id === g.c.id);
  }

  praise(g) {
    const f = this.fx.get(g), tt = now();
    if (f) { f.heart = tt + 1.6; f.blush = tt + 3; f.cool = tt + 2.4; }
    const { was, now: n } = this.addAff(g.c.id, 1);
    if (n >= 10 && was < 10) setTimeout(() => this.office.say(g, this.lines("max"), 3.2), 50);
    const li = this.roster.querySelector(`li[data-id="${g.c.id}"]`);
    if (li && !this.reduced) { li.classList.remove("pulse"); void li.offsetWidth; li.classList.add("pulse"); }
  }

  // ревность: долго смотришь на одну — другая подходит и встаёт рядом
  jealousy(tt) {
    const o = this.office, gz = this.gaze;
    if (!gz || this.reduced || tt - this.gazeFrom < 3 || tt - this.lastJealous < 12) return;
    const rivals = o.girls.filter((g) => g !== gz && !g.pinned && g.act !== "walk");
    if (!rivals.length) return;
    this.lastJealous = tt;
    const r = pick(rivals), side = gz.x > 0.5 ? -1 : 1;
    const x = Math.max(0.05, Math.min(0.95, gz.x + side * ((30 * o.s) / o.Wd)));
    o.free(r); o.go(r, x, null, "idle");
    r.until = tt + 30; r.hold = tt + 9; r.jealousOf = gz;
  }
  jealousArrive(tt) {
    for (const g of this.office.girls) {
      if (!g.jealousOf || g.act === "walk") continue;
      const target = g.jealousOf;
      g.jealousOf = null; g.until = tt + 7;
      const f = this.fx.get(g);
      if (f) { f.jealous = tt + 3.2; f.cool = tt + 4; }
      this.office.say(g, this.lines("jealous"), 3);
      setTimeout(() => {
        if (!this.active || !this.office.girls.includes(target)) return;
        const ft = this.fx.get(target); if (ft) ft.blush = now() + 2.5;
        this.office.say(target, this.lines("reply"), 2.8);
      }, 1500);
    }
  }

  frame(tt) {
    for (const [, { cv, c }] of this.minis) if (cv.isConnected && this.active) paint(cv, c, "idle", this.reduced ? 1 : tt);
    if (!this.active) return;
    if (this.gaze && !this.gazeScored && tt - this.gazeFrom > 1.5) { this.gazeScored = true; this.addAff(this.gaze.c.id, 0.5); }
    this.jealousy(tt); this.jealousArrive(tt);
    const s = this.office.s;
    for (const [g, f] of this.fx) {
      const on = { heart: tt < f.heart || (this.gaze === g && tt - this.gazeFrom > 1.5), blush: tt < f.blush || this.gaze === g, wink: tt < f.wink, jealous: tt < f.jealous };
      on.face = g.act !== "walk" && g.act !== "spin";
      const any = on.heart || on.jealous || (on.face && (on.blush || on.wink));
      f.cv.style.display = any ? "block" : "none";
      if (!any) continue;
      f.cv.style.width = 48 * s + "px"; f.cv.style.height = (48 + OFF) * s + "px";
      f.cv.style.left = g.cv.style.left;
      f.cv.style.top = parseFloat(g.cv.style.top) - OFF * s + "px";
      drawFx(f.cv, g.c, on, tt, this.reduced);
    }
  }

  // ---------- шкала симпатии ----------
  render() {
    const t = this.t, list = this.office.girls.map((g) => g.c), el = this.roster;
    const ids = list.map((c) => c.id).join();
    if (el.dataset.ids !== ids) {
      el.dataset.ids = ids;
      this.minis.clear();
      el.replaceChildren(...list.map((c) => {
        const li = document.createElement("li");
        li.dataset.id = c.id;
        li.innerHTML = `<button type="button" class="who"><canvas width="48" height="48" aria-hidden="true"></canvas><span class="nm px"></span><span class="role"></span><span class="hearts" aria-hidden="true">${heartSvg.repeat(5)}</span><span class="lvl"></span></button>`;
        const b = li.querySelector("button");
        const g = () => this.office.girls.find((x) => x.c.id === c.id);
        b.onclick = () => { const x = g(); if (x) { this.office.poke(x); this.praise(x); } };
        b.onfocus = () => this.active && this.setGaze(g() ?? null);
        b.onblur = () => this.setGaze(null);
        this.minis.set(c.id, { cv: li.querySelector("canvas"), c });
        return li;
      }));
    }
    for (const li of el.children) {
      const c = list.find((x) => x.id === li.dataset.id), a = this.getAff(c.id), lvl = t(`lvl.${Math.min(5, Math.floor(a / 2))}`);
      li.querySelector(".nm").textContent = this.nameOf(c);
      li.querySelector(".role").textContent = t(c.hired ? "role.new" : `role.${c.kind}`);
      li.querySelector(".lvl").textContent = lvl;
      [...li.querySelectorAll(".h")].forEach((h, i) => h.setAttribute("class", `h ${a >= (i + 1) * 2 ? "full" : a >= i * 2 + 1 ? "halfon" : ""}`));
      li.querySelector("button").setAttribute("aria-label", `${t("roster.praise")}: ${this.nameOf(c)}. ${t("roster.label")} ${Math.floor(a)}/10, ${lvl}`);
    }
  }
}
