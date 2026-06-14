import { calcMensualite } from './simulateur'

const cas = [
  { montant: 500_000,   duree: 12, teg: 24, attendu: 47_073, label: 'CCT §8.2 cas 1' },
  { montant: 250_000,   duree:  6, teg: 18, attendu: 44_861, label: 'CCT §8.2 cas 2' },
  { montant: 1_000_000, duree: 24, teg: 24, attendu: 55_068, label: 'CCT §8.2 cas 3' },
  { montant: 100_000,   duree:  3, teg:  0, attendu: 33_333, label: 'CCT §8.2 cas 4' },
]

let passed = 0
for (const { montant, duree, teg, attendu, label } of cas) {
  const result = calcMensualite(montant, duree, teg)
  const ecart = result - attendu
  const ok = ecart === 0
  if (ok) passed++
  console.log(`${ok ? '✓' : '✗'} ${label}: résultat=${result} FCFA, attendu=${attendu} FCFA, écart=${ecart} FCFA`)
}

console.log(`\n${passed}/${cas.length} cas corrects, ${passed === cas.length ? '0' : cas.length - passed} FCFA d'écart`)
if (passed !== cas.length) process.exit(1)
