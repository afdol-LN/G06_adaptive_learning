import React, { useEffect, useState } from "react";
import { FaPen, FaPlus, FaCheck } from "react-icons/fa6";
import { Skill, SkillPrerequisiteInput } from "../../../../models/skillModel";
import { SkillFormValues, EMPTY_SKILL_FORM } from "../skill.controller";
import { TIERS, getTierLabel, statusKey } from "../../../../utils/adminUi";
import { usePreferences } from "../../../../context/PreferencesContext";

interface SkillFormModalProps {
  isOpen: boolean;
  editingSkill: Skill | null;
  allSkills: Skill[];
  isSaving: boolean;
  formError: string | null;
  onSave: (form: SkillFormValues) => Promise<boolean>;
  onClose: () => void;
  /** ทับหัวข้อ modal — ใช้ตอน reuse ฟอร์มนี้กับร่างจาก AI ผู้ช่วย */
  title?: string;
  /** ทับข้อความปุ่มบันทึก */
  submitLabel?: string;
}

export default function SkillFormModal({
  isOpen,
  editingSkill,
  allSkills,
  isSaving,
  formError,
  onSave,
  onClose,
  title,
  submitLabel,
}: SkillFormModalProps) {
  const { t } = usePreferences();
  const [skillCode, setSkillCode] = useState<string>("");
  const [skillsName, setSkillsName] = useState<string>("");
  const [tier, setTier] = useState<string>(EMPTY_SKILL_FORM.tier);
  const [status, setStatus] = useState<string>(EMPTY_SKILL_FORM.status);
  const [prerequisiteIds, setPrerequisiteIds] = useState<number[]>([]);
  const [prereqSearch, setPrereqSearch] = useState<string>("");
  const [isTierOpen, setIsTierOpen] = useState<boolean>(false);
  const [isStatusOpen, setIsStatusOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setPrereqSearch("");
    setIsTierOpen(false);
    setIsStatusOpen(false);
    if (editingSkill) {
      setSkillCode(String(editingSkill.skillCode));
      setSkillsName(editingSkill.skillsName);
      setTier(editingSkill.tier || EMPTY_SKILL_FORM.tier);
      setStatus(editingSkill.status);
      setPrerequisiteIds(
        (editingSkill.skillPrequisite || []).map((p) => p.prerequisiteSkillId),
      );
    } else {
      setSkillCode("");
      setSkillsName("");
      setTier(EMPTY_SKILL_FORM.tier);
      setStatus(EMPTY_SKILL_FORM.status);
      setPrerequisiteIds([]);
    }
  }, [isOpen, editingSkill]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".ad-field")) {
        setIsTierOpen(false);
        setIsStatusOpen(false);
      }
    };
    if (isTierOpen || isStatusOpen) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isTierOpen, isStatusOpen]);

  if (!isOpen) return null;

  const isEdit = editingSkill !== null;
  const statusLabel = (value: string) => {
    const key = statusKey(value);
    return key ? t(key) : value;
  };

  const togglePrerequisite = (id: number) => {
    setPrerequisiteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prerequisites: SkillPrerequisiteInput[] = prerequisiteIds.map((id) => ({
      prerequisiteSkillId: id,
    }));

    await onSave({
      skillCode: skillCode.trim(),
      skillsName: skillsName.trim(),
      tier,
      status,
      prerequisites,
    });
  };

  const candidateSkills = allSkills
    .filter((s) => s.skillId !== editingSkill?.skillId)
    .sort((a, b) => a.skillsName.localeCompare(b.skillsName));

  const filteredCandidates = candidateSkills.filter(
    (s) =>
      s.skillsName.toLowerCase().includes(prereqSearch.toLowerCase()) ||
      (s.skillCode || "").toLowerCase().includes(prereqSearch.toLowerCase())
  );

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title">
            {isEdit ? (
              <>
                <FaPen /> {title ?? t("admin.skillForm.titleEdit")}
              </>
            ) : (
              <>
                <FaPlus /> {title ?? t("admin.skillForm.titleCreate")}
              </>
            )}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ad-modal-body">
            {formError && <div className="ad-form-error">{formError}</div>}

            <div className="ad-field">
              <label className="ad-label">{t("admin.skills.col.code")}</label>
              <input
                type="text"
                className="ad-input"
                value={skillCode}
                onChange={(e) => setSkillCode(e.target.value)}
                disabled={isEdit}
                required
              />
            </div>

            <div className="ad-field">
              <label className="ad-label">{t("admin.skillForm.name")}</label>
              <input
                type="text"
                className="ad-input"
                value={skillsName}
                onChange={(e) => setSkillsName(e.target.value)}
                required
              />
            </div>

            <div className="ad-field-row">
              <div className="ad-field" style={{ flex: 1, minWidth: "120px", position: "relative" }}>
                <label className="ad-label">{t("admin.skills.col.tier")}</label>
                <button
                  type="button"
                  className="ad-select"
                  onClick={() => {
                    setIsTierOpen(!isTierOpen);
                    setIsStatusOpen(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{getTierLabel(tier)}</span>
                </button>
                {isTierOpen && (
                  <div className="ad-select-options-list">
                    {TIERS.map((tierOpt) => (
                      <div
                        key={tierOpt.code}
                        className={`ad-select-option-item ${tier === tierOpt.code ? "active" : ""}`}
                        onClick={() => {
                          setTier(tierOpt.code);
                          setIsTierOpen(false);
                        }}
                      >
                        {tierOpt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="ad-field" style={{ flex: 1, minWidth: "120px", position: "relative" }}>
                <label className="ad-label">{t("admin.common.status")}</label>
                <button
                  type="button"
                  className="ad-select"
                  onClick={() => {
                    setIsStatusOpen(!isStatusOpen);
                    setIsTierOpen(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{statusLabel(status)}</span>
                </button>
                {isStatusOpen && (
                  <div className="ad-select-options-list">
                    {["active", "inactive"].map((value) => (
                      <div
                        key={value}
                        className={`ad-select-option-item ${status === value ? "active" : ""}`}
                        onClick={() => {
                          setStatus(value);
                          setIsStatusOpen(false);
                        }}
                      >
                        {statusLabel(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="ad-field">
              <label className="ad-label">{t("admin.skillForm.prereq")}</label>
              <input
                type="text"
                className="ad-input"
                placeholder={t("admin.skillForm.prereqSearch")}
                value={prereqSearch}
                onChange={(e) => setPrereqSearch(e.target.value)}
                style={{ marginBottom: "8px" }}
              />
              <div className="ad-req-tags">
                {filteredCandidates.length === 0 ? (
                  <span className="ad-muted">
                    {candidateSkills.length === 0
                      ? t("admin.skillForm.noOther")
                      : t("admin.skillForm.noMatch")}
                  </span>
                ) : (
                  filteredCandidates.map((s) => {
                    const selected = prerequisiteIds.includes(s.skillId);
                    return (
                      <button
                        type="button"
                        key={s.skillId}
                        className={`ad-req-tag pickable${selected ? " selected" : ""}`}
                        onClick={() => togglePrerequisite(s.skillId)}
                        aria-pressed={selected}
                      >
                        {selected ? (
                          <>
                            <FaCheck />{" "}
                          </>
                        ) : (
                          ""
                        )}
                        {s.skillsName}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
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
