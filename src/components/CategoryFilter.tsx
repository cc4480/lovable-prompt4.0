import { Star } from 'lucide-react';
import { ALL_CATEGORIES, type Category } from '../data/types';
import { CATEGORY_ICONS } from '../data/categories';
import { platforms } from '../data/platforms';

interface CategoryFilterProps {
  selected: Category | 'All';
  onChange: (category: Category | 'All') => void;
  showFavorites: boolean;
  onToggleFavorites: () => void;
  favoritesCount: number;
}

export function CategoryFilter({
  selected,
  onChange,
  showFavorites,
  onToggleFavorites,
  favoritesCount,
}: CategoryFilterProps) {
  const counts = ALL_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = platforms.filter((p) => p.category === cat).length;
    return acc;
  }, {});

  const allCount = platforms.length;

  return (
    <div className="w-full overflow-x-auto pb-2 -mx-4 px-4">
      <div className="flex gap-2 w-max mx-auto">
        {/* All */}
        <button
          onClick={() => {
            if (showFavorites) onToggleFavorites();
            onChange('All');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 ${
            selected === 'All' && !showFavorites
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
          }`}
          aria-pressed={selected === 'All' && !showFavorites}
        >
          <span>{CATEGORY_ICONS['All']}</span>
          All
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              selected === 'All' && !showFavorites ? 'bg-white/20' : 'bg-white/10'
            }`}
          >
            {allCount}
          </span>
        </button>

        {/* Favorites */}
        <button
          onClick={onToggleFavorites}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 ${
            showFavorites
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shadow-lg shadow-yellow-500/10'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
          }`}
          aria-pressed={showFavorites}
        >
          <Star size={13} className={showFavorites ? 'fill-yellow-400 text-yellow-400' : ''} />
          Favorites
          {favoritesCount > 0 && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                showFavorites ? 'bg-yellow-500/20' : 'bg-white/10'
              }`}
            >
              {favoritesCount}
            </span>
          )}
        </button>

        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              if (showFavorites) onToggleFavorites();
              onChange(cat);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 ${
              selected === cat && !showFavorites
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
            aria-pressed={selected === cat && !showFavorites}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            {cat}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                selected === cat && !showFavorites ? 'bg-white/20' : 'bg-white/10'
              }`}
            >
              {counts[cat]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
