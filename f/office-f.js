// Офис из scene.js с тремя добавками для F: небо без перезапуска распорядка,
// обращение {b} в репликах и «ночной дресс-код» — ночью никаких отжиманий.
import { Office } from "../scene.js";

export class OfficeF extends Office {
  /** Перекрасить небо, лампы и тень, не сбивая девочек с их дел. behave — час, по которому они живут. */
  setSky(h, behave = h) {
    const keep = this.girls.map((g) => g.until);
    super.setHour(h);
    this.girls.forEach((g, i) => (g.until = keep[i]));
    this.hour = behave;
  }

  /** Плавно провести небо от from до to (часы, to может быть > 24) за dur секунд. */
  sweep(from, to, behave, dur = 1.6) {
    cancelAnimationFrame(this.sweepRaf);
    if (this.o.reduced || dur <= 0) { this.setSky(to % 24, behave); return; }
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / (dur * 1000)), e = 1 - (1 - p) ** 3;
      this.setSky((from + (to - from) * e) % 24, behave);
      if (p < 1) this.sweepRaf = requestAnimationFrame(step);
    };
    this.sweepRaf = requestAnimationFrame(step);
  }

  say(g, text, sec) { super.say(g, text && this.o.fill ? this.o.fill(text, g.c) : text, sec); }

  decide(g, t) {
    if (g.hold && t < g.hold) return; // подошла ревновать — стоит рядом
    super.decide(g, t);
    if (this.o.calm?.()) {
      if (g.act === "pushup") g.act = "idle";
      if (g.next === "pushup") g.next = "idle";
    }
  }

  removeGirl(g) {
    const i = this.girls.indexOf(g);
    if (i < 0) return;
    this.girls.splice(i, 1);
    this.free(g); g.cv.remove(); g.bubble.remove();
    this.o.onRemove?.(g);
  }
}
