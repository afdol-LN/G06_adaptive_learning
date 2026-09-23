# Shared QuestionCard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two hand-rolled question cards (Pretest, Exercise) with one presentational `QuestionCard` that each screen feeds with max questions, current index, skill name, level, question, choices and a footer.

**Architecture:** A props-only component in `src/component/common/` with its own `qc-`-prefixed stylesheet whose tokens live on `.qc-card` (not `:root`). Each screen keeps its own controller and maps its data into the card's props; footer content is passed in as a node. The backend gains one field, `skillLevel`, on the Exercise screen's question DTO.

**Tech Stack:** React 19 + TypeScript + Vite, react-icons/fa6, highlight.js via existing `CodeBlock`; NestJS 11 + Jest on the backend.

Spec: `docs/superpowers/specs/2026-09-21-shared-question-card-design.md`

## Global Constraints

- Frontend correctness gate is `npx tsc -b` diffed against a baseline taken before any change (build and lint do not type-check; ~148 pre-existing errors).
- Every user-visible string goes through `t(key, vars)` from `usePreferences()`; keys go in `src/i18n/th.ts` **and** `src/i18n/en.ts` (en is typed against th, so a missing key fails `tsc`).
- Icons from `react-icons/fa6` only, decorative ones `aria-hidden`. No emoji.
- A new colour is a token with a light and a dark value. Card tokens are declared on `.qc-card` and `:root[data-theme="dark"] .qc-card`, never on `:root`.
- `font-family: var(--font-sans)` or `inherit`, never a font name; monospace stays `'DM Mono', ui-monospace, monospace`.
- Code shown with a question is rendered only through `CodeBlock`.
- A new question field must be added to both `NextQuestionDto` and `buildQuestionDto`.
- Exercise's `prog-meta` is not touched.
- **No git commits.** Both repos (`G06_adaptive_learning` on `feat/ui-standard`, `adt-learning` on `feat/goal-workspace`) carry unrelated uncommitted work, including `Pretest.css`. Leave everything in the working tree for the repo owner to commit.
- Backend commands run with `NODE_ENV` unset or `development`; nothing here touches a database.

## File Structure

| File | Responsibility |
|---|---|
| `adt-learning/server/app/src/dto/exerciseAndSession/session.dto.ts` | add `skillLevel` to `NextQuestionDto` |
| `adt-learning/server/app/src/service/session.service.ts` | fill `skillLevel` in `buildQuestionDto` |
| `adt-learning/server/app/src/service/session.service.spec.ts` | test that the DTO carries it |
| `G06_adaptive_learning/src/models/sessionModel.ts` | add `skillLevel` to `NextQuestion` |
| `G06_adaptive_learning/src/component/common/QuestionCard.tsx` (new) | header, question, code, choices / fill input, reveal, footer slot |
| `G06_adaptive_learning/src/component/decorate/QuestionCard.css` (new) | card styles + tokens, level colours |
| `G06_adaptive_learning/src/i18n/th.ts`, `en.ts` | `question.*` and `pretest.*` keys |
| `G06_adaptive_learning/src/component/pretest/component/PretestQuiz.tsx` | render `QuestionCard` |
| `G06_adaptive_learning/src/component/Exercise.tsx` | render `QuestionCard` |
| `G06_adaptive_learning/src/component/decorate/Pretest.css` | drop card-only rules, keep fixed card height |
| `G06_adaptive_learning/src/component/decorate/Exercise.css` | drop card-only rules |

---

### Task 1: Backend sends `skillLevel` with each question

**Files:**
- Modify: `adt-learning/server/app/src/dto/exerciseAndSession/session.dto.ts:31-40`
- Modify: `adt-learning/server/app/src/service/session.service.ts:160-175`
- Test: `adt-learning/server/app/src/service/session.service.spec.ts:95-200`

**Interfaces:**
- Produces: `NextQuestionDto.skillLevel: number` on `/session/start` (`question`) and `/session/:id/answer` (`nextQuestion`).

- [ ] **Step 1: Write the failing test**

In `session.service.spec.ts`, inside `describe('sessionService returns the skill-tree Progress with each question', …)`, add `skillLevel: 3` to the `exercise` fixture:

```ts
  const exercise = (id: number) => ({
    id,
    skillId: 1,
    type: ExerciseType.CHOICE,
    description: `q${id}`,
    skillLevel: 3,
    pG: 0.2,
    pS: 0.1,
    expectTime: 30,
    exerciseChoices: [{ id: id * 10, script: 'right', isAnswer: true }],
  });
```

and add this test right after `'startSession reports a never-attempted skill as not started (attemptCount 0)'`:

