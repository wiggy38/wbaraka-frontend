import { test } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

const PAGES = [
  { name: 'Accueil',     path: '/accueil'    },
  { name: 'Résultats',   path: '/resultats'  },
  { name: 'Simulateur',  path: '/simulateur' },
]

for (const { name, path } of PAGES) {
  test(`A11y WCAG AA — ${name}`, async ({ page }) => {
    await page.goto(path)
    await injectAxe(page)
    await checkA11y(page, undefined, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      detailedReport: true,
    })
  })
}
