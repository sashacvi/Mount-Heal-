import type { Faq, Media, Post, Service, SiteSetting, Staff } from '@/payload-types'
import { fmtRange, waNumber } from './format'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
export const absUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`)

const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** Teks multi-baris dari admin → daftar (baris kosong diabaikan). */
export const lines = (t?: string | null) => (t ?? '').split('\n').map((s) => s.trim()).filter(Boolean)

/** Nomor lokal (08xx) → format internasional +628xx untuk data terstruktur. */
export const e164 = (n?: string | null) => (n ? `+${waNumber(n)}` : undefined)

/** Potong di batas kata agar tidak terpotong di tengah kata. */
const clip = (t: string, max: number) => (t.length <= max ? t : `${t.slice(0, t.lastIndexOf(' ', max - 1))}…`)

/**
 * Alamat bebas dari admin → bagian-bagian PostalAddress.
 * "Jalan Raya Desa Lembean, Lembean, Kec. Kintamani\nKabupaten Bangli, Bali 80652"
 * → jalan "Jalan Raya Desa Lembean", lokalitas "Lembean, Kec. Kintamani, Kabupaten Bangli", kode pos "80652".
 */
export function postalAddress(address: string) {
  const postalCode = address.match(/\b\d{5}\b/)?.[0]
  const parts = address
    .split(/[\n,]/)
    .map((s) => s.replace(/\b\d{5}\b/, '').trim())
    .filter((s) => s && !/^bali$/i.test(s))
  return {
    '@type': 'PostalAddress',
    streetAddress: parts[0],
    addressLocality: parts.slice(1).join(', ') || undefined,
    addressRegion: /\bbali\b/i.test(address) ? 'Bali' : undefined,
    postalCode,
    addressCountry: 'ID',
  }
}

/** Nama desa/kecamatan pertama dari alamat untuk teks pendek, mis. "Lembean, Kintamani". */
const shortPlace = (address: string) => {
  const parts = postalAddress(address)
  return [parts.addressLocality?.split(',')[0], 'Kintamani', 'Bangli']
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .join(', ')
}

export function homeTitle(s: SiteSetting) {
  return s.seoTitle?.trim() || `${s.clinicName} – Klinik di Kintamani, Bangli`
}

/** Deskripsi beranda: dari admin, atau disusun otomatis dari data klinik (±160 karakter). */
export function homeDescription(s: SiteSetting, services: Pick<Service, 'name'>[]) {
  if (s.seoDescription?.trim()) return s.seoDescription.trim()
  const hours = (s.hours ?? []) as { day: string; open?: string | null; close?: string | null; closed?: boolean | null }[]
  const open = hours.filter((h) => !h.closed)
  const daily = hours.length === 7 && open.length === 7 && open.every((h) => h.open === open[0].open && h.close === open[0].close)
  const former = lines(s.otherNames)[0]?.replace(/^klinik\s+/i, '')
  const team = s.team ?? {}
  const offer = [team.doctors && 'dokter umum', team.dentists && 'dokter gigi', team.midwives && 'bidan', (team.pharmacists || team.pharmacyAssistants) && 'apotek']
    .filter(Boolean)
    .join(', ')
    .replace(/, ([^,]*)$/, ' & $1')
  const text = [
    `Klinik di ${shortPlace(s.address)}${former ? ` (dulu ${former})` : ''}.`,
    offer ? `${offer.charAt(0).toUpperCase()}${offer.slice(1)}.` : services.slice(0, 4).map((x) => x.name).join(', ') + '.',
    daily ? `Buka tiap hari ${fmtRange(open[0].open, open[0].close)} WITA.` : '',
    s.insurance ? `Melayani ${s.insurance}.` : '',
  ]
    .filter(Boolean)
    .join(' ')
  return clip(text, 165)
}

type ImageLike = Media | null | undefined

/** Data terstruktur beranda: klinik (MedicalClinic), situs (WebSite), dan FAQ. */
export function homeJsonLd(opts: {
  settings: SiteSetting
  services: Service[]
  staff: Staff[]
  faqs: Faq[]
  images: ImageLike[]
  imgUrl: (m: ImageLike) => string | null
}) {
  const { settings: s, services, staff, faqs, images, imgUrl } = opts
  const hours = (s.hours ?? []) as { day: string; open?: string | null; close?: string | null; closed?: boolean | null }[]
  const clinicId = `${SITE_URL}/#klinik`
  const otherNames = lines(s.otherNames)
  const photos = images.map((m) => imgUrl(m)).filter((u): u is string => !!u).slice(0, 6).map(absUrl)
  const doctors = staff.filter((p) => p.category === 'dokter' || p.category === 'dokter-gigi')

  const clinic = {
    '@type': 'MedicalClinic',
    '@id': clinicId,
    name: s.clinicName,
    alternateName: otherNames.length ? otherNames : undefined,
    description: s.intro,
    url: `${SITE_URL}/`,
    logo: absUrl('/brand/logo-full.svg'),
    image: [absUrl('/og.png'), ...photos],
    telephone: e164(s.phone || s.whatsapp),
    email: s.email || undefined,
    address: postalAddress(s.address),
    geo: { '@type': 'GeoCoordinates', latitude: s.latitude, longitude: s.longitude },
    hasMap: s.mapsUrl,
    sameAs: [s.mapsUrl, s.googleReviewsUrl, ...(s.socials ?? []).map((x) => x.url)].filter((u, i, a): u is string => !!u && a.indexOf(u) === i),
    areaServed: lines(s.serviceArea).map((name) => ({ '@type': 'AdministrativeArea', name })),
    foundingDate: s.foundedYear ? String(s.foundedYear) : undefined,
    medicalSpecialty: ['PrimaryCare', ...(doctors.some((d) => d.category === 'dokter-gigi') ? ['Dentistry'] : [])],
    isAcceptingNewPatients: true,
    paymentAccepted: ['Tunai', s.insurance].filter(Boolean).join(', '),
    openingHoursSpecification: hours
      .filter((h) => !h.closed && h.open && h.close)
      .map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: DAYS_EN[Number(h.day)], opens: h.open, closes: h.close })),
    availableService: services.map((x) => ({ '@type': 'MedicalProcedure', name: x.name, description: x.summary || undefined })),
    employee: doctors.map((d) => ({ '@type': 'Person', name: d.name, jobTitle: d.position || undefined })),
    // Sengaja tanpa aggregateRating: Google tidak menampilkan rating yang dipasang usaha di situsnya sendiri
    // (self-serving review) dan bisa menganggapnya pelanggaran. Rating tampil dari Google Business Profile.
  }

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: s.clinicName,
    alternateName: otherNames.length ? otherNames : undefined,
    inLanguage: 'id-ID',
    publisher: { '@id': clinicId },
  }

  const faq = faqs.length
    ? {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }
    : undefined

  return { '@context': 'https://schema.org', '@graph': [clinic, website, faq].filter(Boolean) }
}

