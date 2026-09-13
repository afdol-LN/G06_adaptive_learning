import React from "react";
import PreferenceControls from "./PreferenceControls";
import "../decorate/Topbar.css";

interface TopbarProps {
  title: string;
}

// แถบบนที่ใช้ร่วมกันทุกหน้า (ยกเว้นหน้า login) — ชื่อหน้า + ปุ่มสลับภาษา + สวิตช์ธีม
// วางไว้ในคอลัมน์เนื้อหาข้าง sidebar ของแต่ละหน้า จึงไม่ทับ sidebar
// ตัวปุ่มภาษา/ธีมอยู่ใน PreferenceControls ซึ่งหน้า login ใช้ร่วมด้วย
export const Topbar: React.FC<TopbarProps> = ({ title }) => (
  <header className="tb-bar">
    <h1 className="tb-title">{title}</h1>
    <PreferenceControls data-tour="tour-topbar-prefs" />
  </header>
);
export default Topbar;
