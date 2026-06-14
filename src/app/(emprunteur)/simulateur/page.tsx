'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useBarakaStore } from '@/store/barakaStore'
import { calculerSimulation, formatFCFA, calcRepartition } from '@/lib/simulateur'

const DUREE_OPTIONS = [6, 9, 12, 18, 24]

const PRESETS_IMF = [
  { label: 'RCPB 26,82%',   teg: 26.82 },
  { label: 'ACFIME 28,15%', teg: 28.15 },
  { label: 'PAMF 29,40%',   teg: 29.40 },
  { label: 'C.Pop 31,20%',  teg: 31.20 },
]

const MONTANT_MIN = 25_000
const MONTANT_MAX = 10_000_000

function parseMontant(val: string): number {
  return parseInt(val.replace(/\s/g, '').replace(/[^0-9]/g, ''), 10)
}

export default function SimulateurPage() {
  const router = useRouter()

  const offreSelectionnee = useBarakaStore(s => s.offreSelectionnee)
  const besoin            = useBarakaStore(s => s.besoin)
  const setSimulation     = useBarakaStore(s => s.setSimulation)
  const user              = useBarakaStore(s => s.user)

  const initMontant = besoin?.montant ?? 500_000
  const initDuree   = besoin?.duree   ?? 12
  const initTeg     = offreSelectionnee?.teg_annuel ?? 26.82
  const offreId     = offreSelectionnee?.id ?? 0

  const [montantInput, setMontantInput] = useState(() => formatFCFA(initMontant))
  const [montant, setMontant]           = useState(initMontant)
  const [duree, setDuree]               = useState(initDuree)
  const [teg, setTeg]                   = useState(initTeg)

  const [montantError, setMontantError]   = useState('')
  const [tableauEtendu, setTableauEtendu] = useState(false)
  const [toast, setToast]                 = useState(false)

  const [sim, setSim] = useState(() =>
    calculerSimulation(offreId, initMontant, initDuree, initTeg)
  )

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const recalculer = useCallback(
    (m: number, d: number, t: number, id: number) => {
      const s = calculerSimulation(id, m, d, t)
      setSim(s)
      setSimulation(s)
    },
    [setSimulation],
  )

  useEffect(() => {
    recalculer(montant, duree, teg, offreId)
  }, [montant, duree, teg, offreId, recalculer])

  const handleMontantChange = (val: string) => {
    setMontantInput(val)
    const num = parseMontant(val)
    if (isNaN(num)) {
      setMontantError('Montant invalide')
      return
    }
    if (num < MONTANT_MIN) {
      setMontantError(`Minimum ${formatFCFA(MONTANT_MIN)} FCFA`)
    } else if (num > MONTANT_MAX) {
      setMontantError(`Maximum ${formatFCFA(MONTANT_MAX)} FCFA`)
    } else {
      setMontantError('')
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!isNaN(num) && num >= MONTANT_MIN && num <= MONTANT_MAX) {
        setMontant(num)
      }
    }, 300)
  }

  const handleMontantBlur = () => {
    const num = parseMontant(montantInput)
    if (!isNaN(num) && num >= MONTANT_MIN && num <= MONTANT_MAX) {
      setMontantInput(formatFCFA(num))
      setMontant(num)
    }
  }

  const handleSave = () => {
    if (!user) {
      router.push('/onboarding?redirect=/simulateur')
      return
    }
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  const { pctCapital, pctInterets } = calcRepartition(sim.montant, sim.cout_total)
  const totalInterets = sim.cout_total - sim.montant
  const tegSliderPct  = ((teg - 8) / (42 - 8)) * 100

  const tableau = sim.tableau
  const showCollapsed = !tableauEtendu && tableau.length > 4

  return (
    <div className="min-h-screen font-poppins" style={{ backgroundColor: '#F9FAFB' }}>

      {/* ── Header ── */}
      <header
        className="bg-white flex items-center px-4"
        style={{ height: 58, borderBottom: '1px solid #E5E7EB' }}
      >
        <button
          onClick={() => router.back()}
          aria-label="Retour"
          className="flex items-center justify-center"
          style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: '#F9FAFB', border: 'none', cursor: 'pointer' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="flex-1 text-center font-bold" style={{ fontSize: 18, color: '#111827' }}>
          Simulateur
        </p>
        <div style={{ width: 40 }} />
      </header>

      {/* ── Panneau résultats ── */}
      <div style={{ backgroundColor: '#0D5934', padding: 20 }}>
        <p style={{ fontSize: 12, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: 6 }}>
          REMBOURSEMENT MENSUEL
        </p>
        <p data-testid="mensualite-result" style={{ fontSize: 36, fontWeight: 800, color: '#F5A623', lineHeight: 1, marginBottom: 16 }}>
          {formatFCFA(sim.mensualite)}{' '}
          <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>FCFA/mois</span>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {[
            { label: 'Coût total',  value: `${formatFCFA(sim.cout_total)} F` },
            { label: 'Intérêts',    value: `${formatFCFA(totalInterets)} F` },
            { label: 'TEG',         value: `${teg.toFixed(2).replace('.', ',')} %` },
          ].map(col => (
            <div key={col.label}>
              <p style={{ fontSize: 12, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em', marginBottom: 2 }}>
                {col.label}
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{col.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Paramètres ── */}
      <main style={{ backgroundColor: 'white', padding: 20, paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Montant */}
        <section>
          <p style={{ fontSize: 13, textTransform: 'uppercase', color: '#6B7280', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
            MONTANT EMPRUNTÉ
          </p>
          <input
            data-testid="montant-input"
            type="text"
            inputMode="numeric"
            value={montantInput}
            aria-label="Montant emprunté en FCFA"
            onChange={e => handleMontantChange(e.target.value)}
            onFocus={e => { e.target.select(); setMontantInput(String(montant)) }}
            onBlur={handleMontantBlur}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 14,
              border: montantError ? '2px solid #E05C3A' : '1.5px solid #E5E7EB',
              fontSize: 22,
              fontWeight: 800,
              color: '#111827',
              padding: '0 16px',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
          {montantError && (
            <p style={{ color: '#E05C3A', fontSize: 12, marginTop: 4 }}>{montantError}</p>
          )}
        </section>

        {/* Durée pills */}
        <section>
          <p style={{ fontSize: 13, textTransform: 'uppercase', color: '#6B7280', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
            DURÉE
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DUREE_OPTIONS.map(d => (
              <button
                key={d}
                data-testid={`pill-duree-${d}`}
                onClick={() => setDuree(d)}
                style={{
                  height: 30,
                  padding: '0 16px',
                  borderRadius: 99,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: duree === d ? 700 : 500,
                  backgroundColor: duree === d ? '#0D5934' : '#F9FAFB',
                  color: duree === d ? 'white' : '#6B7280',
                  transition: 'background-color 0.15s, color 0.15s',
                }}
              >
                {d} mois
              </button>
            ))}
          </div>
        </section>

        {/* TEG */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <p style={{ fontSize: 13, textTransform: 'uppercase', color: '#6B7280', fontWeight: 600, letterSpacing: '0.04em' }}>
              TEG ANNUEL
            </p>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#1B6B44' }}>
              {teg.toFixed(2).replace('.', ',')} %
            </p>
          </div>

          {/* Slider track + thumb */}
          <div style={{ position: 'relative', height: 22, display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            {/* Track background */}
            <div style={{ position: 'absolute', left: 0, right: 0, height: 8, borderRadius: 99, backgroundColor: '#E5E7EB' }} />
            {/* Track filled */}
            <div style={{ position: 'absolute', left: 0, height: 8, borderRadius: 99, backgroundColor: '#2A9D6E', width: `${tegSliderPct}%` }} />
            {/* Invisible native input for interaction */}
            <input
              data-testid="teg-input"
              type="range"
              min={8}
              max={42}
              step={0.01}
              value={teg}
              aria-label="TEG annuel"
              onChange={e => setTeg(Number(e.target.value))}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                margin: 0,
                zIndex: 2,
              }}
            />
            {/* Custom thumb */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${tegSliderPct}%`,
                transform: 'translate(-50%, -50%)',
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: 'white',
                border: '2px solid #2A9D6E',
                pointerEvents: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                zIndex: 1,
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>8%</span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>42%</span>
          </div>

          {/* IMF Presets */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
              {PRESETS_IMF.map(p => {
                const active = Math.abs(teg - p.teg) < 0.005
                return (
                  <button
                    key={p.label}
                    onClick={() => setTeg(p.teg)}
                    style={{
                      flexShrink: 0,
                      height: 30,
                      padding: '0 12px',
                      borderRadius: 99,
                      border: `1.5px solid ${active ? '#0D5934' : '#E5E7EB'}`,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      backgroundColor: active ? '#E3F5EC' : 'white',
                      color: active ? '#0D5934' : '#6B7280',
                      whiteSpace: 'nowrap',
                      fontFamily: 'inherit',
                    }}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Répartition capital / intérêts */}
        <section>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 12 }}>
            Répartition du coût total
          </p>
          <div style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', width: '100%' }}>
            <div style={{ width: `${pctCapital}%`, backgroundColor: '#2A9D6E' }} />
            <div style={{ flex: 1, backgroundColor: '#F5A623' }} />
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2A9D6E', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#2A9D6E', fontWeight: 600 }}>Capital {pctCapital}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#F5A623', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#B87A00', fontWeight: 600 }}>Intérêts {pctInterets}%</span>
            </div>
          </div>
        </section>

        {/* Tableau d'amortissement */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Plan de remboursement</p>
            <span style={{ backgroundColor: '#E3F5EC', color: '#0D5934', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
              {tableau.length} mois
            </span>
          </div>

          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
            {/* En-têtes */}
            <div style={{ display: 'grid', gridTemplateColumns: '0.6fr 1fr 1fr', backgroundColor: '#E3F5EC', padding: '10px 12px' }}>
              {['MOIS', 'CAPITAL', 'INTÉRÊTS'].map(h => (
                <p key={h} style={{ fontSize: 12, fontWeight: 700, color: '#0D5934', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>
                  {h}
                </p>
              ))}
            </div>

            {/* Lignes affichées */}
            {(showCollapsed ? tableau.slice(0, 3) : tableau).map((row, i) => (
              <div
                key={row.mois}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '0.6fr 1fr 1fr',
                  padding: '12px',
                  backgroundColor: i % 2 === 0 ? 'white' : '#F9FAFB',
                  borderTop: '1px solid #E5E7EB',
                }}
              >
                <p style={{ fontSize: 15, color: '#0D5934', fontWeight: 700, textAlign: 'center' }}>{row.mois}</p>
                <p style={{ fontSize: 15, color: '#111827', textAlign: 'center' }}>{formatFCFA(row.capital)} F</p>
                <p style={{ fontSize: 15, color: '#111827', textAlign: 'center' }}>{formatFCFA(row.interets)} F</p>
              </div>
            ))}

            {/* Ligne … */}
            {showCollapsed && (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '0.6fr 1fr 1fr',
                    padding: '8px 12px',
                    backgroundColor: 'white',
                    borderTop: '1px solid #E5E7EB',
                  }}
                >
                  {['…', '…', '…'].map((dot, i) => (
                    <p key={i} style={{ fontSize: 15, color: '#D1D5DB', textAlign: 'center' }}>{dot}</p>
                  ))}
                </div>
                {/* Dernière ligne */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '0.6fr 1fr 1fr',
                    padding: '12px',
                    backgroundColor: '#F9FAFB',
                    borderTop: '1px solid #E5E7EB',
                  }}
                >
                  <p style={{ fontSize: 15, color: '#0D5934', fontWeight: 700, textAlign: 'center' }}>{tableau[tableau.length - 1].mois}</p>
                  <p style={{ fontSize: 15, color: '#111827', textAlign: 'center' }}>{formatFCFA(tableau[tableau.length - 1].capital)} F</p>
                  <p style={{ fontSize: 15, color: '#111827', textAlign: 'center' }}>{formatFCFA(tableau[tableau.length - 1].interets)} F</p>
                </div>
              </>
            )}
          </div>

          {showCollapsed && (
            <button
              onClick={() => setTableauEtendu(true)}
              style={{
                marginTop: 10,
                width: '100%',
                height: 40,
                borderRadius: 10,
                border: '1.5px solid #0D5934',
                backgroundColor: 'transparent',
                color: '#0D5934',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Voir le plan complet ({tableau.length} mois)
            </button>
          )}
        </section>

        {/* Bouton sauvegarder */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            height: 56,
            borderRadius: 16,
            border: 'none',
            backgroundColor: '#0D5934',
            color: 'white',
            fontSize: 17,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontFamily: 'inherit',
          }}
        >
          💾 Sauvegarder cette simulation
        </button>
      </main>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 88,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#0D5934',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: 200,
            whiteSpace: 'nowrap',
            animation: 'toastSlide 0.3s ease',
          }}
        >
          ✓ Simulation sauvegardée
        </div>
      )}

      <style jsx global>{`
        @keyframes toastSlide {
          from { transform: translateX(-50%) translateY(16px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}
