---

## F00: Manager Authentication

**Priority:** P0 — Critical
**PRD Reference:** F0

---

### Description

Manager Authentication is the security gate for the entire Permit2 application. It provides a credential-based login flow (email + password), establishes a persistent session, and enforces route protection across all pages. No application functionality is accessible without an authenticated session. For the POC, a single user type (Manager) exists; multi-role and SSO are out of scope.

---

### Terminology

- **Credentials:** Email address and plaintext password submitted by the user during login.
- **Password Hash:** bcrypt-hashed representation of the password stored in the database (never stored in plaintext).
- **Session Token:** A JWT or session cookie issued on successful login; sent with every subsequent API request.
- **Protected Route:** Any application page that requires an authenticated session; unauthenticated access triggers a redirect to `/login`.
- **Redirect-After-Login:** The URL the user originally attempted to access, to which they are sent after successful login.

---

### Sub-features

- **F00.1 — Login Page UI:** A styled login page with email and password inputs, a submit button, and inline validation error states.
- **F00.2 — Credential Validation:** Client-side format validation (non-empty, valid email format) before submission.
- **F00.3 — Server-Side Authentication:** API verifies email exists and bcrypt-compares the submitted password against the stored hash.
- **F00.4 — Session Establishment:** On success, a JWT (or session cookie) is issued and stored client-side (httpOnly cookie preferred).
- **F00.5 — Persistent Session:** Session survives page refreshes; the user is not required to re-login on every visit.
- **F00.6 — Logout:** A logout action in the navigation header clears the session on both server and client, then redirects to `/login`.
- **F00.7 — Protected Route Guard:** A client-side route guard checks for a valid session on every navigation; unauthenticated users are redirected to `/login` with the original URL preserved as a query parameter (`?redirect=...`).
- **F00.8 — Seed Manager Account:** At least one manager account is pre-seeded in the database for demo use (see → F09).

---

### Screens & UI Flows

#### Screen: Login Page (`/login`)

**Layout:**
- Centered card on a full-height background using the brand primary color gradient or a subtle pattern.
- Application logo / wordmark "Permit2" above the form card.
- Card contains:
  - Heading: "Sign in to Permit2"
  - Subheading: "Manage your permits in one place"
  - Email input field (label: "Email address", type: `email`, placeholder: `manager@company.com`)
  - Password input field (label: "Password", type: `password`, placeholder: `••••••••`)
  - "Sign In" primary button (full-width, brand color)
  - Inline error banner below the form for credential errors (see Error States)
- Footer note: "Permit2 POC — Restricted Access"

**UI Behavior:**
- On page load, focus is placed on the email field.
- "Sign In" button enters a loading state (spinner icon + "Signing in…" text) while the API call is in flight; button is disabled during loading.
- On success: redirect to dashboard (`/dashboard`) or the `?redirect` URL if present.
- On failure: display inline error message; password field is cleared; focus returns to the password field.
- The login page is inaccessible to already-authenticated users — navigating to `/login` while logged in redirects to `/dashboard`.

---

### Process

1. User navigates to any protected route or directly to `/login`.
2. System renders the Login Page (F00.1).
3. User enters email and password.
4. Client performs format validation (F00.2): non-empty check, email regex. If invalid, show inline field errors; do not submit.
5. User clicks "Sign In" — button enters loading state; `POST /auth/login` is called with `{ email, password }`.
6. Server looks up user by email; if not found → return `401` with `AUTH_INVALID_CREDENTIALS`.
7. Server bcrypt-compares submitted password with stored hash; if mismatch → return `401` with `AUTH_INVALID_CREDENTIALS`.
8. On match: server generates a JWT (payload: `{ sub: userId, email, name, iat, exp }`); returns it in response body and/or sets httpOnly cookie.
9. Client stores the token (cookie or secure storage); session state is updated.
10. Client redirects to `/dashboard` (or `?redirect` URL).
11. All subsequent API calls include the token in the `Authorization: Bearer <token>` header (or the cookie is sent automatically).
12. On logout: user clicks "Logout" in nav → `POST /auth/logout` called → server invalidates token (or clears cookie) → client clears local session state → redirect to `/login`.

---

### Inputs

**Login Form:**
- `email` (string, required): User's email address. Must be valid email format (`RFC 5322` simplified regex).
- `password` (string, required): User's password. Min 1 character client-side (server validates bcrypt hash).

**Logout:**
- No body; session token extracted from cookie or `Authorization` header.

---

### Outputs

**Successful Login Response (`200 OK`):**
```json
{
  "data": {
    "token": "<JWT string>",
    "user": {
      "id": "uuid",
      "email": "manager@company.com",
      "name": "Jane Manager"
    }
  },
  "error": null,
  "meta": {}
}
```

**Successful Logout Response (`200 OK`):**
```json
{
  "data": { "message": "Logged out successfully" },
  "error": null,
  "meta": {}
}
```

---

### Validation Rules

- `email`: required, non-empty, valid email format (client + server).
- `password`: required, non-empty (client); actual security check is bcrypt comparison (server).
- A generic error message is returned for both "user not found" and "wrong password" — do not disclose which field is wrong (prevents user enumeration).
- JWT expiry: access token `exp` set to `1 hour`. Session cookie `maxAge` set to `24 hours` (sliding window on activity, or fixed — implementer choice for POC).
- No brute-force protection required for POC (out of scope), but the generic error message reduces enumeration risk.

---

### Error States

| Scenario | HTTP Status | Error Code | Message |
|---|---|---|---|
| Empty email or password | 400 | `VALIDATION_ERROR` | "Email and password are required." |
| Invalid email format | 400 | `VALIDATION_ERROR` | "Please enter a valid email address." |
| Invalid credentials (user not found or wrong password) | 401 | `AUTH_INVALID_CREDENTIALS` | "Invalid email or password." |
| Account does not exist (unified message) | 401 | `AUTH_INVALID_CREDENTIALS` | "Invalid email or password." |
| Token expired on a protected API call | 401 | `AUTH_TOKEN_EXPIRED` | "Your session has expired. Please log in again." |
| Missing or malformed token on protected API call | 401 | `AUTH_UNAUTHORIZED` | "Authentication required." |
| Server error during auth | 500 | `SERVER_ERROR` | "An unexpected error occurred. Please try again." |

---

### API Surface (this feature)

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login` | Authenticate; returns JWT + user info |
| `POST` | `/auth/logout` | Invalidate session / clear cookie |
| `GET` | `/auth/me` | Return current user info from token |

Full request/response schemas → `Y1-api.md` §Auth.

---

### Schema Surface (this feature)

Uses table: `users` (`id`, `email`, `password_hash`, `name`, `created_at`).

Full DDL → `Y0-schema.md` §Users.
