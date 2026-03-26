import { Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="text-center py-14 px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-6">
        <Zap size={12} />
        70+ No-Code Platforms
      </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
        No-Code{' '}
        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Prompt
        </span>{' '}
        Generator
      </h1>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto">
        Pick any no-code platform, fill in your project details, and get a production-ready
        prompt tailored to that platform's strengths — ready to paste and build.
      </p>
    </header>
  );
}
