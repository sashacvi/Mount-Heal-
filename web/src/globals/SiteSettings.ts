import type { GlobalConfig } from 'payload'
import { anyone, canEdit } from '../lib/access'
import { DAY_OPTIONS, timeField } from '../lib/fields'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Pengaturan Situs',
  admin: { group: 'Pengaturan' },
  access: { read: anyone, update: canEdit },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identitas',
          fields: [
            { name: 'clinicName', label: 'Nama klinik', type: 'text', required: true, defaultValue: 'Klinik Mustika Sekar Taji' },
            { name: 'tagline', label: 'Judul utama (hero)', type: 'text', required: true },
            { name: 'intro', label: 'Kalimat pembuka (hero)', type: 'textarea', required: true },
            { name: 'about', label: 'Tentang klinik', type: 'textarea', required: true },
            {
              type: 'row',
              fields: [
                { name: 'foundedYear', label: 'Tahun berdiri', type: 'number', admin: { width: '33%' } },
                { name: 'accreditation', label: 'Status akreditasi', type: 'text', admin: { width: '33%', placeholder: 'Utama' } },
                { name: 'licenseNumber', label: 'No. izin operasional', type: 'text', admin: { width: '33%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'serviceModes', label: 'Jenis pelayanan', type: 'text', admin: { width: '50%', placeholder: 'Umum dan BPJS' } },
                { name: 'insurance', label: 'Asuransi yang diterima', type: 'text', admin: { width: '50%', placeholder: 'BPJS Kesehatan' } },
              ],
            },
          ],
        },
        {
          label: 'Kontak & Lokasi',
          fields: [
            { name: 'address', label: 'Alamat lengkap', type: 'textarea', required: true },
            { name: 'mapsUrl', label: 'Tautan Google Maps', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                { name: 'latitude', label: 'Latitude', type: 'number', required: true, admin: { width: '50%', step: 0.000001 } },
                { name: 'longitude', label: 'Longitude', type: 'number', required: true, admin: { width: '50%', step: 0.000001 } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'whatsapp', label: 'Nomor WhatsApp', type: 'text', required: true, admin: { width: '33%', placeholder: '0878xxxxxxxx' } },
                { name: 'phone', label: 'Telepon (opsional)', type: 'text', admin: { width: '33%' } },
                { name: 'email', label: 'Email (opsional)', type: 'email', admin: { width: '33%' } },
              ],
            },
            {
              name: 'socials',
              label: 'Media sosial',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      required: true,
                      options: ['Instagram', 'Facebook', 'TikTok', 'YouTube'].map((p) => ({ label: p, value: p.toLowerCase() })),
                      admin: { width: '30%' },
                    },
                    { name: 'url', type: 'text', required: true, admin: { width: '70%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Jam Operasional',
          fields: [
            {
              name: 'hours',
              label: 'Jam buka per hari',
              type: 'array',
              minRows: 7,
              maxRows: 7,
              labels: { singular: 'Hari', plural: 'Hari' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'day', label: 'Hari', type: 'select', required: true, options: DAY_OPTIONS, admin: { width: '25%' } },
                    timeField('open', 'Buka'),
                    timeField('close', 'Tutup'),
                  ],
                },
                { name: 'closed', label: 'Tutup sepanjang hari', type: 'checkbox' },
              ],
            },
            { name: 'hoursNote', label: 'Catatan jam (libur nasional, dll.)', type: 'text' },
          ],
        },
        {
          label: 'Tim',
          description: 'Angka ini tampil di bagian Tentang.',
          fields: [
            {
              name: 'team',
              type: 'group',
              label: false,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'doctors', label: 'Dokter umum', type: 'number', admin: { width: '33%' } },
                    { name: 'dentists', label: 'Dokter gigi', type: 'number', admin: { width: '33%' } },
                    { name: 'midwives', label: 'Bidan', type: 'number', admin: { width: '33%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'nurses', label: 'Perawat', type: 'number', admin: { width: '33%' } },
                    { name: 'pharmacists', label: 'Apoteker', type: 'number', admin: { width: '33%' } },
                    { name: 'pharmacyAssistants', label: 'Asisten apoteker', type: 'number', admin: { width: '33%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Ulasan Google',
          fields: [
            { name: 'googleReviewsUrl', label: 'Tautan halaman ulasan Google', type: 'text' },
            {
              type: 'row',
              fields: [
                { name: 'googleRating', label: 'Rating rata-rata', type: 'number', min: 0, max: 5, admin: { width: '33%', step: 0.1 } },
                { name: 'googleReviewCount', label: 'Jumlah ulasan', type: 'number', admin: { width: '33%' } },
                { name: 'googleSyncedAt', label: 'Terakhir disinkronkan', type: 'date', admin: { width: '33%', readOnly: true } },
              ],
            },
          ],
        },
      ],
    },
  ],
}
