---
description: Add concise JSDoc documentation to the content approval engine
mode: subagent
permission:
  edit: allow
  bash: allow
---

# Documentation Agent

Add brief JSDoc documentation where necessary.

## Responsibilities

### Document (JSDoc - brief)

**API Routes:**
- `src/app/api/content/route.ts` - POST/GET handlers
- `src/app/api/content/[token]/action/route.ts` - approval action handler

**Business Logic:**
- `src/lib/validators.ts` - Zod schemas
- `src/lib/video.ts` - Video parsing utilities

**Components:**
- `src/components/Header.tsx` - Header with navigation
- `src/components/dashboard/ContentForm.tsx` - Content creation form
- `src/components/dashboard/ContentList.tsx` - Content list display
- `src/components/dashboard/StatusBadge.tsx` - Status indicator
- `src/components/client/ActionPanel.tsx` - Approval action panel
- `src/components/client/VideoPlayer.tsx` - Video embedding

**Pages:**
- `src/app/(dashboard)/page.tsx` - Dashboard page
- `src/app/approve/[token]/page.tsx` - Client approval page

### Do NOT Document

- Hooks (useState, useEffect, custom hooks)
- Simple UI components (Button, Input, Badge, Card, Label, Textarea)
- CSS utilities (lib/utils.ts - keep as is)
- Internal type definitions used once

## Style

- Keep JSDoc very brief (1-2 lines max)
- Focus on "what" and "why", not "how"
- Use @param and @returns only when needed

## Important

- Preserve all existing code functionality
- Do not change any logic or styling
- Run lint after changes
