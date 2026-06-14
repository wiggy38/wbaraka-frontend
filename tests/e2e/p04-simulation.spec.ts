import { test, expect } from '@playwright/test'

test.describe('P04 — Simulation depuis résultats', () => {
  test('E04 "Simuler" → E06 pré-rempli → mensualité saffron 36px', async ({ page }) => {
    // Aller sur résultats avec mock (via URL directe + store pré-rempli)
    await page.goto('/accueil')
    await page.fill('[data-testid="montant-input"]', '500000')
    await page.click('[data-testid="cta-comparer"]')
    await page.waitForSelector('[data-testid="carte-imf"]')

    // Clic "Simuler" sur la première carte
    await page.click('[data-testid="btn-simuler"]')
    await expect(page).toHaveURL('/simulateur')

    // Vérifier que la mensualité est affichée en saffron
    const mensualite = page.locator('[data-testid="mensualite-result"]')
    await expect(mensualite).toBeVisible()
    const text = await mensualite.textContent()
    expect(text).toMatch(/\d[\d\s]+ FCFA/)

    // Vérifier la couleur saffron (CSS computed)
    const color = await mensualite.evaluate(el =>
      window.getComputedStyle(el).color
    )
    // saffron #F5A623 → rgb(245, 166, 35)
    expect(color).toBe('rgb(245, 166, 35)')

    // Vérifier font-size 36px
    const fontSize = await mensualite.evaluate(el =>
      window.getComputedStyle(el).fontSize
    )
    expect(fontSize).toBe('36px')
  })

  test('recalcul < 500ms au changement de durée', async ({ page }) => {
    await page.goto('/simulateur')

    const start = Date.now()
    await page.click('[data-testid="pill-duree-24"]')
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="mensualite-result"]')
      return el && el.textContent !== '— FCFA'
    })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(500)
  })

  test('valeurs BCEAO correctes : 500k · 12 mois · TEG 24% → 47 073 FCFA', async ({ page }) => {
    await page.goto('/simulateur')

    await page.fill('[data-testid="montant-input"]', '500000')
    await page.click('[data-testid="pill-duree-12"]')
    // Mettre le TEG à 24% via le slider ou en modifiant directement l'input range
    await page.fill('[data-testid="teg-input"]', '24')
    await page.dispatchEvent('[data-testid="teg-input"]', 'input')

    const mensualite = await page.locator('[data-testid="mensualite-result"]').textContent()
    // "47 280 FCFA/mois" ou "47 280 FCFA"
    // Standard BCEAO annuity formula: P×r/(1-(1+r)^-n) with r=24/1200 → Math.ceil = 47280
    expect(mensualite?.replace(/\s/g, '')).toContain('47280')
  })
})
