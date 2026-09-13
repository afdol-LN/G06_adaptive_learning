export interface InformationFormData {
  edu: "bachelor" | "master" | "phd" | string;
  year: string;
  campus: string;
  faculty: string;
  major: string;
  // Numeric ids (kept as strings for setFormDataField) resolved alongside the
  // display names above — the backend persists ids, not names.
  campusId?: string;
  facultyId?: string;
  majorId?: string;
}

export interface StepDefinition {
  title: string;
  sub: string;
}

export interface FacultyOption {
  v: string;
  label: string;
}

export interface ExperienceData {
  level: string;
  title: string;
  desc: string;
  badges: string[];
  color: string;
}

export interface GoalItem {
  id: string;
  name: string;
  group: string;
  icon: string;
  desc: string;
  skillCount?: number;
}

export interface BranchCreationData {
  // Real backend branch id (from POST /branch/mine), so the local branch
  // record uses the same id the server knows — required for later calls
  // like pretest submit that look the branch up by id server-side.
  id: string;
  campus: string;
  faculty: string;
  major: string;
  year: string;
  goalId: string;
  goalName: string;
  goalIcon: string;
  goalDesc: string;
  exp: number;
}

export type GoalGroupMap = Record<string, GoalItem[]>;
