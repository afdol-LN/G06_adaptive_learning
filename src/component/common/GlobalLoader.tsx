import React from 'react';
import './GlobalLoader.css';

interface GlobalLoaderProps {
  isLoading: boolean;
  message?: string;
}

export default function GlobalLoader({
  isLoading,
  message = "loading...",
}: GlobalLoaderProps) {
  if (!isLoading) return null;

  return (
    <div className="global-loader-backdrop" role="status" aria-live="polite">
      <div className="global-loader-card">
        <div className="global-loader-text">{message}</div>
        <div className="wave-loader-container">
          <div className="wave-bar" style={{ animationDelay: '0s' }} />
          <div className="wave-bar" style={{ animationDelay: '0.15s' }} />
          <div className="wave-bar" style={{ animationDelay: '0.3s' }} />
          <div className="wave-bar" style={{ animationDelay: '0.45s' }} />
          <div className="wave-bar" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>
    </div>
  );
}
