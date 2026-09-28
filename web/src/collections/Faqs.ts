import type { CollectionConfig } from 'payload'
import { anyone, canEdit } from '../lib/access'
import { orderField, showField } from '../lib/fields'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'Tanya Jawab', plural: 'Tanya Jawab (FAQ)' },
  admin: { useAsTitle: 'question', defaultColumns: ['question', 'order', 'show'], group: 'Konten' },
  defaultSort: 'order',
  access: { read: anyone, create: canEdit, update: canEdit, delete: canEdit },
  fields: [
    { name: 'question', label: 'Pertanyaan', type: 'text', required: true },
    { name: 'answer', label: 'Jawaban', type: 'textarea', required: true },
    showField(),
    orderField,
  ],
}
