import { test, expect } from '@playwright/test'

test.describe('P01 — Slider hero accueil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/accueil')
  })

  test('slider visible en 260px de hauteur', async ({ page }) => {
    const slider = page.locator('[data-testid="slider-hero"]')
    await expect(slider).toBeVisible()
    const box = await slider.boundingBox()
    expect(box?.height).toBe(260)
  })

  test('3 dots de navigation présents', async ({ page }) => {
    const dots = page.locator('[data-testid="slider-dot"]')
    await expect(dots).toHaveCount(3)
  })

  test('dot actif change automatiquement après 4s', async ({ page }) => {
    const dot0 = page.locator('[data-testid="slider-dot"]').nth(0)
    // Dot 0 actif au départ (pill saffron plus large)
    await expect(dot0).toHaveClass(/active|pill/)
    // Attend 4.5s → dot 1 doit être actif
    await page.waitForTimeout(4500)
    const dot1 = page.locator('[data-testid="slider-dot"]').nth(1)
    await expect(dot1).toHaveClass(/active|pill/)
  })
})
