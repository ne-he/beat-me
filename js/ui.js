/* ============================================================
   BEAT NEMI: UI (HUD DOM)
   HP bar, combo, ult, toolbar senjata, overlay title & menang.
   ============================================================ */

class UI {
  constructor(game) {
    this.game = game;
    this.$ = id => document.getElementById(id);

    this.hpFill = this.$("hp-fill");
    this.hpNum = this.$("hp-num");
    this.phaseLabel = this.$("phase-label");
    this.comboCard = this.$("combo-card");
    this.comboNum = this.$("combo-num");
    this.ultBtn = this.$("btn-ult");
    this.ultFill = this.$("ult-fill");
    this.toolbar = this.$("toolbar");
    this.titleOverlay = this.$("title-overlay");
    this.winOverlay = this.$("win-overlay");
    this.winQuote = this.$("win-quote");
    this.winStats = this.$("win-stats");
    this.btnMute = this.$("btn-mute");

    // teks dari config
    this.$("game-title").textContent = CONFIG.TITLE;
    this.$("subtitle").innerHTML =
      `khusus buat <b>${CONFIG.NAMA_PACAR}</b> 💛 dari <b>${CONFIG.NAMA_BOSS}</b>. pukulin aja muka aku sampe puas ya`;
    this.$("ult-label").textContent = CONFIG.ULT.NAME;
    this.$("hp-label").textContent = "❤️ HP";

    this._buildToolbar();
    this._wire();
  }

  _buildToolbar() {
    this.weaponBtns = CONFIG.WEAPONS.map((w, i) => {
      const btn = document.createElement("button");
      btn.className = "weapon-btn" + (i === 0 ? " active" : "");
      btn.title = `${w.nama}: ${w.desc}`;
      btn.innerHTML = `<span class="w-emoji">${w.emoji}</span><span class="w-key">${i + 1}</span>`;
      btn.addEventListener("click", () => this.game.selectWeapon(i));
      this.toolbar.appendChild(btn);
      return btn;
    });
  }

  _wire() {
    this.$("btn-start").addEventListener("click", () => this.game.start());
    this.$("btn-again").addEventListener("click", () => this.game.restart());
    this.$("btn-restart").addEventListener("click", () => this.game.restart());
    this.ultBtn.addEventListener("click", () => this.game.useUlt());

    this.btnMute.addEventListener("click", () => {
      SFX.setMuted(!SFX.muted);
      this.btnMute.textContent = SFX.muted ? "🔇" : "🔊";
    });

    const upload = this.$("face-upload");
    if (upload) {
      upload.addEventListener("change", e => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => this.game.setFace(ev.target.result);
        reader.readAsDataURL(file);
      });
    }
  }

  setHP(hp, max) {
    const pct = clamp((hp / max) * 100, 0, 100);
    this.hpFill.style.width = pct + "%";
    this.hpNum.textContent = `${Math.ceil(hp)} / ${max}`;
    this.hpFill.classList.toggle("hp-mid", pct > 30 && pct <= 60);
    this.hpFill.classList.toggle("hp-low", pct <= 30);
  }

  // Ronde ke berapa (tampil di pojok bar HP)
  setLevel(n, total, name) {
    this.phaseLabel.textContent = `Ronde ${n}/${total}`;
  }

  setCombo(n) {
    if (n >= 2) {
      this.comboCard.classList.remove("hidden");
      this.comboNum.textContent = "x" + n;
      // re-trigger animasi pop
      this.comboCard.classList.remove("pop");
      void this.comboCard.offsetWidth;
      this.comboCard.classList.add("pop");
    } else {
      this.comboCard.classList.add("hidden");
    }
  }

  setUlt(v, max) {
    const pct = clamp((v / max) * 100, 0, 100);
    this.ultFill.style.width = pct + "%";
    this.ultBtn.classList.toggle("ready", pct >= 100);
    this.ultBtn.disabled = pct < 100;
  }

  selectWeapon(i) {
    this.weaponBtns.forEach((b, j) => b.classList.toggle("active", i === j));
  }

  showTitle() { this.titleOverlay.classList.remove("hidden"); }
  hideTitle() { this.titleOverlay.classList.add("hidden"); }

  showWin(quote, statsHtml) {
    this.winQuote.textContent = `“${quote}”`;
    this.winStats.innerHTML = statsHtml;
    this.winOverlay.classList.remove("hidden");
  }

  hideWin() { this.winOverlay.classList.add("hidden"); }
}
