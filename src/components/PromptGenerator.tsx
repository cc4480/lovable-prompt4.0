import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Wand2, ExternalLink, RefreshCw, ChevronDown, FileText, Sparkles, Share2 } from 'lucide-react';
import type { Platform, GeneratedPrompt } from '../data/types';
import { CATEGORY_ICONS } from '../data/categories';
import { getTemplateForPlatform } from '../data/promptTemplates';
import { CopyButton } from './CopyButton';
import { useToast } from './Toast';

interface PromptGeneratorProps {
  platform: Platform;
  onClose: () => void;
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const HISTORY_KEY = 'nc_prompt_history';
const MAX_HISTORY = 50;

function loadStoredHistory(): GeneratedPrompt[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as Array<
      Omit<GeneratedPrompt, 'createdAt'> & { createdAt: string }
    >;
    return raw.map((h) => ({ ...h, createdAt: new Date(h.createdAt) }));
  } catch {
    return [];
  }
}

function saveStoredHistory(history: GeneratedPrompt[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {}
}

export function PromptGenerator({ platform, onClose }: PromptGeneratorProps) {
  const template = getTemplateForPlatform(platform);
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [generated, setGenerated] = useState<GeneratedPrompt | null>(null);
  const [globalHistory, setGlobalHistory] = useState<GeneratedPrompt[]>(() => loadStoredHistory());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [mobileTab, setMobileTab] = useState<'form' | 'output'>('form');
  const canShare = typeof navigator.share === 'function';

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // History entries for this platform only (last 5)
  const platformHistory = globalHistory.filter((h) => h.platformId === platform.id).slice(0, 5);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusable = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

    const updated = [newPrompt, ...globalHistory.filter((h) => h.id !== newPrompt.id)];
    setGlobalHistory(updated);
    saveStoredHistory(updated);

    setMobileTab('output');
    requestAnimationFrame(() => {
      outputRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleReset = () => {
    setValues({});
    setGenerated(null);
    setErrors({});
    setMobileTab('form');
  };

  const handleShare = async () => {
    if (!generated) return;
    try {
      await navigator.share({
        title: `${platform.name} Prompt`,
        text: generated.content,
      });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast('Failed to share prompt', 'error');
      }
    }
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Generate prompt for ${platform.name}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        ref={modalRef}
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-[#16171d] border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: platform.color, color: platform.textColor }}
              aria-hidden="true"
            >
              {platform.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm leading-tight">{platform.name}</h2>
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
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
            >
              <ExternalLink size={12} />
              Open {platform.name}
            </a>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Mobile tab bar ── */}
        <div className="flex lg:hidden border-b border-white/10 flex-shrink-0">
          <button
            onClick={() => setMobileTab('form')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              mobileTab === 'form'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            aria-selected={mobileTab === 'form'}
          >
            <FileText size={14} />
            Configure
          </button>
          <button
            onClick={() => setMobileTab('output')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              mobileTab === 'output'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            aria-selected={mobileTab === 'output'}
          >
            <Sparkles size={14} />
            Output
            {generated && (
              <span className="w-2 h-2 rounded-full bg-green-400" aria-label="Output ready" />
            )}
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">

          {/* ── Left: Form panel ── */}
          <div
            className={`flex-1 overflow-y-auto p-6 lg:border-r border-white/10 ${
              mobileTab === 'form' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
            }`}
          >
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
              className="space-y-4 flex-1"
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
                        <option value="" className="bg-[#16171d]">Select an option…</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#16171d]">{opt}</option>
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
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-500/20 mt-2"
              >
                <Wand2 size={16} />
                Generate Prompt
              </button>
            </form>
          </div>

          {/* ── Right: Output panel ── */}
          <div
            className={`flex-1 flex flex-col overflow-hidden ${
              mobileTab !== 'output' ? 'hidden lg:flex' : ''
            }`}
            aria-live="polite"
            aria-label="Generated prompt output"
          >
            {generated ? (
              <>
                {/* Output header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
                  <h3 className="text-white font-semibold text-sm">Generated Prompt</h3>
                  <div className="flex items-center gap-2">
                    {platformHistory.length > 1 && (
                      <button
                        onClick={() => setShowHistory((v) => !v)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white border border-white/10 rounded-lg px-2.5 py-1.5 transition-colors"
                        aria-expanded={showHistory}
                      >
                        History ({platformHistory.length})
                        <ChevronDown
                          size={12}
                          className={`transition-transform ${showHistory ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                    {canShare && (
                      <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-white/10 rounded-lg px-2.5 py-1.5 transition-colors"
                        aria-label="Share prompt"
                      >
                        <Share2 size={12} />
                        Share
                      </button>
                    )}
                    <CopyButton text={generated.content} label="Copy Prompt" />
                  </div>
                </div>

                {/* History dropdown */}
                {showHistory && platformHistory.length > 1 && (
                  <div className="px-6 py-3 border-b border-white/10 bg-white/[0.03] flex-shrink-0">
                    <p className="text-xs text-slate-500 mb-2">Previous prompts (this session)</p>
                    <div className="space-y-1">
                      {platformHistory.slice(1).map((h) => (
                        <button
                          key={h.id}
                          onClick={() => {
                            setGenerated(h);
                            setShowHistory(false);
                          }}
                          className="w-full text-left text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors truncate"
                        >
                          {h.content.split('\n')[0].replace(/^#+\s*/, '')}
                          {' — '}
                          <span className="text-slate-600">
                            {h.createdAt.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prompt text */}
                <div ref={outputRef} className="flex-1 overflow-y-auto p-6">
                  <pre className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-white/[0.03] rounded-xl p-4 border border-white/10">
                    {generated.content}
                  </pre>
                </div>
              </>
            ) : (
              /* Empty output state */
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                  <Wand2 size={24} className="text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Your prompt will appear here</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                  Fill in the project details
                  <span className="lg:hidden">
                    {' '}on the{' '}
                    <button
                      onClick={() => setMobileTab('form')}
                      className="text-purple-400 underline underline-offset-2"
                    >
                      Configure tab
                    </button>
                  </span>
                  <span className="hidden lg:inline"> on the left</span>
                  {' '}and click{' '}
                  <strong className="text-slate-300">Generate Prompt</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
