'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import BottomNavbar from '@/components/layout/BottomNavbar'
import { useBarakaStore } from '@/store/barakaStore'

const MONTANT_MIN = 10_000
const MONTANT_MAX = 10_000_000

const DUREES = [6, 12, 18, 24, 36]

const ACTIVITES = [
  { value: 'commerce',    icon: '🛒', label: 'Commerce' },
  { value: 'agriculture', icon: '🌾', label: 'Agriculture' },
  { value: 'habitat',     icon: '🏠', label: 'Habitat' },
  { value: 'elevage',     icon: '🐄', label: 'Élevage' },
  { value: 'education',   icon: '📚', label: 'Éducation' },
  { value: 'autre',       icon: '💡', label: 'Autre' },
]

function formatMontant(val: number | null): string {
  if (val === null || isNaN(val)) return '0'
  return val.toLocaleString('fr-FR')
}

export default function BesoinPage() {
  const router = useRouter()
  const storedBesoin = useBarakaStore(s => s.besoin)
  const setBesoin = useBarakaStore(s => s.setBesoin)

  const [montantRaw, setMontantRaw] = useState<string>(
    storedBesoin?.montant ? String(storedBesoin.montant) : ''
  )
  const [duree, setDuree] = useState<number | null>(storedBesoin?.duree ?? null)
  const [activite, setActivite] = useState<string | null>(storedBesoin?.activite ?? null)

  const montantNum = montantRaw === '' ? null : Number(montantRaw)
  const montantValide =
    montantNum !== null &&
    !isNaN(montantNum) &&
    montantNum >= MONTANT_MIN &&
    montantNum <= MONTANT_MAX
  const montantErreur =
    montantNum !== null &&
    !isNaN(montantNum) &&
    !montantValide
      ? montantNum < MONTANT_MIN
        ? `Minimum ${formatMontant(MONTANT_MIN)} FCFA`
        : `Maximum ${formatMontant(MONTANT_MAX)} FCFA`
      : null

  const peutContinuer = montantValide && duree !== null

  function handleCta() {
    if (!peutContinuer) return
    setBesoin({
      montant: montantNum!,
      duree: duree!,
      activite: activite ?? undefined,
      ville: undefined,
    })
    router.push('/resultats')
  }

  return (
    <div className="flex flex-col min-h-screen bg-fond">
      <Header showBack title="Mon besoin" />

      {/* ── Barre de progression ── */}
      <div className="flex gap-1.5 px-5 pt-4 pb-2">
        <div className="flex-1 h-[5px] rounded-pill bg-emeraude" />
        <div className="flex-1 h-[5px] rounded-pill bg-saffron" />
        <div className="flex-1 h-[5px] rounded-pill bg-sep" />
      </div>

      <main className="flex-1 px-5 pt-5 pb-[88px] flex flex-col gap-7">

        {/* ── Montant ── */}
        <section>
          <p className="text-[15px] font-semibold text-anthracite mb-1">
            Combien voulez-vous emprunter ?
          </p>
          <p className="text-[13px] text-gris mb-2">
            {montantValide
              ? `${formatMontant(montantNum)} FCFA`
              : `Entre ${formatMontant(MONTANT_MIN)} et ${formatMontant(MONTANT_MAX)} FCFA`}
          </p>
          <div className={`flex items-center h-[56px] rounded-[14px] border px-4 bg-white transition-all focus-within:border-[2px]
            ${montantErreur
              ? 'border-[2px] border-[#C0392B]'
              : 'border-sep focus-within:border-emeraude focus-within:bg-emeraude-clair'}`}>
            <input
              data-testid="montant-input"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={montantRaw}
              onChange={e => setMontantRaw(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-[22px] font-extrabold text-anthracite outline-none placeholder:text-sep"
            />
            <span className="text-base font-semibold text-gris ml-2 shrink-0">FCFA</span>
          </div>
          {montantErreur && (
            <p className="mt-1.5 text-[14px] text-[#C0392B]">{montantErreur}</p>
          )}
        </section>

        {/* ── Durée ── */}
        <section>
          <p className="text-[15px] font-semibold text-anthracite mb-3">Durée du crédit</p>
          <div className="flex flex-wrap gap-2">
            {DUREES.map(d => (
              <button
                key={d}
                data-testid={`pill-duree-${d}`}
                onClick={() => setDuree(d)}
                className={`px-4 py-2 rounded-full text-[14px] font-semibold border transition-all
                  ${duree === d
                    ? 'bg-emeraude text-white border-emeraude'
                    : 'bg-white text-anthracite border-sep'}`}
              >
                {d} mois
              </button>
            ))}
          </div>
        </section>

        {/* ── Pour quoi ── */}
        <section>
          <p className="text-[15px] font-semibold text-anthracite mb-3">Pour quoi faire ?</p>
          <div className="grid grid-cols-3 gap-3">
            {ACTIVITES.map(a => (
              <button
                key={a.value}
                onClick={() => setActivite(a.value)}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-[14px] border transition-all
                  ${activite === a.value
                    ? 'bg-emeraude-clair border-emeraude'
                    : 'bg-white border-sep'}`}
              >
                <span className="text-2xl">{a.icon}</span>
                <span className={`text-[13px] font-semibold ${activite === a.value ? 'text-emeraude' : 'text-anthracite'}`}>
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* ── CTA sticky ── */}
      <div className="fixed bottom-[72px] left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-4 pt-3 bg-fond">
        <button
          data-testid="cta-voir-offres"
          onClick={handleCta}
          disabled={!peutContinuer}
          style={{ opacity: peutContinuer ? 1 : 0.5, cursor: peutContinuer ? 'pointer' : 'not-allowed' }}
          className="w-full h-cta rounded-btn bg-saffron text-xl font-bold text-emeraude-foret shadow-cta"
        >
          Voir les offres →
        </button>
      </div>

      <BottomNavbar active="comparer" />
    </div>
  )
}
