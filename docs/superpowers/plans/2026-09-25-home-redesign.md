# Home Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ทำให้ skill tree เป็นหัวใจของหน้า Home — tree กลางจอขนาดใหญ่อ่านชัด scroll ดูได้ (ไม่ zoom), Profile strip แนวนอนพับได้ด้านบน, right rail ด้านขวา, ป้าย "เริ่มเลย" บนโหนดที่ระบบแนะนำ และรวมแท็บ SkillTree เข้ากับ Home

**Architecture:** Re-layout `HomeTab` เป็น strip + grid 2 คอลัมน์ (tree | rail) โดยใช้ component เดิม (`SkillTreeSVG`, `SkillSidePanel`, `GoalSidePanel`, `SessionCard`, `NextExercisePicker`) · component ใหม่คือ `HomeProfileStrip` และ `ScrollableSVG` (แทน `ZoomableSVG`: scale คงที่ 0.7–1 ตามความกว้างกรอบ แล้ว scroll) · recommendation ใช้ endpoint backend ที่มีอยู่แล้ว ผ่าน pattern service → controller hook → UI

**Tech Stack:** React 19 + TypeScript + Vite, react-icons/fa6, CSS ใน `src/component/decorate/Home.css`

**Spec:** `docs/superpowers/specs/2026-09-25-home-redesign-design.md`

## Global Constraints

- ทุก path ในแผนนี้ relative กับ `G06_adaptive_learning/` — `cd G06_adaptive_learning` ก่อนรันคำสั่ง
- **ไม่มี test suite** ใน frontend — correctness gate คือ `npx tsc -b` (มี ~148 error เดิมในไฟล์เก่า → เทียบกับ baseline ของไฟล์ที่แตะเท่านั้น) + ตรวจใน browser pane (`preview_start {name: "g06-frontend"}` port 5173; backend `adt-backend` port 3000)
- `npm run build` **ไม่** type-check และ `npm run lint` **ไม่** lint `.ts/.tsx` — อย่าใช้เป็นหลักฐาน
- ทุกข้อความผ่าน `t(key)` จาก `usePreferences()`; key ใหม่ต้องเพิ่มทั้ง `src/i18n/th.ts` **และ** `src/i18n/en.ts` (en typed `Record<keyof typeof th, string>` — ขาดตัวไหน tsc fail)
- Icon จาก `react-icons/fa6` เท่านั้น ห้าม emoji; icon ตกแต่งใส่ `aria-hidden`; ปุ่ม icon-only ต้องมี `aria-label` + `title`
- สีต้องเป็น CSS token ที่มีทั้ง light/dark (`--accent-fill`, `--on-accent`, `--accent`, `--surface`, …) ห้าม hex ใหม่ · ใน SVG ใส่สีผ่าน `style`/`className` ห้าม `fill="var(--x)"`
- `font-family: inherit` / `var(--font-sans)` เท่านั้น
- ห้ามคำนวณตัวเลขที่นักศึกษาเห็นจาก `pL` ฝั่ง frontend (ADR 0001) — recommendation ใช้แค่ `skillId`
- **ห้าม auto-start tour** — tour เริ่มจากปุ่ม "วิธีใช้งาน" เท่านั้น (พฤติกรรมปัจจุบัน)
- **Git:** working tree มีงานค้างที่ยังไม่ commit ของคนอื่นอยู่แล้ว (รวม `Home.css`) → **ห้าม commit เอง**; จบแต่ละ task ให้สรุปไฟล์ที่แก้ + snippet ที่เปลี่ยนให้ผู้ใช้ดู แล้วรอผู้ใช้สั่ง commit
- หลังแก้ไฟล์ทุกครั้ง อธิบายสั้นๆ ว่าเปลี่ยนอะไรและทำไม (CLAUDE.md working convention)

---

### Task 0: Baseline

- [ ] **Step 1: เก็บ baseline ของ tsc**

Run (PowerShell, ใน `G06_adaptive_learning`):
```powershell
npx tsc -b 2>&1 | Out-File -Encoding utf8 $env:TEMP\tsc-baseline.txt; (Select-String -Path $env:TEMP\tsc-baseline.txt -Pattern "error TS").Count
```
Expected: ตัวเลขประมาณ 148 — จดไว้ ใช้เทียบทุก task

- [ ] **Step 2: ดู error เดิมของไฟล์ที่แผนนี้จะแตะ**

```powershell
Select-String -Path $env:TEMP\tsc-baseline.txt -Pattern "HomeShell|HomeTab|SkillTreeTab|homeShell.controller|homeTour.controller|useExerciseController|StatCard|SkillTreeSVG|HomeProfileStrip|recommendation"
```
Expected: จดรายการไว้ — error เหล่านี้มีอยู่ก่อน ไม่ต้องแก้ แต่ห้ามเพิ่ม

---

### Task 1: ทำ `StatCard` ให้รองรับ theme และใช้ใน Home

`common/StatCard.tsx` ตอนนี้ใช้ Tailwind class ตายตัว (`bg-white`, `text-slate-*`) พัง dark theme และไม่มีไฟล์ไหน import ใช้ → แก้ได้ไม่กระทบใคร

**Files:**
- Modify: `src/component/common/StatCard.tsx` (ทั้งไฟล์)
- Modify: `src/component/home/tabs/HomeTab.tsx` (block `stats-grid`)
- Modify: `src/component/decorate/Home.css` (เพิ่ม `.stat-icon` ต่อจาก `.stat-sub`)

**Interfaces:**
- Produces: `StatCard` props `{ title: string; value: string | number; icon?: React.ReactNode; colorClass?: string; sub?: string }` — render `<div class="stat-card {colorClass}">` ใช้สไตล์ `.stat-card/.stat-num/.stat-label/.stat-sub` จาก `Home.css`

- [ ] **Step 1: เขียน `StatCard.tsx` ใหม่ทั้งไฟล์**

```tsx
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  /** tone ของการ์ด เช่น "gold" | "green" | "blue" | "purple" */
  colorClass?: string;
  /** บรรทัดรองใต้ title เช่น "2/5 ทักษะ" */
  sub?: string;
}

// สีทั้งหมดมาจาก token ของ .stat-card ใน decorate/Home.css (มีค่าธีมมืดแล้ว)
// — ห้ามใส่ class สีตายตัว (เช่น Tailwind bg-white) กลับมา เพราะพังใน dark theme
export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass = "", sub }) => (
  <div className={`stat-card ${colorClass}`.trim()}>
    {icon && <span className="stat-icon" aria-hidden>{icon}</span>}
    <div className="stat-num">{value}</div>
    <div className="stat-label">{title}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);
export default StatCard;
```

- [ ] **Step 2: เพิ่ม `.stat-icon` ใน `Home.css`** ต่อท้ายบรรทัด `.stat-sub { … }`

```css
.stat-icon  { display: inline-flex; font-size: 18px; color: var(--accent); margin-bottom: 6px; }
```

- [ ] **Step 3: ใช้ `StatCard` ใน `HomeTab.tsx`**

เพิ่ม import:
```tsx
import { StatCard } from "../../common/StatCard";
```
แทนที่ block:
```tsx
            {statsList.map((s, i) => (
              <div key={i} className={`stat-card ${s.cls}`}>
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
                {s.sub && <div className="stat-sub">{s.sub}</div>}
              </div>
            ))}
```
ด้วย:
```tsx
            {statsList.map((s) => (
              <StatCard key={s.label} title={s.label} value={s.num} colorClass={s.cls} sub={s.sub} />
            ))}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc -b 2>&1 | Select-String "StatCard|HomeTab"`
