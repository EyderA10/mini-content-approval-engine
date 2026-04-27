# USER_STORIES.md

## User Stories

---

## Story 1: Submit New Content Piece

**As an** agency user,
**I want to** submit a new content piece with a title and video URL,
**So that** I can get client approval on videos.

**Acceptance Criteria:**
- [ ] Form displays title input (required, max 200 chars)
- [ ] Form displays video URL input (required)
- [ ] Video URL is validated before submission
- [ ] Valid YouTube/Vimeo/MP4 URLs accepted
- [ ] On success, content appears in the list with "Pending" status
- [ ] A unique shareable URL is generated
- [ ] Error messages display for invalid inputs

---

## Story 2: View Content List

**As an** agency user,
**I want to** see all content pieces with their status,
**So that** I can track approval progress.

**Acceptance Criteria:**
- [ ] List displays all content pieces
- [ ] Each item shows title, status badge, and date
- [ ] Status badges: Pending (yellow), Approved (green), Rejected (red)
- [ ] List auto-updates in real-time when status changes
- [ ] Each item has a "Copy Link" button to share with clients

---

## Story 3: Share Content with Client

**As an** agency user,
**I want to** share a unique URL with the client,
**So that** they can view and approve/reject the content.

**Acceptance Criteria:**
- [ ] Each content piece has a unique share token
- [ ] Shareable URL format: `[domain]/approve/[token]`
- [ ] One-click copy button generates full URL
- [ ] Toast notification confirms "Link copied!"

---

## Story 4: Client Views Video

**As a** client,
**I want to** view the video from the shared link,
**So that** I can decide to approve or reject it.

**Acceptance Criteria:**
- [ ] Page loads automatically via unique token URL
- [ ] Video plays inline (YouTube/Vimeo/MP4)
- [ ] Title displayed above video
- [ ] Approve and Reject buttons visible
- [ ] Page is responsive on mobile

---

## Story 5: Client Approves Content

**As a** client,
**I want to** approve the content,
**So that** the agency knows the video is approved.

**Acceptance Criteria:**
- [ ] Approve button is prominent and clickable
- [ ] Optional name/email inputs available
- [ ] On click, confirmation shown: "Content Approved!"
- [ ] Agency dashboard updates to "Approved" in real-time
- [ ] Status badge changes to green

---

## Story 6: Client Rejects with Feedback

**As a** client,
**I want to** reject the content and provide feedback,
**So that** the agency knows what changes are needed.

**Acceptance Criteria:**
- [ ] Reject button triggers feedback modal
- [ ] Feedback input is required (cannot submit empty)
- [ ] Optional name/email inputs available
- [ ] On submit, confirmation shown: "Content Rejected"
- [ ] Agency dashboard updates to "Rejected" in real-time
- [ ] Feedback text visible to agency
- [ ] Status badge changes to red

---

## Story 7: Real-time Status Updates

**As an** agency user,
**I want to** see status changes without refreshing,
**So that** I know immediately when a client takes action.

**Acceptance Criteria:**
- [ ] Dashboard uses Supabase Realtime subscription
- [ ] Status changes reflect immediately on screen
- [ ] Toast notification shows "Status updated to [status]"
- [ ] Works without page reload

---

## Story 8: URL Validation

**As a** system,
**I want to** validate video URLs before saving,
**So that** only valid video links are stored.

**Acceptance Criteria:**
- [ ] YouTube URLs validated (youtube.com, youtu.be)
- [ ] Vimeo URLs validated (vimeo.com)
- [ ] Direct MP4 URLS validated (.mp4)
- [ ] Invalid URLs show clear error message
- [ ] Validation runs on client and server