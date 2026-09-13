---
name: ADT Learning Design System
status: source of truth for all screens (student, admin, onboarding)
look-reference: src/component/SignInAndUp.tsx + src/component/decorate/signInAndUp.css   # login / register
token-reference: src/component/decorate/Home.css                                         # student shell, light + dark
theme-switch: src/context/PreferencesContext.tsx → <html data-theme="light|dark">
updated: 2026-09-10
---

# ADT Learning Design System

One visual language for every screen: student shell, admin panel, onboarding flow, modals.

It is assembled from the two most finished parts of the app:

- **The look comes from Login / Register**: cobalt on white glass, the field style, button, tabs, type scale, radius ladder, motion.
- **The vocabulary comes from the student shell (`Home.css`)**: token names, the light/dark mechanism, dark-mode surface values, status and curriculum tokens. It already runs in both themes.

Where the two disagree on a *visible* value, the login page wins. Otherwise the value already in wider use is kept.
Values marked **(new)** exist only in this document, and no screen uses them yet.

> §3 holds the tokens (paste-ready CSS) · §7 the two layouts · §8 the component catalogue ·
> §11 how to move a screen onto the system, with the legacy-name mapping · §12 what deviates today.

---

## 1. Principles

1. **Cobalt on white glass.** Near-white ground, frosted translucent surfaces, one saturated cobalt accent. Colour comes from the accent and the soft blue backdrop, not from many hues.
2. **One loud thing per view.** The cobalt gradient is reserved for the primary action and the active tab. Everything else is glass, solid surface, outline, or text.
3. **Depth is blue and soft.** Long, low-opacity, cobalt-tinted shadows (`rgba(0,71,171,…)`) with a 1px white inner top edge. Wells (inputs, tracks) use *inset* shadows. No grey drop shadows.
4. **Chrome whispers, content speaks.** Labels, tabs, buttons and table headers are small, uppercase and tracked. Titles, body and values are sentence case and larger.
5. **Springy, not bouncy.** One overshoot curve and small moves (1–3px lifts, 0.97–0.99 presses).
6. **Two themes, one set of names.** Every colour is a token re-declared for dark. A hex that only works in one theme is a bug (the same rule `Home.css` states in its header).

---

## 2. Theming

- **Source:** `PreferencesContext` writes `document.documentElement.dataset.theme` (`light`/`dark`). It persists the choice in `localStorage["theme"]` and falls back to the OS setting until the user picks one.
- **Control:** the sun/moon switch in `common/Topbar.tsx`.
- **Stylesheets:** light tokens on `:root`, dark overrides on `:root[data-theme="dark"]`, and components reference tokens only.
- **Interim collision guard (until `tokens.css` exists):** several stylesheets still declare the same names on a global `:root` with different values, and the last one loaded wins. `Home.css` protects itself by declaring its tokens on `:root, .app` and `:root[data-theme="dark"] .app`. A screen migrating before §11 step 1 lands should do the same on its own root class.
- **Retire** the other mechanisms: `.auth-page[data-theme]` (login, local state, not persisted), `.sb2-root.dark` (SelectBranch), and `@media (prefers-color-scheme: dark)` (legacy `/skilltree`).

---

## 3. Tokens

Proposed home: `src/styles/tokens.css`, imported at the top of `src/index.css` (this file does not exist yet, see §11).

