import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * สลับแท็บ Goal ระหว่างรายการกับ Goal Workspace
 * แยกจาก goal.controller.ts (ที่ดูแลรายการ/ฟอร์ม goal) เพื่อไม่แตะ logic เดิมของไฟล์นั้น
 *
 * workspace ที่เปิดอยู่มาจาก URL: /admin/goals = รายการ, /admin/goals/:goalId = workspace
 */
export function goalTabController() {
  const navigate = useNavigate();
  const { tab, goalId: goalIdParam } = useParams<{ tab: string; goalId?: string }>();
  const parsedGoalId = goalIdParam !== undefined ? Number(goalIdParam) : null;
  const isValidGoalId = parsedGoalId === null || (Number.isInteger(parsedGoalId) && parsedGoalId > 0);

  // แท็บถูกซ่อนไว้ (display: none) ไม่ใช่ unmount — ตอนอยู่แท็บอื่น URL ไม่มี goalId
  // จึงอัปเดตตาม URL เฉพาะตอนแท็บ goals เปิดอยู่ ไม่งั้น workspace จะถูกปิดทิ้งตอนสลับแท็บ
  const [workspaceGoalId, setWorkspaceGoalId] = useState<number | null>(
    tab === "goals" && isValidGoalId ? parsedGoalId : null,
  );
  // เพิ่มค่าตอนกลับจาก workspace เพื่อ mount รายการใหม่ — publish อาจเปลี่ยนสถานะ goal ไปแล้ว
  const [listVersion, setListVersion] = useState<number>(0);

  useEffect(() => {
    if (tab !== "goals") return;
    // goalId ที่ไม่ใช่ตัวเลข (เช่น /admin/goals/abc) → กลับไปรายการ
    if (!isValidGoalId) {
      navigate("/admin/goals", { replace: true });
      return;
    }
    if (parsedGoalId === workspaceGoalId) return;
    if (parsedGoalId === null) setListVersion((v) => v + 1);
    setWorkspaceGoalId(parsedGoalId);
  }, [tab, parsedGoalId, isValidGoalId]);

  const openWorkspace = (goalId: number) => navigate(`/admin/goals/${goalId}`);

  const closeWorkspace = () => navigate("/admin/goals");

  return {
    workspaceGoalId,
    listVersion,
    openWorkspace,
    closeWorkspace,
  };
}
