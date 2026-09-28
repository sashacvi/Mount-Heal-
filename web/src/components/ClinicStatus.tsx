'use client'
import { useEffect, useState } from 'react'
import { DAY_NAMES, fmtRange, fmtTime, nowInClinic, toMinutes, waLink } from '@/lib/format'
import { Icon } from './Icon'
import type { HoursRow, StaffLite } from './types'

function openState(hours: HoursRow[], day: number, minutes: number) {
  const today = hours.find((h) => Number(h.day) === day)
  const isOpen = Boolean(today && !today.closed && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close))
  if (isOpen) return { isOpen, text: `Buka · tutup ${fmtTime(today!.close)} WITA` }
  // cari jam buka berikutnya
  for (let k = 0; k < 7; k++) {
    const d = (day + k) % 7
    const h = hours.find((x) => Number(x.day) === d)
    if (!h || h.closed) continue
    if (k === 0 && minutes >= toMinutes(h.open)) continue
    return { isOpen, text: `Tutup · buka ${k === 0 ? 'hari ini' : k === 1 ? 'besok' : DAY_NAMES[d]} ${fmtTime(h.open)}` }
  }
  return { isOpen, text: 'Tutup' }
}

export function TodayHours({ hours }: { hours: HoursRow[] }) {
  const [text, setText] = useState<string | null>(null)
  useEffect(() => {
    const { day } = nowInClinic()
    const h = hours.find((x) => Number(x.day) === day)
    setText(h && !h.closed ? `Hari ini ${fmtRange(h.open, h.close)} WITA` : 'Hari ini tutup')
  }, [hours])
  return <span>{text ?? 'Jam operasional'}</span>
}

export function ClinicStatus({
  hours,
  staff,
  whatsapp,
  midwifeOnDuty = false,
}: {
  hours: HoursRow[]
  staff: StaffLite[]
  whatsapp: string
  /** Bidan jaga bergilir sepanjang jam operasional. */
  midwifeOnDuty?: boolean
}) {
  const [now, setNow] = useState<ReturnType<typeof nowInClinic> | null>(null)
  useEffect(() => {
    const tick = () => setNow(nowInClinic())
    tick()
    const t = setInterval(tick, 30_000)
    return () => clearInterval(t)
  }, [])

  const day = now?.day ?? -1
  const state = now ? openState(hours, now.day, now.minutes) : null
  const todayHours = hours.find((h) => Number(h.day) === day)
  const onDuty = staff
    .filter((s) => s.category === 'dokter' || s.category === 'dokter-gigi')
    .flatMap((s) => s.schedule.filter((r) => Number(r.day) === day).map((r) => ({ s, r })))
    .sort((a, b) => a.r.start.localeCompare(b.r.start))

  return (
    <aside className="status" aria-label="Status klinik hari ini">
      <div className="status-top">
        <h2>{now ? `${DAY_NAMES[now.day]}, pukul ${now.label} WITA` : 'Status klinik hari ini'}</h2>
        <span className={`live${state && !state.isOpen ? ' closed' : ''}`}>
          <i />
          <span>{state?.text ?? 'Memuat…'}</span>
        </span>
      </div>
      <div className="duty">
        <small style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 12.5 }}>Dokter praktik hari ini</small>
        {now && onDuty.length === 0 && (
          <div className="duty-row">
            <span>Tidak ada jadwal dokter hari ini</span>
            <span>—</span>
          </div>
        )}
        {onDuty.map(({ s, r }) => (
          <div className="duty-row" key={`${s.id}-${r.start}`}>
            <span>{s.name}</span>
            <span>{fmtRange(r.start, r.end)}</span>
          </div>
        ))}
        {midwifeOnDuty && todayHours && !todayHours.closed && (
          <div className="duty-row">
            <span>Bidan jaga (bergilir)</span>
            <span>{fmtRange(todayHours.open, todayHours.close)}</span>
          </div>
        )}
      </div>
      <div className="row-btns">
        <a className="btn btn-primary btn-sm" href={waLink(whatsapp, 'Halo Klinik Mustika Sekar Taji, saya ingin bertanya.')} target="_blank" rel="noopener">
          <Icon name="chat" />
          Tanya via WhatsApp
        </a>
        <a className="btn btn-ghost btn-sm" href="#dokter">
          Jadwal lengkap
        </a>
      </div>
      <div className="status-foot">
        <span>Waktu mengikuti zona WITA (Bali).</span>
      </div>
    </aside>
  )
}