```css
:root {
  /* ── Ground & surfaces ── */
  --bg:            #f2f7fa;                  /* app-shell ground                          */
  --bg-focus:      #ffffff;                  /* focus-layout ground (login, onboarding)    */
  --surface:       #ffffff;                  /* solid card, table, sidebar                 */
  --surface-2:     #f8fafc;                  /* subtle fill: segmented bg, tracks, cancel  */
  --tint:          #e8f0fe;                  /* accent-tinted fill: active row, hero       */
  --tint-2:        #f0f9ff;
  --overlay:       rgba(0,40,120,0.18);      /* modal scrim                                */

  /* ── Glass (contextual, see §3.3) ── */
  --glass:         rgba(255,255,255,0.97);   /* shell: topbar, popovers                    */
  --glass-strong:  rgba(255,255,255,0.97);
  --glass-edge:    rgba(255,255,255,0.75);
  --glass-hi:      rgba(255,255,255,0.90);   /* 1px inner top highlight                    */

  /* ── Fields ── */
  --field:         rgba(244,248,255,0.62);
  --field-on:      rgba(255,255,255,0.92);   /* focused                                    */
  --field-edge:    rgba(11,26,74,0.16);
  --field-shadow:  inset 0 2px 5px rgba(11,26,74,0.10), inset 0 0 0 1px rgba(255,255,255,0.35);

  /* ── Ink ── */
  --text:          #0b1a4a;                  /* titles, values, body          16.7:1       */
  --ink:           #0f172a;                  /* strong neutral (names in lists)            */
  --ink-soft:      #475569;
  --label:         #0b1120;                  /* field labels, idle tabs                    */
  --muted:         #5c6f88;                  /* secondary copy, placeholders  5.1:1        */
  --faint:         #94a3b8;                  /* disabled / decorative only    2.6:1        */
  --brand-ink:     #000080;                  /* product name / wordmark                    */

  /* ── Lines ── */
  --border:        #c2d3e0;
  --border-soft:   #e2e8f0;
  --border-strong: #6d8196;                  /* non-text only (4.0:1)                      */

  /* ── Accent ── */
  --accent:        #0047ab;                  /* text, links, borders, icons   8.4:1        */
  --accent-fill:   #0047ab;                  /* FLAT solid under white text (used in border-color too) */
  --accent-2:      #4d7bff;                  /* focus border/ring, checked — never text    */
  --accent-soft:   #82c8e5;                  /* sky: backdrop blob, spinner arc            */
  --accent-gradient:   linear-gradient(135deg, #3366e0, #0047ab);  /* (new) primary button, 5.1:1 worst stop */
  --accent-gradient-2: linear-gradient(135deg, #0056d6, #0047ab);  /* active tab                */
  --on-accent:     #ffffff;
  --hover-tint:    rgba(77,123,255,0.10);
  --focus-ring:    0 0 0 4px rgba(77,123,255,0.18);

  /* ── Status: base = icons/borders/fills · -ink = text · -bg / -border = soft badge ── */
  --success: #059669;  --success-ink: #047857;  --success-bg: #ecfdf5;  --success-border: #a7f3d0;
  --danger:  #dc2626;  --danger-ink:  #dc2626;  --danger-bg:  #fef2f2;  --danger-border:  #fecaca;
  --warning: #d97706;  --warning-ink: #b45309;  --warning-bg: #fffbeb;  --warning-border: #fde68a;  /* (new) */
  --info:    #0369a1;  --info-ink:    #0369a1;  --info-bg:    #f0f9ff;  --info-border:    #bae6fd;  --info-track: #e0f2fe;

  /* ── Effects ── */
  --shadow-card:      0 24px 70px rgba(0,0,80,0.14), inset 0 1px 0 var(--glass-hi);
  --shadow-panel:     0 8px 32px rgba(0,71,171,0.10);
  --shadow-accent:    0 12px 30px rgba(0,71,171,0.32), inset 0 1px 0 rgba(255,255,255,0.35);
  --shadow-accent-lg: 0 20px 44px rgba(0,71,171,0.42);
  --shadow-float:     0 18px 44px rgba(6,42,82,0.18), inset 0 1px 0 rgba(255,255,255,0.6);
  --blur-card:  blur(26px) saturate(1.6);
  --blur-chip:  blur(14px);
  --blur-field: blur(8px);

  /* ── Radius ── */
  --r-xl: 24px;  --r-lg: 20px;  --r-md: 16px;  --r-sm: 14px;  --r-xs: 12px;  --r-2xs: 10px;  --r-pill: 999px;

  /* ── Motion ── */
  --ease-spring: cubic-bezier(.34, 1.56, .64, 1);
  --dur-fast: .18s;  --dur: .25s;  --dur-slow: .3s;

  /* ── Type (font-sans already lives in index.css) ── */
  --font-mono: 'DM Mono', ui-monospace, monospace;

  /* ── Layout ── */
  --sidebar-w: 240px;  --sidebar-w-collapsed: 68px;  --topbar-h: 57px;  --content-max: 1200px;
}

:root[data-theme="dark"] {
  color-scheme: dark;
  --bg:            #0b1220;
  --bg-focus:      #05070f;
  --surface:       #121b2e;
  --surface-2:     #172238;
  --tint:          #1a2a4a;
  --tint-2:        #142238;
  --overlay:       rgba(2,6,16,0.6);

  --glass:         rgba(18,27,46,0.97);
  --glass-strong:  rgba(18,27,46,0.97);
  --glass-edge:    rgba(255,255,255,0.14);
  --glass-hi:      rgba(255,255,255,0.18);

  --field:         rgba(6,10,22,0.55);
  --field-on:      rgba(6,10,22,0.85);
  --field-edge:    rgba(255,255,255,0.18);
  --field-shadow:  inset 0 2px 6px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.05);

  --text:          #e6ecff;
  --ink:           #e6ecff;
  --ink-soft:      #b3c0d8;
  --label:         #b9c7e6;
  --muted:         #93a4c4;
  --faint:         #6b7a96;
  --brand-ink:     #c9d8ff;

  --border:        #26344f;
  --border-soft:   #1f2b42;
  --border-strong: #33415c;

  --accent:        #6b9bff;                  /* cobalt is unreadable on dark — 6.9:1 on --bg */
  --accent-fill:   #2f5fd0;                  /* white on it 5.7:1                            */
  --hover-tint:    rgba(120,160,255,0.14);
  --focus-ring:    0 0 0 4px rgba(110,150,255,0.28);

  --success: #34d399;  --success-ink: #34d399;  --success-bg: rgba(52,211,153,0.12);  --success-border: rgba(52,211,153,0.35);
  --danger:  #f87171;  --danger-ink:  #f87171;  --danger-bg:  rgba(248,113,113,0.12); --danger-border:  rgba(248,113,113,0.35);
  --warning: #fbbf24;  --warning-ink: #fbbf24;  --warning-bg: rgba(251,191,36,0.12);  --warning-border: rgba(251,191,36,0.35);  /* (new) */
  --info:    #7cc4f0;  --info-ink:    #7cc4f0;  --info-bg:    #0f1d33;               --info-border:    #1f3a5c;  --info-track: #1a2c47;

  --shadow-card:  0 24px 70px rgba(0,0,0,0.45), inset 0 1px 0 var(--glass-hi);
  --shadow-panel: 0 8px 32px rgba(0,0,0,0.35);  /* (new) */
}
```

