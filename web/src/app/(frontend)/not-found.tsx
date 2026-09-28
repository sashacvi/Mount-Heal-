import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="sec">
      <div className="wrap" style={{ textAlign: 'center', display: 'grid', gap: 16, justifyItems: 'center' }}>
        <span className="eyebrow">Halaman tidak ditemukan</span>
        <h1 className="h2">Halaman yang Anda cari tidak tersedia</h1>
        <p className="lead">Tautan mungkin sudah berubah atau kabar telah diarsipkan.</p>
        <Link className="btn btn-primary" href="/">
          Kembali ke beranda
        </Link>
      </div>
    </section>
  )
}
