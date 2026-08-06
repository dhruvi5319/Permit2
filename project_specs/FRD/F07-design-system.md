---

## F07: UI Design System & Visual Polish

**Priority:** P0 — Critical
**PRD Reference:** F7

---

### Description

The visual design quality of Permit2 is an explicit, first-class requirement, not a nice-to-have. The application must look and feel beautiful, modern, and professional — indistinguishable from a production SaaS product on first impression. This feature defines the design system that governs the appearance and interaction behavior of every screen, component, and state in the application. All feature implementations must adhere to this design system; inconsistency is a defect.

---

### Terminology

- **Design Token:** A named, reusable value (color, spacing, font size) used consistently throughout the application.
- **Brand Primary Color:** The dominant color used for primary buttons, active states, links, and nav highlights.
- **Semantic Color:** A color associated with a specific meaning (green = success/approved, amber = warning/pending, red = error/rejected/revoked, gray = neutral/inactive).
- **Typography Scale:** A defined set of font sizes, weights, and line heights used for headings, body text, labels, and captions.
- **Spacing System:** A consistent set of spacing values (typically multiples of 4px) used for padding, margin, and gap.
- **Micro-animation:** A subtle, brief animation applied to UI state changes (hover, focus, modal open/close) that improves perceived polish without distracting.
- **Skeleton Screen:** A placeholder that mimics the shape of loading content, animated with a shimmer/pulse effect.
- **Component Library:** The set of reusable UI components (shadcn/ui + Radix UI recommended) that serve as the implementation foundation.

---

### Sub-features

- **F07.1 — Color Palette & Tokens:** Defined brand and semantic colors applied globally.
- **F07.2 — Typography Scale:** Font family, size scale, weight, and line-height definitions.
- **F07.3 — Spacing System:** Base unit (4px) with a consistent scale applied to all layout and component spacing.
- **F07.4 — Status Badge System:** Color-coded, pill-shaped badges for each permit status — used consistently across all screens.
- **F07.5 — Micro-animations:** Hover states, page transitions, modal animations, button feedback.
- **F07.6 — Card System:** Elevated card component used for stat blocks, form containers, detail panels.
- **F07.7 — Navigation Bar:** Persistent top navigation with active state indicators and user profile/logout.
- **F07.8 — Empty States:** Designed empty states (icon + heading + body + optional CTA) for all list and data surfaces.
- **F07.9 — Loading Skeletons:** Skeleton screen components for each major data surface.
- **F07.10 — Toast Notifications:** Styled success and error toast notifications (bottom-right).
- **F07.11 — Responsive Layout Grid:** 12-column grid at 1440px; 8-column at 1024px; 4-column at 768px.
- **F07.12 — Accessible Focus States:** Visible keyboard focus indicators on all interactive elements.
- **F07.13 — Icon System:** Consistent icon library (Lucide Icons recommended) applied throughout.

---

### Design Specifications

#### F07.1 — Color Palette

| Token | Value (Example) | Usage |
|---|---|---|
| `--color-brand-primary` | `#4F46E5` (Indigo-600) | Primary buttons, nav active, links |
| `--color-brand-primary-hover` | `#4338CA` (Indigo-700) | Hover state on primary elements |
| `--color-brand-light` | `#EEF2FF` (Indigo-50) | Subtle backgrounds, icon container fills |
| `--color-status-pending` | `#D97706` (Amber-600) | PENDING badge text |
| `--color-status-pending-bg` | `#FEF3C7` (Amber-100) | PENDING badge background |
| `--color-status-approved` | `#059669` (Emerald-600) | APPROVED badge text |
| `--color-status-approved-bg` | `#D1FAE5` (Emerald-100) | APPROVED badge background |
| `--color-status-rejected` | `#DC2626` (Red-600) | REJECTED badge text |
| `--color-status-rejected-bg` | `#FEE2E2` (Red-100) | REJECTED badge background |
| `--color-status-revoked` | `#6B7280` (Gray-500) | REVOKED badge text |
| `--color-status-revoked-bg` | `#F3F4F6` (Gray-100) | REVOKED badge background |
| `--color-surface` | `#FFFFFF` | Card and panel backgrounds |
| `--color-background` | `#F9FAFB` (Gray-50) | Page background |
| `--color-border` | `#E5E7EB` (Gray-200) | Card borders, dividers |
| `--color-text-primary` | `#111827` (Gray-900) | Primary body text |
| `--color-text-secondary` | `#6B7280` (Gray-500) | Labels, captions, muted text |
| `--color-danger` | `#DC2626` (Red-600) | Danger/destructive action buttons |
| `--color-success` | `#059669` (Emerald-600) | Success toast, approve button |

> Note: Exact hex values are recommendations. Implementer may adjust while preserving the semantic intent of each token. WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text) must be maintained.

---

#### F07.2 — Typography Scale

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `display` | 2.25rem (36px) | 700 Bold | 1.2 | Page headings (H1) |
| `heading-xl` | 1.875rem (30px) | 700 Bold | 1.3 | Section headings |
| `heading-lg` | 1.5rem (24px) | 600 SemiBold | 1.35 | Card titles |
| `heading-md` | 1.25rem (20px) | 600 SemiBold | 1.4 | Sub-section titles |
| `body-lg` | 1rem (16px) | 400 Regular | 1.6 | Body text |
| `body-sm` | 0.875rem (14px) | 400 Regular | 1.5 | Secondary text, table cells |
| `label` | 0.875rem (14px) | 500 Medium | 1.4 | Form labels, column headers |
| `caption` | 0.75rem (12px) | 400 Regular | 1.4 | Timestamps, helper text |

