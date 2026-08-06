---

## Accessibility Notes

**Standard:** WCAG AA (minimum)
**User Story:** US-7.5 (NFR-4)

---

### Color Contrast

All text/background combinations must meet WCAG AA minimum ratios:
- **Normal text** (< 18px regular / < 14px bold): 4.5:1 minimum
- **Large text** (≥ 18px regular / ≥ 14px bold): 3:1 minimum

| Element | Foreground | Background | Target Ratio | Notes |
|---------|-----------|------------|--------------|-------|
| Body text | Gray-900 `#111827` | White `#FFFFFF` | 15.7:1 ✓ | Exceeds AA |
| Secondary text | Gray-500 `#6B7280` | White `#FFFFFF` | 4.6:1 ✓ | Passes AA |
| Pending badge text | Amber-600 `#D97706` | Amber-100 `#FEF3C7` | ~4.5:1 | Verify at implementation |
| Approved badge text | Emerald-600 `#059669` | Emerald-100 `#D1FAE5` | ~4.5:1 | Verify at implementation |
| Rejected badge text | Red-600 `#DC2626` | Red-100 `#FEE2E2` | ~4.5:1 | Verify at implementation |
| Primary button text | White | Indigo-600 `#4F46E5` | ~5.7:1 ✓ | Passes AA |
| Error text | Red-600 `#DC2626` | White `#FFFFFF` | ~4.5:1 | Verify at implementation |
| Toast text | Color-700 on Color-50 | — | Verify | Use darker text shades if needed |

**Important:** Color must NEVER be the sole differentiator. Status badges use both color AND text label ("Pending", "Approved", etc.). Chart segments have legend text labels. Error states use both red color AND warning icon AND text message.

---

### Keyboard Navigation

All interactive elements must be reachable and operable via keyboard:

| Element | Keyboard behavior |
|---------|-------------------|
| Nav links | Tab to focus; Enter to activate |
| Buttons | Tab to focus; Enter or Space to activate |
| Stat cards (clickable) | Tab to focus; Enter to navigate |
| Table rows (clickable) | Tab to focus; Enter to navigate to detail |
| Action links in table | Tab to focus; Enter to activate |
| Select dropdowns | Tab to focus; Arrow keys to navigate options; Enter to select |
| Date pickers | Tab to focus; Arrow keys within calendar; Enter to select |
| Textareas / inputs | Tab to focus; typing to enter text |
| Dialog (open) | Focus trapped inside dialog while open |
| Dialog confirm | Enter triggers confirm (when not in textarea) |
| Dialog cancel/close | Escape closes (when not loading) |
| Toast dismiss | Tab to `×` button; Enter to dismiss |
| Sort column headers | Tab to focus; Enter to sort; Enter again to toggle direction |
| Pagination buttons | Tab to focus; Enter to navigate |

**Focus Ring:** All focused elements display a visible 2px solid Indigo-600 ring with 2px offset. Never use `outline: none` without a custom replacement.

---

### Screen Reader Support

**Form inputs:** Every input and textarea MUST have an associated `<label>` element (not just `placeholder` text — placeholders disappear on focus and are not read reliably by all screen readers).

**Required fields:** Mark required fields with both the visual `*` and `aria-required="true"`.

**Error messages:** Inline validation errors must be announced to screen readers:
- Associate error message with input using `aria-describedby`
- Set `aria-invalid="true"` on invalid inputs
- Use `role="alert"` or `aria-live="polite"` for dynamically injected error messages

**Status badges:** The `StatusBadge` component must render visible text content (not just colored background), so screen readers read "Pending", "Approved", etc.

**Icons:** All icons that convey meaning (stat card icons, action link icons) must have `aria-label` or be accompanied by visible text. Decorative icons use `aria-hidden="true"`.

**Table:** The permit list table must use proper `<th scope="col">` for column headers. Sortable columns indicate sort state with `aria-sort="ascending|descending|none"`.

**Dialogs:** Use `role="dialog"` and `aria-modal="true"` on the dialog container. Focus is trapped within the dialog while open. `aria-labelledby` points to the dialog title.

**Toast notifications:** Use `role="status"` (for success) or `role="alert"` (for errors) so they are announced to screen readers without requiring focus.

**Loading states:** Skeleton screens are purely visual. During loading, the data container should have `aria-busy="true"` and a visible or accessible label like "Loading permits…" using `aria-label` or a visually hidden text element.

**Navigation:** The `<nav>` element wraps the nav bar. Active nav link uses `aria-current="page"`.

---

### ARIA Roles and Attributes Reference

| Component | Required ARIA |
|-----------|---------------|
| Nav bar | `<nav aria-label="Main navigation">` |
| Active nav link | `aria-current="page"` |
| Stat cards | `role="button"` or `<button>` element; `aria-label="View Pending permits: 8"` |
| Table | `<table>` with `<th scope="col">` for headers; `aria-sort` on sorted columns |
| Table row (clickable) | `role="button"` or `<tr tabindex="0" aria-label="...">` |
| Dialog | `role="dialog"` `aria-modal="true"` `aria-labelledby="dialog-title"` |
| Toast (success) | `role="status"` `aria-live="polite"` |
| Toast (error) | `role="alert"` `aria-live="assertive"` |
| Loading skeleton | `aria-busy="true"` on parent container |
| Form error | `aria-invalid="true"` on input; `aria-describedby="error-id"` pointing to error message |
| Required field | `aria-required="true"` |
| Status badge | Plain visible text ("Pending"); no special role needed |
| Dismiss button | `aria-label="Dismiss notification"` |

---

### Focus Management

**Modal dialog (open):** Move focus to the first focusable element inside the dialog (typically the title or first input).

**Modal dialog (close — success):** Return focus to the element that triggered the dialog (the Approve/Reject/Revoke button on the detail page).

**Modal dialog (close — cancel):** Return focus to the trigger button.

**Form validation (submit with errors):** Scroll to and focus the first invalid field.

**Toast notifications:** Do not steal focus; use `aria-live` regions for announcement only.

**Page transitions:** On navigation, focus should move to the top of the new page (main content or heading).
