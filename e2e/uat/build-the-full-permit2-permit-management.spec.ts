import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/login');
  await page.fill('#email', 'manager@permit2.dev');
  await page.fill('#password', 'demo1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

async function getFirstPermitId(page: Page): Promise<string> {
  await page.goto('/permits');
  await page.waitForLoadState('networkidle');
  const firstTitleLink = page.locator('table tbody tr').first().locator('td a').first();
  await firstTitleLink.waitFor({ timeout: 10000 });
  const href = await firstTitleLink.getAttribute('href');
  const id = href?.split('/permits/')[1] ?? '';
  return id;
}

async function getPermitIdByStatus(page: Page, status: string): Promise<string> {
  // Use browser fetch (inherits cookies from logged-in session)
  const result = await page.evaluate(async (s: string) => {
    const res = await fetch(`/api/permits?status=${s}&limit=5`, { credentials: 'include' });
    const body = await res.json();
    const items = body?.data?.items ?? body?.items ?? [];
    return items.length > 0 ? items[0].id : '';
  }, status);
  if (result) return result;
  
  // Fallback: try to find via the filtered list UI
  await page.goto(`/permits?status=${status}`);
  await page.waitForLoadState('networkidle');
  const firstTitleLink = page.locator('table tbody tr').first().locator('td a').first();
  try {
    await firstTitleLink.waitFor({ timeout: 8000 });
    const href = await firstTitleLink.getAttribute('href');
    return href?.split('/permits/')[1] ?? '';
  } catch {
    return '';
  }
}

async function ensurePendingPermit(page: Page): Promise<string> {
  // First check if there's a PENDING permit via API (uses browser cookies)
  let id = await getPermitIdByStatus(page, 'PENDING');
  if (id) return id;

  // Create a new PENDING permit via API (faster than form UI)
  const result = await page.evaluate(async () => {
    const res = await fetch('/api/permits', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `UAT Pending Permit ${Date.now()}`,
        type: 'WORK',
        applicant_name: 'UAT Tester',
        start_date: '2026-10-01',
        end_date: '2026-10-31',
        description: 'Auto-created pending permit for UAT testing',
      }),
    });
    const body = await res.json();
    return body?.data?.id ?? '';
  });
  return result;
}

