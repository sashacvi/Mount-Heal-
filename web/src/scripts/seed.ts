/**
 * Mengisi data awal Klinik Mustika Sekar Taji.
 * Jalankan: npm run seed            (lewati bila data sudah ada)
 *           npm run seed -- --force (hapus & isi ulang data contoh)
 */
import config from '@payload-config'
import { getPayload } from 'payload'

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

const force = process.argv.includes('--force')
const payload = await getPayload({ config })

const rt = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      textFormat: 0,
      textStyle: '',
      children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
    })),
  },
})

const everyDay = ['1', '2', '3', '4', '5', '6', '0'] as const
const days = (list: readonly string[], start: string, end: string) =>
  list.map((day) => ({ day: day as '0' | '1' | '2' | '3' | '4' | '5' | '6', start, end }))

console.log('[seed] terhubung ke database')
const { totalDocs } = await payload.count({ collection: 'staff' })
if (totalDocs > 0 && !force) {
  payload.logger.info('Data sudah ada. Gunakan --force untuk mengisi ulang.')
  finished = true
  process.exit(0)
}
if (force) {
  for (const collection of ['posts', 'staff', 'services', 'partners', 'faqs'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } } })
  }
}

console.log('[seed] pengaturan situs')
await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    clinicName: 'Klinik Mustika Sekar Taji',
    tagline: 'Pelayanan kesehatan yang *dekat* untuk keluarga di Kintamani.',
    intro:
      'Poli umum, poli gigi, KIA & KB, laboratorium sederhana, apotek, medical check-up, dan home care. Melayani pasien umum dan BPJS Kesehatan setiap hari pukul 08.00–21.00 WITA.',
    about:
      'Klinik Mustika Sekar Taji (sebelumnya bernama Bintang Usada Bhakti) berdiri pada 2024 dan melayani masyarakat Lembean, Kintamani, serta sekitarnya, baik pasien umum maupun peserta BPJS Kesehatan. Klinik telah terakreditasi Utama.\n\nPelayanan didukung 2 dokter umum, 1 dokter gigi, 4 bidan, 6 perawat, serta tim farmasi yang terdiri atas 1 apoteker dan 2 asisten apoteker.',
    foundedYear: 2024,
    accreditation: 'Utama',
    serviceModes: 'Umum dan BPJS',
    insurance: 'BPJS Kesehatan',
    address: 'Jalan Raya Desa Lembean, Lembean, Kec. Kintamani\nKabupaten Bangli, Bali 80652',
    // Koordinat pusat Desa Lembean. Ganti dengan koordinat pin klinik dari Google Maps bila tersedia.
    mapsUrl: 'https://maps.app.goo.gl/LAKbhRadhn4KddM16',
    latitude: -8.290927,
    longitude: 115.278522,
    whatsapp: '087864114866',
    hours: everyDay.map((day) => ({ day, open: '08:00', close: '21:00', closed: false })),
    hoursNote: 'Jadwal dokter berbeda setiap hari; hari Rabu dokter libur. Bidan bertugas bergilir sepanjang jam operasional.',
    team: { doctors: 2, dentists: 1, midwives: 4, nurses: 6, pharmacists: 1, pharmacyAssistants: 2 },
    googleReviewsUrl: 'https://maps.app.goo.gl/LAKbhRadhn4KddM16',
  },
})

