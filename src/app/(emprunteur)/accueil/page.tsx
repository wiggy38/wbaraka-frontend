'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import BottomNavbar from '@/components/layout/BottomNavbar'
import { CarteIMF } from '@/components/emprunteur/CarteIMF'
import BanniereInFeed from '@/components/emprunteur/BanniereInFeed'
import { fetchSlider } from '@/lib/api'
import { useBarakaStore } from '@/store/barakaStore'
import type { SlideHero } from '@/types'

type Slide = { gradient: string; badge: string; badgeClass: string; title: string }

const BADGE_CLASS: Record<SlideHero['badge_couleur'], string> = {
  saffron: 'bg-saffron text-emeraude-foret',
  or: 'bg-or text-white',
  violet: 'bg-[#7C3AED] text-white',
}

const FALLBACK_SLIDES: Slide[] = [
  {
    gradient: 'from-[#0D5934] to-[#2A9D6E]',
    badge: '🌱 Croissance',
    badgeClass: 'bg-saffron text-emeraude-foret',
    title: 'Développez votre activité avec le bon crédit',
  },
  {
    gradient: 'from-[#1B6B44] to-[#D4A017]',
    badge: '⭐ Meilleure offre',
    badgeClass: 'bg-or text-white',
    title: 'Comparez 12 IMF en 2 minutes',
  },
  {
    gradient: 'from-[#0D5934] to-[#7C3AED]',
    badge: '💡 Simulation',
    badgeClass: 'bg-[#7C3AED] text-white',
    title: 'Calculez votre mensualité exacte',
  },
]

const steps = [
  { num: 1, icon: '🎯', title: 'Décrivez votre besoin',   desc: 'Montant, durée, objet du crédit' },
  { num: 2, icon: '⚖️', title: 'Comparez les offres',     desc: 'TEG, mensualité, conditions réelles' },
  { num: 3, icon: '📊', title: 'Choisissez et simulez',   desc: "Tableau d'amortissement complet" },
]

const stats = [
  { value: '12+',    label: 'IMFs partenaires' },
  { value: '3 min',  label: 'Comparaison' },
  { value: '0 FCFA', label: 'Service gratuit' },
]

