#!/usr/bin/env bash
# Backup database + foto. Jalankan dari folder web/:  bash deploy/backup.sh
# Otomatis tiap malam (crontab -e):  30 2 * * * cd /path/ke/web && bash deploy/backup.sh >> backup.log 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."
stamp=$(date +%F-%H%M)
dest=${BACKUP_DIR:-$HOME/backup-klinik}
keep_days=${BACKUP_KEEP_DAYS:-30}
mkdir -p "$dest"

# Salinan database yang konsisten walau website sedang dipakai (SQLite VACUUM INTO).
docker compose exec -T web node -e "
const { createClient } = require('@libsql/client');
createClient({ url: 'file:/app/data/klinik.db' })
  .execute(\"VACUUM INTO '/app/data/backup-tmp.db'\")
  .then(() => process.exit(0), (e) => { console.error(e); process.exit(1) });"
docker compose cp web:/app/data/backup-tmp.db "$dest/klinik-$stamp.db"
docker compose exec -T web rm -f /app/data/backup-tmp.db

# Foto unggahan
docker compose cp web:/app/media "$dest/media-$stamp"
tar -czf "$dest/media-$stamp.tar.gz" -C "$dest" "media-$stamp"
rm -rf "$dest/media-$stamp"

# Konfigurasi (berisi PAYLOAD_SECRET) — tanpa file ini database lama tidak bisa dibuka dengan benar
install -m 600 .env "$dest/env-terakhir"

find "$dest" -name 'klinik-*.db' -mtime +"$keep_days" -delete
find "$dest" -name 'media-*.tar.gz' -mtime +"$keep_days" -delete
echo "Backup selesai: $dest/klinik-$stamp.db dan $dest/media-$stamp.tar.gz"
