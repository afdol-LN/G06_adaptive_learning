// ─── views/home/tabs/SkillTreeTabView.jsx ───────────────────────────────────
// Tab: Full Skill Tree (zoomable, pannable)
// UI only — รับ vm จาก HomeView
// ─────────────────────────────────────────────────────────────────────────────
import SkillTreeSVG   from '../../../component/SkillTreeSVG';
import SkillSidePanel from '../../../component/SkillSidePanel';
import ExerciseConfirmModal from '../../../component/ExerciseConfirmModal';

export default function SkillTreeTabView({ vm }) {
  const {
    treeSkills, unlocked, selected, setSelected, hovered, setHovered,
    confirmSkill, handleNodeClick, handleStartExercise,
    handleConfirmExercise, handleCancelExercise, canUnlock,
  } = vm;

  return (
    <div className="tab-skill-tree">
      <div className="section-header">
        <h2 className="section-title">🌳 Skill Tree</h2>
        <p className="section-sub">คลิก Node เพื่อดูรายละเอียด · Scroll เพื่อ Zoom · Drag เพื่อ Pan</p>
      </div>
      <div className="skill-tree-layout">
        <div className="skill-tree-canvas" onClick={() => setSelected(null)}>
          <SkillTreeSVG
            skills={treeSkills}
            unlocked={unlocked}
            canUnlockFn={canUnlock}
            onNodeClick={handleNodeClick}
            selected={selected}
            hovered={hovered}
            setHovered={setHovered}
            zoomable={true}
          />
        </div>
        <SkillSidePanel
          selected={selected}
          setSelected={setSelected}
          skills={treeSkills}
          unlocked={unlocked}
          canUnlockFn={canUnlock}
          onStartExercise={handleStartExercise}
        />
      </div>
      {confirmSkill && (
        <ExerciseConfirmModal
          skill={confirmSkill}
          onConfirm={handleConfirmExercise}
          onCancel={handleCancelExercise} />
      )}
    </div>
  );
}
