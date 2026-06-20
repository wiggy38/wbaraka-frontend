'use client'

import { useState } from 'react'
import Image from 'next/image'

interface CarteIMFProps {
  nom: string
  teg: number
  mensualite: number
  coutTotal: number
  rating: number
  ratingCount?: number
  isBest?: boolean
  delai?: string
  tags?: string[]
  coverGradient?: string
  logoUrl?: string
  coverUrl?: string
  onDetail?: () => void
}

function getInitials(nom: string) {
  return nom.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function CarteIMF({
  nom,
  teg,
  mensualite,
  coutTotal,
  rating,
  ratingCount,
  isBest = false,
  delai,
  tags = [],
  coverGradient = 'linear-gradient(135deg, #1B6B44 0%, #FEF0E0 100%)',
  logoUrl,
  coverUrl,
  onDetail,
}: CarteIMFProps) {
  const [coverError, setCoverError] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const hasCover = !!coverUrl && !coverError
  const initials = getInitials(nom)

  return (
    <article
      data-testid="carte-imf"
      aria-label={`Offre ${nom} — ${mensualite.toLocaleString('fr-FR')} FCFA par mois`}
      className={[
        'overflow-hidden bg-white rounded-card',
        isBest
          ? 'border-[1.5px] border-or shadow-card-or'
          : 'border border-[#EEF1F0] shadow-card',
      ].join(' ')}
    >
      {/* Gold banner — best offer */}
      {isBest && (
        <div
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-extrabold uppercase tracking-[.08em]"
          style={{ background: 'linear-gradient(90deg, #D4A017 0%, #E8B530 100%)', color: '#3a2c00' }}
        >
          <span>★</span>
          <span>Meilleure offre</span>
        </div>
      )}

      {/* Cover */}
      <div data-testid="carte-cover" className="relative h-cover overflow-hidden">
        {hasCover ? (
          <Image
            src={coverUrl!}
            fill
            alt=""
            loading="lazy"
            className="object-cover"
            onError={() => setCoverError(true)}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: coverGradient }} />
        )}

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(13,89,52,.82) 0%, rgba(13,89,52,.15) 55%, rgba(13,89,52,0) 100%)' }}
        />

        {/* Fallback name when no cover image */}
        {!hasCover && (
          <div className="absolute inset-0 grid place-items-center px-12 pb-2.5 text-center text-[15px] font-bold text-white [text-shadow:0_1px_4px_rgba(0,0,0,.35)]">
            {nom}
          </div>
        )}

        {/* Logo bottom-left */}
        {logoUrl && !logoError ? (
          <Image
            src={logoUrl}
            width={48}
            height={48}
            alt={`Logo ${nom}`}
            className="absolute bottom-2 left-3 h-12 w-12 rounded-[9px] border-2 border-white object-cover shadow-md"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="absolute bottom-2 left-3 flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-white/85 bg-emeraude text-[13px] font-bold text-white">
            {initials}
          </div>
        )}

        {/* Rating chip bottom-right */}
        <div className="absolute bottom-2 right-2.5 flex items-center gap-1 rounded-pill bg-white/95 px-2 py-0.5 text-[12px] font-semibold text-anthracite">
          <span className="text-[11px] text-or">★</span>
          <span>{rating.toFixed(1).replace('.', ',')}</span>
          {ratingCount != null && (
            <span className="font-medium text-gris">· {ratingCount.toLocaleString('fr-FR')} avis</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-3.5 py-[13px]">
        {/* Name + delay pill */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[16px] font-bold leading-tight tracking-[-0.01em] text-emeraude">{nom}</span>
          {delai && (
            <span className="shrink-0 rounded-[10px] bg-emeraude-clair px-2.5 py-1 text-center text-[12px] font-semibold leading-tight text-emeraude-foret">
              {delai}
            </span>
          )}
        </div>

        {/* Monthly amount */}
        <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
          <span
            data-testid="mensualite"
            className="text-[24px] font-extrabold leading-none tracking-[-0.02em] text-saffron"
          >
            {mensualite.toLocaleString('fr-FR')} FCFA
          </span>
          <span className="text-[14px] font-medium text-gris">par mois</span>
        </div>

        {/* Cost total + TEG inline */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-1 text-[14px] leading-snug text-gris">
          <span>Coût total :</span>
          <span className="text-[18px] font-bold text-anthracite">{coutTotal.toLocaleString('fr-FR')} FCFA</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            TEG <span className="text-[15px] font-bold text-anthracite">{teg.toFixed(2).replace('.', ',')}%</span>
            <span className="inline-grid h-[15px] w-[15px] place-items-center rounded-full bg-[#E5E7EB] text-[10px] font-bold text-gris">?</span>
          </span>
        </div>

        {/* Sector tags */}
        {tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <span
                key={tag}
                className="rounded-pill bg-emeraude-clair px-2.5 py-1 text-[13px] font-medium leading-none text-emeraude"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-2.5 grid grid-cols-1 gap-2">
          <button
            data-testid="btn-detail"
            onClick={onDetail}
            className="flex h-[38px] items-center justify-center rounded-[10px] bg-emeraude text-[14px] font-bold text-white transition-colors hover:bg-emeraude-foret"
          >
            Voir le détail →
          </button>
        </div>
      </div>
    </article>
  )
}
