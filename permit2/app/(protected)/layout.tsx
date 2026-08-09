import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from '@/components/layout/Navbar';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-[1280px] mx-auto px-6 py-8">
            {children}
          </main>
        </div>
      </ToastProvider>
    </QueryProvider>
  );
}
