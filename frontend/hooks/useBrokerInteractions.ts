"use client";
import { useCallback, useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

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
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${apiBaseUrl}/api/v1/broker/interaction?brokerId=${encodeURIComponent(brokerId)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const payload = await res.json();
      console.log("Fetched interactions payload:", payload);
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
