import { test, expect } from '@playwright/test'

test.describe('ScholarSearch End-to-End Smoke Tests', () => {
  test('home page loads correctly with hero and navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/ScholarSearch/i)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByRole('link', { name: /browse scholarships/i }).first()).toBeVisible()
  })

  test('search and filter interface renders and accepts query input', async ({ page }) => {
    await page.goto('/scholarships')
    await expect(page.locator('input[placeholder*="Search"]').first()).toBeVisible()
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    await searchInput.fill('Engineering')
    await expect(searchInput).toHaveValue('Engineering')
  })

  test('admin login rejects invalid credentials', async ({ page }) => {
    await page.goto('/admin/login')
    await page.locator('input[type="text"]').fill('admin')
    await page.locator('input[type="password"]').fill('WrongPassword123!')
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('text=/Invalid|wrong|error|failed/i')).toBeVisible({ timeout: 10000 })
  })

  test('dashboard redirects to home or login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard')
    // Middleware / Proxy redirects unauthenticated users to home ('/')
    await expect(page).toHaveURL(/\/$|\/admin\/login/)
  })
})
