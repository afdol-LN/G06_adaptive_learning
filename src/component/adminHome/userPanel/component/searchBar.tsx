import { FaMagnifyingGlass } from "react-icons/fa6";
import { usePreferences } from "../../../../context/PreferencesContext";

interface SearchBarProps {
  userSearch: string;
  error?: string | null;
  isLoading?: boolean;
  onChange: (value: string) => void;
  totalCount: number;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
}

export default function SearchBar({
    userSearch, error, isLoading, onChange, totalCount, statusFilter, onStatusFilterChange
}: SearchBarProps){
    const { t } = usePreferences();
    return(
        <div className="ad-toolbar">
        <div className="ad-search-wrap">
          <span className="ad-search-icon"><FaMagnifyingGlass /></span>
          <input
            className="ad-search"
            placeholder={t("admin.users.search")}
            value={userSearch}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>

        <select
          className="ad-select"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as "all" | "active" | "inactive")}
        >
          <option value="all">{t("admin.common.allStatus")}</option>
          <option value="active">{t("admin.status.active")}</option>
          <option value="inactive">{t("admin.status.inactive")}</option>
        </select>

        <div className="ad-toolbar-info">
          {t("admin.common.foundCount", { count: totalCount })}
        </div>
      </div>
    )
}