Font family: `Inter` (via Google Fonts or system stack: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`).

---

#### F07.4 — Status Badge Specification

All status badges must be:
- Pill-shaped (`border-radius: 9999px`)
- Horizontal padding: 12px; vertical padding: 4px
- Font: `body-sm` (14px), weight 500 (Medium)
- Color pairs: text color on matching background (see F07.1 color tokens)
- Size: consistent across all screens (same component, same sizing)
- Never use icons inside badges (text only for status badges)

```
[  Pending  ]  ← amber bg, amber text, pill shape
[  Approved ]  ← green bg, green text
[  Rejected ]  ← red bg, red text
[  Revoked  ]  ← gray bg, gray text
```

---

#### F07.5 — Micro-animations

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Primary button hover | Background darken + slight scale (1.01) | 150ms | ease-in-out |
| Secondary button hover | Border/text color change | 150ms | ease-in-out |
| Modal / Dialog open | Scale 0.95→1.0 + fade in | 150ms | ease-out |
| Modal / Dialog close | Scale 1.0→0.95 + fade out | 100ms | ease-in |
| Page transitions | Fade in (opacity 0→1) | 200ms | ease-in |
| Toast appear | Slide in from right + fade | 300ms | spring/ease-out |
| Toast dismiss | Fade out + slide right | 200ms | ease-in |
| Skeleton shimmer | Gradient sweep left→right | 1.5s | linear, infinite |

---

#### F07.6 — Card System

All cards use:
- Background: `--color-surface` (white)
- Border: 1px `--color-border`
- Border radius: `0.75rem` (12px)
- Shadow: `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` (subtle elevation)
- Padding: 24px on desktop, 16px on mobile

Elevated cards (used for stat cards, hero sections): use a slightly stronger shadow: `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)`.

---

#### F07.7 — Navigation Bar

**Top Navigation Bar:**
- Height: 64px
- Background: white with a bottom border (`1px --color-border`)
- Position: `sticky top-0`; `z-index: 50`
- Left: App logo/wordmark "Permit2" (brand primary color)
- Center/Right: Navigation links — "Dashboard", "Permits"
- Active link: brand primary color underline or highlight indicator
- Far right: User name + "Logout" button (secondary/ghost style)

**Navigation Link Active States:**
- Active page link has bottom border in brand primary color (or background highlight in indigo-50)
- Hover state: light background highlight

---

#### F07.8 — Empty States

Every empty state must include:
- A centered icon or simple illustration (SVG, ~80px)
- Heading text (heading-md)
- Body text (body-sm, muted)
- Optional CTA button (if an action is available)

Empty state icons:
- No permits (ever): document-plus icon
- No results (filtered): magnifying glass / no-results icon
- Error state: exclamation triangle icon

---

#### F07.9 — Loading Skeletons

Each skeleton element:
- Background: `--color-border` (#E5E7EB) with shimmer animation
- Border radius: matches the content element it represents (pill for badges, rounded for cards)
- Dimensions: approximate actual content dimensions

---

#### F07.10 — Toast Notifications

- Position: bottom-right, 16px from edge
- Max width: 380px
- Types: Success (green left border), Error (red left border), Info (blue left border)
- Auto-dismiss: 5 seconds for success, 8 seconds for errors
- Manual dismiss: `×` button on every toast
- Stack: up to 3 toasts visible simultaneously; older ones push up

---

#### F07.11 — Responsive Layout

| Viewport | Layout | Columns |
|---|---|---|
| 1440px (desktop) | Side-nav or top-nav + content | 12-column |
| 1280px (laptop) | Top-nav + content | 12-column |
| 1024px (small laptop) | Top-nav + content, narrower | 8-column |
| 768px (tablet) | Top-nav + stacked layout | 4-column, graceful degradation |

The primary target is 1024–1440px. All screens must be fully functional at 1024px. 768px is a graceful degradation target.

---

#### F07.12 — Accessibility

- All interactive elements must have visible focus indicators (outline or ring, not `outline: none` without replacement).
- Focus ring: `2px solid --color-brand-primary`, `2px offset`.
- Color must not be the sole differentiator — status badges use both color AND text labels.
- All images and icons have `alt` text or `aria-label`.
- Form inputs have associated `<label>` elements (not just `placeholder`).
- Confirm dialogs trap focus while open (focus cycling within the dialog).
- WCAG AA: 4.5:1 contrast ratio for normal text; 3:1 for large text (≥18px bold or ≥24px regular).

---

### Process

This feature does not have a discrete user flow — it is a set of cross-cutting standards applied during implementation of all other features. Implementation checklist:

1. Configure Tailwind CSS with custom design tokens matching the palette above.
2. Install and configure the component library (shadcn/ui recommended).
3. Create a `StatusBadge` component accepting `status` as a prop; apply the correct color pair.
4. Create a `Card` component with the standard shadow, border, and padding.
5. Create `Skeleton` wrapper components for each major data surface (stat cards, table rows, detail panels).
6. Create `Toast` component with success/error variants; hook into global state (Zustand or React Query).
7. Implement `NavBar` component with active link detection.
8. Implement `EmptyState` component accepting icon, heading, body, and optional CTA props.
9. Enforce `Inter` font loaded globally.
10. Write a Storybook (optional for POC) or a `/design-system` route to preview components in isolation.
11. Before demo, conduct a visual QA pass: compare all screens against the design spec; correct any spacing, color, or typography inconsistencies.

---

### Error States

This feature has no runtime error states. Design system violations are implementation-time defects, not runtime errors.

---

### API Surface (this feature)

None — this feature is purely frontend.

---

### Schema Surface (this feature)

None — this feature is purely frontend.
