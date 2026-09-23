import React, { useState } from "react";
import {
  FaClock,
  FaBullseye,
  FaBolt,
  FaUserGraduate,
  FaUser,
  FaIdCard,
  FaAt,
  FaVenusMars,
  FaCakeCandles,
  FaCalendarDays,
  FaBuildingColumns,
  FaBookOpen,
  FaLayerGroup,
  FaLocationDot,
  FaGraduationCap,
  FaFire,
  FaListCheck,
  FaFlagCheckered,
  FaDownload,
} from "react-icons/fa6";
import { BranchSkill } from "../../../models/branchSkillModel";
import { downloadProgressReport } from "./ProgressReportPdf";
import { SessionHistoryItem } from "../../../models/sessionHistoryModel";
import { UserProfileDetail } from "../../../models/userModel";
import { BranchStats } from "../../../models/branchStatsModel";
import { usePreferences } from "../../../context/PreferencesContext";
import {
  computeBehavior,
  BEHAVIOR_META,
  DIM_LABEL_KEYS,
  type BehaviorClass,
  type BehaviorDim,
} from "../utils/behavior";

const DIM_ICONS: Record<BehaviorDim, React.ReactNode> = {
  time: <FaClock aria-hidden />,
  streak: <FaBullseye aria-hidden />,
  momentum: <FaBolt aria-hidden />,
};

// --meta = สีของ behavior class (token --beh-* ใน Home.css) ใช้ผสมสีพื้น/ขอบให้เข้ากับทั้งสองธีม
const metaVar = (color: string) => ({ "--meta": color } as React.CSSProperties);

interface ProfileTabProps {
  unlocked: Set<number>;
  sessions: SessionHistoryItem[];
  /** ข้อมูลผู้ใช้จาก backend (GET /userprofile/:id) */
  profile: UserProfileDetail | null;
  profileLoading: boolean;
  stats: BranchStats | null;
  goalsCount: number;
  activeBranch: {
    goalName?: string;
  } | null;
  /** รายการ skill พร้อม progressPercent — ส่งมาจาก HomeShell */
  skills: BranchSkill[];
}

