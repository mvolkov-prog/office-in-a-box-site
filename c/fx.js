// Конфетти пикселями и сердечки — один fixed-холст поверх страницы.
const COLORS = ["#ff5d8f", "#ffd23f", "#5be3b0", "#5b3df5", "#3fb4ff", "#ff9f1c"];
export class Fx {
  constructor(cv, reduced) {
    this.cv = cv; this.ctx = cv.getContext("2d"); this.ps = []; this.reduced = reduced; this.running = false;
    const fit = () => { const d = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * d; cv.height = innerHeight * d; this.d = d; };
    fit(); addEventListener("resize", fit);
  }
  /** Взрыв пикселей из точки (координаты окна). */
  burst(x, y, n = 60, colors = COLORS) {
    if (this.reduced) return;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, v = 220 + Math.random() * 520;
      this.ps.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 4 + ((Math.random() * 3) | 0) * 2, c: colors[(Math.random() * colors.length) | 0], life: 1.4 + Math.random() * 0.8, t: 0 });
    }
    this.run();
  }
  hearts(x, y) {
    if (this.reduced) return;
    for (let i = 0; i < 4; i++) this.ps.push({ x: x + (i - 1.5) * 10, y, vx: (Math.random() - 0.5) * 40, vy: -70 - Math.random() * 40, s: 6, c: "#ff5d8f", life: 1.1, t: 0, g: -20 });
    this.run();
  }
  run() {
    if (this.running) return;
    this.running = true; let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const { ctx, d } = this;
      ctx.clearRect(0, 0, this.cv.width, this.cv.height);
      this.ps = this.ps.filter((p) => (p.t += dt) < p.life);
      for (const p of this.ps) {
        p.vy += (p.g ?? 1400) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.99;
        ctx.globalAlpha = Math.min(1, (p.life - p.t) * 2);
        ctx.fillStyle = p.c;
        ctx.fillRect(Math.round(p.x / 2) * 2 * d, Math.round(p.y / 2) * 2 * d, p.s * d, p.s * d);
      }
      ctx.globalAlpha = 1;
      if (this.ps.length) requestAnimationFrame(loop); else { this.running = false; ctx.clearRect(0, 0, this.cv.width, this.cv.height); }
    };
    requestAnimationFrame(loop);
  }
}
