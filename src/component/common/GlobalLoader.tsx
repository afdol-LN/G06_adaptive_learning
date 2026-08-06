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
        <div className="progress-bar-track">
          <div className="progress-bar-fill" />
        </div>
      </div>
    </div>
  );
}
