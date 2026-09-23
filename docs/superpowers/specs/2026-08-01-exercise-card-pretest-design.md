# ExerciseCard extraction + pretest goal-scoping fix

Date: 2026-08-01
Repo: `G06_adaptive_learning` (branch `seperate_component`)

## Problem

1. The pretest quiz UI (question card, choices, fill-in-blank input, Next/Submit
   button) is hand-rolled directly inside `PretestQuiz.tsx`. There is no reusable
   "exercise card" component, even though the same card UI will be needed for the
   real (non-pretest) exercise flow later.
2. Pretest never shows whether an answer was correct until the very end
   (`PretestDone`). It should reveal correct/incorrect immediately after the user
   presses Next/Submit for that question.
3. Nothing in the current design accounts for the same question being asked again
   within one pretest session (e.g. a question repeated for review) — per-question
   UI state must not leak across repeats.
4. Pretest silently ignores the student's selected goal: it sends the **branch
   ID** to the backend labeled as `goalId`, so the backend's goal→skill exercise
   filter never engages and falls back to "all active exercises".

## Root cause of issue 4

- `usePretestController.ts` resolves `activeGoalId` from
  `localStorage.getItem("activeBranchId")` and passes it to
  `PretestService.fetchPretestQuestions` as `goalId`.
- The backend (`exercise.controller.ts` → `exercise.service.ts:findPretestByGoal`)
  is already correctly implemented: it resolves `goalId` → `GoalSkillRequire` rows
  → `skillIds` → filters `Exercise` by skill. It just never receives a real goal
  ID.
- The real goal ID already exists, unused, on `useApp().activeBranch.goalId`
  (populated both when a branch is created via onboarding and when branches are
  fetched from the server via `fetchMyBranches`).

## Design

### 1. Goal-scoping fix

In `usePretestController.ts`, replace the `activeGoalId` resolution:

```ts
const { activeBranch } = useApp();
...
const activeGoalId =
  activeBranch?.goalId ||
  localStorage.getItem("activeBranchId") ||
  localStorage.getItem("goalId") ||
  localStorage.getItem("branchId");
```

`activeBranch.goalId` becomes the primary source; the localStorage chain remains
only as a defensive fallback for the (unexpected) case where `activeBranch` isn't
hydrated yet. No backend changes are required — `findPretestByGoal` is already
correct once it receives a real goal ID.

### 2. `ExerciseCard` component

**New files:**
- `src/component/exercise/ExerciseCard.tsx`
- `src/component/decorate/ExerciseCard.css`

Placed as a sibling of `pretest/`, not nested inside it, since it's intended for
reuse by the real (non-pretest) exercise flow later. It reuses the existing
`PretestQuestion` / `PretestChoice` / `PretestAnswer` types from
`models/pretestModel.ts` — their fields (`skillId`, `description`, `code`,
`type`, `choices`, `answer`, `diff`, ...) are already generic, not pretest-
specific, so no new parallel model is introduced.

It is a **fully presentational, controlled component** — no internal API or
localStorage access, following the existing controller/service split used
throughout the codebase:

```ts
interface ExerciseCardProps {
  question: PretestQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: PretestAnswer;
  feedback: { isCorrect: boolean } | null; // null = still answering
  onSelectChoice: (choiceIndex: number) => void;
  onFillInBlankChange: (value: string) => void;
  onAdvance: () => void;                    // bottom button click
  buttonLabel: string;
  highlightCodeLine: (line: string) => { __html: string };
}
```

Markup moved verbatim (minus prop-source renames) from the current `.q-card`
block in `PretestQuiz.tsx`: header (question number, skill tag, difficulty tag),
body (question text, optional code block, choices or fill-in-blank input),
footer (dot indicators stay in `PretestQuiz`, only the button lives with the
card).

