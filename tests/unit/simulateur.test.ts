import { describe, it, expect } from 'vitest'
import {
  calcMensualite,
  buildTableauAmortissement,
  calculerSimulation,
  calcRepartition,
  formatFCFA,
} from '@/lib/simulateur'

// Formule BCEAO officielle : M = P × r / (1 − (1+r)^−n), r = TEG_annuel/12/100, arrondi ceil
describe('calcMensualite', () => {
  it('500 000 FCFA · 12 mois · TEG 24%', () => {
    expect(calcMensualite(500_000, 12, 24)).toBe(47_280)
  })

  it('250 000 FCFA · 6 mois · TEG 18%', () => {
    expect(calcMensualite(250_000, 6, 18)).toBe(43_882)
  })

  it('1 000 000 FCFA · 24 mois · TEG 24%', () => {
    expect(calcMensualite(1_000_000, 24, 24)).toBe(52_872)
  })

  it('TEG 0% → Math.ceil(montant / duree)', () => {
    expect(calcMensualite(100_000, 3, 0)).toBe(33_334)
  })
})

describe('buildTableauAmortissement', () => {
  it('dernière ligne : solde = 0', () => {
    const tableau = buildTableauAmortissement(500000, 12, 24)
    const derniere = tableau[tableau.length - 1]
    expect(derniere.capital_restant).toBe(0)
  })

  it('nombre de lignes = durée', () => {
    const tableau = buildTableauAmortissement(500000, 18, 26.82)
    expect(tableau).toHaveLength(18)
  })

  it('somme des capitaux = montant initial (±1 FCFA arrondi)', () => {
    const tableau = buildTableauAmortissement(500000, 12, 24)
    const totalCapital = tableau.reduce((acc, l) => acc + l.capital, 0)
    expect(Math.abs(totalCapital - 500000)).toBeLessThanOrEqual(1)
  })

  it('intérêts décroissent au fil des mois', () => {
    const tableau = buildTableauAmortissement(500000, 12, 24)
    for (let i = 1; i < tableau.length - 1; i++) {
      expect(tableau[i].interets).toBeLessThanOrEqual(tableau[i - 1].interets)
    }
  })

  it('mensualité constante (sauf dernière)', () => {
    const tableau = buildTableauAmortissement(500000, 12, 24)
    const mensualites = tableau.slice(0, -1).map(l => l.mensualite)
    const unique = new Set(mensualites)
    expect(unique.size).toBe(1)
  })
})

describe('calcRepartition', () => {
  it('pctCapital + pctInterets = 100', () => {
    const r = calcRepartition(500000, 564876)
    expect(r.pctCapital + r.pctInterets).toBe(100)
  })

  it("capital 100% quand pas d'intérêts", () => {
    const r = calcRepartition(500000, 500000)
    expect(r.pctCapital).toBe(100)
    expect(r.pctInterets).toBe(0)
  })
})

describe('calculerSimulation', () => {
  it('cout_total = montant + totalInterets + fraisDossier', () => {
    const sim = calculerSimulation(1, 500_000, 12, 24, 5_000)
    const totalInterets = sim.tableau.reduce((acc, l) => acc + l.interets, 0)
    expect(sim.cout_total).toBe(500_000 + totalInterets + 5_000)
    expect(formatFCFA(sim.cout_total)).toMatch(/\d/)
  })

  it("tableau d'amortissement inclus avec la bonne longueur", () => {
    const sim = calculerSimulation(1, 500_000, 12, 24)
    expect(sim.tableau).toHaveLength(12)
  })
})
