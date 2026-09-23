import React from "react";
import { usePreferences } from "../../context/PreferencesContext";
import { statusKey } from "../../utils/adminUi";

interface StatusSwitchProps {
  status: string;
  onToggle: () => void;
  disabled?: boolean;
}

export const StatusSwitch: React.FC<StatusSwitchProps> = ({ status, onToggle, disabled }) => {
  const { t } = usePreferences();
  const key = statusKey(status);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 20 }}>
      <label className="ad-switch" style={{ flexShrink: 0 }}>
        <input
          type="checkbox"
          checked={status === "active"}
          onChange={onToggle}
          disabled={disabled}
        />
        <span className="ad-switch-slider" />
      </label>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: "capitalize",
          color: status === "active" ? "var(--green)" : "var(--muted)",
          minWidth: 54,
          lineHeight: 1,
        }}
      >
        {key ? t(key) : status}
      </span>
    </div>
  );
};
