import { test, expect } from '@playwright/test'

test.describe('Chart Rendering', () => {
  test('should render chart with 2 exercises and correct stats', async ({ page }) => {
    await page.goto('/')

    // No profile yet -> the router guard redirects to /profile
    const nameInput = page.locator('input[type="text"]').first()
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('Test Athlete')
      await page.locator('label', { has: page.locator('input[value="M"]') }).click()
      await page.fill('input[type="date"]', '1994-05-15')
      await page.click('button:has-text("Save")')
      await expect(page).toHaveURL(/#\/?$/)
    }

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // First exercise entry (today): pullup=12 -> 12 pts (Complete, x1)
    await page.goto('/#/exercise/new')
    await expect(page.locator('input[type="date"]')).toBeVisible()
    await page.fill('input[type="date"]', today)

    // Field order in ExerciseForm.vue is: laps (cooper), pullup, pushup, squats, vups, burpees.
    const inputs1 = page.locator('input[type="number"]')
    await inputs1.nth(0).fill('0') // no Cooper laps recorded for this entry
    await inputs1.nth(1).fill('12')
    await inputs1.nth(2).fill('20')
    await inputs1.nth(3).fill('25')
    await inputs1.nth(4).fill('15')
    await inputs1.nth(5).fill('10')

    await page.locator('button:has-text("Complete")').first().click()
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/#\/?$/)

    // Second exercise entry (yesterday): pullup=8 -> 8 pts (Complete, x1)
    await page.goto('/#/exercise/new')
    await expect(page.locator('input[type="date"]')).toBeVisible()
    await page.fill('input[type="date"]', yesterday)

    const inputs2 = page.locator('input[type="number"]')
    await inputs2.nth(0).fill('0')
    await inputs2.nth(1).fill('8')
    await inputs2.nth(2).fill('22')
    await inputs2.nth(3).fill('28')
    await inputs2.nth(4).fill('17')
    await inputs2.nth(5).fill('11')

    await page.locator('button:has-text("Complete")').first().click()
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/#\/?$/)

    await page.goto('/#/')

    // Chart renders
    const canvas = page.locator('canvas')
    await expect(canvas.first()).toBeVisible()

    // The default metric is "Pull Ups": entries sorted chronologically are
    // yesterday (8 pts) then today (12 pts). HomeChartStats renders, in order:
    // size, first, last, min, max, delta, pct.
    const statsBar = page.locator('.tabular-nums')
    await expect(statsBar).toHaveCount(7)
    await expect(statsBar.nth(0)).toHaveText('2') // size
    await expect(statsBar.nth(1)).toHaveText('8') // first
    await expect(statsBar.nth(2)).toHaveText('12') // last
    await expect(statsBar.nth(3)).toHaveText('8') // min
    await expect(statsBar.nth(4)).toHaveText('12') // max
    await expect(statsBar.nth(5)).toHaveText('+4') // delta
    await expect(statsBar.nth(6)).toHaveText('+50.0') // pct
  })
})
