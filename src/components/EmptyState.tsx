import { Search } from 'lucide-react';

interface EmptyStateProps {
  query: string;
  onClear: () => void;
}

export function EmptyState({ query, onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
        <Search size={28} className="text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">No platforms found</h3>
      <p className="text-slate-400 max-w-sm mb-6">
        No results for <span className="text-white font-medium">"{query}"</span>. Try a different
        search term or browse by category.
      </p>
      <button
        onClick={onClear}
        className="px-4 py-2 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white text-sm font-medium transition-colors"
      >
        Clear search
      </button>
    </div>
  );
}
