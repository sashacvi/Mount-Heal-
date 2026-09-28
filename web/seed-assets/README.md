# seed-assets

Folder untuk foto personel dan galeri yang diimpor dengan `npm run import:photos`.

- Foto (`*.jpg`, `*.png`, `*.webp`) dan `manifest.json` **tidak masuk git** agar foto pribadi staf tidak tersimpan di repositori.
- Salin `manifest.example.json` menjadi `manifest.json`, isi nama berkas, nama staf (harus sama persis dengan data di admin), dan titik fokus wajah (`focalX`/`focalY` dalam persen).
- `zoom` mengatur perbesaran foto di kartu tim (1 = utuh; 3–3,5 untuk foto seluruh badan). Rumus kasar: 30 ÷ (lebar wajah dalam % lebar foto).
- Metadata EXIF (termasuk lokasi GPS) otomatis dibuang saat foto diunggah.
