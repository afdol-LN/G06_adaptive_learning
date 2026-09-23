import { useCallback, useEffect, useMemo, useState } from "react";
import { historyService } from "./history.service";
import { HistoryEntry } from "../../../models/historyModel";

export function historyController() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [histSearch, setHistSearch] = useState<string>("");
  const [histGrade, setHistGrade] = useState<string>("all");

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    const result = await historyService.getAllHistory();
    if (result.isError) {
      setError(result.errorMessage);
      setHistory([]);
    } else {
      setHistory(result.data || []);
      setError(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredHistory = useMemo(() => {
    const term = histSearch.toLowerCase();
    return history.filter((h) => {
      const matchSearch =
        h.user.toLowerCase().includes(term) || h.skill.toLowerCase().includes(term);
      const matchGrade = histGrade === "all" || h.grade === histGrade;
      return matchSearch && matchGrade;
    });
  }, [history, histSearch, histGrade]);

  return {
    filteredHistory,
    isLoading,
    error,
    histSearch,
    setHistSearch,
    histGrade,
    setHistGrade,
  };
}
