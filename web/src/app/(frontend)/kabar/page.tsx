import type { Metadata } from 'next'
import Link from 'next/link'
import { PostCard, TYPE_LABEL } from '@/components/NewsSection'
import { getPosts } from '@/lib/site'
import { toPostLite } from '@/lib/view'

export const metadata: Metadata = {
  title: 'Kabar Klinik',
  description: 'Berita, artikel kesehatan, dan pengumuman terbaru dari Klinik Mustika Sekar Taji.',
}

const TYPES = ['berita', 'artikel', 'pengumuman'] as const

export default async function KabarPage({ searchParams }: { searchParams: Promise<{ jenis?: string }> }) {
  const { jenis } = await searchParams
  const active = TYPES.find((t) => t === jenis)
  const posts = (await getPosts(100)).filter((p) => !active || p.type === active).map(toPostLite)

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Beranda</Link>
            <span aria-hidden="true">/</span>
            <span>Kabar Klinik</span>
          </nav>
          <span className="eyebrow" style={{ marginTop: 18 }}>Kabar klinik</span>
          <h1>{active ? TYPE_LABEL[active] : 'Berita, artikel, dan pengumuman'}</h1>
          <p>Informasi layanan, jadwal, dan edukasi kesehatan dari tim klinik.</p>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: 32 }}>
        <div className="wrap">
          <div className="tabs" style={{ marginBottom: 24 }}>
            <Link className="chip" href="/kabar" aria-current={!active ? 'page' : undefined} aria-pressed={!active}>
              Semua
            </Link>
            {TYPES.map((t) => (
              <Link key={t} className="chip" href={`/kabar?jenis=${t}`} aria-current={active === t ? 'page' : undefined} aria-pressed={active === t}>
                {TYPE_LABEL[t]}
              </Link>
            ))}
          </div>
          <div className="news-list">
            {posts.length === 0 && <div className="empty">Belum ada kabar di kategori ini.</div>}
            {posts.map((p) => (
              <PostCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
