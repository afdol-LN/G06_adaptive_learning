import { FaMagnifyingGlass } from "react-icons/fa6";

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
    return(
        <div className="ad-toolbar">
        <div className="ad-search-wrap">
          <span className="ad-search-icon"><FaMagnifyingGlass /></span>
          <input
            className="ad-search"
            placeholder="ค้นหาชื่อ, คณะ, คณะ, สาขา ..."
            value={userSearch}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>

        <select
          className="ad-select"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as "all" | "active" | "inactive")}
        >
          <option value="all">ทุกสถานะ</option>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>

        <div className="ad-toolbar-info">
          พบ <strong>{totalCount}</strong> รายการ
        </div>
      </div>
    )
}