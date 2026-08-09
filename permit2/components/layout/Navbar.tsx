'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/components/ui/Toast';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/permits',   label: 'Permits'   },
  ];

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore — redirect regardless
    }
    router.push('/login');
  }

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-40 bg-white border-b border-gray-200 h-16"
    >
      <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center gap-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600 font-bold text-lg flex-shrink-0">
          <Shield className="w-5 h-5" aria-hidden="true" />
          Permit2
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
