/* ============================================================
   BEAT NEMI — BOSS (SI MUKA)
   Fisika: jalan-jalan sendiri, bisa di-drag & dilempar,
   mantul di dinding, squash & stretch pas kena pukul.
   Visual: foto asli (kalau ada) / muka kartun fallback,
   plus decal memar, bekas tamparan, air mata, bintang pusing.
   ============================================================ */

class Boss {
  constructor(game) {
    this.game = game;
    this.images = {};
    this.custom = false;
    for (const [key, src] of Object.entries(CONFIG.FACE_IMAGES)) this._load(key, src);
    this.reset();
  }

  _load(key, src) {
    const img = new Image();
    img.onload = () => { this.images[key] = img; };
    img.onerror = () => {};
    img.src = src;
  }

  // Foto upload dari title screen
  setCustomImage(url) {
    const img = new Image();
    img.onload = () => { this.images.normal = img; this.custom = true; };
    img.src = url;
  }

  reset() {
    const g = this.game;
    this.maxHp = CONFIG.BOSS.MAX_HP;
    this.hp = this.maxHp;
    this.ko = false;

    this.x = g.w / 2;
    this.y = (CONFIG.ARENA.TOP + (g.h - CONFIG.ARENA.BOTTOM)) / 2;
    this.vx = rand(-40, 40);
    this.vy = rand(-40, 40);
    this.r = this._radius();

    // spring squash & stretch
    this.sx = 1; this.sy = 1;
    this.vsx = 0; this.vsy = 0;
    this.rot = 0; this.vrot = 0;

    this.dragging = false;
    this.dragOff = { x: 0, y: 0 };

    this.hurtTimer = 0;
    this.wobbleT = 0;
    this.t = 0;
    this.blinkTimer = rand(2, 4);
    this.blink = 0;

    this.retarget = 0;
    this.tx = this.x; this.ty = this.y;

    this.slapMarks = [];   // bekas tamparan merah (memudar)
    this.bruises = [];     // memar permanen (sampai restart)
    this.tears = [];       // air mata jalan di pipi
    this.tearTimer = 0;
    this.sweatTimer = 0;
  }

  _radius() {
    return clamp(CONFIG.BOSS.RADIUS_FRAC * Math.min(this.game.w, this.game.h), 70, 175);
  }

  get hpPct() { return (this.hp / this.maxHp) * 100; }

  containsPoint(px, py) {
    return dist(px, py, this.x, this.y) <= this.r * Math.max(this.sx, this.sy) * 1.05;
  }

  startDrag() {
    if (this.dragging) return;
    this.dragging = true;
    const p = this.game.pointer;
    this.dragOff.x = this.x - p.x;
    this.dragOff.y = this.y - p.y;
  }

  endDrag() {
    if (!this.dragging) return;
    this.dragging = false;
    const sp = Math.hypot(this.vx, this.vy);
    if (sp > 2400) { // batasi kecepatan lemparan
      this.vx = (this.vx / sp) * 2400;
      this.vy = (this.vy / sp) * 2400;
    }
  }

  takeDamage(dmg, dirX, dirY, hitX, hitY) {
    if (this.ko) return { before: this.hpPct, after: this.hpPct };
    const before = this.hpPct;
    this.hp = Math.max(0, this.hp - dmg);
    this.hurtTimer = 0.35;

    // squash & stretch + knockback + puntiran
    this.vsx -= rand(2.6, 3.6);
    this.vsy += rand(1.6, 2.6);
    this.vx += dirX * CONFIG.BOSS.KNOCKBACK;
    this.vy += dirY * CONFIG.BOSS.KNOCKBACK * 0.6;
    this.vrot += dirX * rand(1.5, 3);

    // bekas tamparan merah di titik pukulan (koordinat lokal)
    if (hitX != null) {
      const lx = clamp(hitX - this.x, -this.r * 0.75, this.r * 0.75);
      const ly = clamp(hitY - this.y, -this.r * 0.75, this.r * 0.75);
      this.slapMarks.push({ x: lx, y: ly, life: 1 });
      if (this.slapMarks.length > 6) this.slapMarks.shift();
    }

    // sesekali nambah memar permanen
    if (Math.random() < 0.22 && this.bruises.length < 8) {
      const a = rand(0, TAU), d = rand(0.15, 0.55) * this.r;
      this.bruises.push({
        x: Math.cos(a) * d, y: Math.sin(a) * d,
        r: rand(0.14, 0.26) * this.r, a: rand(0.2, 0.4),
      });
    }

    if (this.hp <= 0) this.ko = true;
    return { before, after: this.hpPct };
  }

