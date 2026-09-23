# Shared QuestionCard for Pretest and Exercise

Date: 2026-09-21
Repos: `G06_adaptive_learning` (frontend), `adt-learning` (one backend field)

Supersedes section 2 ("`ExerciseCard` component") of
`2026-08-01-exercise-card-pretest-design.md`, which was never implemented. That
spec's other parts (pretest goal-scoping, pretest two-phase reveal) are not part
of this change.

## Problem

The question card is written twice, with different markup, CSS, data shapes and
behaviour:

- Pretest: inline in `src/component/pretest/component/PretestQuiz.tsx`, styled by
  `Pretest.css` (`.q-card`, `.choice`, …), hardcoded Thai strings, level badge
  coloured by an inline hex `diffColor` that only fallback questions carry (real
  API questions all render the default green).
- Exercise: inline in `src/component/Exercise.tsx` (`.qcard` block), styled by
  `Exercise.css` (`.opt`, …), strings through `t()`, reveals ✓/✗ after an answer,
  but has no header and does not know the question's level.

Only `CodeBlock` is shared today.

## Goal

One presentational `QuestionCard` rendered by both screens. Each screen tells the
card the maximum number of questions, the current index, the skill name and the
question's level. The card renders the code box through `CodeBlock`.

Visual basis: the Pretest card (header "ข้อ x / N" + skill tag + Level badge,
choices lettered A–D), plus Exercise's ✓/✗ reveal, used only by Exercise.

## Design

### New files

- `src/component/common/QuestionCard.tsx` — presentational only: no API calls,
  no controller, no localStorage.
- `src/component/decorate/QuestionCard.css` — prefix `qc-`. Tokens are declared on
  `.qc-card` (light) and `:root[data-theme="dark"] .qc-card` (dark), **not on
  `:root`**, for the same reason as `CodeBlock`'s `.ctp-code`: `Exercise.css` and
  `Pretest.css` each declare a global `:root` with different token names, so a
  shared component referencing them would change colour depending on load order.

### Props

```ts
interface QuestionCardChoice { key: number; script: string }

interface QuestionCardProps {
  // header
  index: number;               // 0-based; shown as index + 1
  total: number | null;        // max questions; null → show "ข้อ n" without "/ N"
  skillName: string;
  level: number;               // 1–5
  // body
  type: "CHOICE" | "FILL_IN_BLANK";
  description: string;
  code?: string | string[] | null;   // passed straight to CodeBlock
  language?: string | null;
  choices?: QuestionCardChoice[];
  selectedKey: number | null;
  onPick: (key: number) => void;
  fillValue: string;
  onFillChange: (value: string) => void;
  onFillEnter?: () => void;          // Pretest: Enter advances
  // Exercise-only state (Pretest omits)
  locked?: boolean;
  reveal?: { key: number | null; isCorrect: boolean } | null;
  // footer is owned by each screen
  footer: React.ReactNode;
  tourAttrs?: { question?: string; answer?: string }; // keeps Exercise's data-tour hooks
}
```

### Behaviour

- **Header**: `t("question.counter", { n, total })` or the no-total variant, skill
  tag, level badge `Level {level} • {type label}`.
- **Level colour**: class `qc-level-1` … `qc-level-5`, each pointing at a token
  with light and dark values. `diffColor` / `diffLabel` are no longer read by the
  card. Out-of-range level clamps to the nearest of 1–5 for colour only; the
  number shown is the real value.
- **Choices**: letters A–D (index-based) + `script`. Selected choice gets
  `qc-choice--selected`. When `reveal.key` matches a choice, that choice gets
  `qc-choice--ok` or `qc-choice--no` and a `FaCheck` / `FaXmark` icon
  (`aria-hidden`). When `locked`, choices are `aria-disabled` and ignore clicks.
- **Fill-in-blank**: label (`FaPenToSquare`, `aria-hidden`) + input, on both
  screens. With `reveal`, the input gets `qc-fill--ok` / `qc-fill--no`; with
  `locked`, it is disabled. Enter calls `onFillEnter` when given.
- **Strings**: every card string through `t()`; new keys in `src/i18n/th.ts` and
  `src/i18n/en.ts` (English is typed against Thai, so a missing key fails `tsc`).
- **Icons**: `react-icons/fa6` only, no emoji. `svg { flex-shrink: 0 }` inside
  the card.

### Not in the card

