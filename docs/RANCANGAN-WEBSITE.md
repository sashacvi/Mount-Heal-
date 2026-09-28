# Rancangan Website Company Profile Klinik

**Klinik:** Klinik Mustika Sekar Taji (Kintamani, Bangli, Bali). Prototipe awal memakai nama dummy "Lumina Medika".
**Status:** Rancangan v1 → **diimplementasikan di folder `web/`** (Next.js + Payload CMS) dengan data klinik asli (28 September 2026).
**Tanggal:** 27 September 2026

| Berkas | Isi |
|---|---|
| `prototype/index.html` | Prototipe halaman publik (buka langsung di browser). |
| `prototype/admin.html` | Prototipe panel admin/CMS. Konten yang diterbitkan di sini muncul di halaman publik (disimpan di `localStorage` browser yang sama, khusus untuk demo). |
| `docs/RANCANGAN-WEBSITE.md` | Dokumen ini. |

---

## 1. Ringkasan riset

| # | Temuan | Dampak ke rancangan |
|---|---|---|
| 1 | Situs kesehatan 2026 memprioritaskan UX yang berpusat pada pasien, aksesibilitas WCAG 2.1/2.2 AA, dan waktu muat < 3 detik. | Target Lighthouse ≥ 90, semua teks lolos kontras AA di kedua mode, gambar WebP/AVIF + lazy-load. |
| 2 | Profil dokter termasuk halaman yang paling sering dikunjungi: foto, nama + gelar, spesialisasi, riwayat pendidikan, bio singkat. | Seksi **Dokter & Jadwal** dengan filter hari, tombol "Daftar" langsung di kartu dokter. |
| 3 | Halaman layanan harus menjelaskan: apa layanannya, untuk siapa, apa yang disiapkan pasien, cara mendaftar. | Kartu layanan berisi deskripsi, label (BPJS, puasa, dll.), dan tautan ke dokter terkait. |
| 4 | Booking online efektif bila menampilkan ketersediaan real-time, bisa pilih dokter/layanan, dan mengirim konfirmasi + pengingat. | Formulir **Daftar Online** → nomor antrean → konfirmasi via WhatsApp. Kartu **Status klinik hari ini** di hero (buka/tutup, antrean berjalan, dokter praktik). |
| 5 | Konten perlu terstruktur untuk mesin pencari **dan** asisten AI: heading jelas, paragraf yang langsung menjawab, FAQ. | Seksi FAQ, schema.org `MedicalClinic`, `Physician`, `FAQPage`, `Article`. |
| 6 | Klinik di Indonesia umumnya menampilkan: pendaftaran online, jadwal dokter, info BPJS, dan antrean terintegrasi (bridging BPJS PCare / SATUSEHAT di sisi sistem klinik). | Menu **Info Pasien** (alur pendaftaran, BPJS & asuransi, tarif, hak & kewajiban pasien). Integrasi antrean dicatat sebagai fase 2. |
| 7 | **Permenkes No. 1787/Menkes/Per/XII/2010** tentang Iklan dan Publikasi Pelayanan Kesehatan: iklan harus berbasis bukti, informatif, mencantumkan nama & alamat fasilitas; dilarang memberi testimoni dalam iklan/publikasi di media massa, mencantumkan diskon/imbalan, membandingkan mutu dengan fasilitas lain, dan tenaga kesehatan dilarang menjadi model iklan. | Fitur **testimoni** dirancang sebagai "cerita pengalaman layanan" yang dimoderasi, dengan persetujuan tertulis pasien, tanpa klaim kesembuhan. **Perlu verifikasi hukum sebelum rilis** (lihat §8). |
| 8 | **UU No. 27 Tahun 2022 (PDP):** data kesehatan termasuk data pribadi bersifat spesifik; butuh persetujuan eksplisit dan perlindungan lebih ketat. | Checkbox persetujuan pada formulir, kebijakan privasi, HTTPS, minimalisasi data di formulir web (tanpa NIK wajib). |
| 9 | WCAG: teks normal ≥ 4.5:1, teks besar ≥ 3:1, komponen UI ≥ 3:1. Mode gelap **tidak** otomatis memenuhi WCAG; kontras harus dihitung ulang per mode. | Token warna terpisah untuk light/dark (§3). |
| 10 | Peta: Google **Maps Embed API** gratis tanpa batas (butuh API key + akun billing). Leaflet + OpenStreetMap gratis dan bisa dikustomisasi; Maps JavaScript API berbayar di atas kuota gratis. | Produksi: Google Maps Embed (pasien terbiasa, ada rute & ulasan) **atau** Leaflet + tile provider berlisensi. Prototipe memakai Leaflet + fallback peta ilustrasi. |
| 11 | CMS open-source 2026: Payload (TypeScript, menyatu dengan Next.js), Strapi (editor visual, ekosistem terbesar), Directus (paling fleksibel di atas database). | Rekomendasi stack di §7. |