  heal(amount) {
    if (this.ko) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    // sembuh dikit = memar & bekas tamparan pudar satu
    if (this.bruises.length) this.bruises.pop();
    this.vsy += 1.2; // bounce senang
  }

  update(dt) {
    const g = this.game;
    this.t += dt;
    this.r = this._radius();

    const A = CONFIG.ARENA;
    let minX = A.SIDE + this.r, maxX = g.w - A.SIDE - this.r;
    let minY = A.TOP + this.r,  maxY = g.h - A.BOTTOM - this.r;
    // layar terlalu sempit buat arena? jepit ke titik tengah biar nggak oscillate
    if (maxX < minX) minX = maxX = (minX + maxX) / 2;
    if (maxY < minY) minY = maxY = (minY + maxY) / 2;

    if (this.dragging) {
      // ikutin jari/mouse dengan sedikit spring, sambil catat kecepatan buat fling
      const p = g.pointer;
      const targetX = clamp(p.x + this.dragOff.x, minX, maxX);
      const targetY = clamp(p.y + this.dragOff.y, minY, maxY);
      const f = Math.min(1, dt * 18);
      const nx = this.x + (targetX - this.x) * f;
      const ny = this.y + (targetY - this.y) * f;
      const invDt = 1 / Math.max(dt, 1e-4);
      this.vx = lerp(this.vx, (nx - this.x) * invDt, 0.5);
      this.vy = lerp(this.vy, (ny - this.y) * invDt, 0.5);
      this.x = nx; this.y = ny;
    } else {
      // AI jalan-jalan santai (panik kalau HP < 50%)
      if (!this.ko) {
        this.retarget -= dt;
        if (this.retarget <= 0) {
          this.retarget = rand(1.5, 3.5);
          this.tx = rand(minX, maxX);
          this.ty = rand(minY, maxY);
        }
        const speed = CONFIG.BOSS.WANDER_SPEED * (this.hpPct <= 50 ? CONFIG.BOSS.PANIC_MULT : 1);
        const dx = this.tx - this.x, dy = this.ty - this.y;
        const d = Math.hypot(dx, dy);
        if (d > 4) {
          this.vx += (dx / d) * speed * 3 * dt;
          this.vy += (dy / d) * speed * 3 * dt;
        }
      }

      // redaman + integrasi
      const damp = Math.pow(0.35, dt);
      this.vx *= damp; this.vy *= damp;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // mantul dinding (lempar kenceng = wall slam damage)
      const B = CONFIG.BOSS.BOUNCE;
      if (this.x < minX) { this.x = minX; this._wallHit(Math.abs(this.vx)); this.vx = Math.abs(this.vx) * B; this.vsx -= 2; }
      if (this.x > maxX) { this.x = maxX; this._wallHit(Math.abs(this.vx)); this.vx = -Math.abs(this.vx) * B; this.vsx -= 2; }
      if (this.y < minY) { this.y = minY; this._wallHit(Math.abs(this.vy)); this.vy = Math.abs(this.vy) * B; this.vsy -= 2; }
      if (this.y > maxY) { this.y = maxY; this._wallHit(Math.abs(this.vy)); this.vy = -Math.abs(this.vy) * B; this.vsy -= 2; }
    }

    // spring scale balik ke 1 (squash & stretch)
    const STIFF = 170, DAMP = 9;
    this.vsx += (1 - this.sx) * STIFF * dt - this.vsx * DAMP * dt;
    this.vsy += (1 - this.sy) * STIFF * dt - this.vsy * DAMP * dt;
    this.sx = clamp(this.sx + this.vsx * dt, 0.55, 1.5);
    this.sy = clamp(this.sy + this.vsy * dt, 0.55, 1.5);

    // rotasi spring balik ke 0
    this.vrot += -this.rot * 40 * dt - this.vrot * 6 * dt;
    this.rot += this.vrot * dt;

    if (this.hurtTimer > 0) this.hurtTimer -= dt;

    // kedip (buat muka kartun)
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) { this.blink = 0.13; this.blinkTimer = rand(2, 4.5); }
    if (this.blink > 0) this.blink -= dt;

