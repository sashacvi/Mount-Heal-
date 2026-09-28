/**
 * Mengisi data awal Klinik Mustika Sekar Taji.
 * Jalankan: npm run seed            (lewati bila data sudah ada)
 *           FORCE=1 npm run seed   (hapus & isi ulang data awal)
 */
import config from '@payload-config'
import { getPayload } from 'payload'
import { seedClinic } from '../seed/clinic'

const SCRIPT = 'seed'

// Bila koneksi database macet (mis. file SQLite sedang dikunci proses lain),
// Node dapat berhenti tanpa pesan. Pastikan kegagalan seperti itu terlihat.
let finished = false
process.on('beforeExit', () => {
  if (!finished) {
    console.error('[%s] Berhenti sebelum selesai. Pastikan tidak ada proses lain yang memakai database, lalu jalankan ulang.', SCRIPT)
    process.exitCode = 1
  }
})

// `payload run` tidak meneruskan argumen tambahan, jadi pakai variabel lingkungan FORCE=1.
const force = process.env.FORCE === '1' || process.argv.includes('--force')
const payload = await getPayload({ config })

console.log('[seed] terhubung ke database')
const { totalDocs } = await payload.count({ collection: 'staff' })
if (totalDocs > 0 && !force) {
  payload.logger.info('Data sudah ada. Jalankan dengan FORCE=1 untuk mengisi ulang.')
  finished = true
  process.exit(0)
}
if (force) {
  for (const collection of ['posts', 'staff', 'services', 'partners', 'faqs'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } } })
  }
}

await seedClinic(payload)
finished = true
process.exit(0)