### 3.1 Colour roles

| Token | Use for | Never for |
|---|---|---|
| `--accent-gradient` | The one primary button per view | Anything else |
| `--accent-gradient-2` | Active tab (large) | Buttons |
| `--accent-fill` | Flat solid under white text: active segment, switch-on track, selected nav, badges | Gradients. It must stay a single colour because it is also used as `border-color`. |
| `--accent` | Links, accent text, icons, focus-adjacent borders, progress fill | Large filled areas |
| `--accent-2` | Focus border and ring, checked checkbox | Text (3.8:1) |
| `--accent-soft` | Backdrop blob, spinner arc, decoration | Anything that must be read |
| `--tint` | Selected / active row, hero strip | Hover (use `--hover-tint`) |
| `--muted` | Secondary copy, placeholders, meta | Primary content |
| `--faint`, `--border-strong` | Disabled text, dividers, scrollbar | Readable text |

### 3.2 Curriculum colours (domain)

These carry learning meaning and must look the same wherever they appear (home, skill tree, exercise, admin, AI drafts).
They **already exist in `Home.css`** with light and dark values. Move them into `tokens.css` verbatim, and don't re-pick them per screen.

| Scale | Tokens | Driven by | Rule |
|---|---|---|---|
| Mastery progress | `--prog-100` `--prog-75` `--prog-20` `--prog-1` `--prog-0` | `home/utils/skillTree.getProgressColor` | 100 → `-100`, ≥75 → `-75`, ≥20 → `-20`, >0 → `-1`, 0 → `-0` |
| Skill node state | `--node-{done,open,ready,locked}-{bg,border,text,bar}`, `--edge-{open,ready,locked}` | `getNodeColors` | done = 100% · open = unlocked · ready = all prerequisites ≥ 60% · locked |
| Behaviour class | `--beh-{mastery,fast,steady,slow,struggler}` | `home/utils/behavior.BEHAVIOR_META` | Labels via `t("behavior.*")` |
| Score grade | `--ok-*`, `--mid-*`, `--bad-*` (bg / ink / border) | Session score, answer icons | `--ok` ≡ success, `--bad` ≡ danger. Alias them to the status tokens when moving. |
| Skill tier T1–T3 | `--t{1..3}-{fill,stroke,text}` | Legacy `/skilltree` (`SkillTree.css`, `g07-`) | **T4/T5 undefined** even though `skill.tier` allows T1–T5 |
| Difficulty 1–5 | `--d{1..5}-{bg,fg}` | Legacy `/skilltree` | Light only, dark undefined |

### 3.3 Contextual tokens

