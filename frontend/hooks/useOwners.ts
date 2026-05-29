import { useCallback, useEffect, useState } from "react";

export type Owner = {
  id: string;
  name: string;
  phone: string;
  email: string;
  whatsapp?: string | null;
  address?: string | null;
  status: "ACTIVE" | "INACTIVE";
  primaryContactPartnerId?: string | null;
  primaryContactPartner?: {
    id: string;
    name: string;
    email: string;
  } | null;
  preferredRentMin?: number | null;
  preferredRentMax?: number | null;
  preferredPropertyTypes?: string | null;
  preferredDealTerms?: string | null;
  archive: boolean;
  favorites: boolean;
  createdAt: string;
  updatedAt: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

const normalizeOwner = (owner: any): Owner => ({
  ...owner,
  preferredRentMin:
    owner.preferredRentMin === null || owner.preferredRentMin === undefined
      ? null
      : Number(owner.preferredRentMin),
  preferredRentMax:
    owner.preferredRentMax === null || owner.preferredRentMax === undefined
      ? null
      : Number(owner.preferredRentMax),
  createdAt: owner.createdAt,
  updatedAt: owner.updatedAt,
});

type UseOwnersResult = {
  owners: Owner[] | null; // legacy name
  data: Owner[] | null; // new name used elsewhere
  isLoading: boolean; // legacy
  loading: boolean; // new
  error: Error | null;
  refetch: () => Promise<void>;
};

export function useOwners(params?: { name?: string; email?: string; phone?: string; status?: string; partner?: string }): UseOwnersResult {
  const [data, setData] = useState<Owner[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      if (params?.name) searchParams.set("name", params.name);
      if (params?.email) searchParams.set("email", params.email);
      if (params?.phone) searchParams.set("phone", params.phone);
      if (params?.status) searchParams.set("status", params.status);
      if (params?.partner) searchParams.set("partner", params.partner);

      const query = searchParams.toString();
      const response = await fetch(`${apiBaseUrl}/api/v1/owner/get${query ? `?${query}` : ""}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch owners: ${response.status} ${response.statusText}`);
      }

      const payload = await response.json();
      const ownersList = Array.isArray(payload) ? payload : payload.data ?? [];
      setData(ownersList.map(normalizeOwner));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [params?.email, params?.name, params?.partner, params?.phone, params?.status]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    owners: data,
    data,
    isLoading: loading,
    loading,
    error,
    refetch: fetchData,
  };
}

export function useOwner(ownerId?: string) {
  const [data, setData] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!ownerId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/owner/${ownerId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch owner: ${response.status} ${response.statusText}`);
      }

      const payload = await response.json();
      setData(normalizeOwner(payload.data ?? payload.owner ?? payload));
    } catch (err) {
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
