/**
 * Menarik rating & ulasan terbaru klinik dari Google Places API (New).
 *   GOOGLE_PLACES_API_KEY=... GOOGLE_PLACE_ID=... npm run sync:google-reviews
 *
 * - Google hanya mengembalikan maksimal 5 ulasan per permintaan.
 * - Ulasan baru disimpan dengan status "tidak ditampilkan"; admin memilih
 *   mana yang tampil di situs (menu Konten → Testimoni).
 * - Nama pengulas dan tautan ke ulasan asli wajib ditampilkan (sudah ditangani
 *   komponen testimoni) sesuai kebijakan atribusi Google Maps Platform.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const SCRIPT = 'sync'

// Bila koneksi database macet (mis. file SQLite sedang dikunci proses lain),
// Node dapat berhenti tanpa pesan. Pastikan kegagalan seperti itu terlihat.
let finished = false
process.on('beforeExit', () => {
  if (!finished) {
    console.error('[%s] Berhenti sebelum selesai. Pastikan tidak ada proses lain yang memakai database, lalu jalankan ulang.', SCRIPT)
    process.exitCode = 1
  }
})

const key = process.env.GOOGLE_PLACES_API_KEY
const placeId = process.env.GOOGLE_PLACE_ID
if (!key || !placeId) {
  console.error('Isi GOOGLE_PLACES_API_KEY dan GOOGLE_PLACE_ID di file .env terlebih dahulu.')
  process.exit(1)
}

type Review = {
  name: string
  rating: number
  publishTime?: string
  text?: { text: string }
  originalText?: { text: string }
  authorAttribution?: { displayName?: string; uri?: string }
  googleMapsUri?: string
}
type Place = { rating?: number; userRatingCount?: number; googleMapsUri?: string; reviews?: Review[] }

const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=id`, {
  headers: {
    'X-Goog-Api-Key': key,
    'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews',
  },
})
if (!res.ok) {
  console.error(`Google Places API membalas ${res.status}: ${await res.text()}`)
  process.exit(1)
}
const place = (await res.json()) as Place
const payload = await getPayload({ config })

let added = 0
for (const r of place.reviews ?? []) {
  const text = (r.originalText?.text || r.text?.text || '').trim()
  if (!text) continue
  const existing = await payload.find({ collection: 'testimonials', where: { googleReviewId: { equals: r.name } }, limit: 1 })
  const data = {
    format: 'teks' as const,
    authorName: r.authorAttribution?.displayName || 'Pengguna Google',
    rating: r.rating,
    text,
    source: 'google' as const,
    reviewUrl: r.googleMapsUri || r.authorAttribution?.uri || place.googleMapsUri,
    reviewDate: r.publishTime,
    googleReviewId: r.name,
  }
  if (existing.docs[0]) {
    await payload.update({ collection: 'testimonials', id: existing.docs[0].id, data })
  } else {
    await payload.create({ collection: 'testimonials', data: { ...data, show: false } })
    added++
  }
}

await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    googleRating: place.rating,
    googleReviewCount: place.userRatingCount,
    googleReviewsUrl: place.googleMapsUri,
    googleSyncedAt: new Date().toISOString(),
  },
})
payload.logger.info(`Rating ${place.rating ?? '-'} dari ${place.userRatingCount ?? 0} ulasan. ${added} ulasan baru menunggu persetujuan.`)
finished = true
process.exit(0)
