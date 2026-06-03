"use client";

import { useState, useEffect, useCallback } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(url: string, autoFetch = true): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (autoFetch) fetchData();
  }, [autoFetch, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Polling hook for dashboard auto-refresh
export function usePolling<T>(url: string, intervalMs = 30000) {
  const { data, loading, error, refetch } = useApi<T>(url);

  useEffect(() => {
    if (intervalMs <= 0) return;
    const timer = setInterval(refetch, intervalMs);
    return () => clearInterval(timer);
  }, [refetch, intervalMs]);

  return { data, loading, error, refetch };
}