```ts
  it('startSession sends the question level so the card can show it', async () => {
    branchRepo.findOne.mockResolvedValue({
      id: 1,
      userId: 42,
      conceptMapState: null,
    });

    const res = await service.startSession(42, { branchId: 1, skillId: 1 });

    expect(res.question.skillLevel).toBe(3);
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run (in `adt-learning/server/app`): `npx jest src/service/session.service.spec.ts -t "question level"`
Expected: FAIL — TypeScript error `Property 'skillLevel' does not exist on type 'NextQuestionDto'` (ts-jest) or `expected 3, received undefined`.

- [ ] **Step 3: Implement**

`session.dto.ts`, in `NextQuestionDto` after `type`:

```ts
export interface NextQuestionDto {
  exerciseId: number;
  description: string;
  type: ExerciseType;
  /** ระดับความยากของโจทย์ 1–5 — แสดงบนการ์ดคำถาม */
  skillLevel: number;
  expectTime: number | null;
```

`session.service.ts`, in `buildQuestionDto` after `type`:

```ts
      type: exercise.type,
      skillLevel: exercise.skillLevel,
      expectTime: exercise.expectTime ?? null,
```

- [ ] **Step 4: Run the whole spec file**

Run: `npx jest src/service/session.service.spec.ts`
Expected: all tests PASS (the new one included). Then `npx tsc --noEmit -p tsconfig.json` and confirm no error mentions `session.dto.ts` or `session.service.ts`.

---

### Task 2: `QuestionCard` component, stylesheet and strings

**Files:**
- Create: `G06_adaptive_learning/src/component/common/QuestionCard.tsx`
- Create: `G06_adaptive_learning/src/component/decorate/QuestionCard.css`
- Modify: `G06_adaptive_learning/src/i18n/th.ts` (append before the closing `};`)
- Modify: `G06_adaptive_learning/src/i18n/en.ts` (append before the closing `};`)

**Interfaces:**
- Consumes: `CodeBlock` default export (`{ code?: string | string[] | null; language?: string | null }`), `usePreferences().t`.
- Produces (used by Tasks 3 and 4):

```ts
export interface QuestionCardChoice { key: number; script: string }
export interface QuestionCardReveal { key: number | null; isCorrect: boolean }
export interface QuestionCardProps {
  index: number;
  total: number | null;
  skillName: string;
  level: number;
  type: "CHOICE" | "FILL_IN_BLANK";
  description: string;
  code?: string | string[] | null;
  language?: string | null;
  choices?: QuestionCardChoice[];
  selectedKey: number | null;
  onPick: (key: number) => void;
  fillValue: string;
  onFillChange: (value: string) => void;
  onFillEnter?: () => void;
  locked?: boolean;
  reveal?: QuestionCardReveal | null;
  footer: React.ReactNode;
  tourAttrs?: { question?: string; answer?: string };
}
export default function QuestionCard(props: QuestionCardProps): JSX.Element
```

- [ ] **Step 1: Record the type-check baseline** (before touching any frontend file)

Run (in `G06_adaptive_learning`, Bash):
```bash
npx tsc -b 2>&1 | grep "error TS" | sort > "$TMPDIR/tsc-before.txt"; wc -l "$TMPDIR/tsc-before.txt"
```
Expected: a count around 148. Keep the file for every later check. (Use the session scratchpad directory for `$TMPDIR` if it is unset.)

- [ ] **Step 2: Add the strings**

Append to `th.ts` before `};`:

```ts
  // ── Question card (shared by Pretest and Exercise) ──
  "question.no": "ข้อ",
  "question.level": "Level {level}",
  "question.type.choice": "ตัวเลือก",
  "question.type.fill": "เติมคำ",
  "question.fillLabel": "กรุณาพิมพ์คำตอบลงในช่องว่างด้านล่าง:",
  "question.fillPlaceholder": "พิมพ์คำตอบของคุณที่นี่...",
  "question.correct": "ถูกต้อง",
  "question.incorrect": "ไม่ถูกต้อง",
  // ── Pretest quiz ──
  "pretest.progress": "ความคืบหน้า",
  "pretest.next": "ถัดไป",
  "pretest.submit": "ส่งคำตอบ",
  "pretest.skillFallback": "Skill {id}",
```

Append to `en.ts` before `};`:

```ts
  // ── Question card (shared by Pretest and Exercise) ──
  "question.no": "Question",
  "question.level": "Level {level}",
  "question.type.choice": "Multiple choice",
  "question.type.fill": "Fill in the blank",
  "question.fillLabel": "Type your answer in the box below:",
  "question.fillPlaceholder": "Type your answer here...",
  "question.correct": "Correct",
  "question.incorrect": "Incorrect",
  // ── Pretest quiz ──
  "pretest.progress": "Progress",
  "pretest.next": "Next",
  "pretest.submit": "Submit",
  "pretest.skillFallback": "Skill {id}",
