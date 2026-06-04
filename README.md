# PantauPadi

Dashboard pemantauan dan prediksi kerawanan panen padi tingkat kabupaten/kota di Jawa Timur.

## Menjalankan

```bash
npm install
npm run dev
```

Aplikasi berjalan di `http://localhost:5173`.

## Build

```bash
npm run build
```

Hasil build ada di folder `dist/`.

## Sumber Data

Data berada di `public/data/` (format CSV) hasil dari pipeline pengolahan data iklim
dan produksi padi. Untuk memperbarui data, jalankan `update-data.ps1`.

## Struktur

- `src/pages` — halaman: Dashboard, PantauMap, PantauTrend, PantauRamalan, PantauFaktor, PantauRawan, PantauAksi
- `src/components` — Sidebar, Layout, RiskMap
- `src/hooks/useData` — pemuatan data CSV
- `src/data/coordinates` — koordinat wilayah untuk peta
