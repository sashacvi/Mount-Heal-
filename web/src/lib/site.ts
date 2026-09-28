import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'
import type { Faq, Gallery, Media, Partner, Post, Service, SiteSetting, Staff, Testimonial } from '../payload-types'

export const getClient = cache(() => getPayload({ config }))

/** Nilai cadangan agar situs tetap tampil walau Pengaturan Situs belum lengkap. */
const SETTINGS_FALLBACK = {
  clinicName: 'Klinik Mustika Sekar Taji',
  tagline: 'Pelayanan kesehatan untuk keluarga di Kintamani.',
  intro: '',
  about: '',
  address: 'Kintamani, Bangli, Bali',
  mapsUrl: 'https://maps.app.goo.gl/LAKbhRadhn4KddM16',
  latitude: -8.290927,
  longitude: 115.278522,
  whatsapp: '087864114866',
  hours: [],
}

export const getSettings = cache(async (): Promise<SiteSetting> => {
  const payload = await getClient()
  const doc = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const filled = Object.fromEntries(Object.entries(doc).filter(([, v]) => v !== null && v !== undefined && v !== ''))
  return { ...SETTINGS_FALLBACK, ...filled } as unknown as SiteSetting
})

const published = () => ({
  and: [{ _status: { equals: 'published' } }, { publishedAt: { less_than_equal: new Date().toISOString() } }],
})

export const getPosts = cache(async (limit = 24): Promise<Post[]> => {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'posts',
    where: published() as never,
    sort: '-publishedAt',
    limit,
    depth: 1,
    overrideAccess: false,
  })
  return res.docs
})

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'posts',
    where: { and: [{ slug: { equals: slug } }, published()] } as never,
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })
  return res.docs[0] ?? null
})

export const getHomeData = cache(async () => {
  const payload = await getClient()
  const shown = { show: { equals: true } }
  const [settings, services, staff, posts, gallery, testimonials, partners, faqs] = await Promise.all([
    getSettings(),
    payload.find({ collection: 'services', where: shown, sort: 'order', limit: 50, depth: 0 }),
    payload.find({ collection: 'staff', where: shown, sort: 'order', limit: 100, depth: 1 }),
    getPosts(12),
    payload.find({ collection: 'gallery', where: shown, sort: 'order', limit: 48, depth: 1 }),
    payload.find({ collection: 'testimonials', where: shown, sort: '-reviewDate', limit: 24, depth: 0 }),
    payload.find({ collection: 'partners', where: shown, sort: 'order', limit: 50, depth: 1 }),
    payload.find({ collection: 'faqs', where: shown, sort: 'order', limit: 50, depth: 0 }),
  ])
  return {
    settings,
    services: services.docs as Service[],
    staff: staff.docs as Staff[],
    posts,
    gallery: gallery.docs as Gallery[],
    testimonials: testimonials.docs as Testimonial[],
    partners: partners.docs as Partner[],
    faqs: faqs.docs as Faq[],
  }
})

export const media = (m: unknown): Media | null => (m && typeof m === 'object' ? (m as Media) : null)
export const imgUrl = (m: Media | null, size?: keyof NonNullable<Media['sizes']>) =>
  (size && m?.sizes?.[size]?.url) || m?.url || null

/** Pengumuman yang disematkan dan belum kedaluwarsa. */
export const activeAnnouncements = (posts: Post[]) => {
  const ymd = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Makassar' }).format(d)
  const today = ymd(new Date())
  // Pengumuman tetap tampil sampai akhir tanggal kedaluwarsa (WITA).
  return posts.filter(
    (p) => p.type === 'pengumuman' && p.pinned && (!p.expiresAt || ymd(new Date(p.expiresAt)) >= today),
  )
}
