import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { id } from '@payloadcms/translations/languages/id'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Faqs } from './collections/Faqs'
import { Gallery } from './collections/Gallery'
import { Media } from './collections/Media'
import { Partners } from './collections/Partners'
import { Posts } from './collections/Posts'
import { Services } from './collections/Services'
import { Staff } from './collections/Staff'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'
import { migrations } from './migrations'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseUrl = process.env.DATABASE_URL || 'file:./data/klinik.db'

// libSQL tidak membuat folder untuk file database lokal.
if (databaseUrl.startsWith('file:')) {
  fs.mkdirSync(path.dirname(path.resolve(databaseUrl.replace(/^file:/, ''))), { recursive: true })
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' · Admin Klinik Mustika Sekar Taji',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/icon.svg' }],
    },
    dateFormat: 'd MMM yyyy, HH:mm',
    components: {
      graphics: {
        Logo: '/components/admin/AdminLogo',
        Icon: '/components/admin/AdminIcon',
      },
    },
  },
  i18n: { supportedLanguages: { id }, fallbackLanguage: 'id' },
  collections: [Posts, Staff, Services, Gallery, Testimonials, Partners, Faqs, Media, Users],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({
    client: {
      url: databaseUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    },
    prodMigrations: migrations,
  }),
  sharp,
  // Menjalankan antrean "jadwalkan terbit" setiap menit (butuh server yang selalu hidup).
  jobs: { autoRun: [{ cron: '* * * * *', queue: 'default', limit: 10 }] },
})
