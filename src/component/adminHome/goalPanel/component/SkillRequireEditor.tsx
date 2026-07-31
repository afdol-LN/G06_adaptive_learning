import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { Skill } from "../../../../models/skillModel";
import { GoalSkillRequireInput } from "../../../../models/goalModel";

interface SkillRequireEditorProps {
  activeSkills: Skill[];
  value: GoalSkillRequireInput[];
  onChange: (next: GoalSkillRequireInput[]) => void;
}

export default function SkillRequireEditor({
  activeSkills,
  value,
  onChange,
}: SkillRequireEditorProps) {
  const usedIds = new Set(value.map((v) => v.skillId));
  const availableSkills = activeSkills.filter((s) => !usedIds.has(s.skillId));

  const [selectedSkillId, setSelectedSkillId] = useState<number | "">(
    availableSkills[0]?.skillId ?? "",
  );
  const [levelRequire, setLevelRequire] = useState<string>("");

  useEffect(() => {
    if (selectedSkillId !== "" && !availableSkills.some((s) => s.skillId === selectedSkillId)) {
      setSelectedSkillId(availableSkills[0]?.skillId ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, activeSkills]);

  const handleAdd = () => {
    if (selectedSkillId === "") return;
    const next: GoalSkillRequireInput = {
      skillId: Number(selectedSkillId),
      levelRequire: levelRequire.trim() === "" ? undefined : Number(levelRequire),
    };
    onChange([...value, next]);
    setLevelRequire("");
  };

  const handleRemove = (skillId: number) => {
    onChange(value.filter((v) => v.skillId !== skillId));
  };

  const skillName = (skillId: number) =>
    activeSkills.find((s) => s.skillId === skillId)?.skillsName || `#${skillId}`;

  return (
    <div className="ad-field">
      <label className="ad-label">Skill ที่ต้องใช้</label>

      <div className="ad-field-row">
        <select
          className="ad-select"
          value={selectedSkillId}
          onChange={(e) => setSelectedSkillId(e.target.value === "" ? "" : Number(e.target.value))}
        >
          <option value="" disabled>
            -- เลือก Skill --
          </option>
          {availableSkills.map((s) => (
            <option key={s.skillId} value={s.skillId}>
              {s.skillsName}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="ad-input"
          placeholder="Level ที่ต้องการ"
          value={levelRequire}
          onChange={(e) => setLevelRequire(e.target.value)}
        />
        <button
          type="button"
          className="ad-btn-primary"
          onClick={handleAdd}
          disabled={selectedSkillId === ""}
        >
          <FaPlus /> เพิ่ม
        </button>
      </div>

      <div className="ad-req-tags">
        {value.length === 0 ? (
          <span className="ad-muted">— ยังไม่ได้เลือก Skill —</span>
        ) : (
          value.map((v) => (
            <span key={v.skillId} className="ad-req-tag">
              {skillName(v.skillId)}
              {v.levelRequire != null ? ` (level ${v.levelRequire})` : ""}
              <button
                type="button"
                onClick={() => handleRemove(v.skillId)}
                style={{ marginLeft: 6, border: "none", background: "transparent", cursor: "pointer" }}
              >
                <FaTrash />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
