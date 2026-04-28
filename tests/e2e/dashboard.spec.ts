import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'

test.describe('Agency Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display dashboard with form and list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Agency Dashboard' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'New Content Piece' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Content List' })).toBeVisible()
  })

  test('should create new content with YouTube URL', async ({ page }) => {
    const title = faker.lorem.sentence()
    const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

    await page.fill('input[name="title"]', title)
    await page.fill('input[name="videoUrl"]', videoUrl)

    await page.click('button[type="submit"]')

    // Wait for success toast or content list update
    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 })
  })

  test('should create new content with Vimeo URL', async ({ page }) => {
    const title = faker.lorem.sentence()

    await page.fill('input[name="title"]', title)
    await page.fill('input[name="videoUrl"]', 'https://vimeo.com/123456789')

    await page.click('button[type="submit"]')

    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 })
  })

  test('should create new content with MP4 URL', async ({ page }) => {
    const title = faker.lorem.sentence()

    await page.fill('input[name="title"]', title)
    await page.fill('input[name="videoUrl"]', 'https://example.com/video.mp4')

    await page.click('button[type="submit"]')

    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 })
  })

  test('should show validation error for empty title', async ({ page }) => {
    await page.fill('input[name="videoUrl"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    await page.click('button[type="submit"]')

    await expect(page.getByText('Title is required')).toBeVisible()
  })

  test('should show validation error for invalid video URL', async ({ page }) => {
    await page.fill('input[name="title"]', faker.lorem.sentence())
    await page.fill('input[name="videoUrl"]', 'https://example.com/not-a-video')
    await page.click('button[type="submit"]')

    await expect(page.getByText('Invalid video URL')).toBeVisible()
  })

  test('should display share token link after creation', async ({ page }) => {
    const title = faker.lorem.sentence()

    await page.fill('input[name="title"]', title)
    await page.fill('input[name="videoUrl"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    await page.click('button[type="submit"]')

    // Wait for content to appear in list
    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 })

    // Check for share link (contains /approve/)
    const shareLink = page.locator('a[href*="/approve/"]').first()
    await expect(shareLink).toBeVisible()
  })

  test('should show pending status badge for new content', async ({ page }) => {
    const title = faker.lorem.sentence()

    await page.fill('input[name="title"]', title)
    await page.fill('input[name="videoUrl"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    await page.click('button[type="submit"]')

    await expect(page.getByText(title)).toBeVisible({ timeout: 10000 })

    // Check for pending status badge
    await expect(page.getByText('pending')).toBeVisible()
  })

  test('should clear form after successful submission', async ({ page }) => {
    await page.fill('input[name="title"]', faker.lorem.sentence())
    await page.fill('input[name="videoUrl"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    await page.click('button[type="submit"]')

    // Wait for form to clear
    await page.waitForTimeout(1000)

    // Inputs should be empty
    const titleValue = await page.inputValue('input[name="title"]')
    const urlValue = await page.inputValue('input[name="videoUrl"]')
    expect(titleValue).toBe('')
    expect(urlValue).toBe('')
  })
})
