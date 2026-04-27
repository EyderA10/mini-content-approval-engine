<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

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
```

## Environment Variables

Create `.env.local` with Supabase credentials. See `.env.example` for template.

## Pages

- `/` - Agency Dashboard
- `/approve/[token]` - Client approval view

## Important Notes

- **COMMIT RESTRICTION**: Only make commits when explicitly authorized by the user. Do NOT push to remote.
- Always validate video URLs client-side AND server-side with Zod
- Feedback is REQUIRED only on rejection
- Client name/email is optional on both actions
- Use Supabase realtime for auto-updating dashboard
- Do NOT commit `.env.local` — use `.env.example` template

## Available Agents

### @frontend-dev

Redesign and modernize the UI/UX using the frontend-design skill.

```bash
# Invoke via @ mention
@frontend-dev redesign the dashboard
```

Location: `.opencode/agents/frontend-dev.md`