/* ============================================================
   BEAT NEMI: UTILS
   Fungsi bantu matematika & gambar. Nggak perlu diedit.
   ============================================================ */

const TAU = Math.PI * 2;

function rand(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeOutBack(t) {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

// Label fase berdasarkan persen HP
function getPhaseLabel(pct) {
  for (const p of CONFIG.PHASES) if (pct >= p.min) return p.label;
  return CONFIG.PHASES[CONFIG.PHASES.length - 1].label;
}

// Path rounded-rect manual (biar aman di semua browser)
function roundRectPath(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ---------- EMOJI SPRITE CACHE ----------
   ctx.fillText(emoji) itu MAHAL: tiap frame emoji di-rasterize ulang
   (glyph warna-warni). Solusi: render tiap emoji ke canvas kecil SEKALI,
   simpan, lalu drawImage bitmap-nya, jauh lebih murah, bikin game mulus. */
const _emojiCache = new Map();
const EMOJI_BASE = 80;   // resolusi render dasar (px)

function emojiSprite(emoji) {
  let spr = _emojiCache.get(emoji);
  if (spr) return spr;
  const pad = Math.ceil(EMOJI_BASE * 0.22);
  const size = EMOJI_BASE + pad * 2;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const cx = c.getContext("2d");
  cx.font = `${EMOJI_BASE}px sans-serif`;
  cx.textAlign = "center";
  cx.textBaseline = "middle";
  cx.fillText(emoji, size / 2, size / 2);
  spr = { canvas: c, dim: size };
  _emojiCache.set(emoji, spr);
  return spr;
}

// Gambar emoji ter-pusat di (x, y) dengan tinggi target `size` px.
// Hormatin transform & globalAlpha yang lagi aktif. Ganti fillText(emoji).
function drawEmoji(ctx, emoji, x, y, size) {
  const spr = emojiSprite(emoji);
  const d = spr.dim * (size / EMOJI_BASE);
  ctx.drawImage(spr.canvas, x - d / 2, y - d / 2, d, d);
}

// Blob radial lembut (buat memar & bekas tampol), di-cache biar gak bikin
// gradient baru tiap frame (dulu bisa 14 gradient/frame = berat di HP).
// Warna dikasih string "r,g,b"; pusat opaque, pinggir transparan.
const _blobCache = new Map();
function softBlob(rgb) {
  let c = _blobCache.get(rgb);
  if (c) return c;
  const S = 72;
  c = document.createElement("canvas");
  c.width = c.height = S;
  const cx = c.getContext("2d");
  const g = cx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  cx.fillStyle = g;
  cx.fillRect(0, 0, S, S);
  _blobCache.set(rgb, c);
  return c;
}

// Pecah teks jadi beberapa baris sesuai lebar maksimum
function wrapText(ctx, text, maxW) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Format detik → "1m 23.4s"
function formatTime(sec) {
  if (sec < 60) return sec.toFixed(1) + " dtk";
  const m = Math.floor(sec / 60);
  return m + "m " + (sec - m * 60).toFixed(0) + "s";
}
