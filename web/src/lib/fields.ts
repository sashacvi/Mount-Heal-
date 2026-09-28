import type { Field, SelectField } from 'payload'
import { slugify } from './slug'

export const DAY_OPTIONS: SelectField['options'] = [
  { label: 'Senin', value: '1' },
  { label: 'Selasa', value: '2' },
  { label: 'Rabu', value: '3' },
  { label: 'Kamis', value: '4' },
  { label: 'Jumat', value: '5' },
  { label: 'Sabtu', value: '6' },
  { label: 'Minggu', value: '0' },
]

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export const timeField = (name: string, label: string): Field => ({
  name,
  label,
  type: 'text',
  required: true,
  admin: { placeholder: '08:00', width: '33%' },
  validate: (value: unknown) =>
    typeof value === 'string' && TIME_RE.test(value) ? true : 'Gunakan format JJ:MM, contoh 08:00',
})

export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Alamat URL. Dibuat otomatis dari judul bila dikosongkan.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim()) return slugify(value)
        const source = data?.[from]
        return typeof source === 'string' ? slugify(source) : value
      },
    ],
  },
})

export const orderField: Field = {
  name: 'order',
  label: 'Urutan tampil',
  type: 'number',
  defaultValue: 10,
  admin: { position: 'sidebar', description: 'Angka kecil tampil lebih dulu.' },
}

export const showField = (label = 'Tampilkan di situs', defaultValue = true): Field => ({
  name: 'show',
  label,
  type: 'checkbox',
  defaultValue,
  admin: { position: 'sidebar' },
})
