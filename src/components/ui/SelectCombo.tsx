'use client'

import { useState } from 'react'

type Option = {
  value: string | number
  label: string
  icon?: string
}

type Props = {
  value: string | number
  options: Option[]
  onChange: (value: string | number) => void
  placeholder?: string
}

export function SelectCombo({ value, options, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => String(o.value) === String(value))

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between h-[56px] rounded-[14px] border border-sep bg-white px-4 text-[16px] font-semibold text-anthracite transition-colors active:bg-fond"
      >
        <span className="flex items-center gap-3">
          {selected?.icon && <span className="text-[20px] leading-none">{selected.icon}</span>}
          <span>{selected?.label ?? placeholder ?? '—'}</span>
        </span>
        <svg
          width="18" height="18" viewBox="0 0 20 20" fill="none"
          className="shrink-0 text-emeraude-foret"
          aria-hidden="true"
        >
          <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={[
          'fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[24px] shadow-[0_-4px_24px_rgba(0,0,0,0.12)] transition-transform duration-300',
          open ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-[4px] rounded-pill bg-sep" />
        </div>

        {/* Options */}
        <ul className="px-4 pb-8 pt-2 flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
          {options.map(opt => {
            const actif = String(opt.value) === String(value)
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={[
                    'w-full flex items-center gap-3 px-4 py-3.5 rounded-[14px] text-[16px] font-semibold transition-colors text-left',
                    actif
                      ? 'bg-emeraude-clair text-emeraude-foret'
                      : 'text-anthracite hover:bg-fond active:bg-fond',
                  ].join(' ')}
                >
                  {opt.icon && <span className="text-[22px] leading-none">{opt.icon}</span>}
                  <span className="flex-1">{opt.label}</span>
                  {actif && (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M4 10l5 5 7-9" stroke="#0D5934" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
