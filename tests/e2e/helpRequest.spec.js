import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:8080'

test.describe('Help Request Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Логин перед каждым тестом
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'test@test.com')
    await page.fill('input[type="password"]', '123456')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(`${BASE_URL}/map`)
  })

  test('user can create help request', async ({ page }) => {
    // Разрешить геолокацию
    await page.context().grantPermissions(['geolocation'])
    
    await page.goto(`${BASE_URL}/create-request`)
    
    // Выбрать тип проблемы
    await page.click('[data-problem-type="battery"]')
    
    // Заполнить описание
    await page.fill('textarea[name="description"]', 'Севшая батарея, нужна помощь срочно!')
    
    // Указать сумму
    await page.fill('input[name="amount"]', '500')
    
    // Отправить
    await page.click('button[type="submit"]')
    
    // Проверить редирект и toast
    await expect(page).toHaveURL(`${BASE_URL}/map`)
    await expect(page.locator('.toast-success')).toBeVisible()
  })

  test('user can view their requests', async ({ page }) => {
    await page.goto(`${BASE_URL}/my-requests`)
    
    // Проверить что список загрузился
    await expect(page.locator('.request-card')).toHaveCount(1, { timeout: 5000 })
  })

  test('user can respond to request', async ({ page }) => {
    await page.context().grantPermissions(['geolocation'])
    
    await page.goto(`${BASE_URL}/map`)
    
    // Кликнуть на запрос
    await page.click('.request-card:first-child')
    
    // Откликнуться
    await page.click('button:has-text("Откликнуться")')
    
    await expect(page.locator('.toast-success')).toBeVisible()
  })

  test('map displays user location', async ({ page }) => {
    await page.context().grantPermissions(['geolocation'])
    await page.context().setGeolocation({ latitude: 55.755819, longitude: 37.617644 })
    
    await page.goto(`${BASE_URL}/map`)
    
    // Проверить что карта загрузилась
    await expect(page.locator('.leaflet-container')).toBeVisible()
    
    // Проверить маркер пользователя
    await page.waitForSelector('.user-marker', { timeout: 10000 })
  })
})

