import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import { Skill } from "../../../../../../models/skillModel";

export interface AddSkillBoxProps {
  allSkills: Skill[];
  requiredIds: Set<number>;
  activeExerciseCountBySkill: Map<number, number>;
  isBusy: boolean;
  error: string | null;
  canRetryLink: boolean;
  onLink: (skillId: number) => Promise<boolean>;
  /** เปิด SkillFormModal ตัวเดียวกับแท็บ Skill — การสร้าง+ผูกอยู่ใน workspace.controller */
  onOpenCreate: () => void;
  onRetryLink: () => void;
}

/** ปุ่ม "เพิ่ม skill" → รายการ skill ทั้งหมด (แถวบนสุด = สร้าง skill ใหม่) คลิกแล้วผูกเป็น required skill */
export function addSkillBoxController({
  allSkills,
  requiredIds,
  activeExerciseCountBySkill,
  isBusy,
  error,
  canRetryLink,
  onLink,
  onOpenCreate,
  onRetryLink,
}: AddSkillBoxProps) {
  const { t } = usePreferences();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  // เปิดใหม่ทุกครั้งเริ่มจากช่องค้นหาว่าง
  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  const term = query.trim().toLowerCase();

  // ปิดรายการเมื่อคลิกนอกกล่องหรือกด Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  const results = useMemo(
    () =>
      allSkills
        .filter(
          (s) =>
            term === "" ||
            s.skillsName.toLowerCase().includes(term) ||
            (s.skillCode || "").toLowerCase().includes(term),
        )
        // เลือกได้ขึ้นก่อน (active และยังไม่อยู่ใน goal) แล้วเรียงตามชื่อ
        .sort((a, b) => {
          const rank = (s: Skill) =>
            Number(s.status !== "active") * 2 + Number(requiredIds.has(s.skillId));
          return rank(a) - rank(b) || a.skillsName.localeCompare(b.skillsName);
        })
        .map((s) => {
          const isAlready = requiredIds.has(s.skillId);
          // owner decision: skill ที่ inactive ผูกกับ goal ไม่ได้ (backend ตอบ 400)
          const isInactive = s.status !== "active";
          const meta = [
            s.skillCode,
            t("admin.workspace.add.meta", { count: activeExerciseCountBySkill.get(s.skillId) ?? 0 }),
            ...(isAlready ? [t("admin.workspace.add.already")] : []),
            ...(isInactive ? [t("admin.workspace.add.inactive")] : []),
          ].join(" · ");
          return {
            skillId: s.skillId,
            name: s.skillsName,
            meta,
            isDisabled: isAlready || isInactive || isBusy,
            handleClick: async () => {
              if (await onLink(s.skillId)) setIsOpen(false);
            },
          };
        }),
    [allSkills, term, requiredIds, activeExerciseCountBySkill, isBusy, onLink, t],
  );

  return {
    containerRef,
    isOpen,
    query,
    results,
    isEmpty: results.length === 0,
    handleQueryChange: (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    isBusy,
    error,
    canRetryLink,
    handleToggle: () => setIsOpen((open) => !open),
    handleCreate: () => {
      setIsOpen(false);
      onOpenCreate();
    },
    handleRetryLink: onRetryLink,
  };
}
