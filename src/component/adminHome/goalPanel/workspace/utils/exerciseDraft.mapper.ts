import { ExerciseFormValues } from "../../../exercisePanel/exercise.controller";
import { toSeconds } from "../../../../../utils/timeUnit";
import { Exercise } from "../../../../../models/exerciseModel";
import { AiDraft, ExerciseDraftPayload } from "../../../../../models/aiDraftModel";

// ฟังก์ชัน pure แปลงข้อมูลระหว่างฟอร์ม exercise / exercise จริง / ร่างจาก AI — ไม่มี state

export function draftSkillId(draft: AiDraft): number {
  return Number((draft.payload as ExerciseDraftPayload).skillId);
}

/** payload เดียวกับที่ exercise.controller สร้าง (ไฟล์นั้นห้ามแก้ จึงเขียนซ้ำไว้ตรงนี้) */
export function toExercisePayload(form: ExerciseFormValues, skillId: number) {
  const base = {
    description: form.description.trim(),
    code: form.code,
    language: form.language,
    skillId,
    skillLevel: form.level,
    type: form.type,
    status: form.status,
    expectTime: toSeconds(form.expectTimeValue, form.expectTimeUnit),
  };
  return form.type === "CHOICE"
    ? {
        ...base,
        choices: form.choices.map((script, index) => ({
          script,
          isAnswer: index === form.correctChoiceIndex,
        })),
      }
    : {
        ...base,
        fillInBlank: form.fillInBlank.trim(),
        isCasesensitive: form.isCasesensitive,
      };
}

/** payload เดียวกับ saveExerciseDraft ใน ai.controller */
export function toDraftPayload(form: ExerciseFormValues, skillId: number): ExerciseDraftPayload {
  const base: ExerciseDraftPayload = {
    description: form.description.trim(),
    skillId,
    skillLevel: form.level,
    type: form.type,
    expectTime: toSeconds(form.expectTimeValue, form.expectTimeUnit),
    ...(form.code.trim() !== "" ? { code: form.code, language: form.language } : {}),
  };
  return form.type === "CHOICE"
    ? {
        ...base,
        choices: form.choices
          .map((script, index) => ({
            script: script.trim(),
            isAnswer: index === form.correctChoiceIndex,
          }))
          .filter((c) => c.script !== ""),
      }
    : {
        ...base,
        fillInBlank: form.fillInBlank.trim(),
        isCasesensitive: form.isCasesensitive,
      };
}

/** แปลงร่างให้อยู่ในรูป Exercise เพื่อเปิดด้วย ExerciseFormModal (แบบเดียวกับ ai.controller) */
export function draftToExercise(draft: AiDraft): Exercise {
  const p = draft.payload as ExerciseDraftPayload;
  return {
    id: draft.id,
    description: p.description,
    level: p.skillLevel,
    status: "active",
    expectTime: p.expectTime ?? 60,
    skillId: p.skillId,
    skillLevel: p.skillLevel,
    type: p.type,
    code: p.code ?? null,
    language: p.language ?? null,
    fillInBlank: p.fillInBlank ?? null,
    isCasesensitive: p.isCasesensitive ?? "NO",
    exerciseChoices: (p.choices || []).map((c, index) => ({
      id: index,
      exerciseId: draft.id,
      script: c.script,
      isAnswer: c.isAnswer,
    })),
  };
}
