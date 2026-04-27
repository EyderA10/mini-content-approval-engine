# Project Plan: Mini Content Approval Engine

## Overview
A Next.js micro-feature for content agencies to get client approvals on videos via a shareable URL.

## Workflow

### Phase 1: Foundation
1. Initialize Next.js 15 project with TypeScript, Tailwind CSS, App Router
2. Set up shadcn/ui components
3. Configure Supabase client
4. Create database schema and seed
5. Configure environment variables

### Phase 2: Agency Dashboard
1. Create content form (title + video URL)
2. Build content list with status badges
3. Implement real-time updates (Supabase Realtime)
4. Generate shareable links

### Phase 3: Client View
1. Build dynamic route `/approve/[token]`
2. Implement video player (YouTube/Vimeo/MP4 detection + embedding)
3. Create approve/reject action buttons
4. Add feedback modal for rejection (required)
5. Optional client info capture (name/email)

### Phase 4: Validation & Polish
1. Zod schema validation on all inputs
2. URL validation (YouTube/Vimeo/MP4 regex)
3. Toast notifications for actions
4. Loading states and error handling
5. Responsive design

### Phase 5: Testing (Post-development)
1. Write unit tests (React Testing Library + Zod)
2. Write E2E tests (Playwright)
3. Run all tests and fix failures
4. Final verification

## Deliverables
- Next.js 15 App with App Router
- Supabase PostgreSQL database
- Agency Dashboard (/)
- Client Approval View (/approve/[token])
- Real-time status updates
- Unit and E2E test suite