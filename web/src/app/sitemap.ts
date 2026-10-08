import type { MetadataRoute } from 'next'
import { getPosts, getSettings } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const [posts, settings] = await Promise.all([getPosts(500), getSettings()])
  const latest = [settings.updatedAt, ...posts.map((p) => p.updatedAt)].filter((d): d is string => !!d).sort().at(-1)
  return [
    { url: `${base}/`, lastModified: latest, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/kabar`, lastModified: posts[0]?.updatedAt, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/kebijakan-privasi`, changeFrequency: 'yearly', priority: 0.3 },
    ...posts.map((p) => ({ url: `${base}/kabar/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
  ]
}
