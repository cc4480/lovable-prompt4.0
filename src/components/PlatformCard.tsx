import { ExternalLink, Wand2 } from 'lucide-react';
import type { Platform } from '../data/types';

interface PlatformCardProps {
  platform: Platform;
  onGenerate: (platform: Platform) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
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

export function PlatformCard({ platform, onGenerate }: PlatformCardProps) {
  const initial = platform.name.charAt(0).toUpperCase();

  return (
    <article className="group relative flex flex-col rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/8 transition-all duration-200 overflow-hidden">
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: platform.color }}
      />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Platform logo placeholder */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: platform.color, color: platform.textColor }}
              aria-hidden="true"
            >
              {initial}
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm leading-tight">{platform.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {CATEGORY_ICONS[platform.category]} {platform.category}
              </p>
            </div>
          </div>
          <a
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0 mt-0.5"
            aria-label={`Visit ${platform.name} website`}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-xs leading-relaxed flex-1">{platform.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {platform.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <div className="px-5 pb-5">
        <button
          onClick={() => onGenerate(platform)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 bg-white/5 border border-white/10 text-slate-300 hover:text-white group-hover:bg-purple-600 group-hover:border-purple-600 group-hover:shadow-lg group-hover:shadow-purple-500/20"
        >
          <Wand2 size={14} />
          Generate Prompt
        </button>
      </div>
    </article>
  );
}
