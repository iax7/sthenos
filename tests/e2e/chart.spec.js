import { test, expect } from '@playwright/test'

test.describe('Chart Rendering', () => {
  test('should render chart with 2 exercises', async ({ page }) => {
    // Navigate to home
    await page.goto('/')

    // Check if we need to create a profile
    const profileText = await page.locator('text=Profile').isVisible().catch(() => false)

    if (profileText) {
      // Create a profile
      await page.fill('input[type="text"]', 'Test Athlete')
      await page.locator('label', { has: page.locator('input[value="M"]') }).click()
      await page.fill('input[type="date"]', '1994-05-15')
      await page.click('button:has-text("Save")')
      await page.waitForTimeout(500)
    }

    // Get today's date for first exercise
    const today = new Date().toISOString().split('T')[0]
    // Yesterday for second exercise (to avoid date conflict)
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // Create first exercise with TODAY's date
    await page.goto('/#/exercise/new')
    await page.waitForTimeout(300)

    // Set date to today
    await page.fill('input[type="date"]', today)

    // Fill all exercise inputs
    const inputs1 = page.locator('input[type="number"]')
    await inputs1.nth(0).fill('12')
    await inputs1.nth(1).fill('20')
    await inputs1.nth(2).fill('25')
    await inputs1.nth(3).fill('15')
    await inputs1.nth(4).fill('10')
    await inputs1.nth(5).fill('2800')

    // Click first Complete button
    await page.locator('button:has-text("Complete")').first().click()
    await page.waitForTimeout(300)

    // Submit first exercise
    await page.click('button[type="submit"]')
    await page.waitForTimeout(500)

    // Create second exercise with YESTERDAY's date to avoid conflict
    await page.goto('/#/exercise/new')
    await page.waitForTimeout(300)

    // Set date to yesterday
    await page.fill('input[type="date"]', yesterday)

    const inputs2 = page.locator('input[type="number"]')
    await inputs2.nth(0).fill('14')
    await inputs2.nth(1).fill('22')
    await inputs2.nth(2).fill('28')
    await inputs2.nth(3).fill('17')
    await inputs2.nth(4).fill('11')
    await inputs2.nth(5).fill('2850')

    // Click Complete button for second exercise
    await page.locator('button:has-text("Complete")').first().click()
    await page.waitForTimeout(300)

    // Submit second exercise
    await page.click('button[type="submit"]')
    await page.waitForTimeout(500)

    // Navigate to home to see the chart
    await page.goto('/#/')
    await page.waitForTimeout(500)

    // Verify canvas is visible (chart rendered)
    const canvas = page.locator('canvas')
    await expect(canvas.first()).toBeVisible()

    console.log('✅ Chart successfully rendered with 2 exercises')
  })
})
