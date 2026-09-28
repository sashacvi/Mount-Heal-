import type { MetadataRoute } from 'next'
import { getPosts } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const posts = await getPosts(500)
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/kabar`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/kebijakan-privasi`, changeFrequency: 'yearly', priority: 0.3 },
    ...posts.map((p) => ({ url: `${base}/kabar/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
  ]
}
