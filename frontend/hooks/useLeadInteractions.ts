import { useCallback, useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

export type LeadInteraction = {
  id: string;
  leadId: string;
  type: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'SITE_VISIT' | 'NOTE' | 'PROPERTY_SHARED';
  subject: string;
  notes: string;
  followUpDate?: string | null;
  outcome?: string | null;
  createdAt: string;
};

type UseLeadInteractionsResult = {
  data: LeadInteraction[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useLeadInteractions(leadId?: string): UseLeadInteractionsResult {
  const [data, setData] = useState<LeadInteraction[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/leads/${encodeURIComponent(leadId)}/interactions`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const payload = await res.json();
      const list: LeadInteraction[] = Array.isArray(payload) ? payload : payload.data ?? [];
      setData(list);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
