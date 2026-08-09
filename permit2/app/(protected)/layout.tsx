import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { LayoutShell } from '@/components/providers/LayoutShell';

async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/auth/me`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as { id: string; email: string; name: string } | null;
  } catch {
    return null;
  }
}

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <LayoutShell userName={user.name}>
      {children}
    </LayoutShell>
  );
}
