import { useState, useEffect, useCallback } from "react";
import { Owner } from "./useOwners";
import { PropertyListing } from "./useProperties";

export interface OwnerStats {
  total: number;
  active: number;
  inactive: number;
  topOwners: { name: string; count: number }[];
  byStatus: { name: string; value: number }[];
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

export function useOwnerStats() {
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch owners
      const ownersResponse = await fetch(`${apiBaseUrl}/api/v1/owner/get?limit=1000`);
      if (!ownersResponse.ok) {
        throw new Error(`Failed to fetch owners: ${ownersResponse.statusText}`);
      }
      const ownersJson = await ownersResponse.json();
      const ownersList: Owner[] = Array.isArray(ownersJson) ? ownersJson : ownersJson.data ?? [];

      // Fetch properties to calculate portfolios
      const propertiesResponse = await fetch(`${apiBaseUrl}/api/v1/property/get?limit=1000`);
      if (!propertiesResponse.ok) {
        throw new Error(`Failed to fetch properties: ${propertiesResponse.statusText}`);
      }
      const propertiesJson = await propertiesResponse.json();
      const propertiesList: PropertyListing[] = Array.isArray(propertiesJson) ? propertiesJson : propertiesJson.data ?? [];

      const total = ownersList.length;
      let active = 0;
      let inactive = 0;

      ownersList.forEach((o) => {
        if (o.status === "ACTIVE") {
          active++;
        } else {
          inactive++;
        }
      });

      // Calculate properties owned by each owner
      const portfolioMap: Record<string, { name: string; count: number }> = {};
      ownersList.forEach((o) => {
        portfolioMap[o.id] = { name: o.name, count: 0 };
      });

      propertiesList.forEach((p) => {
        if (p.ownerId && portfolioMap[p.ownerId]) {
          portfolioMap[p.ownerId].count++;
        }
      });

      // Sort top owners
      const topOwners = Object.values(portfolioMap)
        .filter((o) => o.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 owners

      const byStatus = [
        { name: "Active", value: active },
        { name: "Inactive", value: inactive },
      ];

      setStats({
        total,
        active,
        inactive,
        topOwners,
        byStatus,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
