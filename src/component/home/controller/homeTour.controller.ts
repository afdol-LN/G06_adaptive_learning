import { useCallback, useEffect, useRef, useState } from "react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { homeTourService } from "../homeTour.service";

const TOUR_STEPS: { element: string; title: string; description: string }[] = [
  {
    element: '[data-tour="tour-page"]',
    title: "ยินดีต้อนรับ",
    description: "นี่คือหน้า Home หลักของคุณ ที่รวบรวมทุกอย่างที่ใช้เรียนไว้ในที่เดียว",
  },
  {
    element: '[data-tour="tour-goal-switcher"]',
    title: "สลับเป้าหมายการเรียนรู้ และเพิ่มใหม่",
    description: "กดที่นี่เพื่อสลับหรือเพิ่มเป้าหมายการเรียนรู้ใหม่ได้ตลอดเวลา",
  },
  {
    element: '[data-tour="tour-nav-tabs"]',
    title: "เมนู",
    description: "ใช้แท็บเหล่านี้เพื่อไปยัง Skill Tree, ประวัติการทำแบบฝึกหัด และโปรไฟล์ของคุณ",
  },
  {
    element: '[data-tour="tour-stats"]',
    title: "สรุปความคืบหน้า",
    description: "ดูภาพรวมทักษะที่ปลดล็อกแล้ว จำนวน session และความคืบหน้าของเป้าหมายได้ที่นี่",
  },
  {
    element: '[data-tour="tour-skill-tree"]',
    title: "แผนผังทักษะ",
    description: "แสดง skill ที่ต้องทำ, skill ไหนปลดล็อคบ้าง, คลิกที่โหนดเพื่อดูรายละเอียดทักษะและเริ่มฝึกได้ทันที",
  },
  {
    element: ".btn-next-exercise",
    title: "แบบฝึกหัดถัดไป",
    description: "กดปุ่มนี้เพื่อเข้าไปทำแบบฝึกในทักษะ(skill) ที่ปลดล็อคแล้ว",
  },
  {
    element: '[data-tour="tour-sessions"]',
    title: "ประวัติการทำ Session ล่าสุด",
    description: "ดูประวัติการทำแบบฝึกหัดล่าสุดของคุณ พร้อมคะแนนความแม่นยำในแต่ละครั้งได้ที่นี่",
  },
  {
    element: '[data-tour="tour-profile-menu"]',
    title: "โปรไฟล์และออกจากระบบ",
    description: "จัดการโปรไฟล์หรือออกจากระบบได้จากเมนูนี้",
  },
];

export function useHomeTourController() {
  // null = ยังไม่รู้ค่าจริงจาก backend, ห้าม auto-start ระหว่างนี้
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);
  const driverRef = useRef<Driver | null>(null);
  const skipMarkSeenRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    userIdRef.current = localStorage.getItem("user_id");
    let cancelled = false;

    (async () => {
      if (!userIdRef.current) {
        if (!cancelled) setHasSeenTour(true);
        return;
      }
      const res = await homeTourService.getTourStatus(userIdRef.current);
      if (!cancelled) setHasSeenTour(res.isError ? true : Boolean(res.data));
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // markAsProgrammatic = true: การ destroy นี้เกิดจากเราเอง (unmount/เปลี่ยนแท็บ) ไม่ใช่ผู้ใช้ปิด tour เอง
  const destroyTour = useCallback((markAsProgrammatic: boolean) => {
    if (driverRef.current) {
      skipMarkSeenRef.current = markAsProgrammatic;
      driverRef.current.destroy();
    }
  }, []);

  const startTour = useCallback(
    (options?: { force?: boolean }) => {
      const force = options?.force ?? false;
      if (!force && hasSeenTour !== false) return;
      if (driverRef.current) return;

      const driverObj = driver({
        showProgress: true,
        allowClose: true,
        nextBtnText: "ถัดไป",
        prevBtnText: "ก่อนหน้า",
        doneBtnText: "เสร็จสิ้น",
        progressText: "{{current}} จาก {{total}}",
        steps: TOUR_STEPS.map((s, i) => ({
          element: s.element,
          popover:
            i === 0
              ? {
                  title: s.title,
                  description: s.description,
                  showButtons: ["next"],
                  nextBtnText: "เริ่ม",
                }
              : { title: s.title, description: s.description },
        })),
        onDestroyed: () => {
          driverRef.current = null;
          if (skipMarkSeenRef.current) {
            skipMarkSeenRef.current = false;
            return;
          }
          setHasSeenTour(true);
          if (userIdRef.current) {
            homeTourService.markTourSeen(userIdRef.current);
          }
        },
      });

      driverRef.current = driverObj;
      driverObj.drive();
    },
    [hasSeenTour],
  );

  const cancelTour = useCallback(() => destroyTour(true), [destroyTour]);

  useEffect(() => {
    return () => destroyTour(true);
  }, [destroyTour]);

  return { hasSeenTour, startTour, cancelTour };
}

export type HomeTourControllerType = ReturnType<typeof useHomeTourController>;
