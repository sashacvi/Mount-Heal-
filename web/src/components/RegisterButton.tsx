'use client'
import type { ReactNode } from 'react'

export const OPEN_REGISTER = 'mst:open-register'

export function openRegister(detail?: { staff?: string; service?: string }) {
  window.dispatchEvent(new CustomEvent(OPEN_REGISTER, { detail }))
}

export function RegisterButton({
  children,
  className = 'btn btn-primary',
  staff,
  service,
}: {
  children: ReactNode
  className?: string
  staff?: string
  service?: string
}) {
  return (
    <button type="button" className={className} onClick={() => openRegister({ staff, service })}>
      {children}
    </button>
  )
}
