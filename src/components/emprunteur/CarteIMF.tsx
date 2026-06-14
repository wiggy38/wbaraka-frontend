'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FallbackIMF } from '@/components/shared/FallbackIMF'

interface CarteIMFProps {
  nom: string
  ville: string
  taux: number
  teg: number
  mensualite: number
  coutTotal: number
  duree: number
  rating: number
  isBest?: boolean
  coverGradient?: string
  logoUrl?: string
  coverUrl?: string
  onDetail?: () => void
  onSimuler?: () => void
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-[12px] ${i <= rating ? 'text-or' : 'text-sep'}`}>
          ★
        </span>
      ))}
    </span>
  )
}

export function CarteIMF({
  nom,
  ville,
  taux,
  teg,
  mensualite,
  coutTotal,
  duree,
  rating,
  isBest = false,
  coverGradient = 'linear-gradient(135deg, #0D5934 0%, #2A9D6E 100%)',
  logoUrl,
  coverUrl,
  onDetail,
  onSimuler,
}: CarteIMFProps) {
  const [coverError, setCoverError] = useState(false)
  const [logoError, setLogoError] = useState(false)

  return (
    <article
      data-testid="carte-imf"
      aria-label={`Offre ${nom} — ${mensualite.toLocaleString('fr-FR')} FCFA par mois`}
      className={[
        'overflow-hidden bg-white',
        isBest
          ? 'rounded-card border-[1.5px] border-or shadow-card-or'
          : 'rounded-card border border-[#EEF1F0] shadow-card',
      ].join(' ')}
    >
      {/* Cover */}
      <div data-testid="carte-cover" className="relative h-cover">
        {coverUrl && !coverError ? (
          <Image
            src={coverUrl}
            fill
            alt=""
            loading="lazy"
            className="object-cover"
            onError={() => setCoverError(true)}
          />
        ) : (
          <FallbackIMF nom={nom} type="cover" gradient={coverGradient} className="absolute inset-0" />
        )}

        {/* Overlay gradient bas */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,.45) 0%, transparent 60%)' }}
        />

        {/* Badge meilleure offre */}
        {isBest && (
          <div
            className="absolute right-3 top-3 rounded-pill px-2.5 py-1 text-[12px] font-extrabold"
            style={{ background: 'linear-gradient(135deg, #D4A017 0%, #E8C030 100%)', color: '#3a2c00' }}
          >
            ⭐ Meilleure offre
          </div>
        )}

        {/* Logo IMF */}
        {logoUrl && (
          logoError ? (
            <FallbackIMF
              nom={nom}
              type="logo"
              className="absolute bottom-[10px] left-[14px] border-2 border-white"
            />
          ) : (
            <Image
              src={logoUrl}
              width={32}
              height={32}
              alt={`Logo ${nom}`}
              className="absolute bottom-[10px] left-[14px] h-8 w-8 rounded-[7px] border-2 border-white object-cover"
              onError={() => setLogoError(true)}
            />
          )
        )}
      </div>

      {/* Corps */}
      <div className="px-[14px] py-[11px]">
        {/* Nom + ville */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[15px] font-bold leading-tight text-anthracite">{nom}</span>
          <span className="shrink-0 rounded-pill bg-emeraude-clair px-2.5 py-0.5 text-[11px] font-semibold text-emeraude">
            {ville}
          </span>
        </div>

        {/* Taux + étoiles */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[13px] text-gris">
            Taux : {taux.toFixed(2).replace('.', ',')}% / mois
          </span>
          <Stars rating={rating} />
        </div>

        {/* Séparateur */}
        <hr className="my-[8px] border-sep" />

        {/* Grille mensualité / TEG */}
        <div className="grid grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gris">Mensualité</p>
            <p data-testid="mensualite" className="mt-0.5 text-[19px] font-extrabold leading-tight" style={{ color: '#B87A00' }}>
              {mensualite.toLocaleString('fr-FR')}
              <span className="ml-1 text-[12px] font-normal text-gris">/mois</span>
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gris">TEG Annuel</p>
            <p className="mt-0.5 text-[19px] font-extrabold leading-tight text-anthracite">
              {teg.toFixed(1).replace('.', ',')}
              <span className="ml-0.5 text-[12px] font-normal text-gris">%</span>
            </p>
          </div>
        </div>

        {/* Coût total + Durée */}
        <div className="mt-1 flex items-center justify-between text-[12px] text-gris">
          <p>
            Coût total :{' '}
            <span className="font-semibold text-anthracite">
              {coutTotal.toLocaleString('fr-FR')} FCFA
            </span>
          </p>
          <p>
            Durée :{' '}
            <span className="font-semibold text-anthracite">{duree} mois</span>
          </p>
        </div>

        {/* Boutons */}
        <div className="mt-2 flex gap-[10px]">
          <button
            data-testid="btn-detail"
            onClick={onDetail}
            className="h-[36px] flex-1 rounded-[10px] border-[1.5px] border-emeraude bg-transparent text-[14px] font-semibold text-emeraude"
          >
            Détail
          </button>
          <button
            data-testid="btn-simuler"
            onClick={onSimuler}
            className="h-[36px] flex-1 rounded-[10px] bg-emeraude-foret text-[14px] font-semibold text-white"
          >
            Simuler
          </button>
        </div>
      </div>
    </article>
  )
}
