import {
  InformationFormData,
  StepDefinition,
  ExperienceData,
  GoalItem,
  GoalGroupMap,
  BranchCreationData,
} from "../models/informationModel";
import { AppClient } from "../API/appRestApi";
import {
  CampusDTO,
  FacultyDTO,
  MajorDTO,
  CampusResponse,
  FacultyResponse,
  MajorResponse,
} from "../models/universityModel";

const STEPS: StepDefinition[] = [
  { title: "ข้อมูลทั่วไป", sub: "กรอกข้อมูลของคุณเพื่อปรับหลักสูตรให้เหมาะสม" },
  {
    title: "เลือกเนื้อหาที่ต้องการเรียนรู้",
    sub: "เลือกสิ่งที่คุณต้องการเรียนรู้จากระบบนี้",
  },
  { title: "ประสบการณ์", sub: "บอกระดับประสบการณ์ต่อเนื้อหาที่เลือก" },
];

const STEP_LABELS = ["ข้อมูล", "เป้าหมาย", "ประสบการณ์", "Pretest"];
const TOTAL_STEPS = STEP_LABELS.length; // = 4

const YEAR_BY_EDU: Record<string, string[]> = {
  bachelor: ["ปีที่ 1", "ปีที่ 2", "ปีที่ 3", "ปีที่ 4", "ปีที่ 5 (ขึ้นไป)"],
  master: ["ปีที่ 1", "ปีที่ 2", "ปีที่ 3 (ขึ้นไป)"],
  phd: ["ปีที่ 1", "ปีที่ 2", "ปีที่ 3", "ปีที่ 4 (ขึ้นไป)"],
};

const EXP_DATA: Record<number, ExperienceData> = {
  1: {
    level: "Level 1 — Novice",
    title: "มือใหม่หัดเขียนโค้ด",
    desc: "เพิ่งเริ่มต้นศึกษาการเขียนโปรแกรม อาจเคยเห็นโค้ดบ้างแต่ยังไม่มีประสบการณ์จริง",
    badges: ["ยังไม่มีประสบการณ์", "เรียนครั้งแรก"],
    color: "#e05c5c",
  },
  2: {
    level: "Level 2 — Beginner",
    title: "เริ่มต้นเขียนโปรแกรม",
    desc: "เคยเรียน Python เบื้องต้นมาบ้าง รู้จัก variable, loop, if-else แต่ยังไม่มั่นใจในการเขียนฟังก์ชัน",
    badges: ["Variables", "Loops", "Conditions"],
    color: "#e8a03c",
  },
  3: {
    level: "Level 3 — Intermediate",
    title: "เขียนโปรแกรมได้บ้าง",
    desc: "เขียน Python ได้คล่องพอสมควร เข้าใจ OOP, function, list/dict และเคยทำโปรเจกต์ขนาดเล็กมาแล้ว",
    badges: ["OOP", "Functions", "Data Structures"],
    color: "#0047AB",
  },
  4: {
    level: "Level 4 — Advanced",
    title: "เขียนโปรแกรมได้ดี",
    desc: "มีประสบการณ์การเขียน Python อย่างจริงจัง เข้าใจ algorithms, complexity และทำงานกับ library ต่างๆ ได้",
    badges: ["Algorithms", "Libraries", "Complexity"],
    color: "#82C8E5",
  },
  5: {
    level: "Level 5 — Expert",
    title: "เชี่ยวชาญการเขียนโปรแกรม",
    desc: "เขียน Python ขั้นสูงได้อย่างคล่องแคล่ว มีประสบการณ์ real-world, open source หรือทำงานมาแล้ว",
    badges: ["Advanced Python", "Real-world", "Professional"],
    color: "#38b874",
  },
};

const GROUP_LABELS: Record<string, string> = {
  Career: "Career",
  Academic: "Academic",
  Competitive: "Competitive",
  Specialized: "Specialized",
  General: "General",
};