```

- [ ] **Step 3: Create `QuestionCard.tsx`**

```tsx
import React from "react";
import { FaCheck, FaPenToSquare, FaXmark } from "react-icons/fa6";
import CodeBlock from "./CodeBlock";
import { usePreferences } from "../../context/PreferencesContext";
import "../decorate/QuestionCard.css";

export interface QuestionCardChoice {
  key: number;
  script: string;
}

/** ผลตรวจของข้อนี้ — key คือตัวเลือกที่ตอบ (null สำหรับข้อเติมคำ) */
export interface QuestionCardReveal {
  key: number | null;
  isCorrect: boolean;
}

export interface QuestionCardProps {
  /** เริ่มที่ 0 แสดงเป็น index + 1 */
  index: number;
  /** จำนวนข้อสูงสุด — null = ยังไม่รู้ แสดงแค่ "ข้อ n" */
  total: number | null;
  skillName: string;
  /** 1–5 */
  level: number;
  type: "CHOICE" | "FILL_IN_BLANK";
  description: string;
  code?: string | string[] | null;
  language?: string | null;
  choices?: QuestionCardChoice[];
  selectedKey: number | null;
  onPick: (key: number) => void;
  fillValue: string;
  onFillChange: (value: string) => void;
  onFillEnter?: () => void;
  /** คำตอบถูกส่งแล้ว — แก้ไม่ได้ (Exercise เท่านั้น) */
  locked?: boolean;
  reveal?: QuestionCardReveal | null;
  /** ปุ่ม/dot ของแต่ละหน้า */
  footer: React.ReactNode;
  /** data-tour ของ driver.js บนหน้า Exercise */
  tourAttrs?: { question?: string; answer?: string };
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

// สีของป้าย Level มีแค่ 1–5 — ค่าที่หลุดช่วงใช้สีของขอบที่ใกล้ที่สุด แต่ตัวเลขยังแสดงค่าจริง
const levelClass = (level: number) =>
  `qc-level-${Math.min(5, Math.max(1, Math.round(level) || 1))}`;

export default function QuestionCard({
  index,
  total,
  skillName,
  level,
  type,
  description,
  code,
  language,
  choices = [],
  selectedKey,
  onPick,
  fillValue,
  onFillChange,
  onFillEnter,
  locked = false,
  reveal = null,
  footer,
  tourAttrs,
}: QuestionCardProps) {
  const { t } = usePreferences();
  const outcome = reveal ? (reveal.isCorrect ? "ok" : "no") : null;

  return (
    <div className="qc-card">
      <div className="qc-head">
        <div className="qc-head-l">
          <span className="qc-num">
            {t("question.no")} <strong>{index + 1}</strong>
            {total != null && <> / {total}</>}
          </span>
          <span className="qc-skill">{skillName}</span>
        </div>
        <span className={`qc-level ${levelClass(level)}`}>
          {t("question.level", { level })} •{" "}
          {type === "FILL_IN_BLANK" ? t("question.type.fill") : t("question.type.choice")}
        </span>
      </div>

      <div className="qc-body">
        <div className="qc-question" data-tour={tourAttrs?.question}>
          {description}
        </div>

        <CodeBlock code={code} language={language} />

        {type === "CHOICE" ? (
          <div
            className={locked ? "qc-choices qc-choices--locked" : "qc-choices"}
            data-tour={tourAttrs?.answer}
          >
            {choices.map((choice, i) => {
              const revealed = outcome && reveal?.key === choice.key ? outcome : null;
              const state = revealed
                ? ` qc-choice--${revealed}`
                : selectedKey === choice.key
                  ? " qc-choice--selected"
                  : "";
              return (
                <button
                  type="button"
                  key={choice.key}
                  className={`qc-choice${state}`}
                  onClick={() => onPick(choice.key)}
                  disabled={locked}
                  aria-pressed={selectedKey === choice.key}
                >
                  <span className="qc-letter">{LETTERS[i] ?? i + 1}</span>
                  <span className="qc-choice-text">{choice.script}</span>
                  {revealed && (
                    <span
                      className="qc-mark"
                      title={revealed === "ok" ? t("question.correct") : t("question.incorrect")}
                    >
                      {revealed === "ok" ? <FaCheck aria-hidden /> : <FaXmark aria-hidden />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="qc-fill" data-tour={tourAttrs?.answer}>
            <label className="qc-fill-label" htmlFor="qc-fill-input">
              <FaPenToSquare aria-hidden /> {t("question.fillLabel")}
            </label>
            <input
              id="qc-fill-input"
              type="text"
              className={outcome ? `qc-fill-input qc-fill--${outcome}` : "qc-fill-input"}
              placeholder={t("question.fillPlaceholder")}
              value={fillValue}
              onChange={(e) => onFillChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && onFillEnter) onFillEnter();
              }}
              disabled={locked}
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="qc-foot">{footer}</div>
    </div>
  );
}
```

- [ ] **Step 4: Create `QuestionCard.css`**

```css
/* ══════════════════════════════════════
   QuestionCard.css — การ์ดคำถามที่ใช้ร่วมกันระหว่าง Pretest และ Exercise
   token ประกาศบน .qc-card ไม่ใช่ :root (เหตุผลเดียวกับ .ctp-code ของ CodeBlock):
   Exercise.css / Pretest.css ต่างประกาศ :root ของตัวเองด้วยชื่อ token ต่างกัน
   ถ้าอ้างของพวกนั้น สีจะเปลี่ยนตามไฟล์ที่โหลดทีหลัง
══════════════════════════════════════ */

.qc-card {
  --qc-surface:     #ffffff;
  --qc-surface-2:   #f8fafc;
  --qc-border:      #c2d3e0;
  --qc-border-soft: #e2e8f0;
  --qc-text:        #000080;
  --qc-ink:         #334155;
  --qc-muted:       #475569;
  --qc-accent:      #0047AB;
  --qc-accent-fill: #0047AB;
  --qc-on-accent:   #ffffff;
  --qc-tint:        #e8f0fe;
  --qc-ok:          #059669;
  --qc-ok-bg:       #ecfdf5;
  --qc-no:          #dc2626;
  --qc-no-bg:       #fef2f2;

  --qc-l1-ink: #059669; --qc-l1-bg: #ecfdf5; --qc-l1-bd: #a7f3d0;
  --qc-l2-ink: #4d7c0f; --qc-l2-bg: #f7fee7; --qc-l2-bd: #d9f99d;
  --qc-l3-ink: #0047AB; --qc-l3-bg: #e8f0fe; --qc-l3-bd: #bfd3f5;
  --qc-l4-ink: #b45309; --qc-l4-bg: #fffbeb; --qc-l4-bd: #fde68a;
  --qc-l5-ink: #dc2626; --qc-l5-bg: #fef2f2; --qc-l5-bd: #fecaca;

  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  background: var(--qc-surface);
  border: 1px solid var(--qc-border);
  border-radius: 12px;
  overflow: hidden;
  font-family: var(--font-sans);
  color: var(--qc-ink);
  animation: qcSlideIn .35s cubic-bezier(.16, 1, .3, 1);
}

:root[data-theme="dark"] .qc-card {
  --qc-surface:     #121b2e;
  --qc-surface-2:   #172238;
  --qc-border:      #26344f;
  --qc-border-soft: #1f2b42;
  --qc-text:        #ffffff;
  --qc-ink:         #ffffff;
  --qc-muted:       #a3b1cc;
  --qc-accent:      #6b9bff;
  --qc-accent-fill: #2f5fd0;
  --qc-on-accent:   #ffffff;
  --qc-tint:        #1a2a4a;
  --qc-ok:          #34d399;
  --qc-ok-bg:       rgba(52, 211, 153, .12);
  --qc-no:          #f87171;
  --qc-no-bg:       rgba(248, 113, 113, .12);

  --qc-l1-ink: #34d399; --qc-l1-bg: rgba(52, 211, 153, .12);  --qc-l1-bd: rgba(52, 211, 153, .35);
  --qc-l2-ink: #a3e635; --qc-l2-bg: rgba(163, 230, 53, .12);  --qc-l2-bd: rgba(163, 230, 53, .35);
  --qc-l3-ink: #6b9bff; --qc-l3-bg: rgba(107, 155, 255, .14); --qc-l3-bd: rgba(107, 155, 255, .4);
  --qc-l4-ink: #fbbf24; --qc-l4-bg: rgba(251, 191, 36, .12);  --qc-l4-bd: rgba(251, 191, 36, .35);
  --qc-l5-ink: #f87171; --qc-l5-bg: rgba(248, 113, 113, .12); --qc-l5-bd: rgba(248, 113, 113, .35);
}

.qc-card *, .qc-card *::before, .qc-card *::after { box-sizing: border-box; }
.qc-card svg { flex-shrink: 0; }

/* ── Header ── */
.qc-head {
  flex-shrink: 0;
  padding: 16px 24px;
  background: var(--qc-surface-2);
  border-bottom: 1px solid var(--qc-border-soft);
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
}
.qc-head-l { display: flex; align-items: center; gap: 10px; min-width: 0; }
.qc-num { font-size: 13px; font-weight: 600; color: var(--qc-muted); white-space: nowrap; }
.qc-num strong { color: var(--qc-accent); }
.qc-skill {
  font-size: 13px; padding: 4px 12px;
  background: var(--qc-surface); border: 1px solid var(--qc-border);
  border-radius: 9999px; color: var(--qc-muted);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.qc-level { font-size: 13px; padding: 4px 12px; border-radius: 9999px; border: 1px solid; white-space: nowrap; }
.qc-level-1 { color: var(--qc-l1-ink); background: var(--qc-l1-bg); border-color: var(--qc-l1-bd); }
.qc-level-2 { color: var(--qc-l2-ink); background: var(--qc-l2-bg); border-color: var(--qc-l2-bd); }
.qc-level-3 { color: var(--qc-l3-ink); background: var(--qc-l3-bg); border-color: var(--qc-l3-bd); }
.qc-level-4 { color: var(--qc-l4-ink); background: var(--qc-l4-bg); border-color: var(--qc-l4-bd); }
.qc-level-5 { color: var(--qc-l5-ink); background: var(--qc-l5-bg); border-color: var(--qc-l5-bd); }

/* ── Body ── */
.qc-body { flex: 1; overflow-y: auto; padding: 24px; background: var(--qc-surface); }
.qc-question {
  font-size: 18px; line-height: 1.6; font-weight: 600; color: var(--qc-text);
  background: var(--qc-surface-2); border: 1px solid var(--qc-border); border-radius: 8px;
  padding: 20px; margin-bottom: 24px; text-align: center;
}

/* ── Choices ── */
.qc-choices { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
.qc-choice {
  display: flex; align-items: center; gap: 12px; width: 100%;
  padding: 14px 16px; margin: 0; text-align: left;
  font: inherit; color: inherit;
  background: var(--qc-surface); border: 1px solid var(--qc-border); border-radius: 8px;
  cursor: pointer; user-select: none;
  transition: border-color .2s, background .2s;
}
.qc-choice:hover:not(:disabled) { border-color: var(--qc-accent); background: var(--qc-surface-2); }
.qc-choice:focus-visible { outline: 2px solid var(--qc-accent); outline-offset: 2px; }
.qc-choice:disabled { cursor: default; }
.qc-choice--selected { border-color: var(--qc-accent); background: var(--qc-tint); }
.qc-choice--ok { border-color: var(--qc-ok); background: var(--qc-ok-bg); }
.qc-choice--no { border-color: var(--qc-no); background: var(--qc-no-bg); }
.qc-letter {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600;
  background: var(--qc-surface-2); border: 1px solid var(--qc-border); color: var(--qc-muted);
  transition: background .2s, border-color .2s, color .2s;
}
.qc-choice--selected .qc-letter { background: var(--qc-accent-fill); border-color: var(--qc-accent-fill); color: var(--qc-on-accent); }
.qc-choice--ok .qc-letter { background: var(--qc-ok); border-color: var(--qc-ok); color: var(--qc-on-accent); }
.qc-choice--no .qc-letter { background: var(--qc-no); border-color: var(--qc-no); color: var(--qc-on-accent); }
.qc-choice-text { flex: 1; font-size: 15px; line-height: 1.5; color: var(--qc-ink); }
.qc-mark { display: inline-flex; font-size: 16px; }
.qc-choice--ok .qc-mark { color: var(--qc-ok); }
.qc-choice--no .qc-mark { color: var(--qc-no); }

/* ── Fill in the blank ── */
.qc-fill { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
.qc-fill-label {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 15px; font-weight: 600; color: var(--qc-muted);
}
.qc-fill-input {
  width: 100%; padding: 14px 16px;
  background: var(--qc-surface); border: 1px solid var(--qc-border); border-radius: 8px;
  color: var(--qc-ink); font-family: var(--font-sans); font-size: 16px;
  outline: none; transition: border-color .2s, box-shadow .2s;
}
.qc-fill-input::placeholder { color: var(--qc-muted); font-size: 15px; }
.qc-fill-input:focus { border-color: var(--qc-accent); box-shadow: 0 0 0 3px var(--qc-tint); }
.qc-fill-input:disabled { cursor: default; }
.qc-fill--ok { border-color: var(--qc-ok); box-shadow: 0 0 0 3px var(--qc-ok-bg); }
.qc-fill--no { border-color: var(--qc-no); box-shadow: 0 0 0 3px var(--qc-no-bg); }

/* ── Footer (เนื้อหามาจากแต่ละหน้า) ── */
.qc-foot {
  flex-shrink: 0;
  padding: 16px 24px;
  border-top: 1px solid var(--qc-border-soft);
  background: var(--qc-surface-2);
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
}

@keyframes qcSlideIn { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: none; } }

@media (max-width: 520px) {
  .qc-head, .qc-body, .qc-foot { padding-left: 16px; padding-right: 16px; }
  .qc-question { font-size: 16px; }
}
```

- [ ] **Step 5: Type-check against the baseline**

Run (in `G06_adaptive_learning`, Bash):
```bash
npx tsc -b 2>&1 | grep "error TS" | sort > "$TMPDIR/tsc-after.txt"; comm -13 "$TMPDIR/tsc-before.txt" "$TMPDIR/tsc-after.txt"
```
Expected: no output (no new errors). Any line mentioning `QuestionCard.tsx`, `th.ts` or `en.ts` must be fixed before moving on.

---

### Task 3: Pretest renders `QuestionCard`

**Files:**
- Modify: `G06_adaptive_learning/src/component/pretest/component/PretestQuiz.tsx` (whole file)
- Modify: `G06_adaptive_learning/src/component/decorate/Pretest.css:142-227, 290-302, 326-330`

**Interfaces:**
- Consumes: `QuestionCard` + `QuestionCardProps` from Task 2; `PretestControllerType` fields `currentQuestion`, `currentQuestionIndex`, `questions`, `answers`, `progressPercentage`, `selectChoiceAnswer(i: number)`, `fillInBlankInput`, `handleFillInBlankInputChange(v: string)`, `handleNextQuestion()`.

- [ ] **Step 1: Replace `PretestQuiz.tsx`**

```tsx
import React from "react";
import { FaArrowRight } from "react-icons/fa6";
import { PretestControllerType } from "../controller/usePretestController";
import QuestionCard from "../../common/QuestionCard";
import { usePreferences } from "../../../context/PreferencesContext";

interface PretestQuizProps {
  controller: PretestControllerType;
}

export const PretestQuiz: React.FC<PretestQuizProps> = ({ controller }) => {
  const { t } = usePreferences();
  const currentQuestion = controller.currentQuestion;
  const index = controller.currentQuestionIndex;
  const isLast = index === controller.questions.length - 1;
  const answer = controller.answers[index];

  return (
    <div
      id="screenQuiz"
      className="screen-active"
      style={{ width: "100%", maxWidth: "660px" }}
    >
      {/* Progress Track */}
      <div className="quiz-progress-wrap">
        <div className="quiz-progress-top">
          <span className="quiz-progress-label">{t("pretest.progress")}</span>
          <span className="quiz-progress-pct">{controller.progressPercentage}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${controller.progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <QuestionCard
        key={index}
        index={index}
        total={controller.questions.length}
        skillName={
          currentQuestion.skillName || t("pretest.skillFallback", { id: currentQuestion.skillId })
        }
        level={currentQuestion.level || currentQuestion.diff || 1}
        type={currentQuestion.type}
        description={currentQuestion.description || currentQuestion.text || ""}
        code={currentQuestion.code}
        language={currentQuestion.language}
        choices={(currentQuestion.choices || []).map((script, i) => ({ key: i, script }))}
        selectedKey={typeof answer === "number" ? answer : null}
        onPick={controller.selectChoiceAnswer}
        fillValue={controller.fillInBlankInput}
        onFillChange={controller.handleFillInBlankInputChange}
        onFillEnter={controller.handleNextQuestion}
        footer={
          <>
            <div className="dot-indicators">
              {controller.questions.map((_, i) => {
                const a = controller.answers[i];
                const hasAnswered = a !== null && a !== undefined && a !== "";
                return (
                  <div
                    key={i}
                    className={`dot-ind ${i === index ? "current" : hasAnswered ? "answered" : ""}`}
                  ></div>
                );
              })}
            </div>
            <button
              className={isLast ? "btn-next submit-btn" : "btn-next"}
              onClick={controller.handleNextQuestion}
            >
              <span>{isLast ? t("pretest.submit") : t("pretest.next")}</span>
              {!isLast && <FaArrowRight className="next-arrow" aria-hidden />}
            </button>
          </>
        }
      />
    </div>
  );
};
```

- [ ] **Step 2: Trim `Pretest.css`**

Delete these rule blocks (all are `.pt-root`-scoped, so nothing outside the Pretest page can depend on them):
- lines 142–199: the `/* ── การ์ดคำถาม … */` comment through `.pt-root .choice-text code { … }` (`.q-card`, `.q-header`, `.q-num-badge`, `.q-num`, `.q-skill-tag`, `.q-diff-tag`, `.q-body` + scrollbar rules, `.q-card .q-text`, `.q-card .q-text code`, `.choices`, `.choice*`)
- lines 201–208: `.pt-root .q-footer { … }` and `.pt-root .q-footer-left { … }`
- lines 290–302: `/* ── ช่องเติมคำ ── */` through `.pt-root .fill-blank-input::placeholder { … }`
- in the `@media (max-width: 520px)` block: the `.pt-root .q-card { height: 580px; }` line and the `.pt-root .q-header, .pt-root .q-body, .pt-root .q-footer { … }` line

Keep `.dot-indicators`, `.dot-ind*`, `.btn-next*`, `.next-arrow`, and keep the `ptQSlideIn` keyframe only if something else still references it (grep `ptQSlideIn`; delete the keyframe if nothing does).

Add in place of the deleted card block (keeps every pretest question the same height, as before):

```css
/* ── การ์ดคำถาม (QuestionCard.css) — สูงคงที่ ทุกข้อจึงขนาดเท่ากัน ── */
.pt-root .qc-card { height: 620px; }
```

and inside `@media (max-width: 520px)`:

```css
  .pt-root .qc-card { height: 580px; }
```

- [ ] **Step 3: Confirm nothing else used the removed Pretest classes**

Run (in `G06_adaptive_learning/src`, Bash):
```bash
grep -rn "q-card\|q-header\|q-num\|q-skill-tag\|q-diff-tag\|choice-letter\|choice-text\|q-footer\|fill-blank-container\|fill-blank-label" --include=*.tsx .
```
Expected: no output. (`SessionCard.tsx` uses `q-body`/`q-text` but is styled by its own stylesheet, not by the removed `.pt-root` rules.)

- [ ] **Step 4: Type-check against the baseline**

```bash
npx tsc -b 2>&1 | grep "error TS" | sort > "$TMPDIR/tsc-after.txt"; comm -13 "$TMPDIR/tsc-before.txt" "$TMPDIR/tsc-after.txt"
```
Expected: no output.

---

### Task 4: Exercise renders `QuestionCard`

**Files:**
- Modify: `G06_adaptive_learning/src/models/sessionModel.ts:10-18`
- Modify: `G06_adaptive_learning/src/component/Exercise.tsx:1-25, 128-192`
- Modify: `G06_adaptive_learning/src/component/decorate/Exercise.css:147-190, 200-207, 305-311, 328-336`

**Interfaces:**
- Consumes: `QuestionCard` from Task 2; `NextQuestion.skillLevel` (backend field from Task 1); controller fields `question`, `questionIndex`, `questionLimit`, `skillsName`, `selected`, `pick(id: number)`, `fillInBlankInput`, `setFillInBlankInput(v: string)`, `locked`, `checking`, `submit()`, `result: AnswerResult | null`.

- [ ] **Step 1: Add the field to the model**

`sessionModel.ts`:

```ts
export interface NextQuestion {
  exerciseId: number;
  description: string;
  type: ExerciseQuestionType;
  /** 1–5, shown on the question card */
  skillLevel: number;
  expectTime: number | null;
  code?: string | null;
  language?: string | null;
  choices?: QuestionChoice[];
}
```

- [ ] **Step 2: Swap the card markup in `Exercise.tsx`**

Replace `import CodeBlock from './common/CodeBlock';` with:

```tsx
import QuestionCard from './common/QuestionCard';
```

Replace the whole `<div className="stage"> … </div>` block (currently lines 128–192) with:

```tsx
        <div className="stage">
          <QuestionCard
            key={question.exerciseId}
            index={controller.questionIndex}
            total={controller.questionLimit}
            skillName={controller.skillsName}
            level={question.skillLevel}
            type={question.type}
            description={question.description}
            code={question.code}
            language={question.language}
            choices={(question.choices || []).map((c) => ({ key: c.id, script: c.script }))}
            selectedKey={controller.selected}
            onPick={controller.pick}
            fillValue={controller.fillInBlankInput}
            onFillChange={controller.setFillInBlankInput}
            locked={controller.locked}
            reveal={revealed ? { key: revealed.choiceId, isCorrect: revealed.isCorrect } : null}
            tourAttrs={{ question: 'ex-question', answer: 'ex-answer' }}
            footer={
              <button
                className={controller.checking ? 'btn-next checking' : 'btn-next'}
                data-tour="ex-submit"
                onClick={controller.submit}
                disabled={controller.locked || !canSubmit}
                aria-busy={controller.checking}
              >
                {controller.checking ? (
                  <>
                    <FaSpinner className="spin" aria-hidden />
                    <span>{t('exercise.checking')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('exercise.submit')}</span>
                    <FaArrowRight aria-hidden />
                  </>
                )}
              </button>
            }
          />
        </div>
```

The `outcomeClass` const is now unused — delete the line
`const outcomeClass = revealed ? (revealed.isCorrect ? 'rev-ok' : 'rev-no') : '';`
Leave `revealed`, `canSubmit`, the flash, and `FaCheck`/`FaXmark` imports (the flash still uses them).

The loading branch at the top (`<div className="qcard">{t('exercise.loading')}</div>`) uses `.qcard`; change it to keep its box after the CSS cleanup:

```tsx
            <div className="qc-card ex-loading-card">{t('exercise.loading')}</div>
```

- [ ] **Step 3: Trim `Exercise.css`**

First check which classes are still referenced anywhere:

```bash
grep -rn "qcard\|card-ribbon\|card-body\|card-foot\|q-question\|\"choices\|'choices\|\bopt\b\|opt-text\|opt-ck\|opt-letter\|fill-blank-input" --include=*.tsx src
```

Expected after Step 2: no hits in `Exercise.tsx`. For every selector below that has no remaining `.tsx` hit, delete its rule:
- `.qcard{…}` and `@keyframes cardSlide`
- `.card-ribbon{…}`
- `.card-body{…}`, `.q-question{…}`, `.q-question code{…}`
- `.choices{…}`, all `.opt…{…}` rules, `@keyframes okPulse`
- `.card-foot{…}`
- `.choices.locked .opt{…}`, `.choices.locked .opt:hover{…}`, `.opt-ck{display:inline-flex}`
- the four `.wrap .fill-blank-input…{…}` rules
- in `@media(max-width:600px)`: remove `.card-body,.card-foot` from the `.card-head,.card-body,.card-foot{…}` selector (keep `.card-head` only if it is still referenced; otherwise remove the line) and remove `.q-question{font-size:16px}`

**Caution:** `.choices` and `.opt` in `Exercise.css` are unscoped globals. Before deleting, run
`grep -rn "className=\"choices\|className=\"opt\|'choices'\|'opt'" --include=*.tsx src`
and keep any rule another screen still renders.

Keep `.btn-next…`, `.btn-next.checking:disabled`, `.btn-next .spin`, `@keyframes exSpin`, `.stage`.

Add, next to `.stage`:

```css
/* การ์ดตอนกำลังโหลด — ใช้กรอบของ QuestionCard */
.ex-loading-card{padding:32px;text-align:center}
```

- [ ] **Step 4: Type-check against the baseline**

```bash
npx tsc -b 2>&1 | grep "error TS" | sort > "$TMPDIR/tsc-after.txt"; comm -13 "$TMPDIR/tsc-before.txt" "$TMPDIR/tsc-after.txt"
```
Expected: no output. If a pre-existing `Exercise.tsx` error line changed text only because of shifted line numbers, it shows up here — compare by message, not line number.

---

### Task 5: Verify both screens in the browser

**Files:** none modified (fix-ups go back into the task that owns the file).

- [ ] **Step 1: Start the backend and frontend**

Backend (in `adt-learning/server/app`): `npm run start:dev` with `NODE_ENV` unset/`development`.
Frontend: `preview_start` with the dev-server entry from `.claude/launch.json` (create one for `npm run dev` in `G06_adaptive_learning` if missing).

- [ ] **Step 2: Pretest**

Log in as a student with an unfinished pretest and open `/pretest`. Check with `read_page` / screenshots:
- header shows `ข้อ 1 / N`, the skill name, and `Level x • ตัวเลือก` in the level's colour (different levels show different colours)
- choices lettered A–D; clicking one selects it; Next advances; dot indicators update
- a FILL_IN_BLANK question shows the label + input, and Enter advances
- a question with code shows the Catppuccin `CodeBlock`
- last question shows the green Submit button; results screen still appears
- card height is the same for every question

- [ ] **Step 3: Exercise**

From the skill tree, start a practice session. Check:
- header shows `ข้อ n / questionLimit`, the skill name, and the level from the API (`read_network_requests` on `/session/start` shows `question.skillLevel`)
- pick → Submit → spinner → the picked choice turns green with ✓ or red with ✗, choices are disabled, then the next question loads
- FILL_IN_BLANK: the input turns green/red after submit and is disabled while locked
- the tour (Tour button) still highlights the question and the answer area (`ex-question`, `ex-answer`) and the Submit button (`ex-submit`)
- no console errors (`read_console_messages`)

- [ ] **Step 4: Dark theme and narrow width**

Toggle the theme switch to dark on both screens: card background, text, level badge, selected/correct/incorrect states all readable (no light-only colours). `resize_window` to `mobile`: no horizontal scroll, header wraps cleanly. Reset with `preset: "desktop"`.

- [ ] **Step 5: Report**

Share screenshots of Pretest (light), Exercise after a reveal (light), and one dark-theme view. List any pre-existing issue noticed but not fixed. Do not commit.
