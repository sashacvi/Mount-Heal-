'use client'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import { isDarkNow } from './ThemeToggle'

type Props = { lat: number; lng: number; name: string; address: string; embedKey?: string }

const PIN = `<svg viewBox="0 0 36 50" width="40" height="52" aria-hidden="true"><path d="M18 0C8 0 0 8 0 18c0 13 18 32 18 32s18-19 18-32C36 8 28 0 18 0z" fill="#722975"/><circle cx="18" cy="18" r="8" fill="#FFF212"/><circle cx="18" cy="18" r="4" fill="#EC268F"/></svg>`

export function LocationMap({ lat, lng, name, address, embedKey }: Props) {
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (embedKey || !el.current) return
    let map: import('leaflet').Map | undefined
    let cancelled = false
    const syncTheme = () => el.current?.classList.toggle('dark-tiles', isDarkNow())
    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    import('leaflet').then((L) => {
      if (cancelled || !el.current) return
      map = L.map(el.current, { scrollWheelZoom: false }).setView([lat, lng], 15)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)
      const icon = L.divIcon({ className: '', html: PIN, iconSize: [40, 52], iconAnchor: [20, 50], popupAnchor: [0, -46] })
      L.marker([lat, lng], { icon, title: name, alt: name }).addTo(map).bindPopup(`<b>${name}</b><br>${address}`)
      syncTheme()
    })
    window.addEventListener('themechange', syncTheme)
    mq.addEventListener('change', syncTheme)
    return () => {
      cancelled = true
      window.removeEventListener('themechange', syncTheme)
      mq.removeEventListener('change', syncTheme)
      map?.remove()
    }
  }, [lat, lng, name, address, embedKey])

  if (embedKey) {
    const q = encodeURIComponent(name)
    return (
      <iframe
        title={`Peta lokasi ${name}`}
        src={`https://www.google.com/maps/embed/v1/place?key=${embedKey}&q=${q}&center=${lat},${lng}&zoom=15&language=id`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    )
  }
  return <div ref={el} role="region" aria-label={`Peta lokasi ${name}`} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />
}