---

## 2. Persona & arah visual

**Persona merek:** *ramah, jelas, tepat waktu.* Klinik keluarga yang menjelaskan, bukan menjual.

| Aspek | Keputusan |
|---|---|
| Nada tulisan | Bahasa Indonesia baku yang santai, kalimat pendek, kata kerja aktif. Hindari klaim superlatif ("terbaik", "pasti sembuh"). |
| Motif visual | **Tanda plus medis** (pola latar hero, logo, pin peta) dan **garis EKG** (animasi satu kali di hero, ilustrasi). |
| Tipografi | **Plus Jakarta Sans** (dirancang Tokotype, Jakarta) untuk judul & isi: bobot 800 untuk judul, 400–600 untuk isi. **DM Mono** untuk angka yang dibaca cepat: nomor antrean, jam praktik, tanggal. |
| Bentuk | Radius 14 px (kartu) / 22 px (panel besar), tombol pil. Kartu hanya untuk objek yang bisa diklik atau berdiri sendiri. |
| Gerak | Satu momen utama (garis EKG tergambar saat halaman dibuka), mikro-interaksi hover, strip logo mitra bergerak. Semua dimatikan bila `prefers-reduced-motion`. |
| Dinamis | Kartu status real-time (buka/tutup dihitung dari jam lokal), filter hari dokter, tab konten, lightbox galeri, carousel testimoni, bilah pengumuman berganti otomatis. |

---

## 3. Palet warna & peran

### 3.1 Peran setiap warna wajib

| Warna | Nama token | Peran | Aturan |
|---|---|---|---|
| `#722975` | `--plum` / `--brand` | Warna merek utama: tombol utama, latar hero, heading aksen. | Teks putih di atasnya: **9.17:1** ✅ |
| `#EC268F` | `--magenta` / `--accent` | Aksen emosional: EKG, ikon, ilustrasi, badge. | Hanya untuk teks **besar**/dekorasi di latar terang (4.01:1). Teks kecil pakai `--accent-text` `#C21A74` (5.69:1). |
| `#082DF7` | `--royal` / `--link` | Tautan, info interaktif. | 7.70:1 di putih ✅. Di mode gelap diganti `#8FA3FF`. |
| `#0B7CC2` | `--ocean` / `--info-decor` | Warna klinis sekunder: ikon layanan, label "Berita", fokus ring. | 4.49:1 di putih (kurang 0.01 dari AA) → teks kecil pakai `#0A6AA6` (5.79:1). |
| `#FFCC29` | `--amber` / `--warn-bg` | Latar **pengumuman**, bintang rating, eyebrow di hero. | Tidak boleh jadi warna teks di latar terang (1.51:1). Teks gelap di atasnya: 11.66:1 ✅ |
| `#FFF212` | `--lemon` / `--hl` | Penanda (highlight) kata kunci, tombol CTA di atas plum, titik logo. | Hanya latar/sorotan. Teks gelap di atasnya: 15.04:1 ✅ |

### 3.2 Hasil uji kontras (dihitung dengan rumus luminans relatif WCAG 2.x)

| Warna | vs `#FFFFFF` | vs latar terang `#FBF8FC` | vs latar gelap `#120A1A` | vs permukaan gelap `#1C1226` |
|---|---|---|---|---|
| `#722975` | 9.17 | 8.71 | 2.11 ❌ | 1.97 ❌ |
| `#EC268F` | 4.01 ⚠️ | 3.80 ⚠️ | 4.83 | 4.50 |
| `#082DF7` | 7.70 | 7.31 | 2.52 ❌ | 2.34 ❌ |
| `#0B7CC2` | 4.49 ⚠️ | 4.26 ⚠️ | 4.31 ⚠️ | 4.02 ⚠️ |
| `#FFCC29` | 1.51 ❌ | 1.43 ❌ | 12.84 | 11.96 |
| `#FFF212` | 1.17 ❌ | 1.11 ❌ | 16.57 | 15.43 |