    // wobble mleyot di HP rendah
    if (this.hpPct <= 10 || this.ko) this.wobbleT += dt * 6;

    // air mata pas fase nangis
    if (this.hpPct <= 25 && !this.ko) {
      this.tearTimer -= dt;
      if (this.tearTimer <= 0) {
        this.tearTimer = rand(0.35, 0.7);
        const side = Math.random() < 0.5 ? -1 : 1;
        this.tears.push({ x: side * this.r * 0.34, y: this.r * 0.02, v: rand(50, 90) });
      }
    }
    for (const tr of this.tears) tr.y += tr.v * dt;
    this.tears = this.tears.filter(tr => tr.y < this.r * 0.95);

    // keringetan pas fase panik
    if (this.hpPct <= 50 && this.hpPct > 25 && !this.ko) {
      this.sweatTimer -= dt;
      if (this.sweatTimer <= 0) {
        this.sweatTimer = rand(0.7, 1.4);
        this.game.particles.emit(this.x + this.r * 0.6, this.y - this.r * 0.6, {
          count: 1, emojis: ["💦"], speed: [60, 130], angle: -Math.PI / 3,
          spread: 1, gravity: 400, size: [16, 22],
        });
      }
    }

    // memudarkan bekas tamparan
    for (const m of this.slapMarks) m.life -= dt * 0.5;
    this.slapMarks = this.slapMarks.filter(m => m.life > 0);
  }

  _wallHit(speed) {
    if (speed < 40) return;
    SFX.bounce();
    this.game.effects.addShake(clamp(speed / 3000, 0.04, 0.25));
    if (speed >= CONFIG.WALL_SLAM.MIN_SPEED) this.game.onWallSlam(speed);
  }

  // pilih ekspresi buat muka kartun / overlay
  expression() {
    if (this.ko) return "ko";
    if (this.hurtTimer > 0) return "kaget";
    if (this.hpPct <= 10) return "mleyot";
    if (this.hpPct <= 25) return "nangis";
    if (this.hpPct <= 50) return "serius";
    return "normal";
  }

  // pilih foto sesuai kondisi (fallback ke normal)
  pickImage() {
    if (this.ko) return this.images.ko || this.images.normal || null;
    if (this.hurtTimer > 0 && this.images.kaget) return this.images.kaget;
    if (this.hpPct <= 25) return this.images.nangis || this.images.normal || null;
    return this.images.normal || null;
  }

  render(ctx) {
    const melt = (this.hpPct <= 10 && !this.ko) ? Math.sin(this.wobbleT) * 0.09 : 0;
    const koBob = this.ko ? Math.sin(this.t * 2) * 5 : 0;
    const sx = this.sx + melt;
    const sy = this.sy - melt;

    ctx.save();
    ctx.translate(this.x, this.y + koBob);
    ctx.rotate(this.rot + (this.ko ? Math.sin(this.t * 1.5) * 0.08 : 0));

    // spotlight lembut di belakang muka
    const glow = ctx.createRadialGradient(0, 0, this.r * 0.4, 0, 0, this.r * 2);
    glow.addColorStop(0, "rgba(255,80,160,0.22)");
    glow.addColorStop(1, "rgba(255,80,160,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, this.r * 2, 0, TAU);
    ctx.fill();

    ctx.scale(sx, sy);

    // ---- dalam lingkaran (clip) ----
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, TAU);
    ctx.clip();

    const img = this.pickImage();
    if (img) {
      const s = (this.r * 2) / Math.min(img.width, img.height);
      ctx.drawImage(img, -img.width * s / 2, -img.height * s / 2, img.width * s, img.height * s);
    } else {
      this._drawFallbackFace(ctx);
    }

    // memar permanen
    for (const b of this.bruises) {
      const gr = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      gr.addColorStop(0, `rgba(120,60,180,${b.a})`);
      gr.addColorStop(1, "rgba(120,60,180,0)");
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, TAU);
      ctx.fill();
    }

    // bekas tamparan merah (memudar)
    for (const m of this.slapMarks) {
      const rr = this.r * 0.3;
      const gr = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, rr);
      gr.addColorStop(0, `rgba(255,60,60,${0.4 * m.life})`);
      gr.addColorStop(1, "rgba(255,60,60,0)");
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(m.x, m.y, rr, 0, TAU);
      ctx.fill();
    }

    // air mata di pipi
    ctx.fillStyle = "rgba(120,190,255,0.85)";
    for (const tr of this.tears) {
      ctx.beginPath();
      ctx.ellipse(tr.x, tr.y, this.r * 0.045, this.r * 0.07, 0, 0, TAU);
      ctx.fill();
    }

    // overlay X-eyes kalau KO tapi nggak punya foto KO khusus
    if (this.ko && !this.images.ko && img) this._drawKOEyes(ctx);

    ctx.restore(); // lepas clip

    // ring pinggir
    ctx.lineWidth = 6;
    ctx.strokeStyle = this.ko ? "rgba(255,255,255,0.35)" : "rgba(255,120,190,0.8)";
    ctx.beginPath();
    ctx.arc(0, 0, this.r + 3, 0, TAU);
    ctx.stroke();

    // simbol marah pas kena pukul (mode foto)
    if (this.hurtTimer > 0 && img && !this.images.kaget && !this.ko) {
      ctx.font = `${this.r * 0.4}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("💢", this.r * 0.75, -this.r * 0.6);
    }

    ctx.restore(); // lepas scale+rotate+translate

    // bintang pusing muter di atas kepala (di luar scale biar stabil)
    if (this.hpPct <= 10 || this.ko) {
      ctx.save();
      ctx.translate(this.x, this.y + koBob - this.r * 1.18);
      ctx.font = `${this.r * 0.28}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < 3; i++) {
        const a = this.t * 3 + (i * TAU) / 3;
        ctx.globalAlpha = 0.6 + Math.sin(a) * 0.4;
        ctx.fillText(i % 2 ? "⭐" : "💫", Math.cos(a) * this.r * 0.55, Math.sin(a) * this.r * 0.16);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  _drawKOEyes(ctx) {
    ctx.strokeStyle = "#e33";
    ctx.lineWidth = this.r * 0.06;
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      const ex = side * this.r * 0.32, ey = -this.r * 0.15, s = this.r * 0.12;
      ctx.beginPath();
      ctx.moveTo(ex - s, ey - s); ctx.lineTo(ex + s, ey + s);
      ctx.moveTo(ex + s, ey - s); ctx.lineTo(ex - s, ey + s);
      ctx.stroke();
    }
  }

  /* Muka kartun fallback — dipakai kalau foto belum ditaruh.
     Ekspresi ngikutin fase HP (termasuk kacamata hitam di fase serius). */
  _drawFallbackFace(ctx) {
    const r = this.r;
    const expr = this.expression();

    // kulit
    ctx.fillStyle = "#ffd9ad";
    ctx.fillRect(-r, -r, r * 2, r * 2);

    // rambut
    ctx.fillStyle = "#3d2314";
    ctx.beginPath();
    ctx.arc(0, -r * 0.42, r * 0.82, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(i * r * 0.28, -r * 0.42, r * 0.2, Math.PI, 0);
      ctx.fill();
    }

    // blush pipi
    ctx.fillStyle = "rgba(255,120,120,0.4)";
    ctx.beginPath(); ctx.arc(-r * 0.45, r * 0.18, r * 0.15, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.45, r * 0.18, r * 0.15, 0, TAU); ctx.fill();

    const eyeY = -r * 0.08;
    const eyeX = r * 0.3;
    ctx.strokeStyle = "#2b1a12";
    ctx.fillStyle = "#2b1a12";
    ctx.lineCap = "round";

    if (expr === "serius") {
      // kacamata hitam mode "sok cool terakhir"
      ctx.fillStyle = "#111";
      roundRectPath(ctx, -eyeX - r * 0.2, eyeY - r * 0.12, r * 0.4, r * 0.22, r * 0.06); ctx.fill();
      roundRectPath(ctx, eyeX - r * 0.2, eyeY - r * 0.12, r * 0.4, r * 0.22, r * 0.06); ctx.fill();
      ctx.fillRect(-eyeX + r * 0.2, eyeY - r * 0.04, eyeX * 2 - r * 0.4, r * 0.05);
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = r * 0.03;
      ctx.beginPath();
      ctx.moveTo(-eyeX - r * 0.12, eyeY - r * 0.06);
      ctx.lineTo(-eyeX + r * 0.02, eyeY + r * 0.04);
      ctx.stroke();
    } else if (expr === "kaget") {
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#2b1a12";
      ctx.lineWidth = r * 0.035;
      for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.arc(s * eyeX, eyeY, r * 0.16, 0, TAU); ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = "#2b1a12";
      for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.arc(s * eyeX, eyeY, r * 0.05, 0, TAU); ctx.fill();
      }
      // alis naik
      ctx.lineWidth = r * 0.045;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(s * eyeX, eyeY - r * 0.22, r * 0.12, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
    } else if (expr === "nangis") {
      // mata >_<
      ctx.lineWidth = r * 0.05;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s * (eyeX - r * 0.1), eyeY - r * 0.07);
        ctx.lineTo(s * (eyeX + r * 0.08), eyeY);
        ctx.lineTo(s * (eyeX - r * 0.1), eyeY + r * 0.07);
        ctx.stroke();
      }
    } else if (expr === "mleyot") {
      // mata spiral
      ctx.lineWidth = r * 0.035;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        for (let a = 0; a < TAU * 2.2; a += 0.25) {
          const rr = r * 0.02 + (a / (TAU * 2.2)) * r * 0.13;
          const px = s * eyeX + Math.cos(a) * rr;
          const py = eyeY + Math.sin(a) * rr;
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    } else if (expr === "ko") {
      ctx.lineWidth = r * 0.055;
      ctx.strokeStyle = "#c22";
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s * eyeX - r * 0.1, eyeY - r * 0.1); ctx.lineTo(s * eyeX + r * 0.1, eyeY + r * 0.1);
        ctx.moveTo(s * eyeX + r * 0.1, eyeY - r * 0.1); ctx.lineTo(s * eyeX - r * 0.1, eyeY + r * 0.1);
        ctx.stroke();
      }
    } else {
      // normal: mata bulat + kedip
      if (this.blink > 0) {
        ctx.lineWidth = r * 0.04;
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(s * eyeX - r * 0.09, eyeY);
          ctx.lineTo(s * eyeX + r * 0.09, eyeY);
          ctx.stroke();
        }
      } else {
        for (const s of [-1, 1]) {
          ctx.beginPath(); ctx.arc(s * eyeX, eyeY, r * 0.075, 0, TAU); ctx.fill();
        }
        ctx.fillStyle = "#fff";
        for (const s of [-1, 1]) {
          ctx.beginPath(); ctx.arc(s * eyeX + r * 0.025, eyeY - r * 0.025, r * 0.025, 0, TAU); ctx.fill();
        }
      }
    }

    // kumis tipis (gag wajib sesuai blueprint)
    ctx.strokeStyle = "#2b1a12";
    ctx.lineWidth = r * 0.035;
    ctx.beginPath();
    ctx.arc(-r * 0.11, r * 0.3, r * 0.11, Math.PI * 1.1, Math.PI * 1.9);
    ctx.arc(r * 0.11, r * 0.3, r * 0.11, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    // mulut per ekspresi
    ctx.strokeStyle = "#2b1a12";
    ctx.lineWidth = r * 0.05;
    const mouthY = r * 0.48;
    if (expr === "kaget") {
      ctx.fillStyle = "#7a3030";
      ctx.beginPath(); ctx.ellipse(0, mouthY, r * 0.13, r * 0.18, 0, 0, TAU); ctx.fill();
    } else if (expr === "nangis" || expr === "mleyot") {
      ctx.beginPath();
      for (let i = 0; i <= 14; i++) {
        const px = -r * 0.25 + (i / 14) * r * 0.5;
        const py = mouthY + Math.sin(i * 1.4 + this.t * 8) * r * 0.035;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
    } else if (expr === "ko") {
      ctx.beginPath();
      ctx.arc(0, mouthY + r * 0.08, r * 0.14, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      // lidah melet
      ctx.fillStyle = "#ff8fa3";
      ctx.beginPath();
      ctx.ellipse(r * 0.1, mouthY + r * 0.06, r * 0.06, r * 0.09, 0.3, 0, TAU);
      ctx.fill();
    } else if (expr === "serius") {
      ctx.beginPath();
      ctx.moveTo(-r * 0.18, mouthY); ctx.lineTo(r * 0.18, mouthY);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, mouthY - r * 0.06, r * 0.16, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }

    // caption gag
    ctx.font = `700 ${r * 0.12}px "Fredoka", sans-serif`;
    ctx.fillStyle = "rgba(43,26,18,0.5)";
    ctx.textAlign = "center";
    ctx.fillText(`INI MUKA ${CONFIG.NAMA_BOSS.toUpperCase()}`, 0, r * 0.82);
  }
}