**CSS**: `.q-card`, `.q-header`, `.q-body`, `.q-footer`, `.choices`, `.choice`,
`.code-block`, `.fill-blank-*`, `.btn-next` classes move from `Pretest.css` into
`ExerciseCard.css`. `Pretest.css` keeps the page chrome (background, progress
bar, done screen, modal) and the shared `:root` color variables (`--navy`,
`--gold`, etc.) — `ExerciseCard.css` consumes those variables without
redeclaring them, since it's only ever rendered on pages that already load a
stylesheet defining them.

New CSS additions for the reveal state:
- `.choice.correct` — green highlight (revealed correct answer)
- `.choice.incorrect` — red highlight (user's wrong pick)
- `.choice.locked` — `pointer-events: none`, dimmed, applied to all choices once
  revealed
- `.fill-blank-input:disabled` + a feedback banner element showing
  "✓ ถูกต้อง" / "✗ ผิด — คำตอบที่ถูกต้องคือ: …"

### 3. Two-phase answer flow (reveal, then advance)

Today, pressing Next/Submit evaluates the answer **and** advances in one step.
New behavior, split into two phases per question:

1. **Answering** (`feedback === null`): choices/input are interactive. Pressing
   the button evaluates the answer, stores the result (existing
   `evaluateQuestionAtIndex`/`isCorrectList`/`resultsList` bookkeeping,
   unchanged), and reveals feedback — it does **not** advance the question index
   yet. Button label: `"Next"` (or `"Submit"` on the last question).
2. **Revealed** (`feedback !== null`): choices/input lock (no further
   selection). Correct choice highlighted green; user's wrong pick (if any)
   highlighted red; fill-in-blank shows the correct answer if wrong. Button
   label changes to `"Continue"` (or `"See Results"` on the last question) —
   pressing it now advances `currentQuestionIndex` (or transitions to the
   `"done"` screen).

Skipping an unanswered question (existing confirmation modal, unchanged) also
goes through the revealed phase first (shown as incorrect/skipped, locked)
before a second press advances — same flow as an answered question, no special
case.

**State**: `usePretestController` gains one boolean, `isCurrentRevealed`, reset
to `false` on every `currentQuestionIndex` change (alongside the existing
`fillInBlankInput` sync effect). `handleNextQuestion` branches on it:
- not revealed → validate answered (existing unanswered-modal check) → evaluate
  → set `isCurrentRevealed = true`
- revealed → run the existing `advanceToNextQuestion` index/screen transition

### 4. Repeated-question safety

All per-question state (`answers`, `isCorrectList`, `resultsList`, and the new
`isCurrentRevealed`) is keyed by **position in the `questions` array**, not by
question ID. If the same question object appears twice at two different
indices in a session's `questions` list, each occurrence gets its own fresh
state slot automatically — no ID-based caching exists anywhere to leak stale
state across repeats. `ExerciseCard`'s host (`PretestQuiz`) keeps remounting the
card via `key={currentQuestionIndex}`, which also resets any transient DOM
state (e.g. focus) on every question change, repeat or not.

### 5. `PretestQuiz.tsx` after the change

Shrinks to: progress bar/tick rendering (unchanged) + a single `<ExerciseCard>`
call, wiring controller state into the props above. No markup duplication
remains between `PretestQuiz` and the future real-exercise page — both will
render `<ExerciseCard>`.

## Out of scope

- The standalone `src/component/Exercise.tsx` prototype page (hardcoded mock
  data, not wired to any service) is not touched — reusing `ExerciseCard` there
  is a future follow-up, not part of this change.
- No backend changes — the goal-scoped filtering (`findPretestByGoal`) already
  works correctly once given a real goal ID.
- No new automated tests — this project has no test suite configured
  (per `G06_adaptive_learning/CLAUDE.md` guidance); verification is manual via
  the dev server.

## Files touched

- `src/component/pretest/controller/usePretestController.ts` — goalId fix,
  two-phase reveal state
- `src/component/pretest/component/PretestQuiz.tsx` — shrink to progress bar +
  `<ExerciseCard>`
- `src/component/exercise/ExerciseCard.tsx` — new
- `src/component/decorate/ExerciseCard.css` — new
- `src/component/decorate/Pretest.css` — trim moved-out card styles, add none
