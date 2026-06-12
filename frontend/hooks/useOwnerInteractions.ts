import { useCallback, useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

export type OwnerInteraction = {
  id: string;
  ownerId: string;
  subject: string;
  notes: string;
  communicationType: string;
  createdAt: string;
};

type UseOwnerInteractionsResult = {
  data: OwnerInteraction[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useOwnerInteractions(ownerId?: string): UseOwnerInteractionsResult {
  const [data, setData] = useState<OwnerInteraction[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!ownerId) return;
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${apiBaseUrl}/api/v1/owner/interaction?ownerId=${encodeURIComponent(ownerId)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const payload = await res.json();
      const list: OwnerInteraction[] = Array.isArray(payload) ? payload : payload.data ?? payload.interactions ?? [];
      setData(list.map((item: any) => ({ ...item, createdAt: item.createdAt })));
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}