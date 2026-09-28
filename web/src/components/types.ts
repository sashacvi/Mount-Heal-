export type HoursRow = { day: string; open: string; close: string; closed?: boolean | null }
export type ScheduleRow = { day: string; start: string; end: string }
export type StaffLite = {
  id: number
  name: string
  category: string
  position?: string | null
  photoUrl?: string | null
  schedule: ScheduleRow[]
  scheduleNote?: string | null
}
export type PostLite = {
  id: number
  title: string
  slug: string
  type: 'berita' | 'artikel' | 'pengumuman'
  excerpt: string
  publishedAt: string
  coverUrl?: string | null
  coverAlt?: string | null
  reviewer?: string | null
  pinned?: boolean | null
}
