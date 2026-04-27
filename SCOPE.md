# SCOPE.md

## Project Scope

---

## In Scope

### Core Features
- Agency Dashboard with content submission form
- Content list with status badges (Pending/Approved/Rejected)
- Real-time status updates via Supabase Realtime
- Unique shareable client URL generation
- Client View with video player (YouTube/Vimeo/MP4)
- Approve action button
- Reject action with required feedback modal
- Optional client info capture (name/email)

### Technical
- Next.js 15 with App Router
- Supabase PostgreSQL database
- Tailwind CSS + shadcn/ui
- Zod validation
- React Hook Form
- URL validation (YouTube/Vimeo/MP4)
- Responsive design

### Testing
- Unit tests (React Testing Library)
- E2E tests (Playwright)

---

## Assumptions

1. Single agency internal use (no auth needed)
2. Video URLs are externally hosted (YouTube/Vimeo/MP4)
3. Clients access via unique token URL only
4. Feedback is required only on rejection
5. Client info (name/email) is optional
6. Share token uses random bytes (12 char hex string)

---

## Database Schema

```
Table: content_pieces
- id: UUID (primary key)
- title: TEXT (required)
- video_url: TEXT (required)
- status: TEXT (pending/approved/rejected, default: pending)
- share_token: TEXT (unique)
- client_feedback: TEXT (optional)
- client_name: TEXT (optional)
- client_email: TEXT (optional)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

---

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/content | Create content piece |
| GET | /api/content | List all content |
| GET | /api/content/[token] | Get by token |
| POST | /api/content/[token]/action | Approve/Reject |

---

## Pages

| Route | Description |
|-------|-------------|
| / | Agency Dashboard |
| /approve/[token] | Client approval view |