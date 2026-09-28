import type { CollectionConfig } from 'payload'
import { canEdit, canReview, publishedOrLoggedIn } from '../lib/access'
import { slugField } from '../lib/fields'

export const POST_TYPES = [
  { label: 'Berita', value: 'berita' },
  { label: 'Artikel Kesehatan', value: 'artikel' },
  { label: 'Pengumuman', value: 'pengumuman' },
] as const

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Kabar', plural: 'Kabar Klinik' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', '_status', 'publishedAt'],
    group: 'Konten',
    description: 'Berita, artikel kesehatan, dan pengumuman yang tampil di situs.',
  },
  defaultSort: '-publishedAt',
  versions: { drafts: { schedulePublish: true }, maxPerDoc: 25 },
  access: { read: publishedOrLoggedIn, create: canEdit, update: canReview, delete: canEdit },
  fields: [
    { name: 'title', label: 'Judul', type: 'text', required: true, maxLength: 120 },
    {
      name: 'type',
      label: 'Jenis',
      type: 'select',
      required: true,
      defaultValue: 'berita',
      options: [...POST_TYPES],
    },
    {
      name: 'excerpt',
      label: 'Ringkasan',
      type: 'textarea',
      required: true,
      maxLength: 200,
      admin: { description: '1–2 kalimat. Tampil di kartu dan hasil pencarian Google.' },
    },
    { name: 'cover', label: 'Foto sampul', type: 'upload', relationTo: 'media' },
    { name: 'content', label: 'Isi', type: 'richText' },
    slugField('title'),
    {
      name: 'publishedAt',
      label: 'Tanggal terbit',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, HH.mm' } },
    },
    {
      name: 'author',
      label: 'Penulis',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
      defaultValue: ({ user }: { user?: { id?: number | string } | null }) => user?.id,
    },
    {
      name: 'medicalReviewer',
      label: 'Peninjau medis',
      type: 'relationship',
      relationTo: 'staff',
      filterOptions: { category: { in: ['dokter', 'dokter-gigi'] } },
      admin: {
        position: 'sidebar',
        condition: (data) => data?.type === 'artikel',
        description: 'Wajib untuk artikel kesehatan sebelum diterbitkan.',
      },
      validate: ((value: unknown, { data }: { data?: Record<string, unknown> }) => {
        if (data?.type === 'artikel' && data?._status === 'published' && !value) {
          return 'Artikel kesehatan wajib memiliki peninjau medis sebelum diterbitkan.'
        }
        return true
      }) as never,
    },
    {
      name: 'pinned',
      label: 'Sematkan di bilah pengumuman atas',
      type: 'checkbox',
      admin: { position: 'sidebar', condition: (data) => data?.type === 'pengumuman' },
    },
    {
      name: 'expiresAt',
      label: 'Tampil di bilah atas sampai',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { displayFormat: 'd MMM yyyy' },
        condition: (data) => data?.type === 'pengumuman' && Boolean(data?.pinned),
        description: 'Kosongkan bila tidak ada batas waktu.',
      },
    },
  ],
}
