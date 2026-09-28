/**
 * Mengimpor foto personel & galeri dari folder seed-assets/ (tidak masuk git).
 *   npm run import:photos            (lewati staf yang sudah punya foto)
 *   FORCE=1 npm run import:photos   (ganti foto yang sudah ada)
 *
 * seed-assets/manifest.json — contoh: seed-assets/manifest.example.json
 */
import fs from 'fs'
import path from 'path'
import config from '@payload-config'
import { getPayload } from 'payload'

type StaffPhoto = { file: string; name: string; alt?: string; focalX?: number; focalY?: number; zoom?: number }
type GalleryPhoto = { file: string; caption: string; album: 'fasilitas' | 'tim' | 'kegiatan'; alt?: string; focalX?: number; focalY?: number; order?: number }
type Manifest = { staff?: StaffPhoto[]; gallery?: GalleryPhoto[] }

let finished = false
process.on('beforeExit', () => {
  if (!finished) {
    console.error('[import-photos] Berhenti sebelum selesai. Pastikan database tidak dipakai proses lain, lalu jalankan ulang.')
    process.exitCode = 1
  }
})

const dir = path.resolve(process.cwd(), 'seed-assets')
const manifestPath = path.join(dir, 'manifest.json')
if (!fs.existsSync(manifestPath)) {
  console.error(`Tidak menemukan ${manifestPath}. Salin manifest.example.json menjadi manifest.json lalu sesuaikan.`)
  process.exit(1)
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Manifest
// `payload run` tidak meneruskan argumen tambahan, jadi pakai variabel lingkungan FORCE=1.
const force = process.env.FORCE === '1' || process.argv.includes('--force')
const payload = await getPayload({ config })

async function upload(file: string, alt: string, focalX?: number, focalY?: number) {
  const filePath = path.join(dir, file)
  if (!fs.existsSync(filePath)) throw new Error(`Berkas tidak ditemukan: ${filePath}`)
  const doc = await payload.create({
    collection: 'media',
    data: { alt, ...(focalX != null ? { focalX } : {}), ...(focalY != null ? { focalY } : {}) },
    filePath,
  })
  return doc.id
}

for (const s of manifest.staff ?? []) {
  const found = await payload.find({ collection: 'staff', where: { name: { equals: s.name } }, limit: 1, depth: 0 })
  const staff = found.docs[0]
  if (!staff) {
    console.warn(`[staf] "${s.name}" tidak ada di data Dokter & Tenaga Kesehatan — dilewati.`)
    continue
  }
  if (staff.photo && !force) {
    console.log(`[staf] ${s.name}: sudah punya foto — dilewati (jalankan dengan FORCE=1 untuk mengganti).`)
    continue
  }
  const id = await upload(s.file, s.alt ?? `Foto ${s.name}`, s.focalX, s.focalY)
  await payload.update({ collection: 'staff', id: staff.id, data: { photo: id, ...(s.zoom ? { photoZoom: s.zoom } : {}) } })
  console.log(`[staf] ${s.name}: foto terpasang.`)
}

for (const [i, g] of (manifest.gallery ?? []).entries()) {
  const exists = await payload.find({ collection: 'gallery', where: { caption: { equals: g.caption } }, limit: 1, depth: 0 })
  if (exists.docs[0] && !force) {
    console.log(`[galeri] "${g.caption}" sudah ada — dilewati.`)
    continue
  }
  const id = await upload(g.file, g.alt ?? g.caption, g.focalX, g.focalY)
  const data = { image: id, caption: g.caption, album: g.album, order: g.order ?? (i + 1) * 10, show: true }
  if (exists.docs[0]) await payload.update({ collection: 'gallery', id: exists.docs[0].id, data })
  else await payload.create({ collection: 'gallery', data })
  console.log(`[galeri] ${g.caption}: ditambahkan.`)
}

console.log('[import-photos] selesai')
finished = true
process.exit(0)
