import { useState, useEffect, useCallback } from 'react';
import { X, Wand2, ExternalLink, RefreshCw, ChevronDown } from 'lucide-react';
import type { Platform, GeneratedPrompt } from '../data/types';
import { getTemplateForPlatform } from '../data/promptTemplates';
import { CopyButton } from './CopyButton';

interface PromptGeneratorProps {
  platform: Platform;
  onClose: () => void;
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

export function PromptGenerator({ platform, onClose }: PromptGeneratorProps) {
  const template = getTemplateForPlatform(platform);
  const [values, setValues] = useState<Record<string, string>>({});
  const [generated, setGenerated] = useState<GeneratedPrompt | null>(null);
  const [history, setHistory] = useState<GeneratedPrompt[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showHistory, setShowHistory] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    template.fields.forEach((field) => {
      if (field.required && !values[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [template.fields, values]);

  const handleGenerate = () => {
    if (!validate()) return;

    const content = template.generate(platform, values);
    const newPrompt: GeneratedPrompt = {
      id: crypto.randomUUID(),
      platformId: platform.id,
      platformName: platform.name,
      content,
      createdAt: new Date(),
    };
    setGenerated(newPrompt);
    setHistory((prev) => [newPrompt, ...prev.slice(0, 4)]);
  };

  const handleReset = () => {
    setValues({});
    setGenerated(null);
    setErrors({});
  };

  const handleFieldChange = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Generate prompt for ${platform.name}`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-[#16171d] border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{ background: platform.color, color: platform.textColor }}
              aria-hidden="true"
            >
              {platform.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">{platform.name}</h2>
              <p className="text-slate-500 text-xs">
                {CATEGORY_ICONS[platform.category]} {platform.category}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
            >
              <ExternalLink size={12} />
              Open {platform.name}
            </a>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body — two-column on large screens */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">
          {/* Left: Form */}
          <div className="flex-1 overflow-y-auto p-6 border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-sm">Project Details</h3>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <RefreshCw size={12} />
                Reset
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerate();
              }}
              className="space-y-4"
              noValidate
            >
              {template.fields.map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="block text-xs font-medium text-slate-300 mb-1.5"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-red-400 ml-1" aria-hidden="true">*</span>
                    )}
                  </label>

                  {field.type === 'select' ? (
                    <div className="relative">
                      <select
                        id={field.id}
                        value={values[field.id] ?? ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-sm text-white appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                          errors[field.id] ? 'border-red-500/50' : 'border-white/10'
                        }`}
                        aria-invalid={!!errors[field.id]}
                        aria-describedby={errors[field.id] ? `${field.id}-error` : undefined}
                      >
                        <option value="" className="bg-[#16171d]">
                          Select an option…
                        </option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#16171d]">
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                      />
                    </div>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      id={field.id}
                      value={values[field.id] ?? ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder-slate-600 resize-y focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                        errors[field.id] ? 'border-red-500/50' : 'border-white/10'
                      }`}
                      aria-invalid={!!errors[field.id]}
                      aria-describedby={errors[field.id] ? `${field.id}-error` : undefined}
                    />
                  ) : (
                    <input
                      id={field.id}
                      type="text"
                      value={values[field.id] ?? ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                        errors[field.id] ? 'border-red-500/50' : 'border-white/10'
                      }`}
                      aria-invalid={!!errors[field.id]}
                      aria-describedby={errors[field.id] ? `${field.id}-error` : undefined}
                    />
                  )}

                  {errors[field.id] && (
                    <p
                      id={`${field.id}-error`}
                      className="text-red-400 text-xs mt-1"
                      role="alert"
                    >
                      {errors[field.id]}
                    </p>
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-500/20 mt-2"
              >
                <Wand2 size={16} />
                Generate Prompt
              </button>
            </form>
          </div>

          {/* Right: Output */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {generated ? (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
                  <h3 className="text-white font-semibold text-sm">Generated Prompt</h3>
                  <div className="flex items-center gap-2">
                    {history.length > 1 && (
                      <button
                        onClick={() => setShowHistory((v) => !v)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white border border-white/10 rounded-lg px-2.5 py-1.5 transition-colors"
                      >
                        History ({history.length})
                        <ChevronDown
                          size={12}
                          className={`transition-transform ${showHistory ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                    <CopyButton text={generated.content} label="Copy Prompt" />
                  </div>
                </div>

                {/* History dropdown */}
                {showHistory && history.length > 1 && (
                  <div className="px-6 py-3 border-b border-white/10 bg-white/3 flex-shrink-0">
                    <p className="text-xs text-slate-500 mb-2">Previous prompts</p>
                    <div className="space-y-1">
                      {history.slice(1).map((h) => (
                        <button
                          key={h.id}
                          onClick={() => {
                            setGenerated(h);
                            setShowHistory(false);
                          }}
                          className="w-full text-left text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors truncate"
                        >
                          {h.content.split('\n')[0].replace(/^#+\s*/, '')} —{' '}
                          <span className="text-slate-600">
                            {h.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-6">
                  <pre className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-white/3 rounded-xl p-4 border border-white/10">
                    {generated.content}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                  <Wand2 size={24} className="text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Your prompt will appear here</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                  Fill in the project details on the left and click{' '}
                  <strong className="text-slate-300">Generate Prompt</strong> to create a
                  platform-optimised prompt.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
