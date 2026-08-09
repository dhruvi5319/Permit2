'use client';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { NavBar } from '@/components/layout/NavBar';

interface LayoutShellProps {
  children: React.ReactNode;
  userName?: string;
}

export function LayoutShell({ children, userName }: LayoutShellProps) {
  return (
    <QueryProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <NavBar userName={userName} />
          <main className="max-w-[1280px] mx-auto px-6 py-8">
            {children}
          </main>
        </div>
      </ToastProvider>
    </QueryProvider>
  );
}
