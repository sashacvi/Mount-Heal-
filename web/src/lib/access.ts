import type { Access } from 'payload'

export type Role = 'admin' | 'editor' | 'peninjau'

type MaybeUser = { id?: number | string; role?: Role | null } | null | undefined

export const hasRole = (user: MaybeUser, ...roles: Role[]): boolean =>
  Boolean(user && user.role && roles.includes(user.role))

export const anyone: Access = () => true
export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)
export const isAdmin: Access = ({ req: { user } }) => hasRole(user as MaybeUser, 'admin')
export const canEdit: Access = ({ req: { user } }) => hasRole(user as MaybeUser, 'admin', 'editor')
export const canReview: Access = ({ req: { user } }) =>
  hasRole(user as MaybeUser, 'admin', 'editor', 'peninjau')

/** Publik hanya melihat dokumen berstatus terbit; pengguna admin melihat semua. */
export const publishedOrLoggedIn: Access = ({ req: { user } }) =>
  user ? true : { _status: { equals: 'published' } }
