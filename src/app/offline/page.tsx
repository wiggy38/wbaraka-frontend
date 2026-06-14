'use client'

import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="emprunteur-outer">
      <div className="emprunteur-shell flex flex-col items-center justify-center min-h-screen px-6 text-center">

        {/* Logo Baraka */}
        <div className="w-16 h-16 rounded-[14px] bg-saffron flex items-center justify-center mb-8 shadow-cta">
          <span className="text-[32px] font-extrabold text-emeraude-foret leading-none">B</span>
        </div>

        {/* Icône wifi barré */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-6"
          aria-hidden="true"
        >
          <path
            d="M10 22C18.5 14.5 29.7 10 40 10C50.3 10 61.5 14.5 70 22"
            stroke="#E3F5EC"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M20 34C26 28.5 32.8 26 40 26C47.2 26 54 28.5 60 34"
            stroke="#2A9D6E"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M30 46C33.5 42.8 36.6 41 40 41C43.4 41 46.5 42.8 50 46"
            stroke="#1B6B44"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="40" cy="57" r="4.5" fill="#1B6B44" />
          {/* barre diagonale */}
          <line
            x1="14"
            y1="14"
            x2="66"
            y2="66"
            stroke="#C0392B"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>

        {/* Titre */}
        <h1 className="text-2xl font-extrabold text-emeraude-foret mb-2">
          Vous êtes hors ligne
        </h1>

        {/* Sous-titre */}
        <p className="text-lg text-gris mb-8">
          Vérifiez votre connexion internet
        </p>

        {/* Disponible sans connexion */}
        <div className="w-full bg-emeraude-clair rounded-card px-5 py-5 mb-8 text-left">
          <p className="text-sm font-bold text-emeraude-foret mb-3 uppercase tracking-wide">
            Disponible sans connexion :
          </p>
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-emeraude flex items-center justify-center shrink-0">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <Link href="/simulateur" className="text-base font-medium text-emeraude-foret hover:underline">
                Votre dernière simulation
              </Link>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-emeraude flex items-center justify-center shrink-0">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <Link href="/resultats" className="text-base font-medium text-emeraude-foret hover:underline">
                Vos offres récentes
              </Link>
            </li>
          </ul>
        </div>

        {/* Bouton Réessayer */}
        <button
          onClick={() => window.location.reload()}
          className="w-full h-cta rounded-btn bg-saffron text-xl font-bold text-emeraude-foret shadow-cta mb-6"
        >
          Réessayer
        </button>

        {/* Note de bas */}
        <p className="text-sm text-gris">
          Les données seront synchronisées automatiquement
        </p>
      </div>
    </div>
  )
}
