import { useCallback, useEffect, useRef, useState } from "react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import type { TKey, Translate } from "../../../i18n";

// Same step shape as the Home tours (home/controller/homeTour.controller.ts):
// no element = a centred popover
type GuideStep = { element?: string; titleKey: TKey; descKey: TKey };

const TOUR_STEPS: GuideStep[] = [
  { titleKey: "tour.exercise.intro.title", descKey: "tour.exercise.intro.desc" },
  { element: '[data-tour="ex-progress"]', titleKey: "tour.exercise.progress.title", descKey: "tour.exercise.progress.desc" },
  { element: '[data-tour="ex-meta"]', titleKey: "tour.exercise.meta.title", descKey: "tour.exercise.meta.desc" },
  { element: '[data-tour="ex-question"]', titleKey: "tour.exercise.question.title", descKey: "tour.exercise.question.desc" },
  { element: '[data-tour="ex-answer"]', titleKey: "tour.exercise.answer.title", descKey: "tour.exercise.answer.desc" },
  { element: '[data-tour="ex-submit"]', titleKey: "tour.exercise.submit.title", descKey: "tour.exercise.submit.desc" },
  { element: '[data-tour="ex-counter"]', titleKey: "tour.exercise.counter.title", descKey: "tour.exercise.counter.desc" },
  { element: '[data-tour="ex-exit"]', titleKey: "tour.exercise.exit.title", descKey: "tour.exercise.exit.desc" },
  { element: '[data-tour="ex-rules-btn"]', titleKey: "tour.exercise.rules.title", descKey: "tour.exercise.rules.desc" },
];

/**
 * The Exercise guide (adt-learning/docs/adr/0002): a Tour and a Rules card, both opened only by
 * the student. `isOpen` is true while either one is showing — the page pauses the answer clock on it.
 */
export function useExerciseGuideController(t: Translate) {
  const [tourActive, setTourActive] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const driverRef = useRef<Driver | null>(null);

  const startTour = useCallback(() => {
    if (driverRef.current) return;
    setRulesOpen(false);

    // skip steps whose element isn't on screen right now
    const steps = TOUR_STEPS.filter((s) => !s.element || document.querySelector(s.element));
    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      nextBtnText: t("tour.btn.next"),
      prevBtnText: t("tour.btn.prev"),
      doneBtnText: t("tour.btn.done"),
      progressText: t("tour.progress"),
      steps: steps.map((s) => ({
        element: s.element,
        popover: { title: t(s.titleKey), description: t(s.descKey) },
      })),
      onDestroyed: () => {
        driverRef.current = null;
        setTourActive(false);
      },
    });

    driverRef.current = driverObj;
    setTourActive(true);
    driverObj.drive();
  }, [t]);

  const toggleRules = useCallback(() => setRulesOpen((open) => !open), []);
  const closeRules = useCallback(() => setRulesOpen(false), []);

  // leaving the page mid-tour must not leave driver's overlay behind
  useEffect(() => () => driverRef.current?.destroy(), []);

  return { isOpen: tourActive || rulesOpen, rulesOpen, startTour, toggleRules, closeRules };
}