console.log('[seed] layanan')
const services = [
  { name: 'Poli Umum', icon: 'stetho', summary: 'Pemeriksaan dan pengobatan keluhan kesehatan umum untuk semua usia, termasuk surat keterangan sehat dan rujukan.', tags: ['Umum', 'BPJS'] },
  { name: 'Poli Gigi', icon: 'tooth', summary: 'Pemeriksaan dan perawatan kesehatan gigi dan mulut oleh dokter gigi. Lihat jadwal praktik di bagian Dokter & Jadwal.', tags: [] },
  { name: 'KIA dan KB', icon: 'heart', summary: 'Pemeriksaan kehamilan, kesehatan ibu dan anak, serta konsultasi dan pelayanan keluarga berencana oleh bidan.', tags: ['Bidan setiap hari'] },
  { name: 'Laboratorium Sederhana', icon: 'flask', summary: 'Pemeriksaan laboratorium dasar untuk membantu dokter menegakkan diagnosis. Jenis pemeriksaan dapat ditanyakan ke petugas.', tags: [] },
  { name: 'Apotek / Farmasi', icon: 'pill', summary: 'Pelayanan resep dan informasi penggunaan obat oleh apoteker dan asisten apoteker.', tags: ['Apoteker'] },
  { name: 'Medical Check Up', icon: 'clipboard', summary: 'Pemeriksaan kesehatan untuk keperluan pribadi, sekolah, atau pekerjaan, termasuk surat keterangan sehat.', tags: ['Surat keterangan sehat'] },
  { name: 'Home Care', icon: 'home', summary: 'Layanan kesehatan di rumah pasien oleh tenaga kesehatan klinik. Hubungi WhatsApp untuk jadwal dan wilayah layanan.', tags: ['Via WhatsApp'] },
] as const
for (const [i, s] of services.entries()) {
  await payload.create({
    collection: 'services',
    data: { name: s.name, icon: s.icon, summary: s.summary, tags: s.tags.map((label) => ({ label })), order: (i + 1) * 10, show: true },
  })
}

const staff = [
  // Penulisan gelar: "dr." (dokter) dan "drg." (dokter gigi) huruf kecil; "S.Ked" tidak ditulis
  // karena sudah tercakup dalam gelar profesi dr.
  { name: 'dr. Enjik Ardhi Pradivtha', category: 'dokter', position: 'Dokter Umum', schedule: days(['1', '2', '4', '5', '6', '0'], '08:00', '14:00') },
  { name: 'dr. Ni Wayan Gunasri, M.Kes', category: 'dokter', position: 'Dokter Umum', schedule: days(['6', '0'], '17:00', '21:00') },
  { name: 'drg. I Made Yana Priyatna', category: 'dokter-gigi', position: 'Dokter Gigi', schedule: days(['5'], '09:00', '17:00') },
  ...['Ni Kadek Candra Dewi', 'Ni Wayan Kariasih', 'Ni Komang Riantini Kusuma Wiartiani', 'Ni Putu Ayu Rika Maharani'].map((name) => ({
    name,
    category: 'bidan' as const,
    position: 'Bidan',
    schedule: days(everyDay, '08:00', '21:00'),
    scheduleNote: 'Setiap hari 08.00–21.00 WITA, bergilir sesuai shift.',
  })),
  { name: 'apt. Ria Yuliana', category: 'apoteker', position: 'Apoteker', schedule: [] },
] as const
const created: Record<string, number> = {}
for (const [i, s] of staff.entries()) {
  const doc = await payload.create({
    collection: 'staff',
    data: { ...s, schedule: [...s.schedule], order: (i + 1) * 10, show: true },
  })
  created[s.name] = doc.id
}

const partners = [
  { name: 'Puskesmas Kintamani I', category: 'puskesmas' },
  { name: 'Starlight Foundation', category: 'yayasan', url: 'https://starlightfoundation.ch/' },
  { name: 'RS Medika Canti', category: 'rumah-sakit' },
] as const
for (const [i, p] of partners.entries()) {
  await payload.create({ collection: 'partners', data: { ...p, order: (i + 1) * 10, show: true } })
}