Each screen keeps: the top progress bar, the topbar, Exercise's full-screen ✓/✗
flash, and the footer contents (buttons, dot indicators), passed via `footer`.
Exercise's `prog-meta` is left untouched (the repo owner will remove its
duplicate skill name separately).

### Data flow

**Backend (`adt-learning/server/app`)** — the Exercise screen does not currently
receive the level:

- `src/dto/exerciseAndSession/session.dto.ts`: add `skillLevel: number` to
  `NextQuestionDto`.
- `src/service/session.service.ts` `buildQuestionDto`: add
  `skillLevel: exercise.skillLevel`.
- `src/service/session.service.spec.ts`: assert the DTO carries `skillLevel`.
- No migration (`exercise.skillLevel` already exists).

**Frontend model**: add `skillLevel: number` to `NextQuestion` in
`src/models/sessionModel.ts`.

**`Exercise.tsx`** renders `<QuestionCard>` with:
`index = controller.questionIndex`, `total = controller.questionLimit`,
`skillName = controller.skillsName`, `level = question.skillLevel`,
`choices = question.choices.map(c => ({ key: c.id, script: c.script }))`,
`selectedKey = controller.selected`, `onPick = controller.pick`,
`fillValue/onFillChange` from the controller,
`reveal = revealed ? { key: revealed.choiceId, isCorrect: revealed.isCorrect } : null`,
`locked = controller.locked`, `tourAttrs = { question: "ex-question", answer: "ex-answer" }`,
`footer` = the existing Submit button with spinner. The card keeps
`key={question.exerciseId}` so per-question DOM state resets.

**`PretestQuiz.tsx`** renders `<QuestionCard>` with:
`index = currentQuestionIndex`, `total = questions.length`,
`skillName = currentQuestion.skillName ?? "Skill {skillId}"`,
`level = currentQuestion.level`,
`choices = currentQuestion.choices.map((s, i) => ({ key: i, script: s }))`,
`selectedKey = typeof answers[i] === "number" ? answers[i] : null`,
`onPick = selectChoiceAnswer`, `fillValue/onFillChange` from the controller,
`onFillEnter = handleNextQuestion`, `footer` = dot indicators + Next/Submit (the
hand-drawn arrow `<svg>` becomes `FaArrowRight`). Keeps
`key={currentQuestionIndex}`. The top progress bar stays in `PretestQuiz`.
Hardcoded Thai in `PretestQuiz` that remains outside the card (progress label,
Next/Submit) also moves to `t()`.

### CSS cleanup

Remove card-only selectors from `Pretest.css` (`.q-card`, `.q-header`,
`.q-body`, `.q-text`, `.choices`, `.choice*`, `.fill-blank-*`, …) and from
`Exercise.css` (`.qcard`, `.card-ribbon`, `.card-body`, `.opt*`,
`.fill-blank-input`, …). Each selector is grep-checked across `src/` before
removal; anything still used elsewhere stays. Footer/button styles used by the
`footer` content stay in the screen's own stylesheet.

## Verification

- Frontend: `npx tsc -b`, compared against a pre-change baseline, filtered to the
  touched files (build and lint do not type-check).
- Backend: `npx jest src/service/session.service.spec.ts`.
- Dev server, both screens, light and dark: a CHOICE question, a FILL_IN_BLANK
  question, a question with code, Exercise's correct and incorrect reveal and
  locked state, Pretest Enter-to-advance, and the Exercise tour still finding
  `ex-question` / `ex-answer`.

## Out of scope

- Pretest immediate reveal (two-phase flow from the 2026-08-01 spec).
- Removing the duplicate skill name from Exercise's `prog-meta`.
- Any change to how questions are selected, scored or timed.

## Files touched

- `adt-learning/server/app/src/dto/exerciseAndSession/session.dto.ts`
- `adt-learning/server/app/src/service/session.service.ts`
- `adt-learning/server/app/src/service/session.service.spec.ts`
- `G06_adaptive_learning/src/component/common/QuestionCard.tsx` (new)
- `G06_adaptive_learning/src/component/decorate/QuestionCard.css` (new)
- `G06_adaptive_learning/src/models/sessionModel.ts`
- `G06_adaptive_learning/src/component/Exercise.tsx`
- `G06_adaptive_learning/src/component/pretest/component/PretestQuiz.tsx`
- `G06_adaptive_learning/src/component/decorate/Pretest.css`
- `G06_adaptive_learning/src/component/decorate/Exercise.css`
- `G06_adaptive_learning/src/i18n/th.ts`, `src/i18n/en.ts`
