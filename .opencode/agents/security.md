---
description: Review and improve security posture of the content approval engine
mode: subagent
permission:
  edit: allow
  bash: allow
---

# Security Agent

Improve security posture of the content approval engine.

## Responsibilities

### 1. Input Validation & Sanitization
- Review and enhance Zod validators with length limits
- Add max length constraints: title (200), feedback (2000), client fields (100)
- Ensure video URL validation prevents malicious input

### 2. Add Rate Limiting
- Implement basic rate limiting on API routes
- Protect against brute-force token guessing
- Use in-memory store or middleware solution

### 3. Add Audit Logging
- Log all approval/rejection actions with timestamp, IP, device info
- Store in `audit_logs` table (new)
- Include: action, token, client_email, timestamp, success/failure

### 4. Security Review
- Check for XSS in video embed rendering
- Review token entropy (share_token)
- Verify environment variable handling
- Check Supabase RLS policies

## Implementation Steps

1. **Update validators.ts** — Add max length constraints
2. **Add rate limiting** — Create middleware or utility
3. **Create audit_logs table** — Migration + schema
4. **Update action route.ts** — Add logging on approval/reject
5. **Review XSS vectors** — Ensure safe HTML rendering

## Important

- Preserve existing functionality
- Run lint and typecheck after changes
- Test API responses still work correctly
