/* ============================================================
   BEAT NEMI — PARTICLE SYSTEM
   Ledakan emoji, percikan, dan hujan confetti hati.
   ============================================================ */

const MAX_PARTICLES = 150;   // batas biar gak numpuk pas tap-tap / spam cepet

class ParticleSystem {
  constructor() {
    this.list = [];
  }

  // buang partikel tertua kalau kebanyakan (jaga frame rate)
  _cap() {
    if (this.list.length > MAX_PARTICLES) {
      this.list.splice(0, this.list.length - MAX_PARTICLES);
    }
  }

  emit(x, y, opts = {}) {
    const {
      count = 10,
      emojis = null,
      colors = null,
      speed = [80, 340],
      angle = null,          // null = ke segala arah
      spread = TAU,
      gravity = 520,
      life = [0.5, 1.0],
      size = [16, 30],
    } = opts;

    for (let i = 0; i < count; i++) {
      const a = angle == null ? rand(0, TAU) : angle + rand(-spread / 2, spread / 2);
      const sp = rand(speed[0], speed[1]);
      this.list.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - rand(0, 100),
        g: gravity,
        life: 1,
        decay: 1 / rand(life[0], life[1]),
        emoji: emojis ? pick(emojis) : null,
        color: colors ? pick(colors) : null,
        size: rand(size[0], size[1]),
        rot: rand(0, TAU),
        vr: rand(-5, 5),
        age: 0,
        sway: null,
      });
    }
    this._cap();
  }

  // Hujan hati dari atas layar (buat menang)
  confettiHearts(w, count = 55) {
    for (let i = 0; i < count; i++) {
      this.list.push({
        x: rand(0, w),
        y: rand(-350, -20),
        vx: rand(-25, 25),
        vy: rand(90, 230),
        g: 25,
        life: 1,
        decay: 1 / rand(3, 5),
        emoji: pick(["💖", "💗", "💘", "💝", "❤️", "💕"]),
        color: null,
        size: rand(18, 40),
        rot: rand(-0.4, 0.4),
        vr: rand(-1.5, 1.5),
        age: 0,
        sway: rand(0, TAU),
      });
    }
    this._cap();
  }

  update(dt) {
    for (const p of this.list) {
      p.age += dt;
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.sway != null) p.x += Math.sin(p.age * 2.5 + p.sway) * 40 * dt;
      p.life -= p.decay * dt;
    }
    this.list = this.list.filter(p => p.life > 0);
  }

  render(ctx) {
    for (const p of this.list) {
      ctx.save();
      ctx.globalAlpha = clamp(p.life, 0, 1);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.emoji) {
        drawEmoji(ctx, p.emoji, 0, 0, p.size);
      } else {
        ctx.fillStyle = p.color || "#ffd166";
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.25 * p.life, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}
