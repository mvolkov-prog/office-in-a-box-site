// Пиксельный офис для лендинга: мебель, места, распорядок дня, пузыри.
// Та же логика, что в приложении, только упрощённая и без LLM.
import { W, H, paint } from "./girls.js";
import { paintGrid, deskFront, deskGlow, coffee, sofaBack, sofaFront, plant, cooler, shelf, windowView } from "./props.js";

const SKY = [
  [0, ["#1b1d3f", "#3a2f63"], 0.6], [6, ["#4b4f9a", "#f0a57a"], 0.3], [9, ["#7fb6ea", "#cfe7f7"], 0.05],
  [16, ["#7aa6e0", "#f6cf9c"], 0.1], [19, ["#3d3f8c", "#f08a6a"], 0.45], [21, ["#1f2150", "#4b3a7a"], 0.7],
];
const skyAt = (h) => [...SKY].reverse().find(([from]) => h >= from) ?? SKY[0];
const DARK = (h) => (h >= 21 || h < 6 ? 0.38 : h >= 19 ? 0.2 : h < 8 ? 0.22 : 0);

/** Веса занятий по часу — как у Brain в приложении. */
function weights(h) {
  if (h >= 23 || h < 7) return { sofa: 5, idle: 1 };
  if (h < 11) return { coffee: 4, work: 4, water: 1, idle: 1 };
  if (h < 14) return { sofa: 3, coffee: 2, work: 2, spin: 1, idle: 1 };
  if (h < 18) return { work: 6, water: 1, coffee: 1, idle: 1 };
  return { sofa: 3, pushup: 3, spin: 1, coffee: 1, idle: 1 };
}
const pickW = (w) => {
  const e = Object.entries(w), sum = e.reduce((s, [, v]) => s + v, 0);
  let r = Math.random() * sum;
  for (const [k, v] of e) if ((r -= v) <= 0) return k;
  return e[0][0];
};

