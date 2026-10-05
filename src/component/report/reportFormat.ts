import type { TKey, Translate } from "../../i18n";
import type { ReportSkillStatus } from "../../models/learningReportModel";

// Formatting shared by the two report views. Dates are the learner's calendar days (Bangkok),
// like the backend's document number.
export const REPORT_TIME_ZONE = "Asia/Bangkok";

export const fmtDate = (iso: string | null, locale: string) =>
  iso
    ? new Date(iso).toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: REPORT_TIME_ZONE,
      })
    : "—";

export const fmtDateTime = (iso: string | null, locale: string) =>
  iso
    ? new Date(iso).toLocaleString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: REPORT_TIME_ZONE,
      })
    : "—";

/** "2 ชม. 5 นาที" / "2 h 5 min" */
export const fmtDuration = (
  seconds: number,
  t: Translate,
) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? t("report.duration.hm", { h, m }) : t("report.duration.m", { m });
};

export const STATUS_LABEL: Record<ReportSkillStatus, TKey> = {
  mastered: "report.status.mastered",
  in_progress: "report.status.inProgress",
  not_started: "report.status.notStarted",
};

export const STOP_LABEL: Record<string, TKey> = {
  mastered: "session.end.mastered",
  completed: "session.end.completed",
  exhausted: "session.end.exhausted",
  abandoned: "session.end.abandoned",
};

/** one piece of a file name: only characters every OS/upload form accepts, words joined by "-" */
export const fileSafe = (text: string) =>
  text
    // keep letters, digits and marks (Thai vowels / tone marks are \p{M}); spaces, / \ : * ? " < > | & … → "-"
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/**
 * The default name "Save as PDF" offers — browsers take it from document.title.
 * Always English and built from the username (not the full name) so it stays ASCII-friendly
 * for mail clients and upload forms; the learner can still rename it in the save dialog.
 */
export function reportFileName(
  kind: "certificate" | "progress" | "transcript",
  documentNo: string,
  username: string,
  goalName?: string,
) {
  const label = { certificate: "Certificate", progress: "Progress-Report", transcript: "Transcript" }[kind];
  return [label, documentNo, goalName && fileSafe(goalName), fileSafe(username)]
    .filter(Boolean)
    .join("_");
}

/** several goals exported together: each keeps its own document number inside the file */
export const bundleFileName = (username: string, goals: number) =>
  ["Learning-Reports", `${goals}-goals`, fileSafe(username)].join("_");