⚠️ = hanya untuk teks besar (≥ 24 px, atau ≥ 18.66 px tebal) / elemen UI (≥ 3:1). ❌ = tidak untuk teks.

### 3.3 Token mode terang ↔ gelap

| Token | Terang | Gelap | Kontras gelap (vs `#1C1226`) |
|---|---|---|---|
| `--bg` | `#FBF8FC` | `#120A1A` | — |
| `--surface` | `#FFFFFF` | `#1C1226` | — |
| `--ink` (teks) | `#1F1330` | `#F3EDF6` | 15+ |
| `--muted` | `#5E5169` | `#B9AEC2` | 8+ |
| `--brand` | `#722975` | `#D59AD8` (tint plum) | 8.11 |
| `--accent-text` | `#C21A74` | `#FF6FB5` (tint magenta) | 7.04 |
| `--link` | `#082DF7` | `#8FA3FF` (tint royal) | 7.60 |
| `--info` | `#0A6AA6` | `#5CC1FF` (tint ocean) | 9.04 |
| `--warn-bg` / `--hl` | `#FFCC29` / `#FFF212` | tetap | — |

Mode tema: **Sistem** (ikut OS, default) → **Terang** → **Gelap**. Pilihan disimpan di browser. Peta ikut berganti ke basemap gelap.

---

## 4. Arsitektur informasi (sitemap)

```
Beranda
├── Tentang
│   ├── Profil Klinik (sejarah, visi & misi, nilai)
│   ├── Legalitas & Akreditasi (izin operasional, sertifikat akreditasi)
│   ├── Fasilitas
│   └── Mitra & Asuransi
├── Layanan
│   ├── Poli Umum · Poli Gigi · Kesehatan Anak · KIA & KB
│   ├── Laboratorium · Farmasi · Vaksinasi Dewasa · Medical Check-Up
│   └── (halaman detail per layanan: untuk siapa, persiapan, tarif estimasi, dokter)
├── Dokter & Jadwal
│   └── Profil dokter (foto, gelar, STR/SIP, pendidikan, jadwal)
├── Info Pasien
│   ├── Alur Pendaftaran (online & datang langsung)
│   ├── BPJS & Asuransi
│   ├── Tarif Layanan
│   ├── Hak & Kewajiban Pasien
│   └── FAQ
├── Kabar Klinik
│   ├── Berita
│   ├── Artikel Kesehatan
│   └── Pengumuman
├── Galeri
│   ├── Foto (album: Fasilitas, Tim, Kegiatan)
│   └── Testimoni
├── Kontak & Lokasi (peta, jam, telepon, WhatsApp, formulir pesan)
├── Daftar Online (CTA global)
└── Kebijakan Privasi · Syarat Penggunaan
```

**Navigasi**
- Bilah pengumuman (kuning) → bilah utilitas (jam hari ini, telepon, alamat, **darurat 119**) → header lengket (logo, menu dengan dropdown, tombol tema, **Daftar Online**).
- Mobile (< 1240 px): menu hamburger dengan akordeon; tombol WhatsApp melayang.
- Footer: alamat, No. izin operasional, tautan layanan & info pasien, media sosial, disclaimer medis, kebijakan privasi.

---

## 5. Susunan halaman Beranda

| Urutan | Seksi | Konten & interaksi |
|---|---|---|
| 0 | Bilah pengumuman | Pengumuman yang **disematkan** admin, berganti tiap 7 detik, tombol ←/→, otomatis turun setelah tanggal kedaluwarsa. |
| 1 | Hero | Judul + sub, CTA **Daftar Online** & **Lihat Jadwal Dokter**, kartu **Status klinik hari ini** (buka/tutup, antrean poli, dokter praktik hari ini). |
| 2 | Aksi cepat | Daftar Online · Cari Dokter · Layanan · BPJS & Asuransi · Lokasi. |
| 3 | Layanan | 8 kartu layanan; klik "Lihat dokter & jadwal" memfilter dokter sesuai layanan. |
| 4 | Dokter & Jadwal | Chip hari (default: hari ini), kartu dokter dengan jam praktik & tombol Daftar. |
| 5 | Tentang | Ilustrasi, profil singkat, nilai, 4 angka kunci (tahun, jumlah nakes, akreditasi, mitra). |
| 6 | Kabar Klinik | Tab Semua/Berita/Artikel/Pengumuman, 1 kartu utama + 4 kartu, pembaca artikel (modal) dengan penulis, **peninjau medis**, tanggal, waktu baca. |
| 7 | Galeri Foto | Filter album, grid mosaik, lightbox (keyboard ←/→/Esc). |
| 8 | Testimoni | Skor rata-rata + distribusi bintang, carousel kartu, badge "Pasien terverifikasi", disclaimer. |
| 9 | Mitra | Strip logo bergerak (grayscale → berwarna saat hover, berhenti saat hover/fokus). |
| 10 | Lokasi & Kontak | Peta mini interaktif + pin, alamat, tombol **Petunjuk arah** & **Salin alamat**, tabel jam (hari ini disorot), parkir, transportasi, aksesibilitas. |
| 11 | FAQ | Akordeon (BPJS, alur daftar, tarif, hasil lab, privasi data, gawat darurat). |
| 12 | CTA + Footer | Ajakan daftar online. |