Some tokens are re-declared on the layout root because the same role needs a different strength in each layout:

| Token | Shell (`.app`, default) | Focus layout root (e.g. `.auth-page`) |
|---|---|---|
| `--glass` | `rgba(255,255,255,.97)` · dark `rgba(18,27,46,.97)` | `rgba(255,255,255,.55)` · dark `rgba(24,34,60,.55)` |
| `--glass-strong` | same as `--glass` | `rgba(255,255,255,.62)` · dark `rgba(24,34,60,.60)` |
| page ground | `--bg` | `--bg-focus` |

The reason: in the shell there is nothing interesting to blur behind dense content, so glass is near-opaque. Over the focus-layout backdrop, translucency *is* the look.

### 3.4 Code

`common/CodeBlock.tsx` keeps its own Catppuccin Mocha palette on `.ctp-code`: always a dark box, in both themes. It is the one deliberate exception, so never point it at system tokens.

---

## 4. Typography

One family, `var(--font-sans)` (Noto Sans for Latin, IBM Plex Sans Thai Looped for Thai). **Thai only ships 100–700**, so never use 800/900.
Use `var(--font-mono)` for numbers in stats and tables, and for code.

| Style | Size | Weight | Tracking | Case | Colour | Example |
|---|---|---|---|---|---|---|
| Display | 28px | 500 | — | Sentence | `--text` | "Welcome back" |
| Page title | 16px | 700 | — | Sentence | `--text` | Topbar title |
| Section title | 18px | 600 | — | Sentence | `--text` | Modal / card heading |
| Stat value | 24px | 700 | — | — | `--text` | StatCard number |
| Body | 14px | 400–500 | — | Sentence | `--text` | Inputs, table cells |
| Small | 13px | 400 | — | Sentence | `--muted` | Sub-copy, helper text, links |
| Chrome | 14px | 500 / 600 active | 0.06em (buttons 0.08em) | UPPER | `--label` | Tabs, primary button |
| Micro label | 11px | 500 | 0.10em | UPPER | `--label` | Field labels, table headers, stat titles |
| Caption | 11px | 400 | — | — | `--muted` / status ink | Validation, divider, timestamps |

Thai has no letter case, so uppercase and tracking do nothing to it. Thai chrome relies on weight (500/600) and size to read as chrome.
Keep tracking ≤ 0.06em on Thai strings.

---

## 5. Space, shape, depth

**Spacing (px):** 4 · 6 · 8 · 12 · 14 · 16 · 20 · 24 · 28 · 36.
Field-to-field 14 · label-to-input 7 · focus card padding 26/36 · shell card padding 20/24 · page gutter 20–32.

**Radius ladder:** a nested element is always one step below its container.

| Token | px | Use |
|---|---|---|
| `--r-xl` | 24 | Focus-layout card |
| `--r-lg` | 20 | Toast, popover |
| `--r-md` | 16 | Shell card, modal, large tab item, StatCard |
| `--r-sm` | 14 | Primary / secondary button |
| `--r-xs` | 12 | Input, select, icon tile, brand icon |
| `--r-2xs` | 10 | Small button, segmented container, chip |
| `--r-pill` | 999 | Switch, progress, badge |

**Elevation:**

| Level | Token | Use |
|---|---|---|
| inset | `--field-shadow` | Inputs, tracks |
| 1 | `--shadow-panel` | Shell cards |
| 2 | `--shadow-card` | Glass card over the backdrop, modal |
| 3 | `--shadow-float` | Toast, dropdown, popover |
| accent | `--shadow-accent` / `-lg` on hover | Primary button, active tab |

**Z-index:** content 1–2 · fixed chrome 5 · topbar 40 · modal 1000 · toast 9999.

---

## 6. Motion

| Pattern | Spec |
|---|---|
| Hover / press response | `transform .2s var(--ease-spring)` |
| Hover lift | Button −3px · chip/toggle −2px · tab/row −1px |
| Press | `scale(.97–.99)` |
| Enter: header | fade down 16px, .6s |
| Enter: main card | fade up 20px, .7s, +.1s |
| Content swap (tab) | fade .3s |
| Toast | slide 56px from right + scale .96, spring |
| Theme change | `background-color, color .3s ease` |
| Progress | width .5s ease-out |
| Ambient | at most one per view (logo bob 4.5s, ±4px) |

Everything must honour `@media (prefers-reduced-motion: reduce)` by dropping transforms and keeping fades ≤ .2s. No screen does this yet.

