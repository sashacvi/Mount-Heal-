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

### VPS (Biznet Gio atau VPS Ubuntu/Debian lain) — disarankan

Website + [Caddy](https://caddyserver.com) (HTTPS gratis otomatis dari Let's Encrypt) berjalan di Docker. Domain tetap di Hostinger; cukup arahkan DNS-nya ke IP VPS.

**1. Arahkan domain (hPanel Hostinger → Domains → bintangusadabakti.com → DNS / Nameservers → DNS records)**

| Tipe | Nama | Isi | TTL |
|---|---|---|---|
| A | `@` | IP publik VPS | 3600 |
| A | `www` | IP publik VPS | 3600 |

Hapus record A/AAAA lain untuk `@` dan `www` yang mengarah ke tempat lain (termasuk AAAA bila VPS tidak memakai IPv6; ini membuat sertifikat HTTPS gagal). Perubahan DNS bisa butuh beberapa menit sampai beberapa jam. Cek dengan `dig +short bintangusadabakti.com` sampai muncul IP VPS.

**2. Siapkan VPS (sekali saja)**

Masuk SSH ke VPS, salin kode website (salah satu):
- `git clone <url-repositori>` lalu `cd <repo>/web`, atau
- unggah `klinik-web.zip` (dibuat dengan `git archive --format=zip -o klinik-web.zip HEAD:web`) lalu `unzip klinik-web.zip -d klinik-web && cd klinik-web`.

```bash
sudo bash deploy/setup-vps.sh     # pasang Docker, swap 2 GB bila RAM < 4 GB, buka port 80/443 bila ufw aktif
```
Pastikan juga port **80 dan 443** terbuka di firewall/security group panel Biznet Gio.

**3. Isi konfigurasi**

```bash
cp .env.example .env
nano .env
```
Isi minimal:
```
PAYLOAD_SECRET=<64 karakter acak>
NEXT_PUBLIC_SITE_URL=https://bintangusadabakti.com
SITE_DOMAIN=bintangusadabakti.com
```

**4. Jalankan**

```bash
sudo docker compose up -d --build      # build pertama ±3–6 menit
sudo docker compose logs -f web        # tunggu "Database kosong: mengisi data awal klinik…" lalu Ctrl+C
```
Buka `https://bintangusadabakti.com/admin` dan buat akun admin pertama (otomatis menjadi Admin).

**5. Backup otomatis**

```bash
bash deploy/backup.sh                  # uji sekali; hasil di ~/backup-klinik
crontab -e                             # tambahkan baris berikut (setiap 02.30)
30 2 * * * cd /path/ke/klinik-web && bash deploy/backup.sh >> backup.log 2>&1
```
Salin folder `~/backup-klinik` ke tempat lain (Google Drive/komputer) secara berkala. Backup disimpan 30 hari.

**Update versi website:** salin kode terbaru (git pull atau zip baru), lalu `sudo docker compose up -d --build`. Database dan foto ada di volume Docker sehingga tidak ikut terhapus.

**Ganti domain nanti:** arahkan DNS domain baru ke IP VPS, ubah `SITE_DOMAIN` dan `NEXT_PUBLIC_SITE_URL` di `.env`, aktifkan blok redirect domain lama di `deploy/Caddyfile`, lalu `sudo docker compose up -d --build`. Redirect 301 menjaga tautan lama dan peringkat Google.

**VPS sudah memakai Nginx/Apache di port 80/443?** Jalankan tanpa Caddy: `sudo docker compose -f docker-compose.yml -f deploy/compose.tanpa-caddy.yml up -d --build web`, lalu pakai contoh `deploy/nginx-klinik.conf` dan `certbot --nginx`.

**Impor foto dari `seed-assets/` (opsional, selain lewat panel admin):**
```bash
sudo docker compose stop web
sudo docker compose run --rm -v "$PWD/seed-assets:/app/seed-assets:ro" web npm run import:photos
sudo docker compose start web
```

### Hosting Node.js terkelola (Hostinger Business/Cloud, dll.)

Juga didukung, tetapi tidak diperlukan bila sudah punya VPS. Karena folder aplikasi ditimpa setiap deploy, isi `DATABASE_URL` (mis. `file:/home/<user>/klinik-data/klinik.db`) dan `MEDIA_DIR` ke folder di luar folder aplikasi. Data awal terisi otomatis saat pertama berjalan.

### Tanpa Docker

`npm ci && npm run build && npm start` di server Node.js 22, dengan `DATABASE_URL` dan `MEDIA_DIR` menunjuk ke folder yang persisten, dijalankan oleh pengelola proses (systemd/pm2) di balik reverse proxy HTTPS.

Migrasi database dijalankan otomatis saat server produksi mulai (`prodMigrations`). Setelah mengubah skema koleksi, buat migrasi baru dengan `npm run migrate:create -- nama-perubahan`, **periksa isinya**, lalu commit berkasnya.

> Generator migrasi SQLite kadang menyalin kolom baru dari tabel lama saat membuat ulang tabel (`INSERT INTO __new_… SELECT "kolom_baru" …`), sehingga migrasi gagal dengan *no such column*. Ganti kolom baru di bagian `SELECT` dengan nilai default. Contoh perbaikan: `src/migrations/20260928_055646_testimoni_screenshot.ts`.
>
> Hal yang sama dapat membuat `npm run dev` gagal pada database lokal lama. Untuk database lokal (bukan produksi), hapus `data/klinik.db` lalu jalankan `npm run seed` lagi.

### Catatan

- "Jadwalkan terbit" dijalankan oleh antrean internal setiap menit selama server hidup.
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
