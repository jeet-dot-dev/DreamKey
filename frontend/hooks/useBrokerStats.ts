import { useState, useEffect, useCallback } from "react";
import { Broker } from "./useBrokers";
import { PropertyListing } from "./useProperties";

export interface BrokerStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  topBrokers: { name: string; count: number }[];
  byStatus: { name: string; value: number }[];
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

export function useBrokerStats() {
  const [stats, setStats] = useState<BrokerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch brokers
      const brokersResponse = await fetch(`${apiBaseUrl}/api/v1/broker/get?limit=1000`);
      if (!brokersResponse.ok) {
        throw new Error(`Failed to fetch brokers: ${brokersResponse.statusText}`);
      }
      const brokersJson = await brokersResponse.json();
      const brokersList: Broker[] = Array.isArray(brokersJson) ? brokersJson : brokersJson.data ?? [];

      // Fetch properties to calculate sourced listings
      const propertiesResponse = await fetch(`${apiBaseUrl}/api/v1/property/get?limit=1000`);
      if (!propertiesResponse.ok) {
        throw new Error(`Failed to fetch properties: ${propertiesResponse.statusText}`);
      }
      const propertiesJson = await propertiesResponse.json();
      const propertiesList: PropertyListing[] = Array.isArray(propertiesJson) ? propertiesJson : propertiesJson.data ?? [];

      const total = brokersList.length;
      let active = 0;
      let inactive = 0;
      let blocked = 0;

      brokersList.forEach((b) => {
        if (b.status === "ACTIVE") {
          active++;
        } else if (b.status === "INACTIVE") {
          inactive++;
        } else if (b.status === "BLOCKED") {
          blocked++;
        }
      });

      // Sourced properties mapping
      const sourcingMap: Record<string, { name: string; count: number }> = {};
      brokersList.forEach((b) => {
        sourcingMap[b.id] = { name: b.name, count: 0 };
      });

      propertiesList.forEach((p) => {
        if (p.sourcePartnerId && sourcingMap[p.sourcePartnerId]) {
          sourcingMap[p.sourcePartnerId].count++;
        }
      });

      // Sort top brokers
      const topBrokers = Object.values(sourcingMap)
        .filter((b) => b.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 brokers

      const byStatus = [
        { name: "Active", value: active },
        { name: "Inactive", value: inactive },
        { name: "Blocked", value: blocked },
      ].filter((x) => x.value > 0);

      setStats({
        total,
        active,
        inactive,
        blocked,
        topBrokers,
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
