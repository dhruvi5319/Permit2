---

### Screen 05: Confirmation Dialogs (Modal Overlays)

**Purpose:** Safety gate before any irreversible lifecycle action. Three variants: Approve, Reject, Revoke. All follow the same structural pattern with action-specific copy, colors, and optional reason fields.
**User Stories:** US-6.1, US-6.2, US-6.3, US-6.4
**Personas:** Marcus Webb (PER-01)

#### Layout — Shared Dialog Shell

```
┌──────────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░ BACKDROP OVERLAY (black, 50% opacity) ░░░░░░░░░░░ │
│ ░                                                              ░ │
│ ░              ┌──────────────────────────────┐               ░ │
│ ░              │                              │               ░ │
│ ░              │  [Dialog Title]           [×]│  ← dismiss    ░ │
│ ░              │                              │    (not during ░ │
│ ░              │  [Body copy with permit      │    loading)    ░ │
│ ░              │   title in bold]             │               ░ │
│ ░              │                              │               ░ │
│ ░              │  [Optional Reason Textarea]  │               ░ │
│ ░              │  (for Reject and Revoke)     │               ░ │
│ ░              │                              │               ░ │
│ ░              │  [Error message — inline]    │               ░ │
│ ░              │  (only on API failure)       │               ░ │
│ ░              │                              │               ░ │
│ ░              │  [Cancel]  [Confirm Button]  │               ░ │
│ ░              │                              │               ░ │
│ ░              └──────────────────────────────┘               ░ │
│ ░                                                              ░ │
└──────────────────────────────────────────────────────────────────┘
```

Dialog container: white bg, 12px radius, `0 20px 60px rgba(0,0,0,0.15)` shadow, max-width 480px, centered.
Animation: scale(0.95)→scale(1.0) + fade-in, 150ms ease-out on open; reverse 100ms on close.

---

#### Dialog Variant A: Approve

```
┌──────────────────────────────────────────┐
│  Approve Permit?                      [×]│
│  ──────────────────────────────────────  │
│                                          │
│  This will mark the permit              │
│  "Electrical Work — Building A"          │
│  as Approved and activate it.           │
│  This action cannot be undone.          │
│                                          │
│  Approval Notes (optional)              │
│  ┌──────────────────────────────────┐   │
│  │ Add any notes about this         │   │
│  │ approval…                        │   │
│  └──────────────────────────────────┘   │
│                                          │
│      [Cancel]   [✓ Approve Permit]       │
│                 (green primary)          │
└──────────────────────────────────────────┘
```

---

#### Dialog Variant B: Reject

```
┌──────────────────────────────────────────┐
│  Reject Permit?                       [×]│
│  ──────────────────────────────────────  │
│                                          │
│  This will mark the permit              │
│  "Electrical Work — Building A"          │
│  as Rejected. The applicant will not    │
│  be authorized.                         │
│                                          │
│  Rejection Reason (optional)            │
│  ┌──────────────────────────────────┐   │
│  │ Provide a reason for rejection… │   │
│  │ (max 500 characters)             │   │
│  └──────────────────────────────────┘   │
│                                          │
│      [Cancel]   [✗ Reject Permit]        │
│                 (red danger primary)     │
└──────────────────────────────────────────┘
```

---

#### Dialog Variant C: Revoke

```
┌──────────────────────────────────────────┐
│  Revoke Permit?                       [×]│
│  ──────────────────────────────────────  │
│                                          │
│  This will immediately deactivate        │
│  the permit                             │
│  "Electrical Work — Building A".        │
│  The permit will no longer be valid.    │
│                                          │
│  Revocation Reason (optional)           │
│  ┌──────────────────────────────────┐   │
│  │ Provide a reason for revocation…│   │
│  │ (max 500 characters)             │   │
│  └──────────────────────────────────┘   │
│                                          │
│      [Cancel]   [⊘ Revoke Permit]        │
│                 (amber danger primary)   │
└──────────────────────────────────────────┘
```

---

#### Loading State (all dialogs, during API call)

```
┌──────────────────────────────────────────┐
│  Approve Permit?                         │  ← [×] hidden during loading
│  ──────────────────────────────────────  │
│                                          │
│  [body copy — visible but uneditable]    │
│                                          │
│  [Reason textarea — disabled, grayed]    │
│                                          │
│      [Cancel — disabled]  [⟳ Processing…]│
│                            (disabled btn) │
└──────────────────────────────────────────┘
```

- Backdrop click: disabled during loading (prevents accidental close)
- Escape key: disabled during loading
- All form controls: disabled

#### Error State (API failure, dialog remains open)

```
│  ┌────────────────────────────────────┐  │
│  │ ⚠  Action failed. Please try again.│  │
│  └────────────────────────────────────┘  │
│  (red-50 bg, red-600 border, red text)   │
│  Appears below reason textarea           │
│                                          │
│      [Cancel]   [✗ Reject Permit]        │
│                 (button re-enabled)      │
```

#### States Summary

| State | Trigger | Appearance |
|-------|---------|------------|
| Closed | Default | Not rendered (not just hidden) |
| Opening | Button click | scale(0.95)→(1.0) + fade-in 150ms |
| Default open | After open animation | Normal dialog layout |
| Loading | Confirm button clicked | Spinner in button, all controls disabled, backdrop non-dismissible |
| Error | API returns non-200 | Inline error block visible, controls re-enabled |
| Closing (success) | After 200 response | Fade-out 100ms; toast appears |
| Closing (cancel) | Cancel or Escape | Fade-out 100ms; no state change |

#### Interactive Elements

| Element | Type | Behavior |
|---------|------|----------|
| [×] dismiss button | Ghost icon button | Closes dialog (only when not loading) |
| Backdrop click | Overlay | Closes dialog (only when not loading) |
| Escape key | Keyboard | Closes dialog (only when not loading) |
| Reason textarea | Optional textarea | max 500 chars; character counter optional |
| Cancel button | Secondary button | Closes dialog, no API call |
| Confirm button | Primary/Danger button | Triggers API call; enters loading state |
| Enter key | Keyboard | Triggers confirm (when not in textarea) |
