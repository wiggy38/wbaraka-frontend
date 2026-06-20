'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import BottomNavbar from '@/components/layout/BottomNavbar'
import { FallbackIMF } from '@/components/shared/FallbackIMF'
import { useBarakaStore } from '@/store/barakaStore'
import { fetchOffreBySlug, ajouterFavoriAPI, supprimerFavoriAPI } from '@/lib/api'
import type { Offre, LigneAmortissement } from '@/types'

type Tab = 'resume' | 'conditions' | 'documents'

const TABS: { key: Tab; label: string }[] = [
  { key: 'resume',     label: 'Résumé'     },
  { key: 'conditions', label: 'Conditions' },
  { key: 'documents',  label: 'Documents'  },
]

const DOCUMENTS_REQUIS = [
  "Pièce d'identité (CNI ou passeport)",
  'Justificatif de domicile',
  'Justificatif de revenus (3 derniers mois)',
  'Formulaire de demande de crédit',
]

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? 'text-saffron' : 'text-sep'}>★</span>
      ))}
    </span>
  )
}

export default function FicheIMFPage() {
  const router = useRouter()
  const params = useParams<{ slug: string }>()

  const {
    besoin,
    offreSelectionnee,
    isFavori,
    ajouterFavori,
    supprimerFavori,
    user,
  } = useBarakaStore()

  const [offre, setOffre] = useState<Offre | null>(offreSelectionnee)
  const [loading, setLoading] = useState(!offreSelectionnee)
  const [tab, setTab] = useState<Tab>('resume')
  const [logoError, setLogoError] = useState(false)
  const [favori, setFavori] = useState(() =>
    offreSelectionnee ? isFavori(offreSelectionnee.id) : false
  )
  const [heartAnim, setHeartAnim] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const btnContactRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // 1. Montage : fallback fetch si store vide
  useEffect(() => {
    if (offreSelectionnee) return

    fetchOffreBySlug(params.slug).then((data) => {
      if (!data) {
        router.replace('/resultats')
        return
      }
      setOffre(data)
      setFavori(isFavori(data.id))
      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Focus trap + return focus when modal opens/closes
  const wasModalOpenRef = useRef(false)
  useEffect(() => {
    if (showModal) {
      wasModalOpenRef.current = true
      const modal = modalRef.current
      if (!modal) return
      const focusable = modal.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      )
      focusable[0]?.focus()

      const trapFocus = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowModal(false)
          return
        }
        if (e.key !== 'Tab') return
        const els = modal!.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
        const first = els[0]
        const last = els[els.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus() }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus() }
        }
      }

      document.addEventListener('keydown', trapFocus)
      return () => document.removeEventListener('keydown', trapFocus)
    } else if (wasModalOpenRef.current) {
      btnContactRef.current?.focus()
    }
  }, [showModal])

  // 3. Toggle favori
  const toggleFavori = useCallback(async () => {
    if (!offre) return
    const next = !favori
    setFavori(next)
    setHeartAnim(true)
    setTimeout(() => setHeartAnim(false), 200)
    if (next) {
      ajouterFavori(offre)
      if (user) ajouterFavoriAPI(offre.id).catch(() => {})
    } else {
      supprimerFavori(offre.id)
      if (user) supprimerFavoriAPI(offre.id).catch(() => {})
    }
  }, [offre, favori, user, ajouterFavori, supprimerFavori])

  const tableauAmortissement = useMemo((): LigneAmortissement[] => {
    if (!offre || !besoin) return []
    const { montant, duree } = besoin
    if (!montant || !duree) return []
    const r = offre.taux_mensuel / 100
    const mensualite = r === 0
      ? montant / duree
      : (montant * r * Math.pow(1 + r, duree)) / (Math.pow(1 + r, duree) - 1)
    const lignes: LigneAmortissement[] = []
    let restant = montant
    for (let mois = 1; mois <= duree; mois++) {
      const interets = restant * r
      const capital = mensualite - interets
      restant = Math.max(0, restant - capital)
      lignes.push({
        mois,
        capital: Math.round(capital),
        interets: Math.round(interets),
        mensualite: Math.round(mensualite),
        capital_restant: Math.round(restant),
      })
    }
    return lignes
  }, [offre, besoin])

  if (loading || !offre) {
    return (
      <div className="min-h-screen bg-fond flex items-center justify-center font-poppins">
        <span className="text-gris text-[14px]">Chargement…</span>
      </div>
    )
  }

  const { imf } = offre

  const mensualiteAffichee = tableauAmortissement[0]?.mensualite ?? offre.mensualite_estimee
  const coutTotalAffiche = tableauAmortissement.length > 0
    ? tableauAmortissement.reduce((acc, l) => acc + l.mensualite, 0) + offre.frais_dossier
    : offre.cout_total

  return (
    <div data-testid="fiche-imf" className="relative min-h-screen bg-fond font-poppins pb-[144px]">

      {/* ── Header ── */}
      <Header showBack title={imf.nom} />

      {/* ── Hero ── */}
      <div
        className="relative h-hero-fiche overflow-hidden border-b border-sep flex flex-col items-center justify-center"
        style={{ background: imf.cover_gradient || '#e8f5e9' }}
      >
        {besoin?.montant && (
          <>
            <p className="text-[13px] font-semibold text-white/80 uppercase tracking-widest">Montant du prêt</p>
            <p className="text-[40px] font-extrabold text-white leading-tight">
              {besoin.montant.toLocaleString('fr-FR')}{' '}
              <span className="text-[24px]">FCFA</span>
            </p>
          </>
        )}
      </div>

      {/* ── Logo flottant + bouton favori ── */}
      <div className="relative -mt-7 flex justify-between items-end px-5 z-10">
        <div
          className="w-14 h-14 flex items-center justify-center bg-white"
          style={{ borderRadius: 14, border: '3px solid white', boxShadow: '0 4px 18px rgba(0,0,0,0.18)' }}
        >
          {imf.logo_url && !logoError
            ? <Image src={imf.logo_url} width={40} height={40} alt={`Logo ${imf.nom}`} className="object-contain" onError={() => setLogoError(true)} />
            : <FallbackIMF nom={imf.nom} type="logo" />
          }
        </div>

        {/* 3. Bouton favori ♡ */}
        <button
          onClick={toggleFavori}
          aria-label={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className={[
            'w-10 h-10 flex items-center justify-center rounded-full bg-white transition-transform duration-200',
            heartAnim ? 'scale-[1.3]' : 'scale-100',
          ].join(' ')}
          style={{ boxShadow: '0 4px 18px rgba(0,0,0,0.15)' }}
        >
          <span className={`text-[22px] leading-none ${favori ? 'text-red-500' : 'text-gris'}`}>
            {favori ? '♥' : '♡'}
          </span>
        </button>
      </div>

      {/* ── Identité ── */}
      <div className="flex flex-col items-center gap-2 mt-3 px-5">
        <h1 className="text-[22px] font-extrabold text-anthracite">{imf.nom}</h1>
        <span className="rounded-pill bg-emeraude-clair px-3 py-1 text-[13px] font-semibold text-emeraude-foret">
          {imf.ville}
        </span>
      </div>

      {/* ── Résumé mensualité ── */}
      <div className="flex flex-col items-center gap-1 mt-4 px-5">
        <p className="text-[28px] font-extrabold leading-tight" style={{ color: '#B87A00' }}>
          {mensualiteAffichee.toLocaleString('fr-FR')}{' '}
          <span className="text-[18px]">FCFA</span>
          <span className="text-[16px] font-semibold text-anthracite"> par mois</span>
        </p>
        <p className="text-[16px] text-gris text-center">
          Total à rembourser&nbsp;:{' '}
          <span className="font-semibold text-anthracite">
            {coutTotalAffiche.toLocaleString('fr-FR')} FCFA
          </span>
        </p>
      </div>

      {/* ── Chiffres clés ── */}
      <div className="mx-5 mt-5 grid grid-cols-3 divide-x divide-sep rounded-card bg-white shadow-card overflow-hidden">
        <div className="flex flex-col items-center py-4 gap-0.5">
          <span className="text-[22px] font-extrabold text-emeraude-foret">{offre.taux_mensuel}%</span>
          <span className="text-[11px] text-gris font-medium">Taux mensuel</span>
        </div>
        <div className="flex flex-col items-center py-4 gap-0.5">
          <span className="text-[22px] font-extrabold" style={{ color: '#B87A00' }}>{offre.teg_annuel}%</span>
          <span className="text-[11px] text-gris font-medium">TEG annuel</span>
        </div>
        <div className="flex flex-col items-center py-4 gap-1">
          <Stars count={imf.rating} />
          <span className="text-[11px] text-gris font-medium">Rating</span>
        </div>
      </div>

      {/* ── Onglets ── */}
      <div className="mt-6 border-b border-sep bg-white flex">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={[
              'flex-1 py-3 text-[14px] font-semibold transition-colors',
              tab === key
                ? 'border-b-2 border-saffron'
                : 'text-gris border-b-2 border-transparent',
            ].join(' ')}
            style={tab === key ? { color: '#B87A00' } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Contenu onglets ── */}
      <div className="px-5 mt-5 pb-8">

        {/* Résumé */}
        {tab === 'resume' && (
          <div className="rounded-card bg-white shadow-card overflow-hidden">
            {[
              { label: 'Montant minimum',     value: `${offre.montant_min.toLocaleString('fr-FR')} FCFA` },
              { label: 'Montant maximum',     value: `${offre.montant_max.toLocaleString('fr-FR')} FCFA` },
              { label: 'Durée minimum',       value: `${offre.duree_min} mois` },
              { label: 'Durée maximum',       value: `${offre.duree_max} mois` },
              { label: 'Mensualité estimée',  value: `${offre.mensualite_estimee.toLocaleString('fr-FR')} FCFA` },
              { label: 'Coût total',          value: `${offre.cout_total.toLocaleString('fr-FR')} FCFA` },
              { label: 'Frais de dossier',    value: `${offre.frais_dossier.toLocaleString('fr-FR')} FCFA` },
              { label: 'Délai de traitement', value: offre.delai_traitement },
            ].map(({ label, value }, i, arr) => (
              <div
                key={label}
                className={[
                  'flex items-start justify-between gap-3 px-4 py-3.5',
                  i < arr.length - 1 ? 'border-b border-sep' : '',
                ].join(' ')}
              >
                <span className="text-[13px] text-gris font-medium shrink-0">{label}</span>
                <span className="text-[13px] text-anthracite font-semibold text-right">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Conditions */}
        {tab === 'conditions' && (
          <div className="rounded-card bg-white shadow-card overflow-hidden">
            {offre.garanties.length > 0 ? (
              offre.garanties.map((g, i, arr) => (
                <div
                  key={g}
                  className={[
                    'flex items-center gap-3 px-4 py-3.5',
                    i < arr.length - 1 ? 'border-b border-sep' : '',
                  ].join(' ')}
                >
                  <span className="text-emeraude-foret font-bold text-[15px]">✓</span>
                  <span className="text-[13px] text-anthracite font-medium">{g}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-[13px] text-gris">
                Aucune condition renseignée.
              </div>
            )}
          </div>
        )}

        {/* Documents */}
        {tab === 'documents' && (
          <div className="rounded-card bg-white shadow-card overflow-hidden">
            {DOCUMENTS_REQUIS.map((doc, i, arr) => (
              <div
                key={doc}
                className={[
                  'flex items-center gap-3 px-4 py-3.5',
                  i < arr.length - 1 ? 'border-b border-sep' : '',
                ].join(' ')}
              >
                <span className="text-[16px]">📄</span>
                <span className="text-[13px] text-anthracite font-medium">{doc}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tableau d'amortissement ── */}
      {tableauAmortissement.length > 0 && (
        <div className="px-5 pb-8">
          <h2 className="text-[16px] font-extrabold text-anthracite mb-3">
            Tableau d&apos;amortissement
          </h2>
          <p className="text-[12px] text-gris mb-3">
            Basé sur {besoin!.montant.toLocaleString('fr-FR')} FCFA sur {besoin!.duree} mois
          </p>
          <div className="rounded-card bg-white shadow-card overflow-x-auto">
            <table className="w-full min-w-[480px] text-[12px]">
              <thead>
                <tr className="border-b border-sep bg-fond">
                  <th className="px-3 py-2.5 text-left font-semibold text-gris">Mois</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gris">Mensualité</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gris">Capital</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gris">Intérêts</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gris">Restant dû</th>
                </tr>
              </thead>
              <tbody>
                {tableauAmortissement.map((ligne, i, arr) => (
                  <tr
                    key={ligne.mois}
                    className={[
                      i < arr.length - 1 ? 'border-b border-sep' : '',
                      i % 2 === 1 ? 'bg-fond/50' : '',
                    ].join(' ')}
                  >
                    <td className="px-3 py-2.5 font-semibold text-anthracite">{ligne.mois}</td>
                    <td className="px-3 py-2.5 text-right text-anthracite font-semibold">
                      {ligne.mensualite.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-3 py-2.5 text-right text-emeraude-foret font-medium">
                      {ligne.capital.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium" style={{ color: '#B87A00' }}>
                      {ligne.interets.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-3 py-2.5 text-right text-gris">
                      {ligne.capital_restant.toLocaleString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CTA sticky ── */}
      <div className="fixed bottom-[72px] inset-x-0 z-20 bg-white border-t border-sep px-4 pt-3 pb-3 flex gap-3">
        {/* Contacter l'IMF */}
        <button
          ref={btnContactRef}
          onClick={() => setShowModal(true)}
          className="flex-1 rounded-btn bg-emeraude-foret text-[15px] font-bold text-white"
          style={{ height: 56 }}
        >
          Contacter l&apos;IMF
        </button>
      </div>

      {/* ── Modal contact IMF ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5"
          onClick={() => setShowModal(false)}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="bg-white rounded-card w-full max-w-sm p-6 flex flex-col gap-4"
            style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h2 id="modal-title" className="text-[18px] font-extrabold text-anthracite">{imf.nom}</h2>
              <p className="text-[13px] text-gris mt-0.5">{imf.ville}</p>
            </div>

            <a
              href="https://wa.me/+22600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-btn text-white text-[15px] font-bold py-4"
              style={{ background: '#25D366' }}
            >
              <span className="text-[20px] leading-none">💬</span>
              WhatsApp
            </a>

            <button
              onClick={() => setShowModal(false)}
              className="rounded-btn border border-sep text-[14px] font-semibold text-gris py-3"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <BottomNavbar active="comparer" />
    </div>
  )
}
