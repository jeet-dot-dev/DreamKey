import { useState, useEffect, useCallback } from 'react';
import { PropertyListing } from './useProperties';

export interface Broker {
  id: string;

  // Basic Information
  name: string;
  phone: string;
  email: string;
  whatsapp?: string;
  areaOfOperation?: string; // JSON array of areas

  // Status
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

  // Primary Contact Partner
  primaryContactPartnerId?: string;
  primaryContactPartner?: {
    id: string;
    name: string;
    email: string;
  };

  // Budget Range
  budgetMin?: number;
  budgetMax?: number;

  // Expertise
  societyExpertise?: string; // JSON array of societies/areas

  // Additional Notes
  notes?: string;

  // Metadata
  archive: boolean;
  favorites: boolean;

  createdAt: Date;
  updatedAt: Date;

  // Property Lists 
  propertyListings: PropertyListing[]

  // Relations (optional for list view)
  interactionLogs?: Array<{
    id: string;
    subject: string;
    notes: string;
    communicationType: string;
    createdAt: Date;
  }>;
}

interface UseBrokersReturn {
  brokers: Broker[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>
}

export const useBrokers = (): UseBrokersReturn => {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrokers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/broker/get`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch brokers: ${response.statusText}`);
      }

      const responseData = await response.json();

      // Extract brokers from the response data
      const brokersList = Array.isArray(responseData)
        ? responseData
        : responseData.data || [];

      // Convert date strings to Date objects if needed
      const formattedBrokers = brokersList.map((broker: any) => ({
        ...broker,
        createdAt: typeof broker.createdAt === 'string' ? new Date(broker.createdAt) : broker.createdAt,
        updatedAt: typeof broker.updatedAt === 'string' ? new Date(broker.updatedAt) : broker.updatedAt,
      }));

      setBrokers(formattedBrokers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching brokers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  return {
    brokers,
    isLoading,
    error,
    refetch: fetchBrokers,
  };
};
