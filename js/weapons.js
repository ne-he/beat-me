/* ============================================================
   BEAT NEMI — WEAPONS
   Ganti senjata, animasi ayunan, dan kursor emoji.
   Data senjata ada di config.js (CONFIG.WEAPONS).
   ============================================================ */

class WeaponManager {
  constructor() {
    this.index = 0;
    this.swings = [];   // animasi senjata "nyabet" di titik pukulan
  }

  get current() { return CONFIG.WEAPONS[this.index]; }

  select(i) {
    if (CONFIG.WEAPONS[i]) this.index = i;
  }

  swing(x, y) {
    this.swings.push({
      x, y,
      emoji: this.current.emoji,
      age: 0,
      dur: 0.32,
      baseRot: rand(-0.4, 0.4),
    });
  }

  update(dt) {
    for (const s of this.swings) s.age += dt;
    this.swings = this.swings.filter(s => s.age < s.dur);
  }

  render(ctx) {
    for (const s of this.swings) {
      const t = s.age / s.dur;
      const rot = s.baseRot + lerp(-1.1, 0.5, easeOutCubic(t));
      const scale = lerp(1.35, 0.85, t);
      ctx.save();
      ctx.globalAlpha = 1 - t * t;
      ctx.translate(s.x + 26, s.y - 20);
      ctx.rotate(rot);
      ctx.scale(scale, scale);
      ctx.font = "52px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.emoji, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // Kursor emoji senjata ngikutin mouse (desktop only)
  renderCursor(ctx, x, y) {
    ctx.save();
    ctx.translate(x + 14, y + 6);
    ctx.rotate(-0.5);
    ctx.font = "40px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.current.emoji, 0, 0);
    ctx.restore();
  }
}