export class Office {
  /**
   * @param el контейнер (position: relative, с размером)
   * @param o.layout [{kind, x}] — x доля ширины
   * @param o.girls внешности
   * @param o.lines (kind) => фраза
   * @param o.pin {index} — эта девочка всегда за первым столом
   */
  constructor(el, o) {
    this.el = el;
    this.o = o;
    this.hour = o.hour ?? 15;
    this.props = [];
    this.girls = [];
    this.floor = el.querySelector(".floor") ?? Object.assign(el.appendChild(document.createElement("div")), { className: "floor" });
    this.shade = Object.assign(el.appendChild(document.createElement("div")), { className: "night" });
    for (const p of o.layout) this.addProp(p);
    o.girls.forEach((c, i) => this.addGirl(c, { x: o.startX?.[i] }));
    this.visible = true;
    new IntersectionObserver(([e]) => (this.visible = e.isIntersecting)).observe(el);
    this.setHour(this.hour);
    const loop = (ms) => { if (this.visible) this.tick(ms / 1000); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  get s() { return this.o.scale?.(this.el) ?? 4; }
  get Wd() { return this.el.clientWidth; }
  get floorTop() { return this.el.clientHeight - (this.o.floorH ?? 56); }

  canvas(z) {
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    cv.style.zIndex = z;
    this.el.appendChild(cv);
    return cv;
  }

  addProp({ kind, x }) {
    const p = { kind, x, cvs: [] };
    const add = (grid, z, extra = {}) => { const cv = this.canvas(z); paintGrid(cv, grid); p.cvs.push({ cv, ...extra }); };
    if (kind === "desk") { add(deskGlow(), 1, { glow: true }); add(deskFront(), 6); p.spots = [{ dx: -8, sit: 7, act: "work" }]; }
    if (kind === "coffee") { add(coffee(), 1); p.spots = [{ dx: 15, act: "coffee" }]; }
    if (kind === "cooler") { add(cooler(), 1); p.spots = [{ dx: -13, act: "water" }]; }
    if (kind === "sofa") { add(sofaBack(), 1); add(sofaFront(), 6); p.spots = [{ dx: -9, sit: 8, act: "sofa" }, { dx: 9, sit: 8, act: "sofa" }]; }
    if (kind === "plant") add(plant(), 1);
    if (kind === "shelf") add(shelf(), 1);
    if (kind === "window") add(windowView(...skyAt(this.hour).slice(1)), 0, { wall: true, win: true });
    for (const s of p.spots ?? []) s.taken = null;
    this.props.push(p);
  }

  setHour(h) {
    this.hour = h;
    const [, sky, lit] = skyAt(h);
    for (const p of this.props) for (const c of p.cvs) {
      if (c.win) paintGrid(c.cv, windowView(sky, lit, Math.round(p.x * 100)));
      if (c.glow) c.cv.style.opacity = DARK(h) > 0 ? 0.55 : 0;
    }
    this.shade.style.opacity = DARK(h);
    for (const g of this.girls) if (!g.pinned) g.until = 0; // пересобрать день
  }

  addGirl(c, { x, fromDoor = false } = {}) {
    const g = { c, cv: this.canvas(4), act: "idle", x: fromDoor ? -0.08 : x ?? 0.1 + Math.random() * 0.8, target: null, spot: null, until: 0, dir: 1, sayUntil: 0 };
    g.bubble = Object.assign(this.el.appendChild(document.createElement("div")), { className: "bubble" });
    g.cv.addEventListener("click", () => this.poke(g));
    g.cv.setAttribute("aria-hidden", "true");
    if (this.o.pin && this.girls.length === this.o.pin.index) g.pinned = true;
    this.girls.push(g);
    if (fromDoor) { this.go(g, 0.12 + Math.random() * 0.7, null, "idle"); this.say(g, this.o.lines("hello")); }
    return g;
  }

  removeOldest() {
    const i = this.girls.findIndex((g) => !g.pinned);
    if (i < 0) return;
    const [g] = this.girls.splice(i, 1);
    this.free(g); g.cv.remove(); g.bubble.remove();
  }

  say(g, text, sec = 2.6) {
    if (!text) return;
    g.bubble.textContent = text;
    g.bubble.classList.add("on");
    g.sayUntil = performance.now() / 1000 + sec;
  }

  poke(g) {
    if (g.spot?.sit) { this.say(g, this.o.lines("poke")); return; }
    this.free(g);
    g.act = "spin"; g.target = null; g.until = performance.now() / 1000 + 1.6;
    this.say(g, this.o.lines("poke"));
  }

  free(g) { if (g.spot) g.spot.taken = null; g.spot = null; }

  spotFor(act) {
    const all = this.props.flatMap((p) => (p.spots ?? []).map((s) => ({ p, s }))).filter(({ s }) => s.act === act && !s.taken);
    return all.length ? all[Math.floor(Math.random() * all.length)] : null;
  }

  go(g, x, spot, then) { g.act = "walk"; g.target = x; g.next = then; g.spot = spot; if (spot) spot.taken = g; }

  decide(g, t) {
    this.free(g);
    let act = g.pinned ? "work" : pickW(weights(this.hour));
    if (["work", "coffee", "water", "sofa"].includes(act)) {
      const found = g.pinned ? this.pinnedSpot() : this.spotFor(act);
      if (!found) act = "idle";
      else {
        const x = found.p.x + (found.s.dx * this.s) / this.Wd;
        this.go(g, x, found.s, act);
        g.until = t + 30;
        return;
      }
    }
    if (act === "pushup" || act === "spin" || act === "idle") {
      if (Math.random() < 0.45 && act !== "spin") { this.go(g, 0.06 + Math.random() * 0.88, null, act); g.until = t + 30; return; }
      g.act = act; g.until = t + (act === "spin" ? 1.6 : act === "pushup" ? 4 + Math.random() * 4 : 2 + Math.random() * 3);
      if (Math.random() < 0.35) this.say(g, this.o.lines(act));
    }
  }

  pinnedSpot() {
    const p = this.props.find((q) => q.kind === "desk");
    return p ? { p, s: p.spots[0] } : null;
  }

  tick(t) {
    const s = this.s, Wd = this.Wd, ft = this.floorTop, dt = Math.min(0.05, t - (this.last ?? t));
    this.last = t;
    for (const p of this.props) for (const { cv, wall } of p.cvs) {
      cv.style.width = W * s + "px"; cv.style.height = H * s + "px";
      cv.style.left = p.x * Wd - (W * s) / 2 + "px";
      cv.style.top = ft - 45 * s + (wall ? -34 * s : 0) + "px";
    }
    const reduced = this.o.reduced;
    for (const g of this.girls) {
      if (!reduced && t > g.until && g.act !== "walk") this.decide(g, t);
      if (g.act === "walk") {
        const d = g.target - g.x;
        g.dir = d >= 0 ? 1 : -1;
        g.x += g.dir * Math.min(Math.abs(d), ((14 * s) / Wd) * dt);
        if (Math.abs(d) < 0.001) {
          g.act = g.next ?? "idle";
          g.until = t + (g.act === "work" ? (g.pinned ? 1e9 : 8 + Math.random() * 10) : g.act === "sofa" ? 6 + Math.random() * 8 : 3 + Math.random() * 4);
          if (Math.random() < 0.4 || g.pinned) this.say(g, this.o.lines(g.act));
        }
      }
      const sit = g.act !== "walk" && g.spot?.sit ? g.spot.sit : 0;
      const anim = g.act === "walk" ? "walk" : g.act === "pushup" ? "pushup" : g.act === "spin" ? "spin" : "idle";
      paint(g.cv, g.c, reduced ? "idle" : anim, t + g.x * 9, g.act === "walk" && g.dir < 0);
      g.cv.style.width = W * s + "px"; g.cv.style.height = H * s + "px";
      g.cv.style.left = g.x * Wd - (W * s) / 2 + "px";
      g.cv.style.top = ft - 45 * s + 3 * s + sit * s + "px";
      g.cv.style.zIndex = sit ? 5 : 7;
      g.bubble.style.left = g.x * Wd + "px";
      g.bubble.style.top = ft - 44 * s + sit * s + "px";
      if (t > g.sayUntil) g.bubble.classList.remove("on");
    }
  }
}
