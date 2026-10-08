import { useCallback, useEffect, useMemo, useState } from "react";
import { exerciseService } from "./exercise.service";
import { skillService } from "../skillPanel/skill.service";
import { Skill } from "../../../models/skillModel";
import {
  Exercise,
  ExerciseType,
  IsCaseSensitive,
} from "../../../models/exerciseModel";
import { TimeUnit, toSeconds } from "../../../utils/timeUnit";
import { usePreferences } from "../../../context/PreferencesContext";
import { exerciseStatsService } from "../exerciseStatsPanel/exerciseStats.service";
import type { DetailTab } from "../learnerStatsPanel/DetailTabs";

/** ตัวกรอง "ผู้ทำ": ทุกข้อ / มีคนทำแล้ว / ยังไม่มีคนทำ */
export type UsageFilter = "all" | "used" | "unused";

export interface ExerciseFormValues {
  description: string;
  /** โค้ดประกอบโจทย์ แสดงในกล่องแยกเหนือตัวเลือก ว่างได้ */
  code: string;
  language: string;
  level: number;
  skillId: number | null;
  type: ExerciseType;
  status: "active" | "inactive";
  choices: [string, string, string, string];
  correctChoiceIndex: number;
  fillInBlank: string;
  isCasesensitive: IsCaseSensitive;
  expectTimeValue: number;
  expectTimeUnit: TimeUnit;
}

export const EMPTY_EXERCISE_FORM: ExerciseFormValues = {
  description: "",
  code: "",
  language: "python",
  level: 1,
  skillId: null,
  type: "CHOICE",
  status: "active",
  choices: ["", "", "", ""],
  correctChoiceIndex: 0,
  fillInBlank: "",
  isCasesensitive: "NO",
  expectTimeValue: 10,
  expectTimeUnit: "second",
};

