import type { ReactNode } from 'react'
import { ClinicStatus } from '@/components/ClinicStatus'
import { CopyButton } from '@/components/CopyButton'
import { GallerySection, type GalleryItem } from '@/components/GallerySection'
import { Icon, Stars, type IconName } from '@/components/Icon'
import { LocationMap } from '@/components/LocationMap'
import { NewsSection } from '@/components/NewsSection'
import { RegisterButton } from '@/components/RegisterButton'
import { ScheduleSection } from '@/components/ScheduleSection'
import { TestimonialsCarousel } from '@/components/TestimonialsCarousel'
import type { HoursRow } from '@/components/types'
import { DAY_NAMES, WEEK_ORDER, fmtPhone, fmtRange, nowInClinic, waLink } from '@/lib/format'
import { getHomeData, imgUrl, media } from '@/lib/site'
import { toPostLite, toStaffLite } from '@/lib/view'
import Link from 'next/link'

/** Teks di antara *bintang* diberi sorotan kuning. */
function highlight(text: string): ReactNode[] {
  return text.split(/\*(.+?)\*/g).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part))
}

const ALBUM_LABEL = { fasilitas: 'Fasilitas', tim: 'Tim', kegiatan: 'Kegiatan' } as const
const PARTNER_COLORS = ['#722975', '#0B7CC2', '#C21A74', '#082DF7']
const abbr = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export default async function HomePage() {
  const { settings, services, staff, posts, gallery, testimonials, partners, faqs } = await getHomeData()
  const hours = (settings.hours ?? []) as HoursRow[]
  const staffLite = staff.map(toStaffLite)
  const doctors = staffLite.filter((s) => s.category === 'dokter' || s.category === 'dokter-gigi')
  const midwives = staffLite.filter((s) => s.category === 'bidan')
  const pharmacy = staffLite.filter((s) => s.category === 'apoteker' || s.category === 'asisten-apoteker')
  const midwifeNote = midwives[0]?.scheduleNote ?? undefined
  const team = settings.team ?? {}
  const today = nowInClinic().day
  const sameHours = hours.length === 7 && hours.every((h) => !h.closed && h.open === hours[0].open && h.close === hours[0].close)
  const address = settings.address.replace(/\n/g, ', ')
  const embedKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY || undefined

  const galleryItems: GalleryItem[] = gallery.flatMap((g) => {
    const m = media(g.image)
    const src = imgUrl(m, 'square')
    if (!src) return []
    return [{ id: g.id, src, full: imgUrl(m, 'large') ?? src, alt: m?.alt || g.caption, caption: g.caption, album: g.album, albumLabel: ALBUM_LABEL[g.album] }]
  })

  const stats = [
    settings.foundedYear && { v: String(settings.foundedYear), l: 'tahun berdiri' },
    settings.accreditation && { v: settings.accreditation, l: 'status akreditasi' },
    team.doctors && { v: String(team.doctors), l: 'dokter' },
    team.midwives && { v: String(team.midwives), l: 'bidan' },
    team.nurses && { v: String(team.nurses), l: 'perawat' },
    (team.pharmacists || team.pharmacyAssistants) && {
      v: String((team.pharmacists ?? 0) + (team.pharmacyAssistants ?? 0)),
      l: `tim farmasi (${team.pharmacists ?? 0} apoteker, ${team.pharmacyAssistants ?? 0} asisten)`,
    },
  ].filter(Boolean) as { v: string; l: string }[]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: settings.clinicName,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/brand/logo-full.svg`,
    telephone: settings.phone || settings.whatsapp,
    address: { '@type': 'PostalAddress', streetAddress: address, addressRegion: 'Bali', addressCountry: 'ID' },
    geo: { '@type': 'GeoCoordinates', latitude: settings.latitude, longitude: settings.longitude },
    hasMap: settings.mapsUrl,
    foundingDate: settings.foundedYear ? String(settings.foundedYear) : undefined,
    medicalSpecialty: 'PrimaryCare',
    openingHoursSpecification: hours
      .filter((h) => !h.closed)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][Number(h.day)],
        opens: h.open,
        closes: h.close,
      })),
    availableService: services.map((s) => ({ '@type': 'MedicalProcedure', name: s.name })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ============ HERO ============ */}
      <section className="hero" id="beranda">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">Kintamani · Bangli · Bali</span>
            <h1 style={{ marginTop: 16 }}>{highlight(settings.tagline)}</h1>
            <p className="sub">{settings.intro}</p>
            <div className="hero-cta">
              <RegisterButton className="btn btn-lemon">
                <Icon name="calendar" />
                Daftar Berobat
              </RegisterButton>
              <a className="btn btn-ghost" href="#dokter">
                <Icon name="stetho" />
                Lihat Jadwal Dokter
              </a>
            </div>
            <div className="hero-meta">
              {settings.accreditation && (
                <span>
                  <Icon name="award" />
                  Terakreditasi {settings.accreditation}
                </span>
              )}
              {settings.insurance && (
                <span>
                  <Icon name="shield" />
                  Menerima {settings.insurance}
                </span>
              )}
              {sameHours && (
                <span>
                  <Icon name="clock" />
                  Setiap hari {fmtRange(hours[0].open, hours[0].close)} WITA
                </span>
              )}
            </div>
          </div>
          <ClinicStatus hours={hours} staff={doctors} whatsapp={settings.whatsapp} midwifeOnDuty={midwives.length > 0} />
        </div>
        <svg className="ridge" viewBox="0 0 1440 170" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="ridgeGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#0B7CC2" stopOpacity=".35" />
              <stop offset=".5" stopColor="#082DF7" />
              <stop offset="1" stopColor="#0B7CC2" stopOpacity=".35" />
            </linearGradient>
          </defs>
          <path className="r1" d="M-20 160 C 220 150, 380 120, 520 70 S 700 6, 760 10 S 900 60, 1040 110 S 1300 150, 1460 152" />
          <path className="r2" d="M790 34 C 870 38, 930 80, 1030 124 S 1280 160, 1460 162" />
        </svg>
      </section>

      {/* ============ AKSI CEPAT ============ */}
      <div className="wrap quick" id="daftar-cepat">
        <div className="quick-grid">
          <RegisterButton className="qa">
            <span className="bubble b-plum"><Icon name="calendar" /></span>
            <span><b>Daftar Berobat</b><small>Lewat WhatsApp</small></span>
          </RegisterButton>
          <a className="qa" href="#dokter"><span className="bubble b-pink"><Icon name="stetho" /></span><span><b>Jadwal Dokter</b><small>Pilih hari praktik</small></span></a>
          <a className="qa" href="#layanan"><span className="bubble b-blue"><Icon name="clipboard" /></span><span><b>Layanan</b><small>{services.length} poli & layanan</small></span></a>
          <a className="qa" href="#faq"><span className="bubble b-ocean"><Icon name="shield" /></span><span><b>BPJS Kesehatan</b><small>Syarat & alur</small></span></a>
          <a className="qa" href="#lokasi"><span className="bubble b-amber"><Icon name="pin" /></span><span><b>Lokasi</b><small>Petunjuk arah</small></span></a>
        </div>
      </div>

      {/* ============ LAYANAN ============ */}
      <section className="sec" id="layanan">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Layanan</span>
              <h2 className="h2">Layanan kesehatan untuk seluruh keluarga</h2>
              <p className="lead">
                Melayani pasien {(settings.serviceModes || 'Umum dan BPJS').replace(/^./, (c) => c.toLowerCase())}. Tanyakan ketersediaan layanan melalui WhatsApp sebelum datang.
              </p>
            </div>
          </div>
          <div className="svc-grid">
            {services.map((s, i) => (
              <article className="svc" key={s.id}>
                <span className={`bubble ${['b-plum', 'b-pink', 'b-ocean', 'b-blue', 'b-amber'][i % 5]}`}>
                  <Icon name={s.icon as IconName} />
                </span>
                <h3>{s.name}</h3>
                <p>{s.summary}</p>
                {s.tags && s.tags.length > 0 && (
                  <ul>
                    {s.tags.map((t) => (
                      <li key={t.id ?? t.label}>{t.label}</li>
                    ))}
                  </ul>
                )}
                <RegisterButton className="btn btn-ghost btn-sm" service={s.name}>
                  Daftar {s.name} <Icon name="arrow" />
                </RegisterButton>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DOKTER & JADWAL ============ */}
      <section className="sec alt" id="dokter">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Dokter & jadwal praktik</span>
              <h2 className="h2">Pilih hari, lihat dokter yang praktik</h2>
              <p className="lead">Jadwal dapat berubah. Perubahan diumumkan di bilah pengumuman dan dapat dikonfirmasi lewat WhatsApp.</p>
            </div>
          </div>
          <ScheduleSection doctors={doctors} />
          <div className="doc-grid" id="tim" style={{ marginTop: 16 }}>
            {midwives.length > 0 && (
              <article className="team-card">
                <span className="eyebrow">Bidan · KIA & KB</span>
                <h3>Bidan jaga setiap hari</h3>
                <ul>
                  {midwives.map((m) => (
                    <li key={m.id}>{m.name}</li>
                  ))}
                </ul>
                {midwifeNote && <small style={{ color: 'var(--muted)' }}>{midwifeNote}</small>}
              </article>
            )}
            {pharmacy.length > 0 && (
              <article className="team-card">
                <span className="eyebrow">Apotek / Farmasi</span>
                <h3>Tim farmasi</h3>
                <ul>
                  {pharmacy.map((m) => (
                    <li key={m.id}>
                      {m.name}
                      {m.position ? ` · ${m.position}` : ''}
                    </li>
                  ))}
                </ul>
                {team.pharmacyAssistants ? (
                  <small style={{ color: 'var(--muted)' }}>Didukung {team.pharmacyAssistants} asisten apoteker.</small>
                ) : null}
              </article>
            )}
            {team.nurses ? (
              <article className="team-card">
                <span className="eyebrow">Keperawatan</span>
                <h3>{team.nurses} perawat</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14.5 }}>Mendampingi dokter di poli, tindakan, dan layanan home care.</p>
              </article>
            ) : null}
          </div>
        </div>
      </section>

      {/* ============ TENTANG ============ */}
      <section className="sec" id="tentang">
        <div className="wrap about">
          <div className="about-art">
            <img src="/brand/logo-full.svg" alt={`Logo ${settings.clinicName}`} width={548} height={368} />
          </div>
          <div>
            <span className="eyebrow">Tentang kami</span>
            <h2 className="h2">{settings.clinicName}</h2>
            <p className="lead" style={{ whiteSpace: 'pre-line' }}>{settings.about}</p>
            {stats.length > 0 && (
              <div className="stats">
                {stats.map((s) => (
                  <div className="stat" key={s.l}>
                    <strong>{s.v}</strong>
                    <span>{s.l}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ KABAR ============ */}
      {posts.length > 0 && (
        <section className="sec alt" id="kabar">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow">Kabar klinik</span>
                <h2 className="h2">Berita, artikel kesehatan, dan pengumuman</h2>
                <p className="lead">Artikel kesehatan ditinjau oleh dokter klinik sebelum terbit.</p>
              </div>
              <Link className="btn btn-ghost" href="/kabar">
                Semua kabar <Icon name="arrow" />
              </Link>
            </div>
            <NewsSection posts={posts.map(toPostLite)} />
          </div>
        </section>
      )}

      {/* ============ GALERI ============ */}
      {galleryItems.length > 0 && (
        <section className="sec" id="galeri">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow">Galeri foto</span>
                <h2 className="h2">Fasilitas, tim, dan kegiatan kami</h2>
              </div>
            </div>
            <GallerySection items={galleryItems} />
          </div>
        </section>
      )}

      {/* ============ TESTIMONI ============ */}
      <section className="sec alt" id="testimoni">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Ulasan pasien</span>
              <h2 className="h2">Apa kata pasien kami</h2>
            </div>
          </div>
          {settings.googleRating ? (
            <div className="testi-head" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
              <div>
                <div className="score">
                  <strong>{settings.googleRating.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong>
                  <span>/ 5</span>
                </div>
                <Stars value={settings.googleRating} />
              </div>
              <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                Rating Google{settings.googleReviewCount ? ` dari ${settings.googleReviewCount.toLocaleString('id-ID')} ulasan` : ''}.
              </div>
              {settings.googleReviewsUrl && (
                <a className="btn btn-ghost btn-sm" href={settings.googleReviewsUrl} target="_blank" rel="noopener">
                  Lihat di Google
                </a>
              )}
            </div>
          ) : null}
          {testimonials.length > 0 ? (
            <TestimonialsCarousel
              items={testimonials.map((t) => ({
                id: t.id,
                authorName: t.authorName,
                rating: t.rating,
                text: t.text,
                source: t.source,
                reviewUrl: t.reviewUrl,
                reviewDate: t.reviewDate,
                service: t.service,
              }))}
            />
          ) : (
            <div className="review-cta">
              <span className="g" aria-hidden="true">G</span>
              <div>
                <b>Baca ulasan pasien di Google Maps</b>
                <p>Pernah berobat di {settings.clinicName}? Ulasan Anda membantu warga lain menemukan layanan kesehatan terdekat.</p>
              </div>
              <a className="btn btn-primary" href={settings.googleReviewsUrl || settings.mapsUrl} target="_blank" rel="noopener">
                Buka ulasan
              </a>
            </div>
          )}
          <p className="disclaimer">
            Ulasan menggambarkan pengalaman pribadi pasien terhadap pelayanan dan tidak menjamin hasil pengobatan yang sama.
          </p>
        </div>
      </section>

      {/* ============ MITRA ============ */}
      {partners.length > 0 && (
        <section className="partners" id="mitra" aria-labelledby="mitraTitle">
          <div className="wrap">
            <div>
              <h2 id="mitraTitle">Mitra kerja sama</h2>
              <p>Fasilitas kesehatan dan lembaga yang bekerja sama dengan klinik.</p>
            </div>
            <div className="marquee">
              <div className="marquee-track" style={partners.length < 5 ? { animation: 'none', flexWrap: 'wrap', width: 'auto' } : undefined}>
                {[...partners, ...(partners.length < 5 ? [] : partners)].map((p, i) => {
                  const logo = media(p.logo)
                  const dup = i >= partners.length
                  const inner = (
                    <>
                      {logo?.url ? (
                        <img src={logo.url} alt="" />
                      ) : (
                        <span className="mono-mark" style={{ background: PARTNER_COLORS[i % PARTNER_COLORS.length] }}>
                          {abbr(p.name)}
                        </span>
                      )}
                      <span>
                        <b>{p.name}</b>
                        <small>{({ puskesmas: 'Puskesmas', 'rumah-sakit': 'Rumah sakit', yayasan: 'Yayasan', asuransi: 'Asuransi', korporat: 'Perusahaan', lainnya: 'Mitra' } as const)[p.category]}</small>
                      </span>
                    </>
                  )
                  return p.url ? (
                    <a key={`${p.id}-${i}`} className={`logo${dup ? ' dup' : ''}`} href={p.url} target="_blank" rel="noopener" tabIndex={dup ? -1 : undefined} aria-hidden={dup || undefined}>
                      {inner}
                    </a>
                  ) : (
                    <span key={`${p.id}-${i}`} className={`logo${dup ? ' dup' : ''}`} aria-hidden={dup || undefined}>
                      {inner}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ LOKASI ============ */}
      <section className="sec" id="lokasi">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Lokasi & kontak</span>
              <h2 className="h2">Kunjungi kami di Kintamani</h2>
            </div>
          </div>
          <div className="loc">
            <div className="map-card">
              <LocationMap lat={settings.latitude} lng={settings.longitude} name={settings.clinicName} address={address} embedKey={embedKey} />
            </div>
            <div className="info-card">
              <div>
                <h3>Alamat</h3>
                <p className="addr" style={{ whiteSpace: 'pre-line' }}>{settings.address}</p>
              </div>
              <div className="row-btns">
                <a className="btn btn-primary btn-sm" href={settings.mapsUrl} target="_blank" rel="noopener">
                  <Icon name="nav" />
                  Petunjuk arah
                </a>
                <CopyButton text={address} />
              </div>
              <div>
                <h3>Jam operasional (WITA)</h3>
                <table className="hours">
                  <tbody>
                    {WEEK_ORDER.map((d) => {
                      const h = hours.find((x) => Number(x.day) === d)
                      return (
                        <tr key={d} className={d === today ? 'today' : undefined}>
                          <td>{DAY_NAMES[d]}</td>
                          <td>{!h || h.closed ? 'Tutup' : fmtRange(h.open, h.close)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {settings.hoursNote && <p className="disclaimer">{settings.hoursNote}</p>}
              </div>
              <div className="access">
                <div>
                  <Icon name="chat" />
                  <span>
                    WhatsApp{' '}
                    <a href={waLink(settings.whatsapp)} target="_blank" rel="noopener" style={{ fontWeight: 700 }}>
                      {fmtPhone(settings.whatsapp)}
                    </a>
                  </span>
                </div>
                {settings.phone && (
                  <div>
                    <Icon name="phone" />
                    <span>Telepon {settings.phone}</span>
                  </div>
                )}
                <div>
                  <Icon name="ambulance" />
                  <span>Keadaan gawat darurat: hubungi 119 (layanan gawat darurat nasional).</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      {faqs.length > 0 && (
        <section className="sec alt" id="faq">
          <div className="wrap faq-wrap">
            <div>
              <span className="eyebrow">Info pasien</span>
              <h2 className="h2">Pertanyaan yang sering diajukan</h2>
              <p className="lead">Belum menemukan jawaban? Tanyakan lewat WhatsApp pada jam operasional.</p>
            </div>
            <div className="faq">
              {faqs.map((f, i) => (
                <details key={f.id} open={i === 0}>
                  <summary>
                    {f.question}
                    <Icon name="plus" />
                  </summary>
                  <p style={{ whiteSpace: 'pre-line' }}>{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="wrap" style={{ marginTop: 'clamp(56px,8vw,96px)' }} id="daftar">
        <div className="cta">
          <div>
            <h2>Ingin berobat?</h2>
            <p>
              Kirim data pendaftaran lewat WhatsApp, lalu datang sesuai jadwal. Pasien BPJS Kesehatan cukup membawa KTP atau kartu JKN
              digital dari aplikasi Mobile JKN.
            </p>
          </div>
          <RegisterButton className="btn btn-lemon">
            <Icon name="calendar" />
            Daftar Berobat
          </RegisterButton>
        </div>
      </div>
    </>
  )
}
