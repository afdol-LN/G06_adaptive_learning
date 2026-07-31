import React, { useEffect, useState } from "react";
import { FaPen, FaPlus } from "react-icons/fa6";
import { Goal } from "../../../../models/goalModel";
import { Skill } from "../../../../models/skillModel";
import { GoalFormValues, EMPTY_GOAL_FORM } from "../goal.controller";
import SkillRequireEditor from "./SkillRequireEditor";

interface GoalFormModalProps {
  isOpen: boolean;
  editingGoal: Goal | null;
  activeSkills: Skill[];
  isSaving: boolean;
  formError: string | null;
  onSave: (form: GoalFormValues) => Promise<boolean>;
  onClose: () => void;
}

export default function GoalFormModal({
  isOpen,
  editingGoal,
  activeSkills,
  isSaving,
  formError,
  onSave,
  onClose,
}: GoalFormModalProps) {
  const [goal, setGoal] = useState<string>("");
  const [goalDescription, setGoalDescription] = useState<string>("");
  const [skillRequires, setSkillRequires] = useState(EMPTY_GOAL_FORM.skillRequires);

  useEffect(() => {
    if (!isOpen) return;
    if (editingGoal) {
      setGoal(editingGoal.goal);
      setGoalDescription(editingGoal.goalDescription || "");
      setSkillRequires(
        (editingGoal.goalSkillRequire || []).map((r) => ({
          skillId: r.skillId,
          levelRequire: r.levelRequire ?? undefined,
        })),
      );
    } else {
      setGoal("");
      setGoalDescription("");
      setSkillRequires([]);
    }
  }, [isOpen, editingGoal]);

  if (!isOpen) return null;

  const isEdit = editingGoal !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      goal: goal.trim(),
      goalDescription: goalDescription.trim(),
      skillRequires,
    });
  };

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title">
            {isEdit ? (
              <>
                <FaPen /> แก้ไข Goal
              </>
            ) : (
              <>
                <FaPlus /> เพิ่ม Goal ใหม่
              </>
            )}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ad-modal-body">
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

            <div className="ad-field">
              <label className="ad-label">ชื่อ Goal</label>
              <input
                type="text"
                className="ad-input"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
            </div>

            <div className="ad-field">
              <label className="ad-label">คำอธิบาย</label>
              <textarea
                className="ad-input"
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                rows={3}
              />
            </div>

            <SkillRequireEditor
              activeSkills={activeSkills}
              value={skillRequires}
              onChange={setSkillRequires}
            />
          </div>

          <div className="ad-modal-footer">
            <button type="button" className="ad-btn-cancel" onClick={onClose} disabled={isSaving}>
              ยกเลิก
            </button>
            <button type="submit" className="ad-btn-primary" disabled={isSaving}>
              {isSaving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
