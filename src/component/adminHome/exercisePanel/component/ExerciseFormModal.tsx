import React, { useEffect, useState } from "react";
import { FaPen, FaPlus } from "react-icons/fa6";
import { Skill } from "../../../../models/skillModel";
import { Exercise, ExerciseType, IsCaseSensitive } from "../../../../models/exerciseModel";
import { ExerciseFormValues, EMPTY_EXERCISE_FORM } from "../exercise.controller";
import { TimeUnit, fromSeconds } from "../../../../utils/timeUnit";

interface ExerciseFormModalProps {
  isOpen: boolean;
  editingExercise: Exercise | null;
  activeSkills: Skill[];
  isSaving: boolean;
  formError: string | null;
  onSave: (form: ExerciseFormValues) => Promise<boolean>;
  onClose: () => void;
  /** ทับหัวข้อ modal — ใช้ตอน reuse ฟอร์มนี้กับร่างจาก AI ผู้ช่วย */
  title?: string;
  /** ทับข้อความปุ่มบันทึก */
  submitLabel?: string;
}

export default function ExerciseFormModal({
  isOpen,
  editingExercise,
  activeSkills,
  isSaving,
  formError,
  onSave,
  onClose,
  title,
  submitLabel,
}: ExerciseFormModalProps) {
  const [description, setDescription] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("python");
  const [level, setLevel] = useState<number>(EMPTY_EXERCISE_FORM.level);
  const [skillId, setSkillId] = useState<number | null>(null);
  const [type, setType] = useState<ExerciseType>(EMPTY_EXERCISE_FORM.type);
  const [status, setStatus] = useState<"active" | "inactive">(EMPTY_EXERCISE_FORM.status);
  const [choices, setChoices] = useState<[string, string, string, string]>(["", "", "", ""]);
  const [correctChoiceIndex, setCorrectChoiceIndex] = useState<number>(0);
  const [fillInBlank, setFillInBlank] = useState<string>("");
  const [isCasesensitive, setIsCasesensitive] = useState<IsCaseSensitive>("NO");
  const [expectTimeValue, setExpectTimeValue] = useState<number>(EMPTY_EXERCISE_FORM.expectTimeValue);
  const [expectTimeUnit, setExpectTimeUnit] = useState<TimeUnit>(EMPTY_EXERCISE_FORM.expectTimeUnit);

  useEffect(() => {
    if (!isOpen) return;
    if (editingExercise) {
      setDescription(editingExercise.description);
      setCode(editingExercise.code ?? "");
      setLanguage(editingExercise.language ?? "python");
      setLevel(editingExercise.level);
      setSkillId(editingExercise.skillId);
      setType(editingExercise.type);
      setStatus(editingExercise.status);

      const existingChoices = editingExercise.exerciseChoices || [];
      const scripts: [string, string, string, string] = ["", "", "", ""];
      let answerIdx = 0;
      existingChoices.slice(0, 4).forEach((c, i) => {
        scripts[i] = c.script;
        if (c.isAnswer) answerIdx = i;
      });
      setChoices(scripts);
      setCorrectChoiceIndex(answerIdx);

      setFillInBlank(editingExercise.fillInBlank || "");
      setIsCasesensitive(editingExercise.isCasesensitive || "NO");
      const { value: etValue, unit: etUnit } = fromSeconds(editingExercise.expectTime ?? EMPTY_EXERCISE_FORM.expectTimeValue);
      setExpectTimeValue(etValue);
      setExpectTimeUnit(etUnit);
    } else {
      setDescription("");
      setCode("");
      setLanguage(EMPTY_EXERCISE_FORM.language);
      setLevel(EMPTY_EXERCISE_FORM.level);
      setSkillId(activeSkills[0]?.skillId ?? null);
      setType(EMPTY_EXERCISE_FORM.type);
      setStatus(EMPTY_EXERCISE_FORM.status);
      setChoices(["", "", "", ""]);
      setCorrectChoiceIndex(0);
      setFillInBlank("");
      setIsCasesensitive("NO");
      setExpectTimeValue(EMPTY_EXERCISE_FORM.expectTimeValue);
      setExpectTimeUnit(EMPTY_EXERCISE_FORM.expectTimeUnit);
    }
  }, [isOpen, editingExercise, activeSkills]);

  if (!isOpen) return null;

  const isEdit = editingExercise !== null;

  const handleChoiceChange = (index: number, value: string) => {
    setChoices((prev) => {
      const next = [...prev] as [string, string, string, string];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      description,
      code,
      language,
      level,
      skillId,
      type,
      status,
      choices,
      correctChoiceIndex,
      fillInBlank,
      isCasesensitive,
      expectTimeValue,
      expectTimeUnit,
    });
  };

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title">
            {isEdit ? (
              <>
                <FaPen /> {title ?? "แก้ไข Exercise"}
              </>
            ) : (
              <>
                <FaPlus /> {title ?? "เพิ่ม Exercise ใหม่"}
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
              <label className="ad-label">คำอธิบายโจทย์ (Description)</label>
              <textarea
                className="ad-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="ad-field">
              <label className="ad-label">
                โค้ดประกอบโจทย์ (ไม่บังคับ)
              </label>
              <textarea
                className="ad-input ad-code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={6}
                spellCheck={false}
                placeholder={"เว้นว่างได้ถ้าโจทย์ไม่ต้องใช้โค้ด\nโค้ดจะแสดงในกล่องแยกเหนือตัวเลือก"}
              />
              <span className="ad-hint-text">
                ถ้าโจทย์เขียนว่า &quot;โค้ดนี้...&quot; ต้องใส่โค้ดตรงนี้ ไม่ใช่ในช่องคำอธิบาย
                เพราะช่องคำอธิบายแสดงเป็นข้อความธรรมดา การขึ้นบรรทัดจะหายไป
              </span>
            </div>

            {code.trim() !== "" && (
              <div className="ad-field">
                <label className="ad-label">ภาษาของโค้ด</label>
                <select
                  className="ad-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="sql">SQL</option>
                  <option value="plaintext">ข้อความธรรมดา</option>
                </select>
              </div>
            )}

            <div className="ad-field-row">
              <div className="ad-field">
                <label className="ad-label">Level</label>
                <input
                  type="number"
                  min={1}
                  className="ad-input"
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  required
                />
              </div>
              <div className="ad-field">
                <label className="ad-label">Skill</label>
                <select
                  className="ad-select"
                  value={skillId ?? ""}
                  onChange={(e) => setSkillId(Number(e.target.value))}
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
            </div>

            <div className="ad-field-row">
              <div className="ad-field">
                <label className="ad-label">เวลาที่คาดหวัง (Expected time)</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className="ad-input"
                  value={expectTimeValue}
                  onChange={(e) => setExpectTimeValue(Number(e.target.value))}
                  required
                />
              </div>
              <div className="ad-field">
                <label className="ad-label">หน่วย (Unit)</label>
                <select
                  className="ad-select"
                  value={expectTimeUnit}
                  onChange={(e) => setExpectTimeUnit(e.target.value as TimeUnit)}
                >
                  <option value="second">วินาที (second)</option>
                  <option value="minute">นาที (minute)</option>
                  <option value="hour">ชั่วโมง (hour)</option>
                </select>
              </div>
            </div>

            <div className="ad-field-row">
              <div className="ad-field">
                <label className="ad-label">ประเภทโจทย์ (Type)</label>
                <select
                  className="ad-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as ExerciseType)}
                >
                  <option value="CHOICE">CHOICE (ตัวเลือก)</option>
                  <option value="FILL_IN_BLANK">FILL_IN_BLANK (เติมคำ)</option>
                </select>
              </div>
              <div className="ad-field">
                <label className="ad-label">สถานะ</label>
                <select
                  className="ad-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>
            </div>

            {type === "CHOICE" ? (
              <div className="ad-field">
                <label className="ad-label">ตัวเลือกคำตอบ (เลือก 1 ข้อที่ถูก)</label>
                {choices.map((script, index) => (
                  <div
                    key={index}
                    style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}
                  >
                    <input
                      type="text"
                      className="ad-input"
                      placeholder={`ตัวเลือกที่ ${index + 1}`}
                      value={script}
                      onChange={(e) => handleChoiceChange(index, e.target.value)}
                      required
                      style={{ flex: 1 }}
                    />
                    <label
                      style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, whiteSpace: "nowrap" }}
                    >
                      <input
                        type="checkbox"
                        className="ad-checkbox"
                        checked={correctChoiceIndex === index}
                        onChange={() => setCorrectChoiceIndex(index)}
                      />
                      คำตอบ
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ad-field">
                <label className="ad-label">คำตอบที่ถูกต้อง (Fill in blank)</label>
                <input
                  type="text"
                  className="ad-input"
                  value={fillInBlank}
                  onChange={(e) => setFillInBlank(e.target.value)}
                  required
                />
                <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    className="ad-checkbox"
                    checked={isCasesensitive === "YES"}
                    onChange={(e) => setIsCasesensitive(e.target.checked ? "YES" : "NO")}
                  />
                  ตรวจตัวพิมพ์เล็ก/ใหญ่ (Case sensitive)
                </label>
              </div>
            )}
          </div>

          <div className="ad-modal-footer">
            <button type="button" className="ad-btn-cancel" onClick={onClose} disabled={isSaving}>
              ยกเลิก
            </button>
            <button type="submit" className="ad-btn-primary" disabled={isSaving}>
              {isSaving ? "กำลังบันทึก..." : (submitLabel ?? "บันทึก")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
