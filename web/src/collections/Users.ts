import type { CollectionConfig } from 'payload'
import { hasRole, isAdmin, isLoggedIn, type Role } from '../lib/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Pengguna', plural: 'Pengguna' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Pengaturan',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    admin: ({ req: { user } }) => Boolean(user),
    read: isLoggedIn,
    create: isAdmin,
    delete: isAdmin,
    update: ({ req: { user }, id }) =>
      hasRole(user as { role?: Role }, 'admin') || (user != null && user.id === id),
  },
  hooks: {
    beforeChange: [
      // Pengguna pertama yang mendaftar otomatis menjadi admin.
      async ({ req, operation, data }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
          if (totalDocs === 0) data.role = 'admin'
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', label: 'Nama', type: 'text', required: true },
    {
      name: 'role',
      label: 'Peran',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        { label: 'Admin — kelola semua, termasuk pengguna', value: 'admin' },
        { label: 'Editor — tulis & terbitkan konten', value: 'editor' },
        { label: 'Peninjau medis — tinjau artikel kesehatan', value: 'peninjau' },
      ],
      access: {
        update: ({ req: { user } }) => hasRole(user as { role?: Role }, 'admin'),
      },
    },
  ],
}
