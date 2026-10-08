// Tautan di bawah formulir login admin untuk kembali ke website utama.
export default function BackToSite() {
  return (
    <p style={{ textAlign: 'center', margin: '24px 0 0' }}>
      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, textDecoration: 'none', color: 'var(--theme-text)' }}>
        <span aria-hidden="true">←</span> Kembali ke website
      </a>
    </p>
  )
}
