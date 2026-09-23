/**
 * ProgressReportPdf.tsx
 * สร้าง PDF "สรุปผลการเรียน" ฝั่ง client ทั้งหมด ผ่าน @react-pdf/renderer
 * เรียกใช้ผ่าน downloadProgressReport() จาก ProfileTab
 *
 * ฟอนต์ไทย: Sarabun v17 จาก Google Fonts (TTF ตรง — react-pdf ไม่รองรับ woff2)
 * URL ได้จาก https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap
 */
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import { BranchSkill } from "../../../models/branchSkillModel";
import { BranchStats } from "../../../models/branchStatsModel";
import { UserProfileDetail } from "../../../models/userModel";
import { BehaviorResult, BEHAVIOR_META } from "../utils/behavior";

// ── 1. Register Thai font — must be called before any component renders ───────
Font.register({
  family: "Sarabun",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/sarabun/v17/DtVjJx26TKEr37c9WBI.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/sarabun/v17/DtVmJx26TKEr37c9YK5sulw.ttf",
      fontWeight: 700,
    },
  ],
});

// ── Colour tokens (match app theme) ──────────────────────────────────────────
const C = {
  accent:   "#0047AB",
  navy:     "#000080",
  text:     "#1a2540",
  muted:    "#475569",
  border:   "#c2d3e0",
  white:    "#ffffff",
  green:    "#10b981",
  surface:  "#f2f7fa",
  statBg:   "#e8f0fe",
};

const FONT = "Sarabun";

