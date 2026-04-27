# TASKS.md

## Task Breakdown

---

## Phase 1: Foundation

### 1.1 Initialize Project
- [ ] Run `npx create-next-app@latest .` with TypeScript, Tailwind, ESLint, App Router
- [ ] Set up `package.json` dependencies
- [ ] Initialize git repository with `git init`

### 1.2 Configure Tailwind CSS
- [ ] Update `tailwind.config.ts` with content paths
- [ ] Configure `postcss.config.mjs`
- [ ] Set up `app/globals.css` with Tailwind directives

### 1.3 Set up shadcn/ui
- [ ] Run shadcn init command
- [ ] Add components: button, card, input, label, textarea, dialog, badge, separator, sonner

### 1.4 Configure Supabase
- [ ] Install `@supabase/supabase-js` and `@supabase/ssr`
- [ ] Create `lib/supabase.ts` client
- [ ] Create `.env.local` with Supabase credentials

### 1.5 Database Setup
- [ ] Create `supabase/schema.sql` with content_pieces table
- [ ] Apply schema to Supabase project
- [ ] Enable realtime on content_pieces table

---

## Phase 2: Agency Dashboard

### 2.1 Video URL Validator
- [ ] Create `lib/video.ts` with URL parsing functions
- [ ] Implement YouTube ID extraction
- [ ] Implement Vimeo ID extraction
- [ ] Detect MP4 URLs as direct

### 2.2 Zod Validators
- [ ] Create `lib/validators.ts`
- [ ] Define CreateContentSchema
- [ ] Define ActionSchema
- [ ] Export validation functions

### 2.3 API Routes
- [ ] Create `app/api/content/route.ts` (POST create, GET list)
- [ ] Create `app/api/content/[token]/route.ts` (GET by token)
- [ ] Create `app/api/content/[token]/action/route.ts` (POST approve/reject)
- [ ] Add proper error handling and validation

### 2.4 Dashboard Components
- [ ] Create `components/dashboard/StatusBadge.tsx`
- [ ] Create `components/dashboard/ContentForm.tsx` with React Hook Form
- [ ] Create `components/dashboard/ContentList.tsx` with realtime
- [ ] Create `components/dashboard/ShareDialog.tsx`

### 2.5 Dashboard Page
- [ ] Create `app/page.tsx` with form and list
- [ ] Implement Supabase realtime subscription
- [ ] Add toast notifications

---

## Phase 3: Client View

### 3.1 Video Player Component
- [ ] Create `components/client/VideoPlayer.tsx`
- [ ] Handle YouTube embed (youtube-nocookie.com)
- [ ] Handle Vimeo embed (player.vimeo.com)
- [ ] Handle direct MP4 with native video element
- [ ] Add responsive styling

### 3.2 Action Panel Component
- [ ] Create `components/client/ActionPanel.tsx`
- [ ] Add Approve button
- [ ] Add Reject button
- [ ] Implement feedback modal for rejection
- [ ] Add optional name/email fields

### 3.3 Client Page
- [ ] Create `app/approve/[token]/page.tsx`
- [ ] Fetch content by token from API
- [ ] Display video player
- [ ] Display action panel
- [ ] Handle loading and error states
- [ ] Add 404 for invalid tokens

---

## Phase 4: Validation & Polish

### 4.1 Input Validation
- [ ] Add client-side Zod validation to forms
- [ ] Add server-side validation in API routes
- [ ] Show error messages inline

### 4.2 UI Polish
- [ ] Add loading states to buttons
- [ ] Add loading skeletons to list
- [ ] Improve error messages
- [ ] Ensure mobile responsiveness
- [ ] Add transitions and animations

### 4.3 Error Handling
- [ ] Add global error boundaries
- [ ] Handle Supabase connection errors
- [ ] Handle invalid token errors gracefully

### 4.4 Final Review
- [ ] Test all user flows manually
- [ ] Verify realtime updates work
- [ ] Check all validation scenarios
- [ ] Ensure proper TypeScript types throughout

---

## Phase 5: Testing (Post-development)

### 5.1 Unit Tests
- [ ] Write `__tests__/lib/validators.test.ts` - Zod schema tests
- [ ] Write `__tests__/lib/video.test.ts` - Video parser tests
- [ ] Write `__tests__/components/ContentForm.test.tsx` - Form component
- [ ] Write `__tests__/components/StatusBadge.test.tsx` - Badge component

### 5.2 E2E Tests
- [ ] Install Playwright
- [ ] Configure `playwright.config.ts`
- [ ] Write `e2e/submit-content.spec.ts` - Submit flow
- [ ] Write `e2e/approve-content.spec.ts` - Approve flow
- [ ] Write `e2e/reject-content.spec.ts` - Reject flow with feedback

### 5.3 Test Run
- [ ] Run all unit tests and fix failures
- [ ] Run all E2E tests and fix failures
- [ ] Final verification

---

## Dependencies Summary

### Production
- next, react, react-dom
- @supabase/supabase-js, @supabase/ssr
- react-hook-form, @hookform/resolvers
- zod
- lucide-react, sonner

### Development
- typescript, @types/node, @types/react
- tailwindcss, postcss, autoprefixer
- eslint, eslint-config-next
- @testing-library/react, @testing-library/dom
- jest, jest-environment-jsdom
- @playwright/test
- @faker-js/faker