/* ============================================================
   BEAT NEMI — SCREEN EFFECTS
   Screen shake, flash, hitstop, slow motion, punch-zoom.
   Ini "bumbu juice" yang bikin pukulan berasa mantap.
   ============================================================ */

class Effects {
  constructor() {
    this.trauma = 0;       // 0..1 → shake = trauma^2
    this.flash = 0;
    this.flashColor = "#ffffff";
    this.timeScale = 1;
    this.slowTimer = 0;
    this.hitstop = 0;      // freeze sesaat pas impact
    this.zoom = 1;
  }

  addShake(amount)            { this.trauma = Math.min(1, this.trauma + amount); }
  addFlash(a, color = "#fff") { this.flash = Math.max(this.flash, a); this.flashColor = color; }
  slowmo(scale, dur)          { this.timeScale = scale; this.slowTimer = dur; }
  stop(dur)                   { this.hitstop = Math.max(this.hitstop, dur); }
  punchZoom(amount = 0.05)    { this.zoom = 1 + amount; }

  // Terima dt mentah, kembalikan dt game (kena slowmo/hitstop)
  update(raw) {
    let scale = this.timeScale;
    if (this.slowTimer > 0) {
      this.slowTimer -= raw;
      if (this.slowTimer <= 0) this.timeScale = 1;
    }
    if (this.hitstop > 0) {
      this.hitstop -= raw;
      scale = 0;
    }
    this.trauma = Math.max(0, this.trauma - raw * 2.2);
    this.flash = Math.max(0, this.flash - raw * 4);
    this.zoom += (1 - this.zoom) * Math.min(1, raw * 6);
    return raw * scale;
  }

  shakeOffset() {
    const s = this.trauma * this.trauma;
    return {
      x: rand(-1, 1) * 24 * s,
      y: rand(-1, 1) * 24 * s,
      r: rand(-1, 1) * 0.025 * s,
    };
  }
}
