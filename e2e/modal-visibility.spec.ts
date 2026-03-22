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

  // Scroll down
  await page.evaluate(() => window.scrollTo(0, 600))
  await page.waitForTimeout(300)

  // Click via JS to avoid Playwright's auto-scroll-into-view
  await page.evaluate(() => {
    const btn = document.querySelector('button.rounded-2xl.shadow-sm') as HTMLElement
    btn?.click()
  })

  // Wait for modal animation to complete
  const modal = page.locator('.animate-slide-up')
  await expect(modal).toBeVisible({ timeout: 5000 })
  await page.waitForTimeout(500)

  // Check modal is within viewport via getBoundingClientRect
  const rect = await modal.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top, bottom: r.bottom }
  })

  const viewport = page.viewportSize()!
  expect(rect.top).toBeLessThan(viewport.height)
  expect(rect.bottom).toBeGreaterThan(0)
})
