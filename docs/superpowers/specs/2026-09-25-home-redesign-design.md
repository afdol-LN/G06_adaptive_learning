# Home redesign — skill tree เป็นหัวใจของหน้า

- วันที่: 2026-09-25
- ขอบเขต: `G06_adaptive_learning/` (frontend) เท่านั้น — backend ใช้ endpoint ที่มีอยู่แล้ว ไม่แก้
- แรงบันดาลใจ: หน้า "เรียนรู้" ของ Duolingo — เส้นทางบทเรียนอยู่กลางจอ, ข้อมูลรองอยู่คอลัมน์ขวา

## ปัญหา

`HomeTab` ตอนนี้เรียงทุกอย่างเป็นคอลัมน์เดียว: hero → stats 4 ใบ → progress summary → skill tree (`zoomable={false}`) → ปุ่มแบบฝึกหัดถัดไป → sessions ล่าสุด 5 รายการ
skill tree ซึ่งเป็นสิ่งที่นักศึกษาใช้จริงอยู่ลำดับที่ 4 ต้อง scroll ถึงเห็น และมีแท็บ `SkillTree` แยกที่แสดง tree ตัวเดียวกันซ้ำ (แค่ zoom ได้)

## เป้าหมาย

1. Skill tree อยู่กลางจอ สูงเต็มพื้นที่ แสดงขนาดใหญ่อ่านชัดและ scroll ดู (ไม่ zoom) — เป็นสิ่งแรกที่เห็น
2. รวมแท็บ SkillTree เข้ากับ Home (เหลือเมนู Home / History / Profile)
3. ข้อมูลผู้ใช้ + stats อยู่ใน **Profile strip** แนวนอนเต็มแถว พับ/กางได้
4. ป้าย **"เริ่มเลย"** ลอยเหนือโหนดที่ระบบแนะนำ
5. ใช้ component เดิมให้มากที่สุด — เปลี่ยนการจัดวาง ไม่เขียน tree ใหม่

## ไม่ทำ (non-goals)

- ไม่เปลี่ยน layout algorithm ของ tree (`layoutSkills`/`layoutGoalNode`) เป็นเส้นทางซิกแซก
- ไม่แก้ backend / ไม่เพิ่ม endpoint
- ไม่แตะหน้า History / Profile นอกจากสิ่งที่จำเป็นจากการลบแท็บ SkillTree

## 1. โครงหน้าและการนำทาง

```
┌────────┬──────────────────────────────────────────────────────────────┐
│Sidebar ║ Profile strip (น้ำเงิน, พับได้)                          [▲]   │
│        ║ (avatar) ยินดีต้อนรับกลับ / ชื่อ / เป้าหมาย [ที่มาคะแนน] │ 4 │ 6 │ 2 │ 51.05% │
│        ├──────────────────────────────────────────┬───────────────────┤
│        │                                          │ ▶ แบบฝึกหัดถัดไป    │
│        │           SKILL TREE (zoomable)          │ Progress summary  │
│        │           [เริ่มเลย] เหนือโหนดแนะนำ       │ Sessions ล่าสุด 3   │
└────────┴──────────────────────────────────────────┴───────────────────┘
```

- `NAV_ITEMS` ใน `HomeShell.tsx` เหลือ Home / History / Profile; `HomeTabKey` ตัด `"SkillTree"` ออก
- ลบ `tabs/SkillTreeTab.tsx` และ block `activeTab === "SkillTree"` ใน `HomeShell`
- **ทางเข้าเดิมที่ชี้ไปแท็บ SkillTree ต้องไม่พัง:**
  - `useExerciseController.ts:196` `goToSkillTree` → navigate ไป `/home` โดย `state: { tab: "Home" }` (หรือไม่ส่ง tab)
  - `homeShell.controller.ts` ตอนอ่าน `location.state.tab` ถ้าได้ค่าที่ไม่ใช่ `HomeTabKey` ที่รู้จัก → fallback เป็น `"Home"`
