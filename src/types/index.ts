// Types extraits du CdCF v3.1 et de la structure API Laravel

export interface IMF {
  id: number
  slug: string
  nom: string
  ville: string
  logo_url: string | null
  cover_url: string | null
  cover_gradient?: string
  rating: number          // 1–5
  agrément_bceao: string
}

export interface Offre {
  id: number
  imf: IMF
  taux_mensuel: number    // ex: 2.5 (%)
  teg_annuel: number      // ex: 34.5 (%)
  montant_min: number     // FCFA
  montant_max: number     // FCFA
  duree_min: number       // mois
  duree_max: number       // mois
  mensualite_estimee: number  // FCFA — calculée côté serveur
  cout_total: number          // FCFA
  frais_dossier: number       // FCFA
  objet: string[]         // ['commerce', 'agriculture', ...]
  garanties: string[]
  delai_traitement: string    // ex: "48h"
  statut: 'actif' | 'brouillon' | 'validation'
  is_best?: boolean
  is_sponsored?: boolean
}

export interface Simulation {
  id?: number
  offre_id: number
  montant: number
  duree: number          // mois
  mensualite: number     // FCFA
  cout_total: number     // FCFA
  teg: number            // %
  tableau: LigneAmortissement[]
}

export interface LigneAmortissement {
  mois: number
  capital: number
  interets: number
  mensualite: number
  capital_restant: number
}

export interface User {
  id: number
  telephone: string
  prenom: string
  activite?: string
  ville?: string
}

export interface BesoinRecherche {
  montant: number
  duree: number          // mois
  activite?: string
  ville?: string
}

export interface SlideHero {
  id: number
  titre: string
  badge_texte: string
  badge_couleur: 'saffron' | 'or' | 'violet'
  gradient: string       // CSS gradient string
}
