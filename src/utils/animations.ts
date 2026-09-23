// ลิงก์ animation (LottieFiles embed) ทั้งหมดของแอปเก็บไว้ที่นี่ที่เดียว — เปลี่ยน/เพิ่ม animation แก้แค่ไฟล์นี้
//
// ทุกตัวเป็นหน้า embed ของ lottie.host ที่เปิดใน <iframe> (ดูตัวอย่างใน Exercise.tsx):
// - อยู่คนละ origin กับแอป สคริปต์ของ player จึงแตะ localStorage / access_token ของเราไม่ได้
// - พื้นหลังโปร่งใส ใช้ได้ทั้งธีมสว่าง/มืด (ใส่ color-scheme: normal ที่ iframe ด้วย)
// - โหลดจาก lottie.host + jsDelivr ตอน runtime — ถ้าเข้าไม่ถึง จะเห็นช่องว่าง ไม่ใช่ error
// วิธีเพิ่ม: บน lottiefiles.com กด Share → Embed แล้วคัดลอก src ของ <iframe> มาใส่
export const ANIMATIONS = {
  /** confetti เต็มจอ ซ้อนบนป๊อปอัปตอนจบ session exercise */
  sessionEnd: "https://lottie.host/embed/ff2c1939-e0ce-4d3e-8f4d-0e618c989ee1/3zqKWIYUR4.lottie",
  /** ถ้วยในหัวป๊อปอัปตอนจบ session ที่ถึง 100% (mastered) — แทน FaTrophy */
  trophy: "https://lottie.host/embed/8657589a-244e-4fa3-9afc-55751e7a859f/dcOgJ72oS2.lottie",
} as const;
