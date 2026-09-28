import type { CollectionConfig } from 'payload'
import { canEdit, isLoggedIn } from '../lib/access'
import { orderField } from '../lib/fields'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Testimoni', plural: 'Testimoni' },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'rating', 'source', 'show', 'reviewDate'],
    group: 'Konten',
    description:
      'Ulasan Google dapat diisi manual atau lewat sinkronisasi (npm run sync:google-reviews). Tampilkan ulasan yang menggambarkan pengalaman layanan, bukan janji kesembuhan.',
  },
  defaultSort: '-reviewDate',
  access: {
    read: ({ req: { user } }) => (user ? true : { show: { equals: true } }),
    create: isLoggedIn,
    update: isLoggedIn,
    delete: canEdit,
  },
  fields: [
    { name: 'authorName', label: 'Nama pengulas', type: 'text', required: true },
    { name: 'rating', label: 'Rating (1–5)', type: 'number', required: true, min: 1, max: 5, defaultValue: 5 },
    { name: 'text', label: 'Isi ulasan', type: 'textarea', required: true },
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
      label: 'Tautan ulasan / profil pengulas',
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
      validate: ((value: unknown, { data }: { data?: Record<string, unknown> }) => {
        if (value && data?.source === 'langsung' && !data?.consent) {
          return 'Testimoni langsung hanya boleh ditampilkan bila ada persetujuan tertulis pasien.'
        }
        return true
      }) as never,
    },
    orderField,
  ],
}