Expected: ไม่มี error ใหม่เทียบกับ baseline

- [ ] **Step 5: ตรวจใน browser** — `preview_start g06-frontend` (+ `adt-backend` ถ้ายังไม่รัน), login นักศึกษา, หน้า Home: stats 4 ใบหน้าตาเหมือนเดิมทุกพิกเซลใน light และ dark (สลับ theme ที่ topbar)

- [ ] **Step 6: สรุปให้ผู้ใช้** — แสดง diff ของ 3 ไฟล์ อธิบายว่า StatCard เลิกใช้ Tailwind แล้วใช้ token ของ Home.css

---

### Task 2: ลบแท็บ SkillTree (รวมเข้ากับ Home)

**Files:**
- Modify: `src/component/home/controller/homeShell.controller.ts:14,35-39`
- Modify: `src/component/home/HomeShell.tsx` (imports, `NAV_ITEMS`, block `activeTab === "SkillTree"`)
- Delete: `src/component/home/tabs/SkillTreeTab.tsx`
- Modify: `src/component/home/tabs/HomeTab.tsx` (type ของ `switchTab`, ลบปุ่ม `.tree-expand-btn`)
- Modify: `src/component/home/controller/homeTour.controller.ts:8,28-32,64`
- Modify: `src/component/exercise/controller/useExerciseController.ts:195-196`
- Modify: `src/i18n/th.ts`, `src/i18n/en.ts`
- Modify: `src/component/decorate/Home.css` (ลบ `.tree-expand-btn*`, `.tab-skill-tree`, `.tree-main`)

**Interfaces:**
- Produces: `export type HomeTabKey = "Home" | "History" | "Profile";` และ `TourPage` มีค่าเดียวกัน

- [ ] **Step 1: `homeShell.controller.ts` — ตัด SkillTree + fallback แท็บที่ไม่รู้จัก**

แทนที่:
```ts
export type HomeTabKey = "Home" | "SkillTree" | "History" | "Profile";
```
ด้วย:
```ts
export type HomeTabKey = "Home" | "History" | "Profile";
const HOME_TABS: HomeTabKey[] = ["Home", "History", "Profile"];
```
แทนที่:
```ts
  // Tab State
  // Exercise's "View skill tree" (after completing the goal) opens a tab directly via router state
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<HomeTabKey>(
    () => (location.state as { tab?: HomeTabKey } | null)?.tab ?? "Home"
  );
```
ด้วย:
```ts
  // Tab State — เปิดแท็บตรงได้ผ่าน router state { tab }
  // ชื่อแท็บที่ไม่มีแล้ว (เช่น "SkillTree" เดิม ที่รวมเข้า Home) → Home
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<HomeTabKey>(() => {
    const tab = (location.state as { tab?: string } | null)?.tab;
    return HOME_TABS.includes(tab as HomeTabKey) ? (tab as HomeTabKey) : "Home";
  });
```

- [ ] **Step 2: `HomeShell.tsx`**
  - ลบ `FaSitemap,` ออกจาก import `react-icons/fa6`
  - ลบ `import { SkillTreeTab } from "./tabs/SkillTreeTab";`
  - ลบบรรทัด `{ key: "SkillTree", labelKey: "nav.skillTree", Icon: FaSitemap },` ใน `NAV_ITEMS`
  - ลบ block ทั้งก้อน `{activeTab === "SkillTree" && ( <SkillTreeTab … /> )}`

- [ ] **Step 3: ลบไฟล์** `src/component/home/tabs/SkillTreeTab.tsx`

```powershell
Remove-Item src/component/home/tabs/SkillTreeTab.tsx -Confirm:$false
```

- [ ] **Step 4: `HomeTab.tsx` — type + ลบปุ่ม expand**

เพิ่ม import:
```tsx
import type { HomeTabKey } from "../controller/homeShell.controller";
```
แทนที่ prop type:
```tsx
  switchTab: (tab: "Home" | "SkillTree" | "History" | "Profile") => void;
```
ด้วย:
```tsx
  switchTab: (tab: HomeTabKey) => void;
```
ลบ `<button className="tree-expand-btn" …> … </button>` ทั้งก้อน (รวม `<svg>` ข้างใน)

- [ ] **Step 5: `homeTour.controller.ts`**

แทนที่ `export type TourPage = "Home" | "SkillTree" | "History" | "Profile";` ด้วย:
```ts
export type TourPage = "Home" | "History" | "Profile";
```
ใน `TOURS.Home` แทรกต่อจากบรรทัด `tour-skill-tree`:
```ts
    { element: '[data-tour="tour-skill-tree"] .tree-node.clickable', titleKey: "tour.skillTree.node.title", descKey: "tour.skillTree.node.desc" },
```
ลบ entry `SkillTree: [ … ],` ทั้งก้อน
แทนที่ `setSeen({ Home: true, SkillTree: true, History: true, Profile: true });` ด้วย:
```ts
        if (!cancelled) setSeen({ Home: true, History: true, Profile: true });
```

- [ ] **Step 6: `useExerciseController.ts`**

แทนที่:
```ts
  // after completing the goal: open Home straight on the Skill Tree tab, where the goal node is
  const goToSkillTree = useCallback(() => navigate("/home", { state: { tab: "SkillTree" } }), [navigate]);
```
ด้วย:
```ts
  // after completing the goal: the skill tree (and its goal node) now lives on the Home tab
  const goToSkillTree = useCallback(() => navigate("/home"), [navigate]);
```

- [ ] **Step 7: i18n — ลบ key ที่ไม่มีผู้ใช้แล้ว** ใน `th.ts` และ `en.ts` (ใช้ Edit tool ห้าม sed/perl):
  - `"nav.skillTree"`
  - `"home.expandTree"`
  - `"tour.skillTree.intro.title"`, `"tour.skillTree.intro.desc"`
  - `"tour.skillTree.canvas.title"`, `"tour.skillTree.canvas.desc"`
  - **เก็บ** `tour.skillTree.node.*` (Home tour ใช้ต่อ) และ `home.treeLabel` (ลบใน Task 4)

ก่อนลบให้เช็กว่าไม่มีผู้ใช้เหลือ:
```powershell
Select-String -Path src -Recurse -Include *.ts,*.tsx -Pattern 'nav\.skillTree|home\.expandTree|tour\.skillTree\.(intro|canvas)' | Where-Object { $_.Path -notmatch 'i18n' }
```
Expected: ไม่มีผลลัพธ์

- [ ] **Step 8: `Home.css` — ลบ rule ที่ไม่มีผู้ใช้**
  - `.tree-expand-btn { … }` และ `.tree-expand-btn:hover { … }`
  - comment `/* ════ SKILL TREE TAB ════ */` + `.tab-skill-tree { … }` + `.tree-main { … }`

- [ ] **Step 9: Type-check**

Run: `npx tsc -b 2>&1 | Select-String "SkillTree|HomeShell|HomeTab|homeTour|homeShell|useExerciseController|i18n"`
Expected: ไม่มี error ใหม่ (โดยเฉพาะไม่มี `"SkillTree"` is not assignable)

- [ ] **Step 10: ตรวจใน browser**
  - sidebar เหลือ 3 เมนู: หน้าหลัก / ประวัติ / โปรไฟล์
  - กด "วิธีใช้งาน" บน Home → tour มี step โหนดทักษะต่อจาก step แผนผัง และเดินจบได้
  - รัน console: `history.replaceState({usr:{tab:"SkillTree"}}, "", "/home"); location.reload()` → ลงแท็บ Home ไม่พัง