---

## 7. Layouts

### 7.1 Focus layout: one task, centered
Login / Register, GetStart, Information form, Pretest, Select branch.

```
┌──────────────────────────── --bg-focus ─────────────────────────┐
│ ◐ --accent-soft blob (520px, blur 100, 50%)       [pref chip]   │
│                        [ brand mark ]                           │
│               ┌───── glass card --r-xl ─────┐                   │
│               │  (tabs)                      │  460px  forms    │
│               │  Display title / small sub   │  720px  content  │
│               │  fields …                    │                  │
│               │  [ primary action ]          │                  │
│               └──────────────────────────────┘                  │
│                            --accent blob (560px) ◑              │
└─────────────────────────────────────────────────────────────────┘
```
- **Backdrop:** two blurred blobs, sky top-left and cobalt bottom-right. The pointer-follow glow is optional, one per screen.
- **Surfaces are glass:** translucent `--glass-strong` (§3.3) + `--blur-card` + 1px `--glass-edge` + `--shadow-card`.
- The root owns a `100vh` box and scrolls internally, because the global `body { display:flex; place-items:center }` clips tall content.
- The theme follows `<html data-theme>`. The layout offers its own small theme/language chip, since there is no Topbar.

### 7.2 App shell: navigation plus dense content
Student `HomeShell` (the reference: `Home.css`), Admin home, Exercise.

```
┌──────────┬──────────────────────────────────────────────────────┐
│ sidebar  │ Topbar  --topbar-h · --glass · border-bottom          │
│ 240 / 68 ├──────────────────────────────────────────────────────┤
│ --surface│ --bg                                                  │
│          │ ┌ StatCard ┐ ┌ StatCard ┐ ┌ StatCard ┐                 │
│ nav item │ └──────────┘ └──────────┘ └──────────┘                 │
│ active = │ ┌──────────── solid card --r-md ────────────────┐     │
│ --tint + │ │ table / list / tree / form                     │     │
│ --accent │ └────────────────────────────────────────────────┘     │
└──────────┴──────────────────────────────────────────────────────┘
```
- **Surfaces are solid:** `--surface` + 1px `--border` + `--shadow-panel`. Glass only on floating layers (topbar, popovers, toasts, modals).
- No backdrop blobs and no pointer glow.
- Content max `--content-max`, gutter 24–32.

### 7.3 Breakpoints

| Width | Rule |
|---|---|
| ≤ 900px | Sidebar → `--sidebar-w-collapsed`; decorative illustrations hidden |
| ≤ 500px | Focus card `--r-md`, padding 24/22; two-column field rows stack |
| ≤ 480px | Toast inset 12px |

---

## 8. Components

Each entry gives the spec, the current implementation, and the gap.
Shared components live in `src/component/common/` with CSS in `src/component/decorate/`.
**Never** use inline `style={{…}}` or Tailwind colour utilities for system colours.
The one exception is data-driven colour (e.g. `getProgressColor`), which is passed as `var(--token)`, never as a hex.

### Brand mark (`common/BrandMark.tsx`, `common/AppLogo.tsx`)
44×44 white tile, `--r-xs`, 1.5px `--brand-ink` border, cobalt glow, logo inside. Name 16/600 `--brand-ink`.
Focus-layout header and sidebar top only. The logo renders only through `AppLogo`.

### Card
| Variant | Where | Spec |
|---|---|---|
| Glass | Focus layout, modal | `--glass-strong`, `--blur-card`, 1px `--glass-edge`, `--r-xl` (modal `--r-md`), `--shadow-card` |
| Solid | Shell | `--surface`, 1px `--border`, `--r-md`, `--shadow-panel`, padding 20/24 |
| Sunken | Inside a card | `--surface-2`, no shadow, `--r-xs` |
| Tinted | Hero / info strip | `--tint` or `--info-bg` + `--info-border` |

### Button
| Variant | Fill | Text | Radius | Use |
|---|---|---|---|---|
| Primary | `--accent-gradient` + `--shadow-accent` | `--on-accent` 14/600 UPPER .08em | `--r-sm` | One per view |
| Secondary | `--surface` (shell) / `--glass` (focus) + 1px `--border` | `--text` 14/500 | `--r-sm` | Cancel, back |
| Ghost / icon | transparent → `--hover-tint` | `--muted` → `--accent` | `--r-2xs` | Toolbar, reveal password, close |
| Danger | `--danger` | white | `--r-sm` | Destructive confirm, inside a modal only |
| Small | `--surface-2` + 1px `--border` | 12/600 `--text` | `--r-2xs` | Row actions (`ActionButtons`) |