---

## 6. Spesifikasi fitur yang diminta

### 6.1 Posting berita, artikel & pengumuman (admin)
**Model konten `Post`**

| Field | Tipe | Aturan |
|---|---|---|
| `type` | enum: berita / artikel / pengumuman | wajib |
| `title` | teks ≤ 120 | wajib |
| `slug` | otomatis dari judul | unik |
| `excerpt` | teks ≤ 200 | wajib saat terbit; dipakai sebagai meta description |
| `body` | rich text (heading, daftar, tautan, gambar + alt) | — |
| `cover` | gambar 1600×900, ≤ 500 KB, `alt` wajib | — |
| `author` | relasi ke pengguna | wajib |
| `medicalReviewer` | relasi ke dokter | **wajib untuk artikel** |
| `publishedAt` | tanggal-waktu | masa depan = terjadwal |
| `status` | draf / menunggu tinjauan / terjadwal / terbit / arsip | alur kerja |
| `pinned` + `expiresAt` | boolean + tanggal | khusus pengumuman → bilah atas |
| `tags`, `seoTitle`, `seoDescription` | — | opsional |

**Alur kerja & peran:** Editor menulis → (artikel) Peninjau Medis menyetujui → Admin/Editor menerbitkan atau menjadwalkan. Riwayat revisi disimpan.
**Di prototipe:** daftar konten + filter + pencarian, editor (jenis, judul, ringkasan, isi dengan toolbar format, tanggal, penulis, peninjau medis, sematkan + kedaluwarsa, gaya sampul), pratinjau hasil Google, validasi, hapus dengan konfirmasi di halaman.

### 6.2 Peta mini lokasi
- Peta interaktif, pin bermerek, popup nama & alamat, zoom, scroll-wheel dimatikan agar halaman tidak "tersangkut" saat digulir.
- Tombol **Petunjuk arah** membuka Google Maps dengan tujuan koordinat klinik.
- Mode gelap mengganti basemap ke versi gelap.
- Fallback peta ilustrasi (SVG) bila tile gagal dimuat.

### 6.3 Highlight logo mitra
- Model `Partner`: nama, kategori (Asuransi/Korporat/Lab/RS rujukan/Farmasi/Pendidikan), logo SVG/PNG transparan, URL, urutan, status tampil.
- Tampilan: strip bergerak tak berujung; berhenti saat hover/fokus; tampil statis bila `prefers-reduced-motion`.
- Admin: urutkan ↑/↓, tampil/sembunyikan, tambah mitra.

### 6.4 Galeri foto
- Model `Album` → `Photo` (gambar, keterangan, alt, tanggal, urutan).
- Grid mosaik responsif, filter album, lightbox dengan navigasi keyboard, penghitung "3 / 10".
- Unggah: kompresi otomatis ke WebP/AVIF, ukuran responsif (`srcset`), lazy-load.
- Foto pasien hanya dengan persetujuan tertulis; wajah anak disamarkan.

### 6.5 Galeri testimoni
- Model `Testimonial`: nama tampil (inisial), layanan, rating 1–5, kutipan, tanggal, **bukti persetujuan publikasi**, status (menunggu/tampil/ditolak), opsional video.
- Moderasi di admin: tombol "Setujui" **nonaktif** bila belum ada persetujuan; peringatan otomatis bila teks memuat klaim kesembuhan atau perbandingan dengan fasilitas lain.
- Publik: skor rata-rata, distribusi bintang, carousel, badge "Pasien terverifikasi", disclaimer.

