'use client'
import { useEffect, useState } from 'react'
import { DAY_NAMES, WEEK_ORDER, fmtRange, nowInClinic } from '@/lib/format'
import { RegisterButton } from './RegisterButton'
import { StaffPortrait } from './StaffPortrait'
import type { StaffLite } from './types'

export function ScheduleSection({ doctors }: { doctors: StaffLite[] }) {
  const [day, setDay] = useState<number | null>(null)
  const [today, setToday] = useState<number | null>(null)
  useEffect(() => {
    const d = nowInClinic().day
    setToday(d)
    setDay((cur) => (cur === null ? d : cur))
  }, [])
  const selected = day ?? 1
  const list = doctors.filter((d) => d.schedule.some((r) => Number(r.day) === selected))

  return (
    <>
      <div className="days" role="group" aria-label="Pilih hari">
        {WEEK_ORDER.map((d) => (
          <button key={d} type="button" className="chip" aria-pressed={d === selected} onClick={() => setDay(d)}>
            {DAY_NAMES[d].slice(0, 3)}
            {d === today ? ' · hari ini' : ''}
          </button>
        ))}
      </div>
      <div className="doc-grid" aria-live="polite" style={{ marginTop: 20 }}>
        {list.length === 0 && (
          <div className="empty">
            Dokter libur pada hari {DAY_NAMES[selected]}. Bidan tetap bertugas selama jam operasional klinik. Hubungi WhatsApp
            klinik untuk informasi.
          </div>
        )}
        {list.map((d, i) => (
          <article className="doc" key={d.id}>
            <StaffPortrait name={d.name} photo={d.photo} variant="avatar" index={i} />
            <h3>{d.name}</h3>
            <span className="sp">{d.position || 'Dokter'}</span>
            <div className="slots">
              {d.schedule
                .filter((r) => Number(r.day) === selected)
                .map((r) => (
                  <span className="slot" key={r.start}>
                    {fmtRange(r.start, r.end)}
                  </span>
                ))}
            </div>
            <div className="foot">
              <small>
                Praktik:{' '}
                {WEEK_ORDER.filter((w) => d.schedule.some((r) => Number(r.day) === w))
                  .map((w) => DAY_NAMES[w].slice(0, 3))
                  .join(', ')}
              </small>
              <RegisterButton className="btn btn-primary btn-sm" staff={d.name}>
                Daftar
              </RegisterButton>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
