import type { CollectionConfig } from 'payload'
import { anyone, canEdit, isLoggedIn } from '../lib/access'
import { orderField, showField } from '../lib/fields'

export const ALBUMS = [
  { label: 'Fasilitas', value: 'fasilitas' },
  { label: 'Tim', value: 'tim' },
  { label: 'Kegiatan', value: 'kegiatan' },
] as const

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  labels: { singular: 'Foto Galeri', plural: 'Galeri Foto' },
  admin: {
    useAsTitle: 'caption',
    defaultColumns: ['caption', 'album', 'show', 'order'],
    group: 'Konten',
    description: 'Foto pasien hanya boleh diunggah dengan persetujuan tertulis. Samarkan wajah anak.',
  },
  defaultSort: 'order',
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: canEdit },
  fields: [
    { name: 'image', label: 'Foto', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', label: 'Keterangan', type: 'text', required: true, maxLength: 90 },
    { name: 'album', label: 'Album', type: 'select', required: true, defaultValue: 'fasilitas', options: [...ALBUMS] },
    { name: 'takenAt', label: 'Tanggal foto', type: 'date', admin: { position: 'sidebar' } },
    showField(),
    orderField,
  ],
}
