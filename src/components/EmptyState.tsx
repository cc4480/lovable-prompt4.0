import { Search, SlidersHorizontal } from 'lucide-react';

interface EmptyStateProps {
  query: string;
  category: string;
  onClear: () => void;
}

export function EmptyState({ query, category, onClear }: EmptyStateProps) {
  const hasQuery = query.trim().length > 0;
  const hasCategory = category !== 'All';

  const heading = 'No platforms found';
  let message: string;

  if (hasQuery && hasCategory) {
    message = `No results for "${query}" in ${category}. Try clearing the search or switching categories.`;
  } else if (hasQuery) {
    message = `No results for "${query}". Try a different search term or browse by category.`;
  } else {
    message = `No platforms in this category yet. Check back soon or browse all categories.`;
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        {hasQuery ? (
          <Search size={28} className="text-slate-500" />
        ) : (
          <SlidersHorizontal size={28} className="text-slate-500" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{heading}</h3>
      <p className="text-slate-400 max-w-sm mb-6">{message}</p>
      <button
        onClick={onClear}
        className="px-4 py-2 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white text-sm font-medium transition-colors"
      >
        {hasQuery || hasCategory ? 'Clear filters' : 'Browse all platforms'}
      </button>
    </div>
  );
}
