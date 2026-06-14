import type { Offre } from '@/types'

export const OFFRES_MOCK: Offre[] = [
  {
    id: 1,
    imf: {
      id: 1, slug: 'rcpb', nom: 'RCPB',
      ville: 'Ouagadougou', logo_url: null, cover_url: null,
      cover_gradient: 'linear-gradient(135deg, #0D5934 0%, #2A9D6E 100%)',
      rating: 4.5, agrément_bceao: 'BF-IMF-001'
    },
    taux_mensuel: 2.0, teg_annuel: 26.8,
    montant_min: 50000, montant_max: 5000000,
    duree_min: 6, duree_max: 36,
    mensualite_estimee: 46800, cout_total: 842400,
    frais_dossier: 5000, objet: ['commerce', 'agriculture'],
    garanties: ['Caution solidaire'], delai_traitement: '48h',
    statut: 'actif', is_best: true, is_sponsored: false,
  },
  {
    id: 2,
    imf: {
      id: 2, slug: 'coris-money', nom: 'Coris Money',
      ville: 'Bobo-Dioulasso', logo_url: null, cover_url: null,
      cover_gradient: 'linear-gradient(135deg, #1B6B44 0%, #D4A017 120%)',
      rating: 4.0, agrément_bceao: 'BF-IMF-002'
    },
    taux_mensuel: 2.5, teg_annuel: 32.1,
    montant_min: 100000, montant_max: 3000000,
    duree_min: 6, duree_max: 24,
    mensualite_estimee: 49500, cout_total: 891000,
    frais_dossier: 7500, objet: ['commerce', 'habitat'],
    garanties: ['Titre foncier', 'Caution'], delai_traitement: '72h',
    statut: 'actif', is_best: false, is_sponsored: false,
  },
  {
    id: 3,
    imf: {
      id: 3, slug: 'faitiere', nom: 'FAÎTIÈRE',
      ville: 'Ouagadougou', logo_url: null, cover_url: null,
      cover_gradient: 'linear-gradient(140deg, #0D5934 0%, #7C3AED 130%)',
      rating: 3.5, agrément_bceao: 'BF-IMF-003'
    },
    taux_mensuel: 3.0, teg_annuel: 42.6,
    montant_min: 50000, montant_max: 1000000,
    duree_min: 3, duree_max: 18,
    mensualite_estimee: 52300, cout_total: 941400,
    frais_dossier: 3000, objet: ['agriculture', 'élevage'],
    garanties: ['Sans garantie'], delai_traitement: '24h',
    statut: 'actif', is_best: false, is_sponsored: true,
  },
]
