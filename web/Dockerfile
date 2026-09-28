# Image produksi Klinik Mustika Sekar Taji (Next.js + Payload CMS + SQLite)
FROM node:22-bookworm-slim
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
# Secret "extra_ca" opsional: sertifikat CA tambahan bila build berjalan di jaringan dengan proxy TLS.
RUN --mount=type=secret,id=extra_ca,required=false \
    sh -c '[ -f /run/secrets/extra_ca ] && export NODE_EXTRA_CA_CERTS=/run/secrets/extra_ca; npm ci --no-audit --no-fund && npm cache clean --force'

COPY . .
# URL publik ikut ditanam saat build (sitemap, robots, Open Graph).
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY
RUN --mount=type=secret,id=extra_ca,required=false \
    sh -c '[ -f /run/secrets/extra_ca ] && export NODE_EXTRA_CA_CERTS=/run/secrets/extra_ca; PAYLOAD_SECRET=build-only-placeholder npm run build' \
 && rm -rf .next/cache \
 && mkdir -p /app/data /app/media \
 && chown -R node:node /app/data /app/media /app/.next
# (Satu lapisan agar .next tidak tersimpan dua kali di image.) Database & foto ada di volume; aplikasi berjalan sebagai user non-root.
USER node
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/app/data/klinik.db MEDIA_DIR=/app/media
VOLUME ["/app/data", "/app/media"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/globals/site-settings').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["npm", "start"]
