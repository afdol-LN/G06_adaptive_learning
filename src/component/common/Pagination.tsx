import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { usePreferences } from "../../context/PreferencesContext";

interface PaginationProps {
  /** หน้าปัจจุบัน เริ่มที่ 1 */
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** ปุ่มก่อนหน้า / ถัดไป + "หน้า x / y" — ซ่อนตัวเองเมื่อมีหน้าเดียว (สไตล์ใน Adminhome.css, prefix ad-pagination) */
export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const { t } = usePreferences();
  if (totalPages <= 1) return null;

  return (
    <nav className="ad-pagination" aria-label={t("admin.common.pagination")}>
      <button
        type="button"
        className="ad-btn-sm ad-btn-view"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label={t("admin.common.prevPage")}
        title={t("admin.common.prevPage")}
      >
        <FaChevronLeft aria-hidden />
      </button>
      <span className="ad-pagination-label">
        {t("admin.common.pageOf", { page, total: totalPages })}
      </span>
      <button
        type="button"
        className="ad-btn-sm ad-btn-view"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label={t("admin.common.nextPage")}
        title={t("admin.common.nextPage")}
      >
        <FaChevronRight aria-hidden />
      </button>
    </nav>
  );
}
