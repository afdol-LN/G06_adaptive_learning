import { useState } from "react";

/**
 * สลับแท็บ Goal ระหว่างรายการกับ Goal Workspace
 * แยกจาก goal.controller.ts (ที่ดูแลรายการ/ฟอร์ม goal) เพื่อไม่แตะ logic เดิมของไฟล์นั้น
 */
export function goalTabController() {
  const [workspaceGoalId, setWorkspaceGoalId] = useState<number | null>(null);
  // เพิ่มค่าตอนกลับจาก workspace เพื่อ mount รายการใหม่ — publish อาจเปลี่ยนสถานะ goal ไปแล้ว
  const [listVersion, setListVersion] = useState<number>(0);

  const openWorkspace = (goalId: number) => setWorkspaceGoalId(goalId);

  const closeWorkspace = () => {
    setWorkspaceGoalId(null);
    setListVersion((v) => v + 1);
  };

  return {
    workspaceGoalId,
    listVersion,
    openWorkspace,
    closeWorkspace,
  };
}
