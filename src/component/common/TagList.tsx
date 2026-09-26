interface TagListProps {
  names: string[];
  /** แสดงกี่ป้ายก่อนยุบที่เหลือเป็น "+N" */
  max?: number;
}

/** ป้ายชื่อในตาราง admin — ขึ้นบรรทัดใหม่แทนเลื่อนแนวนอน, เกิน max ยุบเป็น "+N" (hover ดูรายชื่อเต็ม) */
export function TagList({ names, max = 3 }: TagListProps) {
  if (names.length === 0) return <span className="ad-muted">—</span>;

  const shown = names.slice(0, max);
  const hidden = names.slice(max);

  return (
    <div className="ad-tag-list" title={names.join(", ")}>
      {shown.map((name, i) => (
        <span key={`${name}-${i}`} className="ad-req-tag">{name}</span>
      ))}
      {hidden.length > 0 && <span className="ad-req-tag ad-tag-more">+{hidden.length}</span>}
    </div>
  );
}
