import React, { useState } from "react";
import "../../../decorate/CreateUserModal.css";
import {
  CreateUserByAdminRequest,
  GenderOption,
  RoleOption,
} from "../../../../models/userModel";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserByAdminRequest) => Promise<void>;
  isLoading: boolean;
  gendersList: GenderOption[];
  rolesList: RoleOption[];
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  gendersList,
  rolesList,
}: CreateUserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [genderId, setGenderId] = useState<number>(4);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("user");

  const [showPassword, setShowPassword] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState({ text: "", type: "" });
  const [formError, setFormError] = useState("");

  if (!isOpen) return null;

  const checkUsername = (val: string) => {
    setUsername(val);
    setFormError("");
    const takenNames = ["admin", "psu_user", "test"];
    const cleanVal = val.trim().toLowerCase();

    if (!cleanVal) {
      setUsernameMsg({ text: "", type: "" });
      return;
    }
    if (cleanVal.length < 4) {
      setUsernameMsg({ text: "At least 4 characters required", type: "err" });
      return;
    }
    if (takenNames.includes(cleanVal)) {
      setUsernameMsg({ text: "Username already taken", type: "err" });
      return;
    }

    setUsernameMsg({ text: "Username available", type: "ok" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!firstName || !lastName || !dob || !username || !password || !role) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (usernameMsg.type === "err") {
      setFormError("Please choose a valid username.");
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const payload: CreateUserByAdminRequest = {
      fullName,
      birthDate: dob,
      genderId: Number(genderId),
      username: username.trim(),
      password,
      role,
    };

    try {
      await onSubmit(payload);
      // Reset fields after successful submit
      setFirstName("");
      setLastName("");
      setDob("");
      setGenderId(gendersList.length > 0 ? gendersList[0].id : 4);
      setUsername("");
      setPassword("");
      setRole("user");
      setUsernameMsg({ text: "", type: "" });
    } catch (err: any) {
      setFormError(err.message || "Failed to create user.");
    }
  };

  return (
    <div className="ad-create-user-overlay" role="dialog" aria-modal="true">
      <div className="ad-create-user-modal">
        <div className="ad-create-user-header">
          <span className="ad-create-user-title">เพิ่มผู้ใช้งานใหม่</span>
          <button
            type="button"
            className="ad-create-user-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ad-create-user-body">
          {formError && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {formError}
            </div>
          )}

          <div className="ad-create-user-row">
            <div className="ad-create-user-field">
              <label className="ad-create-user-label">First Name</label>
              <input
                type="text"
                className="ad-create-user-input"
                placeholder="สมชาย"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="ad-create-user-field">
              <label className="ad-create-user-label">Last Name</label>
              <input
                type="text"
                className="ad-create-user-input"
                placeholder="ใจดี"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="ad-create-user-row">
            <div className="ad-create-user-field">
              <label className="ad-create-user-label">Date of Birth</label>
              <input
                type="date"
                className="ad-create-user-input"
                max="2026-12-31"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>
            <div className="ad-create-user-field">
              <label className="ad-create-user-label">Gender</label>
              <select
                className="ad-create-user-select"
                value={genderId}
                onChange={(e) => setGenderId(Number(e.target.value))}
              >
                {gendersList && gendersList.length > 0 ? (
                  gendersList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.gender}
                    </option>
                  ))
                ) : (
                  ''
                )}
              </select>
            </div>
          </div>

          <div className="ad-create-user-field">
            <label className="ad-create-user-label">Username</label>
            <input
              type="text"
              className={`ad-create-user-input ${
                usernameMsg.type === "err" ? "error" : ""
              }`}
              placeholder="username"
              value={username}
              onChange={(e) => checkUsername(e.target.value)}
              required
            />
            {usernameMsg.text && (
              <div className={`ad-field-message ${usernameMsg.type}`}>
                {usernameMsg.text}
              </div>
            )}
          </div>

          <div className="ad-create-user-field">
            <label className="ad-create-user-label">Password</label>
            <div className="ad-pw-container">
              <input
                type={showPassword ? "text" : "password"}
                className="ad-create-user-input ad-pw-input"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="ad-pw-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="ad-create-user-field">
            <label className="ad-create-user-label">Role</label>
            <select
              className="ad-create-user-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {rolesList && rolesList.length > 0 ? (
                rolesList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))
              ) : (
                <>
                  <option value="user">User / ผู้เรียน</option>
                  <option value="admin">Admin / ผู้ดูแลระบบ</option>
                </>
              )}
            </select>
          </div>

          <div className="ad-create-user-footer">
            <button
              type="button"
              className="ad-btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="ad-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
