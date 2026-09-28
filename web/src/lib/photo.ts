import type { CSSProperties } from 'react'

export type StaffPhoto = { src: string; alt: string; fx: number; fy: number; zoom: number }

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/**
 * Gaya CSS untuk "memotong" foto di sekitar titik fokus (wajah) tanpa membuat file baru.
 * Foto diperbesar `zoom` kali dengan titik fokus sebagai poros, lalu digeser agar wajah
 * berada di sekitar `target` (persen lebar/tinggi kotak) tanpa memperlihatkan tepi kosong.
 */
export function focusStyle(p: Pick<StaffPhoto, 'fx' | 'fy' | 'zoom'>, target = { x: 50, y: 32 }): CSSProperties {
  const s = Math.max(1, p.zoom)
  const L = p.fx - p.fx * s
  const R = p.fx + (100 - p.fx) * s
  const T = p.fy - p.fy * s
  const B = p.fy + (100 - p.fy) * s
  const dx = clamp(target.x - p.fx, 100 - R, -L)
  const dy = clamp(target.y - p.fy, 100 - B, -T)
  return {
    objectPosition: `${p.fx}% ${p.fy}%`,
    transformOrigin: `${p.fx}% ${p.fy}%`,
    transform: `translate(${dx.toFixed(2)}%, ${dy.toFixed(2)}%) scale(${s})`,
  }
}
