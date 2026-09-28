'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Icon } from './Icon'

export function AnnouncementBar({ items }: { items: { title: string; slug: string }[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (items.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => {
      if (!document.hidden) setI((n) => (n + 1) % items.length)
    }, 7000)
    return () => clearInterval(t)
  }, [items.length])
  if (!items.length) return null
  const item = items[i % items.length]
  return (
    <div className="ticker" role="region" aria-label="Pengumuman klinik">
      <div className="wrap">
        <b>
          <Icon name="megaphone" />
          Pengumuman
        </b>
        <div className="ticker-msg" aria-live="polite">
          <Link href={`/kabar/${item.slug}`} style={{ color: 'inherit', textUnderlineOffset: 3 }}>
            {item.title}
          </Link>
        </div>
        {items.length > 1 && (
          <div className="ticker-nav">
            <button type="button" aria-label="Pengumuman sebelumnya" onClick={() => setI((n) => (n - 1 + items.length) % items.length)}>
              <Icon name="chev-l" />
            </button>
            <button type="button" aria-label="Pengumuman berikutnya" onClick={() => setI((n) => (n + 1) % items.length)}>
              <Icon name="chev-r" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
