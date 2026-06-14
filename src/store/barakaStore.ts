import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BesoinRecherche, Offre, User, Simulation } from '@/types'

interface BarakaStore {
  // Parcours comparateur (session)
  besoin: BesoinRecherche | null
  setBesoin: (b: BesoinRecherche) => void

  // Résultats comparateur (session)
  resultats: Offre[]
  setResultats: (offres: Offre[]) => void

  // IMF sélectionnée pour fiche + simulateur
  offreSelectionnee: Offre | null
  setOffreSelectionnee: (offre: Offre | null) => void

  // Simulation en cours
  simulation: Simulation | null
  setSimulation: (s: Simulation | null) => void

  // Auth emprunteur
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void

  // OTP flow (éphémère)
  otpPhone: string
  setOtpPhone: (phone: string) => void

  // Favoris (persistant localStorage)
  favoris: Offre[]
  ajouterFavori: (offre: Offre) => void
  supprimerFavori: (id: number) => void
  isFavori: (id: number) => boolean

  // Simulations sauvegardées (session mémoire uniquement)
  simulationsSauvegardees: Simulation[]
  ajouterSimulation: (s: Simulation) => void
}

export const useBarakaStore = create<BarakaStore>()(
  persist(
    (set, get) => ({
      // Comparateur
      besoin: null,
      setBesoin: (b) => set({ besoin: b }),

      resultats: [],
      setResultats: (offres) => set({ resultats: offres }),

      offreSelectionnee: null,
      setOffreSelectionnee: (offre) => set({ offreSelectionnee: offre }),

      simulation: null,
      setSimulation: (s) => set({ simulation: s }),

      // Auth
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),

      // OTP
      otpPhone: '',
      setOtpPhone: (phone) => set({ otpPhone: phone }),

      // Favoris
      favoris: [],
      ajouterFavori: (offre) => set((s) => ({
        favoris: s.favoris.find(f => f.id === offre.id)
          ? s.favoris
          : [...s.favoris, offre]
      })),
      supprimerFavori: (id) => set((s) => ({
        favoris: s.favoris.filter(f => f.id !== id)
      })),
      isFavori: (id) => get().favoris.some(f => f.id === id),

      // Simulations sauvegardées
      simulationsSauvegardees: [],
      ajouterSimulation: (s) => set((state) => ({
        simulationsSauvegardees: [...state.simulationsSauvegardees, s],
      })),
    }),
    {
      name: 'baraka-storage',
      // Persiste uniquement favoris, user, token — pas les résultats session
      partialize: (state) => ({
        favoris: state.favoris,
        user: state.user,
        token: state.token,
      }),
    }
  )
)
