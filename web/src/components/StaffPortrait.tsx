import { focusStyle, type StaffPhoto } from '@/lib/photo'

const COLORS = ['#722975', '#0B7CC2', '#C21A74', '#082DF7']

export const initials = (name: string) =>
  name
    .replace(/^(dr|drg|apt|Bd|Ns)\.\s*/i, '')
    .split(/[ ,]/)
    .filter((w) => w && !/\./.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

/** Foto personel yang dipusatkan ke wajah; tanpa foto → inisial berwarna. */
export function StaffPortrait({
  name,
  photo,
  variant,
  index = 0,
}: {
  name: string
  photo?: StaffPhoto | null
  variant: 'avatar' | 'card'
  index?: number
}) {
  const cls = variant === 'avatar' ? 'sp-avatar' : 'sp-card'
  if (!photo) {
    return (
      <span className={`${cls} sp-empty`} style={{ ['--c' as string]: COLORS[index % COLORS.length] }} aria-hidden="true">
        {initials(name)}
      </span>
    )
  }
  const style =
    variant === 'avatar'
      ? focusStyle({ ...photo, zoom: Math.min(photo.zoom * 1.9, 7) }, { x: 50, y: 50 })
      : focusStyle(photo, { x: 50, y: 30 })
  return (
    <span className={cls}>
      <img src={photo.src} alt={variant === 'card' ? photo.alt : ''} style={style} loading="lazy" decoding="async" />
    </span>
  )
}
