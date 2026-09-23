import { useState, type ChangeEvent } from "react";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import { Exercise } from "../../../../../../models/exerciseModel";
import { truncate } from "../../utils/text";

/** จำนวนข้อต่อหน้าในแผง skill */
export const EXERCISES_PER_PAGE = 5;

export type ExerciseStatusFilter = "all" | "active" | "inactive";

export interface ExerciseListProps {
  exercises: Exercise[];
  minExercises: number;
  isBusy: boolean;
  /** id ของข้อที่กำลังเปลี่ยนสถานะ — ปิด switch ของข้อนั้นระหว่างรอ */
  togglingId: number | null;
  onAdd: () => void;
  onEdit: (exercise: Exercise) => void;
  onView: (exercise: Exercise) => void;
  onToggleStatus: (exercise: Exercise) => void;
}

export function exerciseListController({
  exercises,
  minExercises,
  isBusy,
  togglingId,
  onAdd,
  onEdit,
  onView,
  onToggleStatus,
}: ExerciseListProps) {
  const { t } = usePreferences();
  const activeCount = exercises.filter((e) => e.status === "active").length;

  const [statusFilter, setStatusFilter] = useState<ExerciseStatusFilter>("all");
  // กรองก่อนแบ่งหน้า — ตัวนับบนหัวข้อยังนับจากข้อทั้งหมดของ skill
  const filtered =
    statusFilter === "all" ? exercises : exercises.filter((e) => e.status === statusFilter);

  const [page, setPage] = useState<number>(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / EXERCISES_PER_PAGE));
  // จำนวนข้อลดลง (เช่นหลังโหลดใหม่ หรือปิดข้อตอนกรอง active) จนหน้าที่อยู่หายไป → อยู่หน้าสุดท้ายที่ยังมี
  const currentPage = Math.min(page, totalPages);
  const pageExercises = filtered.slice(
    (currentPage - 1) * EXERCISES_PER_PAGE,
    currentPage * EXERCISES_PER_PAGE,
  );

  const rows = pageExercises.map((exercise) => {
    const isActive = exercise.status === "active";
    return {
      id: exercise.id,
      preview: truncate(exercise.description),
      levelLabel: t("admin.common.level", { n: exercise.skillLevel }),
      type: exercise.type,
      status: exercise.status,
      className: isActive ? "ad-ws-ex-item" : "ad-ws-ex-item is-inactive",
      isToggleDisabled: isBusy || togglingId !== null,
      handleView: () => onView(exercise),
      handleEdit: () => onEdit(exercise),
      handleToggle: () => onToggleStatus(exercise),
    };
  });

  return {
    title: t("admin.workspace.panel.ex.title", {
      active: activeCount,
      total: exercises.length,
      min: minExercises,
    }),
    isEmpty: exercises.length === 0,
    // skill มีข้อ แต่ไม่มีข้อที่ตรงกับตัวกรอง
    isFilteredEmpty: exercises.length > 0 && filtered.length === 0,
    statusFilter,
    statusOptions: [
      { value: "all", label: t("admin.common.allStatus") },
      { value: "active", label: t("admin.status.active") },
      { value: "inactive", label: t("admin.status.inactive") },
    ],
    handleStatusFilterChange: (e: ChangeEvent<HTMLSelectElement>) => {
      setStatusFilter(e.target.value as ExerciseStatusFilter);
      setPage(1);
    },
    rows,
    page: currentPage,
    totalPages,
    handlePageChange: setPage,
    isBusy,
    handleAdd: onAdd,
  };
}