States: **hover** lift + stronger shadow · **press** `translateY(-1px) scale(.99)` · **focus-visible** `--focus-ring` ·
**disabled** 45% opacity, no transform · **loading** 80% opacity, `pointer-events:none`, a 12px spinner (white ring + `--accent-soft` arc) after the label.
Heights: primary 44–48 · secondary 36–40 · small 28–32. Icon–label gap 8.

### Text field (input · select · date · textarea)
```
MICRO LABEL          ← <label htmlFor>, 11/500 UPPER .1em --label, 7px gap
┌──────────────────┐ ← --field, 1px --field-edge, --field-shadow, --r-xs, padding 12/16, 14px
│ placeholder       │   placeholder --muted @ .8
└──────────────────┘
caption              ← 11px, min-height 16px reserved
```
| State | Treatment |
|---|---|
| Focus | Border `--accent-2`, fill `--field-on`, `--focus-ring`, −1px |
| Error | Border `--danger`, faint danger ring, caption `--danger-ink` |
| Valid | Border `--success`, caption `--success-ink` |
| Disabled | 55% opacity, no focus styles |

- Select: `appearance:none`, right padding 36, `FaChevronDown` in `--muted`.
- Password: `FaEye` / `FaEyeSlash` icon button inside the field, in tab order, with `aria-label`.
- Two-column rows collapse at ≤ 500px.
- Reference: `.auth-page input` (`signInAndUp.css`).

### Tabs & segmented control
| Size | Container | Item | Active |
|---|---|---|---|
| Large tabs | 6px padding, gap 6, bottom 1px `--glass-edge`/`--border` | 15px vertical, 14/500 UPPER, `--r-md` | `--accent-gradient-2`, white 600, `--shadow-accent` |
| Segment | `--surface-2`, 1px `--border`, 3px padding, `--r-2xs` | 5/10 padding, 12/700, radius 7 | `--accent-fill`, `--on-accent`, small accent shadow |

Idle hover: `--hover-tint`. References: auth `.tabs` (large), Topbar `.tb-lang` (segment).
Tabs use `role="tablist"` / `aria-selected`; segments use `aria-pressed`.

### Switch (`common/StatusSwitch.tsx`, Topbar theme switch)
Track 52×28, `--r-pill`, `--surface-2`, 1px `--border`, with a 22px thumb. On: track and border `--accent-fill`, and the thumb slides 24px on the spring curve.
`role="switch"` + `aria-checked`. A status label beside the switch uses `--success-ink` (on) or `--muted` (off).
Reference: Topbar `.tb-theme`. `StatusSwitch` still uses inline styles.

### Progress bar (`common/ProgressBar.tsx`)
8px track, `--surface-2` (or `--info-track` in an info strip), `--r-pill`. Width transitions .5s ease-out.
- Mastery / skill progress: fill = `getProgressColor(pct)` (§3.2 ramp).
- Generic progress (upload, quiz steps): fill = `--accent`.
- Optional label row: micro-label and a mono value.

`ProgressBar` currently takes Tailwind classes (`bg-blue-600`, `bg-slate-100`) that ignore the theme.

### Stat card (`common/StatCard.tsx`)
Solid card, `--r-md`, padding 20. Micro-label title in `--muted`, 24/700 mono value,
44×44 icon tile (`--tint`, `--r-xs`, icon `--accent`). It currently uses Tailwind slate utilities.

### Badge / pill
Height 22, padding 0 10, `--r-pill`, 11/600.
- **Status** (active · inactive · pending · approved · rejected): `--{status}-bg` fill, `--{status}-border` border, `--{status}-ink` text. Inactive uses `--surface-2` / `--muted`.
- **Curriculum** (tier, difficulty, behaviour): the §3.2 tokens.

### Table (admin lists)
Solid card. Sticky header row on `--surface-2` with 11px UPPER `--label` text.
Rows 48px, 1px `--border-soft` separators, hover `--hover-tint`, selected `--tint`, numbers right-aligned in mono.
Row actions are small buttons, right-aligned. Empty state: 32px `--muted` icon, 14px message, secondary button.

