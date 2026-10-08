// Tautan di menu samping admin untuk membuka website di tab baru.
export default function ViewSiteLink() {
  return (
    <a
      href="/"
      target="_blank"
      rel="noopener"
      className="nav__link"
      style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'calc(var(--base) * 0.5)', fontWeight: 600, textDecoration: 'none' }}
    >
      Lihat website <span aria-hidden="true">↗</span>
    </a>
  )
}
