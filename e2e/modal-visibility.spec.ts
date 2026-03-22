import { test, expect } from '@playwright/test'

test('modal panel is visible in viewport after scrolling', async ({ page }) => {
  await page.goto('/')

  // Enter as guest
  await page.getByText('Soy invitado').click()
  await page.getByText('Gonzalo').click()

  // Wait for dishes to load
  await page.waitForFunction(() => {
    return document.querySelectorAll('button.rounded-2xl').length > 0
  }, { timeout: 10_000 })

  // Scroll down significantly
  await page.evaluate(() => window.scrollTo(0, 600))
  await page.waitForTimeout(300)

  // Verify we actually scrolled
  const scrollBefore = await page.evaluate(() => window.scrollY)
  expect(scrollBefore).toBeGreaterThan(0)

  // Click a dish card (Playwright auto-scrolls like a real user)
  const dishButton = page.locator('button.rounded-2xl.shadow-sm').first()
  await dishButton.click()

  // Wait for modal and animation
  const modal = page.locator('.animate-slide-up')
  await expect(modal).toBeVisible({ timeout: 5000 })
  await page.waitForTimeout(500)

  // The hook should have scrolled to top, so the fixed modal is in viewport
  const rect = await modal.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top, bottom: r.bottom }
  })

  const viewport = page.viewportSize()!
  // Modal panel must be at least partially within the viewport
  expect(rect.top).toBeLessThan(viewport.height)
  expect(rect.bottom).toBeGreaterThan(0)
})
