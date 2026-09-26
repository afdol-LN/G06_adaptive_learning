import { useEffect, useRef, useState } from "react";
import { learningReportService } from "./learningReport.service";
import {
  BranchReport,
  ReportScope,
  SummaryReport,
} from "../../models/learningReportModel";

/** loads the report the route asks for */
export function useLearningReport(scope: ReportScope | null) {
  const [branch, setBranch] = useState<BranchReport | null>(null);
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const key = scope ? (scope.kind === "all" ? "all" : `b${scope.branchId}`) : "none";

  useEffect(() => {
    if (!scope) {
      setIsLoading(false);
      setError("invalid");
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    (async () => {
      const result =
        scope.kind === "all"
          ? await learningReportService.getSummaryReport()
          : await learningReportService.getBranchReport(scope.branchId);
      if (cancelled) return;
      setIsLoading(false);
      if (result.isError || !result.data) {
        setError(result.errorMessage || "error");
      } else if (scope.kind === "all") {
        setSummary(result.data as SummaryReport);
      } else {
        setBranch(result.data as BranchReport);
      }
    })();
    return () => {
      cancelled = true;
    };
    // `key` identifies the scope; the object itself is rebuilt on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { branch, summary, error, isLoading };
}

/**
 * Opens the print dialog once, after the report has rendered and its fonts have loaded —
 * printing earlier would save a PDF with fallback fonts (Thai in the wrong face) or no data.
 */
export function useAutoPrint(ready: boolean) {
  const done = useRef(false);
  useEffect(() => {
    if (!ready || done.current) return;
    done.current = true;
    let timer = 0;
    document.fonts.ready.then(() => {
      timer = window.setTimeout(() => window.print(), 300);
    });
    return () => window.clearTimeout(timer);
  }, [ready]);
}
