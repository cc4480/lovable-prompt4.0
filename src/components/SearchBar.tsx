import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative max-w-xl mx-auto">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
      />
      <input
        id="platform-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search platforms, categories, or tags…"
        className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
        aria-label="Search platforms (press ⌘K to focus)"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
