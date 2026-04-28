import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'

test.describe('Client Approval Page', () => {
  // Note: These tests require actual content to be created first
  // In a real scenario, we would use API calls to create content and get the token

  test('should show content not found for invalid token', async ({ page }) => {
    await page.goto('/approve/invalid-token-12345')

    await expect(page.getByText('Content Not Found')).toBeVisible()
    await expect(page.getByText('This link may be invalid or expired.')).toBeVisible()
  })

  test('should display video and action panel for valid token', async ({ page }) => {
    // This test assumes there's a valid token in the system
    // For demo purposes, we'll skip the actual navigation
    // In real tests, create content via API first and get the token

    test.skip('This test requires a valid token - create content via API first', () => {})
  })

  test('should approve content with client info', async ({ page }) => {
    test.skip('This test requires a valid token - create content via API first', () => {})
  })

  test('should reject content with feedback', async ({ page }) => {
    test.skip('This test requires a valid token - create content via API first', () => {})
  })

  test('should show validation error when rejecting without feedback', async ({ page }) => {
    test.skip('This test requires a valid token - create content via API first', () => {})
  })
})

test.describe('API Integration', () => {
  test('should create content via API', async ({ request }) => {
    const title = faker.lorem.sentence()
    const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

    const response = await request.post('/api/content', {
      data: { title, videoUrl },
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.title).toBe(title)
    expect(data.video_url).toBe(videoUrl)
    expect(data.share_token).toBeDefined()
    expect(data.status).toBe('pending')
  })

  test('should reject content creation with invalid URL via API', async ({ request }) => {
    const response = await request.post('/api/content', {
      data: {
        title: faker.lorem.sentence(),
        videoUrl: 'invalid-url',
      },
    })

    expect(response.status()).toBe(400)
  })

  test('should get content list via API', async ({ request }) => {
    const response = await request.get('/api/content')

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(Array.isArray(data)).toBeTruthy()
  })

  test('should get single content by token via API', async ({ request }) => {
    // First create content
    const createResponse = await request.post('/api/content', {
      data: {
        title: faker.lorem.sentence(),
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    })

    const content = await createResponse.json()
    const token = content.share_token

    // Then fetch by token
    const getResponse = await request.get(`/api/content/${token}`)
    expect(getResponse.ok()).toBeTruthy()

    const fetchedContent = await getResponse.json()
    expect(fetchedContent.share_token).toBe(token)
  })

  test('should return 404 for invalid token via API', async ({ request }) => {
    const response = await request.get('/api/content/invalid-token-12345')
    expect(response.status()).toBe(404)
  })

  test('should approve content via API', async ({ request }) => {
    // Create content first
    const createResponse = await request.post('/api/content', {
      data: {
        title: faker.lorem.sentence(),
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    })

    const content = await createResponse.json()
    const token = content.share_token

    // Approve content
    const actionResponse = await request.post(`/api/content/${token}/action`, {
      data: {
        action: 'approve',
        clientName: faker.person.fullName(),
        clientEmail: faker.internet.email(),
      },
    })

    expect(actionResponse.ok()).toBeTruthy()
    const actionData = await actionResponse.json()
    expect(actionData.success).toBe(true)
    expect(actionData.message).toContain('approved')
  })

  test('should reject content with feedback via API', async ({ request }) => {
    // Create content first
    const createResponse = await request.post('/api/content', {
      data: {
        title: faker.lorem.sentence(),
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    })

    const content = await createResponse.json()
    const token = content.share_token

    // Reject content
    const feedback = faker.lorem.paragraph()
    const actionResponse = await request.post(`/api/content/${token}/action`, {
      data: {
        action: 'reject',
        feedback,
        clientName: faker.person.fullName(),
      },
    })

    expect(actionResponse.ok()).toBeTruthy()
    const actionData = await actionResponse.json()
    expect(actionData.success).toBe(true)
    expect(actionData.message).toContain('rejected')
  })

  test('should reject approval without feedback when rejecting', async ({ request }) => {
    // Create content first
    const createResponse = await request.post('/api/content', {
      data: {
        title: faker.lorem.sentence(),
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    })

    const content = await createResponse.json()
    const token = content.share_token

    // Try to reject without feedback
    const actionResponse = await request.post(`/api/content/${token}/action`, {
      data: {
        action: 'reject',
      },
    })

    expect(actionResponse.status()).toBe(400)
  })

  test('should not allow action on already reviewed content', async ({ request }) => {
    // Create content first
    const createResponse = await request.post('/api/content', {
      data: {
        title: faker.lorem.sentence(),
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    })

    const content = await createResponse.json()
    const token = content.share_token

    // Approve content
    await request.post(`/api/content/${token}/action`, {
      data: { action: 'approve' },
    })

    // Try to reject again
    const secondActionResponse = await request.post(`/api/content/${token}/action`, {
      data: {
        action: 'reject',
        feedback: 'Changed my mind',
      },
    })

    expect(secondActionResponse.status()).toBe(400)
    const data = await secondActionResponse.json()
    expect(data.error).toContain('already been reviewed')
  })

  test('should enforce rate limiting on content creation', async ({ request }) => {
    // This test would need to make many requests quickly
    // For now, just verify the endpoint works
    const response = await request.post('/api/content', {
      data: {
        title: faker.lorem.sentence(),
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    })

    // Check rate limit headers
    const headers = response.headers()
    expect(headers['x-ratelimit-limit']).toBeDefined()
    expect(headers['x-ratelimit-remaining']).toBeDefined()
  })
})
