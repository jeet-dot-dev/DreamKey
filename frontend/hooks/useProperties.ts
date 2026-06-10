import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

export interface PropertyImage {
  id: string;
  url: string;
  publicId?: string;
  caption?: string;
  order: number;
  createdAt: string;
}

export interface PropertyAmenities {
  id: string;
  parking: boolean;
  gym: boolean;
  lift: boolean;
  security: boolean;
  powerBackup: boolean;
  swimmingPool: boolean;
  clubhouse: boolean;
}

export interface PropertyBrochure {
  id: string;
  url: string;
  publicId?: string;
  fileName: string;
  createdAt: string;
}

export interface PropertyListing {
  id: string;

  // Core
  propertyType: 'FLAT' | 'LAND' | 'WAREHOUSE' | 'COMMERCIAL' | 'OTHER';
  buildingName: string;
  location: string;
  pinCode: string;

  // Specs
  floorNumber?: string;
  totalFloors?: number;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  carpetArea?: number;
  superBuiltUpArea?: number;

  // Pricing & Status
  askingPrice?: number;
  availabilityStatus: 'AVAILABLE' | 'RENTED' | 'SOLD' | 'UPCOMING';
  availabilityDate?: string;

  // Access & Notes
  accessType?: string;
  remarks?: string;

  // Society Insights
  builderName?: string;
  yearBuilt?: number;
  totalUnits?: number;
  reraNumber?: string;

  // Relations
  ownerId?: string;
  owner?: { id: string; name: string; phone: string; email?: string; whatsapp?: string } | null;
  sourcePartnerId?: string;
  sourcePartner?: { id: string; name: string; phone: string; email?: string; whatsapp?: string } | null;
  user?: { id: string; username: string; email: string };

  // Media
  images: PropertyImage[];
  amenities?: PropertyAmenities | null;
  societyBrochure?: PropertyBrochure | null;

  // Meta
  archive: boolean;
  favorites: boolean;
  createdAt: string;
  updatedAt: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

// ============================================================================
// useProperties — list with optional filters
// ============================================================================

export interface PropertyFilters {
  buildingName?: string;
  location?: string;
  propertyType?: string;
  availabilityStatus?: string;
  priceMin?: number;
  priceMax?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  ownerId?: string;
  sourcePartnerId?: string;
}

interface UsePropertiesReturn {
  properties: PropertyListing[];
  isLoading: boolean;
  error: string | null;
  pagination: { currentPage: number; pageSize: number; total: number; totalPages: number } | null;
  refetch: () => Promise<void>;
}

export const useProperties = (filters?: PropertyFilters): UsePropertiesReturn => {
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UsePropertiesReturn['pagination']>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.buildingName) params.set('buildingName', filters.buildingName);
      if (filters?.location) params.set('location', filters.location);
      if (filters?.propertyType) params.set('propertyType', filters.propertyType);
      if (filters?.availabilityStatus) params.set('availabilityStatus', filters.availabilityStatus);
      if (filters?.priceMin) params.set('priceMin', String(filters.priceMin));
      if (filters?.priceMax) params.set('priceMax', String(filters.priceMax));
      if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.set('dateTo', filters.dateTo);
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.ownerId) params.set('ownerId', filters.ownerId);
      if (filters?.sourcePartnerId) params.set('sourcePartnerId', filters.sourcePartnerId);
      // Fetch a large limit so we can do client-side pagination (matches broker pattern)
      params.set('limit', String(filters?.limit ?? 200));

      const query = params.toString();
      const response = await fetch(`${apiBaseUrl}/api/v1/property/get${query ? `?${query}` : ''}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.statusText}`);
      }

      const json = await response.json();
      const list = Array.isArray(json) ? json : json.data ?? [];

      setProperties(list);
      setPagination(json.pagination ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Error fetching properties:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    filters?.buildingName,
    filters?.location,
    filters?.propertyType,
    filters?.availabilityStatus,
    filters?.priceMin,
    filters?.priceMax,
    filters?.dateFrom,
    filters?.dateTo,
    filters?.page,
    filters?.limit,
    filters?.ownerId,
    filters?.sourcePartnerId,
  ]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, isLoading, error, pagination, refetch: fetchProperties };
};

// ============================================================================
// useProperty — single property by ID
// ============================================================================

interface UsePropertyReturn {
  data: PropertyListing | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useProperty = (id?: string): UsePropertyReturn => {
  const [data, setData] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/v1/property/${id}`);

      if (!response.ok) {
        if (response.status === 404) throw new Error('Property not found');
        throw new Error(`Failed to fetch property: ${response.statusText}`);
      }

      const json = await response.json();
      setData(json.data ?? json.property ?? json);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Error fetching property:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  return { data, loading, error, refetch: fetchProperty };
};
