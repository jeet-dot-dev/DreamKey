import { useState, useCallback } from "react";

export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
  whatsapp?: string;
  address?: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface Broker {
  id: string;
  name: string;
  phone: string;
  email: string;
  whatsapp?: string;
  areaOfOperation?: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
}

// Fetch owners from API
export const fetchOwners = async (searchQuery: string = ""): Promise<Owner[]> => {
  try {
    const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
    const response = await fetch(`/api/owners${query}`);
    if (!response.ok) throw new Error("Failed to fetch owners");
    return response.json();
  } catch (error) {
    console.error("Error fetching owners:", error);
    return [];
  }
};

// Fetch brokers from API
export const fetchBrokers = async (searchQuery: string = ""): Promise<Broker[]> => {
  try {
    const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
    const response = await fetch(`/api/brokers${query}`);
    if (!response.ok) throw new Error("Failed to fetch brokers");
    return response.json();
  } catch (error) {
    console.error("Error fetching brokers:", error);
    return [];
  }
};

// Create new owner
export const createOwner = async (ownerData: Partial<Owner>): Promise<Owner> => {
  try {
    const response = await fetch("/api/owners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ownerData),
    });
    if (!response.ok) throw new Error("Failed to create owner");
    return response.json();
  } catch (error) {
    console.error("Error creating owner:", error);
    throw error;
  }
};

// Create new broker
export const createBroker = async (brokerData: Partial<Broker>): Promise<Broker> => {
  try {
    const response = await fetch("/api/brokers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brokerData),
    });
    if (!response.ok) throw new Error("Failed to create broker");
    return response.json();
  } catch (error) {
    console.error("Error creating broker:", error);
    throw error;
  }
};

// Hook for searching owners/brokers with debounce
export const useOwnerSearch = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoadingOwners, setIsLoadingOwners] = useState(false);

  const searchOwners = useCallback(async (query: string) => {
    if (!query.trim()) {
      setOwners([]);
      return;
    }
    setIsLoadingOwners(true);
    try {
      const results = await fetchOwners(query);
      setOwners(results);
    } finally {
      setIsLoadingOwners(false);
    }
  }, []);

  return { owners, isLoadingOwners, searchOwners };
};

export const useBrokerSearch = () => {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [isLoadingBrokers, setIsLoadingBrokers] = useState(false);

  const searchBrokers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setBrokers([]);
      return;
    }
    setIsLoadingBrokers(true);
    try {
      const results = await fetchBrokers(query);
      setBrokers(results);
    } finally {
      setIsLoadingBrokers(false);
    }
  }, []);

  return { brokers, isLoadingBrokers, searchBrokers };
};