// ── 2. Styles — fontFamily: FONT on every style that contains text ────────────
const S = StyleSheet.create({
  // page
  page: {
    fontFamily: FONT,
    fontWeight: 400,
    fontSize: 10,
    color: C.text,
    backgroundColor: C.white,
    padding: 40,
    paddingBottom: 60, // room for fixed footer
  },

  // ── Header ──
  headerBar: {
    backgroundColor: C.accent,
    borderRadius: 8,
    padding: "14 20",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: 18,
    color: C.white,
  },
  headerDate: {
    fontFamily: FONT,
    fontWeight: 400,
    fontSize: 9,
    color: "rgba(255,255,255,0.85)",
  },

  // ── Learner card ──
  learnerCard: {
    backgroundColor: C.surface,
    borderRadius: 8,
    padding: "12 16",
    marginBottom: 16,
    borderLeft: `4 solid ${C.accent}`,
  },
  learnerName: {
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: 14,
    color: C.navy,
    marginBottom: 3,
  },
  learnerSub: {
    fontFamily: FONT,
    fontWeight: 400,
    fontSize: 9,
    color: C.muted,
    marginBottom: 2,
  },
  learnerGoal: {
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: 10,
    color: C.accent,
    marginTop: 6,
  },

  // ── Section wrapper ──
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: 11,
    color: C.navy,
    marginBottom: 8,
    borderBottom: `1 solid ${C.border}`,
    paddingBottom: 4,
  },

  // ── Progress bar ──
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  progressLabel: {
    fontFamily: FONT,
    fontWeight: 400,
    fontSize: 9,
    color: C.muted,
  },
  progressPct: {
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: 13,
    color: C.accent,
  },
  trackBg: {
    height: 8,
    backgroundColor: C.border,
    borderRadius: 4,
    marginBottom: 5,
  },
  trackFill: {
    height: 8,
    backgroundColor: C.accent,
    borderRadius: 4,
  },
  progressSub: {
    fontFamily: FONT,
    fontWeight: 400,
    fontSize: 9,
    color: C.muted,
  },

  // ── Stats row ──
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.statBg,
    borderRadius: 8,
    padding: "10 8",
    alignItems: "center",
  },
  statNum: {
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: 18,
    color: C.accent,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: FONT,
    fontWeight: 400,
    fontSize: 8,
    color: C.muted,
    textAlign: "center",
  },

  // ── Skill table ──
  tableSection: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.accent,
    borderRadius: "4 4 0 0",
    padding: "5 8",
  },
  thName: {
    flex: 3,
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: 9,
    color: C.white,
  },
  thPct: {
    flex: 1,
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: 9,
    color: C.white,
    textAlign: "right",
  },
  thStatus: {
    flex: 1,
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: 9,
    color: C.white,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: `1 solid ${C.border}`,
    padding: "5 8",
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: `1 solid ${C.border}`,
    padding: "5 8",
    backgroundColor: C.surface,
  },
  tdName: {
    flex: 3,
    fontFamily: FONT,
    fontWeight: 400,
    fontSize: 9,
    color: C.text,
  },
  tdPct: {
    flex: 1,
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: 9,
    color: C.accent,
    textAlign: "right",
  },
  tdDone: {
    flex: 1,
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: 8,
    color: C.green,
    textAlign: "center",
  },
  tdWip: {
    flex: 1,
    fontFamily: FONT,
    fontWeight: 400,
    fontSize: 8,
    color: C.muted,
    textAlign: "center",
  },

  // ── Footer ──
  footerBar: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1 solid ${C.border}`,
    paddingTop: 6,
  },
  footerText: {
    fontFamily: FONT,
    fontWeight: 400,
    fontSize: 8,
    color: C.muted,
  },
});

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ProgressReportData {
  fullName: string;
  username?: string;
  goalName?: string;
  stats: BranchStats | null;
  unlockedCount: number;
  behavior: BehaviorResult;
  skills: BranchSkill[];
  profile: UserProfileDetail | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function todayThai(): string {
  return new Date().toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const BEHAVIOR_DISPLAY: Record<string, string> = {
  "behavior.mastery":   "นักเรียนเก่ง (Mastery)",
  "behavior.fast":      "เรียนเร็ว (Fast)",
  "behavior.steady":    "สม่ำเสมอ (Steady)",
  "behavior.slow":      "เรียนช้า (Slow)",
  "behavior.struggler": "ต้องการความช่วยเหลือ (Struggler)",
};

// ── Document component ────────────────────────────────────────────────────────
function ProgressReportDocument({ data }: { data: ProgressReportData }) {
  const { fullName, username, goalName, stats, unlockedCount, behavior, skills } = data;
  const today = todayThai();

  const progress  = Math.round(stats?.goalProgressPercent ?? 0);
  const mastered  = stats?.goalMasteredCount ?? 0;
  const required  = stats?.goalRequiredCount ?? 0;
  const sessions  = stats?.sessionsCount ?? 0;
  const streak    = stats?.dayStreak ?? 0;

  const behaviorLabel   = BEHAVIOR_META[behavior.cls]?.labelKey ?? behavior.cls;
  const behaviorDisplay = BEHAVIOR_DISPLAY[behaviorLabel] ?? behaviorLabel;

  // skill ที่เริ่มทำแล้ว เรียงตาม % มากไปน้อย
  const activeSkills = [...skills]
    .filter((s) => s.attemptCount > 0)
    .sort((a, b) => b.progressPercent - a.progressPercent);

  const edu = [data.profile?.campusName, data.profile?.facultyName, data.profile?.majorName]
    .filter(Boolean)
    .join(" · ");

  return (
    <Document title="สรุปผลการเรียน" author="AER System">
      <Page size="A4" style={S.page}>

        {/* ── Header ── */}
        <View style={S.headerBar}>
          <Text style={S.headerTitle}>สรุปผลการเรียน</Text>
          <Text style={S.headerDate}>{today}</Text>
        </View>

        {/* ── Learner info ── */}
        <View style={S.learnerCard}>
          <Text style={S.learnerName}>{fullName}</Text>
          {username && <Text style={S.learnerSub}>@{username}</Text>}
          {edu ? <Text style={S.learnerSub}>{edu}</Text> : null}
          <Text style={S.learnerGoal}>
            เป้าหมาย: {goalName || "ยังไม่ได้กำหนด"}
          </Text>
        </View>

        {/* ── Goal progress ── */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>ความคืบหน้าเป้าหมาย</Text>
          <View style={S.progressRow}>
            <Text style={S.progressLabel}>{goalName || "—"}</Text>
            <Text style={S.progressPct}>{progress}%</Text>
          </View>
          <View style={S.trackBg}>
            <View style={[S.trackFill, { width: `${progress}%` }]} />
          </View>
          <Text style={S.progressSub}>
            สำเร็จแล้ว {mastered}/{required} ทักษะ
          </Text>
        </View>

        {/* ── Stats ── */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>สถิติการเรียน</Text>
          <View style={S.statsRow}>
            <View style={S.statCard}>
              <Text style={S.statNum}>{unlockedCount}</Text>
              <Text style={S.statLabel}>ทักษะที่ปลดล็อก</Text>
            </View>
            <View style={S.statCard}>
              <Text style={S.statNum}>{sessions}</Text>
              <Text style={S.statLabel}>เซสชันทั้งหมด</Text>
            </View>
            <View style={S.statCard}>
              <Text style={S.statNum}>{streak}</Text>
              <Text style={S.statLabel}>วันติดต่อกัน</Text>
            </View>
            <View style={S.statCard}>
              <Text style={[S.statNum, { fontSize: 11 }]}>{behavior.score}</Text>
              <Text style={S.statLabel}>คะแนนพฤติกรรม</Text>
            </View>
          </View>
          <View style={[S.learnerCard, { marginBottom: 0, paddingTop: 8, paddingBottom: 8 }]}>
            <Text style={S.learnerSub}>ประเภทผู้เรียน: {behaviorDisplay}</Text>
          </View>
        </View>

        {/* ── Skill table ── */}
        {activeSkills.length > 0 && (
          <View style={S.tableSection}>
            <Text style={S.sectionTitle}>
              รายการทักษะ ({activeSkills.length} ทักษะที่เริ่มฝึกแล้ว)
            </Text>
            <View style={S.tableHeader}>
              <Text style={S.thName}>ชื่อทักษะ</Text>
              <Text style={S.thPct}>ความก้าวหน้า</Text>
              <Text style={S.thStatus}>สถานะ</Text>
            </View>
            {activeSkills.map((skill, i) => (
              <View key={skill.skillId} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
                <Text style={S.tdName}>{skill.skillsName}</Text>
                <Text style={S.tdPct}>{Math.round(skill.progressPercent)}%</Text>
                {skill.progressPercent >= 100 ? (
                  <Text style={S.tdDone}>สำเร็จแล้ว</Text>
                ) : (
                  <Text style={S.tdWip}>กำลังทำ</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── Footer (fixed — appears on every page) ── */}
        <View style={S.footerBar} fixed>
          <Text style={S.footerText}>สร้างโดยระบบ AER — Adaptive Learning System</Text>
          <Text style={S.footerText}>{today}</Text>
        </View>

      </Page>
    </Document>
  );
}

// ── Download function ─────────────────────────────────────────────────────────
export async function downloadProgressReport(data: ProgressReportData): Promise<void> {
  const blob = await pdf(<ProgressReportDocument data={data} />).toBlob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `progress-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
