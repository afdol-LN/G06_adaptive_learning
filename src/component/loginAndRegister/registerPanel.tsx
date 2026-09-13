import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import {RegisterCredentials} from "../../models/userModel";
import { usePreferences } from "../../context/PreferencesContext";
import type { TKey } from "../../i18n";


interface RegisterPanelProps {
  onSubmit: (credentials: RegisterCredentials) => void | Promise<void>;
  isLoading?: boolean;
  onSwitchTab: (tab?: string) => void;
}

// เก็บ key ของข้อความแทนตัวข้อความ — สลับภาษาแล้วข้อความใต้ช่องจะเปลี่ยนตามทันที
type FieldMsg = { key: TKey | null; type: "" | "ok" | "err" };
const NO_MSG: FieldMsg = { key: null, type: "" };

export default function RegisterPanel({ onSubmit, isLoading, onSwitchTab }: RegisterPanelProps) {
  const { t } = usePreferences();
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [dob, setDob] = useState("");
  // 0 = ยังไม่ได้เลือก (placeholder). ค่าจริงต้องตรงกับ id ในตาราง gender (1-3)
  const [gender, setGender] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState<FieldMsg>(NO_MSG);
  const [confirmMsg, setConfirmMsg] = useState<FieldMsg>(NO_MSG);

  // const checkUsername = (val: string) => {
  //   setUsername(val);
  //   const takenNames = ["admin", "psu_user", "hello_myname", "test"];
  //   const cleanVal = val.trim().toLowerCase();

  //   if (!cleanVal) return setUsernameMsg({ text: "", type: "" });
  //   if (cleanVal.length < 4) return setUsernameMsg({ text: "At least 4 characters", type: "err" });
  //   if (takenNames.includes(cleanVal)) return setUsernameMsg({ text: "✗ Username already taken", type: "err" });

  //   setUsernameMsg({ text: "✓ Username available", type: "ok" });
  // };

  const checkMatch = (val: string) => {
    setConfirm(val);
    if (!val) return setConfirmMsg(NO_MSG);
    if (password === val) return setConfirmMsg({ key: "auth.password.match", type: "ok" });
    setConfirmMsg({ key: "auth.password.mismatch", type: "err" });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!fname || !lname || !dob || !username || !password || !confirm) {
      setConfirmMsg({ key: "auth.error.fillAll", type: "err" });
      return;
    }
    if (!gender) {
      setConfirmMsg({ key: "auth.error.gender", type: "err" });
      return;
    }
    if (password !== confirm) {
      setConfirmMsg({ key: "auth.password.mismatch", type: "err" });
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
      <h2 className="panel-title">{t("auth.register.title")}</h2>
      <p className="panel-sub"></p>

      <div className="field-row">
        <div>
          <label>{t("auth.firstName")}</label>
          <input
            type="text"
            placeholder={t("auth.firstName.placeholder")}
            value={fname}
            onChange={(e) => setFname(e.target.value)}
          />
        </div>
        <div>
          <label>{t("auth.lastName")}</label>
          <input
            type="text"
            placeholder={t("auth.lastName.placeholder")}
            value={lname}
            onChange={(e) => setLname(e.target.value)}
          />
        </div>
      </div>

      <div className="field-row">
        <div>
          <label>{t("auth.birthDate")}</label>
          <input
            type="date"
            max="2010-12-31"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>
        <div>
          <label>{t("auth.gender")}</label>
          <div className="select-wrap">
            <select value={gender} onChange={(e) => setGender(Number(e.target.value))}>
              <option value={0} disabled>
                {t("auth.gender.placeholder")}
              </option>
              <option value={1}>{t("auth.gender.male")}</option>
              <option value={2}>{t("auth.gender.female")}</option>
              <option value={3}>{t("auth.gender.lgbtq")}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="field">
        <label>{t("auth.username")}</label>
        <input
          type="text"
          placeholder={t("auth.username")}
          value={username}
          onChange={(e) => {
            const val = e.target.value;
            setUsername(val);
            setUsernameMsg(val.trim() ? { key: "auth.username.available", type: "ok" } : NO_MSG);
          }}
          className={
            usernameMsg.type === "err"
              ? "error"
              : usernameMsg.type === "ok"
              ? "ok"
              : ""
          }
        />
        <div className={`field-msg ${usernameMsg.type}`}>{usernameMsg.key && t(usernameMsg.key)}</div>
      </div>

      <div className="field">
        <label>{t("auth.password")}</label>
        <div className="pw-wrap">
          <input
            type={showRegPw ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (confirm) {
                if (e.target.value === confirm) setConfirmMsg({ key: "auth.password.match", type: "ok" });
                else setConfirmMsg({ key: "auth.password.mismatch", type: "err" });
              }
            }}
          />
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShowRegPw(!showRegPw)}
            tabIndex={-1}
            aria-label={showRegPw ? t("auth.password.hide") : t("auth.password.show")}
            title={showRegPw ? t("auth.password.hide") : t("auth.password.show")}
          >
            {showRegPw ? <FaEyeSlash aria-hidden /> : <FaEye aria-hidden />}
          </button>
        </div>
      </div>

      <div className="field">
        <label>{t("auth.confirmPassword")}</label>
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
            aria-label={showRegConfirm ? t("auth.password.hide") : t("auth.password.show")}
            title={showRegConfirm ? t("auth.password.hide") : t("auth.password.show")}
          >
            {showRegConfirm ? <FaEyeSlash aria-hidden /> : <FaEye aria-hidden />}
          </button>
        </div>
        <div className={`field-msg ${confirmMsg.type}`}>{confirmMsg.key && t(confirmMsg.key)}</div>
      </div>

      <button
        type="button"
        className={`btn-primary ${isLoading ? "loading" : ""}`}
        onClick={handleSubmit}
      >
        <span>{t("auth.register.submit")}</span>
      </button>

      <div
        style={{
          textAlign: "center",
          fontSize: "13px",
          color: "var(--muted)",
          marginTop: "16px",
        }}
      >
        {t("auth.register.hasAccount")}
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
          {t("auth.register.toLogin")}
        </a>
      </div>
    </div>
  );
}
