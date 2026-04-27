# SPEC.md

## Purpose

A content approval system where agencies create and share video content with clients for review. Clients can approve or reject content with feedback.

---

## User Flows

### Flow 1: Agency Creates & Shares Content
1. Agency enters title and video URL
2. System generates unique share token
3. Agency shares approval link with client

### Flow 2: Client Reviews Content
1. Client opens approval link via share token
2. Client watches video
3. Client approves or rejects with feedback
4. Agency sees updated status in real-time

---

## Functional Requirements

### Agency Dashboard
- Create new content with title and video URL
- View list of all content with status
- See real-time status updates
- Filter by status (pending/approved/rejected)

### Client Approval Page
- Watch embedded video player
- Approve content
- Reject content with required feedback
- Optional: Provide name and email

### Video Support
- YouTube videos (converted to embed)
- Vimeo videos (converted to embed)
- Direct MP4 links (native player)

---

## API Contracts

### POST /api/content
Create content piece.

### GET /api/content
List all content pieces.

### GET /api/content/[token]
Get content by share token.

### POST /api/content/[token]/action
Approve or reject content.

---

## Non-Functional Requirements

- Share tokens must be unique and unpredictable
- Environment variables stored securely (not in docs)
- Real-time updates via Supabase subscription

---

## Project Structure

```
app/
├── page.tsx                    # Agency Dashboard
├── layout.tsx                  # Root layout
├── globals.css                 # Global styles
├── approve/
│   └── [token]/
│       └── page.tsx            # Client View
└── api/
    └── content/
        ├── route.ts            # POST create, GET list
        └── [token]/
            ├── route.ts        # GET by token
            └── action/
                └── route.ts    # POST approve/reject

components/
├── ui/                         # shadcn components
├── dashboard/
│   ├── ContentForm.tsx         # Create content form
│   ├── ContentList.tsx         # Real-time list
│   └── StatusBadge.tsx          # Status indicator
└── client/
    ├── VideoPlayer.tsx          # Video embed
    └── ActionPanel.tsx          # Approve/Reject

lib/
├── supabase.ts                 # Supabase client
├── validators.ts               # Zod schemas
└── video.ts                    # Video URL parser
```

---

## Notes

- Supabase PostgreSQL required for data persistence
- Supabase Realtime for live status updates
- Video URLs validated for YouTube, Vimeo, and direct MP4