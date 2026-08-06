---

## User Flows

### Flow 00: Authentication (Login / Logout)

**User Stories:** US-0.1, US-0.2, US-0.3, US-0.4
**Trigger:** User navigates to any URL (protected or `/login`)
**Personas:** Marcus Webb (PER-01), Daniel Osei (PER-03)

```
[User visits any URL]
        │
        ▼
[Route Guard checks session]
        │
        ├── Authenticated ──▶ [Render requested page]
        │
        └── Unauthenticated
                │
                ▼
        [Login Page /login]
        [Email + Password form]
                │
                ├── Empty fields ──▶ [Inline validation errors] ──▶ [Stay on form]
                │
                ├── Clicks Sign In
                │       │
                │       ▼
                │  [Loading state: button spinner, fields disabled]
                │       │
                │       ├── POST /auth/login — 401 ──▶ [Inline error: "Invalid email or password."]
                │       │                               [Password cleared, focus → password field]
                │       │
                │       └── POST /auth/login — 200
                │               │
                │               ▼
                │       [Session token stored (httpOnly cookie)]
                │               │
                │               └── Redirect to /dashboard (or ?redirect= URL)
                │
                └── Already authenticated visiting /login ──▶ [Redirect to /dashboard]

─────────────────────────────────────────────────────────────

[Authenticated user on any page]
        │
        ▼
[Nav bar "Logout" button clicked]
        │
        ▼
[POST /auth/logout → session cleared]
        │
        ▼
[Redirect to /login]
```

**Steps:**
1. User arrives at protected route unauthenticated → redirected to `/login?redirect=<original-url>`
2. Login page renders; focus auto-set to email field
3. User enters email and password
4. Client validates: non-empty, valid email format — shows inline errors without API call if invalid
5. "Sign In" button clicked → enters loading/disabled state → `POST /auth/login` called
6. **Success:** session token stored → navigate to `/dashboard` or `?redirect` URL
7. **Error:** inline error "Invalid email or password." displayed; password cleared; focus back to password field
8. On any authenticated page: "Logout" in nav bar → `POST /auth/logout` → redirect to `/login`

**Key Design Notes:**
- Login page must feel fast and polished — it is Daniel Osei's first impression during live stakeholder demos
- Generic error message (never reveal which field is wrong)
- Persistent session: user stays logged in across refreshes (httpOnly cookie, 24h sliding window)
