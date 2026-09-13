import React from "react";
import { FaClock, FaBullseye, FaBolt, FaUserGraduate } from "react-icons/fa6";
import { SessionHistoryItem } from "../../../models/sessionHistoryModel";
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
  userProfile: {
    fname?: string;
    lname?: string;
    gender?: string;
    dob?: string;
    username?: string;
  } | null;
  activeBranch: {
    goalName?: string;
    campus?: string;
    faculty?: string;
    major?: string;
    year?: string | number;
  } | null;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  unlocked,
  sessions,
  userProfile,
  activeBranch,
}) => {
  const { t } = usePreferences();
  const behavior = computeBehavior(sessions);
  const meta = BEHAVIOR_META[behavior.cls];

  const profileFullName = [userProfile?.fname, userProfile?.lname].filter(Boolean).join(" ");
  const fullName = profileFullName || localStorage.getItem("fullname") || t("user.fallbackName");

  const personalRows = [
    { label: t("profile.fullName"), value: fullName },
    { label: t("profile.faculty"), value: activeBranch?.faculty || "—" },
    { label: t("profile.major"), value: activeBranch?.major || "—" },
    { label: t("profile.year"), value: activeBranch?.year || "—" },
    { label: t("profile.campus"), value: activeBranch?.campus || "—" },
    { label: t("profile.learningGoal"), value: activeBranch?.goalName || "—" },
  ];

  return (
    <div className="tab-profile">
      <div className="profile-container">
        <div className="profile-hero" data-tour="tour-profile-hero">
          <div className="profile-avatar-lg"><FaUserGraduate aria-hidden /></div>
          <div className="profile-info-main">
            <div className="profile-name">{fullName}</div>
            <div className="profile-goal">
              {t("profile.goal", { goal: activeBranch?.goalName || t("profile.goalUnset") })}
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

        <div className="profile-grid">
          <div className="profile-card" data-tour="tour-profile-personal">
            <div className="profile-card-title">{t("profile.personal")}</div>
            {personalRows.map((row, i) => (
              <div key={i} className="profile-row">
                <span className="profile-row-label">{row.label}</span>
                <span className="profile-row-val">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileTab;
