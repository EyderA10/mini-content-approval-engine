# Test Suite Documentation

## Overview
This test suite provides comprehensive testing for the Content Approval Engine using:
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing
- **Faker.js** - Test data generation

## Test Files Created

### Unit Tests (`tests/unit/`)

1. **validators.test.ts** - Tests for Zod validation schemas
   - `createContentSchema` - Tests valid/invalid video URLs, title validation
   - `actionSchema` - Tests approve/reject actions, feedback requirements

2. **video.test.ts** - Tests for video utility functions
   - `getVideoType()` - YouTube, Vimeo, MP4 detection
   - `isValidVideoUrl()` - URL validation
   - `getVideoId()` - Video ID extraction
   - `getEmbedUrl()` - Embed URL generation

3. **rate-limit.test.ts** - Tests for rate limiting functionality
   - Request counting and limits
   - Window expiration
   - IP-based tracking
   - `getClientIp()` header parsing

4. **error.test.ts** - Tests for error message extraction
   - String errors
   - Axios errors with field validation
   - Generic errors

5. **utils.test.ts** - Tests for utility functions
   - `cn()` className merger

### E2E Tests (`tests/e2e/`)

1. **dashboard.spec.ts** - Dashboard page tests
   - Page rendering
   - Content creation flow
   - Form validation
   - Share link generation

2. **approval.spec.ts** - Approval page tests
   - Invalid token handling
   - Content approval/rejection
   - API integration tests

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:watch
```

### E2E Tests
```bash
# Run all E2E tests (requires dev server)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### All Tests
```bash
npm test
```

## Test Configuration

- **Vitest config**: `vitest.config.ts`
- **Playwright config**: `playwright.config.ts`
- **Setup file**: `tests/unit/setup.ts`

## Notes

- E2E tests require the dev server to be running
- API integration tests in E2E create actual content in the database
- Faker.js is used to generate realistic test data
- Rate limiting tests use short windows for faster testing
