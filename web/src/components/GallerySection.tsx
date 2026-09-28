'use client'
import { useCallback, useEffect, useState } from 'react'
import { Icon } from './Icon'

export type GalleryItem = { id: number; src: string; full: string; alt: string; caption: string; album: string; albumLabel: string }

export function GallerySection({ items }: { items: GalleryItem[] }) {
  const albums = ['Semua', ...Array.from(new Set(items.map((i) => i.albumLabel)))]
  const [album, setAlbum] = useState('Semua')
  const [idx, setIdx] = useState<number | null>(null)
  const view = items.filter((i) => album === 'Semua' || i.albumLabel === album)

  const close = useCallback(() => setIdx(null), [])
  const step = useCallback((d: number) => setIdx((i) => (i === null ? i : (i + d + view.length) % view.length)), [view.length])

  useEffect(() => {
    if (idx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [idx, close, step])

  const sizeClass = (i: number) => (album !== 'Semua' ? '' : i % 7 === 0 ? 'w2 h2' : i % 7 === 3 ? 'h2' : i % 7 === 4 ? 'w2' : '')
  const cur = idx !== null ? view[idx] : null

  return (
    <>
      {albums.length > 2 && (
        <div className="tabs" role="group" aria-label="Filter album" style={{ marginBottom: 20 }}>
          {albums.map((a) => (
            <button key={a} type="button" className="chip" aria-pressed={a === album} onClick={() => setAlbum(a)}>
              {a}
            </button>
          ))}
        </div>
      )}
      <div className="gal-grid">
        {view.map((g, i) => (
          <button key={g.id} type="button" className={`gi ${sizeClass(i)}`} onClick={() => setIdx(i)} aria-label={`Perbesar foto: ${g.caption}`}>
            <figure style={{ margin: 0, height: '100%' }}>
              <img src={g.src} alt={g.alt} loading="lazy" />
              <figcaption>
                {g.caption}
                <small>{g.albumLabel}</small>
              </figcaption>
            </figure>
          </button>
        ))}
      </div>
      {cur && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Pratinjau foto" onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="lb-top">
            <span className="mono">
              {idx! + 1} / {view.length}
            </span>
            <button type="button" className="icon-btn" onClick={close} aria-label="Tutup" autoFocus>
              <Icon name="x" />
            </button>
          </div>
          <div className="lb-stage">
            <img src={cur.full} alt={cur.alt} />
          </div>
          <div>
            <div className="lb-cap">
              <b>{cur.caption}</b>
              <span>{cur.albumLabel}</span>
            </div>
            {view.length > 1 && (
              <div className="lb-nav">
                <button type="button" className="icon-btn" onClick={() => step(-1)} aria-label="Foto sebelumnya">
                  <Icon name="chev-l" />
                </button>
                <button type="button" className="icon-btn" onClick={() => step(1)} aria-label="Foto berikutnya">
                  <Icon name="chev-r" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