### Modal (`common/Modal.tsx`)
Scrim `--overlay` + `blur(4px)`. Glass card panel (`--r-md`), max 480 (form) / 720 (preview), padding 24.
Header: 18/600 title and a ghost close (`FaXmark` + `aria-label`). Footer: right-aligned actions, primary last.
Enter: fade + 8px rise, .25s. Trap focus, close on Esc, and return focus to the trigger.
It currently uses inline hardcoded `#fff` / `#1e293b` / `rgba(0,0,0,.4)`.

### Toast (`common/ToastContainer.tsx`, `Toast.css`)
Structure already matches: glass, `--r-lg`, `--shadow-float`, a 34px tinted icon tile, a countdown bar, and pause on hover.
It needs to take `--{status}-*` tokens instead of the hardcoded `KIND_STYLE` (it stays light in dark mode), and use `fa6` icons instead of `✓ ✕ ℹ !`.
Toasts are for request outcomes. Field problems go in field captions.

### Topbar (`common/Topbar.tsx`)
The shell's only header: page title 16/700, TH|EN segment, theme switch. Already token-driven with fallbacks.
It is the model for how shared components should read tokens.

### Link
`--accent`, no underline, underline on hover/focus-visible. A trailing arrow ("Create one →") nudges 3px right on hover.

### Divider
1px `--border-soft` (shell) / `--glass-edge` (focus). A labelled divider is line · 11px `--muted` text · line.

### Code block (`common/CodeBlock.tsx`)
The only code renderer. It uses its own palette (§3.4).

---

## 9. Icons & copy

- **Icons:** `react-icons/fa6` only. Sizes 14 inline · 16 buttons/fields · 20 nav · 32 empty states. Decorative icons get `aria-hidden`; icon-only buttons get `aria-label` + `title`. **No emoji** as UI glyphs.
- **Copy:** every user-facing string goes through `t()` from `usePreferences()` (`src/i18n/th.ts`, `en.ts`). **Thai is the default language**, so design Thai-first: Thai lines run longer and taller, so never fix the height of a text container.
- **Dates / numbers:** format with `locale` from `usePreferences()` (`th-TH` / `en-GB`).

---

## 10. Accessibility baseline

A screen is "on the system" only when all of these hold:

- Text ≥ 4.5:1. Large text (≥ 18px/700) and UI borders/icons ≥ 3:1. The §3 pairs are chosen to pass. Check any new pair.
- A visible `:focus-visible` on every interactive element (`--focus-ring`, or a 2px `--accent` outline at 2px offset).
- `<label htmlFor>` on every field. Forms are real `<form>`s, so **Enter submits**.
- No `tabIndex={-1}` on anything interactive.
- `prefers-reduced-motion` honoured (§6).
- Touch targets ≥ 36×36 (44 for primary actions).

---

## 11. Adopting the system

**One-time setup (not done yet):**
1. Create `src/styles/tokens.css` from §3 plus the §3.2 domain tokens moved out of `Home.css`, and import it at the top of `src/index.css`.
2. Strip the Vite-template leftovers from `index.css` (`#242424` root, `#646cff` links, global `button`, `h1 3.2em`). They fight every screen.
3. Once every screen reads tokens, delete the per-file `:root` palettes, and drop the `:root, .app` guard in `Home.css`.

**Per screen:**
1. Replace the screen's own palette with system tokens (mapping below).
2. Scope every selector under the screen's root class/prefix (`.auth-page`, `.app`, `ad-`, `sb2-`, `g07-`, `tb-`). Never write bare `input`, `select`, `label`, `.card`, `.tabs`.
3. Pick the layout (§7.1 focus / §7.2 shell), which decides glass vs solid and which contextual values (§3.3) the root declares.
4. Swap inline styles and Tailwind colour utilities for token-based classes.
5. Replace emoji with `fa6` icons, and route strings through `t()`.
6. Check light and dark, ≤ 500px, and keyboard-only use.

**Legacy token mapping** (bold = a genuinely different colour, not just a different name):

