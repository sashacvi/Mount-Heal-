'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'
import { openRegister } from './RegisterButton'
import { ThemeToggle } from './ThemeToggle'

type NavLink = { href: string; label: string; hint?: string }
type NavItem = { label: string; href?: string; children?: NavLink[] }

export function SiteHeader({ services, hasGallery }: { services: string[]; hasGallery: boolean }) {
  const [open, setOpen] = useState<string | null>(null)
  const [drawer, setDrawer] = useState(false)
  const navRef = useRef<HTMLUListElement>(null)

  const items: NavItem[] = [
    { label: 'Beranda', href: '/' },
    {
      label: 'Tentang',
      children: [
        { href: '/#tentang', label: 'Profil Klinik', hint: 'Sejarah singkat & akreditasi' },
        { href: '/#tim', label: 'Tim Kesehatan', hint: 'Dokter, bidan, perawat, farmasi' },
        { href: '/#mitra', label: 'Mitra', hint: 'Fasilitas & lembaga rekanan' },
        ...(hasGallery ? [{ href: '/#galeri', label: 'Galeri Foto', hint: 'Fasilitas dan kegiatan' }] : []),
      ],
    },
    {
      label: 'Layanan',
      children: services.map((s) => ({ href: '/#layanan', label: s })),
    },
    { label: 'Dokter & Jadwal', href: '/#dokter' },
    {
      label: 'Info Pasien',
      children: [
        { href: '/#daftar', label: 'Cara Mendaftar', hint: 'Lewat WhatsApp atau datang langsung' },
        { href: '/#faq', label: 'BPJS Kesehatan', hint: 'Syarat berobat dengan BPJS' },
        { href: '/#faq', label: 'Tanya Jawab (FAQ)' },
        { href: '/kebijakan-privasi', label: 'Kebijakan Privasi' },
      ],
    },
    { label: 'Kabar Klinik', href: '/kabar' },
    { label: 'Kontak', href: '/#lokasi' },
  ]

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null)
        setDrawer(false)
      }
    }
    document.addEventListener('click', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : ''
  }, [drawer])

  return (
    <header className="site">
      <div className="wrap nav">
        <Link className="brand" href="/" aria-label="Klinik Mustika Sekar Taji, ke beranda">
          <img src="/brand/logo-mark.svg" alt="" width={98} height={46} />
          <span>
            <small style={{ marginTop: 0, marginBottom: 3 }}>Klinik</small>
            <b>Mustika Sekar Taji</b>
          </span>
        </Link>
        <nav aria-label="Menu utama" style={{ display: 'contents' }}>
          <ul className="menu" ref={navRef}>
            {items.map((item) =>
              item.children ? (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-expanded={open === item.label}
                    onClick={() => setOpen(open === item.label ? null : item.label)}
                  >
                    {item.label} <Icon name="chev-d" />
                  </button>
                  {open === item.label && (
                    <ul className="dropdown">
                      {item.children.map((c) => (
                        <li key={c.label}>
                          <Link href={c.href} onClick={() => setOpen(null)}>
                            {c.label}
                            {c.hint && <small>{c.hint}</small>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.label}>
                  <Link href={item.href!}>{item.label}</Link>
                </li>
              ),
            )}
          </ul>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openRegister()}>
            <Icon name="calendar" />
            Daftar
          </button>
          <button type="button" className="burger" aria-label="Buka menu" aria-expanded={drawer} onClick={() => setDrawer(true)}>
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {/* Drawer dirender di <body> agar tidak terkurung di dalam header (sticky) dan selalu di atas tombol WhatsApp. */}
      {drawer && createPortal(
        <div className="drawer" onClick={(e) => e.target === e.currentTarget && setDrawer(false)}>
          <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="drawer-head">
              <b>Menu</b>
              <button type="button" className="icon-btn" style={{ background: 'var(--surface-2)', color: 'var(--ink)' }} onClick={() => setDrawer(false)} aria-label="Tutup menu">
                <Icon name="x" />
              </button>
            </div>
            {items.map((item) =>
              item.children ? (
                <details key={item.label}>
                  <summary>
                    {item.label} <Icon name="chev-d" />
                  </summary>
                  {item.children.map((c) => (
                    <Link key={c.label} href={c.href} onClick={() => setDrawer(false)}>
                      {c.label}
                    </Link>
                  ))}
                </details>
              ) : (
                <Link key={item.label} className="dl" href={item.href!} onClick={() => setDrawer(false)}>
                  {item.label}
                </Link>
              ),
            )}
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => {
                setDrawer(false)
                openRegister()
              }}
            >
              <Icon name="calendar" />
              Daftar Berobat
            </button>
          </div>
        </div>,
        document.body,
      )}
    </header>
  )
}