### 6.6 Menu standar klinik
Tercakup di sitemap §4: Profil, Legalitas & Akreditasi, Layanan, Dokter & Jadwal, Pendaftaran Online, BPJS & Asuransi, Tarif, Hak & Kewajiban Pasien, FAQ, Kabar Klinik, Galeri, Testimoni, Mitra, Kontak & Lokasi, Kebijakan Privasi, info darurat 119.

---

## 7. Rekomendasi teknis

| Lapisan | Rekomendasi | Alasan |
|---|---|---|
| Front-end | **Next.js** (App Router, SSG/ISR) + Tailwind CSS / CSS variables dari token §3 | SEO baik, halaman statis cepat, revalidasi otomatis saat admin menerbitkan. |
| CMS | **Payload CMS** (utama) atau **Strapi** (bila editor non-teknis butuh pembuat tipe konten visual) | Payload menyatu di repo Next.js yang sama; Strapi punya panel yang ramah editor. Keduanya open-source dan self-host. |
| Database | PostgreSQL | Didukung Payload/Strapi. |
| Media | Penyimpanan S3-compatible + CDN, konversi WebP/AVIF | Galeri & sampul cepat dimuat. |
| Peta | Google Maps Embed API (gratis, butuh API key) atau Leaflet + tile provider berlisensi | Lihat temuan #10. |
| Formulir & notifikasi | Endpoint server + WhatsApp Business API / email | Konfirmasi antrean & pengingat. |
| Integrasi fase 2 | Antrean dari SIMRS/RME klinik (yang sudah bridging BPJS PCare & SATUSEHAT) | Nomor antrean & jadwal tidak diisi dua kali. |
| i18n | Bahasa Indonesia (utama), Inggris (opsional fase 2) | — |
| SEO | schema.org `MedicalClinic`, `Physician`, `FAQPage`, `Article`; sitemap.xml; Open Graph | Tampil baik di Google & asisten AI. |
| Kualitas | Lighthouse ≥ 90 (Performance, Accessibility, SEO), WCAG 2.2 AA, HTTPS/HSTS, backup harian, 2FA untuk admin | — |

---

## 8. Kepatuhan & catatan penting

1. **Testimoni & iklan kesehatan.** Sumber sekunder (Kemenkes, Detik, Antara, rangkuman Hukumonline) menyebut Permenkes 1787/2010 melarang testimoni dalam iklan/publikasi di media massa, diskon/imbalan, perbandingan mutu, serta nakes menjadi model iklan. Teks asli peraturan **tidak dapat saya akses langsung** dari lingkungan ini (situs JDIH diblokir jaringan), dan UU No. 17 Tahun 2023 tentang Kesehatan beserta aturan turunannya bisa telah mengubah atau menambah ketentuan. **Rekomendasi:** minta konsultan hukum/dinas kesehatan setempat memverifikasi apakah galeri testimoni di situs resmi klinik diperbolehkan, dan dalam format apa. Rancangan sudah menyiapkan mitigasi (persetujuan tertulis, fokus pengalaman layanan, tanpa klaim hasil, moderasi, disclaimer) dan fitur ini bisa dimatikan dari admin.
2. **Foto dokter.** Profil dokter bersifat informatif (nama, gelar, STR/SIP, jadwal), bukan materi promosi dengan dokter sebagai model.
3. **Data pribadi (UU PDP).** Persetujuan eksplisit di setiap formulir, kebijakan privasi, minimalisasi data (NIK/No. BPJS tidak wajib di formulir web), enkripsi transport, akses admin dibatasi per peran, log akses.
4. **Disclaimer medis** di footer dan di setiap artikel.
5. **Informasi wajib** di footer: nama & alamat klinik, No. izin operasional, status akreditasi.

---

## 9. Data yang dibutuhkan dari klinik

- [ ] Nama resmi, logo (SVG), jenis klinik (pratama/utama), No. izin operasional, status & sertifikat akreditasi
- [ ] Alamat lengkap + koordinat Google Maps, jam operasional (termasuk libur nasional), telepon, WhatsApp, email, media sosial
- [ ] Daftar layanan + tarif estimasi + persiapan pasien
- [ ] Daftar dokter & nakes: nama, gelar, spesialisasi, STR/SIP, foto, pendidikan, jadwal
- [ ] Status kerja sama BPJS Kesehatan & daftar asuransi/mitra + logo
- [ ] Foto fasilitas, tim, kegiatan (dengan izin)
- [ ] Testimoni + formulir persetujuan publikasi
- [ ] Profil, sejarah, visi & misi
- [ ] Siapa saja pengguna admin (nama, peran)

