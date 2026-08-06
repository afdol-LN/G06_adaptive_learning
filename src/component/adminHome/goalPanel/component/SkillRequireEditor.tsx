import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { Skill } from "../../../../models/skillModel";
import { GoalSkillRequireInput } from "../../../../models/goalModel";

interface SkillRequireEditorProps {
  activeSkills: Skill[];
  value: GoalSkillRequireInput[];
  onChange: (next: GoalSkillRequireInput[]) => void;
}

// Bloom's Taxonomy (revised): 6 cognitive levels, from Remember to Create.
const BLOOM_LEVELS = [
  { level: 1, name: "Remember", description: "จำข้อเท็จจริงและแนวคิดพื้นฐานได้" },
  { level: 2, name: "Understand", description: "อธิบายแนวคิดหรือความคิดรวบยอดได้" },
  { level: 3, name: "Apply", description: "นำข้อมูลไปใช้ในสถานการณ์ใหม่ได้" },
  { level: 4, name: "Analyze", description: "แยกแยะและเชื่อมโยงความสัมพันธ์ของแนวคิดได้" },
  { level: 5, name: "Evaluate", description: "ตัดสินคุณค่าและให้เหตุผลสนับสนุนได้" },
  { level: 6, name: "Create", description: "สร้างผลงานหรือแนวคิดใหม่ได้" },
] as const;

const bloomLevel = (level: number | null | undefined) =>
  BLOOM_LEVELS.find((b) => b.level === level);

export default function SkillRequireEditor({
  activeSkills,
  value,
  onChange,
}: SkillRequireEditorProps) {
  const usedIds = new Set(value.map((v) => v.skillId));
  const availableSkills = activeSkills.filter((s) => !usedIds.has(s.skillId));

  const [selectedSkillId, setSelectedSkillId] = useState<number | "">("");
  const [levelRequire, setLevelRequire] = useState<number | "">("");

  useEffect(() => {
    if (selectedSkillId !== "" && !availableSkills.some((s) => s.skillId === selectedSkillId)) {
      setSelectedSkillId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, activeSkills]);

  const handleAdd = () => {
    if (selectedSkillId === "") return;
    const next: GoalSkillRequireInput = {
      skillId: Number(selectedSkillId),
      levelRequire: levelRequire === "" ? undefined : levelRequire,
    };
    onChange([...value, next]);
    setLevelRequire("");
  };

  const handleRemove = (skillId: number) => {
    onChange(value.filter((v) => v.skillId !== skillId));
  };

  const skillName = (skillId: number) =>
    activeSkills.find((s) => s.skillId === skillId)?.skillsName || `#${skillId}`;

  const levelLabel = (level: number | null | undefined) => {
    const bloom = bloomLevel(level);
    return bloom ? `${bloom.level}. ${bloom.name}` : "ไม่ระบุ level";
  };

  const selectedBloom = bloomLevel(levelRequire === "" ? null : levelRequire);

  return (
    <div className="ad-field">
      <label className="ad-label">Skill ที่ต้องใช้</label>

      <div className="ad-field-row ad-skill-require-row">
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
        <select
          className="ad-select"
          value={levelRequire}
          onChange={(e) =>
            setLevelRequire(e.target.value === "" ? "" : Number(e.target.value))
          }
        >
          <option value="">-- Level --</option>
          {BLOOM_LEVELS.map((b) => (
            <option key={b.level} value={b.level} title={b.description}>
              {b.level}. {b.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="ad-btn-primary"
          onClick={handleAdd}
          disabled={selectedSkillId === ""}
        >
          <FaPlus /> เพิ่ม
        </button>
      </div>
      {selectedBloom && <div className="ad-hint-text">{selectedBloom.description}</div>}

      <div className="ad-choices-edit">
        {value.length === 0 ? (
          <span className="ad-muted">— ยังไม่ได้เลือก Skill —</span>
        ) : (
          value.map((v) => (
            <div key={v.skillId} className="ad-choice-row">
              <span style={{ flex: 1 }}>{skillName(v.skillId)}</span>
              <span className="ad-muted">{levelLabel(v.levelRequire)}</span>
              <button
                type="button"
                className="ad-btn-sm ad-btn-del"
                onClick={() => handleRemove(v.skillId)}
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
