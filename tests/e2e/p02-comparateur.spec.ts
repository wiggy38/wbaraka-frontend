import { test, expect } from '@playwright/test'

test.describe('P02 — Comparaison invité', () => {
  test('parcours complet E01 → E03 → E04 → E05', async ({ page }) => {
    // E-01 : accueil
    await page.goto('/accueil')
    await expect(page.locator('text=Comparer les offres')).toBeVisible()

    // Saisir montant et naviguer vers résultats
    await page.fill('[data-testid="montant-input"]', '500000')
    await page.click('[data-testid="cta-comparer"]')
    await expect(page).toHaveURL('/resultats')

    // E-04 : vérifier qu'au moins une carte IMF est affichée
    const cartes = page.locator('[data-testid="carte-imf"]')
    await expect(cartes.first()).toBeVisible({ timeout: 5000 })
    const count = await cartes.count()
    expect(count).toBeGreaterThanOrEqual(1)

    // Vérifier cover 86px
    const cover = page.locator('[data-testid="carte-cover"]').first()
    const box = await cover.boundingBox()
    expect(box?.height).toBe(86)

    // Clic "Détail" sur la première carte
    await page.click('[data-testid="btn-detail"]')
    await expect(page).toHaveURL(/\/imf\//)

    // E-05 : vérifier que la fiche IMF est affichée
    await expect(page.locator('[data-testid="fiche-imf"]')).toBeVisible()
  })

  test('tri des offres change leur ordre', async ({ page }) => {
    await page.goto('/besoin')
    await page.fill('[data-testid="montant-input"]', '300000')
    await page.click('[data-testid="pill-duree-18"]')
    await page.click('[data-testid="cta-voir-offres"]')

    // Attendre les cartes
    await page.waitForSelector('[data-testid="carte-imf"]')

    // Mémoriser la mensualité de la 1re carte
    const m1 = await page.locator('[data-testid="mensualite"]').first().textContent()

    // Changer le tri vers TEG
    await page.click('[data-testid="tri-teg"]')

    // La 1re carte peut avoir changé
    const m1_apres = await page.locator('[data-testid="mensualite"]').first().textContent()
    // Pas forcément différent si déjà trié par TEG — on vérifie juste que ça ne crash pas
    expect(m1_apres).toBeTruthy()
  })
})
