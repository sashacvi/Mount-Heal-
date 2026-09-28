import type { CollectionConfig } from 'payload'
import { anyone, canEdit } from '../lib/access'
import { orderField, showField } from '../lib/fields'

export const Partners: CollectionConfig = {
  slug: 'partners',
  labels: { singular: 'Mitra', plural: 'Mitra' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'category', 'order', 'show'], group: 'Konten' },
  defaultSort: 'order',
  access: { read: anyone, create: canEdit, update: canEdit, delete: canEdit },
  fields: [
    { name: 'name', label: 'Nama mitra', type: 'text', required: true },
    {
      name: 'category',
      label: 'Kategori',
      type: 'select',
      required: true,
      defaultValue: 'lainnya',
      options: [
        { label: 'Puskesmas', value: 'puskesmas' },
        { label: 'Rumah sakit', value: 'rumah-sakit' },
        { label: 'Yayasan', value: 'yayasan' },
        { label: 'Asuransi', value: 'asuransi' },
        { label: 'Perusahaan', value: 'korporat' },
        { label: 'Lainnya', value: 'lainnya' },
      ],
    },
    {
      name: 'logo',
      label: 'Logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'SVG atau PNG transparan. Bila kosong, tampil nama mitra.' },
    },
    { name: 'url', label: 'Situs mitra', type: 'text' },
    showField(),
    orderField,
  ],
}
