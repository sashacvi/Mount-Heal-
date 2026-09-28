# Website Klinik Mustika Sekar Taji

Website company profile + panel admin (CMS) untuk Klinik Mustika Sekar Taji, Kintamani, Bangli, Bali.

- **Front-end:** Next.js 16 (App Router), CSS murni dengan token warna dari logo, mode Terang / Gelap / Sistem.
- **CMS:** Payload CMS 3 di aplikasi yang sama (`/admin`), bahasa Indonesia.
- **Database:** SQLite (libSQL): satu file `data/klinik.db`, atau Turso (`libsql://…`) untuk hosting serverless.
- **Unggahan foto:** folder `media/`, otomatis dikonversi ke WebP dalam beberapa ukuran.

## Menjalankan di komputer lokal

Butuh Node.js 20.9 atau lebih baru.

```bash
cd web
cp .env.example .env          # isi PAYLOAD_SECRET (openssl rand -hex 32)
npm install
npm run seed                  # isi data klinik: layanan, dokter, jadwal, mitra, FAQ
npm run dev                   # http://localhost:3000
```

Buka `http://localhost:3000/admin`. Pengguna pertama yang mendaftar otomatis menjadi **Admin**.

## Isi panel admin

| Menu | Fungsi |
|---|---|
| **Konten → Kabar Klinik** | Tulis berita, artikel kesehatan, pengumuman. Bisa draf, jadwalkan terbit, riwayat versi. Artikel wajib punya peninjau medis sebelum terbit. Pengumuman bisa disematkan di bilah kuning atas dengan tanggal kedaluwarsa. |
| **Konten → Galeri Foto** | Unggah foto per album (Fasilitas, Tim, Kegiatan). Bagian galeri muncul di beranda setelah ada foto. |
| **Konten → Testimoni** | Dua format: **screenshot ulasan Google** (unggah gambar) atau **teks**. Testimoni langsung dari pasien hanya bisa ditampilkan bila ada persetujuan tertulis. |
| **Konten → Mitra** | Nama, kategori, logo, urutan. Tanpa logo, tampil inisial nama. |
| **Konten → Tanya Jawab (FAQ)** | Pertanyaan dan jawaban di bagian Info Pasien. |
| **Klinik → Dokter & Tenaga Kesehatan** | Nama + gelar, foto, jadwal mingguan. Jadwal ini dipakai di bagian Dokter & Jadwal, kartu "Dokter praktik hari ini", dan formulir pendaftaran. |
| **Klinik → Layanan / Poli** | Nama, deskripsi, ikon, label, urutan. |
| **Pengaturan → Pengaturan Situs** | Identitas, alamat, koordinat peta, WhatsApp, jam operasional, jumlah tim, rating Google. Teks di antara `*bintang*` pada judul utama diberi sorotan kuning. |
| **Pengaturan → Pengguna** | Peran: Admin, Editor, Peninjau medis. |

## Fitur situs publik

- Bilah pengumuman (dari pengumuman yang disematkan), status buka/tutup realtime berdasarkan **WITA**, dokter praktik hari ini.
- Jadwal dokter per hari, tim bidan & farmasi.
- Pendaftaran berobat: formulir menyusun pesan WhatsApp ke nomor klinik. **Tidak ada data pasien yang disimpan di server situs.**
- Kabar klinik (`/kabar`, `/kabar/[slug]`), galeri + lightbox, testimoni + rating Google, strip mitra.
- Peta: OpenStreetMap (gratis, tanpa kunci). Bila `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` diisi, peta memakai Google Maps Embed API.
- SEO: metadata, Open Graph, `sitemap.xml`, `robots.txt`, schema.org `MedicalClinic` dan `NewsArticle`/`MedicalWebPage`.

## Menambah testimoni dari screenshot ulasan Google

1. Buka profil klinik di Google Maps → tab **Ulasan**. Ambil screenshot **satu ulasan** (nama, bintang, tanggal, isi), lalu potong rapi. Lebar gambar idealnya ≥ 700 px agar tetap terbaca.
2. Di admin: **Konten → Testimoni → Buat baru**.
3. Format: **Screenshot ulasan** → unggah gambar. Pada jendela unggah, isi **Teks alternatif** dengan ringkasan ulasan (contoh: "Ulasan bintang 5: pelayanan ramah dan cepat").
4. Isi **Nama pengulas**. Opsional tetapi disarankan: rating, isi ulasan (disalin), tanggal ulasan, tautan ulasan.
5. Centang **Tampilkan di situs**, lalu **Simpan**. Urutan tampil diatur lewat kolom **Urutan tampil** (angka kecil lebih dulu).

Di situs, screenshot tampil sebagai kartu yang dapat diperbesar. Pilih ulasan yang menggambarkan pengalaman layanan, bukan klaim kesembuhan.

## Sinkronisasi ulasan Google (opsional)

1. Aktifkan **Places API (New)** di Google Cloud, buat API key.
2. Cari Place ID klinik (Place ID Finder di dokumentasi Google Maps Platform).
3. Isi `GOOGLE_PLACES_API_KEY` dan `GOOGLE_PLACE_ID` di `.env`, lalu jalankan `npm run sync:google-reviews`.

Google mengembalikan maksimal 5 ulasan per permintaan. Ulasan baru masuk dengan status tidak tampil; admin memilih yang ditampilkan. Rating dan jumlah ulasan diperbarui di Pengaturan Situs.

