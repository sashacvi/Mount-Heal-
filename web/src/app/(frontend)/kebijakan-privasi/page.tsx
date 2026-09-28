import type { Metadata } from 'next'
import Link from 'next/link'
import { fmtPhone, waLink } from '@/lib/format'
import { getSettings } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Cara Klinik Mustika Sekar Taji memperlakukan data pribadi pengunjung situs dan pasien.',
}

export default async function PrivacyPage() {
  const s = await getSettings()
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Beranda</Link>
            <span aria-hidden="true">/</span>
            <span>Kebijakan Privasi</span>
          </nav>
          <h1>Kebijakan privasi</h1>
          <p>Berlaku untuk situs web {s.clinicName}.</p>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="prose">
            <p>
              {s.clinicName} menghormati privasi Anda dan memproses data pribadi sesuai Undang-Undang Nomor 27 Tahun 2022 tentang
              Pelindungan Data Pribadi. Data kesehatan termasuk data pribadi yang bersifat spesifik dan kami perlakukan dengan
              perlindungan tambahan.
            </p>
            <h2>Data yang kami terima melalui situs</h2>
            <ul>
              <li>
                <b>Formulir pendaftaran.</b> Formulir di situs ini hanya menyusun pesan WhatsApp. Data tidak disimpan di server situs.
                Data baru kami terima ketika Anda mengirim pesan tersebut ke nomor WhatsApp klinik.
              </li>
              <li>
                <b>Preferensi tampilan.</b> Pilihan tema terang/gelap disimpan di peramban Anda (localStorage) dan tidak dikirim ke kami.
              </li>
              <li>
                <b>Peta.</b> Peta lokasi dimuat dari OpenStreetMap atau Google Maps. Penyedia peta dapat menerima alamat IP perangkat Anda
                sesuai kebijakan masing-masing.
              </li>
            </ul>
            <h2>Penggunaan data pasien</h2>
            <p>
              Data yang Anda kirim melalui WhatsApp atau saat pendaftaran di klinik hanya digunakan untuk pelayanan kesehatan, administrasi
              (termasuk BPJS Kesehatan bila Anda peserta), dan komunikasi terkait jadwal. Rekam medis disimpan sesuai ketentuan
              perundang-undangan dan hanya diakses oleh petugas yang berwenang.
            </p>
            <h2>Hak Anda</h2>
            <ul>
              <li>Meminta akses atau salinan data pribadi Anda.</li>
              <li>Meminta koreksi data yang tidak akurat.</li>
              <li>Menarik persetujuan untuk komunikasi yang tidak terkait pelayanan.</li>
              <li>Mengajukan keberatan atas pemrosesan data.</li>
            </ul>
            <h2>Ulasan dan foto</h2>
            <p>
              Ulasan yang ditampilkan berasal dari ulasan publik di Google atau disampaikan langsung oleh pasien dengan persetujuan tertulis.
              Foto yang memuat pasien hanya dipublikasikan dengan persetujuan.
            </p>
            <h2>Kontak</h2>
            <p>
              Hubungi kami melalui WhatsApp{' '}
              <a href={waLink(s.whatsapp)} target="_blank" rel="noopener">
                {fmtPhone(s.whatsapp)}
              </a>{' '}
              atau datang ke resepsionis: <span style={{ whiteSpace: 'pre-line' }}>{s.address}</span>.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