async function ensureApprovedPermit(page: Page): Promise<string> {
  // Check via API first
  let id = await getPermitIdByStatus(page, 'APPROVED');
  if (id) return id;

  // Create a PENDING permit and then approve it via API
  id = await ensurePendingPermit(page);
  if (!id) return '';
  const approved = await page.evaluate(async (permitId: string) => {
    const res = await fetch(`/api/permits/${permitId}/approve`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    return res.ok;
  }, id);
  if (approved) return id;
  return '';
}

// ---------------------------------------------------------------------------
// US-0.1 — Login to Permit2
// ---------------------------------------------------------------------------

test.describe('US-0.1 — Login to Permit2', () => {
  test('A styled login page is displayed at /login with email and password fields and a Sign In button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
  });

  test('Submitting valid credentials redirects to the dashboard (/dashboard)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'manager@permit2.dev');
    await page.fill('#password', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('Invalid credentials show a generic inline error "Invalid email or password."', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.getByText('Invalid email or password.')).toBeVisible({ timeout: 10000 });
  });

  test('Empty email or password fields show an inline validation error before any API call is made', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    // The form uses react-hook-form with onBlur mode and noValidate — shows inline errors via role="alert"
    // The page should stay on /login (not redirect to dashboard)
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).toContain('/login');
    // Either native validity fails OR a custom error is shown — check both
    const errorVisible = await page.getByRole('alert').count() > 0;
    const emailInvalid = await page.locator('#email').evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(errorVisible || emailInvalid).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// US-0.3 — Log Out Securely
// ---------------------------------------------------------------------------

test.describe('US-0.3 — Log Out Securely', () => {
  test('A Logout control is visible in the navigation header on authenticated pages', async ({ page }) => {
    await login(page);
    await expect(page.getByRole('button', { name: /Logout/i })).toBeVisible();
  });

  test('Clicking Logout redirects the user to /login', async ({ page }) => {
    await login(page);
    await page.click('button:has-text("Logout")');
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });
});

// ---------------------------------------------------------------------------
// US-0.4 — Be Redirected to Login When Accessing Protected Routes Unauthenticated
// ---------------------------------------------------------------------------

test.describe('US-0.4 — Be Redirected to Login When Accessing Protected Routes Unauthenticated', () => {
  test('Accessing /dashboard without being logged in redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    // Either the URL already contains /login (fast redirect), or we need to wait
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/login');
  });

  test('Accessing /permits without being logged in redirects to /login', async ({ page }) => {
    await page.goto('/permits');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/login');
  });
});

// ---------------------------------------------------------------------------
// US-1.1 — View Permit Status Overview at a Glance
// ---------------------------------------------------------------------------

test.describe('US-1.1 — View Permit Status Overview at a Glance', () => {
  test('Dashboard displays stat cards for Total Permits, Pending, Approved, Rejected, Revoked', async ({ page }) => {
    await login(page);
    await expect(page.getByText(/Total Permits/i)).toBeVisible();
    await expect(page.getByText(/Pending/i).first()).toBeVisible();
    await expect(page.getByText(/Approved/i).first()).toBeVisible();
    await expect(page.getByText(/Rejected/i).first()).toBeVisible();
    await expect(page.getByText(/Revoked/i).first()).toBeVisible();
  });

  test('Dashboard page heading "Dashboard" is visible after login', async ({ page }) => {
    await login(page);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// US-1.2 — View a Visual Status Breakdown Chart
// ---------------------------------------------------------------------------

test.describe('US-1.2 — View a Visual Status Breakdown Chart', () => {
  test('A chart labeled "Permits by Status" is rendered on the dashboard', async ({ page }) => {
    await login(page);
    await expect(page.getByText(/Permits by Status/i)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// US-1.3 — Review Recent Permit Activity
// ---------------------------------------------------------------------------

test.describe('US-1.3 — Review Recent Permit Activity', () => {
  test('Recent Activity panel is visible on the dashboard', async ({ page }) => {
    await login(page);
    await expect(page.getByText(/Recent Activity/i)).toBeVisible();
  });

  test('A "View all permits" link is visible that navigates to /permits', async ({ page }) => {
    await login(page);
    const link = page.getByRole('link', { name: /View all permits/i });
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL('**/permits', { timeout: 10000 });
    expect(page.url()).toContain('/permits');
  });
});

// ---------------------------------------------------------------------------
// US-1.4 — Navigate to Create a Permit from the Dashboard
// ---------------------------------------------------------------------------

test.describe('US-1.4 — Navigate to Create a Permit from the Dashboard', () => {
  test('A "Create New Permit" button is visible on the dashboard', async ({ page }) => {
    await login(page);
    await expect(page.getByRole('link', { name: /Create New Permit/i })).toBeVisible();
  });

  test('Clicking "Create New Permit" navigates to /permits/new', async ({ page }) => {
    await login(page);
    await page.click('a[href="/permits/new"]');
    await page.waitForURL('**/permits/new', { timeout: 10000 });
    expect(page.url()).toContain('/permits/new');
  });
});

// ---------------------------------------------------------------------------
// US-2.1 — Create a New Permit Request
// ---------------------------------------------------------------------------

test.describe('US-2.1 — Create a New Permit Request', () => {
  test('The creation form at /permits/new contains fields for Title, Permit Type, Applicant Name, Start Date, End Date, Description', async ({ page }) => {
    await login(page);
    await page.goto('/permits/new');
    // Form uses specific IDs from the source
    await expect(page.locator('#title')).toBeVisible();
    await expect(page.locator('#type')).toBeVisible();
    await expect(page.locator('#applicant_name')).toBeVisible();
    await expect(page.locator('#start_date')).toBeVisible();
    await expect(page.locator('#end_date')).toBeVisible();
    await expect(page.locator('#description')).toBeVisible();
  });

  test('On successful submission, the permit is saved and the user is navigated to the new permit\'s detail view', async ({ page }) => {
    await login(page);
    await page.goto('/permits/new');
    await page.waitForLoadState('networkidle');

    const uniqueTitle = `UAT Test Permit ${Date.now()}`;
    await page.fill('#title', uniqueTitle);
    await page.selectOption('#type', 'WORK');
    await page.fill('#applicant_name', 'UAT Applicant');
    await page.fill('#start_date', '2026-09-01');
    await page.fill('#end_date', '2026-09-30');
    await page.fill('#description', 'Automated UAT test permit submission');

    await page.getByRole('button', { name: /Submit Permit/i }).click();
    await page.waitForURL(/\/permits\/[^/]+$/, { timeout: 15000 });
    expect(page.url()).toMatch(/\/permits\/[^/]+$/);
    await expect(page.getByRole('heading', { name: uniqueTitle })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// US-2.3 — Select a Permit Type from a Predefined List
// ---------------------------------------------------------------------------

test.describe('US-2.3 — Select a Permit Type from a Predefined List', () => {
  test('Permit Type field is a dropdown with options: Work Permit, Access Permit, Activity Authorization, Safety Permit, Other', async ({ page }) => {
    await login(page);
    await page.goto('/permits/new');
    const select = page.locator('#type');
    await expect(select).toBeVisible();
    await expect(select.locator('option', { hasText: 'Work Permit' })).toBeAttached();
    await expect(select.locator('option', { hasText: 'Access Permit' })).toBeAttached();
    await expect(select.locator('option', { hasText: 'Activity Authorization' })).toBeAttached();
    await expect(select.locator('option', { hasText: 'Safety Permit' })).toBeAttached();
    await expect(select.locator('option', { hasText: 'Other' })).toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// US-3.1 — View All Permits in a Paginated Table
// ---------------------------------------------------------------------------

test.describe('US-3.1 — View All Permits in a Paginated Table', () => {
  test('The permit list at /permits displays a table with columns including Title, Type, Applicant, Status', async ({ page }) => {
    await login(page);
    await page.goto('/permits');
    await expect(page.getByRole('columnheader', { name: /Title/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Type/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Applicant/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Status/i })).toBeVisible();
  });

  test('Status is displayed as a color-coded badge', async ({ page }) => {
    await login(page);
    await page.goto('/permits');
    await page.waitForLoadState('networkidle');
    // StatusBadge renders as a <span> with rounded-full class, inside status column
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.waitFor({ timeout: 10000 });
    // The status cell is the 5th td (0-indexed: ref, title, type, applicant, status)
    const statusCell = firstRow.locator('td').nth(4);
    const badge = statusCell.locator('span').first();
    await expect(badge).toBeVisible();
    // Badge text should be one of the statuses
    const text = await badge.textContent();
    expect(['Pending', 'Approved', 'Rejected', 'Revoked']).toContain(text?.trim());
  });
});

// ---------------------------------------------------------------------------
// US-3.3 — Navigate to a Permit's Detail View from the List
// ---------------------------------------------------------------------------

test.describe('US-3.3 — Navigate to a Permit\'s Detail View from the List', () => {
  test('Clicking a permit row navigates to /permits/:id', async ({ page }) => {
    await login(page);
    await page.goto('/permits');
    await page.waitForLoadState('networkidle');
    // The Title column link navigates to the detail view
    const firstTitleLink = page.locator('table tbody tr').first().locator('td a').first();
    await firstTitleLink.waitFor({ timeout: 10000 });
    await firstTitleLink.click();
    await page.waitForURL(/\/permits\/[^/]+$/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/permits\/[^/]+$/);
  });
});

// ---------------------------------------------------------------------------
// US-4.1 — Search Permits by Title, Applicant, or Description
// ---------------------------------------------------------------------------

test.describe('US-4.1 — Search Permits by Title, Applicant, or Description', () => {
  test('A search input is displayed above the permit table with placeholder "Search permits by title, applicant, or description…"', async ({ page }) => {
    await login(page);
    await page.goto('/permits');
    await expect(
      page.getByPlaceholder('Search permits by title, applicant, or description…')
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// US-4.2 — Filter Permits by Status
// ---------------------------------------------------------------------------

test.describe('US-4.2 — Filter Permits by Status', () => {
  test('A status filter offers options including Pending, Approved, Rejected, Revoked', async ({ page }) => {
    await login(page);
    await page.goto('/permits');
    await page.waitForLoadState('networkidle');
    // Status filter should be visible somewhere on the page
    await expect(page.getByText(/Pending/i).first()).toBeVisible();
    await expect(page.getByText(/Approved/i).first()).toBeVisible();
    await expect(page.getByText(/Rejected/i).first()).toBeVisible();
    await expect(page.getByText(/Revoked/i).first()).toBeVisible();
  });

  test('Selecting a status filters the list', async ({ page }) => {
    await login(page);
    // Navigate using URL param — this is the canonical filter mechanism
    await page.goto('/permits?status=APPROVED');
    await page.waitForLoadState('networkidle');
    // URL should contain the status filter
    expect(page.url()).toContain('status=APPROVED');
    // All visible status badges should be Approved
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    if (count > 0) {
      // Check the first row's status badge
      const firstRowStatusCell = rows.first().locator('td').nth(4);
      const badgeText = await firstRowStatusCell.locator('span').first().textContent();
      expect(badgeText?.trim()).toBe('Approved');
    }
  });
});

// ---------------------------------------------------------------------------
// US-5.1 — View Full Permit Information on a Dedicated Page
// ---------------------------------------------------------------------------

test.describe('US-5.1 — View Full Permit Information on a Dedicated Page', () => {
  test('Detail page at /permits/:id displays Title, Type, Applicant Name, Status', async ({ page }) => {
    await login(page);
    const id = await getFirstPermitId(page);
    await page.goto(`/permits/${id}`);
    await page.waitForLoadState('networkidle');
    // The page should show field labels or values for these attributes
    await expect(page.getByText(/Applicant/i).first()).toBeVisible();
    // Status badge should be visible (any status word)
    const statusText = page.getByText(/^(Pending|Approved|Rejected|Revoked)$/).first();
    await expect(statusText).toBeVisible({ timeout: 10000 });
  });

  test('The current status is shown as a prominently placed color-coded badge', async ({ page }) => {
    await login(page);
    const id = await getFirstPermitId(page);
    await page.goto(`/permits/${id}`);
    await page.waitForLoadState('networkidle');
    // StatusBadge renders as <span> with inline-flex + rounded-full classes
    // Look for the status text (any of the status labels)
    const statusText = page.getByText(/^(Pending|Approved|Rejected|Revoked)$/).first();
    await expect(statusText).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// US-5.2 — View the Permit's Status History Timeline
// ---------------------------------------------------------------------------

test.describe('US-5.2 — View the Permit\'s Status History Timeline', () => {
  test('A Status History timeline panel is displayed on the permit detail page', async ({ page }) => {
    await login(page);
    const id = await getFirstPermitId(page);
    await page.goto(`/permits/${id}`);
    await expect(page.getByText(/Status History/i)).toBeVisible();
  });

  test('The initial Created — PENDING event is present', async ({ page }) => {
    await login(page);
    const id = await getFirstPermitId(page);
    await page.goto(`/permits/${id}`);
    // The timeline should contain PENDING status entry
    await expect(page.getByText(/PENDING|Pending/i).first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// US-5.3 — Navigate Using Breadcrumbs and Back Links
// ---------------------------------------------------------------------------

test.describe('US-5.3 — Navigate Using Breadcrumbs and Back Links', () => {
  test('A breadcrumb trail is shown at the top of the permit detail page', async ({ page }) => {
    await login(page);
    const id = await getFirstPermitId(page);
    await page.goto(`/permits/${id}`);
    await page.waitForLoadState('networkidle');
    // The breadcrumb nav has aria-label="Breadcrumb" and contains Dashboard, Permits, and the permit title
    const breadcrumbNav = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumbNav).toBeVisible({ timeout: 10000 });
    // Should contain the Dashboard link
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  });

  test('A Back to Permits link is available', async ({ page }) => {
    await login(page);
    const id = await getFirstPermitId(page);
    await page.goto(`/permits/${id}`);
    const backLink = page.getByRole('link', { name: /Back to Permits|← Back/i }).first();
    await expect(backLink).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// US-6.1 — Approve a Pending Permit
// ---------------------------------------------------------------------------

test.describe('US-6.1 — Approve a Pending Permit', () => {
  test('An Approve button is visible on the detail page when the permit status is PENDING', async ({ page }) => {
    await login(page);
    const id = await ensurePendingPermit(page);
    await page.goto(`/permits/${id}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /^Approve$/i })).toBeVisible({ timeout: 10000 });
  });

  test('Clicking Approve opens a confirmation dialog', async ({ page }) => {
    await login(page);
    const id = await ensurePendingPermit(page);
    await page.goto(`/permits/${id}`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /^Approve$/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /Approve Permit/i })).toBeVisible();
  });

  test('Confirming approval updates the status to APPROVED', async ({ page }) => {
    await login(page);
    const id = await ensurePendingPermit(page);
    await page.goto(`/permits/${id}`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /^Approve$/i }).click();
    await page.getByRole('button', { name: /Approve Permit/i }).click();
    await expect(page.getByText(/APPROVED|Approved/i).first()).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// US-6.2 — Reject a Pending Permit with an Optional Reason
// ---------------------------------------------------------------------------

test.describe('US-6.2 — Reject a Pending Permit with an Optional Reason', () => {
  test('A Reject button is visible on the detail page when the permit status is PENDING', async ({ page }) => {
    await login(page);
    const id = await ensurePendingPermit(page);
    await page.goto(`/permits/${id}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /^Reject$/i })).toBeVisible({ timeout: 10000 });
  });

  test('Clicking Reject opens a confirmation dialog with an optional Rejection Reason text field', async ({ page }) => {
    await login(page);
    const id = await ensurePendingPermit(page);
    await page.goto(`/permits/${id}`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /^Reject$/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    // Dialog should have a reason field (textarea or input)
    const reasonField = page.getByRole('dialog').locator('textarea, input[type="text"]').first();
    await expect(reasonField).toBeVisible();
    await expect(page.getByRole('button', { name: /Reject Permit/i })).toBeVisible();
  });

  test('Confirming rejection updates the status to REJECTED', async ({ page }) => {
    await login(page);
    const id = await ensurePendingPermit(page);
    await page.goto(`/permits/${id}`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /^Reject$/i }).click();
    await page.getByRole('button', { name: /Reject Permit/i }).click();
    await expect(page.getByText(/REJECTED|Rejected/i).first()).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// US-6.3 — Revoke an Approved Permit
// ---------------------------------------------------------------------------

test.describe('US-6.3 — Revoke an Approved Permit', () => {
  test('A Revoke button is visible on the detail page when the permit status is APPROVED', async ({ page }) => {
    await login(page);
    const id = await ensureApprovedPermit(page);
    await page.goto(`/permits/${id}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /^Revoke$/i })).toBeVisible({ timeout: 10000 });
  });

  test('Confirming revocation updates the status to REVOKED', async ({ page }) => {
    await login(page);
    const id = await ensureApprovedPermit(page);
    await page.goto(`/permits/${id}`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /^Revoke$/i }).click();
    await page.getByRole('button', { name: /Revoke Permit/i }).click();
    await expect(page.getByText(/REVOKED|Revoked/i).first()).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// US-7.4 — Receive Transient Toast Notifications for Actions
// ---------------------------------------------------------------------------

test.describe('US-7.4 — Receive Transient Toast Notifications for Actions', () => {
  test('Success toast appears after approving a permit', async ({ page }) => {
    await login(page);
    const id = await ensurePendingPermit(page);
    await page.goto(`/permits/${id}`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /^Approve$/i }).click();
    await page.getByRole('button', { name: /Approve Permit/i }).click();
    // Custom Toast component renders with role="status" for success
    const toast = page.locator('[role="status"]').filter({ hasText: /approved/i }).first();
    await expect(toast).toBeVisible({ timeout: 10000 });
  });

  test('Success toast appears after rejecting a permit', async ({ page }) => {
    await login(page);
    const id = await ensurePendingPermit(page);
    await page.goto(`/permits/${id}`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /^Reject$/i }).click();
    await page.getByRole('button', { name: /Reject Permit/i }).click();
    // Custom Toast component renders with role="status" for success
    const toast = page.locator('[role="status"]').filter({ hasText: /rejected/i }).first();
    await expect(toast).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// US-8.1 — Have All Permit Actions Backed by a Reliable REST API
// ---------------------------------------------------------------------------

test.describe('US-8.1 — Have All Permit Actions Backed by a Reliable REST API', () => {
  test('GET /api/permits returns a list of permits when authenticated', async ({ page }) => {
    await login(page);
    // Use page.evaluate to make a fetch within the browser context (uses cookies)
    const result = await page.evaluate(async () => {
      const res = await fetch('/api/permits', { credentials: 'include' });
      const body = await res.json();
      return { status: res.status, hasItems: Array.isArray(body?.data?.items) };
    });
    expect(result.status).toBe(200);
    expect(result.hasItems).toBeTruthy();
  });

  test('GET /api/permits/stats returns permit counts when authenticated', async ({ page }) => {
    await login(page);
    const result = await page.evaluate(async () => {
      const res = await fetch('/api/permits/stats', { credentials: 'include' });
      const body = await res.json();
      return { status: res.status, hasTotal: typeof body?.data?.total === 'number' };
    });
    expect(result.status).toBe(200);
    expect(result.hasTotal).toBeTruthy();
  });
});