## Deploy

### Hostinger (Node.js Web Apps, plan Business atau Cloud)

Hostinger menjalankan aplikasi Next.js dengan Node.js 18–24, dari GitHub atau upload .zip. **Setiap deploy ulang menimpa folder aplikasi**, jadi database dan foto unggahan wajib disimpan di folder lain di akun hosting (lihat `DATABASE_URL` dan `MEDIA_DIR` di bawah).

1. **hPanel → Websites → Add Website → Node.js Apps.**
2. Pilih sumber:
   - **Import Git Repository**: hubungkan repositori ini. Bila ada isian *Root directory*, isi `web`.
   - **Upload files**: unggah .zip berisi isi folder `web/` (buat dengan `git archive --format=zip -o klinik-web.zip HEAD:web` dari root repositori).
3. Pengaturan build:
   - Node.js version: **22.x**
   - Build command: `npm run build`
   - Start command: `npm start`
4. **Environment variables** (hPanel → aplikasi → Environment variables):

   | Nama | Isi |
   |---|---|
   | `PAYLOAD_SECRET` | 64 karakter acak, jangan dibagikan |
   | `NEXT_PUBLIC_SITE_URL` | `https://bintangusadabakti.com` (ganti bila domain berubah, lalu deploy ulang) |
   | `DATABASE_URL` | `file:/home/<USER_HOSTINGER>/klinik-data/klinik.db` |
   | `MEDIA_DIR` | `/home/<USER_HOSTINGER>/klinik-data/media` |

   `<USER_HOSTINGER>` adalah nama pengguna akun (mis. `u123456789`), terlihat di hPanel → Advanced → SSH Access atau di path File Manager.
5. Deploy. Saat pertama berjalan, aplikasi otomatis membuat tabel database dan **mengisi data awal klinik** (bila database kosong). Tidak perlu terminal.
6. Buka `https://domain/admin`, buat akun admin pertama, lalu unggah foto personel & galeri dari panel admin.
7. Cadangkan folder `klinik-data/` secara berkala (hPanel → Files → Backups, atau unduh lewat File Manager).

> Bila Hostinger ternyata tidak mengizinkan aplikasi menulis di luar folder aplikasi, alternatifnya: database di **Turso** (`DATABASE_URL=libsql://…` + `DATABASE_AUTH_TOKEN`, ada paket gratis) dan foto di penyimpanan objek. Beri tahu pengembang sebelum mengubahnya.

**Ganti domain nanti:** tambahkan domain baru di hPanel, ubah `NEXT_PUBLIC_SITE_URL`, deploy ulang, lalu arahkan domain lama ke domain baru dengan redirect 301 agar peringkat Google dan tautan lama tetap berfungsi.

### VPS / server sendiri

```bash
cp .env.example .env    # isi PAYLOAD_SECRET dan NEXT_PUBLIC_SITE_URL=https://domain-klinik
docker compose up -d --build
```

Data awal terisi otomatis saat pertama berjalan. Database (`/app/data`) dan foto (`/app/media`) disimpan di volume Docker. Pasang reverse proxy (Caddy/Nginx) untuk HTTPS. Cadangkan kedua volume secara berkala.

Tanpa Docker: `npm ci && npm run build && npm start` di server Node.js 20+, dengan folder `data/` dan `media/` yang persisten.

Migrasi database dijalankan otomatis saat server produksi mulai (`prodMigrations`). Setelah mengubah skema koleksi, buat migrasi baru dengan `npm run migrate:create -- nama-perubahan`, **periksa isinya**, lalu commit berkasnya.

> Generator migrasi SQLite kadang menyalin kolom baru dari tabel lama saat membuat ulang tabel (`INSERT INTO __new_… SELECT "kolom_baru" …`), sehingga migrasi gagal dengan *no such column*. Ganti kolom baru di bagian `SELECT` dengan nilai default. Contoh perbaikan: `src/migrations/20260928_055646_testimoni_screenshot.ts`.
>
> Hal yang sama dapat membuat `npm run dev` gagal pada database lokal lama. Untuk database lokal (bukan produksi), hapus `data/klinik.db` lalu jalankan `npm run seed` lagi.

### Catatan

- "Jadwalkan terbit" dijalankan oleh antrean internal setiap menit selama server hidup (Hostinger Node.js Apps, VPS, atau Docker).
- `NEXT_PUBLIC_SITE_URL` dibaca saat build; build ulang bila domain berubah.

## Perintah

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` / `npm start` | Build dan jalankan produksi |
| `npm run seed` | Isi data awal (`FORCE=1 npm run seed` untuk mengisi ulang layanan, dokter, mitra, FAQ, kabar) |
| `npm run import:photos` | Impor foto personel & galeri dari `seed-assets/` (`FORCE=1` untuk mengganti) |

> `seed` dan `import:photos` menulis langsung ke database SQLite. Hentikan server terlebih dahulu agar file database tidak terkunci.
| `npm run sync:google-reviews` | Tarik rating & ulasan Google |
| `npm run generate:types` | Perbarui `src/payload-types.ts` setelah mengubah koleksi |
| `npm run generate:importmap` | Perbarui import map admin setelah menambah komponen admin |
| `npm run migrate:create` | Buat migrasi database |
| `npm run typecheck` | Pemeriksaan TypeScript |
