import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { Skill } from "../../../../models/skillModel";
import { GoalSkillRequireInput } from "../../../../models/goalModel";
import { usePreferences } from "../../../../context/PreferencesContext";
import type { TKey } from "../../../../i18n";

interface SkillRequireEditorProps {
  activeSkills: Skill[];
  value: GoalSkillRequireInput[];
  onChange: (next: GoalSkillRequireInput[]) => void;
}

// Bloom's Taxonomy (revised): 6 cognitive levels, from Remember to Create.
// ชื่อระดับเป็นศัพท์สากล (อังกฤษทั้งสองภาษา) ส่วนคำอธิบายอยู่ใน i18n
const BLOOM_LEVELS: { level: number; name: string; descKey: TKey }[] = [
  { level: 1, name: "Remember", descKey: "admin.bloom.1" },
  { level: 2, name: "Understand", descKey: "admin.bloom.2" },
  { level: 3, name: "Apply", descKey: "admin.bloom.3" },
  { level: 4, name: "Analyze", descKey: "admin.bloom.4" },
  { level: 5, name: "Evaluate", descKey: "admin.bloom.5" },
  { level: 6, name: "Create", descKey: "admin.bloom.6" },
];

const bloomLevel = (level: number | null | undefined) =>
  BLOOM_LEVELS.find((b) => b.level === level);

export default function SkillRequireEditor({
  activeSkills,
  value,
  onChange,
}: SkillRequireEditorProps) {
  const { t } = usePreferences();
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
    return bloom ? `${bloom.level}. ${bloom.name}` : t("admin.common.noLevel");
  };

  const selectedBloom = bloomLevel(levelRequire === "" ? null : levelRequire);

  return (
    <div className="ad-field">
      <label className="ad-label">{t("admin.skillRequire.label")}</label>

      <div className="ad-field-row ad-skill-require-row">
        <select
          className="ad-select"
          value={selectedSkillId}
          onChange={(e) => setSelectedSkillId(e.target.value === "" ? "" : Number(e.target.value))}
        >
          <option value="" disabled>
            {t("admin.common.pickSkill")}
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
          <option value="">{t("admin.skillRequire.levelPh")}</option>
          {BLOOM_LEVELS.map((b) => (
            <option key={b.level} value={b.level} title={t(b.descKey)}>
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
          <FaPlus /> {t("admin.common.add")}
        </button>
      </div>
      {selectedBloom && <div className="ad-hint-text">{t(selectedBloom.descKey)}</div>}

      <div className="ad-choices-edit">
        {value.length === 0 ? (
          <span className="ad-muted">{t("admin.skillRequire.noneSelected")}</span>
        ) : (
          value.map((v) => (
            <div key={v.skillId} className="ad-choice-row">
              <span style={{ flex: 1 }}>{skillName(v.skillId)}</span>
              <span className="ad-muted">{levelLabel(v.levelRequire)}</span>
              <button
                type="button"
                className="ad-btn-sm ad-btn-del"
                onClick={() => handleRemove(v.skillId)}
                aria-label={skillName(v.skillId)}
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
