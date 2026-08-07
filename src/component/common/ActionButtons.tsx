import React from "react";
import { FaEye, FaPen } from "react-icons/fa6";

interface ActionButtonsProps {
  onView: () => void;
  onEdit: () => void;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onView, onEdit, disabled }) => {
  return (
    <div className="ad-action-btns">
      <button className="ad-btn-sm ad-btn-view" onClick={onView} disabled={disabled}>
        <FaEye /> ดู
      </button>
      <button className="ad-btn-sm ad-btn-view" onClick={onEdit} disabled={disabled}>
        <FaPen /> แก้ไข
      </button>
    </div>
  );
};
