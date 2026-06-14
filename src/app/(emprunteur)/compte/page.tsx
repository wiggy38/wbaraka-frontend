'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import BottomNavbar from '@/components/layout/BottomNavbar'
import { useBarakaStore } from '@/store/barakaStore'
import { formatFCFA } from '@/lib/utils'

export default function ComptePage() {
  const router = useRouter()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const user = useBarakaStore(s => s.user)
  const favoris = useBarakaStore(s => s.favoris)
  const simulationsSauvegardees = useBarakaStore(s => s.simulationsSauvegardees)
  const resultats = useBarakaStore(s => s.resultats)
  const logout = useBarakaStore(s => s.logout)
  const supprimerFavori = useBarakaStore(s => s.supprimerFavori)
  const setOffreSelectionnee = useBarakaStore(s => s.setOffreSelectionnee)
  const setSimulation = useBarakaStore(s => s.setSimulation)

  const initiales = user ? user.prenom.slice(0, 2).toUpperCase() : '?'

  const stats = [
    { label: 'Recherches', value: 0 },
    { label: 'Favoris', value: favoris.length },
    { label: 'Simulations', value: simulationsSauvegardees.length },
  ]

  const recentSimulations = [...simulationsSauvegardees].reverse().slice(0, 5)

  function findOffreName(offre_id: number) {
    return (
      [...resultats, ...favoris].find(o => o.id === offre_id)?.imf.nom ??
      `Offre #${offre_id}`
    )
  }

  function handleLogout() {
    logout()
    setShowLogoutModal(false)
    router.push('/accueil')
  }

  return (
    <>
      <Header showBack title="Mon compte" />

      {/* ── Modal déconnexion ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="bg-white rounded-card p-6 w-full max-w-sm shadow-card">
            <p className="text-[17px] font-bold text-anthracite text-center mb-1">
              Déconnexion
            </p>
            <p className="text-[14px] text-gris text-center mb-6">
              Voulez-vous vous déconnecter&nbsp;?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-btn border border-sep text-[15px] font-semibold text-anthracite"
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-btn text-[15px] font-semibold text-white"
                style={{ background: '#C0392B' }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pb-[72px]">
        {/* ── Hero profil ── */}
        <div style={{ background: 'linear-gradient(135deg, #0D5934 0%, #1B6B44 100%)' }}>
          <div className="flex flex-col items-center gap-3 px-5 pt-8 pb-5">
            {/* Avatar */}
            <div
              className="flex items-center justify-center text-[26px] font-extrabold"
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: user ? '#F5A623' : '#4B5563',
                color: user ? '#0D5934' : '#fff',
                flexShrink: 0,
              }}
            >
              {initiales}
            </div>

            {user ? (
              <div className="text-center">
                <p className="text-[21px] font-extrabold text-white leading-tight">{user.prenom}</p>
                {user.activite && (
                  <p className="text-[14px] mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {user.activite}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center flex flex-col items-center gap-2">
                <p className="text-[15px] text-white/80">Non connecté</p>
                <button
                  onClick={() => router.push('/onboarding')}
                  className="px-5 py-2 rounded-pill text-[14px] font-semibold text-white"
                  style={{ border: '1px solid rgba(255,255,255,0.5)' }}
                >
                  Se connecter
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 divide-x"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            {stats.map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center py-4">
                <span className="text-[22px] font-extrabold text-white">{value}</span>
                <span className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.70)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mes favoris ── */}
        <section className="px-5 pt-6 pb-2">
          <h2 className="text-[18px] font-bold text-anthracite mb-4">Mes favoris</h2>

          {!user || favoris.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <p className="text-[14px] text-gris text-center">
                {!user
                  ? 'Connectez-vous pour voir vos favoris.'
                  : 'Aucun favori pour l’instant.'}
              </p>
              <button
                onClick={() => router.push(user ? '/besoin' : '/onboarding')}
                className="text-[14px] font-semibold"
                style={{ color: '#1B6B44' }}
              >
                {user ? 'Comparer des offres →' : 'Se connecter →'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {favoris.map((offre) => (
                <div
                  key={offre.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setOffreSelectionnee(offre)
                    router.push(`/imf/${offre.imf.slug}`)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setOffreSelectionnee(offre)
                      router.push(`/imf/${offre.imf.slug}`)
                    }
                  }}
                  className="flex items-center gap-3 bg-white rounded-card border border-sep shadow-card px-3 cursor-pointer"
                  style={{ height: 72 }}
                >
                  {/* Logo */}
                  <div
                    className="shrink-0 bg-fond overflow-hidden flex items-center justify-center"
                    style={{ width: 44, height: 44, borderRadius: 10 }}
                  >
                    {offre.imf.logo_url ? (
                      <Image
                        src={offre.imf.logo_url}
                        alt={offre.imf.nom}
                        width={44}
                        height={44}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-[16px] font-bold text-gris">
                        {offre.imf.nom.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[16px] font-bold text-anthracite truncate">{offre.imf.nom}</p>
                    <p className="text-[18px] font-extrabold leading-tight" style={{ color: '#F5A623' }}>
                      {formatFCFA(offre.mensualite_estimee)}
                      <span className="text-[12px] font-normal text-gris">/mois</span>
                    </p>
                  </div>

                  {/* Supprimer */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      supprimerFavori(offre.id)
                    }}
                    className="shrink-0 flex items-center justify-center text-[18px]"
                    style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF2F2' }}
                    aria-label="Supprimer le favori"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Mes simulations récentes ── */}
        <section className="px-5 pt-6 pb-2">
          <h2 className="text-[18px] font-bold text-anthracite mb-3">Mes simulations récentes</h2>

          {!user || simulationsSauvegardees.length === 0 ? (
            <p className="text-[14px] text-gris text-center py-4">
              Aucune simulation sauvegardée.
            </p>
          ) : (
            <div className="rounded-card border border-sep bg-white overflow-hidden divide-y divide-sep shadow-card">
              {recentSimulations.map((sim, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSimulation(sim)
                    router.push('/simulateur')
                  }}
                  className="w-full flex items-center justify-between px-4 py-[14px] text-left"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-anthracite truncate">
                      {findOffreName(sim.offre_id)}
                    </p>
                    <p className="text-[13px] text-gris mt-0.5">{formatFCFA(sim.montant)}</p>
                  </div>
                  <p className="text-[15px] font-extrabold shrink-0 ml-3" style={{ color: '#F5A623' }}>
                    {formatFCFA(sim.mensualite)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Paramètres ── */}
        <section className="px-5 pt-6 pb-6">
          <h2 className="text-[18px] font-bold text-anthracite mb-3">Paramètres</h2>
          <div className="rounded-card border border-sep bg-white overflow-hidden divide-y divide-sep shadow-card">
            <button className="w-full flex items-center justify-between px-4 py-[14px] text-left">
              <span className="flex items-center gap-3">
                <span className="text-[18px]">🔔</span>
                <span className="text-[15px] font-medium text-anthracite">Notifications</span>
              </span>
              <span className="text-gris text-[16px]">›</span>
            </button>

            <button className="w-full flex items-center justify-between px-4 py-[14px] text-left">
              <span className="flex items-center gap-3">
                <span className="text-[18px]">🌍</span>
                <span className="text-[15px] font-medium text-anthracite">Langue</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[13px] text-gris">Français</span>
                <span className="text-gris text-[16px]">›</span>
              </span>
            </button>

            <button className="w-full flex items-center justify-between px-4 py-[14px] text-left">
              <span className="flex items-center gap-3">
                <span className="text-[18px]">📄</span>
                <span className="text-[15px] font-medium text-anthracite">CGU</span>
              </span>
              <span className="text-gris text-[16px]">›</span>
            </button>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center justify-between px-4 py-[14px] text-left"
            >
              <span className="flex items-center gap-3">
                <span className="text-[18px]">🚪</span>
                <span className="text-[15px] font-semibold" style={{ color: '#C0392B' }}>
                  Déconnexion
                </span>
              </span>
              <span className="text-[16px]" style={{ color: '#C0392B' }}>›</span>
            </button>
          </div>
        </section>
      </main>

      <BottomNavbar active="compte" />
    </>
  )
}