export function exerciseController() {
  const { t } = usePreferences();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeSkills, setActiveSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>("");
  const [skillFilter, setSkillFilter] = useState<number | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ExerciseType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [viewingExercise, setViewingExercise] = useState<Exercise | null>(null);
  // แท็บที่ modal รายละเอียดเปิดขึ้นมา — กดป้าย "ผู้ทำ" จะเปิดตรงแท็บสถิติ
  const [viewTab, setViewTab] = useState<DetailTab>("detail");

  // exerciseId → จำนวนนักเรียนที่ตอบข้อนี้แล้ว (รวม Pretest — ตรงกับเงื่อนไขของปุ่มลบ)
  // null = ยังโหลดไม่เสร็จ/โหลดไม่สำเร็จ → ป้ายแสดง "—" และตัวกรองไม่ตัดอะไรทิ้ง
  const [answeredBy, setAnsweredBy] = useState<Map<number, number> | null>(null);
  const [usageFilter, setUsageFilter] = useState<UsageFilter>("all");

  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadUsage = useCallback(async () => {
    const result = await exerciseStatsService.getList(null, true);
    if (result.isError || !result.data) {
      setAnsweredBy(null);
      return;
    }
    setAnsweredBy(new Map(result.data.map((r) => [r.exerciseId, r.totalStudents])));
  }, []);

  useEffect(() => {
    loadExercises();
    loadSkills();
    loadUsage();
  }, []);

  const loadExercises = useCallback(async () => {
    setIsLoading(true);
    const result = await exerciseService.getAllExercises();
    if (result.isError) {
      setError(result.errorMessage);
      setExercises([]);
    } else {
      setExercises(result.data || []);
      setError(null);
    }
    setIsLoading(false);
  }, []);

  const loadSkills = useCallback(async () => {
    const result = await skillService.getAllSkills();
    if (!result.isError) {
      setActiveSkills((result.data || []).filter((s) => s.status === "active"));
    }
  }, []);

  const filteredExercises = useMemo(() => {
    const term = search.trim().toLowerCase();
    return exercises.filter((ex) => {
      if (term && !ex.description.toLowerCase().includes(term)) return false;
      if (skillFilter !== "all" && ex.skillId !== skillFilter) return false;
      if (typeFilter !== "all" && ex.type !== typeFilter) return false;
      if (statusFilter !== "all" && ex.status !== statusFilter) return false;
      if (usageFilter !== "all" && answeredBy) {
        const used = (answeredBy.get(ex.id) ?? 0) > 0;
        if (usageFilter === "used" ? !used : used) return false;
      }
      return true;
    });
  }, [exercises, search, skillFilter, typeFilter, statusFilter, usageFilter, answeredBy]);

  const openCreateForm = () => {
    setFormError(null);
    setEditingExercise(null);
    setIsFormOpen(true);
  };

  const openEditForm = async (exercise: Exercise) => {
    setFormError(null);
    setIsFormOpen(true);
    setEditingExercise(exercise);
    const result = await exerciseService.getExercise(exercise.id);
    if (!result.isError && result.data) {
      setEditingExercise(result.data);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingExercise(null);
    setFormError(null);
  };

  const openView = async (exercise: Exercise, tab: DetailTab = "detail") => {
    setViewTab(tab);
    setViewingExercise(exercise);
    const result = await exerciseService.getExercise(exercise.id);
    if (!result.isError && result.data) {
      setViewingExercise(result.data);
    }
  };
  const closeView = () => setViewingExercise(null);

  const saveExercise = async (form: ExerciseFormValues): Promise<boolean> => {
    if (!form.skillId) {
      setFormError(t("admin.exercises.pickSkill"));
      return false;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      const basePayload = {
        description: form.description.trim(),
        // ส่ง "" มาได้เพื่อลบโค้ดทิ้ง backend แปลงเป็น null ให้เอง
        code: form.code,
        language: form.language,
        skillId: form.skillId,
        skillLevel: form.level,
        type: form.type,
        status: form.status,
        expectTime: toSeconds(form.expectTimeValue, form.expectTimeUnit),
      };

      const payload =
        form.type === "CHOICE"
          ? {
              ...basePayload,
              choices: form.choices.map((script, index) => ({
                script,
                isAnswer: index === form.correctChoiceIndex,
              })),
            }
          : {
              ...basePayload,
              fillInBlank: form.fillInBlank.trim(),
              isCasesensitive: form.isCasesensitive,
            };

      const result = editingExercise
        ? await exerciseService.updateExercise(editingExercise.id, payload)
        : await exerciseService.createExercise(payload);

      if (result.isError) {
        setFormError(result.errorMessage);
        return false;
      }

      closeForm();
      await loadExercises();
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  const toggleExerciseStatus = async (exercise: Exercise) => {
    setTogglingId(exercise.id);
    const result =
      exercise.status === "active"
        ? await exerciseService.deleteExercise(exercise.id)
        : await exerciseService.updateExercise(exercise.id, { status: "active" });

    if (result.isError) {
      setError(result.errorMessage);
    } else {
      const newStatus = exercise.status === "active" ? "inactive" : "active";
      setExercises((prev) =>
        prev.map((ex) => (ex.id === exercise.id ? { ...ex, status: newStatus } : ex)),
      );
    }
    setTogglingId(null);
  };

  return {
    exercises,
    activeSkills,
    isLoading,
    error,

    search,
    setSearch,
    skillFilter,
    setSkillFilter,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    filteredExercises,

    isFormOpen,
    editingExercise,
    isSaving,
    formError,
    openCreateForm,
    openEditForm,
    closeForm,
    saveExercise,

    viewingExercise,
    openView,
    closeView,
    viewTab,
    // โหลดจำนวนผู้ทำใหม่ด้วย — ลบ/แก้ข้อแล้วตัวเลขต้องตรง
    reload: async () => {
      await Promise.all([loadExercises(), loadUsage()]);
    },
    answeredBy,
    usageFilter,
    setUsageFilter,

    togglingId,
    toggleExerciseStatus,
  };
}
