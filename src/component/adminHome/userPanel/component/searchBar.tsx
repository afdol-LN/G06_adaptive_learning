interface SearchBarProps {
  userSearch: string;
  error?: string | null;
  isLoading?: boolean;
  onChange: (value: string) => void;
  totalCount: number;
}

export default function SearchBar({
    userSearch, error, isLoading, onChange, totalCount
}: SearchBarProps){
    return(
        <div className="ad-toolbar">
        <div className="ad-search-wrap">
          <span className="ad-search-icon">🔍</span>
          <input
            className="ad-search"
            placeholder="ค้นหาชื่อ, คณะ, คณะ, สาขา ..."
            value={userSearch}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <div className="ad-toolbar-info">
          พบ <strong>{totalCount}</strong> รายการ
        </div>
      </div>
    )
}