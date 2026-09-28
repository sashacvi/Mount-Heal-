# Image produksi Klinik Mustika Sekar Taji (Next.js + Payload CMS + SQLite)
FROM node:22-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# URL publik ikut ditanam saat build (sitemap, robots, Open Graph).
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY \
    PAYLOAD_SECRET=build-only-placeholder
RUN npm run build

ENV NODE_ENV=production PORT=3000
# Database & file unggahan disimpan di volume agar tidak hilang saat update.
VOLUME ["/app/data", "/app/media"]
EXPOSE 3000
CMD ["npm", "start"]
