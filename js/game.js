/* ============================================================
   BEAT NEMI: GAME (otak utama)
   Game loop, input (tap = pukul, tahan+seret = lempar),
   damage, combo, crit, ultimate, menang, dan render.
   ============================================================ */

class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");

    this.effects = new Effects();
    this.particles = new ParticleSystem();
    this.popups = new PopupSystem();
    this.bubble = new DialogueBubble();
    this.weapons = new WeaponManager();

    this.state = "TITLE";           // TITLE | PLAYING | KO
    this.pointer = { x: innerWidth / 2, y: innerHeight * 0.4, type: "mouse", down: false, seen: false };
    this.dragCandidate = false;
    this.downPos = { x: 0, y: 0 };

    this._resize();
    addEventListener("resize", () => this._resize());

    this.level = 0;
    this.boss = new Boss(this);
    this.ui = new UI(this);
    this._resetRound();

    // restore foto custom yang pernah di-upload
    try {
      const saved = localStorage.getItem("beatnemi_face");
      if (saved) this.boss.setCustomImage(saved);
    } catch (e) {}

    this.ambient = [];   // hati-hati kecil melayang di background
    this.ambientT = 0;

    this._bindInput();

    this.last = performance.now();
    requestAnimationFrame(t => this._loop(t));
  }

  /* ---------- setup ---------- */

  _resize() {
    // Di layar kecil (HP) turunin DPR biar gak berat, fill-rate mobile itu mahal.
    const small = Math.min(innerWidth, innerHeight) < 820;
    const dpr = Math.min(small ? 1.5 : 2, window.devicePixelRatio || 1);
    this.w = innerWidth;
    this.h = innerHeight;
    this.dpr = dpr;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.canvas.style.width = this.w + "px";
    this.canvas.style.height = this.h + "px";

    // cache gradient background & vignette
    const g = this.ctx.createLinearGradient(0, 0, 0, this.h);
    g.addColorStop(0, "#2b0a33");
    g.addColorStop(0.55, "#47103f");
    g.addColorStop(1, "#1d0626");
    this.bgGrad = g;

    const v = this.ctx.createRadialGradient(
      this.w / 2, this.h / 2, Math.min(this.w, this.h) * 0.45,
      this.w / 2, this.h / 2, Math.max(this.w, this.h) * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.45)");
    this.vignette = v;
  }

  _resetRound() {
    this.combo = 0;
    this.comboTimer = 0;
    this.ult = 0;
    this.idleTimer = 0;
    this.elapsed = 0;
    this.stats = { hits: 0, maxCombo: 0 };
    this.winByUlt = false;
    this.ui.setHP(this.boss.hp, this.boss.maxHp);
    this.ui.setCombo(0);
    this.ui.setUlt(0, CONFIG.ULT.MAX);
  }

  _bindInput() {
    const pos = e => ({ x: e.clientX, y: e.clientY });

    this.canvas.addEventListener("pointerdown", e => {
      e.preventDefault();
      SFX.init();
      const p = pos(e);
      this.pointer.x = p.x; this.pointer.y = p.y;
      this.pointer.type = e.pointerType || "mouse";
      this.pointer.seen = true;
      if (this.state !== "PLAYING" && this.state !== "KO") return;

      this.pointer.down = true;
      this.downPos = p;
      this.dragCandidate = this.boss.containsPoint(p.x, p.y);

      if (this.state !== "PLAYING") return;
      if (this.dragCandidate) {
        this.punch(p.x, p.y);
      } else {
        SFX.whoosh();
        this.weapons.swing(p.x, p.y);
      }
    });

    addEventListener("pointermove", e => {
      this.pointer.x = e.clientX;
      this.pointer.y = e.clientY;
      this.pointer.type = e.pointerType || "mouse";
      this.pointer.seen = true;
      if (this.pointer.down && this.dragCandidate && !this.boss.dragging) {
        if (dist(this.downPos.x, this.downPos.y, e.clientX, e.clientY) > 14) {
          this.boss.startDrag();
        }
      }
    });

    addEventListener("pointerup", () => {
      this.pointer.down = false;
      this.dragCandidate = false;
      if (this.boss.dragging) this.boss.endDrag();
    });

    addEventListener("keydown", e => {
      const k = e.key.toLowerCase();
      if (k >= "1" && k <= String(CONFIG.WEAPONS.length)) this.selectWeapon(+k - 1);
      if (k === "r") this.restart();
      if (k === "m") {
        SFX.setMuted(!SFX.muted);
        this.ui.btnMute.textContent = SFX.muted ? "🔇" : "🔊";
      }
      // spasi = pukul langsung ke boss (biar gampang di PC)
      if (k === " " && this.state === "PLAYING") {
        e.preventDefault();
        this.punch(this.boss.x + rand(-25, 25), this.boss.y + rand(-25, 25));
      }
    });

    this.canvas.addEventListener("contextmenu", e => e.preventDefault());
  }

  /* ---------- kontrol state ---------- */

  start() {
    SFX.init();
    this.state = "PLAYING";
    this.level = 0;
    this.boss.reset();
    this._resetRound();
    this._showLevel();
    this.ui.hideTitle();
  }

  restart() {
    SFX.init();
    if (this.state === "TITLE") return;
    this.state = "PLAYING";
    this.level = 0;
    this.boss.reset();
    this._resetRound();
    this._showLevel();
    this.ui.hideWin();
    this.bubble.text = null;
  }

  currentLevelHp() {
    return (CONFIG.LEVELS[this.level] || CONFIG.LEVELS[0]).hp;
  }

  selectWeapon(i) {
    this.weapons.select(i);
    this.ui.selectWeapon(i);
  }

  setFace(dataUrl) {
    this.boss.setCustomImage(dataUrl);
    try { localStorage.setItem("beatnemi_face", dataUrl); } catch (e) {}
  }

  /* ---------- aksi ---------- */

  punch(x, y) {
    if (this.state !== "PLAYING") return;
    const w = this.weapons.current;
    this.idleTimer = 0;
    this.weapons.swing(x, y);

    // --- senjata cium: nyembuhin (gag) ---
    if (w.heal) {
      this.boss.heal(w.heal);
      SFX.kiss();
      this.particles.emit(x, y, {
        emojis: w.particles, count: 9, gravity: -150, speed: [40, 170], life: [0.7, 1.3],
      });
      this.popups.add(pick(w.words), x, y - 22, { color: "#ffb3ec", size: 30 });
      this.popups.add("+" + w.heal + " EGO", x + rand(-15, 15), y + 12,
        { color: "#8dffb0", size: 18, dur: 0.9, dy: -55 });
      this.bubble.say(pick(CONFIG.DIALOGS_KISS), 1.8);
      this.ult = Math.min(CONFIG.ULT.MAX, this.ult + CONFIG.ULT.PER_KISS);
      this.ui.setUlt(this.ult, CONFIG.ULT.MAX);
      this.ui.setHP(this.boss.hp, this.boss.maxHp);
      return;
    }

    // --- damage ---
    let dmg = randInt(w.dmg[0], w.dmg[1]) + Math.floor(this.combo / CONFIG.COMBO.DMG_PER);
    const crit = Math.random() < CONFIG.CRIT.CHANCE;
    if (crit) dmg = Math.round(dmg * CONFIG.CRIT.MULT);

    // arah knockback = dari titik pukul ke pusat muka
    let dx = this.boss.x - x, dy = this.boss.y - y;
    const d = Math.hypot(dx, dy);
    if (d < 1) { dx = rand(-1, 1); dy = rand(-1, 1); }
    else { dx /= d; dy /= d; }

    const res = this.boss.takeDamage(dmg, dx, dy, x, y);
    SFX[w.sfx]();

    // combo
    this.combo++;
    this.comboTimer = 0;
    this.stats.hits++;
    this.stats.maxCombo = Math.max(this.stats.maxCombo, this.combo);
    this.ui.setCombo(this.combo);
    if (this.combo % 10 === 0) {
      this.popups.add("RAMPAGE OF LOVE!! 🔥", this.boss.x, this.boss.y - this.boss.r - 46,
        { size: 34, color: "#ffd166", crit: true, dur: 1.3 });
      SFX.comboUp();
    }

    // partikel & popup
    this.particles.emit(x, y, {
      emojis: w.particles, count: crit ? 18 : 10, speed: [120, 430], life: [0.4, 0.9],
    });
    const word = Math.random() < 0.3 ? pick(CONFIG.DAMAGE_LOVE) : pick(w.words);
    this.popups.add(word, x + rand(-12, 12), y - 26, {
      size: crit ? 40 : 28,
      color: crit ? "#ffe066" : pick(["#ff5e9c", "#ffffff", "#ffb3c6"]),
      crit,
    });
    this.popups.add("-" + dmg, x + rand(-26, 26), y + 10,
      { size: 17, color: "rgba(255,255,255,0.75)", dur: 0.8, dy: -50 });

    if (crit) {
      this.popups.add("KRITIS!!", this.boss.x, this.boss.y - this.boss.r - 26,
        { size: 44, color: "#ff3860", crit: true, dur: 1.1 });
      SFX.crit();
      this.effects.slowmo(CONFIG.CRIT.SLOWMO, CONFIG.CRIT.SLOWMO_DUR);
      this.effects.punchZoom(0.07);
    }

    // juice
    this.effects.addShake(w.shake + (crit ? 0.25 : 0));
    this.effects.stop(crit ? 0.07 : 0.03);   // hitstop dipangkas biar tap cepet gak kerasa nge-freeze
    this.effects.addFlash(crit ? 0.22 : 0.1);

    // ult charge
    this.ult = Math.min(CONFIG.ULT.MAX, this.ult + CONFIG.ULT.PER_HIT);
    this.ui.setUlt(this.ult, CONFIG.ULT.MAX);

    // dialog: prioritas fase, kadang-kadang random
    let phaseTalked = false;
    for (const th of [75, 50, 25, 10]) {
      if (res.before > th && res.after <= th && CONFIG.DIALOGS_PHASE[th]) {
        this.bubble.say(pick(CONFIG.DIALOGS_PHASE[th]), 2.6);
        phaseTalked = true;
        break;
      }
    }
    if (!phaseTalked && Math.random() < 0.2) {
      this.bubble.say(pick(CONFIG.DIALOGS_HIT), 1.6);
    }

    this.ui.setHP(this.boss.hp, this.boss.maxHp);
    if (this.boss.hp <= 0) this.bossDown(false);
  }

  // dipanggil boss waktu nabrak dinding dengan kecepatan tinggi
  onWallSlam(speed) {
    if (this.state !== "PLAYING" || this.boss.ko) return;
    const dmg = CONFIG.WALL_SLAM.DMG + Math.floor(speed / 400);
    const res = this.boss.takeDamage(dmg, rand(-0.5, 0.5), -0.6, this.boss.x, this.boss.y);
    SFX.bonk();
    this.effects.addShake(0.4);
    this.effects.addFlash(0.12);
    this.particles.emit(this.boss.x, this.boss.y, {
      emojis: ["⭐", "💫", "💥"], count: 12, speed: [100, 380],
    });
    this.popups.add(pick(CONFIG.DIALOGS_SLAM) + " -" + dmg, this.boss.x, this.boss.y - this.boss.r - 20,
      { size: 30, color: "#ffd166" });
    this.stats.hits++;
    this.ui.setHP(this.boss.hp, this.boss.maxHp);
    for (const th of [75, 50, 25, 10]) {
      if (res.before > th && res.after <= th && CONFIG.DIALOGS_PHASE[th]) {
        this.bubble.say(pick(CONFIG.DIALOGS_PHASE[th]), 2.6);
        break;
      }
    }
    if (this.boss.hp <= 0) this.bossDown(false);
  }

  useUlt() {
    if (this.state !== "PLAYING" || this.ult < CONFIG.ULT.MAX) return;
    this.ult = 0;
    this.ui.setUlt(0, CONFIG.ULT.MAX);
    this.winByUlt = true;

    SFX.ult();
    this.effects.addShake(0.85);
    this.effects.addFlash(0.5, "#ff8ad8");
    this.effects.slowmo(0.3, 0.9);
    this.effects.punchZoom(0.1);

    this.particles.emit(this.boss.x, this.boss.y, {
      emojis: ["💖", "💗", "💘", "🤗", "✨"], count: 55, speed: [100, 650],
      gravity: -40, life: [0.8, 1.8], size: [20, 44],
    });
    this.popups.add(CONFIG.ULT.NAME + "!!!", this.w / 2, this.h * 0.32,
      { size: 42, color: "#ffb3ec", crit: true, dur: 1.6 });

    this.boss.takeDamage(this.boss.hp, 0, -1, this.boss.x, this.boss.y);
    this.ui.setHP(0, this.boss.maxHp);
    this.bossDown(true);
  }

  // Boss tumbang: kalau masih ada ronde lagi, lanjut ronde berikut (HP nambah).
  // Kalau ini ronde terakhir, baru menang beneran.
  bossDown(byUlt) {
    if (this.state !== "PLAYING") return;
    if (this.level < CONFIG.LEVELS.length - 1) this.advanceLevel();
    else this.winSequence(byUlt);
  }

  advanceLevel() {
    this.level++;
    const lv = CONFIG.LEVELS[this.level];

    SFX.comboUp();
    this.effects.addFlash(0.35, "#ffd166");
    this.effects.addShake(0.4);
    this.particles.confettiHearts(this.w, 22);
    this.popups.add("RONDE " + (this.level + 1), this.w / 2, this.h * 0.30,
      { size: 44, color: "#ffd166", crit: true, dur: 1.6 });
    this.popups.add(lv.name, this.w / 2, this.h * 0.30 + 42,
      { size: 22, color: "#ffffff", dur: 1.6, dy: -34 });
    this.bubble.say(pick(CONFIG.LEVEL_CLEAR), 2.4);

    this.boss.nextLevel(lv.hp);
    this.combo = 0;
    this.comboTimer = 0;
    this.idleTimer = 0;
    this.ui.setCombo(0);
    this.ui.setHP(this.boss.hp, this.boss.maxHp);
    this._showLevel();
  }

  _showLevel() {
    const lv = CONFIG.LEVELS[this.level];
    this.ui.setLevel(this.level + 1, CONFIG.LEVELS.length, lv.name);
  }

  winSequence(byUlt) {
    if (this.state !== "PLAYING") return;
    this.state = "KO";
    this.stats.maxCombo = Math.max(this.stats.maxCombo, this.combo);
    this.ui.setCombo(0);

    SFX.ko();
    this.effects.addShake(0.6);
    this.particles.confettiHearts(this.w, 60);

    const quote = byUlt ? CONFIG.ULT_QUOTE : pick(CONFIG.KO_QUOTES);

    // simpan rekor
    let bests = {};
    try { bests = JSON.parse(localStorage.getItem("beatnemi_bests") || "{}"); } catch (e) {}
    const newFastest = !bests.fastest || this.elapsed < bests.fastest;
    const newCombo = !bests.maxCombo || this.stats.maxCombo > bests.maxCombo;
    bests.fastest = newFastest ? this.elapsed : bests.fastest;
    bests.maxCombo = newCombo ? this.stats.maxCombo : bests.maxCombo;
    bests.totalKO = (bests.totalKO || 0) + 1;
    try { localStorage.setItem("beatnemi_bests", JSON.stringify(bests)); } catch (e) {}

    const rows = [
      ["⏱ Waktu", formatTime(this.elapsed) + (newFastest ? " 🏅 REKOR!" : "")],
      ["👊 Total serangan", this.stats.hits],
      ["🔥 Combo tertinggi", "x" + this.stats.maxCombo + (newCombo ? " 🏅 REKOR!" : "")],
      ["😵 " + CONFIG.NAMA_BOSS + " di-KO", bests.totalKO + " kali"],
    ];
    const statsHtml = rows.map(([k, v]) =>
      `<div class="stat-row"><span>${k}</span><b>${v}</b></div>`).join("");

    setTimeout(() => {
      SFX.win();
      this.particles.confettiHearts(this.w, 40);
      this.ui.showWin(quote, statsHtml);
    }, 1500);
  }

  /* ---------- update & render ---------- */

  update(dt) {
    if (this.state === "PLAYING") {
      this.comboTimer += dt;
      if (this.combo > 0 && this.comboTimer > CONFIG.COMBO.TIMEOUT) {
        this.combo = 0;
        this.ui.setCombo(0);
      }
      this.idleTimer += dt;
      if (this.idleTimer > 8) {
        this.idleTimer = 0;
        this.bubble.say(pick(CONFIG.DIALOGS_IDLE), 2.2);
      }
    }

    if (this.state !== "TITLE") this.boss.update(dt);
    this.particles.update(dt);
    this.popups.update(dt);
    this.bubble.update(dt);
    this.weapons.update(dt);

    // hati ambient di background
    this.ambientT -= dt;
    if (this.ambientT <= 0) {
      this.ambientT = rand(0.6, 1.2);
      // dibatasi 16 biar gak numpuk (dulu bisa 50+ = beban render diam-diam)
      if (this.ambient.length < 16) this.ambient.push({
        x: rand(0, this.w), y: this.h + 30,
        v: rand(14, 42), size: rand(11, 24),
        alpha: rand(0.05, 0.13), emoji: pick(["💗", "💖", "💘"]),
        sway: rand(0, TAU),
      });
    }
    for (const a of this.ambient) {
      a.y -= a.v * dt;
      a.x += Math.sin(a.y * 0.01 + a.sway) * 12 * dt;
    }
    this.ambient = this.ambient.filter(a => a.y > -40);
  }

  render() {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // background
    ctx.fillStyle = this.bgGrad;
    ctx.fillRect(0, 0, this.w, this.h);

    // hati ambient
    for (const a of this.ambient) {
      ctx.globalAlpha = a.alpha;
      drawEmoji(ctx, a.emoji, a.x, a.y, a.size);
    }
    ctx.globalAlpha = 1;

    // dunia game (kena shake + zoom)
    const sh = this.effects.shakeOffset();
    ctx.save();
    ctx.translate(this.w / 2 + sh.x, this.h / 2 + sh.y);
    ctx.rotate(sh.r);
    ctx.translate(-this.w / 2, -this.h / 2);
    if (this.effects.zoom > 1.001) {
      ctx.translate(this.boss.x, this.boss.y);
      ctx.scale(this.effects.zoom, this.effects.zoom);
      ctx.translate(-this.boss.x, -this.boss.y);
    }

    if (this.state !== "TITLE") {
      this.boss.render(ctx);
      this.weapons.render(ctx);
      this.particles.render(ctx);
      this.popups.render(ctx);
      this.bubble.render(ctx, this.boss.x, this.boss.y - this.boss.r * 1.15, this.w);
    } else {
      this.particles.render(ctx);
    }

    ctx.restore();

    // flash impact
    if (this.effects.flash > 0.01) {
      ctx.globalAlpha = this.effects.flash;
      ctx.fillStyle = this.effects.flashColor;
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.globalAlpha = 1;
    }

    // vignette
    ctx.fillStyle = this.vignette;
    ctx.fillRect(0, 0, this.w, this.h);

    // kursor senjata (desktop, pas main aja)
    if (this.state === "PLAYING" && this.pointer.type === "mouse" && this.pointer.seen) {
      this.weapons.renderCursor(ctx, this.pointer.x, this.pointer.y);
    }
  }

  _loop(t) {
    // jaga-jaga: ukuran window berubah tanpa event resize
    // (rotate HP, address bar muncul, panel embed baru ke-layout)
    if (this.w !== innerWidth || this.h !== innerHeight) {
      const wasZero = this.w < 2 || this.h < 2;
      this._resize();
      if (wasZero && this.state !== "PLAYING") this.boss.reset();
    }
    const raw = Math.min(0.033, (t - this.last) / 1000);
    this.last = t;
    const dt = this.effects.update(raw);
    if (this.state === "PLAYING") this.elapsed += raw;
    this.update(dt);
    this.render();
    requestAnimationFrame(tt => this._loop(tt));
  }
}

window.addEventListener("load", () => { window.game = new Game(); });
