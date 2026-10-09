// Девочки гуляют по всей странице: стоят на краях блоков [data-perch], прыгают между ними,
// бегут за брошенным кофе. Всё в координатах документа, слой лежит поверх страницы.
import { paint, W, H } from "../girls.js";
import { sprite } from "./sprites.js";

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export class Roam {
  constructor(layer, { lines, reduced, fx, scale = 2 }) {
    Object.assign(this, { layer, lines, reduced, fx, s: scale });
    this.girls = []; this.cups = []; this.ledges = []; this.lastScan = -9;
    this.scan();
    addEventListener("resize", () => this.scan());
    if (!reduced) document.addEventListener("click", (e) => this.onClick(e));
    const loop = (ms) => { this.tick(ms / 1000); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  scan() {
    const sy = scrollY, sx = scrollX;
    this.pageW = document.documentElement.clientWidth;
    this.pageH = document.body.offsetHeight; this.layer.style.height = this.pageH + "px";
    this.ledges = [...document.querySelectorAll("[data-perch]")].map((el) => {
      const r = el.getBoundingClientRect();
      return { el, x0: r.left + sx, x1: r.right + sx, y: r.top + sy, ok: r.width >= 140 && r.height > 0 };
    }).filter((l) => l.ok);
  }
  ledgeOf(el) { return this.ledges.find((l) => l.el === el); }

  add(c, { fromEdge = false, on } = {}) {
    const cv = Object.assign(document.createElement("canvas"), { width: W, height: H, className: "girl" });
    cv.style.width = W * this.s + "px"; cv.style.height = H * this.s + "px";
    cv.setAttribute("aria-hidden", "true");
    const bubble = Object.assign(document.createElement("div"), { className: "bubble" });
    this.layer.append(cv, bubble);
    const l = (on && this.ledges.find((q) => q.el === on)) || pick(this.ledges);
    const g = { c, cv, bubble, mode: "stand", act: "idle", dir: 1, until: 0, sayUntil: 0, boost: 0, goal: null, ledge: l?.el, x: l ? rnd(l.x0 + 40, l.x1 - 40) : 100, y: l?.y ?? 100 };
    cv.addEventListener("click", (e) => { e.stopPropagation(); this.poke(g); });
    if (on) g.until = performance.now() / 1000 + 6;
    this.girls.push(g);
    if (fromEdge && l && !this.reduced) {
      const side = Math.random() < 0.5 ? -80 : this.pageW + 80;
      this.hop(g, l, g.x, side, l.y - 160);
      this.say(g, this.lines("hello"));
    }
    this.place(g);
    return g;
  }
  removeOldest() {
    const g = this.girls.shift(); if (!g) return;
    g.cv.remove(); g.bubble.remove();
  }

  say(g, text, sec = 2.6) {
    if (!text) return;
    g.bubble.textContent = text; g.bubble.classList.add("on");
    g.sayUntil = performance.now() / 1000 + sec;
  }
  poke(g) {
    this.say(g, this.lines("poke"));
    this.fx.hearts(g.x - scrollX, g.y - scrollY - 70);
    if (!this.reduced && g.mode !== "air") { g.mode = "stand"; g.act = "spin"; g.until = performance.now() / 1000 + 1.2; }
  }

  // ----- движения -----
  walk(g, x) { g.mode = "walk"; g.tx = x; }
  hop(g, l, x, fromX = g.x, fromY = g.y) {
    const t = performance.now() / 1000;
    const dx = x - fromX, dy = l.y - fromY, dist = Math.hypot(dx, dy);
    Object.assign(g, { mode: "air", ledge: l.el, from: { x: fromX, y: fromY }, to: { x, y: l.y }, t0: t, dur: 0.55 + dist / 1100, arc: Math.max(70, -dy * 0.25 + 80) });
    g.x = fromX; g.y = fromY; g.act = "spin";
  }
  decide(g, t) {
    const l = this.ledgeOf(g.ledge);
    if (!l) { const n = pick(this.ledges); if (n) this.hop(g, n, rnd(n.x0 + 30, n.x1 - 30)); return; }
    g.act = "idle";
    const r = Math.random();
    if (r < 0.42) this.walk(g, rnd(l.x0 + 40, l.x1 - 40));
    else if (r < 0.58) { g.act = pick(["pushup", "spin", "idle"]); g.until = t + (g.act === "pushup" ? rnd(3, 5) : g.act === "spin" ? 1.4 : rnd(2, 4)); if (Math.random() < 0.5) this.say(g, this.lines(g.act)); }
    else if (r < 0.86 && this.ledges.length > 1) {
      const near = this.ledges.filter((o) => o !== l && Math.abs((o.x0 + o.x1) / 2 - g.x) < 900 && Math.abs(o.y - l.y) < 900);
      const o = pick(near.length ? near : this.ledges.filter((q) => q !== l));
      this.hop(g, o, Math.min(o.x1 - 30, Math.max(o.x0 + 30, g.x + rnd(-200, 200))));
      if (Math.random() < 0.3) this.say(g, this.lines("jump"));
    } else { g.until = t + rnd(3, 6); if (Math.random() < 0.5) this.say(g, this.lines("perch")); }
    if (g.mode === "stand" && !g.until) g.until = t + 2;
  }
  arrive(g, t) {
    g.mode = "stand"; g.act = "idle"; g.until = t + rnd(1.5, 4);
    if (g.goal) {
      const c = g.goal;
      if (Math.abs(g.x - c.x) < 8 && g.ledge === c.ledge) return this.drink(g, c, t);
      if (g.ledge === c.ledge) return this.walk(g, c.x);
      const l = this.ledgeOf(c.ledge);
      if (l) this.hop(g, l, c.x); else g.goal = null;
    }
  }

  // ----- кофе -----
  onClick(e) {
    if (e.target.closest("a,button,input,select,textarea,summary,label,canvas,[data-nocoffee]")) return;
    if (String(getSelection())) return;
    if (this.cups.length >= 3) { const o = this.cups.shift(); o.cv.remove(); this.girls.forEach((g) => { if (g.goal === o) g.goal = null; }); }
    const cv = sprite("cup", 4); cv.className = "cup";
    this.layer.append(cv);
    const cup = { cv, x: e.pageX, y: e.pageY, vy: 0, rest: false, ledge: null };
    this.cups.push(cup);
    this.paintCup(cup);
  }
  paintCup(c) { c.cv.style.transform = `translate(${c.x - 22}px, ${c.y - 36}px)`; }
  stepCup(c, dt) {
    if (c.rest) return;
    c.vy += 1800 * dt; const ny = c.y + c.vy * dt;
    const under = this.ledges.filter((l) => c.x >= l.x0 && c.x <= l.x1 && l.y >= c.y - 2 && l.y <= ny + 2).sort((a, b) => a.y - b.y)[0];
    if (under) {
      c.y = under.y; c.rest = true; c.ledge = under.el; this.paintCup(c);
      this.fx.burst(c.x - scrollX, c.y - scrollY - 10, 10, ["#ffd23f", "#fff", "#ff9f1c"]);
      const free = this.girls.filter((g) => !g.goal && g.mode !== "air");
      free.sort((a, b) => Math.abs(a.x - c.x) + Math.abs(a.y - c.y) * 0.6 - (Math.abs(b.x - c.x) + Math.abs(b.y - c.y) * 0.6));
      const g = free[0];
      if (g) { g.goal = c; g.boost = 0; this.say(g, this.lines("fast"), 1.8); this.go(g, c); }
      else setTimeout(() => this.dropCup(c), 4000);
    } else if (ny > this.pageH) this.dropCup(c);
    else { c.y = ny; this.paintCup(c); }
  }
  go(g, c) {
    if (g.mode === "air") return;
    if (g.ledge === c.ledge) this.walk(g, c.x); else { const l = this.ledgeOf(c.ledge); if (l) this.hop(g, l, c.x); }
  }
  dropCup(c) { c.cv.remove(); this.cups = this.cups.filter((o) => o !== c); }
  drink(g, c, t) {
    this.dropCup(c); g.goal = null; g.boost = t + 10; g.act = "spin"; g.until = t + 1.2;
    this.say(g, this.lines("coffeeGot"), 3);
    this.fx.hearts(g.x - scrollX, g.y - scrollY - 80);
    this.fx.burst(g.x - scrollX, g.y - scrollY - 60, 18, ["#ffd23f", "#ff5d8f", "#fff"]);
  }

  // ----- кадр -----
  place(g, t = 0) {
    const s = this.s, bx = Math.min(this.pageW - 90, Math.max(90, g.x));
    paint(g.cv, g.c, this.reduced ? "idle" : g.mode === "walk" ? "walk" : g.act === "pushup" ? "pushup" : g.act === "spin" ? "spin" : "idle", t + g.x * 0.009, g.mode === "walk" && g.dir < 0);
    g.cv.style.transform = `translate(${g.x - 24 * s}px, ${g.y - 45 * s}px)`;
    g.bubble.style.transform = `translate(calc(${bx}px - 50%), calc(${g.y - 38 * s}px - 100%))`;
  }
  tick(t) {
    const dt = Math.min(0.05, t - (this.last ?? t)); this.last = t;
    if (t - this.lastScan > 0.5) { this.lastScan = t; this.scan(); }
    for (const c of this.cups) this.stepCup(c, dt);
    for (const g of this.girls) {
      if (t > g.sayUntil) g.bubble.classList.remove("on");
      if (this.reduced) { const l = this.ledgeOf(g.ledge); if (l) { g.y = l.y; g.x = Math.min(l.x1 - 30, Math.max(l.x0 + 30, g.x)); } else { const n = this.ledges[0]; if (n) { g.ledge = n.el; g.x = (n.x0 + n.x1) / 2; g.y = n.y; } } this.place(g, 0); continue; }
      const l = this.ledgeOf(g.ledge);
      if (g.mode === "air") {
        const p = Math.min(1, (t - g.t0) / g.dur), tl = this.ledgeOf(g.ledge);
        if (tl) g.to.y = tl.y;
        g.x = g.from.x + (g.to.x - g.from.x) * p;
        g.y = g.from.y + (g.to.y - g.from.y) * p - 4 * g.arc * p * (1 - p);
        if (p >= 1) { g.x = g.to.x; g.y = g.to.y; this.arrive(g, t); }
      } else {
        if (l) { g.y = l.y; g.x = Math.min(l.x1 - 20, Math.max(l.x0 + 20, g.x)); }
        if (g.mode === "walk") {
          const d = g.tx - g.x; g.dir = d >= 0 ? 1 : -1;
          g.x += g.dir * Math.min(Math.abs(d), (g.boost > t ? 150 : 70) * dt);
          if (Math.abs(g.tx - g.x) < 0.5) this.arrive(g, t);
        } else if (t > g.until) this.decide(g, t);
      }
      this.place(g, t);
    }
  }
}
