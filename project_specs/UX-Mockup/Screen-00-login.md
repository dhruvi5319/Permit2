---

## Screen Designs

### Screen 00: Login Page (`/login`)

**Purpose:** Secure entry point; establishes authenticated session. First impression for stakeholder demos.
**User Stories:** US-0.1, US-0.2, US-0.4
**Personas:** All

#### Layout

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│         ░░░░░░░░░░░░░░ BRAND GRADIENT BACKGROUND ░░░░░░░░░░  │
│         (Indigo-50 to Indigo-100, subtle radial glow)        │
│                                                               │
│                    ┌──────────────────────┐                  │
│                    │                      │                  │
│                    │   ◈  Permit2         │  ← logo/wordmark │
│                    │   (Indigo-600, bold) │                  │
│                    │                      │                  │
│                    │  Sign in to Permit2  │  ← H1: 30px bold │
│                    │  Manage your permits │  ← sub: 14px gray│
│                    │  in one place        │                  │
│                    │                      │                  │
│                    │  Email address *     │  ← label 14px    │
│                    │  ┌──────────────────┐│                  │
│                    │  │manager@company…  ││  ← input, focus  │
│                    │  └──────────────────┘│                  │
│                    │                      │                  │
│                    │  Password *          │                  │
│                    │  ┌──────────────────┐│                  │
│                    │  │ ••••••••         ││                  │
│                    │  └──────────────────┘│                  │
│                    │                      │                  │
│                    │  ┌──────────────────┐│                  │
│                    │  │    Sign In  →    ││  ← primary btn   │
│                    │  └──────────────────┘│  (Indigo-600 bg) │
│                    │                      │                  │
│                    │  [inline error zone] │  ← hidden default│
│                    │                      │                  │
│                    └──────────────────────┘                  │
│                    Permit2 POC — Restricted Access            │
│                    (caption, gray, centered)                  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

#### Information Hierarchy

| Priority | Content | Placement |
|----------|---------|-----------|
| Primary | "Sign in to Permit2" heading + form card | Center screen, ~40% width, vertically centered |
| Secondary | Email + password inputs + Sign In button | Inside card, stacked vertically with 16px gaps |
| Tertiary | Subheading, footer note | Below logo, below card |

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Default | Card on gradient background; email field focused | Cursor in email field |
| Field error (empty) | Red border on field; inline red text below: "Email is required." | Focus remains on errored field |
| Field error (bad email) | Red border; "Please enter a valid email address." | — |
| Loading | Button: spinner + "Signing in…" text; button disabled; both fields disabled | Visual spinner in button |
| Auth error | Inline error banner above button: "Invalid email or password." in red; password field cleared | Focus → password field |
| Server error | Inline error: "An unexpected error occurred. Please try again." | — |
| Authenticated redirect | — | Instantly navigates to /dashboard |

#### Interactive Elements

| Element | Type | Behavior |
|---------|------|----------|
| Email input | Text input (type=email) | Auto-focused on page load; validates on blur and submit |
| Password input | Password input | Validates non-empty on blur and submit |
| Sign In button | Primary CTA (full-width) | Disabled during loading; triggers validation then API call |
| Form | Form element | Enter key in any field submits the form |

#### Visual Design Notes
- Card: white bg, 12px radius, soft shadow (`0 4px 6px rgba(0,0,0,0.07)`), 40px padding
- Background: subtle indigo gradient or radial glow pattern — not flat gray
- Logo "Permit2" uses Inter 700, Indigo-600, with a small permit/shield icon to the left
- Sign In button: full-width, Indigo-600 bg, white text, 12px radius, hover → Indigo-700 + slight scale
- Error state: red-50 background inline error block with red-600 text and warning icon
