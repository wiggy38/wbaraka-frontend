import type { LigneAmortissement, Simulation } from '@/types'

/**
 * Formule BCEAO officielle (CCT v3.1 RG-SIM-04)
 * mensualité = P × r / (1 - (1 + r)^(-n))
 * avec r = TEG_annuel / 12 / 100
 * Arrondi au FCFA supérieur (Math.ceil)
 */
export function calcMensualite(montant: number, duree: number, tegAnnuel: number): number {
  const r = tegAnnuel / 100 / 12
  if (r === 0) return Math.ceil(montant / duree)
  const m = montant * r / (1 - Math.pow(1 + r, -duree))
  return Math.ceil(m)
}

/**
 * Tableau d'amortissement complet
 * Chaque ligne : capital remboursé ce mois + intérêts + solde restant
 * Dernière ligne ajustée pour que le solde soit exactement 0
 */
export function buildTableauAmortissement(
  montant: number,
  duree: number,
  tegAnnuel: number
): LigneAmortissement[] {
  const r = tegAnnuel / 100 / 12
  const mensualite = calcMensualite(montant, duree, tegAnnuel)
  let solde = montant
  const lignes: LigneAmortissement[] = []

  for (let mois = 1; mois <= duree; mois++) {
    const interets = Math.round(solde * r)
    let capital = mensualite - interets

    // Dernière ligne : ajustement pour solde = 0 exact
    if (mois === duree) {
      capital = solde
    }

    solde = Math.max(0, solde - capital)

    lignes.push({
      mois,
      capital,
      interets,
      mensualite: mois === duree ? capital + interets : mensualite,
      capital_restant: Math.round(solde),
    })
  }

  return lignes
}

/**
 * Calcule la simulation complète depuis les paramètres
 */
export function calculerSimulation(
  offreId: number,
  montant: number,
  duree: number,
  tegAnnuel: number,
  fraisDossier: number = 0
): Simulation {
  const mensualite = calcMensualite(montant, duree, tegAnnuel)
  const tableau = buildTableauAmortissement(montant, duree, tegAnnuel)
  const totalInterets = tableau.reduce((acc, l) => acc + l.interets, 0)
  const coutTotal = montant + totalInterets + fraisDossier

  return {
    offre_id: offreId,
    montant,
    duree,
    mensualite,
    cout_total: coutTotal,
    teg: tegAnnuel,
    tableau,
  }
}

/**
 * Formatte un nombre FCFA avec espaces séparateurs milliers
 * ex: 47073 → "47 073"
 */
export function formatFCFA(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n))
}

/**
 * Pourcentages capital / intérêts pour la barre de répartition
 */
export function calcRepartition(montant: number, coutTotal: number) {
  const pctCapital = Math.round((montant / coutTotal) * 100)
  return {
    pctCapital,
    pctInterets: 100 - pctCapital,
  }
}
