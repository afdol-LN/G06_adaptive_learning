# Expected-time input with unit dropdown for admin Exercise form

Date: 2026-08-02
Repo: `G06_adaptive_learning` (branch `seperate_component`)

## Problem

The backend already fully supports an exercise's expected completion time:
`exercise.expect_time` (integer seconds, nullable) exists on the entity, is
accepted by `CreateExerciseDto`/`UpdateExerciseDto`, and is read/written by
`exercise.service.ts`. But nothing on the frontend surfaces it — it's absent
from `ExerciseFormValues`, `ExerciseFormModal`, `ExerciseViewModal`, and the
`ExerciseTab` list table. Admins currently have no way to set or see it.

The DB column stores a plain integer number of seconds and has no unit
column — adding one is out of scope. The unit dropdown (second/minute/hour)
is purely a client-side input convenience; the client converts to seconds
before the value ever leaves the browser.

## Design

### 1. New utility — `src/utils/timeUnit.ts`

```ts
export type TimeUnit = "second" | "minute" | "hour";

const UNIT_SECONDS: Record<TimeUnit, number> = {
  second: 1,
  minute: 60,
  hour: 3600,
};

export function toSeconds(value: number, unit: TimeUnit): number {
  return value * UNIT_SECONDS[unit];
}

// Picks the largest unit that divides the seconds evenly, so editing an
// existing value round-trips to a readable number instead of always showing
// raw seconds. Falls back to seconds when nothing divides evenly.
export function fromSeconds(seconds: number): { value: number; unit: TimeUnit } {
  if (seconds % 3600 === 0) return { value: seconds / 3600, unit: "hour" };
  if (seconds % 60 === 0) return { value: seconds / 60, unit: "minute" };
  return { value: seconds, unit: "second" };
}

const UNIT_LABEL_TH: Record<TimeUnit, string> = {
  second: "วินาที",
  minute: "นาที",
  hour: "ชั่วโมง",
};

// Read-only display used by ExerciseViewModal and the ExerciseTab list.
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "-";
  const { value, unit } = fromSeconds(seconds);
  return `${value} ${UNIT_LABEL_TH[unit]}`;
}
```

This isolates the conversion/formatting math in one place so the form, view
modal, and list table all call the same functions instead of duplicating
`* 60` / `/ 3600` logic three times.

### 2. `exercise.controller.ts`

- `ExerciseFormValues` gains:
  ```ts
  expectTimeValue: number;
  expectTimeUnit: TimeUnit;
  ```
- `EMPTY_EXERCISE_FORM` defaults to `expectTimeValue: 10, expectTimeUnit: "second"`.
- `saveExercise`'s `basePayload` gains:
  ```ts
  expectTime: toSeconds(form.expectTimeValue, form.expectTimeUnit),
  ```

### 3. `ExerciseFormModal.tsx`

- New state: `expectTimeValue` (number), `expectTimeUnit` (`TimeUnit`).
- In the existing `useEffect` that syncs form state on open:
  - editing: `const { value, unit } = fromSeconds(editingExercise.expectTime ?? 10); setExpectTimeValue(value); setExpectTimeUnit(unit);`
  - creating: reset to `10` / `"second"` (matches `EMPTY_EXERCISE_FORM`).
- New field row (placed next to Level/Skill, same `ad-field-row` pattern):
  - number input: `type="number" min={1} step={1} required`, value/onChange
    tied to `expectTimeValue` (parsed with `Number`, matching the existing
    `level` input's pattern).
  - `<select>` with the three `TimeUnit` options (second/minute/hour), value/
    onChange tied to `expectTimeUnit`.
- `handleSubmit`'s `onSave` call gains `expectTimeValue, expectTimeUnit`.

### 4. `ExerciseViewModal.tsx`

New field row, alongside Level/Skill:
```tsx
<div className="ad-field">
  <label className="ad-label">เวลาที่คาดหวัง (Expected time)</label>
  <div>{formatDuration(exercise.expectTime)}</div>
</div>
```

### 5. `ExerciseTab.tsx`

- New `<th>เวลาที่คาดหวัง</th>` in the table header, placed right after Level
  (it's a numeric per-exercise attribute like level, not a categorical one
  like type/status).
- New `<td>{formatDuration(ex.expectTime)}</td>` in the matching position.
- `colSpan` on the loading (`กำลังโหลด...`) and empty (`ไม่พบ Exercise...`)
  rows bumped from `6` to `7` to match the new column count.

## Validation rules

- Required: the numeric input always has a value; new exercises default to
  `10` + `second`. The value cannot be submitted empty (browser `required`
  plus the existing form validity check on submit).
- Positive integers only: `min={1}`, `step={1}` on the `<input type="number">`.
  No decimal/fractional seconds — matches the DB's `integer` column exactly,
  so there's no silent rounding between what the admin types and what's
  stored.

## Out of scope

- No backend or DB changes — `expect_time` (entity, DTOs, service) is already
  correct and complete; this is a frontend-only change.
- No new automated tests — this project has no test suite configured (per
  `G06_adaptive_learning/CLAUDE.md`); verification is manual via the dev
  server.
- Existing exercises with `expectTime === null` (seeded/created before this
  change) show `"-"` in the view/list and fall back to `10` seconds if
  opened for editing — no backfill migration is part of this change.

## Files touched

- `src/utils/timeUnit.ts` — new
- `src/component/adminHome/exercisePanel/exercise.controller.ts` — form
  values shape, default, seconds conversion on save
- `src/component/adminHome/exercisePanel/component/ExerciseFormModal.tsx` —
  value + unit input row
- `src/component/adminHome/exercisePanel/component/ExerciseViewModal.tsx` —
  read-only expected-time row
- `src/component/adminHome/exercisePanel/ExerciseTab.tsx` — new list column
