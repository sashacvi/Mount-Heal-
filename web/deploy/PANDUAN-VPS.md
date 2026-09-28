# Panduan pasang website di VPS Biznet Gio (berdampingan dengan farmabit)

Waktu: ±30–45 menit (belum termasuk tunggu DNS). Semua perintah dijalankan lewat SSH di VPS.
Baris yang diawali `#` adalah keterangan, tidak perlu diketik.

---

## Langkah 0 — Amankan dulu

1. Panel Biznet Gio → VPS **farmabit** → **Snapshot** → buat snapshot baru (mis. `sebelum-website-klinik`).
2. Siapkan: IP publik VPS, akses SSH, dan akun GitHub.

## Langkah 1 — Cek kondisi VPS (hanya membaca, tidak mengubah apa pun)

```bash
free -h; df -h /
docker --version; docker compose version
sudo docker ps --format '{{.Names}}\t{{.Ports}}'
sudo ss -tlnp | grep -E ':(80|443|3000) '
ls /etc/nginx/sites-enabled 2>/dev/null; systemctl is-active nginx apache2 2>/dev/null
```

Tentukan jalur dari hasil `ss`:

| Hasil `ss` untuk port 80/443 | Jalur |
|---|---|
| Tidak ada baris | **A — Caddy** (paling sederhana) |
| Ada `nginx` (program di VPS, bukan Docker) | **B — Nginx yang sudah ada** |
| Ada `docker-proxy` (proxy farmabit di Docker) | **C** — hubungi pengembang dengan hasil langkah 1 |

Jalur B memakai port lokal **3010** (bukan 3000) agar tidak bentrok dengan aplikasi lain. Pastikan `sudo ss -tlnp | grep ':3010 '` kosong; bila terpakai, isi `WEB_HOST_PORT` di `.env` dengan port lain dan samakan di `deploy/nginx-klinik.conf`.

## Langkah 2 — Arahkan domain (hPanel Hostinger)

hPanel → **Domains** → `bintangusadabakti.com` → **DNS / Nameservers** → **DNS records**:

| Tipe | Nama | Isi (Points to) | TTL |
|---|---|---|---|
| A | `@` | IP publik VPS | 3600 |
| A | `www` | IP publik VPS | 3600 |

Hapus record **A**, **AAAA**, atau **CNAME** lain untuk `@` dan `www`.

**Bila nameserver domain adalah Cloudflare** (hPanel → Domains → Nameservers berisi `*.ns.cloudflare.com`), record di hPanel **tidak berlaku**. Atur di Cloudflare → domain → **DNS → Records**: `A @ → IP VPS` dan `CNAME www → bintangusadabakti.com`, keduanya **Proxy status: DNS only (awan abu-abu)** agar certbot di VPS bisa menerbitkan sertifikat dan tidak terjadi redirect loop. Jangan ubah record lain (mis. subdomain yang dipakai sistem lain, MX, TXT), dan jangan klik **Ubah nameserver** di hPanel. Cek dari VPS sampai muncul IP VPS (bisa beberapa menit sampai beberapa jam):

```bash
getent hosts bintangusadabakti.com www.bintangusadabakti.com
```

## Langkah 3 — Buka port 80 dan 443

Panel Biznet Gio → VPS → tab **Network and Security** → lihat bagian **Security Group**.

- **Kosong** (tidak ada Security Group): semua port sudah terbuka. **Jangan membuat atau memasang Security Group baru** — Security Group baru berisi aturan `Any DROP`, sehingga SSH (22) dan situs lain di port 80 langsung terblokir.
- **Ada Security Group terpasang**: tambahkan aturan `TCP 443 ACCEPT 0.0.0.0/0` (dan `TCP 80` bila belum ada) di Security Group **itu**.
Bila `sudo ufw status` menunjukkan `active`: `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`.

