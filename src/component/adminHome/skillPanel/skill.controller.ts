import { useCallback, useEffect, useMemo, useState } from "react";
import { skillService } from "./skill.service";
import { Skill, SkillPrerequisiteInput } from "../../../models/skillModel";
import { getTierColor, getTierLabel, getStatusColor } from "../../../utils/adminUi";

export interface SkillFormValues {
  skillCode: string;
  skillsName: string;
  tier: string;
  status: string;
  prerequisites: SkillPrerequisiteInput[];
}

export const EMPTY_SKILL_FORM: SkillFormValues = {
  skillCode: "",
  skillsName: "",
  tier: "T1",
  status: "active",
  prerequisites: [],
};

export function skillController() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [skillSearch, setSkillSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [viewingSkill, setViewingSkill] = useState<Skill | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = useCallback(async () => {
    setIsLoading(true);
    const result = await skillService.getAllSkills();
    if (result.isError) {
      setError(result.errorMessage);
      setSkills([]);
    } else {
      setSkills(result.data || []);
      setError(null);
    }
    setIsLoading(false);
  }, []);

  const filteredSkills = useMemo(() => {
    const term = skillSearch.trim().toLowerCase();
    const list = skills.filter((s) => {
      if (term) {
        const matches =
          s.skillsName.toLowerCase().includes(term) ||
          (s.tier || "").toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      return true;
    });
    return list.sort((a, b) => a.skillsName.localeCompare(b.skillsName));
  }, [skills, skillSearch, statusFilter]);

  const openCreateForm = () => {
    setFormError(null);
    setEditingSkill(null);
    setIsFormOpen(true);
  };

  const openEditForm = (skill: Skill) => {
    setFormError(null);
    setEditingSkill(skill);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSkill(null);
    setFormError(null);
  };

  const openView = (skill: Skill) => setViewingSkill(skill);
  const closeView = () => setViewingSkill(null);

  // A skill row is created/updated in one of two shapes:
  //  - "skill only": no prerequisite is attached, prior prerequisites (if any) are left untouched
  //  - "skill and prerequisite": the given prerequisite list replaces whatever existed before
  // We use the with-prerequisite endpoint whenever there's something to write to that list
  // (new ones being added, or an existing set being cleared out).
  const saveSkill = async (form: SkillFormValues): Promise<boolean> => {
    setIsSaving(true);
    setFormError(null);
    try {
      const isEdit = editingSkill !== null;
      const hadPrerequisitesBefore = (editingSkill?.skillPrequisite?.length || 0) > 0;
      const touchesPrerequisites = form.prerequisites.length > 0 || hadPrerequisitesBefore;

      const skillPayload = {
        skillsName: form.skillsName,
        tier: form.tier,
        status: form.status,
      };

      const result = isEdit
        ? touchesPrerequisites
          ? await skillService.updateSkillWithPrerequisite(editingSkill!.skillId, {
              ...skillPayload,
              prerequisites: form.prerequisites,
            })
          : await skillService.updateSkill(editingSkill!.skillId, skillPayload)
        : touchesPrerequisites
          ? await skillService.createSkillWithPrerequisite({
              skillCode: form.skillCode,
              ...skillPayload,
              prerequisites: form.prerequisites,
            })
          : await skillService.createSkill({ skillCode: form.skillCode, ...skillPayload });

      if (result.isError) {
        setFormError(result.errorMessage);
        return false;
      }

      closeForm();
      await loadSkills();
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSkillStatus = async (skill: Skill) => {
    const newStatus = skill.status === "active" ? "inactive" : "active";
    setIsLoading(true);
    const result = await skillService.updateSkill(skill.skillId, { status: newStatus });
    if (result.isError) {
      setError(result.errorMessage);
    } else {
      setSkills((prev) =>
        prev.map((s) => (s.skillId === skill.skillId ? { ...s, status: newStatus } : s)),
      );
    }
    setIsLoading(false);
  };

  const requestDelete = (skill: Skill) => setDeleteTarget(skill);
  const cancelDelete = () => setDeleteTarget(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await skillService.deleteSkill(deleteTarget.skillId);
    if (result.isError) {
      setError(result.errorMessage);
    } else {
      // Backend soft-deletes (status -> inactive) rather than removing the row.
      setSkills((prev) =>
        prev.map((s) =>
          s.skillId === deleteTarget.skillId ? { ...s, status: "inactive" } : s,
        ),
      );
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  return {
    skills,
    isLoading,
    error,
    skillSearch,
    setSkillSearch,
    statusFilter,
    setStatusFilter,
    filteredSkills,
    getTierColor,
    getTierLabel,
    getStatusColor,

    isFormOpen,
    editingSkill,
    isSaving,
    formError,
    openCreateForm,
    openEditForm,
    closeForm,
    saveSkill,

    viewingSkill,
    openView,
    closeView,

    toggleSkillStatus,

    deleteTarget,
    isDeleting,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}
