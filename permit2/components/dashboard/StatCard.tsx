import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  count: number | undefined;
  icon: LucideIcon;
  href: string;
  accentColor: string;   // Tailwind border-left color class
  bgColor: string;       // Tailwind icon bg color class
  textColor: string;     // Tailwind icon text color class
  isLoading?: boolean;
  isError?: boolean;
}

export function StatCard({
  label, count, icon: Icon, href, accentColor, bgColor, textColor, isLoading, isError,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex-1">
        <div className="skeleton h-8 w-8 rounded-lg mb-4" />
        <div className="skeleton h-9 w-16 rounded mb-2" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`group bg-white rounded-xl border border-gray-200 p-5 flex-1 flex flex-col gap-3 border-l-4 ${accentColor} hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
        <div className={`w-2.5 h-2.5 rounded-full mt-1 ${textColor.replace('text-', 'bg-')}`} />
      </div>
      <div>
        <p className="text-4xl font-bold text-gray-900 leading-none">
          {isError ? '–' : (count ?? '–')}
        </p>
        <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
      </div>
    </Link>
  );
}
