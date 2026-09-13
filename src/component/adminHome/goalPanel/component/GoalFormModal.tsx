import React, { useEffect, useState } from "react";
import { FaPen, FaPlus } from "react-icons/fa6";
import { Goal } from "../../../../models/goalModel";
import { Skill } from "../../../../models/skillModel";
import { GoalFormValues, EMPTY_GOAL_FORM } from "../goal.controller";
import SkillRequireEditor from "./SkillRequireEditor";
import { usePreferences } from "../../../../context/PreferencesContext";

interface GoalFormModalProps {
  isOpen: boolean;
  editingGoal: Goal | null;
  activeSkills: Skill[];
  isSaving: boolean;
  formError: string | null;
  onSave: (form: GoalFormValues) => Promise<boolean>;
  onClose: () => void;
  /** ทับหัวข้อ modal — ใช้ตอน reuse ฟอร์มนี้กับร่างจาก AI ผู้ช่วย */
  title?: string;
  /** ทับข้อความปุ่มบันทึก */
  submitLabel?: string;
}

export default function GoalFormModal({
  isOpen,
  editingGoal,
  activeSkills,
  isSaving,
  formError,
  onSave,
  onClose,
  title,
  submitLabel,
}: GoalFormModalProps) {
  const { t } = usePreferences();
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
                <FaPen /> {title ?? t("admin.goalForm.titleEdit")}
              </>
            ) : (
              <>
                <FaPlus /> {title ?? t("admin.goalForm.titleCreate")}
              </>
            )}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ad-modal-body">
            {formError && <div className="ad-form-error">{formError}</div>}

            <div className="ad-field">
              <label className="ad-label">{t("admin.goalForm.name")}</label>
              <input
                type="text"
                className="ad-input"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
            </div>

            <div className="ad-field">
              <label className="ad-label">{t("admin.goalForm.description")}</label>
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
              {t("admin.common.cancel")}
            </button>
            <button type="submit" className="ad-btn-primary" disabled={isSaving}>
              {isSaving ? t("admin.common.saving") : (submitLabel ?? t("admin.common.save"))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
