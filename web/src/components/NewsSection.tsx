'use client'
import Link from 'next/link'
import { useState } from 'react'
import { fmtDate } from '@/lib/format'
import type { PostLite } from './types'

const TYPES = [
  ['semua', 'Semua'],
  ['berita', 'Berita'],
  ['artikel', 'Artikel'],
  ['pengumuman', 'Pengumuman'],
] as const
export const TYPE_LABEL = { berita: 'Berita', artikel: 'Artikel', pengumuman: 'Pengumuman' } as const

export function PostCard({ p, feature = false }: { p: PostLite; feature?: boolean }) {
  return (
    <Link className={`post${feature ? ' feature' : ''}`} href={`/kabar/${p.slug}`}>
      <div className="cover">
        {p.coverUrl ? (
          <img src={p.coverUrl} alt={p.coverAlt ?? ''} loading="lazy" />
        ) : (
          <div className="ph">
            <img src="/brand/logo-mark.svg" alt="" />
          </div>
        )}
        {p.pinned && p.type === 'pengumuman' && <span className="tag tag-pengumuman pin">Disematkan</span>}
      </div>
      <div className="body">
        <span className={`tag tag-${p.type}`} style={{ alignSelf: 'flex-start' }}>
          {TYPE_LABEL[p.type]}
        </span>
        <h3>{p.title}</h3>
        <p>{p.excerpt}</p>
        <div className="meta">
          <span>{fmtDate(p.publishedAt)}</span>
          {p.reviewer && <span>Ditinjau {p.reviewer}</span>}
        </div>
      </div>
    </Link>
  )
}

export function NewsSection({ posts }: { posts: PostLite[] }) {
  const [type, setType] = useState<(typeof TYPES)[number][0]>('semua')
  const list = posts.filter((p) => type === 'semua' || p.type === type).slice(0, 5)
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Kategori kabar" style={{ marginBottom: 20 }}>
        {TYPES.map(([k, l]) => (
          <button key={k} type="button" role="tab" className="chip" aria-selected={k === type} onClick={() => setType(k)}>
            {l}
          </button>
        ))}
      </div>
      {/* Tata letak mosaik hanya bila 5 kartu terisi; selain itu grid rata. */}
      <div className={list.length >= 5 ? 'news-grid' : 'news-list'} role="tabpanel">
        {list.length === 0 && <div className="empty">Belum ada kabar di kategori ini.</div>}
        {list.map((p, i) => (
          <PostCard key={p.id} p={p} feature={i === 0 && list.length >= 5} />
        ))}
      </div>
    </>
  )
}