/** Data terstruktur halaman kabar: artikel + breadcrumb. Artikel kesehatan mencantumkan peninjau medisnya. */
export function postJsonLd(post: Post, clinicName: string, cover: string | null, authorName?: string | null) {
  const url = `${SITE_URL}/kabar/${post.slug}`
  const reviewer = typeof post.medicalReviewer === 'object' && post.medicalReviewer ? post.medicalReviewer : null
  const isHealth = post.type === 'artikel'
  const article = {
    '@type': isHealth ? 'MedicalWebPage' : 'NewsArticle',
    '@id': `${url}#artikel`,
    url,
    headline: post.title,
    name: post.title,
    description: post.excerpt || undefined,
    image: [absUrl(cover || '/og.png')],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: 'id-ID',
    author: authorName ? { '@type': 'Person', name: authorName } : { '@type': 'Organization', name: clinicName, url: `${SITE_URL}/` },
    publisher: { '@id': `${SITE_URL}/#klinik` },
    ...(isHealth && reviewer ? { reviewedBy: { '@type': 'Person', name: reviewer.name, jobTitle: reviewer.position || undefined }, lastReviewed: post.updatedAt } : {}),
  }
  const crumbs = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Kabar Klinik', item: `${SITE_URL}/kabar` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  }
  return { '@context': 'https://schema.org', '@graph': [article, crumbs] }
}

/** JSON aman untuk <script type="application/ld+json"> (mencegah teks "</script>" menutup tag). */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')
