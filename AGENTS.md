# AGENTS.md

## Project Context

Next.js 15 micro-feature for content agencies to get client approvals on videos via shareable URL.

## Tech Stack

- **Next.js 15** with App Router
- **Supabase** PostgreSQL + Realtime
- **Tailwind CSS** + **shadcn/ui**
- **Zod** + React Hook Form

## Key Commands

```bash
# Initialize Next.js project (fresh start)
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm

# Run dev server
npm run dev

# Run tests
npm run test:unit        # Unit tests (121 tests)
npm run test:e2e        # E2E tests (requires playwright deps)
npm run test            # All tests
```

## Environment Variables

Create `.env.local` with Supabase credentials. See `.env.example` for template.

## Pages

- `/` - Agency Dashboard
- `/approve/[token]` - Client approval view

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Agency dashboard
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── approve/[token]/      # Client approval view
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── api/content/
│       ├── route.ts          # GET/POST all content
│       └── [token]/
│           ├── route.ts      # GET content by token
│           └── action/
│               └── route.ts  # POST approve/reject
├── components/
│   ├── dashboard/            # Dashboard components
│   │   ├── ContentForm.tsx
│   │   ├── ContentList.tsx
│   │   └── StatusBadge.tsx
│   ├── client/               # Client approval components
│   │   ├── ActionPanel.tsx
│   │   └── VideoPlayer.tsx
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── validators.ts        # Zod schemas
│   ├── video.ts              # Video URL utilities
│   ├── rate-limit.ts        # Rate limiting middleware
│   ├── error.ts              # Error utilities
│   ├── logger.ts            # Conditional logging
│   ├── constants.ts         # Shared constants
│   ├── supabase.ts          # Browser client
│   ├── supabase-server.ts   # Server client
│   └── supabase-admin.ts    # Admin client (server-only)
├── hooks/
│   └── useRealtimeWithPolling.ts  # Realtime + polling hook
└── tests/
    ├── unit/                 # Vitest unit tests
    └── e2e/                  # Playwright E2E tests
```

## Important Notes

- **COMMIT RESTRICTION**: Only make commits when explicitly authorized by the user. Do NOT push to remote.
- Always validate video URLs client-side AND server-side with Zod
- Feedback is REQUIRED only on rejection
- Client name/email is optional on both actions
- Use Supabase realtime for auto-updating dashboard
- Do NOT commit `.env.local` — use `.env.example` template
- Service role key must never be exposed to browser (guarded in `supabase-admin.ts`)

## Security Notes

- Rate limiting enabled on all API routes
- CSRF protection on action endpoints
- Audit logging for approval/rejection actions
- Input validation with max length constraints

## Available Agents

### @frontend-dev

Redesign and modernize the UI/UX using the frontend-design skill.

```bash
# Invoke via @ mention
@frontend-dev redesign the dashboard
```

Location: `.opencode/agents/frontend-dev.md`

### @frontend-refactor

Review and refactor code for quality, best practices, and performance.

```bash
# Invoke via @ mention
@frontend-refactor refactor dashboard
```

Location: `.opencode/agents/frontend-refactor.md`

### @frontend-doc

Add concise JSDoc documentation to code.

```bash
# Invoke via @ mention
@frontend-doc add docs
```

Location: `.opencode/agents/frontend-doc.md`

### @frontend-qa-tester

Create and run unit and e2e tests.

```bash
# Invoke via @ mention
@frontend-qa-tester run tests
```

Location: `.opencode/agents/frontend-qa-tester.md`

### @security

Review and improve security posture.

```bash
# Invoke via @ mention
@security review
```

Location: `.opencode/agents/security.md`

## Available Skills

### commit

Commit staged or unstaged changes with an AI-generated commit message.

```bash
# Invoke via skill
/commit
```

Location: `.opencode/skills/commit/SKILL.md`

### context7-mcp

Fetch documentation for libraries, frameworks, and APIs.

```bash
# Invoke for docs
How to use Supabase realtime with Next.js?
```

Location: `/home/eyder_ag/.agents/skills/context7-mcp/SKILL.md`

### frontend-design

Create distinctive, production-grade frontend interfaces.

```bash
# Invoke for UI work
@frontend-design create a modern dashboard
```

Location: `.opencode/skills/frontend-design/SKILL.md`
