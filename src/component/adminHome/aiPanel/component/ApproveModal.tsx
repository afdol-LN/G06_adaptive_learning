import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { AiDraft } from "../../../../models/aiDraftModel";

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
            <FaCheck /> อนุมัติร่าง #{draft.id}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ad-modal-body">
            <div className="ad-field">
              <label className="ad-label">บันทึกลงระบบด้วยสถานะ</label>
              <select
                className="ad-select"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "active" | "inactive")
                }
              >
                <option value="inactive">
                  inactive — บันทึกไว้ก่อน ยังไม่ส่งถึงนักศึกษา
                </option>
                <option value="active">active — เปิดใช้งานทันที</option>
              </select>
              <span className="ad-hint-text">
                เปลี่ยนสถานะทีหลังได้ที่แท็บจัดการของแต่ละประเภท
              </span>
            </div>
          </div>

          <div className="ad-modal-footer">
            <button
              type="button"
              className="ad-btn-cancel"
              onClick={onClose}
              disabled={isBusy}
            >
              ยกเลิก
            </button>
            <button type="submit" className="ad-btn-primary" disabled={isBusy}>
              {isBusy ? "กำลังบันทึก..." : "ยืนยันอนุมัติ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
