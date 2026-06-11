import { useState, useEffect, useCallback } from 'react';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  whatsapp?: string | null;
  source?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  preferredLocation?: string | null;
  propertyType?: 'FLAT' | 'LAND' | 'WAREHOUSE' | 'COMMERCIAL' | 'OTHER' | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  minArea?: number | null;
  maxArea?: number | null;
  furnishedType?: 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED' | null;
  preferredAmenities?: string | null;
  purchaseTimeline?: string | null;
  priority: 'HOT' | 'WARM' | 'COLD';
  notes?: string | null;
  status: 'NEW' | 'FOLLOW_UP' | 'NEGOTIATION' | 'CLOSED' | 'LOST';
  createdAt: Date;
  updatedAt: Date;
}

interface UseLeadsReturn {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useLeads = (): UseLeadsReturn => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/leads`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leads: ${response.statusText}`);
      }

      const responseData = await response.json();

      // Extract leads from the success: true wrapper format
      const leadsList = responseData.success
        ? responseData.data
        : Array.isArray(responseData)
        ? responseData
        : responseData.data || [];

      // Convert date strings to Date objects
      const formattedLeads = leadsList.map((lead: any) => ({
        ...lead,
        createdAt: typeof lead.createdAt === 'string' ? new Date(lead.createdAt) : lead.createdAt,
        updatedAt: typeof lead.updatedAt === 'string' ? new Date(lead.updatedAt) : lead.updatedAt,
      }));

      setLeads(formattedLeads);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching leads:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    isLoading,
    error,
    refetch: fetchLeads,
  };
};
