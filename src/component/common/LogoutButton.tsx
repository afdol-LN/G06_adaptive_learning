import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { usePreferences } from "../../context/PreferencesContext";

/**
 * ออกจากระบบ — แหล่งเดียวของทั้งแอป (Home, Select Branch, Information, GetStart, Admin)
 *
 * ลบเฉพาะข้อมูลที่ระบุตัวผู้ใช้ ไม่ใช้ localStorage.clear() เพราะจะล้าง lang / theme /
 * homeSidebarCollapsed ที่เป็นค่าของเครื่อง ไม่ใช่ของบัญชี
 * "branches" ต้องลบด้วย ไม่งั้นคนถัดไปที่ login บนเครื่องเดียวกันจะเห็นสายการเรียนของคนก่อน
 */
const SESSION_KEYS = [
  "access_token",
  "accessToken",
  "userRole",
  "user_role",
  "user_id",
  "fullname",
  "userProfile",
  "branches",
  "activeBranchId",
  "branchId",
  "goalId",
];

export function clearSession(): void {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function useLogout(): () => void {
  const navigate = useNavigate();
  return () => {
    clearSession();
    navigate("/");
  };
}

interface LogoutButtonProps {
  /** หน้าตาเป็นของแต่ละหน้า — ส่ง class ของหน้านั้นมา */
  className?: string;
  title?: string;
  /** เนื้อหาแทนค่าเริ่มต้น (ไอคอน + "ออกจากระบบ") เช่น sidebar ของ admin */
  children?: React.ReactNode;
}

export default function LogoutButton({ className, title, children }: LogoutButtonProps) {
  const logout = useLogout();
  const { t } = usePreferences();

  return (
    <button type="button" className={className} onClick={logout} title={title}>
      {children ?? (
        <>
          <FaArrowRightFromBracket aria-hidden />
          <span>{t("menu.logout")}</span>
        </>
      )}
    </button>
  );
}
