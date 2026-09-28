import type { StaffLite, PostLite } from '@/components/types'
import type { Post, Staff } from '../payload-types'
import { imgUrl, media } from './site'

export const toStaffLite = (s: Staff): StaffLite => ({
  id: s.id,
  name: s.name,
  category: s.category,
  position: s.position,
  photoUrl: imgUrl(media(s.photo), 'square'),
  schedule: (s.schedule ?? []).map((r) => ({ day: r.day, start: r.start, end: r.end })),
  scheduleNote: s.scheduleNote,
})

export const toPostLite = (p: Post): PostLite => {
  const cover = media(p.cover)
  const reviewer = p.medicalReviewer && typeof p.medicalReviewer === 'object' ? p.medicalReviewer.name : null
  return {
    id: p.id,
    title: p.title,
    slug: p.slug ?? String(p.id),
    type: p.type,
    excerpt: p.excerpt,
    publishedAt: p.publishedAt,
    coverUrl: imgUrl(cover, 'card'),
    coverAlt: cover?.alt ?? '',
    reviewer,
    pinned: p.pinned,
  }
}
