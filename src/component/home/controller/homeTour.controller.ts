import { useCallback, useEffect, useRef, useState } from "react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { homeTourService } from "../homeTour.service";
import type { TKey, Translate } from "../../../i18n";

// ตรงกับ HomeTabKey ใน HomeShell — แต่ละแท็บคือ "หน้า" หนึ่งที่มี tour ของตัวเอง
export type TourPage = "Home" | "SkillTree" | "History" | "Profile";

// ไม่มี element = popover กลางจอ (ใช้เป็นหน้าแนะนำตัวของแต่ละหน้า)
type TourStep = { element?: string; titleKey: TKey; descKey: TKey };

// ปิดท้ายทุกหน้าด้วยปุ่มวิธีใช้งาน เพื่อบอกว่ากดดูคำแนะนำของหน้าที่อยู่ได้ตลอด
const HELP_STEP: TourStep = { element: '[data-tour="tour-help"]', titleKey: "tour.help.title", descKey: "tour.help.desc" };

const TOURS: Record<TourPage, TourStep[]> = {
  Home: [
    { element: '[data-tour="tour-page"]', titleKey: "tour.welcome.title", descKey: "tour.welcome.desc" },
    { element: '[data-tour="tour-goal-switcher"]', titleKey: "tour.goal.title", descKey: "tour.goal.desc" },
    { element: '[data-tour="tour-nav-tabs"]', titleKey: "tour.nav.title", descKey: "tour.nav.desc" },
    { element: '[data-tour="tour-topbar-prefs"]', titleKey: "tour.prefs.title", descKey: "tour.prefs.desc" },
    { element: '[data-tour="tour-stats"]', titleKey: "tour.stats.title", descKey: "tour.stats.desc" },
    { element: '[data-tour="tour-skill-tree"]', titleKey: "tour.tree.title", descKey: "tour.tree.desc" },
    { element: ".btn-next-exercise", titleKey: "tour.next.title", descKey: "tour.next.desc" },
    { element: '[data-tour="tour-sessions"]', titleKey: "tour.sessions.title", descKey: "tour.sessions.desc" },
    { element: '[data-tour="tour-profile-menu"]', titleKey: "tour.profile.title", descKey: "tour.profile.desc" },
    HELP_STEP,
  ],
  SkillTree: [
    { titleKey: "tour.skillTree.intro.title", descKey: "tour.skillTree.intro.desc" },
    { element: '[data-tour="tour-tree-canvas"]', titleKey: "tour.skillTree.canvas.title", descKey: "tour.skillTree.canvas.desc" },
    { element: '[data-tour="tour-tree-canvas"] .tree-node.clickable', titleKey: "tour.skillTree.node.title", descKey: "tour.skillTree.node.desc" },
    HELP_STEP,
  ],
  History: [
    { titleKey: "tour.history.intro.title", descKey: "tour.history.intro.desc" },
    { element: '[data-tour="tour-history-filter"]', titleKey: "tour.history.filter.title", descKey: "tour.history.filter.desc" },
    { element: '[data-tour="tour-history-list"]', titleKey: "tour.history.list.title", descKey: "tour.history.list.desc" },
    HELP_STEP,
  ],
  Profile: [
    { titleKey: "tour.profilePage.intro.title", descKey: "tour.profilePage.intro.desc" },
    { element: '[data-tour="tour-profile-hero"]', titleKey: "tour.profilePage.hero.title", descKey: "tour.profilePage.hero.desc" },
    { element: '[data-tour="tour-behavior"]', titleKey: "tour.profilePage.behavior.title", descKey: "tour.profilePage.behavior.desc" },
    { element: '[data-tour="tour-behavior-dims"]', titleKey: "tour.profilePage.dims.title", descKey: "tour.profilePage.dims.desc" },
    { element: '[data-tour="tour-profile-personal"]', titleKey: "tour.profilePage.personal.title", descKey: "tour.profilePage.personal.desc" },
    HELP_STEP,
  ],
};