interface InfoRow {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const InfoRows: React.FC<{ rows: InfoRow[]; loading: boolean }> = ({ rows, loading }) => (
  <dl className="profile-info-list">
    {rows.map((row) => (
      <div key={row.label} className="profile-info-row">
        <span className="profile-info-icon">{row.icon}</span>
        <dt className="profile-info-label">{row.label}</dt>
        <dd className="profile-info-value">
          {loading ? <span className="profile-skeleton" aria-hidden /> : row.value}
        </dd>
      </div>
    ))}
  </dl>
);

const parseDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const ageOf = (birth: Date): number | null => {
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age--;
  return age >= 0 ? age : null;
};

export const ProfileTab: React.FC<ProfileTabProps> = ({
  unlocked,
  sessions,
  profile,
  profileLoading,
  stats,
  goalsCount,
  activeBranch,
  skills,
}) => {
  const { t, locale } = usePreferences();
  const behavior = computeBehavior(sessions);
  const meta = BEHAVIOR_META[behavior.cls];

  const fullName = profile?.fullName || localStorage.getItem("fullname") || t("user.fallbackName");
  const initial = fullName.trim().charAt(0).toUpperCase();

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadProgressReport({
        fullName,
        username: profile?.username,
        goalName: activeBranch?.goalName,
        stats,
        unlockedCount: unlocked.size,
        behavior,
        skills,
        profile,
      });
    } finally {
      setDownloading(false);
    }
  };
  const loading = profileLoading && !profile;
  const dash = <span className="profile-info-empty">—</span>;

  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) : null;

  const birth = parseDate(profile?.birthDate);
  const age = birth ? ageOf(birth) : null;
  const joined = formatDate(parseDate(profile?.createdAt));

  const personalRows: InfoRow[] = [
    { icon: <FaIdCard aria-hidden />, label: t("profile.fullName"), value: profile?.fullName || dash },
    { icon: <FaAt aria-hidden />, label: t("profile.username"), value: profile?.username || dash },
    { icon: <FaVenusMars aria-hidden />, label: t("profile.gender"), value: profile?.genderName || dash },
    {
      icon: <FaCakeCandles aria-hidden />,
      label: t("profile.birthDate"),
      value: birth ? (
        <>
          {formatDate(birth)}
          {age !== null && <span className="profile-info-sub">{t("profile.age", { age })}</span>}
        </>
      ) : (
        dash
      ),
    },
    { icon: <FaCalendarDays aria-hidden />, label: t("profile.joined"), value: joined || dash },
  ];

  const educationRows: InfoRow[] = [
    { icon: <FaLocationDot aria-hidden />, label: t("profile.campus"), value: profile?.campusName || dash },
    { icon: <FaBuildingColumns aria-hidden />, label: t("profile.faculty"), value: profile?.facultyName || dash },
    { icon: <FaBookOpen aria-hidden />, label: t("profile.major"), value: profile?.majorName || dash },
    {
      icon: <FaLayerGroup aria-hidden />,
      label: t("profile.year"),
      value: profile?.year ? t("profile.yearVal", { year: profile.year }) : dash,
    },
  ];

  const progress = Math.max(0, Math.min(100, Math.round(stats?.goalProgressPercent ?? 0)));
  const summaryStats = [
    { icon: <FaListCheck aria-hidden />, label: t("profile.stat.sessions"), value: stats?.sessionsCount ?? sessions.length },
    { icon: <FaFire aria-hidden />, label: t("profile.stat.streak"), value: stats?.dayStreak ?? 0 },
    { icon: <FaGraduationCap aria-hidden />, label: t("profile.stat.goals"), value: goalsCount },
  ];

  return (
    <div className="tab-profile">
      <div className="profile-container">
        <div className="profile-hero" data-tour="tour-profile-hero">
          <div className="profile-avatar-lg">
            {initial ? <span>{initial}</span> : <FaUserGraduate aria-hidden />}
          </div>
          <div className="profile-info-main">
            <div className="profile-name">{fullName}</div>
            {profile?.username && <div className="profile-username">@{profile.username}</div>}
            <div className="profile-chips">
              <span className="profile-goal">
                <FaBullseye aria-hidden />
                {t("profile.goal", { goal: activeBranch?.goalName || t("profile.goalUnset") })}
              </span>
              {profile?.majorName && (
                <span className="profile-chip">
                  <FaBookOpen aria-hidden />
                  {profile.majorName}
                </span>
              )}
            </div>
          </div>
          <div className="profile-skill-count">
            <div className="profile-skill-count-label">{t("profile.skillsUnlocked")}</div>
            <div className="profile-skill-count-num">{unlocked.size}</div>
          </div>
        </div>

        <div className="behavior-card" style={metaVar(meta.color)} data-tour="tour-behavior">
          <div className="behavior-class-header">
            <div className="behavior-class-badge">
              <span className="bcb-label">{t("profile.learner", { label: t(meta.labelKey) })}</span>
            </div>
            <div className="behavior-score-wrap">
              <div className="behavior-score-ring">
                <span className="behavior-score-num">{behavior.score}</span>
                <span className="behavior-score-sub">/ 100</span>
              </div>
              <span className="behavior-score-caption">{t("profile.behaviorScore")}</span>
            </div>
          </div>
          <p className="behavior-desc">{t(meta.descKey)}</p>
          <div className="behavior-dims" data-tour="tour-behavior-dims">
            <div className="behavior-dim-row behavior-dim-avg">
              <span className="bdim-icon"><FaClock aria-hidden /></span>
              <span className="bdim-label">{t("profile.avgTime")}</span>
              <span className="bdim-val">{t("profile.avgTimeVal", { sec: behavior.avgTime })}</span>
            </div>
            {(Object.keys(behavior.dims) as BehaviorDim[]).map((key) => {
              const val = behavior.dims[key];
              return (
                <div key={key} className="behavior-dim-row">
                  <span className="bdim-icon">{DIM_ICONS[key]}</span>
                  <span className="bdim-label">{t(DIM_LABEL_KEYS[key])}</span>
                  <div className="bdim-track">
                    <div className="bdim-fill" style={{ width: `${val}%` }} />
                    <div className="bdim-marker" style={{ left: "50%" }} />
                    <div className="bdim-marker" style={{ left: "70%" }} />
                  </div>
                  <span className="bdim-val">{val}%</span>
                </div>
              );
            })}
          </div>
          <div className="behavior-class-legend">
            {(Object.keys(BEHAVIOR_META) as BehaviorClass[]).map((k) => (
              <span
                key={k}
                className={`bcl-item ${behavior.cls === k ? "active" : ""}`}
                style={metaVar(BEHAVIOR_META[k].color)}
              >
                {t(BEHAVIOR_META[k].labelKey)}
              </span>
            ))}
          </div>
        </div>

        <div className="profile-grid" data-tour="tour-profile-personal">
          <section className="profile-card">
            <h3 className="profile-card-title">
              <span className="profile-card-icon"><FaUser aria-hidden /></span>
              {t("profile.personal")}
            </h3>
            <InfoRows rows={personalRows} loading={loading} />
          </section>

          <section className="profile-card">
            <h3 className="profile-card-title">
              <span className="profile-card-icon"><FaGraduationCap aria-hidden /></span>
              {t("profile.education")}
            </h3>
            <InfoRows rows={educationRows} loading={loading} />
          </section>

          <section className="profile-card profile-card-wide">
            <h3 className="profile-card-title">
              <span className="profile-card-icon"><FaFlagCheckered aria-hidden /></span>
              {t("profile.learningSummary")}
            </h3>
            <div className="profile-summary">
              <div className="profile-goal-progress">
                <div className="pgp-head">
                  <span className="pgp-name">{activeBranch?.goalName || t("profile.goalUnset")}</span>
                  <span className="pgp-pct">{progress}%</span>
                </div>
                <div
                  className="pgp-track"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="pgp-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="pgp-sub">
                  {t("profile.goalMastered", {
                    done: stats?.goalMasteredCount ?? 0,
                    total: stats?.goalRequiredCount ?? 0,
                  })}
                </div>
              </div>
              <div className="profile-stats">
                {summaryStats.map((st) => (
                  <div key={st.label} className="profile-stat">
                    <span className="profile-stat-icon">{st.icon}</span>
                    <span className="profile-stat-num">{st.value}</span>
                    <span className="profile-stat-label">{st.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="profile-pdf-btn"
              onClick={handleDownloadPdf}
              disabled={downloading}
              aria-busy={downloading}
            >
              <FaDownload aria-hidden />
              <span>{downloading ? "กำลังสร้าง PDF..." : "ดาวน์โหลดสรุปผลการเรียน (PDF)"}</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
export default ProfileTab;
