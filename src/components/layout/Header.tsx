'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  showBack?: boolean
  title?: string
  onBack?: () => void
}

export default function Header({ showBack = false, title, onBack }: HeaderProps) {
  const router = useRouter()

  return (
    <header
      className="sticky top-0 z-10 flex h-header items-center justify-between px-4 border-b border-[#EEF1F0] bg-white"
    >
      {/* Gauche — bouton retour ou espace réservé */}
      {showBack ? (
        <button
          onClick={onBack ?? (() => router.back())}
          aria-label="Retour"
          className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-fond"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="#1A2E1A"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <div className="w-11" />
      )}

      {/* Centre — titre de page ou logo */}
      {showBack && title ? (
        <span className="text-[17px] font-bold text-anthracite">{title}</span>
      ) : (
        <Image
          src="/logo.png"
          alt="Baraka"
          width={110}
          height={36}
          className="object-contain"
          priority
        />
      )}

      {/* Droite — cloche */}
      <button
        aria-label="Notifications"
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-emeraude-clair text-[21px] leading-none"
      >
        🔔
      </button>
    </header>
  )
}
