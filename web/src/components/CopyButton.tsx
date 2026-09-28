'use client'
import { useState } from 'react'
import { Icon } from './Icon'

export function CopyButton({ text, label = 'Salin alamat' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          setTimeout(() => setDone(false), 2000)
        } catch {
          window.prompt('Salin teks berikut:', text)
        }
      }}
    >
      <Icon name={done ? 'check' : 'copy'} />
      {done ? 'Tersalin' : label}
    </button>
  )
}