- [ ] **Step 11: สรุปให้ผู้ใช้** — diff + เหตุผล

---

### Task 3: Profile strip (พับ/กางได้)

**Files:**
- Create: `src/component/home/component/HomeProfileStrip.tsx`
- Modify: `src/component/home/controller/homeShell.controller.ts` (state พับ/กาง + `handleHelpClick`)
- Modify: `src/component/home/HomeShell.tsx` (ส่ง prop ใหม่เข้า `HomeTab`, เลิกส่ง `userProfile`/`skills`)
- Modify: `src/component/home/tabs/HomeTab.tsx` (แทน hero + stats ด้วย strip, ลบ typewriter)
- Modify: `src/component/decorate/Home.css` (เพิ่ม section `hps-`)
- Modify: `src/i18n/th.ts`, `src/i18n/en.ts`

**Interfaces:**
- Consumes: `StatCard` จาก Task 1
- Produces:
  - `HomeProfileStrip` props `{ fullName: string; goalName?: string; stats: BranchStats | null; collapsed: boolean; onToggle: () => void; onShowBreakdown?: () => void }`
  - controller คืนเพิ่ม `profileStripCollapsed: boolean`, `toggleProfileStrip: () => void`
  - `HomeTab` prop ใหม่ `fullName: string`, `profileStripCollapsed: boolean`, `onToggleProfileStrip: () => void`; prop `userProfile` และ `skills` ถูกลบ

- [ ] **Step 1: i18n — เพิ่ม key** ต่อจาก `"home.noSessions"` ในทั้งสองไฟล์

`th.ts`:
```ts
  "home.profile.expand": "แสดงข้อมูลของฉัน",
  "home.profile.collapse": "ซ่อนข้อมูลของฉัน",
```
`en.ts`:
```ts
  "home.profile.expand": "Show my info",
  "home.profile.collapse": "Hide my info",
```

- [ ] **Step 2: สร้าง `HomeProfileStrip.tsx`**

```tsx
import React from "react";
import { FaChartSimple, FaChevronDown, FaChevronUp, FaUserGraduate } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import { BranchStats } from "../../../models/branchStatsModel";
import { StatCard } from "../../common/StatCard";

interface HomeProfileStripProps {
  fullName: string;
  goalName?: string;
  stats: BranchStats | null;
  collapsed: boolean;
  onToggle: () => void;
  /** เปิด modal ที่มาของคะแนนเริ่มต้นจาก pretest — ไม่ส่งมา = ยังไม่ได้ทำ pretest ไม่ต้องแสดงปุ่ม */
  onShowBreakdown?: () => void;
}

// แถบข้อมูลผู้ใช้ + stats ต่อจากขอบ sidebar — พับแล้วเหลือปุ่มไอคอนคน + ลูกศร
export const HomeProfileStrip: React.FC<HomeProfileStripProps> = ({
  fullName,
  goalName,
  stats,
  collapsed,
  onToggle,
  onShowBreakdown,
}) => {
  const { t } = usePreferences();

  if (collapsed) {
    const label = t("home.profile.expand");
    return (
      <div className="hps-collapsed">
        <button
          type="button"
          className="hps-toggle-mini"
          onClick={onToggle}
          aria-expanded={false}
          aria-label={label}
          title={label}
        >
          <FaUserGraduate aria-hidden />
          <FaChevronDown aria-hidden />
        </button>
      </div>
    );
  }

  const statsList = [
    { num: stats ? `${stats.skillsUnlockedCount}` : "0", label: t("home.stat.skills"), cls: "gold" },
    { num: stats ? `${stats.sessionsCount}` : "0", label: t("home.stat.sessions"), cls: "green" },
    { num: stats ? `${stats.dayStreak}` : "0", label: t("home.stat.streak"), cls: "blue" },
    {
      num: stats ? `${stats.goalProgressPercent}%` : "0%",
      label: t("home.stat.progress"),
      cls: "purple",
      // the same numbers as the goal node at the end of the tree (adt-learning/docs/adr/0005)
      sub:
        !stats || stats.goalRequiredCount === 0
          ? undefined
          : stats.goalComplete
            ? t("goalNode.complete")
            : t("goalNode.count", { done: stats.goalMasteredCount, total: stats.goalRequiredCount }),
    },
  ];
  const collapseLabel = t("home.profile.collapse");

  return (
    <section className="hps">
      <div className="hps-hero">
        <div className="home-hero-avatar"><FaUserGraduate aria-hidden /></div>
        <div className="hps-info">
          <div className="home-greeting">{t("home.greeting")}</div>
          <h1 className="home-username">{fullName}</h1>
          <div className="home-goal">
            {t("home.goal")} <span className="goal-badge">{goalName || t("home.goalUnset")}</span>
          </div>
          {onShowBreakdown && (
            <button type="button" className="hps-breakdown" onClick={onShowBreakdown}>
              <FaChartSimple aria-hidden />
              <span>{t("pretestBreakdown.reopen")}</span>
            </button>
          )}
        </div>
      </div>

      <div className="hps-stats" data-tour="tour-stats">
        {statsList.map((s) => (
          <StatCard key={s.label} title={s.label} value={s.num} colorClass={s.cls} sub={s.sub} />
        ))}
      </div>

      <button
        type="button"
        className="hps-toggle"
        onClick={onToggle}
        aria-expanded={true}
        aria-label={collapseLabel}
        title={collapseLabel}
      >
        <FaChevronUp aria-hidden />
      </button>
    </section>
  );
};
export default HomeProfileStrip;
```

- [ ] **Step 3: `homeShell.controller.ts` — state + help**

ต่อจาก `const SIDEBAR_COLLAPSED_KEY = "homeSidebarCollapsed";`:
```ts
// จำสถานะ Profile strip บนหน้า Home (พับ/กาง) — ค่าเริ่มต้นกาง
const PROFILE_STRIP_COLLAPSED_KEY = "homeProfileCollapsed";
```
ต่อจาก state `sidebarCollapsed`:
```ts
  const [profileStripCollapsed, setProfileStripCollapsed] = useState<boolean>(
    () => localStorage.getItem(PROFILE_STRIP_COLLAPSED_KEY) === "1"
  );
```
ต่อจาก effect ที่เขียน `SIDEBAR_COLLAPSED_KEY`:
```ts
  useEffect(() => {
    localStorage.setItem(PROFILE_STRIP_COLLAPSED_KEY, profileStripCollapsed ? "1" : "0");
  }, [profileStripCollapsed]);
```
แทนที่ `handleHelpClick` ทั้งฟังก์ชันด้วย:
```ts
  const handleHelpClick = () => {
    setShowProfileMenu(false);
    // strip พับอยู่ → กางก่อน ไม่งั้น step tour-stats ไม่มี element ให้ชี้และถูกข้าม
    if (activeTab === "Home" && profileStripCollapsed) {
      setProfileStripCollapsed(false);
      requestAnimationFrame(() => homeTour.startTour(activeTab, { force: true }));
      return;
    }
    homeTour.startTour(activeTab, { force: true });
  };

  const toggleProfileStrip = () => setProfileStripCollapsed((c) => !c);
```
ใน object ที่ return เพิ่มใต้ `handleHelpClick,`:
```ts
    // home profile strip
    profileStripCollapsed,
    toggleProfileStrip,
```

