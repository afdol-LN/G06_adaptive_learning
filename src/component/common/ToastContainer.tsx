import React from 'react';
import { useToastContext, ToastKind } from '../../context/ToastContext';
import '../decorate/Toast.css';

const KIND_STYLE: Record<ToastKind, { icon: string; accent: string; edge: string; iconBg: string; bg: string }> = {
  normal: { icon: 'ℹ', accent: '#3f6a91', edge: 'rgba(63,106,145,0.28)', iconBg: 'rgba(63,106,145,0.14)', bg: 'rgba(255,255,255,0.62)' },
  success: { icon: '✓', accent: '#16a34a', edge: 'rgba(22,163,74,0.32)', iconBg: 'rgba(22,163,74,0.15)', bg: 'rgba(240,253,244,0.6)' },
  error: { icon: '✕', accent: '#dc2626', edge: 'rgba(220,38,38,0.32)', iconBg: 'rgba(220,38,38,0.14)', bg: 'rgba(254,242,242,0.6)' },
  warning: { icon: '!', accent: '#d97706', edge: 'rgba(217,119,6,0.34)', iconBg: 'rgba(217,119,6,0.16)', bg: 'rgba(255,251,235,0.62)' },
};

export default function ToastContainer() {
  const { toasts, dismiss, pause, resume } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <div className="toastsys-stack">
      {toasts.map((t) => {
        const style = KIND_STYLE[t.kind];
        const pct = Math.max(0, Math.min(100, (t.left / t.total) * 100));
        return (
          <div
            key={t.id}
            className={`toastsys-item${t.closing ? ' closing' : ''}`}
            style={{ background: style.bg, borderColor: style.edge }}
            onMouseEnter={() => pause(t.id)}
            onMouseLeave={() => resume(t.id)}
          >
            <div className="toastsys-icon" style={{ color: style.accent, background: style.iconBg }}>
              {style.icon}
            </div>
            <div className="toastsys-text">
              <div className="toastsys-title">{t.title}</div>
              {t.body && <div className="toastsys-body">{t.body}</div>}
            </div>
            <button
              type="button"
              className="toastsys-close"
              aria-label="ปิด"
              onClick={() => dismiss(t.id)}
            >
              ✕
            </button>
            <div className="toastsys-track">
              <div className="toastsys-bar" style={{ width: `${pct}%`, background: style.accent }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
