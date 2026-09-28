'use client'
import { useRef } from 'react'
import { fmtDate } from '@/lib/format'
import { Icon, Stars } from './Icon'

export type TestimonialLite = {
  id: number
  authorName: string
  rating: number
  text: string
  source: 'google' | 'langsung'
  reviewUrl?: string | null
  reviewDate?: string | null
  service?: string | null
}

const COLORS = ['#722975', '#0B7CC2', '#C21A74', '#082DF7']

export function TestimonialsCarousel({ items }: { items: TestimonialLite[] }) {
  const track = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.9, behavior: 'smooth' })
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
        {items.map((t, i) => (
          <figure className="tcard" key={t.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Stars value={t.rating} />
              {t.source === 'google' ? (
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
              ) : (
                <span className="verified">
                  <Icon name="check" />
                  Pasien klinik
                </span>
              )}
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
        ))}
      </div>
    </>
  )
}
