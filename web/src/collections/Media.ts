import path from 'path'
import type { CollectionConfig } from 'payload'
import { anyone, canEdit, isLoggedIn } from '../lib/access'

const webp = { format: 'webp' as const, options: { quality: 82 } }

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Media', plural: 'Media' },
  admin: { group: 'Konten', defaultColumns: ['filename', 'alt', 'updatedAt'] },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: canEdit },
  upload: {
    staticDir: path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
    focalPoint: true,
    // Foto asli diproses ulang: diputar sesuai orientasi kamera, sisi terpanjang maks. 2000 px,
    // dan metadata EXIF (termasuk lokasi GPS dari ponsel) dibuang.
    resizeOptions: { width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true },
    adminThumbnail: 'thumb',
    imageSizes: [
      { name: 'thumb', width: 400, formatOptions: webp },
      { name: 'card', width: 960, height: 540, formatOptions: webp },
      { name: 'square', width: 720, height: 720, formatOptions: webp },
      { name: 'large', width: 1800, formatOptions: webp },
      // Lebar tetap tanpa potong: untuk screenshot ulasan.
      { name: 'review', width: 900, formatOptions: webp },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Teks alternatif',
      type: 'text',
      required: true,
      admin: { description: 'Jelaskan isi foto secara singkat, untuk pembaca layar dan mesin pencari.' },
    },
  ],
}