const TOUR_PAGES = Object.keys(TOURS) as TourPage[];

// t มาจาก usePreferences() — ข้อความ tour จึงเป็นภาษาที่เลือกอยู่ตอนกดเริ่ม
export function useHomeTourController(t: Translate) {
  // null = ยังไม่รู้ค่าจริงจาก backend, ห้าม auto-start ระหว่างนี้
  const [seen, setSeen] = useState<Record<TourPage, boolean> | null>(null);
  const driverRef = useRef<Driver | null>(null);
  const skipMarkSeenRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    userIdRef.current = localStorage.getItem("user_id");
    let cancelled = false;

    (async () => {
      const userId = userIdRef.current;
      if (!userId) {
        if (!cancelled) setSeen({ Home: true, SkillTree: true, History: true, Profile: true });
        return;
      }
      const seenPages = homeTourService.getSeenPages(userId);
      const res = await homeTourService.getTourStatus(userId);
      if (cancelled) return;
      const next = Object.fromEntries(TOUR_PAGES.map((p) => [p, seenPages.includes(p)])) as Record<TourPage, boolean>;
      next.Home = res.isError ? true : Boolean(res.data);
      setSeen(next);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasSeenTour = useCallback((page: TourPage): boolean | null => (seen ? seen[page] : null), [seen]);

  const markSeen = useCallback((page: TourPage) => {
    setSeen((prev) => (prev ? { ...prev, [page]: true } : prev));
    const userId = userIdRef.current;
    if (!userId) return;
    if (page === "Home") {
      homeTourService.markTourSeen(userId);
    } else {
      homeTourService.markPageSeen(userId, page);
    }
  }, []);

  // markAsProgrammatic = true: การ destroy นี้เกิดจากเราเอง (unmount/เปลี่ยนแท็บ) ไม่ใช่ผู้ใช้ปิด tour เอง
  const destroyTour = useCallback((markAsProgrammatic: boolean) => {
    if (driverRef.current) {
      skipMarkSeenRef.current = markAsProgrammatic;
      driverRef.current.destroy();
    }
  }, []);

  const startTour = useCallback(
    (page: TourPage, options?: { force?: boolean }) => {
      const force = options?.force ?? false;
      if (!force && seen?.[page] !== false) return;
      if (driverRef.current) return;

      // ข้าม step ที่ element ยังไม่อยู่ในหน้า (เช่น แผนผังยังไม่มีทักษะ) แทนที่จะโชว์ popover ลอยๆ
      const steps = TOURS[page].filter((s) => !s.element || document.querySelector(s.element));
      if (steps.length === 0) return;

      const driverObj = driver({
        showProgress: true,
        allowClose: true,
        nextBtnText: t("tour.btn.next"),
        prevBtnText: t("tour.btn.prev"),
        doneBtnText: t("tour.btn.done"),
        progressText: t("tour.progress"),
        steps: steps.map((s, i) => ({
          element: s.element,
          popover:
            i === 0
              ? {
                  title: t(s.titleKey),
                  description: t(s.descKey),
                  showButtons: ["next"],
                  nextBtnText: t("tour.btn.start"),
                }
              : { title: t(s.titleKey), description: t(s.descKey) },
        })),
        onDestroyed: () => {
          driverRef.current = null;
          if (skipMarkSeenRef.current) {
            skipMarkSeenRef.current = false;
            return;
          }
          markSeen(page);
        },
      });

      driverRef.current = driverObj;
      driverObj.drive();
    },
    [seen, t, markSeen],
  );

  const cancelTour = useCallback(() => destroyTour(true), [destroyTour]);

  useEffect(() => {
    return () => destroyTour(true);
  }, [destroyTour]);

  return { hasSeenTour, startTour, cancelTour };
}

export type HomeTourControllerType = ReturnType<typeof useHomeTourController>;
