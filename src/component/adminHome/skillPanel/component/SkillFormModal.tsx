import React, { useEffect, useState } from "react";
import { FaPen, FaPlus, FaCheck } from "react-icons/fa6";
import { Skill, SkillPrerequisiteInput } from "../../../../models/skillModel";
import { SkillFormValues, EMPTY_SKILL_FORM } from "../skill.controller";

const TIERS = ["T1", "T2", "T3", "T4", "T5"];

interface SkillFormModalProps {
  isOpen: boolean;
  editingSkill: Skill | null;
  allSkills: Skill[];
  isSaving: boolean;
  formError: string | null;
  onSave: (form: SkillFormValues) => Promise<boolean>;
  onClose: () => void;
}

export default function SkillFormModal({
  isOpen,
  editingSkill,
  allSkills,
  isSaving,
  formError,
  onSave,
  onClose,
}: SkillFormModalProps) {
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
                <FaPen /> แก้ไข Skill
              </>
            ) : (
              <>
                <FaPlus /> เพิ่ม Skill ใหม่
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
              <label className="ad-label">Skill code</label>
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
              <label className="ad-label">ชื่อ Skill</label>
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
                <label className="ad-label">Tier</label>
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
                  <span>{tier}</span>
                </button>
                {isTierOpen && (
                  <div className="ad-select-options-list">
                    {TIERS.map((t) => (
                      <div
                        key={t}
                        className={`ad-select-option-item ${tier === t ? "active" : ""}`}
                        onClick={() => {
                          setTier(t);
                          setIsTierOpen(false);
                        }}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="ad-field" style={{ flex: 1, minWidth: "120px", position: "relative" }}>
                <label className="ad-label">สถานะ</label>
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
                  <span>{status}</span>
                </button>
                {isStatusOpen && (
                  <div className="ad-select-options-list">
                    {[
                      { value: "active", label: "active" },
                      { value: "inactive", label: "inactive" },
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        className={`ad-select-option-item ${status === opt.value ? "active" : ""}`}
                        onClick={() => {
                          setStatus(opt.value);
                          setIsStatusOpen(false);
                        }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="ad-field">
              <label className="ad-label">Prerequisite (เลือกได้หลายรายการ)</label>
              <input
                type="text"
                className="ad-input"
                placeholder="ค้นหา Prerequisite..."
                value={prereqSearch}
                onChange={(e) => setPrereqSearch(e.target.value)}
                style={{ marginBottom: "8px" }}
              />
              <div className="ad-req-tags">
                {filteredCandidates.length === 0 ? (
                  <span className="ad-muted">
                    {candidateSkills.length === 0
                      ? "— ไม่มี Skill อื่นให้เลือก —"
                      : "— ไม่พบ Skill ที่ค้นหา —"}
                  </span>
                ) : (
                  filteredCandidates.map((s) => {
                    const selected = prerequisiteIds.includes(s.skillId);
                    return (
                      <button
                        type="button"
                        key={s.skillId}
                        className="ad-req-tag"
                        onClick={() => togglePrerequisite(s.skillId)}
                        style={
                          selected
                            ? { background: "#eff6ff", borderColor: "#93c5fd", color: "#2563eb", cursor: "pointer" }
                            : { cursor: "pointer" }
                        }
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
