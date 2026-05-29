"use client";
import { useCallback, useEffect, useState } from "react";

export type Interaction = {
  id: string;
  brokerId: string;
  subject: string;
  notes: string;
  communicationType: string;
  createdAt: string;
};

type UseBrokerInteractionsResult = {
  data: Interaction[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useBrokerInteractions(brokerId?: string): UseBrokerInteractionsResult {
  const [data, setData] = useState<Interaction[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!brokerId) return;
    setLoading(true);
    setError(null);
    try {
      // Expected backend endpoint: GET /broker/interaction?brokerId={id}
      // If your backend uses a different path (e.g. /api/...), update this URL.
      const res = await fetch(`/broker/interaction?brokerId=${encodeURIComponent(brokerId)}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const payload = await res.json();
      // Support multiple payload shapes
      const list: Interaction[] = Array.isArray(payload) ? payload : payload.data ?? payload.interactions ?? [];
      setData(list.map((i: any) => ({ ...i, createdAt: i.createdAt })));
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [brokerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
