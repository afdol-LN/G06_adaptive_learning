// แบบ: 2026-07-18 (ต้องตรงกับ Backend DateFormat.toBangkokDateString)
// ใช้เวลาไทยเสมอ ไม่ใช่เวลาเครื่อง — server บน Render เป็น UTC ถ้าต่างคนต่างใช้เวลาเครื่อง
// ช่วง 00:00–07:00 น. วันที่จะไม่ตรงกัน แล้ว login ขึ้น "Not found user"
export function formatDateTime(date: Date = new Date()): string {
  // en-CA ให้รูปแบบ YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
