import { Exercise } from "../../../../models/exerciseModel";
import { AiDraft } from "../../../../models/aiDraftModel";

/** dialog ยืนยัน 1 ครั้ง — onConfirm ทำงานจริงหลังผู้ใช้กดยืนยัน */
export interface ConfirmState {
  title: string;
  message: string;
  items?: string[];
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}

/** ปุ่ม "เพิ่ม skill" ที่เปิด modal สร้าง skill — header หรือแผงของ goal */
export type SkillFormSource = "header" | "goal";

export interface PublishMessage {
  kind: "ok" | "error";
  text: string;
}

export interface ExerciseFormState {
  open: boolean;
  editing: Exercise | null;
  /** มีค่าเมื่อกำลังแก้ร่างจาก AI — บันทึกกลับไปที่ aiDraft ไม่ใช่ exercise */
  draft: AiDraft | null;
}