- [ ] **Step 4: `HomeTab.tsx` — ใช้ strip แทน hero + stats**
  - ลบ `useState, useEffect` ออกจาก import React (เหลือ `import React from "react";`), ลบ `FaUserGraduate`, `FaChartSimple` ออกจาก import icons, ลบ import `StatCard` และ `BranchSkill`
  - เพิ่ม `import { HomeProfileStrip } from "../component/HomeProfileStrip";`
  - ใน `HomeTabProps`: ลบ `userProfile` และ `skills`; เพิ่ม
    ```tsx
      fullName: string;
      profileStripCollapsed: boolean;
      onToggleProfileStrip: () => void;
    ```
  - ใน destructure: ลบ `userProfile`, เพิ่ม `fullName, profileStripCollapsed, onToggleProfileStrip`
  - ลบ `twText`/`showCursor` state, `profileFullName`/`fullName` ที่คำนวณเอง, effect typewriter, และ `statsList`
  - แทน block `{/* Hero */} <div className="home-hero">…</div>` และ `{/* Stats grid */} <div className="stats-grid">…</div>` ด้วย:
    ```tsx
          <HomeProfileStrip
            fullName={fullName}
            goalName={activeBranch?.goalName}
            stats={stats}
            collapsed={profileStripCollapsed}
            onToggle={onToggleProfileStrip}
            onShowBreakdown={onShowBreakdown}
          />
    ```
  - ใน `progress-summary-head` ลบปุ่ม `progress-summary-breakdown` (ย้ายไปอยู่ใน strip แล้ว)

- [ ] **Step 5: `HomeShell.tsx` — ส่ง prop**

ใน `<HomeTab …>` ลบ `userProfile={userProfile}` และ `skills={skillTreeController.skills}` แล้วเพิ่ม:
```tsx
              fullName={fullName}
              profileStripCollapsed={controller.profileStripCollapsed}
              onToggleProfileStrip={controller.toggleProfileStrip}
```

- [ ] **Step 6: `Home.css` — section ใหม่** วางต่อจาก `.stat-icon` (Task 1)

```css
/* ════ PROFILE STRIP (hps-) ════ */
/* ต่อจากขอบขวาของ sidebar — ไม่มีระยะซ้าย มุมโค้งเฉพาะด้านขวา
   พื้น --accent-fill (ไม่ใช่ --accent: dark mode --accent สว่างเกินจนตัวอักษรขาวอ่านไม่ออก) */
.hps {
  position: relative; flex-shrink: 0;
  display: flex; align-items: center; gap: 24px;
  margin: 16px 24px 0 0; padding: 18px 60px 18px 24px;
  background: var(--accent-fill); color: var(--on-accent);
  border-radius: 0 var(--r-md) var(--r-md) 0;
  box-shadow: var(--card-shadow);
  animation: homeRise .45s ease-out backwards;
}
.hps-hero  { display: flex; align-items: center; gap: 16px; min-width: 0; flex: 0 1 auto; }
.hps-info  { min-width: 0; }
.hps-stats { flex: 1; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; min-width: 0; }
.hps-stats .stat-card { padding: 10px 14px; }
.hps-stats .stat-num  { font-size: 26px; }

.hps-breakdown,
.hps-toggle {
  font-family: inherit; color: var(--on-accent); cursor: pointer;
  background: color-mix(in srgb, var(--on-accent) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--on-accent) 40%, transparent);
  border-radius: var(--r-sm);
  transition: background-color .2s;
}
.hps-breakdown { margin-top: 8px; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; font-size: 12px; font-weight: 600; }
.hps-toggle    { position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.hps-breakdown:hover,
.hps-toggle:hover { background: color-mix(in srgb, var(--on-accent) 28%, transparent); }

.hps-collapsed { flex-shrink: 0; margin-top: 12px; }
.hps-toggle-mini {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px 8px 18px; font-size: 16px;
  border: none; border-radius: 0 var(--r-full) var(--r-full) 0;
  background: var(--accent-fill); color: var(--on-accent);
  box-shadow: var(--card-shadow); cursor: pointer;
}
.hps-toggle-mini:hover { opacity: .92; }
.hps-breakdown:focus-visible,
.hps-toggle:focus-visible,
.hps-toggle-mini:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

@media (max-width: 1024px) {
  .hps { flex-direction: column; align-items: stretch; }
  .hps-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
```

- [ ] **Step 7: Type-check**

Run: `npx tsc -b 2>&1 | Select-String "HomeProfileStrip|HomeTab|HomeShell|homeShell|i18n"`
Expected: ไม่มี error ใหม่

- [ ] **Step 8: ตรวจใน browser**
  - Home แสดง strip น้ำเงินชิดขอบ sidebar: avatar, "ยินดีต้อนรับกลับ", ชื่อเต็ม (ไม่มี typewriter), badge เป้าหมาย, stats 4 ใบเรียงแนวนอน
  - ปุ่ม "ที่มาคะแนน" มีเฉพาะ branch ที่ทำ pretest แล้ว และเปิด modal ได้
  - กด ▲ → เหลือปุ่มไอคอนคน + ▼; reload → ยังพับอยู่; กด ▼ → กางกลับ
  - พับไว้แล้วกด "วิธีใช้งาน" → strip กางเอง และ tour มี step stats
  - dark theme: strip อ่านออก ตัวอักษรขาวบนพื้นน้ำเงินเข้ม; th/en สลับข้อความครบ
  - `resize_window` 768 → stats เป็น 2×2

- [ ] **Step 9: สรุปให้ผู้ใช้** — diff + screenshot ตอนกาง/พับ

---

### Task 4: Layout ใหม่ — tree กลาง (scroll, ไม่ zoom) + right rail

**Files:**
- Create: `src/component/home/skillTree/ScrollableSVG.tsx`
- Delete: `src/component/home/skillTree/ZoomableSVG.tsx`
- Modify: `src/component/home/skillTree/SkillTreeSVG.tsx` (ตัด `zoomable`, render ผ่าน `ScrollableSVG`)
- Modify: `src/component/home/tabs/HomeTab.tsx` (JSX ใต้ strip ทั้งหมด)
- Modify: `src/component/decorate/Home.css` (ลบ hero/typewriter/stats-grid/home-top เก่า, เพิ่ม `home-body`/`home-rail`/`skill-tree-scroll`)
- Modify: `src/i18n/th.ts`, `src/i18n/en.ts`

**Interfaces:**
- Consumes: `HomeProfileStrip` (Task 3), `HomeTabKey` (Task 2)
- Produces:
  - `ScrollableSVG` props `{ minX: number; minY: number; width: number; height: number; className?: string; focus?: { x: number; y: number } | null; children: React.ReactNode }` — `focus` เป็นพิกัดใน SVG ที่จะเลื่อนให้อยู่ในจอครั้งแรก (Task 5 ใช้)
  - `SkillTreeSVG` **ไม่มี** prop `zoomable` แล้ว
  - `HomeTab` DOM — `.tab-home > .tab-home-main > [HomeProfileStrip, .home-body > [.home-tree-wrap[data-tour=tour-skill-tree] > [.tree-legend, .skill-tree-scroll > svg], aside.home-rail]]`; anchor `.btn-next-exercise` และ `[data-tour="tour-sessions"]` อยู่ใน rail

- [ ] **Step 0a: สร้าง `ScrollableSVG.tsx`**

```tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

// แผนผังแบบไม่ซูม: วาดที่ scale คงที่ให้โหนดอ่านชัด แล้วให้กรอบ scroll แทนการย่อทั้ง tree ให้พอดีจอ
// scale = กว้างกรอบ / กว้าง tree แต่ไม่ต่ำกว่า MIN_SCALE (ชื่อโหนด 19px → ~13px) และไม่ขยายเกินขนาดจริง
const MIN_SCALE = 0.7;
const MAX_SCALE = 1;

interface ScrollableSVGProps {
  minX: number;
  minY: number;
  width: number;
  height: number;
  className?: string;
  /** พิกัดใน SVG ที่ต้องอยู่ในจอตอนเปิด (โหนดที่มีป้าย "เริ่มเลย") — null = บนสุด กึ่งกลางแนวนอน */
  focus?: { x: number; y: number } | null;
  children: React.ReactNode;
}

export const ScrollableSVG: React.FC<ScrollableSVGProps> = ({ minX, minY, width, height, className, focus = null, children }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [hostWidth, setHostWidth] = useState(0);
  const scrolledFor = useRef<string | null>(null);

  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    setHostWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setHostWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = hostWidth > 0 ? Math.min(MAX_SCALE, Math.max(MIN_SCALE, hostWidth / width)) : MIN_SCALE;

  // เลื่อนครั้งเดียวต่อเป้าหมาย — ไม่ดึงกลับทุกครั้งที่ re-render ขณะผู้ใช้กำลังเลื่อนดูเอง
  useEffect(() => {
    const el = hostRef.current;
    if (!el || hostWidth === 0) return;
    const key = focus ? `${focus.x},${focus.y}` : "top";
    if (scrolledFor.current === key) return;
    scrolledFor.current = key;
    const left = focus ? (focus.x - minX) * scale - el.clientWidth / 2 : (width * scale - el.clientWidth) / 2;
    const top = focus ? (focus.y - minY) * scale - el.clientHeight / 3 : 0;
    el.scrollTo({ left: Math.max(0, left), top: Math.max(0, top) });
  }, [focus, hostWidth, scale, minX, minY, width]);

  return (
    <div ref={hostRef} className="skill-tree-scroll">
      <svg
        viewBox={`${minX} ${minY} ${width} ${height}`}
        width={width * scale}
        height={height * scale}
        className={className}
      >
        {children}
      </svg>
    </div>
  );
};
export default ScrollableSVG;
```

- [ ] **Step 0b: `SkillTreeSVG.tsx` — ตัด zoom ใช้ `ScrollableSVG`**
  - แทน `import { ZoomableSVG } from "./ZoomableSVG";` ด้วย `import { ScrollableSVG } from "./ScrollableSVG";`
  - ลบ `zoomable?: boolean;` ใน props และ `zoomable = false,` ใน destructure
  - แทนท้ายฟังก์ชันตั้งแต่ `const viewBox = …` ถึงก่อน `};` ด้วย:
    ```tsx
      return (
        <ScrollableSVG minX={minX} minY={minY} width={svgWidth} height={svgHeight} className="skill-tree-svg">
          {inner}
        </ScrollableSVG>
      );
    ```

- [ ] **Step 0c: ลบ `ZoomableSVG.tsx`** — เช็กก่อนว่าไม่มีผู้ใช้เหลือ

```powershell
Select-String -Path src -Recurse -Include *.ts,*.tsx -Pattern 'ZoomableSVG|zoomable'
```
Expected: ไม่มีผลลัพธ์นอกจากไฟล์ `ZoomableSVG.tsx` เอง และ `zoomable={false}` ใน `HomeTab.tsx` (หายไปใน Step 2) แล้วรัน:
```powershell
Remove-Item src/component/home/skillTree/ZoomableSVG.tsx -Confirm:$false
```

- [ ] **Step 1: i18n** — เพิ่มต่อจาก `home.profile.collapse` และลบ `"home.treeLabel"` ในทั้งสองไฟล์

`th.ts`: `  "home.seeAll": "ดูทั้งหมด",`
`en.ts`: `  "home.seeAll": "See all",`

- [ ] **Step 2: `HomeTab.tsx` — แทนทั้ง `return ( … )`** ด้วย:

```tsx
  return (
    <div className="tab-home">
      <div className="tab-home-main">
        <HomeProfileStrip
          fullName={fullName}
          goalName={activeBranch?.goalName}
          stats={stats}
          collapsed={profileStripCollapsed}
          onToggle={onToggleProfileStrip}
          onShowBreakdown={onShowBreakdown}
        />

        <div className="home-body">
          {/* Tree — หัวใจของหน้า อยู่กลางจอ ขนาดอ่านชัด scroll ดู (ไม่ zoom) */}
          <div className="home-tree-wrap" data-tour="tour-skill-tree">
            {/* Legend — มุมขวาบน อธิบายสี progress bar */}
            <div className="tree-legend">
              {[
                { pct: 10,  label: "1–19%" },
                { pct: 50,  label: "20–74%" },
                { pct: 90,  label: "75–99%" },
                { pct: 100, label: "100%" },
              ].map(({ pct, label }) => (
                <div key={pct} className="tree-legend-row">
                  <span className="tree-legend-dot" style={{ background: getProgressColor(pct) }} />
                  <span className="tree-legend-label">{label}</span>
                </div>
              ))}
            </div>

            <SkillTreeSVG
              skills={treeSkills}
              unlocked={unlocked}
              canUnlockFn={canUnlock}
              onNodeClick={handleNodeClick}
              selected={selected}
              hovered={hovered}
              setHovered={setHovered}
              goal={goal}
              goalSelected={goalSelected}
              onGoalClick={onGoalClick}
            />
          </div>

          {/* Right rail */}
          <aside className="home-rail">
            <button className="btn-next-exercise" onClick={() => setShowPicker(true)}>
              {t("home.nextExercise")}
            </button>

            <div className="progress-summary">
              <div className="progress-summary-head">
                <span className="progress-summary-label">{t("home.progressSummary")}</span>
              </div>
              {/* สีเดียวกับโหนดใน skill tree (getNodeColors)
                  ครบ 100% เขียว · ปลดล็อกแล้ว น้ำเงิน · ปลดล็อกได้ ฟ้า · ล็อก เทา */}
              <div className="progress-summary-list">
                {treeSkills.map((s) => {
                  const pct = displayProgressPercent(s);
                  const isUnlocked = unlocked.has(s.skillId);
                  const isLocked = !isUnlocked && !canUnlock(s.skillId);
                  const { bg, border, text, bar } = getNodeColors(isUnlocked, !isLocked, pct);
                  return (
                    <button
                      type="button"
                      key={s.skillId}
                      className={`progress-summary-item${isLocked ? " locked" : ""}`}
                      // ล็อก: พื้น/ขอบเทาจาก tree แต่ตัวอักษรใช้ --muted (ผ่าน CSS) — --node-locked-text จางเกินสำหรับข้อความ 12px
                      style={{ background: bg, borderColor: border, color: isLocked ? undefined : text }}
                      onClick={() => handleNodeClick(s)}
                      title={t("home.progressTooltip", { name: s.skillsName, pct })}
                    >
                      <span className="progress-summary-row">
                        <span className="progress-summary-name">{s.skillsName}</span>
                        <span className="progress-summary-pct">
                          {isLocked ? <FaLock aria-label={t("skill.locked")} /> : formatProgressLabel(s, t("skill.notStarted"))}
                        </span>
                      </span>
                      <span className="progress-summary-track" style={{ background: bar }}>
                        <span
                          className="progress-summary-fill"
                          style={{ width: `${pct}%`, background: getProgressColor(pct) }}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent sessions (last 3) */}
            <div className="home-sessions" data-tour="tour-sessions">
              <div className="home-rail-head">
                <span className="section-label section-label-icon">
                  <FaClipboardList aria-hidden /> {t("home.recentSessions")}
                </span>
                {sessions.length > 0 && (
                  <button type="button" className="home-see-all" onClick={() => switchTab("History")}>
                    {t("home.seeAll")}
                  </button>
                )}
              </div>
              {sessions.length === 0 ? (
                <p className="empty-note">{t("home.noSessions")}</p>
              ) : (
                <div className="session-list">
                  {[...sessions]
                    .reverse()
                    .slice(0, 3)
                    .map((s) => (
                      <SessionCard key={s.sessionId} session={s} />
                    ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <SkillSidePanel
        selected={selected}
        setSelected={setSelected}
        skills={treeSkills}
        unlocked={unlocked}
        canUnlockFn={canUnlock}
        onStartExercise={onStartExercise}
      />
      <GoalSidePanel
        goal={goal}
        open={goalSelected}
        onClose={() => setGoalSelected(false)}
        skills={treeSkills}
        unlocked={unlocked}
        canUnlockFn={canUnlock}
        onSelectSkill={setSelected}
      />
    </div>
  );
```
แล้วตรวจ import ที่เหลือใช้จริง: `FaClipboardList, FaLock` จาก fa6; `LayoutGoalNode, LayoutSkill, getProgressColor, getNodeColors, displayProgressPercent, formatProgressLabel` จาก utils; `SessionCard`, `SkillTreeSVG`, `SkillSidePanel`, `GoalSidePanel`, `HomeProfileStrip`, `BranchStats`, `SessionHistoryItem`, `HomeTabKey` — ลบตัวที่ไม่ใช้แล้ว

