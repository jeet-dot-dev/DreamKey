import { useState, useEffect, useCallback } from "react";
import { PropertyListing } from "./useProperties";

export interface PropertyStats {
  total: number;
  byStatus: { name: string; value: number }[];
  byType: { name: string; value: number }[];
  avgPrice: number;
  totalValue: number;
  historyData: { name: string; count: number }[];
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

export function usePropertyStats() {
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch a large limit to compute all stats client-side
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${apiBaseUrl}/api/v1/property/get?limit=1000`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.statusText}`);
      }

      const json = await response.json();
      const properties: PropertyListing[] = Array.isArray(json) ? json : json.data ?? [];

      const total = properties.length;
      let totalValue = 0;

      // Grouping maps
      const statusMap: Record<string, number> = {
        AVAILABLE: 0,
        RENTED: 0,
        SOLD: 0,
        UPCOMING: 0,
      };

      const typeMap: Record<string, number> = {
        FLAT: 0,
        LAND: 0,
        WAREHOUSE: 0,
        COMMERCIAL: 0,
        OTHER: 0,
      };

      // Monthly history data grouping
      const historyMap: Record<string, number> = {};

      properties.forEach((p) => {
        if (p.askingPrice) {
          totalValue += Number(p.askingPrice);
        }

        if (p.availabilityStatus && statusMap[p.availabilityStatus] !== undefined) {
          statusMap[p.availabilityStatus]++;
        }

        if (p.propertyType && typeMap[p.propertyType] !== undefined) {
          typeMap[p.propertyType]++;
        }

        // Parse date for history
        if (p.createdAt) {
          const date = new Date(p.createdAt);
          const monthYear = date.toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit",
          });
          historyMap[monthYear] = (historyMap[monthYear] ?? 0) + 1;
        }
      });

      // Format for Recharts
      const byStatus = Object.entries(statusMap).map(([name, value]) => ({
        name: name.charAt(0) + name.slice(1).toLowerCase(),
        value,
      }));

      const byType = Object.entries(typeMap).map(([name, value]) => ({
        name: name.charAt(0) + name.slice(1).toLowerCase(),
        value,
      }));

      const historyData = Object.entries(historyMap)
        .map(([name, count]) => ({ name, count }))
        // Sort chronologically or reverse
        .slice(-6); // Last 6 months

      setStats({
        total,
        byStatus,
        byType,
        totalValue,
        avgPrice: total > 0 ? Math.round(totalValue / total) : 0,
        historyData: historyData.length > 0 ? historyData : [{ name: "Current", count: total }],
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
