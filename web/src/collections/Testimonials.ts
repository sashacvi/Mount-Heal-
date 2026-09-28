import type { CollectionConfig } from 'payload'
import { canEdit, isLoggedIn } from '../lib/access'
import { orderField } from '../lib/fields'

type Data = Record<string, unknown> | undefined

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Testimoni', plural: 'Testimoni' },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'format', 'source', 'show', 'reviewDate'],
    group: 'Konten',
    description:
      'Cara tercepat: pilih format "Screenshot ulasan", unggah tangkapan layar ulasan dari Google Maps, isi nama pengulas, lalu centang "Tampilkan di situs". Pilih ulasan yang menggambarkan pengalaman layanan, bukan janji kesembuhan.',
  },
  defaultSort: 'order',
  access: {
    read: ({ req: { user } }) => (user ? true : { show: { equals: true } }),
    create: isLoggedIn,
    update: isLoggedIn,
    delete: canEdit,
  },
  fields: [
    {
      name: 'format',
      label: 'Format',
      type: 'radio',
      required: true,
      defaultValue: 'screenshot',
      options: [
        { label: 'Screenshot ulasan', value: 'screenshot' },
        { label: 'Teks', value: 'teks' },
      ],
      admin: { layout: 'horizontal' },
    },
    {
      name: 'screenshot',
      label: 'Screenshot ulasan',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (d) => d?.format === 'screenshot',
        description:
          'Potong gambar agar hanya berisi satu ulasan (nama, bintang, tanggal, isi). Pada kolom "Teks alternatif" media, tulis ringkas isi ulasan.',
      },
      validate: ((value: unknown, { data }: { data?: Data }) =>
        data?.format === 'screenshot' && !value ? 'Unggah screenshot ulasan.' : true) as never,
    },
    { name: 'authorName', label: 'Nama pengulas', type: 'text', required: true },
    {
      name: 'rating',
      label: 'Rating (1–5)',
      type: 'number',
      min: 1,
      max: 5,
      admin: { description: 'Wajib untuk format teks. Untuk screenshot, opsional (dipakai untuk mesin pencari).' },
      validate: ((value: unknown, { data }: { data?: Data }) => {
        if (value == null || value === '') return data?.format === 'teks' ? 'Isi rating 1–5.' : true
        const n = Number(value)
        return n >= 1 && n <= 5 ? true : 'Rating harus antara 1 dan 5.'
      }) as never,
    },
    {
      name: 'text',
      label: 'Isi ulasan',
      type: 'textarea',
      admin: {
        description: 'Wajib untuk format teks. Untuk screenshot, sebaiknya tetap diisi agar terbaca oleh pembaca layar dan Google.',
      },
      validate: ((value: unknown, { data }: { data?: Data }) =>
        data?.format === 'teks' && !(typeof value === 'string' && value.trim()) ? 'Isi ulasan wajib untuk format teks.' : true) as never,
    },
    {
      name: 'source',
      label: 'Sumber',
      type: 'select',
      required: true,
      defaultValue: 'google',
      options: [
        { label: 'Ulasan Google', value: 'google' },
        { label: 'Langsung dari pasien', value: 'langsung' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'reviewUrl',
      label: 'Tautan ulasan di Google (opsional)',
      type: 'text',
      admin: { position: 'sidebar', condition: (d) => d?.source === 'google' },
    },
    {
      name: 'googleReviewId',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Diisi otomatis oleh sinkronisasi.' },
    },
    {
      name: 'consent',
      label: 'Pasien menyetujui publikasi secara tertulis',
      type: 'checkbox',
      admin: { position: 'sidebar', condition: (d) => d?.source === 'langsung' },
    },
    { name: 'service', label: 'Layanan yang digunakan', type: 'text', admin: { position: 'sidebar' } },
    { name: 'reviewDate', label: 'Tanggal ulasan', type: 'date', admin: { position: 'sidebar' } },
    {
      name: 'show',
      label: 'Tampilkan di situs',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
      validate: ((value: unknown, { data }: { data?: Data }) => {
        if (value && data?.source === 'langsung' && !data?.consent) {
          return 'Testimoni langsung hanya boleh ditampilkan bila ada persetujuan tertulis pasien.'
        }
        return true
      }) as never,
    },
    orderField,
  ],
}
