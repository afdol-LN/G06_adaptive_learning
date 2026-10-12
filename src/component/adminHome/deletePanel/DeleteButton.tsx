import { useState } from "react";
import { createPortal } from "react-dom";
import { FaTrash, FaTriangleExclamation, FaCircleInfo } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import type { TKey } from "../../../i18n";
import { adminDelete, DeleteBlocked, DeleteKind } from "./adminDelete.service";

interface Props {
  kind: DeleteKind;
  id: number;
  /** shown in the confirm message */
  name: string;
  /** called after a successful delete — parent closes the modal and reloads its list */
  onDeleted: () => void;
}

const KIND_LABEL: Record<DeleteKind, TKey> = {
  exercise: "admin.delete.kind.exercise",
  skill: "admin.delete.kind.skill",
  goal: "admin.delete.kind.goal",
  user: "admin.delete.kind.user",
};

const BLOCKED_MSG: Record<NonNullable<DeleteBlocked["code"]>, TKey> = {
  EXERCISE_ANSWERED: "admin.delete.blocked.exercise",
  SKILL_HAS_LEARNERS: "admin.delete.blocked.skillLearners",
  SKILL_IN_USE: "admin.delete.blocked.skillInUse",
  GOAL_HAS_LEARNERS: "admin.delete.blocked.goal",
  USER_HAS_BRANCHES: "admin.delete.blocked.user",
  CANNOT_DELETE_SELF: "admin.delete.blocked.self",
};

/**
 * ปุ่ม "ลบ" มุมซ้ายล่างของ modal รายละเอียด + dialog ยืนยัน
 * ลบได้เฉพาะของที่ยังไม่มีนักเรียนใช้ — ถ้า backend ปฏิเสธ แสดงเหตุผลใน dialog เดิม (แนะนำให้ปิดใช้งานแทน)
 * dialog ถูก portal ไป <body> และหยุด event ไม่ให้ไหลไปปิด modal รายละเอียดด้านหลัง
 */
export function DeleteButton({ kind, id, name, onDeleted }: Props) {
  const { t } = usePreferences();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState<DeleteBlocked | null>(null);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (busy) return;
    setOpen(false);
    setBlocked(null);
    setError(null);
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    const res = await adminDelete(kind, id);
    setBusy(false);
    if (!res.isError) {
      setOpen(false);
      onDeleted();
      return;
    }
    if (res.data?.code) setBlocked(res.data);
    else setError(res.errorMessage || t("admin.common.error"));
  };

  const kindLabel = t(KIND_LABEL[kind]);
  const inUseItems = [...(blocked?.goals ?? []).map((g) => `🎯 ${g}`), ...(blocked?.skills ?? []).map((s) => `📘 ${s}`)];

  const dialog = open
    ? createPortal(
        <div
          className="ad-overlay ad-del-overlay"
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
        >
          <div
            className={`ad-modal ad-del-dialog${blocked ? " is-blocked" : ""}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ad-del-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ad-modal-header">
              <span className="ad-modal-title" id="ad-del-title">
                {blocked ? <FaCircleInfo aria-hidden /> : <FaTriangleExclamation aria-hidden />}{" "}
                {blocked ? t("admin.delete.blockedTitle") : t("admin.delete.title", { kind: kindLabel })}
              </span>
            </div>
            <div className="ad-modal-body">
              {blocked ? (
                <>
                  <p className="ad-del-msg">
                    {blocked.code ? t(BLOCKED_MSG[blocked.code], { count: blocked.count ?? 0 }) : null}
                  </p>
                  {inUseItems.length > 0 && (
                    <ul className="ad-ws-confirm-list">
                      {inUseItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <>
                  <p className="ad-del-msg">{t("admin.delete.confirm", { kind: kindLabel })}</p>
                  <p className="ad-del-name">{name}</p>
                  <p className="ad-del-warn">{t("admin.delete.warn")}</p>
                  {error && (
                    <div className="ad-hist-error" role="alert">
                      {error}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="ad-modal-footer">
              <button type="button" className="ad-btn-cancel" onClick={close} disabled={busy}>
                {blocked ? t("admin.common.close") : t("admin.common.cancel")}
              </button>
              {!blocked && (
                <button type="button" className="ad-btn-danger" onClick={confirm} disabled={busy} autoFocus>
                  <FaTrash aria-hidden /> {busy ? t("admin.delete.deleting") : t("admin.delete.confirmBtn")}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button type="button" className="ad-btn-del-outline" onClick={() => setOpen(true)}>
        <FaTrash aria-hidden /> {t("admin.delete.button")}
      </button>
      {dialog}
    </>
  );
}
