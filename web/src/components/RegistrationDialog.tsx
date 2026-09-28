'use client'
import { useEffect, useRef, useState } from 'react'
import { DAY_NAMES, fmtRange, waLink } from '@/lib/format'
import { Icon } from './Icon'
import { OPEN_REGISTER } from './RegisterButton'
import type { StaffLite } from './types'

/**
 * Pendaftaran lewat WhatsApp: formulir hanya menyusun pesan, tidak ada data
 * yang disimpan di server situs.
 */
export function RegistrationDialog({ services, doctors, whatsapp }: { services: string[]; doctors: StaffLite[]; whatsapp: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', service: services[0] ?? '', staff: '', date: '', pay: 'Umum', note: '' })
  const lastFocus = useRef<HTMLElement | null>(null)
  const firstField = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<{ staff?: string; service?: string }>).detail || {}
      lastFocus.current = document.activeElement as HTMLElement
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Makassar' }).format(new Date())
      setForm((f) => ({ ...f, staff: d.staff ?? f.staff, service: d.service ?? (d.staff ? 'Poli Umum' : f.service), date: f.date || today }))
      setError('')
      setOpen(true)
    }
    const onHash = () => {
      if (window.location.hash === '#daftar') onOpen(new CustomEvent(OPEN_REGISTER))
    }
    window.addEventListener(OPEN_REGISTER, onOpen)
    window.addEventListener('hashchange', onHash)
    onHash()
    return () => {
      window.removeEventListener(OPEN_REGISTER, onOpen)
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    firstField.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function close() {
    setOpen(false)
    if (window.location.hash === '#daftar') history.replaceState(null, '', window.location.pathname)
    lastFocus.current?.focus?.()
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const selectedDay = form.date ? new Date(`${form.date}T12:00:00`).getDay() : null
  const doc = doctors.find((d) => d.name === form.staff)
  const slot = doc && selectedDay !== null ? doc.schedule.find((r) => Number(r.day) === selectedDay) : undefined

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.name.trim().length < 3) return setError('Tulis nama lengkap pasien.')
    if (!form.date) return setError('Pilih tanggal kunjungan.')
    const dateText = new Date(`${form.date}T12:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const lines = [
      'Halo Klinik Mustika Sekar Taji, saya ingin mendaftar berobat.',
      '',
      `Nama pasien: ${form.name.trim()}`,
      `Layanan: ${form.service}`,
      form.staff ? `Dokter: ${form.staff}` : null,
      `Tanggal kunjungan: ${dateText}`,
      `Pembayaran: ${form.pay}`,
      form.note.trim() ? `Keluhan singkat: ${form.note.trim()}` : null,
    ].filter((l): l is string => l !== null)
    window.open(waLink(whatsapp, lines.join('\n')), '_blank', 'noopener')
    close()
  }

  if (!open) return null
  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="regTitle">
        <div className="modal-head">
          <h2 id="regTitle">Daftar berobat lewat WhatsApp</h2>
          <button type="button" className="icon-btn" onClick={close} aria-label="Tutup">
            <Icon name="x" />
          </button>
        </div>
        <div className="modal-body">
          <form className="form" onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="reg-service">Layanan</label>
              <select id="reg-service" ref={firstField} value={form.service} onChange={set('service')}>
                {services.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="reg-staff">Dokter (opsional)</label>
              <select id="reg-staff" value={form.staff} onChange={set('staff')}>
                <option value="">Siapa saja yang bertugas</option>
                {doctors.map((d) => (
                  <option key={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="reg-date">Tanggal kunjungan</label>
              <input id="reg-date" type="date" value={form.date} onChange={set('date')} required />
              {doc && selectedDay !== null && (
                <span className="hint" style={{ color: slot ? 'var(--ok)' : 'var(--accent-text)' }}>
                  {slot
                    ? `${doc.name} praktik ${DAY_NAMES[selectedDay]} ${fmtRange(slot.start, slot.end)} WITA`
                    : `${doc.name} tidak praktik hari ${DAY_NAMES[selectedDay]}.`}
                </span>
              )}
            </div>
            <div className="field">
              <label htmlFor="reg-pay">Pembayaran</label>
              <select id="reg-pay" value={form.pay} onChange={set('pay')}>
                <option>Umum</option>
                <option>BPJS Kesehatan</option>
              </select>
            </div>
            <div className="field full">
              <label htmlFor="reg-name">Nama lengkap pasien</label>
              <input id="reg-name" autoComplete="name" value={form.name} onChange={set('name')} placeholder="Sesuai KTP / KK" required />
            </div>
            <div className="field full">
              <label htmlFor="reg-note">Keluhan singkat (opsional)</label>
              <textarea id="reg-note" rows={3} value={form.note} onChange={set('note')} placeholder="Contoh: demam 2 hari, batuk" />
            </div>
            <p className="note full" style={{ gridColumn: '1 / -1' }}>
              Tombol di bawah membuka WhatsApp dengan pesan yang sudah terisi. Data tidak disimpan di situs ini. Petugas akan
              membalas dengan konfirmasi jadwal. Untuk keadaan gawat darurat, hubungi 119.
            </p>
            {error && (
              <p className="full" role="alert" style={{ gridColumn: '1 / -1', color: 'var(--accent-text)', fontWeight: 600 }}>
                {error}
              </p>
            )}
            <div className="full" style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-ghost" onClick={close}>
                Batal
              </button>
              <button className="btn btn-primary" type="submit">
                <Icon name="chat" />
                Kirim lewat WhatsApp
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