export default function AccueilPage() {
  const router = useRouter()
  const setBesoin = useBarakaStore(s => s.setBesoin)
  const [current, setCurrent] = useState(0)
  const [slides, setSlides] = useState<Slide[]>(FALLBACK_SLIDES)
  const [montant, setMontant] = useState('')
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    fetchSlider()
      .then((data: SlideHero[]) => {
        if (data?.length) {
          setSlides(data.map(s => ({
            gradient: s.gradient,
            badge: s.badge_texte,
            badgeClass: BADGE_CLASS[s.badge_couleur] ?? 'bg-saffron text-emeraude-foret',
            title: s.titre,
          })))
        }
      })
      .catch(() => { /* garde les slides fallback */ })
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % slides.length), 4000)
    return () => clearInterval(timer)
  }, [slides.length])

  function handleComparer() {
    const val = parseInt(montant, 10)
    if (!montant || isNaN(val) || val <= 0) {
      setErreur('Veuillez saisir un montant valide')
      return
    }
    setErreur('')
    setBesoin({ montant: val, duree: 12 })
    router.push('/resultats')
  }

  function handleSansCompte(e: React.MouseEvent) {
    e.preventDefault()
    setBesoin({ montant: 500000, duree: 12 })
    router.push('/resultats')
  }

  return (
    <>
      <Header />

      <main className="pb-[72px]">
        {/* ── Hero slider ── */}
        <section
          data-testid="slider-hero"
          role="region"
          aria-label="Offres en vedette"
          aria-live="polite"
          className="relative h-hero overflow-hidden"
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className={[
                'absolute inset-0 bg-gradient-to-br transition-opacity duration-700',
                slide.gradient,
                i === current ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
            >
              {/* bottom overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />

              {/* slide content */}
              <div className="absolute bottom-10 left-0 right-0 px-5">
                <span className={`inline-block rounded-pill px-3 py-1 text-xs font-bold mb-3 ${slide.badgeClass}`}>
                  {slide.badge}
                </span>
                <p className="text-white text-[22px] font-bold leading-snug">{slide.title}</p>
              </div>
            </div>
          ))}

          {/* dots */}
          <div role="tablist" aria-label="Slides" className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                role="tab"
                data-testid="slider-dot"
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                aria-selected={i === current}
                className={[
                  'transition-all duration-300',
                  i === current
                    ? 'w-6 h-2 rounded-pill bg-saffron'
                    : 'w-2 h-2 rounded-full bg-white',
                ].join(' ')}
              />
            ))}
          </div>
        </section>

        {/* ── Quickform ── */}
        <div className="px-5 py-5">
          <p className="text-[32px] font-extrabold text-anthracite leading-tight mb-4">Combien voulez-vous emprunter ?</p>

          <div className="flex items-center h-cta rounded-[14px] border border-sep px-4 transition-all focus-within:border-[2.5px] focus-within:border-emeraude focus-within:bg-emeraude-clair">
            <input
              data-testid="montant-input"
              type="number"
              placeholder="0"
              value={montant}
              aria-label="Montant souhaité en FCFA"
              onChange={e => { setMontant(e.target.value); setErreur('') }}
              className="flex-1 min-w-0 bg-transparent text-2xl font-bold text-anthracite outline-none placeholder:text-sep"
            />
            <span className="text-lg font-semibold text-gris ml-2 shrink-0">FCFA</span>
          </div>

          {erreur && <p className="text-sm text-red-500 mt-1">{erreur}</p>}

          <button
            data-testid="cta-comparer"
            onClick={handleComparer}
            className="w-full h-cta rounded-btn bg-saffron text-xl font-bold text-emeraude-foret shadow-cta mb-3 mt-[5px]"
          >
            Comparer les offres →
          </button>

          <p className="text-center text-sm text-gris">
            Ou{' '}
            <a href="#" onClick={handleSansCompte} className="text-emeraude font-semibold">
              continuer sans compte
            </a>
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="bg-emeraude-clair rounded-card mx-5 mb-6 px-3.5 py-[22px] grid grid-cols-3 divide-x divide-emeraude/20">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-1">
              <span className="text-[30px] font-extrabold text-emeraude-foret leading-none">{value}</span>
              <span className="text-sm text-emeraude font-medium text-center">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Cartes IMF (test) ── */}
        <div className="px-5 mb-6 flex flex-col gap-4">
          <CarteIMF
            nom="RCPB" ville="Ouagadougou" taux={2.5} teg={34.5}
            mensualite={47500} coutTotal={855000} duree={18} rating={4} isBest={true}
            onDetail={() => router.push('/imf/rcpb')}
            onSimuler={() => router.push('/simulateur')}
          />
          <CarteIMF
            nom="Coris Money" ville="Bobo-Dioulasso" taux={3.1} teg={42.8}
            mensualite={52300} coutTotal={941400} duree={18} rating={3}
            onDetail={() => router.push('/imf/coris-money')}
            onSimuler={() => router.push('/simulateur')}
          />
          <BanniereInFeed
            nomIMF="FAÎTIERE"
            initiales="FA"
            offre="Crédit commerce 500K FCFA à 2%/mois"
            sousTitre="Sans garantie immobilière · Réponse 48h"
          />
        </div>

        {/* ── Comment ça marche ── */}
        <section className="bg-saffron-clair px-5 pt-[26px] pb-[30px]">
          <h2 className="text-[23px] font-bold text-emeraude-foret mb-1">Comment ça marche</h2>
          <p className="text-[15px] text-[#8a5a13] mb-6">Simple, rapide, gratuit</p>

          <div className="flex flex-col gap-5">
            {steps.map(({ num, icon, title, desc }) => (
              <div key={num} className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-[18px] bg-white shadow-card flex items-center justify-center text-[30px]">
                    {icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emeraude text-white text-xs font-bold flex items-center justify-center">
                    {num}
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-base font-bold text-emeraude-foret">{title}</p>
                  <p className="text-sm text-gris mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNavbar active="accueil" />
    </>
  )
}