- [ ] **Step 3: `Home.css` — ลบ rule เก่าที่ไม่มีผู้ใช้**
  - `.home-top { … }`
  - `.home-hero { … }`, `.home-hero:hover .home-hero-avatar { … }`, `.home-hero-info { … }` (**เก็บ** `.home-hero-avatar`, `.home-greeting`, `.home-username`, `.home-goal`, `.goal-badge` — strip ใช้อยู่)
  - `.cursor { … }` และ `@keyframes blink { … }` — เช็กก่อนว่าไม่มีไฟล์อื่นใช้: `Select-String -Path src -Recurse -Include *.tsx,*.css -Pattern '"cursor"|className="cursor|\bblink\b'`
  - `.stats-grid { … }`
  - `.progress-summary-breakdown*` ทั้งกลุ่ม (รวมใน `@media (prefers-reduced-motion)` ถ้ามีอ้างถึง)
  - `.section-label-tree { … }`
  - `.home-next-ex-bar { … }`

- [ ] **Step 4: `Home.css` — แก้/เพิ่ม layout**

แทนที่ `.home-tree-wrap { … }` และ `.skill-tree-svg { … }` เดิมด้วย:
```css
.home-tree-wrap {
  position: relative; min-width: 0; min-height: 480px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-md); overflow: hidden;
  box-shadow: 0 4px 18px rgba(0, 71, 171, 0.10);
}
/* scroll container ของแผนผัง (ScrollableSVG) — legend อยู่นอกกล่องนี้จึงไม่เลื่อนตาม */
.skill-tree-scroll { position: absolute; inset: 0; overflow: auto; overscroll-behavior: contain; }
/* ขนาดจริงกำหนดเป็น px จาก ScrollableSVG; margin auto จัดกลางเมื่อ tree แคบกว่ากรอบ */
.skill-tree-svg { display: block; margin: 0 auto; }
```
แทนที่ `.home-sessions { padding: 20px 32px 40px; }` ด้วย:
```css
.home-sessions {
  background: var(--surface); border-radius: var(--r-md);
  box-shadow: var(--card-shadow); padding: 12px 16px;
}
```
เพิ่มต่อจาก `.tab-home-main { … }`:
```css
/* แถวล่างของ Home: tree กินที่ที่เหลือ | rail กว้างคงที่ */
.home-body {
  flex: 1; min-height: 0;
  display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 16px;
  padding: 16px 24px 24px;
}
.home-rail {
  display: flex; flex-direction: column; gap: 14px;
  min-height: 0; overflow-y: auto;
}
.home-rail .progress-summary { margin-bottom: 0; }
.home-rail .progress-summary-list { flex-direction: column; flex-wrap: nowrap; }
.home-rail .progress-summary-item { width: 100%; }
.home-rail-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.home-rail-head .section-label-icon { margin-bottom: 0; }
.home-see-all {
  font-family: inherit; font-size: 13px; font-weight: 700;
  color: var(--accent); background: none; border: none; cursor: pointer; padding: 4px;
}
.home-see-all:hover { text-decoration: underline; }
.home-see-all:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* จอแคบ: rail ลงไปอยู่ใต้ tree แล้วทั้งหน้าเลื่อนแทน */
@media (max-width: 1024px) {
  .home-body { grid-template-columns: minmax(0, 1fr); padding: 12px 16px 24px; }
  .home-tree-wrap { height: 70vh; min-height: 360px; }
  .home-rail { overflow: visible; }
}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc -b 2>&1 | Select-String "HomeTab|i18n"`
Expected: ไม่มี error ใหม่ (รวมถึงไม่มี unused-import error ถ้า tsconfig เปิด `noUnusedLocals`)

- [ ] **Step 6: ตรวจใน browser (1440px)**
  - tree อยู่ใต้ strip กินความสูงที่เหลือของจอ, rail กว้าง ~320px ด้านขวา
  - โหนดแสดงใหญ่อ่านชื่อชัด (ตรวจด้วย `javascript_tool`: `document.querySelector('.skill-tree-svg').getBoundingClientRect().width / document.querySelector('.skill-tree-svg').viewBox.baseVal.width` ต้องอยู่ระหว่าง 0.7–1)
  - scroll wheel **เลื่อนลง** ไม่ใช่ซูม, ลากเมาส์ไม่ pan; tree ยาวกว่ากรอบมี scrollbar แนวตั้ง; legend มุมขวาบนไม่เลื่อนหายตาม
  - tree ที่กว้างเกินกรอบ (ลอง `resize_window` 768) → เลื่อนแนวนอนได้ และเปิดมาอยู่กึ่งกลาง
  - คลิกโหนด → `SkillSidePanel` เปิด, คลิก goal node (ต้องเลื่อนลงไปล่างสุด) → `GoalSidePanel` เปิด
  - rail: ปุ่มแบบฝึกหัดถัดไป → picker; progress summary เป็น list แนวตั้ง คลิกแล้ว side panel เปิด; sessions 3 รายการ + "ดูทั้งหมด" → แท็บประวัติ
  - พับ strip → tree สูงขึ้นทันที
  - `resize_window` 768 และ 375: rail ลงใต้ tree, ไม่มี horizontal scroll ของหน้า
  - dark theme + en ครบ
  - กด "วิธีใช้งาน" → ทุก step ชี้ element ถูก (stats, tree, โหนด, ปุ่มแบบฝึกหัด, sessions)
  - `read_console_messages` ไม่มี error ใหม่

- [ ] **Step 7: สรุปให้ผู้ใช้** — diff + screenshot desktop/mobile

---

### Task 5: ป้าย "เริ่มเลย" บนโหนดที่แนะนำ

Backend: `GET /branch/:branchId/recommendation` (`adt-learning/server/app/src/controller/branch.controller.ts:136`) คืน `{ isError, data: RecommendedSkillDto | null, errorMassege }` โดย `RecommendedSkillDto = { skillId, skillCode, skillsName, tier, pL }` — ไม่ต้องแก้ backend

**Files:**
- Create: `src/models/recommendationModel.ts`
- Create: `src/component/home/recommendation.service.ts`
- Create: `src/component/home/controller/recommendation.controller.ts`
- Modify: `src/component/home/skillTree/SkillTreeSVG.tsx` (props + bounds + badge)
- Modify: `src/component/home/controller/homeShell.controller.ts`
- Modify: `src/component/home/HomeShell.tsx`, `src/component/home/tabs/HomeTab.tsx`
- Modify: `src/component/decorate/Home.css`, `src/i18n/th.ts`, `src/i18n/en.ts`