const faqs = [
  ['Apakah klinik menerima BPJS Kesehatan?', 'Ya. Klinik melayani pasien umum dan peserta BPJS Kesehatan. Bawa KTP atau kartu JKN digital dari aplikasi Mobile JKN. Bila fasilitas kesehatan tingkat pertama Anda bukan klinik ini, tanyakan ketentuannya lewat WhatsApp sebelum datang.'],
  ['Kapan klinik buka?', 'Setiap hari pukul 08.00–21.00 WITA. Jadwal dokter berbeda setiap hari dan dokter libur pada hari Rabu; lihat bagian Dokter & Jadwal. Bidan bertugas bergilir sepanjang jam operasional.'],
  ['Bagaimana cara mendaftar?', 'Tekan tombol Daftar Berobat, isi data singkat, lalu kirim pesan yang sudah terisi ke WhatsApp klinik. Petugas akan membalas dengan konfirmasi. Anda juga dapat datang langsung ke klinik pada jam operasional.'],
  ['Bagaimana cara memesan layanan home care?', 'Hubungi WhatsApp klinik untuk menanyakan jadwal, wilayah jangkauan, dan biaya layanan home care.'],
  ['Untuk apa saja medical check-up?', 'Medical check-up dapat digunakan untuk keperluan pribadi, sekolah, atau pekerjaan, termasuk pembuatan surat keterangan sehat. Tanyakan jenis pemeriksaan dan persiapannya lewat WhatsApp.'],
  ['Apa yang harus dilakukan saat gawat darurat?', 'Hubungi layanan gawat darurat 119 atau segera menuju instalasi gawat darurat rumah sakit terdekat.'],
  ['Bagaimana klinik menjaga data pribadi saya?', 'Data kesehatan termasuk data pribadi yang bersifat spesifik menurut UU No. 27 Tahun 2022. Kami hanya menggunakannya untuk pelayanan dan administrasi, dan Anda dapat meminta salinan atau koreksi data melalui petugas. Lihat Kebijakan Privasi.'],
] as const
for (const [i, [question, answer]] of faqs.entries()) {
  await payload.create({ collection: 'faqs', data: { question, answer, order: (i + 1) * 10, show: true } })
}

const now = new Date()
await payload.create({
  collection: 'posts',
  data: {
    title: 'Klinik buka setiap hari pukul 08.00–21.00 WITA untuk pasien umum dan BPJS',
    type: 'pengumuman',
    excerpt: 'Poli umum, KIA & KB, laboratorium sederhana, apotek, dan layanan lainnya tersedia setiap hari. Cek jadwal dokter sebelum datang.',
    content: rt([
      'Klinik Mustika Sekar Taji melayani pasien umum dan peserta BPJS Kesehatan setiap hari pukul 08.00–21.00 WITA.',
      'Jadwal praktik dokter berbeda setiap hari dan dapat dilihat di bagian Dokter & Jadwal. Bidan bertugas bergilir sepanjang jam operasional.',
    ]),
    publishedAt: now.toISOString(),
    pinned: true,
    _status: 'published',
  },
})
await payload.create({
  collection: 'posts',
  data: {
    title: 'Website resmi Klinik Mustika Sekar Taji kini hadir',
    type: 'berita',
    excerpt: 'Cek layanan, jadwal dokter, dan daftar berobat lewat WhatsApp langsung dari situs ini.',
    content: rt([
      'Melalui situs ini, pasien dapat melihat layanan klinik, jadwal praktik dokter, lokasi, serta kabar dan pengumuman terbaru.',
      'Pendaftaran berobat dapat dilakukan lewat WhatsApp dengan menekan tombol Daftar Berobat.',
    ]),
    publishedAt: new Date(now.getTime() - 60_000).toISOString(),
    _status: 'published',
  },
})
await payload.create({
  collection: 'posts',
  draft: true,
  data: {
    title: 'Demam pada anak: kapan perlu segera dibawa ke fasilitas kesehatan?',
    type: 'artikel',
    excerpt: 'Sebagian besar demam dapat dirawat di rumah, tetapi beberapa tanda berikut perlu segera diperiksakan.',
    content: rt([
      'DRAF — perlu ditinjau dokter sebelum diterbitkan.',
      'Segera bawa anak ke fasilitas kesehatan bila bayi berusia di bawah 3 bulan mengalami demam 38°C atau lebih, anak kejang, sesak napas, tampak sangat lemas atau sulit dibangunkan, tidak mau minum atau jarang buang air kecil, atau muncul ruam yang tidak memudar saat ditekan.',
      'Periksakan juga anak bila demam berlangsung lebih dari 3 hari.',
    ]),
    medicalReviewer: created['dr. Ni Wayan Gunasri, M.Kes'],
    publishedAt: now.toISOString(),
    _status: 'draft',
  },
})

console.log('[seed] selesai')
finished = true
process.exit(0)
