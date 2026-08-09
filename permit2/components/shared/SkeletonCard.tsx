export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="skeleton h-8 w-8 rounded-lg" />
        <div className="skeleton h-3 w-3 rounded-full" />
      </div>
      <div className="skeleton h-9 w-16 rounded mb-2" />
      <div className="skeleton h-4 w-24 rounded" />
    </div>
  );
}
