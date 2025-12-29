import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:8080'

test.describe('Chat System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'test@test.com')
    await page.fill('input[type="password"]', '123456')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(`${BASE_URL}/map`)
  })

  test('user can access city chats', async ({ page }) => {
    await page.goto(`${BASE_URL}/city-chats`)
    
    // Проверить список городов
    await expect(page.locator('.city-list')).toBeVisible()
    
    // Выбрать Москву
    await page.click('text=Москва')
    
    // Проверить что чат открылся
    await expect(page.locator('.chat-messages')).toBeVisible()
  })

  test('user can send message in city chat', async ({ page }) => {
    await page.goto(`${BASE_URL}/city-chats`)
    
    await page.click('text=Москва')
    
    // Написать сообщение
    const testMessage = `Тестовое сообщение ${Date.now()}`
    await page.fill('input[type="text"]', testMessage)
    await page.press('input[type="text"]', 'Enter')
    
    // Проверить что сообщение появилось
    await expect(page.locator(`text=${testMessage}`)).toBeVisible({ timeout: 5000 })
  })

  test('user can view private chat', async ({ page }) => {
    await page.goto(`${BASE_URL}/my-requests`)
    
    // Кликнуть на запрос с чатом
    await page.click('.request-card:has(button:has-text("Открыть чат"))')
    await page.click('button:has-text("Открыть чат")')
    
    // Проверить что чат открылся
    await expect(page.locator('.chat-container')).toBeVisible()
  })
})

