import React from "react";
import PreferenceControls from "./PreferenceControls";
import "../decorate/Topbar.css";

interface TopbarProps {
  title: string;
  /** เนื้อหาเสริมที่ render ต่อจาก title ฝั่งซ้าย (เช่น GoalSwitcher)
   *  หน้าที่ไม่ต้องการ extra ไม่ต้องส่ง prop นี้ พฤติกรรมเดิมไม่เปลี่ยน */
  extra?: React.ReactNode;
}

// แถบบนที่ใช้ร่วมกันทุกหน้า (ยกเว้นหน้า login) — ชื่อหน้า + ปุ่มสลับภาษา + สวิตช์ธีม
// วางไว้ในคอลัมน์เนื้อหาข้าง sidebar ของแต่ละหน้า จึงไม่ทับ sidebar
// ตัวปุ่มภาษา/ธีมอยู่ใน PreferenceControls ซึ่งหน้า login ใช้ร่วมด้วย
export const Topbar: React.FC<TopbarProps> = ({ title, extra }) => (
  <header className="tb-bar">
    <div className="tb-left">
      <h1 className="tb-title">{title}</h1>
      {extra && <div className="tb-extra">{extra}</div>}
    </div>
    <PreferenceControls data-tour="tour-topbar-prefs" />
  </header>
);
export default Topbar;
