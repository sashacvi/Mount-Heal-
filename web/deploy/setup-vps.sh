#!/usr/bin/env bash
# Persiapan VPS (Ubuntu 22.04/24.04 atau Debian 12). Jalankan sekali:
#   sudo bash deploy/setup-vps.sh
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "Jalankan dengan sudo: sudo bash deploy/setup-vps.sh"; exit 1; }

echo "== 1/3 Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker
docker compose version

echo "== 2/3 Swap (build Next.js butuh ±2,5 GB memori)"
mem_kb=$(awk '/MemTotal/ {print $2}' /proc/meminfo)
if [ "$mem_kb" -lt 4000000 ] && [ -z "$(swapon --show --noheadings)" ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "Swap 2 GB dibuat."
else
  echo "Swap tidak diubah (RAM cukup atau swap sudah ada)."
fi

echo "== 3/3 Firewall"
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 443/udp
  echo "Port 80 dan 443 dibuka di ufw."
else
  echo "ufw tidak aktif. Pastikan port 80 dan 443 terbuka di firewall/security group panel Biznet Gio."
fi

echo
echo "Selesai. Lanjut: cp .env.example .env, isi nilainya, lalu: docker compose up -d --build"
