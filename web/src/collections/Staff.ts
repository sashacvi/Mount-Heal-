import type { CollectionConfig } from 'payload'
import { anyone, canEdit } from '../lib/access'
import { DAY_OPTIONS, orderField, showField, timeField } from '../lib/fields'

export const STAFF_CATEGORIES = [
  { label: 'Dokter', value: 'dokter' },
  { label: 'Dokter Gigi', value: 'dokter-gigi' },
  { label: 'Bidan', value: 'bidan' },
  { label: 'Perawat', value: 'perawat' },
  { label: 'Apoteker', value: 'apoteker' },
  { label: 'Asisten Apoteker', value: 'asisten-apoteker' },
] as const

export const Staff: CollectionConfig = {
  slug: 'staff',
  labels: { singular: 'Tenaga Kesehatan', plural: 'Dokter & Tenaga Kesehatan' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'position', 'show'],
    group: 'Klinik',
    description: 'Jadwal di sini tampil di bagian Dokter & Jadwal dan kartu "Bertugas hari ini".',
  },
  defaultSort: 'order',
  access: { read: anyone, create: canEdit, update: canEdit, delete: canEdit },
  fields: [
    {
      name: 'name',
      label: 'Nama lengkap dengan gelar',
      type: 'text',
      required: true,
      admin: { placeholder: 'dr. Nama Lengkap, M.Kes' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          label: 'Kategori',
          type: 'select',
          required: true,
          options: [...STAFF_CATEGORIES],
          admin: { width: '50%' },
        },
        {
          name: 'position',
          label: 'Jabatan / keahlian',
          type: 'text',
          admin: { width: '50%', placeholder: 'Dokter Umum' },
        },
      ],
    },
    { name: 'photo', label: 'Foto', type: 'upload', relationTo: 'media' },
    { name: 'bio', label: 'Profil singkat', type: 'textarea', maxLength: 400 },
    {
      name: 'schedule',
      label: 'Jadwal praktik mingguan',
      type: 'array',
      labels: { singular: 'Jadwal', plural: 'Jadwal' },
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'day', label: 'Hari', type: 'select', required: true, options: DAY_OPTIONS, admin: { width: '33%' } },
            timeField('start', 'Mulai'),
            timeField('end', 'Selesai'),
          ],
        },
      ],
    },
    {
      name: 'scheduleNote',
      label: 'Catatan jadwal',
      type: 'text',
      admin: { placeholder: 'Contoh: bergilir sesuai shift' },
    },
    showField(),
    orderField,
  ],
}
