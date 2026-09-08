import React from "react";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { Skill } from "../../../../models/skillModel";
import {
  BLOOM_LEVELS,
  GenerateFormValues,
} from "../ai.controller";
import { AiDraftEntityType } from "../../../../models/aiDraftModel";

interface AiGenerateFormProps {
  form: GenerateFormValues;
  activeSkills: Skill[];
  isGenerating: boolean;
  generateError: string | null;
  rejectedReasons: string[];
  onChange: <K extends keyof GenerateFormValues>(
    key: K,
    value: GenerateFormValues[K],
  ) => void;
  onSubmit: () => void;
}

export default function AiGenerateForm({
  form,
  activeSkills,
  isGenerating,
  generateError,
  rejectedReasons,
  onChange,
  onSubmit,
}: AiGenerateFormProps) {
  const isExercise = form.entityType === "exercise";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="ad-card ad-ai-form-card">
      <form onSubmit={handleSubmit}>
        <div className="ad-field-row">
          <div className="ad-field">
            <label className="ad-label">สิ่งที่ต้องการให้สร้าง</label>
            <select
              className="ad-select"
              value={form.entityType}
              onChange={(e) =>
                onChange("entityType", e.target.value as AiDraftEntityType)
              }
              disabled={isGenerating}
            >
              <option value="exercise">Exercise (โจทย์)</option>
              <option value="skill">Skill</option>
              <option value="goal">Goal</option>
            </select>
          </div>

          <div className="ad-field">
            <label className="ad-label">จำนวน (1-20)</label>
            <input
              type="number"
              min={1}
              max={20}
              className="ad-input"
              value={form.count}
              onChange={(e) => onChange("count", Number(e.target.value))}
              disabled={isGenerating}
              required
            />
          </div>
        </div>

        {isExercise && (
          <div className="ad-field-row">
            <div className="ad-field">
              <label className="ad-label">Skill</label>
              <select
                className="ad-select"
                value={form.skillId ?? ""}
                onChange={(e) => onChange("skillId", Number(e.target.value))}
                disabled={isGenerating}
                required
              >
                <option value="" disabled>
                  -- เลือก Skill --
                </option>
                {activeSkills.map((s) => (
                  <option key={s.skillId} value={s.skillId}>
                    {s.skillsName}
                  </option>
                ))}
              </select>
            </div>

            <div className="ad-field">
              <label className="ad-label">ระดับความยาก</label>
              <select
                className="ad-select"
                value={form.skillLevel}
                onChange={(e) => onChange("skillLevel", Number(e.target.value))}
                disabled={isGenerating}
              >
                {BLOOM_LEVELS.map((b) => (
                  <option key={b.level} value={b.level}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="ad-field">
              <label className="ad-label">ประเภทโจทย์</label>
              <select
                className="ad-select"
                value={form.exerciseType}
                onChange={(e) =>
                  onChange(
                    "exerciseType",
                    e.target.value as GenerateFormValues["exerciseType"],
                  )
                }
                disabled={isGenerating}
              >
                <option value="CHOICE">CHOICE (ตัวเลือก)</option>
                <option value="FILL_IN_BLANK">FILL_IN_BLANK (เติมคำ)</option>
                <option value="MIXED">ผสมทั้งสองแบบ</option>
              </select>
            </div>
          </div>
        )}

        <div className="ad-field">
          <label className="ad-label">คำอธิบายเพิ่มเติม</label>
          <textarea
            className="ad-input"
            rows={3}
            placeholder={
              isExercise
                ? 'เช่น "เน้นการ index และ slicing ของ list ในภาษา Python"'
                : 'เช่น "ต่อยอดจาก skill พื้นฐานเรื่อง loop ในภาษา Python"'
            }
            value={form.instruction}
            onChange={(e) => onChange("instruction", e.target.value)}
            disabled={isGenerating}
          />
          <span className="ad-hint-text">
            ทุกรายการที่สร้างจะเข้ามาเป็นร่างรอตรวจ ไม่ถูกบันทึกลงระบบจนกว่าจะกดอนุมัติ
          </span>
        </div>

        {generateError && <div className="ad-ai-alert-error">{generateError}</div>}

        {rejectedReasons.length > 0 && (
          <div className="ad-ai-alert-warn">
            <strong>คัดออก {rejectedReasons.length} รายการ</strong> เพราะไม่ผ่านการตรวจ:
            <ul className="ad-ai-reason-list">
              {rejectedReasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="ad-ai-form-actions">
          <button
            type="submit"
            className="ad-btn-primary"
            disabled={isGenerating}
          >
            <FaWandMagicSparkles />{" "}
            {isGenerating ? "กำลังให้ AI ร่าง..." : "ให้ AI ร่างให้"}
          </button>
        </div>
      </form>
    </div>
  );
}
