'use client';
import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION: Record<ToastType, number> = {
  success: 5000,
  error: 8000,
  info: 5000,
};

const TOAST_STYLES: Record<ToastType, { border: string; bg: string; text: string }> = {
  success: { border: 'border-l-4 border-green-600', bg: 'bg-green-50', text: 'text-green-800' },
  error:   { border: 'border-l-4 border-red-600',   bg: 'bg-red-50',   text: 'text-red-800'   },
  info:    { border: 'border-l-4 border-blue-600',  bg: 'bg-blue-50',  text: 'text-blue-800'  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { border, bg, text } = TOAST_STYLES[toast.type];
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    timer.current = setTimeout(() => onDismiss(toast.id), TOAST_DURATION[toast.type]);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [toast.id, toast.type, onDismiss]);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={`flex items-start gap-3 min-w-[280px] max-w-[380px] rounded-lg shadow-lg p-4 ${border} ${bg}`}
    >
      <p className={`flex-1 text-sm font-medium ${text}`}>{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className={`flex-shrink-0 ${text} hover:opacity-70 transition-opacity`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => {
      const next = [...prev, { id, type, message }];
      // Keep max 3 toasts — remove oldest if over limit
      return next.length > 3 ? next.slice(next.length - 3) : next;
    });
  }, []);

  const ctx: ToastContextValue = {
    success: (msg) => addToast('success', msg),
    error:   (msg) => addToast('error', msg),
    info:    (msg) => addToast('info', msg),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {mounted &&
        createPortal(
          <div
            aria-live="polite"
            className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
          >
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
