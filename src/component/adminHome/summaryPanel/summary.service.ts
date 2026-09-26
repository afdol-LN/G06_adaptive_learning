import { ApiResponse } from "../../../models/apiResponse";
import { AdminSummaryData, SummaryUserActivity } from "../../../models/summaryModel";
import { UserResponseAdmin } from "../../../models/userModel";
import { userService } from "../userPanel/user.service";
import { skillService } from "../skillPanel/skill.service";

// จำนวนแถวในตาราง "กิจกรรมผู้ใช้ล่าสุด"
const ACTIVITY_ROWS = 10;

const average = (values: number[]): number | null =>
  values.length === 0 ? null : Math.round(values.reduce((a, b) => a + b, 0) / values.length);

const toActivity = (u: UserResponseAdmin): SummaryUserActivity => ({
  id: u.id ?? 0,
  name: u.fullName || "-",
  email: u.username ? `@${u.username}` : "",
  faculty: u.facultyName || "-",
  sessions: u.sessionCount ?? 0,
  avgScore: u.correctPercent ?? 0,
  streak: u.dayStreak ?? 0,
  lastActive: null,
  status: u.status,
});

export class SummaryService {
  /**
   * Backend ยังไม่มี endpoint สรุปรวม — คำนวณจาก user_list + /skill ที่มีอยู่แล้ว
   * ค่าที่ต้องใช้ข้อมูลรายวัน/ราย skill (Active วันนี้, กราฟรายวัน, ความคืบหน้า skill, skill ยอดนิยม)
   * ยังคำนวณไม่ได้ จึงเป็น null ให้หน้าแสดง "ยังไม่มีข้อมูล" แทน 0 ที่ดูเหมือนค่าจริง
   * เมื่อ backend มี GET /admin/summary ให้เปลี่ยนมาเรียกตรงนั้นแทนทั้งฟังก์ชัน
   */
  getSummary = async (): Promise<ApiResponse<AdminSummaryData>> => {
    const [userRes, skillRes] = await Promise.all([
      userService.getAllUsers(),
      skillService.getAllSkills(),
    ]);

    if (userRes.isError && skillRes.isError) {
      return { isError: true, data: null, errorMessage: userRes.errorMessage || skillRes.errorMessage };
    }

    const users = userRes.isError ? [] : userRes.data || [];
    const skills = skillRes.isError ? [] : skillRes.data || [];

    const sessionCounts = users.map((u) => u.sessionCount).filter((n): n is number => typeof n === "number");
    // คะแนนเฉลี่ยนับเฉพาะคนที่เคยทำแบบฝึกหัด — คนที่ยังไม่เริ่มจะดึงค่าเฉลี่ยลงโดยไม่มีความหมาย
    const scores = users
      .filter((u) => (u.sessionCount ?? 0) > 0 && typeof u.correctPercent === "number")
      .map((u) => u.correctPercent as number);

    // ยังไม่มีเวลาใช้งานล่าสุด — เรียงคนที่ใช้งานต่อเนื่อง/บ่อยที่สุดขึ้นก่อนแทน
    const userActivity = [...users]
      .sort(
        (a, b) =>
          (b.dayStreak ?? 0) - (a.dayStreak ?? 0) || (b.sessionCount ?? 0) - (a.sessionCount ?? 0),
      )
      .slice(0, ACTIVITY_ROWS)
      .map(toActivity);

    return {
      isError: false,
      errorMessage: "",
      data: {
        summary: {
          totalUsers: userRes.isError ? null : users.length,
          activeToday: null,
          totalSessions: sessionCounts.length > 0 ? sessionCounts.reduce((a, b) => a + b, 0) : null,
          avgScore: average(scores),
          totalSkills: skillRes.isError ? null : skills.length,
          topSkill: null,
          weekSessions: null,
        },
        skillProgress: [],
        userActivity,
      },
    };
  };
}

export const summaryService = new SummaryService();
