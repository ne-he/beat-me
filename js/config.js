/* ============================================================
   BEAT NEMI — CONFIG
   ============================================================
   INI SATU-SATUNYA FILE YANG PERLU KAMU EDIT.
   Ganti nama, dialog, damage text, dll di sini.
   ============================================================ */

const CONFIG = {

  // ---------- IDENTITAS (WAJIB GANTI) ----------
  NAMA_BOSS:  "Nemi",        // nama kamu (si boss yang dipukulin)
  NAMA_PACAR: "Sayang",      // TODO: ganti nama pacar kamu

  TITLE: "BEAT NEMI",

  // ---------- FOTO MUKA ----------
  // Minimal taruh 1 file: assets/faces/nemi.png
  // Sisanya OPSIONAL — kalau nggak ada, game otomatis pakai
  // foto normal + efek decal (memar, air mata, bintang pusing).
  FACE_IMAGES: {
    normal: "assets/faces/nemi.png",
    kaget:  "assets/faces/nemi-kaget.png",   // opsional: muka kaget/aw
    nangis: "assets/faces/nemi-nangis.png",  // opsional: muka nangis
    ko:     "assets/faces/nemi-ko.png",      // opsional: muka KO
  },

  // ---------- GAMEPLAY TUNING ----------
  BOSS: {
    MAX_HP: 300,          // total "Ketahanan Ego"
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
  DIALOGS_HIT: [
    "Aw sayanggg 😭",
    "Beb sakit tauuu!",
    "Minta ampunnn 🙏",
    "Masih dicinta gak sih? 🥺",
    "Kamu kejam banget sih 💔",
    "Pelan-pelan donggg",
    "I love you... tapi kok dipukul 😢",
    "Jangan mukul muka ganteng ini!",
    "Kangen kamu malah dipukul 😭",
  ],

  DIALOGS_PHASE: {
    75: ["Eh?! Seriusan nih?! 😮", "Oke oke aku mulai takut..."],
    50: ["Mode serius: ON 😎💦", "Ego-ku mulai retak beb..."],
    25: ["HUWEEE 😭 tapi aku tetep ganteng kan?", "Ampun beb ampuuun 😭"],
    10: ["Aku... mleyottt 🥴", "Dunia berputar... kamu tetap satu 🥴💫"],
  },

  DIALOGS_KISS: [
    "Nah gitu dong 😚",
    "Lagi dong lagiii 🥰",
    "Ego-ku pulih seketika 💖",
    "Ciuman jarak jauh diterima ✅",
  ],

  DIALOGS_IDLE: [
    "Udah nyerah? 😏",
    "Kangen ya makanya berhenti mukul? 😘",
    "Capek? Sini peluk dulu 🤗",
    "Kok diem? Aku kan gemesin 😎",
  ],

  DIALOGS_SLAM: ["GUBRAK!", "ADUH TEMBOKK!", "WADAW!"],

  // ---------- QUOTE PAS KO ----------
  KO_QUOTES: [
    "Aku menyerah... tapi aku tetep sayang kamu 💕",
    "Aku kalah... tapi hatiku tetep milikmu.",
    "Pukulan kamu lebih manis dari ciuman orang lain.",
    "Damage-nya 9999, tapi sayangku unlimited.",
    "Boss terkuat yang pernah aku lawan... adalah rindu kamu.",
  ],

  ULT_QUOTE: "Di-Pelukan-Maut sampai KO... kekalahan paling bahagia sedunia 🤗💖",
};
