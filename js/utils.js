/* ============================================================
   BEAT NEMI — UTILS
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
