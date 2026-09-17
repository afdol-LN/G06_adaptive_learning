import { FaTriangleExclamation } from "react-icons/fa6";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import { ConfirmDialogProps, confirmDialogController } from "./confirmDialog.controller";

/**
 * ไม่ใช้ common/Modal เพราะตัวนั้น hardcode พื้นขาวแบบ inline อ่านไม่ออกในธีมมืด
 * ใช้ markup ad-overlay / ad-modal เดียวกับ GoalFormModal แทน
 */
export default function ConfirmDialog(props: ConfirmDialogProps) {
  const { t } = usePreferences();
  const view = confirmDialogController(props);

  if (!view.isOpen) return null;

  return (
    <div className="ad-overlay" onClick={view.handleOverlayClick}>
      <div
        className="ad-modal ad-ws-confirm"
        role="dialog"
        aria-modal="true"
        onClick={view.handleDialogClick}
      >
        <div className="ad-modal-header">
          <span className="ad-modal-title">
            <FaTriangleExclamation aria-hidden /> {view.title}
          </span>
        </div>
        <div className="ad-modal-body">
          <p className="ad-ws-confirm-msg">{view.message}</p>
          {view.hasItems && (
            <ul className="ad-ws-confirm-list">
              {view.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="ad-modal-footer">
          <button
            type="button"
            className="ad-btn-cancel"
            onClick={view.handleCancel}
            disabled={view.isBusy}
          >
            {t("admin.common.cancel")}
          </button>
          <button
            type="button"
            className="ad-btn-primary"
            onClick={view.handleConfirm}
            disabled={view.isBusy}
          >
            {view.isBusy ? t("admin.common.saving") : view.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