## Langkah 4 — Pasang Docker (lewati bila `docker --version` di langkah 1 sudah muncul)

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker
```

## Langkah 5 — Ambil file konfigurasi website

```bash
sudo mkdir -p /opt/klinik-mst && sudo chown $USER /opt/klinik-mst
git clone --depth 1 -b claude/clinic-company-profile-design-2lxjjf https://github.com/sashacvi/Mount-Heal-.git /opt/klinik-mst/repo
cd /opt/klinik-mst/repo/web
```

## Langkah 6 — Isi konfigurasi

```bash
cp .env.example .env
nano .env
```

Ubah/isi baris berikut, lalu simpan (Ctrl+O, Enter, Ctrl+X):

```
PAYLOAD_SECRET=<isi 64 karakter acak dari pengembang, rahasiakan>
NEXT_PUBLIC_SITE_URL=https://bintangusadabakti.com
SITE_DOMAIN=bintangusadabakti.com
WEB_IMAGE=ghcr.io/sashacvi/klinik-mst-web:claude-clinic-company-profile-design-2lxjjf
```

Tag di atas adalah image yang dibangun otomatis dari branch pengembangan. Setelah kode digabung ke branch `main`, ganti tag menjadi `latest`.

## Langkah 7 — Unduh image website (tanpa build di VPS)

Image saat ini berstatus **private**, jadi VPS belum bisa mengunduhnya. Pilih salah satu:

- **Cara 1 (disarankan, sekali saja):** jadikan image publik. GitHub → foto profil → **Your profile** → tab **Packages** → `klinik-mst-web` → **Package settings** → **Danger Zone** → **Change visibility** → **Public**. Aman: image hanya berisi kode yang memang sudah publik di repo; rahasia (`PAYLOAD_SECRET`), database, dan foto disimpan di VPS, bukan di image.
- **Cara 2 (tetap private):** buat Personal Access Token (GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)** → centang hanya `read:packages`), lalu di VPS:

  ```bash
  echo <TOKEN> | sudo docker login ghcr.io -u sashacvi --password-stdin
  ```

Lalu:

```bash
sudo docker compose pull web
```

## Langkah 8 — Jalankan

### Jalur A (Caddy, port 80/443 kosong)

```bash
sudo docker compose up -d --no-build
```

### Jalur B (Nginx yang sudah ada)

Aktifkan mode tanpa Caddy sekali saja, lalu jalankan website di `127.0.0.1:3010`:

```bash
echo 'COMPOSE_FILE=docker-compose.yml:deploy/compose.tanpa-caddy.yml' >> .env
sudo docker compose up -d --no-build
curl -sI http://127.0.0.1:3010 | head -1          # tunggu ±30 detik; harus HTTP/1.1 200
```

Tambahkan situs ke Nginx:

```bash
sudo cp deploy/nginx-klinik.conf /etc/nginx/sites-available/klinik-mst
sudo ln -s /etc/nginx/sites-available/klinik-mst /etc/nginx/sites-enabled/klinik-mst
sudo nginx -t && sudo systemctl reload nginx
curl -sI -H 'Host: bintangusadabakti.com' http://127.0.0.1 | head -1   # harus HTTP/1.1 200
```

`nginx -t` harus menampilkan `syntax is ok` sebelum reload. Bila gagal, hapus link tadi (`sudo rm /etc/nginx/sites-enabled/klinik-mst`) agar farmabit tidak terganggu, lalu kirim pesan error ke pengembang.

Setelah DNS mengarah ke VPS (langkah 2) dan port 443 terbuka (langkah 3), pasang HTTPS:

```bash
sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d bintangusadabakti.com -d www.bintangusadabakti.com
```

## Langkah 9 — Periksa

```bash
sudo docker compose ps                    # web: Up (healthy)
sudo docker compose logs --tail=30 web    # ada "Database kosong: mengisi data awal klinik…" saat pertama kali
curl -I https://bintangusadabakti.com     # HTTP/2 200
free -h                                   # pastikan farmabit masih punya memori cukup
```

Pastikan juga farmabit masih bisa dibuka seperti biasa.

## Langkah 10 — Buat akun admin

Buka `https://bintangusadabakti.com/admin` → isi nama, email, kata sandi. Akun pertama otomatis menjadi **Admin**. Setelah itu unggah foto personel lewat **Klinik → Dokter & Tenaga Kesehatan**.

## Langkah 11 — Backup otomatis

```bash
cd /opt/klinik-mst/repo/web
sudo bash deploy/backup.sh               # uji sekali; hasil di /root/backup-klinik
sudo crontab -e                          # tambahkan baris di bawah, simpan
30 2 * * * cd /opt/klinik-mst/repo/web && bash deploy/backup.sh >> /var/log/backup-klinik.log 2>&1
```

Salin folder backup ke luar VPS secara berkala.

---

## Update website di kemudian hari

```bash
cd /opt/klinik-mst/repo && git pull
cd web && sudo docker compose pull web && sudo docker compose up -d --no-build
```

(Perintah yang sama berlaku untuk jalur A dan B; jalur B membaca `COMPOSE_FILE` dari `.env`.)

## Masalah umum

| Gejala | Penyebab & solusi |
|---|---|
| `pull` gagal `unauthorized` / `denied` | Belum login GHCR atau token tanpa `read:packages` (langkah 7). |
| `port is already allocated` / `address already in use` | Port 80/443/3000 dipakai aplikasi lain → pakai jalur B atau ganti port. |
| Caddy log `challenge failed` / sertifikat gagal | DNS belum mengarah ke VPS, ada record AAAA lama, atau port 80 tertutup (langkah 2–3). |
| Halaman 502 Bad Gateway | Website belum selesai menyala; tunggu 30–60 detik lalu cek `docker compose logs web`. |
| Ingin menghentikan website | `sudo docker compose down` (data tetap tersimpan di volume). |
| Ingin menghapus total | `sudo docker compose down -v` (**menghapus database & foto**; lakukan backup dulu). |
