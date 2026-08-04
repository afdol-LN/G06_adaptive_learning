import { useState, useEffect, useCallback } from "react";
import { BranchStats } from "../../../models/branchStatsModel";
import { branchStatsService } from "../branchStats.service";

export function useBranchStatsController(branchId: number | null) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<BranchStats | null>(null);

  const fetchStats = useCallback(async () => {
    if (!branchId) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const res = await branchStatsService.getBranchStats(branchId);
    if (!res.isError && res.data) {
      setStats(res.data);
    }
    setIsLoading(false);
  }, [branchId]);

  useEffect(() => {
    fetchStats();
  }, [branchId]);

  return {
    isLoading,
    stats,
    refresh: fetchStats,
  };
}

export type BranchStatsControllerType = ReturnType<typeof useBranchStatsController>;
