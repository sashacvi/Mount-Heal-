import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  // /api/media/file/ tetap boleh dirambah agar foto klinik bisa muncul di Google Gambar dan pratinjau tautan.
  return { rules: [{ userAgent: '*', allow: ['/', '/api/media/file/'], disallow: ['/admin', '/api'] }], sitemap: `${base}/sitemap.xml` }
}
