'use client'
import { useEffect, useState } from 'react'
import { Icon } from './Icon'

type Mode = 'system' | 'light' | 'dark'
const LABEL: Record<Mode, string> = { system: 'Sistem', light: 'Terang', dark: 'Gelap' }
const ICON = { system: 'monitor', light: 'sun', dark: 'moon' } as const
export const THEME_KEY = 'mst-theme'

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('system')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      if (saved === 'light' || saved === 'dark') setMode(saved)
    } catch {}
  }, [])

  const cycle = () => {
    const next: Mode = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'
    setMode(next)
    const root = document.documentElement
    if (next === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', next)
    try {
      if (next === 'system') localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, next)
    } catch {}
    window.dispatchEvent(new Event('themechange'))
  }

  return (
    <button type="button" className="theme-btn" onClick={cycle} aria-label={`Tema: ${LABEL[mode]}. Klik untuk mengganti.`}>
      <Icon name={ICON[mode]} />
      <span className="lbl">{LABEL[mode]}</span>
    </button>
  )
}

/** Dijalankan sebelum halaman tampil agar tidak berkedip. */
export const themeInitScript = `try{var m=localStorage.getItem('${THEME_KEY}');if(m==='light'||m==='dark')document.documentElement.setAttribute('data-theme',m)}catch(e){}`

export function isDarkNow() {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr) return attr === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}