- `HomeTab` layout ใหม่ = CSS grid
  - แถว 1: `HomeProfileStrip` (เต็มความกว้าง)
  - แถว 2: `.home-tree-wrap` (`1fr`, สูง `calc(100vh - topbar - strip)` ขั้นต่ำ ~480px) + `.home-rail` (~320px)
  - จอ < 1024px: grid เป็นคอลัมน์เดียว rail ลงไปอยู่ใต้ tree
- Tree: `SkillTreeSVG` ตัวเดิม แต่ **ไม่ zoom/pan** — แสดงที่ขนาดคงที่ใหญ่พอให้อ่านโหนดชัด แล้ว**เลื่อน (scroll) ดู**แทน:
  - component ใหม่ `skillTree/ScrollableSVG.tsx` วัดความกว้างกรอบด้วย `ResizeObserver` แล้วคำนวณ `scale = clamp(กว้างกรอบ / กว้าง tree, 0.7, 1)` → กำหนด `width/height` ของ `<svg>` เป็น px จริง (`svgWidth × scale`, `svgHeight × scale`)
  - กรอบ tree เป็น scroll container (`overflow: auto`) — tree ยาวเลื่อนลง, tree กว้างกว่ากรอบที่ scale 0.7 เลื่อนแนวนอนได้ (เริ่มที่กึ่งกลาง)
  - scale ต่ำสุด 0.7 = ชื่อโหนด (19px) แสดง ~13px, โหนดกว้าง ~182px — ไม่เล็กจนอ่านไม่ออกเหมือนโหมดเดิมที่ย่อทั้ง tree ให้พอดีกรอบ
  - เปิดหน้ามาแล้วเลื่อนให้โหนดที่มีป้าย "เริ่มเลย" อยู่ในจอเองครั้งเดียว (ไม่มีป้าย → อยู่บนสุด กึ่งกลางแนวนอน)
  - ลบ prop `zoomable` และไฟล์ `ZoomableSVG.tsx` (ไม่เหลือผู้ใช้หลังรวมแท็บ)
- ลบปุ่ม `.tree-expand-btn` (ไม่มีแท็บให้ไปแล้ว); legend สีคงไว้มุมขวาบนของกรอบ tree (อยู่นอก scroll container จึงไม่เลื่อนหายไป)
- `SkillSidePanel` / `GoalSidePanel` คงเป็น drawer เหมือนเดิม
- ลบ state/prop ที่ไม่ใช้แล้วจาก `HomeTab` (`switchTab` ถ้าไม่เหลือผู้ใช้ — ยกเว้นลิงก์ "ดูทั้งหมด" ของ sessions ที่ใช้ไปแท็บ History)

## 2. Profile strip — component ใหม่ `home/component/HomeProfileStrip.tsx`

**กาง (ค่าเริ่มต้น)**
- พื้นน้ำเงินต่อจากขอบ sidebar (ไม่มีช่องว่างซ้าย)
- ซ้าย: avatar (`FaUserGraduate`) · "ยินดีต้อนรับกลับ" · ชื่อเต็ม · badge เป้าหมาย · ปุ่ม "ที่มาคะแนน" (`FaChartSimple`, แสดงเฉพาะเมื่อ `onShowBreakdown` ถูกส่งมา = ทำ pretest แล้ว)
- ขวา: stats 4 ช่องเรียงแนวนอน — ทักษะที่ปลดล็อก / session ที่ทำแล้ว / วันต่อเนื่อง / ความคืบหน้าเป้าหมาย % + sub `2/5 ทักษะ` หรือ "สำเร็จแล้ว" (logic `statsList` เดิมจาก `HomeTab` ย้ายมาทั้งก้อน)
- ปุ่มพับ `FaChevronUp` มุมขวา, `aria-expanded="true"`, `aria-label` = `home.profile.collapse`
- stats ใช้ **`common/StatCard`** — แก้ตัว component ให้รองรับ theme ก่อน:
  - ตอนนี้เป็น Tailwind class ตายตัว (`bg-white`, `text-slate-*`) พัง dark theme และ**ไม่มีหน้าไหน import ใช้อยู่** จึงแก้ได้โดยไม่กระทบที่อื่น
  - เปลี่ยนเป็น class ของ project (`stat-card` + tone `gold`/`green`/`blue`/`purple` ผ่าน `colorClass`) ที่สีมาจาก token ใน `Home.css` ซึ่งมีค่า dark แล้ว
  - เพิ่ม prop optional `sub?: string` (บรรทัด `2/5 ทักษะ`); props เดิม `title`/`value`/`icon`/`colorClass` คงไว้

