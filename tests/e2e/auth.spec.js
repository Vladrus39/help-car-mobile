import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:8080'

test.describe('Authentication Flow', () => {
  test('user can register', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`)
    
    // Заполнить форму регистрации
    await page.fill('input[type="email"]', `test${Date.now()}@example.com`)
    await page.fill('input[type="password"]', 'password123')
    await page.fill('input[name="fullName"]', 'Test User')
    await page.fill('input[type="tel"]', '+79001234567')
    
    // Отправить форму
    await page.click('button[type="submit"]')
    
    // Проверить редирект на /map
    await expect(page).toHaveURL(`${BASE_URL}/map`)
  })

  test('user can login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    
    await page.fill('input[type="email"]', 'test@test.com')
    await page.fill('input[type="password"]', '123456')
    
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(`${BASE_URL}/map`)
    await expect(page.locator('.navigation-header')).toBeVisible()
  })

  test('login fails with wrong password', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    
    await page.fill('input[type="email"]', 'test@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    
    await page.click('button[type="submit"]')
    
    // Проверить сообщение об ошибке
    await expect(page.locator('.error-message')).toBeVisible()
  })

  test('protected routes redirect to login', async ({ page }) => {
    // Очистить storage
    await page.context().clearCookies()
    
    await page.goto(`${BASE_URL}/map`)
    
    // Должен редиректить на /login
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })

  test('user can logout', async ({ page }) => {
    // Залогиниться сначала
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'test@test.com')
    await page.fill('input[type="password"]', '123456')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(`${BASE_URL}/map`)
    
    // Выйти
    await page.click('.user-menu')
    await page.click('text=Выйти')
    
    // Проверить редирект
    await expect(page).toHaveURL(`${BASE_URL}/login`)
  })
})

