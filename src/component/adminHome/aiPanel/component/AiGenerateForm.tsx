import React from "react";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { Skill } from "../../../../models/skillModel";
import {
  BLOOM_LEVELS,
  GenerateFormValues,
} from "../ai.controller";
import { AiDraftEntityType } from "../../../../models/aiDraftModel";
import { usePreferences } from "../../../../context/PreferencesContext";

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
  const { t } = usePreferences();
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
            <label className="ad-label">{t("admin.ai.form.what")}</label>
            <select
              className="ad-select"
              value={form.entityType}
              onChange={(e) =>
                onChange("entityType", e.target.value as AiDraftEntityType)
              }
              disabled={isGenerating}
            >
              <option value="exercise">{t("admin.ai.form.entityExercise")}</option>
              <option value="skill">Skill</option>
              <option value="goal">Goal</option>
            </select>
          </div>

          <div className="ad-field">
            <label className="ad-label">{t("admin.ai.form.count")}</label>
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
                  {t("admin.common.pickSkill")}
                </option>
                {activeSkills.map((s) => (
                  <option key={s.skillId} value={s.skillId}>
                    {s.skillsName}
                  </option>
                ))}
              </select>
            </div>

            <div className="ad-field">
              <label className="ad-label">{t("admin.ai.form.difficulty")}</label>
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
              <label className="ad-label">{t("admin.ai.form.qtype")}</label>
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
                <option value="CHOICE">{t("admin.exForm.type.choice")}</option>
                <option value="FILL_IN_BLANK">{t("admin.exForm.type.fill")}</option>
                <option value="MIXED">{t("admin.ai.form.mixed")}</option>
              </select>
            </div>
          </div>
        )}

        <div className="ad-field">
          <label className="ad-label">{t("admin.ai.form.instruction")}</label>
          <textarea
            className="ad-input"
            rows={3}
            placeholder={isExercise ? t("admin.ai.form.phExercise") : t("admin.ai.form.phOther")}
            value={form.instruction}
            onChange={(e) => onChange("instruction", e.target.value)}
            disabled={isGenerating}
          />
          <span className="ad-hint-text">{t("admin.ai.form.hint")}</span>
        </div>

        {generateError && <div className="ad-ai-alert-error">{generateError}</div>}

        {rejectedReasons.length > 0 && (
          <div className="ad-ai-alert-warn">
            <strong>{t("admin.ai.form.rejected", { count: rejectedReasons.length })}</strong>{" "}
            {t("admin.ai.form.rejectedWhy")}
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
            {isGenerating ? t("admin.ai.form.generating") : t("admin.ai.form.generate")}
          </button>
        </div>
      </form>
    </div>
  );
}
