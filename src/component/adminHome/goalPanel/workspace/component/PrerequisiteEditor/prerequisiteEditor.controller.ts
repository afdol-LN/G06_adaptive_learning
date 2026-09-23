import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import { WorkspaceSkill } from "../../../../../../models/goalModel";
import { Skill } from "../../../../../../models/skillModel";

export interface PrerequisiteEditorProps {
  skill: WorkspaceSkill;
  allSkills: Skill[];
  isBusy: boolean;
  onSave: (skillId: number, prerequisiteIds: number[]) => Promise<boolean>;
}

/**
 * แก้รายการในเครื่องก่อน กด "บันทึก" ถึงจะส่ง — backend อาจตอบว่าเป็นวงวน
 * ซึ่ง tree จะไม่เปลี่ยนจนกว่าบันทึกสำเร็จ
 */
export function prerequisiteEditorController({
  skill,
  allSkills,
  isBusy,
  onSave,
}: PrerequisiteEditorProps) {
  const { t } = usePreferences();
  const savedKey = skill.prerequisiteSkillIds.join(",");
  const [prereqIds, setPrereqIds] = useState<number[]>(() => [...skill.prerequisiteSkillIds]);

  // เปลี่ยน skill ที่เลือก หรือโหลดค่าที่บันทึกแล้วกลับมา → เริ่มจากค่าที่บันทึกไว้
  useEffect(() => {
    setPrereqIds([...skill.prerequisiteSkillIds]);
  }, [skill.skillId, savedKey]);

  const nameById = useMemo(
    () => new Map(allSkills.map((s) => [s.skillId, s.skillsName])),
    [allSkills],
  );
  const nameOf = (id: number) => nameById.get(id) ?? `#${id}`;

  const options = useMemo(
    () =>
      allSkills
        .filter((s) => s.skillId !== skill.skillId && !prereqIds.includes(s.skillId))
        .sort((a, b) => a.skillsName.localeCompare(b.skillsName))
        .map((s) => ({ value: s.skillId, label: s.skillsName })),
    [allSkills, skill.skillId, prereqIds],
  );

  const chips = prereqIds.map((id) => ({
    id,
    name: nameOf(id),
    removeLabel: t("admin.workspace.panel.prereq.remove", { name: nameOf(id) }),
    handleRemove: () => setPrereqIds((prev) => prev.filter((p) => p !== id)),
  }));

  const handleAdd = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    if (id) setPrereqIds((prev) => [...prev, id]);
  };

  const handleSave = () => {
    onSave(skill.skillId, prereqIds);
  };

  const handleReset = () => setPrereqIds([...skill.prerequisiteSkillIds]);

  return {
    chips,
    hasChips: chips.length > 0,
    options,
    isDirty: prereqIds.join(",") !== savedKey,
    isBusy,
    handleAdd,
    handleSave,
    handleReset,
  };
}
