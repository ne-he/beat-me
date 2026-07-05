/* ============================================================
   BEAT NEMI — AUDIO
   Semua sound effect disintesis pakai Web Audio API,
   jadi TIDAK PERLU file MP3 sama sekali.
   ============================================================ */

const SFX = {
  ctx: null,
  master: null,
  muted: false,
  VOLUME: 0.45,

  // Dipanggil di gesture pertama user (aturan autoplay browser)
  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.VOLUME;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  },

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : this.VOLUME;
  },

  // --- generator dasar ---
  tone(type, f0, f1, dur, vol = 0.3, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(1, f0), t);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.05);
  },

  noise(dur, vol = 0.3, freq = 1000, type = "lowpass", delay = 0) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const n = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = this.ctx.createBufferSource();
    s.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.master);
    s.start(t);
  },

  // --- sound effects ---
  punch() { this.tone("sine", 150, 40, 0.15, 0.5); this.noise(0.08, 0.25, 800); },
  slap()  { this.noise(0.12, 0.5, 2500, "bandpass"); this.tone("sine", 300, 80, 0.08, 0.2); },
  bonk()  { this.tone("square", 220, 55, 0.25, 0.28); this.tone("sine", 660, 110, 0.18, 0.15); this.noise(0.05, 0.2, 1200); },
  splat() { this.noise(0.18, 0.45, 600); this.tone("sine", 200, 60, 0.15, 0.2); },
  kiss()  { this.tone("sine", 900, 1400, 0.07, 0.25); this.tone("sine", 1200, 500, 0.12, 0.2, 0.07); },
  crit()  { this.tone("sawtooth", 200, 900, 0.18, 0.22); this.tone("square", 400, 1200, 0.22, 0.13, 0.05); },
  whoosh(){ this.noise(0.12, 0.1, 900, "bandpass"); },
  bounce(){ this.tone("sine", 180, 320, 0.12, 0.16); },

  comboUp() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone("triangle", f, f, 0.12, 0.2, i * 0.06));
  },

  // Sad trombone: wah.. wah.. wah.. waaaah
  ko() {
    const notes = [294, 277, 262, 247];
    notes.forEach((f, i) =>
      this.tone("sawtooth", f, f * (i === 3 ? 0.88 : 0.97),
        i === 3 ? 0.9 : 0.3, 0.2, i * 0.32));
  },

  win() {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      this.tone("triangle", f, f, 0.2, 0.22, i * 0.1));
  },

  ult() {
    this.tone("sawtooth", 80, 700, 0.7, 0.28);           // riser
    this.noise(0.5, 0.3, 400, "lowpass", 0.6);           // boom
    this.tone("sine", 110, 30, 0.5, 0.5, 0.6);           // sub
    [784, 988, 1175, 1568].forEach((f, i) =>
      this.tone("triangle", f, f, 0.25, 0.2, 0.75 + i * 0.1)); // sparkle
  },
};
