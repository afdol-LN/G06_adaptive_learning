const PREVIEW_LENGTH = 60;

/** ตัดข้อความยาวให้พอดีแถวรายการ */
export function truncate(text: string, max: number = PREVIEW_LENGTH): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
