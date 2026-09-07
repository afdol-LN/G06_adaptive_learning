import React, { useEffect, useState } from "react";
import { FaRotate } from "react-icons/fa6";
import { AiDraft } from "../../../../models/aiDraftModel";

interface RegenerateModalProps {
  draft: AiDraft | null;
  isBusy: boolean;
  onConfirm: (instruction: string) => void;
  onClose: () => void;
}

/**
 * ให้ admin บอก AI ได้ว่าอยากให้เปลี่ยนตรงไหน แล้วเขียนทับร่างเดิม (id เดิม)
 * ปล่อยว่างได้ = ขอใหม่โดยใช้คำสั่งเดิม แค่ห้ามซ้ำของเก่า
 */
export default function RegenerateModal({
  draft,
  isBusy,
  onConfirm,
  onClose,
}: RegenerateModalProps) {
  const [instruction, setInstruction] = useState<string>("");

  useEffect(() => {
    if (draft) setInstruction("");
  }, [draft]);

  if (!draft) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(instruction);
  };

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div
        className="ad-modal"
        style={{ maxWidth: 460 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ad-modal-header">
          <span className="ad-modal-title">
            <FaRotate /> ให้ AI สร้างใหม่ (#{draft.id})
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ad-modal-body">
            <div className="ad-field">
              <label className="ad-label">อยากให้เปลี่ยนอย่างไร</label>
              <textarea
                className="ad-input"
                rows={3}
                placeholder='เช่น "เปลี่ยนเป็นโจทย์เกี่ยวกับ 2D array" หรือ "ทำให้ตัวเลือกสั้นลง"'
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                disabled={isBusy}
              />
              <span className="ad-hint-text">
                เว้นว่างได้ — AI จะร่างใหม่โดยไม่ซ้ำของเดิม
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
              {isBusy ? "กำลังสร้างใหม่..." : "สร้างใหม่"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
