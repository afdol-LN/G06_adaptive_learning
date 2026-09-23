import React from "react";
import { FaEye, FaPen } from "react-icons/fa6";
import { usePreferences } from "../../context/PreferencesContext";

interface ActionButtonsProps {
  onView: () => void;
  onEdit: () => void;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onView, onEdit, disabled }) => {
  const { t } = usePreferences();
  return (
    <div className="ad-action-btns">
      <button className="ad-btn-sm ad-btn-view" onClick={onView} disabled={disabled}>
        <FaEye /> {t("admin.common.view")}
      </button>
      <button className="ad-btn-sm ad-btn-view" onClick={onEdit} disabled={disabled}>
        <FaPen /> {t("admin.common.edit")}
      </button>
    </div>
  );
};
