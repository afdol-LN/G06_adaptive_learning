import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { usePreferences } from "../../context/PreferencesContext";

interface LoginPanelProps {
  onSubmit: (credentials: { username: string; password: string }) => void;
  isLoading?: boolean;
  onSwitchTab: () => void;
}

export default function LoginPanel({ onSubmit, isLoading, onSwitchTab }:LoginPanelProps) {
  const { t } = usePreferences();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await onSubmit({username, password});
  }

  return (
    <div className="panel active">
      <h2 className="panel-title">{t("auth.login.title")}</h2>
      <p className="panel-sub">{t("auth.login.sub")}</p>

      <div className="field">
        <label>{t("auth.username")}</label>
        <input
          type="text"
          placeholder={t("auth.username.placeholder")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="field">
        <label>{t("auth.password")}</label>
        <div className="pw-wrap">
          <input
            type={showLoginPw ? "text" : "password"}
            placeholder={t("auth.password.placeholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShowLoginPw(!showLoginPw)}
            tabIndex={-1}
            aria-label={showLoginPw ? t("auth.password.hide") : t("auth.password.show")}
            title={showLoginPw ? t("auth.password.hide") : t("auth.password.show")}
          >
            {showLoginPw ? <FaEyeSlash aria-hidden /> : <FaEye aria-hidden />}
          </button>
        </div>
      </div>

      {/* <label className="remember">
        <input type="checkbox" id="rememberMe" />
        <div className="check-box">
          <svg className="tick" viewBox="0 0 10 10">
            <polyline points="1.5,5 4,7.5 8.5,2.5" />
          </svg>
        </div>
        <span>Remember me</span>
      </label> */}

      <button
        className={`btn-primary ${isLoading ? "loading" : ""}`}
        onClick={handleSubmit}
        onKeyDown={(e) => e.key === 'Enter'}
      >
        <span>{t("auth.login.submit")}</span>
      </button>

      <div className="divider">
        <div className="divider-line"></div>
        <div className="divider-text">{t("auth.or")}</div>
        <div className="divider-line"></div>
      </div>

      <div
        style={{ textAlign: "center", fontSize: "13px", color: "var(--muted)" }}
      >
        {t("auth.login.noAccount")}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSwitchTab();
          }}
          style={{
            color: "var(--gold)",
            textDecoration: "none",
            marginLeft: "4px",
          }}
        >
          {t("auth.login.toRegister")}
        </a>
      </div>
    </div>
  );
}