export class InformationService {
  static getSteps(): StepDefinition[] {
    return STEPS;
  }

  static getStepLabels(): string[] {
    return STEP_LABELS;
  }

  static getTotalSteps(): number {
    return TOTAL_STEPS;
  }

  // Throws on failure so the caller can surface a real error to the user
  // instead of silently rendering an empty goal list.
  static async fetchGoals(): Promise<GoalItem[]> {
    const response = await AppClient.get("goal");
    const rawGoalsList: any[] = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : [];

    // Goal entity only has: id, goal (name), goalDescription, status —
    // no group/icon columns, so those stay fixed defaults.
    return rawGoalsList.map((rawGoal: any) => ({
      id: String(rawGoal.id),
      name: rawGoal.goal,
      desc: rawGoal.goalDescription,
      group: "General",
      icon: "🎯",
    }));
  }

  // These throw on failure so the caller can show a real error instead of a
  // silently empty dropdown.
  static async getCampuses(): Promise<CampusDTO[]> {
    const res = await AppClient.get<CampusResponse>("campus");
    if (Array.isArray(res)) {
      return res;
    }
    return res?.data || [];
  }

  static async getFacultiesByCampus(campusId: number): Promise<FacultyDTO[]> {
    const res = await AppClient.get<FacultyResponse>(`faculty/Bycampus/${campusId}`);
    return res?.isError === false && Array.isArray(res?.data) ? res.data : [];
  }

  static async getMajorsByFacultyId(facultyId: number): Promise<MajorDTO[]> {
    const res = await AppClient.get<MajorResponse>(`major/facultyId/${facultyId}`);
    return res?.isError === false && Array.isArray(res?.data) ? res.data : [];
  }

  static getYearsByEdu(edu: string): string[] {
    return YEAR_BY_EDU[edu] || YEAR_BY_EDU["bachelor"];
  }

  static getExperienceData(level: number): ExperienceData {
    return EXP_DATA[level] || EXP_DATA[1];
  }

  static getGroupLabel(groupKey: string): string {
    return GROUP_LABELS[groupKey] || groupKey;
  }

  static groupGoalsByGroup(goals: GoalItem[]): GoalGroupMap {
    return goals.reduce((acc: GoalGroupMap, goalItem: GoalItem) => {
      const groupKey = goalItem.group;
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(goalItem);
      return acc;
    }, {});
  }

  // Persists Step 1 (campus/faculty/major/year) against the logged-in user.
  static async submitGeneralInfo(formData: InformationFormData): Promise<void> {
    const yearNumber = parseInt(formData.year.replace(/\D/g, ""), 10) || undefined;
    await AppClient.patch("userprofile/me", {
      campusId: formData.campusId ? Number(formData.campusId) : undefined,
      facultyId: formData.facultyId ? Number(formData.facultyId) : undefined,
      majorId: formData.majorId ? Number(formData.majorId) : undefined,
      year: yearNumber,
    });
  }

  // Persists a Branch (user + selected goal + experience level) to the backend.
  static async createBranchOnServer(goalId: string, exp: number): Promise<void> {
    await AppClient.post("branch/mine", {
      goalId: Number(goalId),
      expForGoal: exp,
    });
  }

  static createBranchesForSelectedGoals(
    formData: InformationFormData,
    selectedGoalIds: string[],
    allGoals: GoalItem[],
    exp: number,
    addBranchFn: (branchData: BranchCreationData) => string
  ): string[] {
    const createdIds: string[] = [];
    selectedGoalIds.forEach((goalId) => {
      const goal = allGoals.find((g) => g.id === goalId);
      const newId = addBranchFn({
        campus: formData.campus,
        faculty: formData.faculty,
        major: formData.major,
        year: formData.year,
        goalId: goalId,
        goalName: goal?.name || "",
        goalIcon: goal?.icon || "🎯",
        goalDesc: goal?.desc || "",
        exp: exp,
      });
      createdIds.push(newId);
    });
    return createdIds;
  }
}
