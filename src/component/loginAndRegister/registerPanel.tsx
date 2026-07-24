import React, { useState } from "react";
import {RegisterCredentials} from "../../models/userModel";


interface RegisterPanelProps {
  onSubmit: (credentials: RegisterCredentials) => void | Promise<void>;
  isLoading?: boolean;
  onSwitchTab: (tab?: string) => void;
}

export default function RegisterPanel({ onSubmit, isLoading, onSwitchTab }: RegisterPanelProps) {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState(4);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState({ text: "", type: "" });
  const [confirmMsg, setConfirmMsg] = useState({ text: "", type: "" });

  const checkUsername = (val: string) => {
    setUsername(val);
    const takenNames = ["admin", "psu_user", "hello_myname", "test"];
    const cleanVal = val.trim().toLowerCase();

    if (!cleanVal) return setUsernameMsg({ text: "", type: "" });
    if (cleanVal.length < 4) return setUsernameMsg({ text: "At least 4 characters", type: "err" });
    if (takenNames.includes(cleanVal)) return setUsernameMsg({ text: "✗ Username already taken", type: "err" });

    setUsernameMsg({ text: "✓ Username available", type: "ok" });
  };

  const checkMatch = (val: string) => {
    setConfirm(val);
    if (!val) return setConfirmMsg({ text: "", type: "" });
    if (password === val) return setConfirmMsg({ text: "✓ Passwords match", type: "ok" });
    setConfirmMsg({ text: "Passwords do not match", type: "err" });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!fname || !lname || !dob || !username || !password || !confirm) {
      setConfirmMsg({ text: "Please fill in all fields", type: "err" });
      return;
    }
    if (password !== confirm) {
      setConfirmMsg({ text: "Passwords do not match", type: "err" });
      return;
    }
    if (password.length < 8) {
      setConfirmMsg({ text: "Password must be at least 8 characters", type: "err" });
      return;
    }

    const fullName = `${fname} ${lname}`.trim();
    const credentials: RegisterCredentials = {
      fullName,
      birthDate: dob,
      genderId: gender,
      username,
      password,
    };

    await onSubmit(credentials);
  };

  return (
    <div className="panel active">
      <h2 className="panel-title">Create account</h2>
      <p className="panel-sub"></p>

      <div className="field-row">
        <div>
          <label>First Name</label>
          <input
            type="text"
            placeholder="สมชาย"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
          />
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            placeholder="ใจดี"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
          />
        </div>
      </div>

      <div className="field-row">
        <div>
          <label>Date of Birth</label>
          <input
            type="date"
            max="2010-12-31"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>
        <div>
          <label>Gender</label>
          <div className="select-wrap">
            <select value={gender} onChange={(e) => setGender(Number(e.target.value))}>
              <option value={4} disabled>
                เลือก...
              </option>
              <option value={1}>Male</option>
              <option value={2}>Female</option>
              <option value={3}>LGBTQ+</option>
              <option value={4}>ไม่ระบุ</option>
            </select>
          </div>
        </div>
      </div>

      <div className="field">
        <label>Username</label>
        <input
          type="text"
          placeholder="your_username"
          value={username}
          onChange={(e) => checkUsername(e.target.value)}
          className={
            usernameMsg.type === "err"
              ? "error"
              : usernameMsg.type === "ok"
              ? "ok"
              : ""
          }
        />
        <div className={`field-msg ${usernameMsg.type}`}>{usernameMsg.text}</div>
      </div>

      <div className="field">
        <label>Password</label>
        <div className="pw-wrap">
          <input
            type={showRegPw ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (confirm) {
                if (e.target.value === confirm) setConfirmMsg({ text: "✓ Passwords match", type: "ok" });
                else setConfirmMsg({ text: "Passwords do not match", type: "err" });
              }
            }}
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShowRegPw(!showRegPw)}
            tabIndex={-1}
          >
            {showRegPw ? "🙈" : "👁"}
          </button>
        </div>
      </div>

      <div className="field">
        <label>Confirm Password</label>
        <div className="pw-wrap">
          <input
            type={showRegConfirm ? "text" : "password"}
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => checkMatch(e.target.value)}
            className={
              confirmMsg.type === "err"
                ? "error"
                : confirmMsg.type === "ok"
                ? "ok"
                : ""
            }
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShowRegConfirm(!showRegConfirm)}
            tabIndex={-1}
          >
            {showRegConfirm ? "🙈" : "👁"}
          </button>
        </div>
        <div className={`field-msg ${confirmMsg.type}`}>{confirmMsg.text}</div>
      </div>

      <button
        type="button"
        className={`btn-primary ${isLoading ? "loading" : ""}`}
        onClick={handleSubmit}
      >
        <span>Create Account</span>
      </button>

      <div
        style={{
          textAlign: "center",
          fontSize: "13px",
          color: "var(--muted)",
          marginTop: "16px",
        }}
      >
        Already have an account?
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            onSwitchTab("login");
          }}
          style={{
            color: "var(--gold)",
            textDecoration: "none",
            marginLeft: "4px",
          }}
        >
          Sign in →
        </a>
      </div>
    </div>
  );
}
