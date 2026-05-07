import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  toast: (message: string, type?: ToastItem['type']) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: <Check size={14} className="text-green-400 flex-shrink-0" />,
  error: <AlertCircle size={14} className="text-red-400 flex-shrink-0" />,
  info: <Info size={14} className="text-blue-400 flex-shrink-0" />,
};

const COLORS = {
  success: 'border-green-500/30 bg-[#16171d]',
  error: 'border-red-500/30 bg-[#16171d]',
  info: 'border-blue-500/30 bg-[#16171d]',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    (message: string, type: ToastItem['type'] = 'success') => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
      timers.current.set(id, setTimeout(() => dismiss(id), 3000));
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-item flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm shadow-lg pointer-events-auto ${COLORS[t.type]}`}
          >
            {ICONS[t.type]}
            <span className="text-slate-200">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-1 text-slate-500 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
