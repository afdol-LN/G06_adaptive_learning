import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { AiDraft } from "../../../../models/aiDraftModel";
import { usePreferences } from "../../../../context/PreferencesContext";

interface ApproveModalProps {
  draft: AiDraft | null;
  isBusy: boolean;
  onConfirm: (status: "active" | "inactive") => void;
  onClose: () => void;
}

/**
 * ถามสถานะตอนอนุมัติ แทนที่จะ hardcode ไว้ฝั่งใดฝั่งหนึ่ง
 * เพราะบางรายการอยากเปิดใช้ทันที บางรายการอยากพักไว้ตรวจซ้ำก่อน
 */
export default function ApproveModal({
  draft,
  isBusy,
  onConfirm,
  onClose,
}: ApproveModalProps) {
  const { t } = usePreferences();
  const [status, setStatus] = useState<"active" | "inactive">("inactive");

  useEffect(() => {
    if (draft) setStatus("inactive");
  }, [draft]);

  if (!draft) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(status);
  };

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div
        className="ad-modal"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ad-modal-header">
          <span className="ad-modal-title">
            <FaCheck /> {t("admin.ai.approve.title", { id: draft.id })}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ad-modal-body">
            <div className="ad-field">
              <label className="ad-label">{t("admin.ai.approve.saveAs")}</label>
              <select
                className="ad-select"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "active" | "inactive")
                }
              >
                <option value="inactive">{t("admin.ai.approve.optInactive")}</option>
                <option value="active">{t("admin.ai.approve.optActive")}</option>
              </select>
              <span className="ad-hint-text">{t("admin.ai.approve.hint")}</span>
            </div>
          </div>

          <div className="ad-modal-footer">
            <button
              type="button"
              className="ad-btn-cancel"
              onClick={onClose}
              disabled={isBusy}
            >
              {t("admin.common.cancel")}
            </button>
            <button type="submit" className="ad-btn-primary" disabled={isBusy}>
              {isBusy ? t("admin.common.saving") : t("admin.ai.approve.confirm")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
