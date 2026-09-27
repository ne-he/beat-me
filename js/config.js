/* ============================================================
   BEAT NEMI: CONFIG
   ============================================================
   INI SATU-SATUNYA FILE YANG PERLU KAMU EDIT.
   Ganti nama, dialog, damage text, dll di sini.
   ============================================================ */

const CONFIG = {

  // ---------- IDENTITAS ----------
  NAMA_BOSS:  "Nemi",        // ini aku, yang dipukulin
  NAMA_PACAR: "ler",         // panggilan buat Kler

  TITLE: "BEAT NEMI",

  // ---------- FOTO MUKA ----------
  // Minimal taruh 1 file: assets/faces/nemi.png
  // Sisanya OPSIONAL: kalau nggak ada, game otomatis pakai
  // foto normal + efek decal (memar, air mata, bintang pusing).
  FACE_IMAGES: {
    normal: "assets/faces/nemi.png",
    kaget:  "assets/faces/nemi-kaget.png",   // opsional: muka kaget/aw
    nangis: "assets/faces/nemi-nangis.png",  // opsional: muka nangis
    ko:     "assets/faces/nemi-ko.png",      // opsional: muka KO
  },

  // ---------- GAMEPLAY TUNING ----------
  BOSS: {
    MAX_HP: 300,          // HP dasar (cadangan kalau LEVELS kosong)
    RADIUS_FRAC: 0.17,    // ukuran muka relatif layar
    WANDER_SPEED: 55,     // kecepatan jalan-jalan boss (px/detik)
    PANIC_MULT: 1.8,      // di bawah 50% HP boss makin lincah
    BOUNCE: 0.72,         // pantulan waktu nabrak dinding
    KNOCKBACK: 260,       // dorongan tiap kena pukul
  },

  ARENA: { TOP: 118, BOTTOM: 170, SIDE: 20 },  // batas arena (px)

  COMBO: { TIMEOUT: 2.2, DMG_PER: 5 },  // combo reset 2.2 dtk; tiap 5 combo damage +1
  CRIT:  { CHANCE: 0.12, MULT: 2.2, SLOWMO: 0.35, SLOWMO_DUR: 0.5 },
  ULT:   { MAX: 100, PER_HIT: 4, PER_KISS: 2, NAME: "🤗 PELUKAN MAUT" },
  WALL_SLAM: { MIN_SPEED: 750, DMG: 14 },  // lempar boss ke dinding = damage

  // ---------- LEVEL / RONDE ----------
  // Tiap ronde HP-nya makin banyak biar gak sekali-dua kali kelar.
  LEVELS: [
    { name: "pemanasan",        hp: 300 },
    { name: "nemi mulai kesel", hp: 480 },
    { name: "nemi sok jago",    hp: 700 },
    { name: "nemi drama",       hp: 950 },
    { name: "nemi mode akhir",  hp: 1300 },
  ],

  // ---------- SENJATA ----------
  WEAPONS: [
    { id: "tinju",  emoji: "👊", nama: "Tinju Rindu",
      desc: "Pukulan standar penuh kasih sayang",
      dmg: [8, 12],  sfx: "punch", shake: 0.22,
      words: ["DUAK!", "BAM!", "BUGH!", "DOR!"],
      particles: ["💥", "⭐", "💢"] },

    { id: "sandal", emoji: "🩴", nama: "Sandal Emak",
      desc: "Warisan turun-temurun, akurasi 100%",
      dmg: [12, 18], sfx: "slap", shake: 0.32,
      words: ["PLAK!", "TAMPOL!", "PLETAK!"],
      particles: ["🩴", "💥", "💫"] },

    { id: "teflon", emoji: "🍳", nama: "Teflon Anti Gombal",
      desc: "Bunyinya paling memuaskan",
      dmg: [16, 24], sfx: "bonk", shake: 0.45,
      words: ["BONK!", "TENGGG!", "DUAKK!"],
      particles: ["🍳", "💥", "⭐", "✨"] },

    { id: "telur",  emoji: "🥚", nama: "Telur Kejujuran",
      desc: "Pyar! Biar mukanya glowing",
      dmg: [10, 15], sfx: "splat", shake: 0.28,
      words: ["PYAR!", "SPLAT!", "CTAK!"],
      particles: ["🥚", "💛", "✨"] },

    { id: "cium",   emoji: "💋", nama: "Cium Jarak Jauh",
      desc: "Satu-satunya senjata yang nyembuhin ego dia",
      heal: 6,       sfx: "kiss", shake: 0.05,
      words: ["MWAH!", "UNCH!", "CUP!"],
      particles: ["💋", "💖", "💕"] },
  ],

  // ---------- TEKS DAMAGE CINTA ----------
  DAMAGE_LOVE: ["100 SAYANG", "250 GEMES", "500 RINDU", "999 KANGEN", "9999 CINTA"],

  // ---------- LABEL FASE (berdasarkan % HP) ----------
  PHASES: [
    { min: 76, label: "Sok Cool 😎" },
    { min: 51, label: "Mulai Panik 😮" },
    { min: 26, label: "Keringetan 😰" },
    { min: 11, label: "Nangis Tapi Ganteng 😭" },
    { min: 1,  label: "Mleyot 🥴" },
    { min: 0,  label: "K.O. 😵" },
  ],

  // ---------- DIALOG ----------
  // pas kena pukul (sering muncul, sengaja pendek)
  DIALOGS_HIT: [
    "aw",
    "ish",
    "woi",
    "aduh",
    "ah sakit",
    "gini doang?",
    "hei ler",
    "sakit tau",
    "eh eh",
    "pelan dong ler",
    "yah",
    "belum kapok nih",
  ],

  // pas HP nembus ambang tertentu di ronde ini
  DIALOGS_PHASE: {
    75: ["eh serius nih ler?", "oke oke aku mulai takut"],
    50: ["ler kok tega banget", "mulai sakit beneran nih"],
    25: ["ampun ler ampun", "aku nyerah deh kayaknya"],
    10: ["ler aku udah lemes", "pukulan kamu berasa banget"],
  },

  // pas kena senjata cium (malah nyembuhin)
  DIALOGS_KISS: [
    "nah gitu dong",
    "lagi dong ler",
    "jadi semangat lagi aku",
    "muah juga ler",
  ],

  // pas kamu diem lama
  DIALOGS_IDLE: [
    "udah capek ler?",
    "kangen ya makanya berhenti mukul aku",
    "sini peluk dulu",
    "kok diem sih ler",
  ],

  // pas nemi kelempar nabrak tembok
  DIALOGS_SLAM: ["gubrak", "aduh tembok", "wadaw"],

  // pas satu ronde kelar (nemi nyombong dikit)
  LEVEL_CLEAR: [
    "ronde depan aku lebih kuat loh ler",
    "belum selesai dong, ayo lagi",
    "boleh juga kamu ler, tapi belum menang",
    "oke sekarang aku beneran serius",
  ],

  // ---------- PAS NEMI AKHIRNYA KALAH ----------
  KO_QUOTES: [
    "oke oke aku kalah. tapi tetep paling sayang kamu kok ler",
    "kamu menang ler. hadiahnya aku, seutuhnya buat kamu",
    "dipukulin kamu aja rasanya kangen. cepet ketemu ya ler",
  ],

  ULT_QUOTE: "dipeluk kamu sampe kalah gini, aku rela banget ler 💛",
};
