# 👊 BEAT NEMI

Game "Beat the Boss" versi LDR, pacar kamu bisa mukul, nampol, ngelempar,
bahkan **nyium** muka kamu sampai KO. Dibuat penuh cinta (dan sedikit kekerasan kartun).

**Zero dependency. Zero build step.** Vanilla JS + Canvas. Dobel-klik `index.html` langsung jalan.

---

## 🎮 Fitur

| Fitur | Detail |
|---|---|
| 5 Senjata | 👊 Tinju Rindu · 🩴 Sandal Emak · 🍳 Teflon · 🥚 Telur · 💋 Cium (nyembuhin!) |
| Fisika muka | Drag & lempar, mantul di dinding, squash & stretch, wall-slam damage |
| Combo system | Combo x10 = "RAMPAGE OF LOVE!", damage naik tiap 5 combo |
| Critical hit | 12% chance, slow-motion + zoom + "KRITIS!!" |
| Boss phases | Sok Cool 😎 → Panik 😮 → Keringetan 😰 → Nangis 😭 → Mleyot 🥴 → KO 😵 |
| Ultimate | 🤗 PELUKAN MAUT: isi bar, langsung KO + hujan hati |
| Damage decals | Memar, bekas tamparan, air mata, bintang pusing, numpuk di foto |
| Dialog receh | Boss ngomong sendiri per fase + ngeledek kalau kamu diem |
| SFX | Semua suara disintesis Web Audio, nggak butuh file MP3 |
| Rekor | Waktu tercepat, combo tertinggi, total KO (localStorage) |
| Mobile-ready | Touch, responsive, safe-area |

**Kontrol:** Tap muka = pukul · Tahan+seret = lempar · `1-5` ganti senjata · `Spasi` pukul · `R` restart · `M` mute

---

## ✅ YANG PERLU KAMU LAKUKAN BIAR SELESAI (±30 menit)

1. **Taruh foto muka kamu** → `assets/faces/nemi.png`
   (baca `assets/faces/BACA-DULU.txt`; foto kaget/nangis/KO opsional tapi makin lucu)
2. **Edit `js/config.js`** → ganti `NAMA_PACAR: "Sayang"` jadi nama pacar kamu.
   Sekalian baca dialog-dialognya, ganti pakai inside joke kalian biar makin personal.
3. **Test lokal** → dobel-klik `index.html`, mainin sampai KO minimal sekali,
   cek di HP juga (buka lewat deploy atau Live Server).
4. **Deploy** (pilih salah satu, semua gratis):
   - **Vercel** (paling gampang): `vercel.com` → drag & drop folder ini → dapet link.
   - **Netlify Drop**: `app.netlify.com/drop` → drag & drop folder → dapet link.
   - **GitHub Pages**: push folder ke repo → Settings → Pages → deploy from branch.
5. **Kirim link-nya ke doi.** Selesai. SHIP. 🚀

## 📁 Struktur

```
beatme/
├── index.html          # entry, HUD, overlay, urutan script
├── css/style.css       # tema dark romantic arcade
├── js/
│   ├── config.js       # ⭐ SATU-SATUNYA file yang perlu kamu edit
│   ├── utils.js        # helper matematika/gambar
│   ├── audio.js        # sound effects (Web Audio synth)
│   ├── particles.js    # ledakan emoji + confetti hati
│   ├── popups.js       # teks damage + bubble dialog boss
│   ├── effects.js      # screen shake, flash, hitstop, slow-mo
│   ├── boss.js         # si muka: fisika, ekspresi, decal
│   ├── weapons.js      # senjata + kursor emoji
│   ├── ui.js           # HUD DOM (HP, combo, ult, toolbar)
│   └── game.js         # game loop + input + aturan main
└── assets/faces/       # foto muka kamu di sini
```

## 🔧 Tuning cepat (semua di `config.js`)

- Kelamaan menang? Turunin `BOSS.MAX_HP` (300 → 200).
- Kurang brutal? Naikin `dmg` senjata atau `CRIT.CHANCE`.
- Boss kecepetan lari? Turunin `BOSS.WANDER_SPEED`.

## 💡 Ide polish nanti (JANGAN sekarang: ship dulu!)

- Foto ekspresi asli (kaget/nangis/KO): efek paling besar per menit usaha
- Ganti dialog jadi inside joke kalian
- Musik background lo-fi
- Mode "balas dendam": muka pacar kamu jadi boss ke-2