---

## 10. Sumber riset

- SpreadSimple — Healthcare Website Design: Best Practices 2026 — https://spreadsimple.com/blog/healthcare-website-design-best-practices-examples-and-tips-for-2026/
- Orbix Studio — Healthcare Website Design Guide 2026 — https://www.orbix.studio/blogs/healthcare-website-design-guide
- Orbix Studio — Healthcare Web Design Trends 2026 — https://www.orbix.studio/blogs/healthcare-web-design-trends
- Webstacks — Healthcare & Medical Website Design Examples 2026 — https://www.webstacks.com/blog/healthcare-website-design
- Fuselab Creative — Healthcare UX Design Guide 2026 — https://fuselabcreative.com/healthcare-ux-design-best-practices-guide/
- Kemenkes — Rumah Sakit Boleh Beriklan — https://sehatnegeriku.kemkes.go.id/baca/rilis-media/20110610/031158/rumah-sakit-boleh-beriklan/
- Kemenkes — Kemenkes, KPI, dan stakeholder awasi iklan pelayanan kesehatan — https://kemkes.go.id/eng/%20kemenkes-kpi-dan-para-stakeholder-serius-awasi-iklan-pelayanan-kesehatan
- Antara — Tenaga Kesehatan Dilarang Jadi Model Iklan Obat — https://www.antaranews.com/berita/257410/tenaga-kesehatan-dilarang-jadi-model-iklan-obat
- Detik Health — Dokter Dilarang Mengiklan dan Menjadi Model Iklan — https://health.detik.com/berita-detikhealth/d-1634178/dokter-dilarang-mengiklan-dan-menjadi-model-iklan
- Hukumonline — Ketentuan Iklan Pelayanan Kesehatan — https://www.hukumonline.com/klinik/a/ketentuan-iklan-pelayanan-kesehatan-alternatif-di-televisi-lt5ad4049e8a0df/
- Teks Permenkes 1787/2010 (PDF, BPOM) — https://sireka.pom.go.id/requirement/PMK-1787-Iklan-dan-Publikasi-Pelayanan-Kesehatan.pdf
- UU No. 27 Tahun 2022 (PDP) — https://peraturan.go.id/id/uu-no-27-tahun-2022 · https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022
- BOIA — Dark mode doesn't satisfy WCAG contrast — https://www.boia.org/blog/offering-a-dark-mode-doesnt-satisfy-wcag-color-contrast-requirements
- Make Things Accessible — Contrast requirements WCAG 2.2 AA — https://www.makethingsaccessible.com/guides/contrast-requirements-for-wcag-2-2-level-aa/
- ColorContrast.org — Dark Mode Contrast Guide 2026 — https://www.colorcontrast.org/blog/dark-mode-contrast-accessibility-guide/
- Google — Maps Embed API Usage and Billing — https://developers.google.com/maps/documentation/embed/usage-and-billing
- freeCodeCamp — OpenStreetMap sebagai alternatif Google Maps — https://www.freecodecamp.org/news/how-to-use-openstreetmap-free-alternative-to-google-maps/
- Cost Saver — Leaflet vs Google Maps 2026 — https://www.cost-saver.co.uk/blog/leaflet-vs-google-maps-mapping-tool-local-service-providers
- ElmapiCMS — Payload vs Strapi vs Directus 2026 — https://elmapicms.com/blog/payload-strapi-directus-which-one-2026
- FocusReactive — Open Source Headless CMS 2026 — https://focusreactive.com/blog/compare-open-source-cms-in-2026/
- BPJS Kesehatan — Pelayanan Mobile JKN — https://bpjs-kesehatan.go.id/user-manual-mobile-jkn/pelayanan%20jkn.html
- eKlinik — Sistem Pendaftaran Pasien Online Klinik Pratama — https://eklinik.co/sistem-pendaftaran-pasien-online/
- KlinikPintar — Aplikasi Klinik Pratama BPJS & SATUSEHAT — https://klinikpintar.id/aplikasiklinik/faskes/klinik-pratama
