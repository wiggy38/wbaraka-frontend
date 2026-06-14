'use client'

import { Fragment, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import BottomNavbar from '@/components/layout/BottomNavbar'
import BanniereInFeed from '@/components/emprunteur/BanniereInFeed'

const CarteIMF = dynamic(
  () => import('@/components/emprunteur/CarteIMF').then(m => m.CarteIMF),
  { loading: () => <div className="h-52 bg-gray-100 animate-pulse rounded-[20px]" />, ssr: false },
)
import { useBarakaStore } from '@/store/barakaStore'
import { fetchOffres } from '@/lib/api'
import { OFFRES_MOCK } from '@/lib/mockData'
import type { Offre } from '@/types'

const SORT_PILLS = [
  { label: 'Mensualité ↑', key: 'mensualite' },
  { label: 'TEG ↑',        key: 'teg'        },
  { label: 'Nom A-Z',      key: 'nom'        },
] as const

type SortKey = typeof SORT_PILLS[number]['key']

function sortOffres(offres: Offre[], key: SortKey): Offre[] {
  return [...offres].sort((a, b) => {
    if (key === 'mensualite') return a.mensualite_estimee - b.mensualite_estimee
    if (key === 'teg')        return a.teg_annuel - b.teg_annuel
    if (key === 'nom')        return a.imf.nom.localeCompare(b.imf.nom, 'fr')
    return 0
  })
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[20px] bg-gray-200" style={{ height: 220 }} />
  )
}

export default function ResultatsPage() {
  const router  = useRouter()
  const besoin  = useBarakaStore(s => s.besoin)
  const setResultats         = useBarakaStore(s => s.setResultats)
  const setOffreSelectionnee = useBarakaStore(s => s.setOffreSelectionnee)

  const [offres,   setOffres]   = useState<Offre[]>([])
  const [loading,  setLoading]  = useState(true)
  const [sortKey,  setSortKey]  = useState<SortKey>('mensualite')

  useEffect(() => {
    if (!besoin) {
      router.replace('/besoin')
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = await fetchOffres(besoin!)
        if (!cancelled) {
          setOffres(data)
          setResultats(data)
        }
      } catch {
        if (!cancelled) {
          setOffres(OFFRES_MOCK)
          setResultats(OFFRES_MOCK)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sorted   = sortOffres(offres, sortKey)
  const sponsored = offres.find(o => o.is_sponsored)

  const montantFmt = besoin
    ? besoin.montant.toLocaleString('fr-FR')
    : '—'
  const dureeFmt = besoin?.duree ?? '—'

  return (
    <div className="relative min-h-screen bg-fond font-poppins">
      <Header showBack title="Résultats" />

      {/* Bandeau résumé */}
      <div className="bg-white px-5 py-4 flex items-center justify-between gap-3 border-b border-sep">
        <div className="flex flex-col leading-snug">
          <p className="text-anthracite text-[15px] font-semibold">
            Pour <span className="font-extrabold">{montantFmt} FCFA</span>
          </p>
          <p className="text-gris text-[13px] font-semibold">
            Pendant <span className="font-extrabold text-anthracite">{dureeFmt} mois</span>
          </p>
        </div>
        {/* FIX [Parcours 2] : ajout de l'emoji ✏️ pour matcher la spec du parcours "Modifier ✏️" */}
        <button
          onClick={() => router.push('/besoin')}
          className="h-[38px] shrink-0 rounded-pill bg-saffron px-4 text-[13px] font-bold text-emeraude-foret shadow-cta"
        >
          Modifier ✏️
        </button>
      </div>

      {/* Barre tri */}
      <div className="bg-white border-b border-sep px-4 py-3 flex items-center gap-2">
        <span className="text-[12px] text-gris font-medium shrink-0">Trier par :</span>
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {SORT_PILLS.map(pill => (
            <button
              key={pill.key}
              data-testid={pill.key === 'teg' ? 'tri-teg' : undefined}
              onClick={() => setSortKey(pill.key)}
              className={[
                'shrink-0 rounded-pill px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
                sortKey === pill.key
                  ? 'bg-emeraude-foret text-white'
                  : 'bg-fond text-gris border border-sep',
              ].join(' ')}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <main className="px-4 pt-4 pb-[96px] flex flex-col gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          sorted.map((offre, i) => (
            <Fragment key={offre.id}>
              <CarteIMF
                nom={offre.imf.nom}
                ville={offre.imf.ville}
                taux={offre.taux_mensuel}
                teg={offre.teg_annuel}
                mensualite={offre.mensualite_estimee}
                coutTotal={offre.cout_total}
                duree={besoin?.duree ?? offre.duree_min}
                rating={offre.imf.rating}
                isBest={offre.is_best}
                coverGradient={offre.imf.cover_gradient}
                logoUrl={offre.imf.logo_url ?? undefined}
                coverUrl={offre.imf.cover_url ?? undefined}
                onDetail={() => {
                  setOffreSelectionnee(offre)
                  router.push(`/imf/${offre.imf.slug}`)
                }}
                onSimuler={() => {
                  setOffreSelectionnee(offre)
                  router.push('/simulateur')
                }}
              />
              {i === 2 && sponsored && (
                <BanniereInFeed
                  nomIMF={sponsored.imf.nom}
                  initiales={sponsored.imf.nom.slice(0, 2).toUpperCase()}
                  offre={`Crédit ${sponsored.imf.nom} à ${sponsored.taux_mensuel}%/mois`}
                  sousTitre={`Sans garantie immobilière · Réponse ${sponsored.delai_traitement}`}
                />
              )}
            </Fragment>
          ))
        )}
      </main>

      {/* FAB Comparer */}
      <div className="pointer-events-none fixed bottom-[84px] right-4 z-20">
        <button
          className="pointer-events-auto flex items-center gap-2 bg-saffron px-5 text-[15px] font-bold text-emeraude-foret shadow-cta"
          style={{ height: 60, borderRadius: 99 }}
        >
          <span className="text-[18px]">⚖️</span>
          Comparer (2)
        </button>
      </div>

      <BottomNavbar active="comparer" />
    </div>
  )
}
