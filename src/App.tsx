import { useState, useMemo } from 'react';
import type { Category, Platform } from './data/types';
import { platforms } from './data/platforms';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { PlatformCard } from './components/PlatformCard';
import { PromptGenerator } from './components/PromptGenerator';
import { EmptyState } from './components/EmptyState';

function App() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);

  const filtered = useMemo(() => {
    let result = platforms;

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [query, selectedCategory]);

  // Group by category only when browsing all without a search query
  const grouped = useMemo(() => {
    if (selectedCategory !== 'All' || query.trim()) return null;
    const map = new Map<string, Platform[]>();
    for (const p of filtered) {
      const group = map.get(p.category) ?? [];
      group.push(p);
      map.set(p.category, group);
    }
    return map;
  }, [filtered, selectedCategory, query]);

  const handleCategoryChange = (cat: Category | 'All') => {
    setSelectedCategory(cat);
    setQuery('');
  };

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-pink-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />

        {/* Controls */}
        <div className="space-y-4 mb-10">
          <SearchBar value={query} onChange={setQuery} />
          <CategoryFilter selected={selectedCategory} onChange={handleCategoryChange} />
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-slate-500 text-sm">
            {query || selectedCategory !== 'All' ? (
              <>
                <span className="text-white font-medium">{filtered.length}</span>{' '}
                platform{filtered.length !== 1 ? 's' : ''} found
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
        {filtered.length === 0 && (
          <EmptyState
            query={query}
            onClear={() => {
              setQuery('');
              setSelectedCategory('All');
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
                      onGenerate={setActivePlatform}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Filtered flat grid */}
        {!grouped && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
            {filtered.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                onGenerate={setActivePlatform}
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

export default App;