**พับ**
- เหลือปุ่มเล็กชิดซ้าย: ไอคอนคน (`FaUserGraduate`) + `FaChevronDown`, `aria-expanded="false"`, `aria-label` = `home.profile.expand`
- กดแล้วกางกลับ

**State**
- `profileStripCollapsed` อยู่ใน `homeShell.controller.ts` แบบเดียวกับ `sidebarCollapsed`: อ่าน/เขียน `localStorage` คีย์ `homeProfileCollapsed` (`"1"`/`"0"`), ค่าเริ่มต้นกาง
- ตัด typewriter effect ออก — แสดงชื่อเต็มทันที

**สไตล์**
- class prefix `hps-` ใน `decorate/Home.css`
- สีใช้ token ที่ hero เดิมใช้อยู่แล้ว (`--accent-fill` พื้น, `--on-accent` ตัวอักษร, `color-mix` ของ `--on-accent` สำหรับ chip/ปุ่ม) ซึ่งมีค่าทั้ง light และ dark อยู่แล้ว — ไม่ต้องเพิ่ม token ใหม่ และไม่มี hex ที่ใช้ได้แค่ theme เดียว
- ปุ่ม icon-only คง `flex-shrink: 0` บน svg

## 3. Right rail และป้าย "เริ่มเลย"

**Right rail `.home-rail`** (การ์ดเรียงบนลงล่าง):
1. ปุ่ม `.btn-next-exercise` → เปิด `NextExercisePicker` เหมือนเดิม
2. Progress summary — markup เดิม (`progress-summary-list`) เปลี่ยน CSS ให้เป็น list แนวตั้งเต็มความกว้าง rail; ปุ่ม breakdown ย้ายไปอยู่ใน strip แล้ว
3. Sessions ล่าสุด **3** รายการ (`SessionCard`) + ลิงก์ "ดูทั้งหมด" → `switchTab("History")`

**ป้าย "เริ่มเลย"**
- Backend มี `GET /branch/:branchId/recommendation` อยู่แล้ว (`branch.controller.ts`, ตรวจความเป็นเจ้าของ branch ผ่าน `loadOwnedBranch`) คืน `RecommendedSkillDto | null`
- Frontend เพิ่มตาม pattern service → controller → UI:
  - `models/recommendationModel.ts` — type ตาม DTO (อ่าน shape จริงจาก `RecommendedSkillDto` ตอน implement)
  - `home/recommendation.service.ts` — `AppClient.get(\`/branch/${branchId}/recommendation\`)` คืน `ApiResponse<RecommendedSkill | null>`
  - `home/controller/recommendation.controller.ts` — hook `useRecommendationController(branchId, refreshKey)` คืน `recommendedSkillId: number | null`; refetch เมื่อ branch เปลี่ยน
- `SkillTreeSVG` รับ prop ใหม่ `recommendedSkillId?: number | null` และ `onRecommendedClick?: (skill) => void`
  - วาดป้าย (bubble + หางชี้ลง) เหนือโหนดนั้น ใน SVG เดียวกัน จึงเลื่อน/ซูมตาม tree
  - สีผ่าน `style`/`className` + token (ไม่ใช้ `fill="var(--x)"`)
  - กดป้าย → `controller.handleStartExercise(skill)` → เปิด `ExerciseConfirmModal` (flow เดิม)
- ถ้า response เป็น `null`, error, หรือ skill id ไม่อยู่ใน `treeSkills` → ไม่แสดงป้าย ไม่มี toast

## 4. Tour, i18n, ตรวจสอบ

