import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type ToastKind = 'normal' | 'success' | 'error' | 'warning';

export interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  body?: string;
  total: number;
  left: number;
  endsAt: number;
  paused: boolean;
  closing: boolean;
}

interface ToastContextValue {
  toasts: ToastItem[];
  push: (kind: ToastKind, title: string, body?: string, durationMs?: number) => number;
  dismiss: (id: number) => void;
  pause: (id: number) => void;
  resume: (id: number) => void;
}

const DEFAULT_DURATION_MS = 5000;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seqRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, closing: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 280);
  }, []);

  const pause = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, paused: true, left: t.endsAt - performance.now() } : t)),
    );
  }, []);

  const resume = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, paused: false, endsAt: performance.now() + Math.max(400, t.left) } : t,
      ),
    );
  }, []);

  const push = useCallback(
    (kind: ToastKind, title: string, body?: string, durationMs: number = DEFAULT_DURATION_MS) => {
      const id = ++seqRef.current;
      const item: ToastItem = {
        id,
        kind,
        title,
        body,
        total: durationMs,
        left: durationMs,
        endsAt: performance.now() + durationMs,
        paused: false,
        closing: false,
      };
      setToasts((prev) => [...prev, item].slice(-5));
      return id;
    },
    [],
  );

  useEffect(() => {
    const tick = setInterval(() => {
      const now = performance.now();
      setToasts((prev) =>
        prev.map((t) => {
          if (t.closing || t.paused) return t;
          return { ...t, left: Math.max(0, t.endsAt - now) };
        }),
      );
    }, 80);
    return () => clearInterval(tick);
  }, []);

  // Separate from the tick above: setToasts() updater functions run on
  // React's own schedule, not synchronously when called, so a toast's
  // left<=0 transition can only be observed reliably once it has actually
  // landed in state — reacting to `toasts` here (instead of collecting
  // "expired" ids inside the tick's updater and reading them right after)
  // is what makes that reliable.
  useEffect(() => {
    toasts
      .filter((t) => !t.closing && !t.paused && t.left <= 0)
      .forEach((t) => dismiss(t.id));
  }, [toasts, dismiss]);

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss, pause, resume }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within a ToastProvider');
  return ctx;
}

export function useToast() {
  const { push, dismiss } = useToastContext();
  return useMemo(
    () => ({
      normal: (title: string, body?: string, durationMs?: number) => push('normal', title, body, durationMs),
      success: (title: string, body?: string, durationMs?: number) => push('success', title, body, durationMs),
      error: (title: string, body?: string, durationMs?: number) => push('error', title, body, durationMs),
      warning: (title: string, body?: string, durationMs?: number) => push('warning', title, body, durationMs),
      dismiss,
    }),
    [push, dismiss],
  );
}
