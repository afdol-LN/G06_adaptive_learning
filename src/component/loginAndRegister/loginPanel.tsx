import React, { useState } from "react";

interface LoginPanelProps {
  onSubmit: (credentials: { username: string; password: string }) => void;
  isLoading?: boolean;
  onSwitchTab: () => void;
}

export default function LoginPanel({ onSubmit, isLoading, onSwitchTab }:LoginPanelProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    console.log("user data :", username,password)
    await onSubmit({username, password});
  }

  return (
    <div className="panel active">
      <h2 className="panel-title">Welcome back</h2>
      <p className="panel-sub">Sign in to continue your learning journey</p>

      <div className="field">
        <label>Username</label>
        <input
          type="text"
          placeholder="Enter username here"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Password</label>
        <div className="pw-wrap">
          <input
            type={showLoginPw ? "text" : "password"}
            placeholder="Enter password here"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="pw-toggle"
            onClick={() => setShowLoginPw(!showLoginPw)}
            tabIndex={-1}
          >
            {showLoginPw ? "🙈" : "👁"}
          </button>
        </div>
      </div>

      <label className="remember">
        <input type="checkbox" id="rememberMe" />
        <div className="check-box">
          <svg className="tick" viewBox="0 0 10 10">
            <polyline points="1.5,5 4,7.5 8.5,2.5" />
          </svg>
        </div>
        <span>Remember me</span>
      </label>

      <button
        className={`btn-primary ${isLoading ? "loading" : ""}`}
        onClick={handleSubmit}
      >
        <span>Sign In</span>
      </button>

      <div className="divider">
        <div className="divider-line"></div>
        <div className="divider-text">or</div>
        <div className="divider-line"></div>
      </div>

      <div
        style={{ textAlign: "center", fontSize: "13px", color: "var(--muted)" }}
      >
        Don't have an account?
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
          Create one →
        </a>
      </div>
    </div>
  );
}
