'use client'
import { useEffect, useRef, useState } from 'react'
import { fmtDate } from '@/lib/format'
import { Icon, Stars } from './Icon'

export type TestimonialLite = {
  id: number
  format: 'screenshot' | 'teks'
  authorName: string
  rating?: number | null
  text?: string | null
  source: 'google' | 'langsung'
  reviewUrl?: string | null
  reviewDate?: string | null
  service?: string | null
  shot?: { src: string; full: string; alt: string; width?: number | null; height?: number | null } | null
}

const COLORS = ['#722975', '#0B7CC2', '#C21A74', '#082DF7']

function SourceBadge({ t }: { t: TestimonialLite }) {
  if (t.source === 'langsung') {
    return (
      <span className="verified">
        <Icon name="check" />
        Pasien klinik
      </span>
    )
  }
  return (
    <span className="src">
      Ulasan{' '}
      {t.reviewUrl ? (
        <a href={t.reviewUrl} target="_blank" rel="noopener nofollow">
          Google
        </a>
      ) : (
        'Google'
      )}
    </span>
  )
}

export function TestimonialsCarousel({ items }: { items: TestimonialLite[] }) {
  const track = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState<TestimonialLite | null>(null)
  const scroll = (dir: number) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.9, behavior: 'smooth' })

  useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(null)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [zoom])

  return (
    <>
      {items.length > 3 && (
        <div className="carousel-ctrl" style={{ justifyContent: 'flex-end', marginBottom: 12 }}>
          <button type="button" aria-label="Testimoni sebelumnya" onClick={() => scroll(-1)}>
            <Icon name="chev-l" />
          </button>
          <button type="button" aria-label="Testimoni berikutnya" onClick={() => scroll(1)}>
            <Icon name="chev-r" />
          </button>
        </div>
      )}
      <div className="testi-track" ref={track} tabIndex={0} aria-label="Daftar testimoni, geser untuk melihat lainnya">
        {items.map((t, i) =>
          t.format === 'screenshot' && t.shot ? (
            <figure className="tcard shot" key={t.id}>
              <button type="button" className="shot-btn" onClick={() => setZoom(t)} aria-label={`Perbesar ulasan dari ${t.authorName}`}>
                <img src={t.shot.src} alt={t.shot.alt} width={t.shot.width ?? undefined} height={t.shot.height ?? undefined} loading="lazy" />
              </button>
              {t.text && <blockquote className="sr-only">{t.text}</blockquote>}
              <figcaption>
                <span>
                  <b>{t.authorName}</b>
                  <small>{t.reviewDate ? fmtDate(t.reviewDate, { month: 'long', year: 'numeric' }) : 'Ulasan pasien'}</small>
                </span>
                <SourceBadge t={t} />
              </figcaption>
            </figure>
          ) : (
            <figure className="tcard" key={t.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {t.rating ? <Stars value={t.rating} /> : <span />}
                <SourceBadge t={t} />
              </div>
              <blockquote>“{t.text}”</blockquote>
              <figcaption>
                <span className="avatar" style={{ background: COLORS[i % COLORS.length] }} aria-hidden="true">
                  {t.authorName.trim()[0]?.toUpperCase()}
                </span>
                <span>
                  <b>{t.authorName}</b>
                  <small>{[t.service, t.reviewDate ? fmtDate(t.reviewDate, { month: 'long', year: 'numeric' }) : null].filter(Boolean).join(' · ')}</small>
                </span>
              </figcaption>
            </figure>
          ),
        )}
      </div>
      {zoom?.shot && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Ulasan dari ${zoom.authorName}`} onClick={(e) => e.target === e.currentTarget && setZoom(null)}>
          <div className="lb-top">
            <span>Ulasan dari {zoom.authorName}</span>
            <button type="button" className="icon-btn" onClick={() => setZoom(null)} aria-label="Tutup" autoFocus>
              <Icon name="x" />
            </button>
          </div>
          <div className="lb-stage" onClick={(e) => e.target === e.currentTarget && setZoom(null)}>
            <img src={zoom.shot.full} alt={zoom.shot.alt} />
          </div>
          <div className="lb-cap">
            {zoom.reviewUrl && (
              <a className="btn btn-ghost btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)' }} href={zoom.reviewUrl} target="_blank" rel="noopener nofollow">
                Buka di Google
              </a>
            )}
          </div>
        </div>
      )}
    </>
  )
}
