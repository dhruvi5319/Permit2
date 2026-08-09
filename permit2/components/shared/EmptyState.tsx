import { FileX, SearchX } from 'lucide-react';

interface EmptyStateProps {
  type?: 'no-permits' | 'no-results';
  onClearFilters?: () => void;
  onCreatePermit?: () => void;
}

export function EmptyState({ type = 'no-results', onClearFilters, onCreatePermit }: EmptyStateProps) {
  const isNoPermits = type === 'no-permits';
  const Icon = isNoPermits ? FileX : SearchX;
  const title = isNoPermits ? 'No permits yet' : 'No permits match your filters';
  const description = isNoPermits
    ? 'Get started by creating your first permit request.'
    : 'Try adjusting your search or filters to find what you\'re looking for.';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
      <div className="flex gap-3">
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Clear Filters
          </button>
        )}
        {onCreatePermit && (
          <a
            href="/permits/new"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create New Permit
          </a>
        )}
      </div>
    </div>
  );
}