**Tour (`homeTour.controller.ts`)**
- ลบ `SkillTree` ออกจาก `TourPage` และ `TOURS`; ลบ `SkillTree` ใน object `setSeen` fallback
- Home tour: คง `tour-stats` (ติดที่กลุ่ม stats ใน strip), `tour-skill-tree` (กรอบ tree), `.btn-next-exercise`, `tour-sessions` (การ์ด sessions ใน rail) และเพิ่ม step โหนดที่คลิกได้ (ย้ายจาก `tour.skillTree.node.*`) ต่อจาก `tour-skill-tree`
- **ไม่มี auto-start tour** — tour เริ่มได้ทางเดียวคือกดปุ่ม "วิธีใช้งาน" (`handleHelpClick` → `startTour(activeTab, { force: true })`) ซึ่งเป็นพฤติกรรมปัจจุบันอยู่แล้ว ห้ามเพิ่ม auto-start กลับมา; คนที่เคยดู tour แล้วไม่ต้องรีเซ็ตสถานะ
- ถ้า strip พับอยู่ตอนกด "วิธีใช้งาน" → กาง strip ก่อนเริ่ม tour (ให้ `tour-stats` มี element ให้ชี้)

**i18n** (`th.ts` + `en.ts` คู่กันเสมอ)
- เพิ่ม: `home.start` (เริ่มเลย / Start), `home.profile.expand`, `home.profile.collapse`, `home.seeAll`
- ลบ key ที่ไม่มีผู้ใช้แล้ว: `nav.skillTree`, `home.expandTree`, `home.treeLabel` (ถ้าไม่ใช้), `tour.skillTree.canvas.*`; ย้าย `tour.skillTree.node.*` → ใช้ต่อใน Home tour (เปลี่ยนชื่อ key ได้ถ้าจำเป็น)

**ตรวจสอบ**
- `npx tsc -b` — เทียบกับ baseline ก่อนแก้ ไฟล์ที่แตะต้องไม่มี error ใหม่
- Browser pane (dev server): light/dark × th/en; strip กาง/พับ + reload แล้วจำสถานะ; จอ 375 / 768 / 1440; zoom/pan tree; กดโหนด → side panel; กดป้าย "เริ่มเลย" → confirm modal; ไม่มี recommendation → ไม่มีป้าย; ปุ่มกลับจากหน้า exercise (`goToSkillTree`) → ลงหน้า Home; รัน Home tour ครบทุก step

## ไฟล์ที่จะแตะ

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `component/home/HomeShell.tsx` | ตัด nav/แท็บ SkillTree, ส่ง prop strip + recommendation |
| `component/home/controller/homeShell.controller.ts` | `HomeTabKey`, fallback tab, `profileStripCollapsed` |
| `component/home/tabs/HomeTab.tsx` | layout ใหม่ (strip + tree + rail) |
| `component/home/tabs/SkillTreeTab.tsx` | ลบ |
| `component/home/component/HomeProfileStrip.tsx` | ใหม่ |
| `component/common/StatCard.tsx` | เลิก Tailwind → class `stat-card` + token, เพิ่ม `sub` |
| `component/home/recommendation.service.ts`, `controller/recommendation.controller.ts`, `models/recommendationModel.ts` | ใหม่ |
| `component/home/skillTree/SkillTreeSVG.tsx` | ตัด `zoomable`, render ผ่าน `ScrollableSVG`, prop `recommendedSkillId` + ป้าย |
| `component/home/skillTree/ScrollableSVG.tsx` | ใหม่ — scale คงที่ + scroll + เลื่อนไปโหนดแนะนำ |
| `component/home/skillTree/ZoomableSVG.tsx` | ลบ |
| `component/home/controller/homeTour.controller.ts` | ตัด SkillTree tour, ย้าย step โหนด |
| `component/exercise/controller/useExerciseController.ts` | `goToSkillTree` → Home |
| `component/decorate/Home.css` | grid, strip (`hps-`), rail, ป้าย, token dark |
| `i18n/th.ts`, `i18n/en.ts` | key ใหม่/ลบ |