**Interfaces:**
- Produces:
  - `interface RecommendedSkill { skillId: number; skillCode: string; skillsName: string; tier: string; pL: number }`
  - `recommendationService.getRecommendation(branchId: number): Promise<ApiResponse<RecommendedSkill | null>>`
  - `useRecommendationController(branchId: number | null): { recommendedSkillId: number | null }`
  - `SkillTreeSVG` props ใหม่ `recommendedSkillId?: number | null`, `onRecommendedClick?: (skill: LayoutSkill) => void`
  - controller คืนเพิ่ม `recommendedSkillId: number | null` (เฉพาะเมื่อ skill นั้นอยู่ใน `treeSkills`)
  - `HomeTab` prop ใหม่ `recommendedSkillId: number | null`

- [ ] **Step 1: i18n** ต่อจาก `home.seeAll`

`th.ts`:
```ts
  "home.start": "เริ่มเลย",
  "home.startAria": "เริ่มฝึก {name}",
```
`en.ts`:
```ts
  "home.start": "Start",
  "home.startAria": "Start practising {name}",
```

- [ ] **Step 2: `src/models/recommendationModel.ts`**

```ts
// GET /branch/:branchId/recommendation — ตรงกับ RecommendedSkillDto ของ backend
// frontend ใช้แค่ skillId ระบุโหนด; ห้ามเอา pL ไปแสดงหรือคำนวณเป็นตัวเลขให้นักศึกษา (ADR 0001)
export interface RecommendedSkill {
  skillId: number;
  skillCode: string;
  skillsName: string;
  tier: string;
  pL: number;
}
```

- [ ] **Step 3: `src/component/home/recommendation.service.ts`**

```ts
import { AppClient } from "../../API/appRestApi";
import { ApiResponse } from "../../models/apiResponse";
import { RecommendedSkill } from "../../models/recommendationModel";

export class RecommendationService {
  // ทักษะที่ backend แนะนำให้ฝึกต่อใน branch นี้ — null = ไม่มีอะไรแนะนำ (เช่น ครบทุกทักษะแล้ว)
  getRecommendation = async (branchId: number): Promise<ApiResponse<RecommendedSkill | null>> => {
    try {
      const result = await AppClient.get(`/branch/${branchId}/recommendation`);
      let data: RecommendedSkill | null = null;
      let isError = false;
      let errorMessage = "";

      if (result && typeof result === "object" && "isError" in result) {
        const rawRes = result as any;
        isError = rawRes.isError;
        data = (rawRes.data as RecommendedSkill | null) ?? null;
        errorMessage = rawRes.errorMassege || "";
      } else {
        data = (result as RecommendedSkill | null) ?? null;
      }

      return { isError, data, errorMessage };
    } catch (error: any) {
      return {
        isError: true,
        data: null,
        errorMessage: error.message || "Failed to fetch recommendation",
      };
    }
  };
}

export const recommendationService = new RecommendationService();
```

- [ ] **Step 4: `src/component/home/controller/recommendation.controller.ts`**

```ts
import { useEffect, useState } from "react";
import { recommendationService } from "../recommendation.service";

// โหลดใหม่ทุกครั้งที่เปลี่ยน branch; กลับจากหน้า exercise HomeShell mount ใหม่อยู่แล้วจึงได้ค่าล่าสุด
// error หรือไม่มีคำแนะนำ → null (UI แค่ไม่แสดงป้าย ไม่ต้องแจ้งผู้ใช้)
export function useRecommendationController(branchId: number | null) {
  const [recommendedSkillId, setRecommendedSkillId] = useState<number | null>(null);

  useEffect(() => {
    setRecommendedSkillId(null);
    if (!branchId) return;
    let cancelled = false;
    recommendationService.getRecommendation(branchId).then((res) => {
      if (cancelled) return;
      setRecommendedSkillId(!res.isError && res.data ? res.data.skillId : null);
    });
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  return { recommendedSkillId };
}

export type RecommendationControllerType = ReturnType<typeof useRecommendationController>;
```

- [ ] **Step 5: `homeShell.controller.ts`**

เพิ่ม import:
```ts
import { useRecommendationController } from "./recommendation.controller";
```
ต่อจาก `const profileController = useUserProfileController();`:
```ts
  const recommendationController = useRecommendationController(branchId);
  // แสดงป้ายเฉพาะเมื่อ skill ที่แนะนำอยู่ใน tree ของ branch นี้จริง
  const recommendedSkillId =
    skillTreeController.treeSkills.find((s) => s.skillId === recommendationController.recommendedSkillId)
      ?.skillId ?? null;
```
ใน object ที่ return เพิ่มใต้ `handleNodeClick,` / `handleGoalClick,`:
```ts
    recommendedSkillId,
```

- [ ] **Step 6: `SkillTreeSVG.tsx`**

ใน `SkillTreeSVGProps` เพิ่ม:
```tsx
  /** โหนดที่ backend แนะนำให้ฝึกต่อ — วาดป้าย "เริ่มเลย" เหนือโหนดนั้น */
  recommendedSkillId?: number | null;
  onRecommendedClick?: (skill: LayoutSkill) => void;
```
ใต้ `const truncateName = …` เพิ่ม:
```tsx
const BADGE_W = 120;
const BADGE_H = 38;
const BADGE_GAP = 14; // ระยะจากขอบบนโหนดถึงปลายหางป้าย
```
ใน destructure เพิ่ม `recommendedSkillId = null, onRecommendedClick,`
ต่อจาก `const isGoalParent = …` เพิ่ม:
```tsx
  // ป้ายแสดงเฉพาะโหนดที่เปิดได้จริง — กันกรณี backend กับ unlock rule ฝั่งนี้เห็นไม่ตรงกัน
  const recommended =
    recommendedSkillId != null && onRecommendedClick
      ? skills.find(
          (s) => s.skillId === recommendedSkillId && (unlocked.has(s.skillId) || canUnlockFn(s.skillId))
        ) ?? null
      : null;
```
แทนที่:
```tsx
  const minY = Math.min(...placed.map((s) => s.y || 0)) - NODE_H / 2 - 40;
```
ด้วย:
```tsx
  // เผื่อที่ด้านบนให้ป้าย "เริ่มเลย" เมื่อโหนดแนะนำอยู่แถวบนสุด
  const badgePad = recommended ? BADGE_H + BADGE_GAP + 12 : 0;
  const minY = Math.min(...placed.map((s) => s.y || 0)) - NODE_H / 2 - 40 - badgePad;
```
ใน `return ( <ScrollableSVG … > )` ท้ายไฟล์ (จาก Task 4) เพิ่ม prop ให้เปิดหน้ามาแล้วเลื่อนไปที่โหนดแนะนำ:
```tsx
    <ScrollableSVG
      minX={minX}
      minY={minY}
      width={svgWidth}
      height={svgHeight}
      className="skill-tree-svg"
      focus={recommended ? { x: recommended.x, y: recommended.y } : null}
    >
```
แทนที่:
```tsx
      {/* Goal node — the end of every branch's tree (adt-learning/docs/adr/0005) */}
      {goal && renderGoalNode(goal)}
    </>
```
ด้วย:
```tsx
      {/* Goal node — the end of every branch's tree (adt-learning/docs/adr/0005) */}
      {goal && renderGoalNode(goal)}

      {/* ป้าย "เริ่มเลย" — วาดท้ายสุดให้อยู่บนทุกอย่าง; อยู่ใน SVG เดียวกันจึงซูม/เลื่อนตาม tree */}
      {recommended && onRecommendedClick && (() => {
        const bx = recommended.x - BADGE_W / 2;
        const by = recommended.y - NODE_H / 2 - BADGE_GAP - BADGE_H;
        const tailY = by + BADGE_H;
        const start = () => onRecommendedClick(recommended);
        return (
          <g
            className="tree-start-badge"
            role="button"
            tabIndex={0}
            aria-label={t("home.startAria", { name: recommended.skillsName })}
            onClick={(e) => {
              e.stopPropagation();
              start();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                start();
              }
            }}
          >
            <rect x={bx} y={by} width={BADGE_W} height={BADGE_H} rx={10} className="tree-start-badge-bg" />
            <path
              d={`M${recommended.x - 8},${tailY} L${recommended.x},${tailY + 9} L${recommended.x + 8},${tailY} Z`}
              className="tree-start-badge-bg"
            />
            <text
              x={recommended.x}
              y={by + BADGE_H / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={18}
              fontWeight="800"
              className="tree-start-badge-text"
            >
              {t("home.start")}
            </text>
          </g>
        );
      })()}
    </>
```

