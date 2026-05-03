# STACK.md

## Tech Stack

---

## Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | Full-stack framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |

---

## Database & Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | Latest | PostgreSQL database, realtime, API |
| PostgreSQL | Managed | Primary database |

---

## Styling & UI

| Technology | Purpose |
|------------|---------|
| Tailwind CSS | Utility-first CSS framework |
| shadcn/ui | Component library (Button, Card, Input, Dialog, etc.) |
| Lucide React | Icon library |

---

## Form & Validation

| Library | Purpose |
|---------|---------|
| React Hook Form | Form state management |
| Zod | Schema validation |

---

## Testing

| Library | Purpose |
|---------|---------|
| React Testing Library | Unit/component testing |
| Jest | Test runner |
| Playwright | E2E browser testing |
| @faker-js/faker | Mock data generation |

---

## Dependencies (package.json core)

```json
{
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.47.0",
    "@supabase/ssr": "^0.5.2",
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.24.0",
    "lucide-react": "^0.468.0",
    "sonner": "^1.7.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.17.0",
    "eslint-config-next": "^15.1.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/dom": "^10.4.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@playwright/test": "^1.48.0",
    "@faker-js/faker": "^9.3.0"
  }
}
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

---

## Tools

| Tool | Purpose |
|------|---------|
| VS Code | IDE |
| npm / pnpm | Package manager |
| Vercel | Deployment platform |
| Supabase Dashboard | Database management |

---

## Git Setup

- Initialize git repository locally (no push)
- Branch: main (default)
