export const TIMEZONE = 'Asia/Makassar' // WITA, UTC+8
export const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

/** "08:00" → "08.00" (penulisan jam baku bahasa Indonesia). */
export const fmtTime = (t?: string | null) => (t ? t.replace(':', '.') : '')
export const fmtRange = (a?: string | null, b?: string | null) => `${fmtTime(a)}–${fmtTime(b)}`
export const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Intl.DateTimeFormat('id-ID', { timeZone: TIMEZONE, ...opts }).format(new Date(iso))

/** Hari (0–6) dan menit sejak tengah malam menurut WITA. */
export function nowInClinic(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'))
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')), label: `${get('hour')}.${get('minute')}` }
}

/** 0878xxxx → 62878xxxx untuk tautan wa.me */
export const waNumber = (n: string) => {
  const digits = n.replace(/\D/g, '')
  return digits.startsWith('0') ? `62${digits.slice(1)}` : digits
}
export const waLink = (n: string, text?: string) =>
  `https://wa.me/${waNumber(n)}${text ? `?text=${encodeURIComponent(text)}` : ''}`
/** 087864114866 → 0878-6411-4866 */
export const fmtPhone = (n: string) => {
  const d = n.replace(/\D/g, '')
  return d.length >= 10 ? `${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8)}` : n
}

export const readingMinutes = (text: string) => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200))
