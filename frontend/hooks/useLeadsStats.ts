import { useState, useEffect, useCallback } from "react";
import { Lead } from "./useLeads";

export interface LeadsStats {
  total: number;
  byStatus: { name: string; value: number }[];
  byPriority: { name: string; value: number }[];
  byType: { name: string; value: number }[];
  bySource: { name: string; value: number }[];
  avgBudgetMin: number;
  avgBudgetMax: number;
  historyData: { name: string; count: number }[];
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

export function useLeadsStats() {
  const [stats, setStats] = useState<LeadsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${apiBaseUrl}/api/v1/leads`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leads: ${response.statusText}`);
      }

      const responseData = await response.json();
      const leads: Lead[] = responseData.success
        ? responseData.data
        : Array.isArray(responseData)
        ? responseData
        : responseData.data || [];

      const total = leads.length;
      let totalBudgetMin = 0;
      let totalBudgetMax = 0;
      let leadsWithBudgetMin = 0;
      let leadsWithBudgetMax = 0;

      // Grouping maps
      const statusMap: Record<string, number> = {
        NEW: 0,
        FOLLOW_UP: 0,
        NEGOTIATION: 0,
        CLOSED: 0,
        LOST: 0,
      };

      const priorityMap: Record<string, number> = {
        HOT: 0,
        WARM: 0,
        COLD: 0,
      };

      const typeMap: Record<string, number> = {
        FLAT: 0,
        LAND: 0,
        WAREHOUSE: 0,
        COMMERCIAL: 0,
        OTHER: 0,
      };

      const sourceMap: Record<string, number> = {};

      // Monthly history data grouping
      const historyMap: Record<string, number> = {};

      leads.forEach((l) => {
        if (l.budgetMin) {
          totalBudgetMin += Number(l.budgetMin);
          leadsWithBudgetMin++;
        }
        if (l.budgetMax) {
          totalBudgetMax += Number(l.budgetMax);
          leadsWithBudgetMax++;
        }

        if (l.status && statusMap[l.status] !== undefined) {
          statusMap[l.status]++;
        }

        if (l.priority && priorityMap[l.priority] !== undefined) {
          priorityMap[l.priority]++;
        }

        if (l.propertyType && typeMap[l.propertyType] !== undefined) {
          typeMap[l.propertyType]++;
        }

        if (l.source) {
          sourceMap[l.source] = (sourceMap[l.source] ?? 0) + 1;
        } else {
          sourceMap["Unknown"] = (sourceMap["Unknown"] ?? 0) + 1;
        }

        // Parse date for history
        if (l.createdAt) {
          const date = new Date(l.createdAt);
          const monthYear = date.toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit",
          });
          historyMap[monthYear] = (historyMap[monthYear] ?? 0) + 1;
        }
      });

      // Format for Recharts
      const byStatus = Object.entries(statusMap).map(([name, value]) => ({
        name: name.replace("_", " ").split(" ").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" "),
        value,
      }));

      const byPriority = Object.entries(priorityMap).map(([name, value]) => ({
        name: name.charAt(0) + name.slice(1).toLowerCase(),
        value,
      }));

      const byType = Object.entries(typeMap).map(([name, value]) => ({
        name: name.charAt(0) + name.slice(1).toLowerCase(),
        value,
      }));

      const bySource = Object.entries(sourceMap).map(([name, value]) => ({
        name,
        value,
      }));

      const historyData = Object.entries(historyMap)
        .map(([name, count]) => ({ name, count }))
        .slice(-6); // Last 6 months

      setStats({
        total,
        byStatus,
        byPriority,
        byType,
        bySource,
        avgBudgetMin: leadsWithBudgetMin > 0 ? Math.round(totalBudgetMin / leadsWithBudgetMin) : 0,
        avgBudgetMax: leadsWithBudgetMax > 0 ? Math.round(totalBudgetMax / leadsWithBudgetMax) : 0,
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
