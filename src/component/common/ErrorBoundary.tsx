import { Component, ErrorInfo, ReactNode } from "react";
import { FaArrowRotateRight, FaTriangleExclamation } from "react-icons/fa6";
import { usePreferences } from "../../context/PreferencesContext";
import "../decorate/ErrorBoundary.css";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** a change here clears the error, e.g. the route path — leaving the page that broke recovers */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches a render error in its subtree and shows a fallback in its place, so one broken
 * panel doesn't unmount the whole app (a missing i18n key once blanked the entire admin page).
 * Wrap independent regions — each admin tab, the routed page — not the whole tree at once.
 * Must sit inside PreferencesProvider: the fallback is translated.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // stack only — never the props/state, which can hold student data
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  componentDidUpdate(prev: ErrorBoundaryProps) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) return <ErrorFallback onRetry={this.reset} />;
    return this.props.children;
  }
}

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { t } = usePreferences();
  return (
    <div className="eb-fallback" role="alert">
      <FaTriangleExclamation className="eb-icon" aria-hidden />
      <div className="eb-title">{t("error.title")}</div>
      <p className="eb-body">{t("error.body")}</p>
      <div className="eb-actions">
        <button type="button" className="eb-btn eb-btn--primary" onClick={onRetry}>
          {t("error.retry")}
        </button>
        <button type="button" className="eb-btn" onClick={() => window.location.reload()}>
          <FaArrowRotateRight aria-hidden /> {t("error.reload")}
        </button>
      </div>
    </div>
  );
}