- [ ] **Step 7: ส่งต่อใน `HomeTab.tsx` และ `HomeShell.tsx`**

`HomeTabProps` เพิ่ม `recommendedSkillId: number | null;` + ใส่ใน destructure แล้วใน `<SkillTreeSVG …>` เพิ่ม:
```tsx
              recommendedSkillId={recommendedSkillId}
              onRecommendedClick={onStartExercise}
```
`HomeShell.tsx` ใน `<HomeTab …>` เพิ่ม:
```tsx
              recommendedSkillId={controller.recommendedSkillId}
```
(`onStartExercise` = `controller.handleStartExercise` → เปิด `ExerciseConfirmModal` ตาม flow เดิม)

- [ ] **Step 8: `Home.css`** ต่อจากกลุ่ม `.tree-legend*`

```css
/* ป้าย "เริ่มเลย" เหนือโหนดที่ระบบแนะนำ — สีผ่าน class (var() ใช้ใน fill="" ไม่ได้) */
.tree-start-badge { cursor: pointer; animation: startBob 1.6s ease-in-out infinite; }
.tree-start-badge-bg { fill: var(--surface); stroke: var(--accent); stroke-width: 2.5; }
.tree-start-badge-text { fill: var(--accent); }
.tree-start-badge:hover .tree-start-badge-bg { fill: var(--tint); }
.tree-start-badge:focus { outline: none; }
.tree-start-badge:focus-visible .tree-start-badge-bg { stroke-width: 4; }
@keyframes startBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@media (prefers-reduced-motion: reduce) { .tree-start-badge { animation: none; } }
```

- [ ] **Step 9: Type-check**

Run: `npx tsc -b 2>&1 | Select-String "recommendation|SkillTreeSVG|HomeTab|HomeShell|homeShell|i18n"`
Expected: ไม่มี error ใหม่

- [ ] **Step 10: ตรวจใน browser**
  - `read_network_requests` urlPattern `recommendation` → 200 และ `data.skillId` ตรงกับโหนดที่มีป้าย
  - ป้าย "เริ่มเลย" ลอยเหนือโหนดนั้น ขยับขึ้นลงเบาๆ, scroll ไปพร้อม tree, ไม่ถูกตัดขอบเมื่อโหนดอยู่แถวบนสุด
  - เปิดหน้า Home → กรอบ tree เลื่อนให้โหนดที่มีป้ายอยู่ในจอเอง (ลองกับ branch ที่โหนดแนะนำอยู่แถวล่างๆ); เลื่อนเองแล้ว hover/คลิกโหนดอื่น → ไม่ถูกดึงกลับ
  - คลิกป้าย → `ExerciseConfirmModal` ของ skill นั้น (ไม่เปิด side panel ซ้อน); Tab ไปที่ป้ายแล้วกด Enter → ผลเดียวกัน
  - เปลี่ยน goal ด้วย GoalSwitcher → ป้ายย้ายตาม branch ใหม่
  - branch ที่ครบทุกทักษะ (data null) → ไม่มีป้าย ไม่มี error ใน console
  - dark theme: ป้ายพื้น surface ขอบ/ตัวอักษร accent อ่านชัด; en แสดง "Start"

- [ ] **Step 11: สรุปให้ผู้ใช้** — diff + screenshot ป้าย

---

### Task 6: ตรวจรวมทั้งหมด + อัปเดตเอกสาร

**Files:**
- Modify: `CLAUDE.md` และ `GEMINI.md` ที่ root (`D:\userprofile_project\project\`) — ต้องแก้คู่กัน

- [ ] **Step 1: tsc รอบสุดท้ายเทียบ baseline**

```powershell
npx tsc -b 2>&1 | Out-File -Encoding utf8 $env:TEMP\tsc-after.txt; (Select-String -Path $env:TEMP\tsc-after.txt -Pattern "error TS").Count
Compare-Object (Get-Content $env:TEMP\tsc-baseline.txt) (Get-Content $env:TEMP\tsc-after.txt) | Where-Object SideIndicator -eq "=>"
```
Expected: จำนวน ≤ baseline และ Compare-Object ไม่มีบรรทัด `=>` ที่เป็น error ใหม่

- [ ] **Step 2: Smoke test ครบวง** (browser pane, light+dark, th+en, 1440/768/375)
  - Login → Home: strip, tree, rail, ป้าย
  - คลิกป้าย → confirm → หน้า exercise → ตอบ 1 ข้อ → ออก → กลับ Home: progress ของโหนดอัปเดต, ป้ายอาจย้าย
  - แท็บ History / Profile ยังทำงาน, เมนูเหลือ 3 อัน
  - "วิธีใช้งาน" บนทั้ง 3 แท็บเดินจบได้; ไม่มี tour เด้งขึ้นเองตอนเข้าหน้า

- [ ] **Step 3: อัปเดต `CLAUDE.md` + `GEMINI.md`** ในส่วน Frontend Architecture เพิ่ม bullet (ข้อความเดียวกันทั้งสองไฟล์):

```markdown
- **Home = skill tree.** There is no separate Skill Tree tab any more — the student sidebar has Home / History / Profile only. `HomeTab` is a collapsible `HomeProfileStrip` (greeting + 4 `StatCard`s, collapsed state in `localStorage.homeProfileCollapsed`) above a grid of the `SkillTreeSVG` and a right rail. The tree does not zoom or pan: `ScrollableSVG` draws it at a fixed scale (container width ÷ tree width, clamped to 0.7–1) and the box scrolls, opening scrolled to the recommended node. The rail holds (next-exercise, progress summary, last 3 sessions). A "Start" badge marks the skill from `GET /branch/:id/recommendation` (`useRecommendationController`); the frontend only uses its `skillId`. Router state `{ tab: "SkillTree" }` or any unknown tab falls back to Home. Tours never auto-start — only the Help button starts one.
```
และแก้ bullet `src/component/common/` ให้ระบุว่า `StatCard` ใช้ class `.stat-card` + token ของ `Home.css` (ไม่ใช่ Tailwind)

- [ ] **Step 4: สรุปงานทั้งหมดให้ผู้ใช้** — รายการไฟล์ที่แก้/สร้าง/ลบ, screenshot สุดท้าย, และถามว่าจะให้ commit ไหม (working tree มีงานค้างอื่นใน `Home.css` ต้องแยก hunk ตอน commit)
