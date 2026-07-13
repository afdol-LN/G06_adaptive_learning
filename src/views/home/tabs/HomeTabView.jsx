// ─── views/home/tabs/HomeTabView.jsx ────────────────────────────────────────
// Tab: หน้าหลัก (hero, stats, goal progress, skill tree mini, sessions)
// UI only — รับ vm จาก HomeView
// ─────────────────────────────────────────────────────────────────────────────
import SkillTreeSVG     from '../../../component/SkillTreeSVG';
import SkillSidePanel   from '../../../component/SkillSidePanel';
import ExerciseConfirmModal from '../../../component/ExerciseConfirmModal';
import NextExercisePicker   from '../../../component/NextExercisePicker';
import { BEHAVIOR_META, DIM_LABELS, getProgressColor } from '../../../models/skillModel';

export default function HomeTabView({ vm }) {
  const {
    USER, treeSkills, unlocked, sessions, activeBranch, goalProgressPct, behavior,
    selected, setSelected, hovered, setHovered, showPicker, setShowPicker,
    confirmSkill, handleNodeClick, handleStartExercise,
    handleConfirmExercise, handleCancelExercise, handleGoPicker,
    canUnlock,
  } = vm;

  const behMeta = BEHAVIOR_META[behavior.cls] || BEHAVIOR_META.struggler;

  return (
    <div className="tab-home">
      {/* Hero */}
      <div className="hero-section">
        <div className="hero-greeting">สวัสดี, {USER.name} 👋</div>
        <div className="hero-goal">
          เป้าหมาย: <strong>{USER.goal}</strong>
        </div>
        <div className="hero-meta">{USER.faculty} · {USER.major} · {USER.year}</div>
      </div>

      {/* Goal progress */}
      <div className="goal-progress-card">
        <div className="gpc-label">Goal Progress: {activeBranch?.goalName}</div>
        <div className="gpc-track">
          <div className="gpc-fill" style={{ width: `${goalProgressPct}%` }} />
        </div>
        <div className="gpc-pct">{goalProgressPct}%</div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        {[
          { label: 'Level',       value: activeBranch?.level || 1,                icon: '⭐' },
          { label: 'XP',          value: (activeBranch?.xp || 0).toLocaleString(), icon: '✨' },
          { label: 'Streak',      value: `${activeBranch?.streak || 0} วัน`,       icon: '🔥' },
          { label: 'Sessions',    value: sessions.length,                           icon: '📋' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Behavior card */}
      {sessions.length > 0 && (
        <div className="behavior-card" style={{ borderLeftColor: behMeta.color, background: behMeta.bg, borderColor: behMeta.border }}>
          <div className="behav-header">
            <span className="behav-label" style={{ color: behMeta.color }}>{behMeta.label}</span>
            <span className="behav-score" style={{ color: behMeta.color }}>Score {behavior.score}</span>
          </div>
          <p className="behav-desc" style={{ color: behMeta.color }}>{behMeta.desc}</p>
          <div className="behav-dims">
            {Object.entries(DIM_LABELS).map(([k, { label, icon }]) => (
              <div key={k} className="dim-row">
                <span className="dim-label">{icon} {label}</span>
                <div className="dim-track">
                  <div className="dim-fill" style={{ width: `${behavior.dims[k] || 0}%`, background: behMeta.color }} />
                </div>
                <span className="dim-pct" style={{ color: behMeta.color }}>{behavior.dims[k] || 0}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mini Skill Tree */}
      <div className="mini-tree-section">
        <div className="section-title">Skill Tree</div>
        <div className="mini-tree-wrap">
          <SkillTreeSVG
            skills={treeSkills}
            unlocked={unlocked}
            canUnlockFn={canUnlock}
            onNodeClick={handleNodeClick}
            selected={selected}
            hovered={hovered}
            setHovered={setHovered}
            zoomable={false}
          />
          <SkillSidePanel
            selected={selected}
            setSelected={setSelected}
            skills={treeSkills}
            unlocked={unlocked}
            canUnlockFn={canUnlock}
            onStartExercise={handleStartExercise}
          />
        </div>
      </div>

      {/* Exercise picker */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <button className="btn-pick-exercise" onClick={() => setShowPicker(true)}>
          ▶ เลือก Exercise
        </button>
      </div>
      {showPicker && (
        <NextExercisePicker
          skills={treeSkills} unlocked={unlocked} canUnlockFn={canUnlock}
          onGo={handleGoPicker} onClose={() => setShowPicker(false)} />
      )}

      {/* Confirm modal */}
      {confirmSkill && (
        <ExerciseConfirmModal
          skill={confirmSkill}
          onConfirm={handleConfirmExercise}
          onCancel={handleCancelExercise} />
      )}
    </div>
  );
}
