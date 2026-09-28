import type { CollectionConfig } from 'payload'
import { anyone, canEdit } from '../lib/access'
import { orderField, showField, slugField } from '../lib/fields'

export const SERVICE_ICONS = [
  { label: 'Stetoskop (poli umum)', value: 'stetho' },
  { label: 'Gigi', value: 'tooth' },
  { label: 'Ibu & anak', value: 'heart' },
  { label: 'Laboratorium', value: 'flask' },
  { label: 'Obat / farmasi', value: 'pill' },
  { label: 'Clipboard (MCU)', value: 'clipboard' },
  { label: 'Rumah (home care)', value: 'home' },
  { label: 'Suntik (vaksin)', value: 'syringe' },
  { label: 'Bayi', value: 'baby' },
] as const

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Layanan', plural: 'Layanan / Poli' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'order', 'show'], group: 'Klinik' },
  defaultSort: 'order',
  access: { read: anyone, create: canEdit, update: canEdit, delete: canEdit },
  fields: [
    { name: 'name', label: 'Nama layanan', type: 'text', required: true },
    { name: 'summary', label: 'Deskripsi singkat', type: 'textarea', required: true, maxLength: 220 },
    { name: 'icon', label: 'Ikon', type: 'select', required: true, defaultValue: 'stetho', options: [...SERVICE_ICONS] },
    {
      name: 'tags',
      label: 'Label singkat',
      type: 'array',
      maxRows: 4,
      fields: [{ name: 'label', label: 'Label', type: 'text', required: true }],
      admin: { description: 'Contoh: BPJS, Setiap hari, Perlu janji' },
    },
    slugField('name'),
    showField(),
    orderField,
  ],
}
