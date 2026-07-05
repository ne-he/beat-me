/* ============================================================
   BEAT NEMI — POPUPS & DIALOG BUBBLE
   Teks damage melayang ("DUAK!", "500 RINDU") + bubble omongan boss.
   ============================================================ */

class PopupSystem {
  constructor() {
    this.list = [];
  }

  add(text, x, y, opts = {}) {
    const {
      size = 28, color = "#ffffff", stroke = "#3b0a2a",
      crit = false, dy = -90, dur = 1.0,
    } = opts;
    this.list.push({ text, x, y, size, color, stroke, crit, dy, dur, age: 0, tilt: rand(-0.12, 0.12) });
  }

  update(dt) {
    for (const p of this.list) p.age += dt;
    this.list = this.list.filter(p => p.age < p.dur);
  }

  render(ctx) {
    for (const p of this.list) {
      const t = p.age / p.dur;
      // pop-in elastis di 18% pertama, lalu diam
      const scale = t < 0.18 ? easeOutBack(t / 0.18) : 1;
      const alpha = t > 0.65 ? 1 - (t - 0.65) / 0.35 : 1;
      const y = p.y + p.dy * easeOutCubic(t);

      ctx.save();
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.translate(p.x, y);
      ctx.rotate(p.tilt);
      const s = scale * (p.crit ? 1 + Math.sin(p.age * 22) * 0.05 : 1);
      ctx.scale(s, s);
      ctx.font = `800 ${p.size}px "Baloo 2", "Fredoka", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = Math.max(3, p.size / 6);
      ctx.lineJoin = "round";
      ctx.strokeStyle = p.stroke;
      ctx.strokeText(p.text, 0, 0);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}

/* Bubble omongan si boss — digambar di canvas, ngikutin posisi boss */
class DialogueBubble {
  constructor() {
    this.text = null;
    this.age = 0;
    this.dur = 0;
  }

  say(text, dur = 2.0) {
    this.text = text;
    this.age = 0;
    this.dur = dur;
  }

  update(dt) {
    if (!this.text) return;
    this.age += dt;
    if (this.age >= this.dur) this.text = null;
  }

  render(ctx, bx, by, screenW) {
    if (!this.text) return;
    const t = this.age / this.dur;
    const popIn = this.age < 0.15 ? easeOutBack(this.age / 0.15) : 1;
    const alpha = t > 0.8 ? 1 - (t - 0.8) / 0.2 : 1;

    ctx.save();
    ctx.globalAlpha = clamp(alpha, 0, 1);
    ctx.font = `600 17px "Fredoka", sans-serif`;

    const maxW = 230;
    const lines = wrapText(ctx, this.text, maxW);
    const lineH = 22;
    const padX = 16, padY = 12;
    let w = 0;
    for (const l of lines) w = Math.max(w, ctx.measureText(l).width);
    w += padX * 2;
    const h = lines.length * lineH + padY * 2;

    const x = clamp(bx, w / 2 + 12, screenW - w / 2 - 12);
    const y = by - h - 18;

    ctx.translate(x, y + h);
    ctx.scale(popIn, popIn);
    ctx.translate(-x, -(y + h));

    // badan bubble
    ctx.fillStyle = "#fffef5";
    ctx.strokeStyle = "#3b0a2a";
    ctx.lineWidth = 3;
    roundRectPath(ctx, x - w / 2, y, w, h, 16);
    ctx.fill();
    ctx.stroke();

    // ekor bubble ke arah boss
    const tailX = clamp(bx, x - w / 2 + 24, x + w / 2 - 24);
    ctx.beginPath();
    ctx.moveTo(tailX - 9, y + h - 1);
    ctx.lineTo(tailX + 9, y + h - 1);
    ctx.lineTo(tailX, y + h + 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // tutup garis atas ekor biar mulus
    ctx.strokeStyle = "#fffef5";
    ctx.beginPath();
    ctx.moveTo(tailX - 7, y + h - 1);
    ctx.lineTo(tailX + 7, y + h - 1);
    ctx.stroke();

    // teks
    ctx.fillStyle = "#4a1533";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    lines.forEach((l, i) => ctx.fillText(l, x, y + padY + lineH * (i + 0.5)));

    ctx.restore();
  }
}
