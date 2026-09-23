import { useState, useEffect, useCallback } from "react";
import { SessionHistoryItem } from "../../../models/sessionHistoryModel";
import { sessionHistoryService } from "../sessionHistory.service";

export function useSessionHistoryController(branchId: number | null) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);

  const fetchSessions = useCallback(async () => {
    if (!branchId) {
      setSessions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const res = await sessionHistoryService.getSessions(branchId);
    if (!res.isError && res.data) {
      setSessions(res.data);
    }
    setIsLoading(false);
  }, [branchId]);

  useEffect(() => {
    fetchSessions();
  }, [branchId]);

  return {
    isLoading,
    sessions,
    refresh: fetchSessions,
  };
}

export type SessionHistoryControllerType = ReturnType<typeof useSessionHistoryController>;
