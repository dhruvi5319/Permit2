---

## Y2: Cross-Feature Error Catalog

**Document:** Permit2 FRD — Cross-Feature Chunk
**Section:** Error Catalog

All error codes, HTTP status codes, messages, and client-handling guidance for the Permit2 API.

---

### Error Response Format

All API errors use the standard envelope:

```json
{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": [
      { "field": "fieldName", "message": "Field-specific error" }
    ]
  },
  "meta": {}
}
```

`details` is only present for `VALIDATION_ERROR` responses (field-level errors). All other error types omit `details` or set it to `[]`.

---

### Error Code Registry

| Error Code | HTTP Status | Category | Description | Client Handling |
|---|---|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | 401 | Auth | Email not found or password incorrect. Generic message to prevent user enumeration. | Show inline form error: "Invalid email or password." |
| `AUTH_UNAUTHORIZED` | 401 | Auth | Request is missing a valid authentication token (not present, malformed). | Redirect to `/login` with current path as `?redirect=` param. |
| `AUTH_TOKEN_EXPIRED` | 401 | Auth | JWT token has passed its expiry time. | Clear session; redirect to `/login` with toast: "Your session has expired. Please sign in again." |
| `VALIDATION_ERROR` | 400 | Validation | One or more request fields failed validation. See `details` array for field-level messages. | Display field-level errors inline below the relevant inputs; scroll to first error. |
| `INVALID_TRANSITION` | 400 | Business Logic | Attempted lifecycle action is not valid for the permit's current status (e.g., approving an already-approved permit). | Show error toast: "This action is not available for the current permit status." Keep dialog closed. |
| `PERMIT_NOT_FOUND` | 404 | Not Found | No permit exists with the given ID. | Show 404 state on the detail page; offer "Back to Permits" link. |
| `NOT_FOUND` | 404 | Not Found | The requested API route does not exist. | Log to console; show generic error to user. |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Request Format | Request body is not `application/json`. | Developer error; should not surface to end users in production. |
| `SERVER_ERROR` | 500 | Server | Unexpected server-side error. Stack trace is never returned; only the generic message. | Show error toast: "An unexpected error occurred. Please try again." Offer retry if applicable. |

---

### Validation Error Detail Format

When `code === "VALIDATION_ERROR"`, the `details` array contains one entry per failing field:

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": [
      { "field": "title", "message": "Title is required." },
      { "field": "end_date", "message": "End date must be on or after the start date." },
      { "field": "type", "message": "Invalid permit type." }
    ]
  },
  "meta": {}
}
```

**Field Error Messages by Field:**

| Field | Condition | Message |
|---|---|---|
| `email` | Missing or empty | "Email is required." |
| `email` | Invalid format | "Please enter a valid email address." |
| `password` | Missing or empty | "Password is required." |
| `title` | Missing or empty | "Permit title is required." |
| `title` | Exceeds 255 chars | "Permit title must not exceed 255 characters." |
| `type` | Missing | "Permit type is required." |
| `type` | Invalid value | "Invalid permit type. Must be one of: WORK, ACCESS, ACTIVITY, SAFETY, OTHER." |
| `applicant_name` | Missing or empty | "Applicant name is required." |
| `applicant_name` | Exceeds 255 chars | "Applicant name must not exceed 255 characters." |
| `description` | Missing or empty | "Description is required." |
| `description` | Exceeds 2000 chars | "Description must not exceed 2000 characters." |
| `notes` | Exceeds 1000 chars | "Notes must not exceed 1000 characters." |
| `start_date` | Missing | "Start date is required." |
| `start_date` | Invalid date format | "Start date must be a valid date (YYYY-MM-DD)." |
| `end_date` | Missing | "End date is required." |
| `end_date` | Invalid date format | "End date must be a valid date (YYYY-MM-DD)." |
| `end_date` | Before `start_date` | "End date must be on or after the start date." |
| `reason` | Exceeds 500 chars | "Reason must not exceed 500 characters." |
| `notes` (lifecycle) | Exceeds 500 chars | "Notes must not exceed 500 characters." |

---

### Invalid Transition Error Messages

| Action | Current Status | Error Message |
|---|---|---|
| `approve` | `APPROVED` | "This permit cannot be approved: it is already approved." |
| `approve` | `REJECTED` | "This permit cannot be approved: it has been rejected." |
| `approve` | `REVOKED` | "This permit cannot be approved: it has been revoked." |
| `reject` | `APPROVED` | "This permit cannot be rejected: it has already been approved." |
| `reject` | `REJECTED` | "This permit cannot be rejected: it has already been rejected." |
| `reject` | `REVOKED` | "This permit cannot be rejected: it has been revoked." |
| `revoke` | `PENDING` | "This permit cannot be revoked: it is still pending approval." |
| `revoke` | `REJECTED` | "This permit cannot be revoked: it has been rejected." |
| `revoke` | `REVOKED` | "This permit cannot be revoked: it has already been revoked." |

---

### Client-Side Error Handling Guidelines

**Toast display rules:**
- Success toasts: green, auto-dismiss after 5 seconds.
- Error toasts: red, auto-dismiss after 8 seconds + manual dismiss button.
- Never show raw error codes to end users (display human-readable messages only).
- Never show stack traces or internal error details to end users.

**Authentication error handling:**
- Any `401` response from any endpoint: clear client session state and redirect to `/login?redirect=[current path]`.
- Show toast before redirect: "Your session has expired. Please sign in again."

**Network/timeout error handling (no HTTP response received):**
- Show error toast: "Connection failed. Please check your network and try again."
- Retry button where applicable.

**Form submission error handling:**
- On `400 VALIDATION_ERROR`: re-enable form; map `details` array to inline field errors.
- On `401`: redirect to login (session expired during form fill).
- On `500`: re-enable form; show error toast; do not clear form data so the user can retry.

---

### HTTP Status Code Summary

| Status | Used For |
|---|---|
| `200 OK` | Successful GET, successful PATCH (lifecycle actions), successful logout |
| `201 Created` | Successful POST /permits |
| `400 Bad Request` | Validation errors, invalid state transitions |
| `401 Unauthorized` | Missing/invalid/expired auth token, invalid credentials |
| `404 Not Found` | Permit not found, unknown route |
| `415 Unsupported Media Type` | Non-JSON request body |
| `500 Internal Server Error` | Unexpected server errors |
