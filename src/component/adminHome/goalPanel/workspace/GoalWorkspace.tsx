import { FaArrowLeft, FaTriangleExclamation } from "react-icons/fa6";
import { usePreferences } from "../../../../context/PreferencesContext";
import ExerciseFormModal from "../../exercisePanel/component/ExerciseFormModal";
import ExerciseViewModal from "../../exercisePanel/component/ExerciseViewModal";
import SkillFormModal from "../../skillPanel/component/SkillFormModal";
import GoalFormModal from "../component/GoalFormModal";
import { workspaceController } from "./workspace.controller";
import WorkspaceTree from "./component/WorkspaceTree/WorkspaceTree";
import AddSkillBox from "./component/AddSkillBox/AddSkillBox";
import SkillDetailPanel from "./component/SkillDetailPanel/SkillDetailPanel";
import GoalDetailPanel from "./component/GoalDetailPanel/GoalDetailPanel";
import ReadinessChecklist from "./component/ReadinessChecklist/ReadinessChecklist";
import ConfirmDialog from "./component/ConfirmDialog/ConfirmDialog";

interface GoalWorkspaceProps {
  goalId: number;
  onBack: () => void;
}

/** หน้าเดียวที่สร้าง goal จากบนลงล่าง — ไฟล์นี้วาง layout อย่างเดียว logic อยู่ใน workspace.controller */
export default function GoalWorkspace({ goalId, onBack }: GoalWorkspaceProps) {
  const { t } = usePreferences();
  const ws = workspaceController(goalId);

  return (
    <div className="ad-ws">
      <div className="ad-ws-header">
        <button type="button" className="ad-btn-sm ad-btn-view" onClick={onBack}>
          <FaArrowLeft aria-hidden /> {t("admin.workspace.back")}
        </button>
        <div className="ad-ws-title-wrap">
          <h1 className="ad-page-title">{ws.header.title}</h1>
          {ws.header.showStatus && <span className={ws.header.statusClass}>{ws.header.statusLabel}</span>}
          {ws.header.branchLabel && <span className="ad-page-sub">{ws.header.branchLabel}</span>}
        </div>
        {ws.workspace && <AddSkillBox {...ws.addSkillBox} />}
      </div>

      {ws.error && <div className="ad-inline-error">{ws.error}</div>}

      {ws.showNotReadyBanner && (
        <div className="ad-ws-banner" role="alert">
          <FaTriangleExclamation aria-hidden /> {t("admin.workspace.activeNotReady")}
        </div>
      )}

      {ws.showLoading && (
        <div className="ad-card ad-ws-panel-empty ad-muted">{t("admin.common.loading")}</div>
      )}

      {ws.workspace && (
        <div className="ad-ws-grid">
          <div className="ad-ws-main">
            <div className="ad-card ad-ws-tree-card">
              <WorkspaceTree workspace={ws.workspace} {...ws.tree} />
            </div>
            <ReadinessChecklist workspace={ws.workspace} {...ws.checklist} />
          </div>
          {ws.isGoalSelected ? (
            <GoalDetailPanel workspace={ws.workspace} {...ws.goalDetail} />
          ) : (
            <SkillDetailPanel workspace={ws.workspace} {...ws.skillDetail} />
          )}
        </div>
      )}

      <GoalFormModal {...ws.goalFormModal} />
      <SkillFormModal {...ws.skillFormModal} />
      <ExerciseViewModal {...ws.exerciseView} />
      <ExerciseFormModal {...ws.exerciseModal} />
      <ConfirmDialog {...ws.confirmDialog} />
    </div>
  );
}