| System | Auth `--auth-*` | Home (student shell) | Admin | GetStart / Pretest / InfoForm | Exercise | SelectBranch `.sb2-root` |
|---|---|---|---|---|---|---|
| `--bg` / `--bg-focus` | `--auth-shell` | `--bg` | `--bg` | `--navy` | `--bg` | `--shell` |
| `--surface` | — | `--surface`, `--card` | `--surface` | `--navy2` | `--s1` | — |
| `--surface-2` | — | `--surface-2` | — | `--navy3` (**#e9f0f5**) | `--s2` (**#e9f0f5**), `--s3` | `--field` |
| `--glass*` | `--auth-glass`, `--auth-card-glass`, `-edge`, `-hi` | `--glass` | — | — | — | `--glass`, `--card-glass`, … |
| `--text` | `--auth-text` | `--text` (**#000080**) | `--text` (**#000080**) | `--text` (**#000080**) | `--text` (#0f172a) | `--text` (**#062a52**) |
| `--ink` / `--ink-soft` | — | same | — | — | `--text` / `--sub` | — |
| `--label` | `--auth-label` | — | — | — | — | — |
| `--muted` | `--auth-muted` | `--muted` (**#6D8196**) | `--muted` (**#6D8196**) | `--muted` (**#6D8196**) | `--dim` | `--muted` (**#3f6a91**) |
| `--faint` | — | `--faint` | — | `--muted2` | `--bdr2` | — |
| `--border` | `--auth-field-edge` | `--border` | `--border` | `--border` | `--bdr` | — |
| `--border-strong` | — | — | — | `--border2` | `--bdr3` | — |
| `--accent` / `--accent-fill` | `--gold` | `--accent` / `--accent-fill` | `--accent` | `--gold` | `--gold` | `--brand` (**#04387a**) |
| `--accent-soft` | `--gold2` | `--accent2` | `--accent2` | `--gold2` | `--gold2` (**#3b82f6**) | — |
| `--brand-ink` | `--auth-brand` | — | — | `--gold3` | `--gold3` | `--brand` |
| `--tint` | — | `--tint`, `--tint-2` | — | — | — | — |
| `--overlay` | — | `--overlay` | — | — | — | — |
| `--success*` | `--success` (**#38b874**) | `--green`, `--ok-*` | `--green` (**#10b981**) | `--success` / `--green` (**#4caf7d**) | `--green` (**#10b981**) | — |
| `--danger*` | `--danger` (**#e05c5c**) | `--red`, `--bad-*` | `--red` | `--danger` (**#e05c5c**) | `--red` (**#ef4444**) | — |
| `--warning*` | — | `--beh-slow` only | `--orange` (#f59e0b) | — | `--orange` (#f59e0b) | — |

Name traps: **"gold" is blue** (`--gold` = cobalt) and **"navy" is near-white** (`--navy` = `#f2f7fa`).
`--purple`, `--cyan`, `--blue` (Home, Admin, Exercise) have no UI role. Use them only as chart series.

**The visible changes other screens will get from adopting the login look:**
- Body text goes from saturated navy `#000080` to ink navy `#0b1a4a`. `#000080` survives as `--brand-ink`.
- Muted text goes from `#6D8196` to `#5c6f88` (it now passes AA).
- The primary button becomes the cobalt gradient.

---

## 12. Where screens deviate today

As of 2026-09-10. Nothing below has been changed yet. This is the migration backlog.

| Area | Deviation |
|---|---|
| Theming | Only the student shell (`Home.css`) follows `<html data-theme>`. Login, SelectBranch and legacy `/skilltree` each run their own dark mode. Admin, Exercise, Pretest, GetStart and InformationForm have no dark mode. The Topbar (the only theme control) is mounted only in `HomeShell`. |
| Tokens | 9 stylesheets declare a global `:root` palette with overlapping names (§11). `index.css` still carries Vite-template defaults. |
| Contrast | `--muted #6D8196` (most screens) is 4.0:1 on white and 3.7:1 on `--bg`. Home's `--ok-ink #059669` is 3.8:1. The login button gradient's `#4d7bff` stop is 3.8:1 under white text. |
| Login / Register | An unscoped `select, input[type="text"]` in `InformationForm.css:119` overrides the auth text inputs in both themes. Labels lack `htmlFor`. No `<form>`, so Enter doesn't submit. The password toggle has `tabIndex={-1}` and no `aria-label`. "✓ Username available" is shown without checking. The spatter canvas, illustration and `.auth-bg-fixed` gradient never render. |
| Shared components | `Modal` and `StatusSwitch` use inline styles. `StatCard` and `ProgressBar` use Tailwind slate/blue. None follow dark mode. |
| Toasts | Hardcoded light palette, and `✓ ✕ ℹ !` glyphs. |
| Emoji | Login (👁 🙈 ☾ ☀ 🎓 🎉) and other older screens. |
| Curriculum colours | Two skill-tree implementations colour differently: home tree by node state (`Home.css`), legacy `/skilltree` by tier (`SkillTree.css`). T4/T5 and dark difficulty colours are undefined. |
| Motion | No `prefers-reduced-motion` handling anywhere. |
