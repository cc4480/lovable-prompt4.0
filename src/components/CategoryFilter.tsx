import { ALL_CATEGORIES, type Category } from '../data/types';
import { platforms } from '../data/platforms';

interface CategoryFilterProps {
  selected: Category | 'All';
  onChange: (category: Category | 'All') => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'All': '✦',
  'AI App Generators': '🤖',
  'Full-Stack App Builders': '🏗️',
  'Website Builders': '🌐',
  'Mobile App Builders': '📱',
  'Database & Internal Tools': '🗄️',
  'Workflow Automation': '⚡',
  'Enterprise Platforms': '🏢',
  'Chatbot Builders': '💬',
  'Landing Page Builders': '🚀',
  'E-Commerce': '🛒',
  'Form Builders': '📋',
};

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
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
          onClick={() => onChange('All')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 ${
            selected === 'All'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
          }`}
          aria-pressed={selected === 'All'}
        >
          <span>{CATEGORY_ICONS['All']}</span>
          All
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              selected === 'All' ? 'bg-white/20' : 'bg-white/10'
            }`}
          >
            {allCount}
          </span>
        </button>

        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 ${
              selected === cat
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
            aria-pressed={selected === cat}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            {cat}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                selected === cat ? 'bg-white/20' : 'bg-white/10'
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
