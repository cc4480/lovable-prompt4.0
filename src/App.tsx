import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Category, Platform } from './data/types';
import { platforms } from './data/platforms';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ToastProvider } from './components/Toast';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { PlatformCard } from './components/PlatformCard';
import { PromptGenerator } from './components/PromptGenerator';
import { EmptyState } from './components/EmptyState';

function AppContent() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useLocalStorage<string[]>('nc_favorites', []);

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) =>
        prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
      );
    },
    [setFavorites],
  );

  const filtered = useMemo(() => {
    let result = platforms;

    if (showFavorites) {
      result = result.filter((p) => favorites.includes(p.id));
    } else if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q),
      );
    }

    return result;
  }, [query, selectedCategory, showFavorites, favorites]);

  // Group by category only in the default "All" view with no search query
  const grouped = useMemo(() => {
    if (showFavorites || selectedCategory !== 'All' || query.trim()) return null;
    const map = new Map<string, Platform[]>();
    for (const p of filtered) {
      const group = map.get(p.category) ?? [];
      group.push(p);
      map.set(p.category, group);
    }
    return map;
  }, [filtered, selectedCategory, query, showFavorites]);

  const handleCategoryChange = (cat: Category | 'All') => {
    setSelectedCategory(cat);
    setQuery('');
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside inputs/textareas
      const tag = (e.target as HTMLElement).tagName;
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      // ⌘K / Ctrl+K: focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        (document.getElementById('platform-search') as HTMLInputElement | null)?.focus();
        return;
      }

      // Escape: clear search (when no modal is open)
      if (e.key === 'Escape' && !activePlatform && query) {
        setQuery('');
        return;
      }

      // / : focus search (when not already in an input)
      if (e.key === '/' && !isEditable && !activePlatform) {
        e.preventDefault();
        (document.getElementById('platform-search') as HTMLInputElement | null)?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activePlatform, query]);

  const isEmpty = filtered.length === 0;
  const isFiltering = query || selectedCategory !== 'All' || showFavorites;

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      {/* Skip to main content */}
      <a href="#main-content" className="sr-only">
        Skip to content
      </a>

      {/* Decorative background blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-pink-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />

        {/* Controls */}
        <div className="space-y-4 mb-10">
          <SearchBar value={query} onChange={setQuery} />
          <CategoryFilter
            selected={selectedCategory}
            onChange={handleCategoryChange}
            showFavorites={showFavorites}
            onToggleFavorites={() => setShowFavorites((v) => !v)}
            favoritesCount={favorites.length}
          />
        </div>

        {/* Results count */}
        <div className="mb-6" id="main-content">
          <p className="text-slate-500 text-sm">
            {isFiltering ? (
              <>
                <span className="text-white font-medium">{filtered.length}</span>{' '}
                platform{filtered.length !== 1 ? 's' : ''}{' '}
                {showFavorites ? 'favorited' : 'found'}
                {query && (
                  <>
                    {' '}for <span className="text-purple-400">"{query}"</span>
                  </>
                )}
              </>
            ) : (
              <>
                <span className="text-white font-medium">{platforms.length}</span> no-code
                platforms across{' '}
                <span className="text-white font-medium">11</span> categories
              </>
            )}
          </p>
        </div>

        {/* Empty state */}
        {isEmpty && (
          <EmptyState
            query={query}
            category={showFavorites ? 'Favorites' : selectedCategory}
            onClear={() => {
              setQuery('');
              setSelectedCategory('All');
              setShowFavorites(false);
            }}
          />
        )}

        {/* All-categories grouped view */}
        {grouped && grouped.size > 0 && (
          <div className="space-y-12 pb-20">
            {Array.from(grouped.entries()).map(([category, catPlatforms]) => (
              <section key={category} aria-labelledby={`cat-${category.replace(/\s+/g, '-')}`}>
                <div className="flex items-center gap-3 mb-5">
                  <h2
                    id={`cat-${category.replace(/\s+/g, '-')}`}
                    className="text-white font-semibold text-base"
                  >
                    {category}
                  </h2>
                  <span className="text-xs text-slate-600 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    {catPlatforms.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {catPlatforms.map((platform) => (
                    <PlatformCard
                      key={platform.id}
                      platform={platform}
                      isFavorited={favorites.includes(platform.id)}
                      onGenerate={setActivePlatform}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Filtered / favorites flat grid */}
        {!grouped && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {filtered.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                isFavorited={favorites.includes(platform.id)}
                onGenerate={setActivePlatform}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Prompt Generator Modal */}
      {activePlatform && (
        <PromptGenerator
          platform={activePlatform}
          onClose={() => setActivePlatform(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
