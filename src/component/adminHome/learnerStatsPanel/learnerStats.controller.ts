import { useEffect, useState } from "react";
import { ApiResponse } from "../../../models/apiResponse";

/**
 * Load one stats object on mount / when `id` changes — the stats tab mounts only when opened,
 * so nothing is fetched for admins who just read the details.
 */
export function useLearnerStats<T>(id: number, load: (id: number) => Promise<ApiResponse<T>>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setData(null);
    (async () => {
      const res = await load(id);
      if (cancelled) return;
      if (res.isError || !res.data) {
        setError(res.errorMessage || "error");
      } else {
        setError(null);
        setData(res.data);
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // load is a stable service method
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { data, isLoading, error };
}
