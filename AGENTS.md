# AGENTS.md

## Project Context

Next.js 16 micro-feature for content agencies to get client approvals on videos via shareable URL.

## Tech Stack

- **Next.js 16.2.4** with App Router
- **React 19**, **TypeScript 5**, **Tailwind v4**
- **Zod v4**
- **Supabase** PostgreSQL + Realtime
- **shadcn/ui** + **@base-ui/react**
- **React Hook Form** + **sonner** (toasts) + **axios**

## Key Commands

```bash
npm run dev              # Dev server on :3000
npm run build            # Production build
npm run lint             # ESLint (flat config)
npm run test:unit        # Vitest — 121 tests across 5 files
npm run test:unit:watch  # Vitest watch mode
npm run test:e2e         # Playwright (auto-starts dev server)
npm run test:e2e:ui      # Playwright UI mode
npm run test             # All tests (unit then e2e)
```

## Environment Variables

Create `.env.local` from `.env.example`:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon key (browser + server reads)
- `SUPABASE_SERVICE_ROLE_KEY` — Service role (server writes only, never expose to browser)

## Database

Single table: `content_pieces` (schema in `supabase/schema.sql`). Run SQL in Supabase SQL Editor. Realtime enabled with `REPLICA IDENTITY FULL`. No RLS by default (anon SELECT policy exists).

Status flow: `pending` → `approved` | `rejected` (atomic via `WHERE status = 'pending'`).

## Architecture

### API Routes

| Route | Method | Client | Purpose |
|---|---|---|---|
| `/api/content` | GET | `createServerClient()` (anon) | List content with pagination (`?page=&limit=`) |
| `/api/content` | POST | `createAdminClient()` (service role) | Create content piece |
| `/api/content/[token]` | GET | `createServerClient()` (anon) | Get single content by share token |
| `/api/content/[token]/action` | POST | `createAdminClient()` (service role) | Approve/reject (atomic conditional update) |

### Supabase Clients (4 files)

- `lib/supabase-client.ts` — Memoized browser client (`createBrowserClient` from `@supabase/ssr`). The canonical source.
- `lib/supabase.ts` — Re-export of `supabase-client.ts`. Import this for browser components.
- `lib/supabase-server.ts` — Server-side anon-key client for read-only API routes.
- `lib/supabase-admin.ts` — Service-role admin client for writes. **Has browser guard** (`typeof window` check — throws if used client-side).

### Pages

- `/` — Agency dashboard (lists content, form to add new)
- `/approve/[token]` — Client approval view (video player + approve/reject panel)

## Important Conventions

- **Validation**: Zod schemas in `lib/validators.ts`. Video URLs validated client-side AND server-side against YouTube/Vimeo/MP4 patterns.
- **Feedback**: Required only on rejection. Client name/email optional.
- **Rate limiting**: In-memory Map-based (`lib/rate-limit.ts`). CREATE: 10/min, READ: 60/min, ACTION: 30/min. **Won't work across multiple instances**.
- **Audit logging**: All actions logged in `lib/audit.ts`, including failed validations. Emails masked. Dev-only console output.
- **Realtime**: `useRealtimeWithPolling` hook subscribes to `content_pieces` table changes. No polling fallback (realtime-only).
- **Atomic updates**: Action endpoint prevents double-review via `WHERE status = 'pending'`. Returns 409 if already reviewed.
- **Do NOT commit `.env.local`** — `.env.example` is the template.

## Testing

- **Unit tests**: `tests/unit/` — validators, video utils, rate-limiter, error utils, `cn()` utility. Setup in `tests/unit/setup.ts`.
- **E2E tests**: `tests/e2e/` — dashboard flow, approval flow. Auto-start dev server via Playwright `webServer` config. E2E creates real DB content.
- **Test data**: `@faker-js/faker` for realistic data generation.

## Security

- Rate limiting on all API routes with `X-RateLimit-*` headers
- Service role key guarded by `typeof window` check in `supabase-admin.ts`
- Input validation with max length constraints (title: 200, feedback: 2000, name/email: 100)
- Audit log masks emails for privacy
- MP4 embed URLs validated for http/https protocol only
