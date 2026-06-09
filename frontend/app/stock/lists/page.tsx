'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Building2,
  MapPin,
  Tag,
  IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useProperties, type PropertyListing } from '@/hooks/useProperties';

// ============================================================================
// Utility Functions
// ============================================================================

const formatPrice = (value?: number | null): string => {
  if (!value) return 'N/A';
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)} Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(2)} L`;
  return `₹${value.toLocaleString('en-IN')}`;
};

const getStatusStyle = (status: PropertyListing['availabilityStatus']) => {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'RENTED':
      return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    case 'SOLD':
      return 'bg-red-500/15 text-red-400 border border-red-500/30';
    case 'UPCOMING':
      return 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30';
    default:
      return 'bg-neutral-700 text-neutral-300 border border-neutral-600';
  }
};

const getTypeStyle = (type: PropertyListing['propertyType']) => {
  switch (type) {
    case 'FLAT':
      return 'bg-violet-500/15 text-violet-400 border border-violet-500/30';
    case 'LAND':
      return 'bg-orange-500/15 text-orange-400 border border-orange-500/30';
    case 'WAREHOUSE':
      return 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30';
    case 'COMMERCIAL':
      return 'bg-pink-500/15 text-pink-400 border border-pink-500/30';
    default:
      return 'bg-neutral-700 text-neutral-300 border border-neutral-600';
  }
};

// ============================================================================
// Filter State
// ============================================================================

interface FilterState {
  buildingName: string;
  location: string;
  propertyType: string;
  availabilityStatus: string;
  priceMin: number;
  priceMax: number;
  dateFrom: string;
  dateTo: string;
}

const defaultFilters: FilterState = {
  buildingName: '',
  location: '',
  propertyType: '',
  availabilityStatus: '',
  priceMin: 0,
  priceMax: 0,
  dateFrom: '',
  dateTo: '',
};

// ============================================================================
// Sub-components
// ============================================================================

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <Building2 className="h-12 w-12 text-neutral-600 mb-4" />
    <p className="text-sm font-medium text-neutral-300">No properties found</p>
    <p className="text-xs text-neutral-500 mt-1">Try adjusting your search or filter criteria</p>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
    <p className="text-sm font-medium text-red-300 text-center mb-4">{error}</p>
    <Button
      onClick={onRetry}
      className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600"
      size="sm"
    >
      Try Again
    </Button>
  </div>
);

const ListSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 rounded-xl border border-neutral-800 bg-neutral-900/60">
        <Skeleton className="h-5 w-40 bg-neutral-800" />
        <Skeleton className="h-5 w-24 bg-neutral-800" />
        <Skeleton className="h-5 w-28 bg-neutral-800" />
        <Skeleton className="h-5 w-20 bg-neutral-800 ml-auto" />
      </div>
    ))}
  </div>
);

interface FilterPanelProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  isLoading?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange, isLoading }) => {
  const [open, setOpen] = useState(false);

  const hasActive =
    filters.propertyType ||
    filters.availabilityStatus ||
    filters.priceMin ||
    filters.priceMax ||
    filters.dateFrom ||
    filters.dateTo;

  const handleClear = () =>
    onChange({
      ...defaultFilters,
      buildingName: filters.buildingName,
      location: filters.location,
    });

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="relative w-full sm:w-auto">
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto bg-neutral-900 border-neutral-700 hover:bg-neutral-800 text-neutral-200"
        >
          <Filter className="h-4 w-4 mr-2 text-yellow-400" />
          Advanced Filters
          {hasActive && <span className="ml-2 h-2 w-2 rounded-full bg-yellow-400 inline-block" />}
          <ChevronDown
            className={`h-4 w-4 ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="absolute top-full right-0 mt-2 p-5 rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl z-50 w-80 md:w-96 space-y-4">
        {/* Property Type */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Property Type
          </label>
          <Select
            value={filters.propertyType || 'all'}
            onValueChange={(v) => onChange({ ...filters, propertyType: v === 'all' ? '' : v })}
            disabled={isLoading}
          >
            <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-200">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-700">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="FLAT">Flat</SelectItem>
              <SelectItem value="LAND">Land</SelectItem>
              <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
              <SelectItem value="COMMERCIAL">Commercial</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Availability Status */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Availability
          </label>
          <Select
            value={filters.availabilityStatus || 'all'}
            onValueChange={(v) =>
              onChange({ ...filters, availabilityStatus: v === 'all' ? '' : v })
            }
            disabled={isLoading}
          >
            <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-700">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="RENTED">Rented</SelectItem>
              <SelectItem value="SOLD">Sold</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Price Min
            </label>
            <Input
              type="number"
              placeholder="e.g. 5000000"
              value={filters.priceMin || ''}
              onChange={(e) =>
                onChange({ ...filters, priceMin: e.target.value ? parseInt(e.target.value) : 0 })
              }
              disabled={isLoading}
              className="bg-neutral-800 border-neutral-700 text-neutral-200 text-sm placeholder:text-neutral-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Price Max
            </label>
            <Input
              type="number"
              placeholder="e.g. 50000000"
              value={filters.priceMax || ''}
              onChange={(e) =>
                onChange({ ...filters, priceMax: e.target.value ? parseInt(e.target.value) : 0 })
              }
              disabled={isLoading}
              className="bg-neutral-800 border-neutral-700 text-neutral-200 text-sm placeholder:text-neutral-600"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              From Date
            </label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
              disabled={isLoading}
              className="bg-neutral-800 border-neutral-700 text-neutral-200 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              To Date
            </label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
              disabled={isLoading}
              className="bg-neutral-800 border-neutral-700 text-neutral-200 text-sm"
            />
          </div>
        </div>

        {hasActive && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClear}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
          >
            Clear Filters
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

interface PaginationBarProps {
  current: number;
  total: number;
  onPage: (p: number) => void;
  isLoading?: boolean;
  totalItems: number;
  shownItems: number;
}

const PaginationBar: React.FC<PaginationBarProps> = ({
  current,
  total,
  onPage,
  isLoading,
  totalItems,
  shownItems,
}) => (
  <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-800 bg-neutral-950/60 rounded-b-2xl">
    <p className="text-xs text-neutral-500">
      Showing <span className="font-semibold text-neutral-300">{shownItems}</span> of{' '}
      <span className="font-semibold text-neutral-300">{totalItems}</span> properties
    </p>
    <div className="flex gap-2 items-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPage(current - 1)}
        disabled={current === 1 || isLoading}
        className="text-neutral-400 hover:text-white hover:bg-neutral-800"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-xs text-neutral-400 px-2">
        {current} / {total}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPage(current + 1)}
        disabled={current === total || isLoading}
        className="text-neutral-400 hover:text-white hover:bg-neutral-800"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

// ============================================================================
// Main Page
// ============================================================================

const ITEMS_PER_PAGE = 10;

export default function StockListsPage() {
  const router = useRouter();
  const { properties, isLoading, error, refetch } = useProperties();

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Client-side filtering (matches broker pattern)
  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (
        filters.buildingName &&
        !p.buildingName.toLowerCase().includes(filters.buildingName.toLowerCase())
      )
        return false;
      if (
        filters.location &&
        !p.location.toLowerCase().includes(filters.location.toLowerCase())
      )
        return false;
      if (filters.propertyType && p.propertyType !== filters.propertyType) return false;
      if (filters.availabilityStatus && p.availabilityStatus !== filters.availabilityStatus)
        return false;
      if (filters.priceMin > 0 && (p.askingPrice ?? 0) < filters.priceMin) return false;
      if (filters.priceMax > 0 && (p.askingPrice ?? Infinity) > filters.priceMax) return false;
      if (filters.dateFrom && new Date(p.createdAt) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(p.createdAt) > to) return false;
      }
      return true;
    });
  }, [properties, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // Reset page on filter change
  useEffect(() => setCurrentPage(1), [filters]);

  const handleView = useCallback(
    (id: string) => router.push(`/stock/lists/${id}`),
    [router],
  );
  const handleEdit = useCallback(
    (id: string) => router.push(`/stock/add-listing?id=${id}`),
    [router],
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        {/* Header */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                Stock Management
              </p>
              <h1 className="mt-2 text-3xl font-semibold">Properties</h1>
              <p className="mt-2 max-w-2xl text-sm text-neutral-400">
                Search, filter, and view all property listings.
              </p>
            </div>
            <Button
              onClick={() => router.push('/stock/add-listing')}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold"
            >
              + Add Property
            </Button>
          </div>

          {/* Search Row */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {/* Building Name Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <Input
                value={filters.buildingName}
                onChange={(e) => setFilters({ ...filters, buildingName: e.target.value })}
                placeholder="Search by building name..."
                className="border-neutral-700 bg-black/60 pl-10 text-white placeholder:text-neutral-500"
                disabled={isLoading}
              />
            </div>

            {/* Location Search */}
            <div className="relative flex-1">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <Input
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="Search by location..."
                className="border-neutral-700 bg-black/60 pl-10 text-white placeholder:text-neutral-500"
                disabled={isLoading}
              />
            </div>

            {/* Filter Panel */}
            <FilterPanel filters={filters} onChange={setFilters} isLoading={isLoading} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <ErrorState error={error} onRetry={refetch} />
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80">
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            {isLoading ? (
              <div className="p-6">
                <ListSkeleton />
              </div>
            ) : paginated.length === 0 ? (
              <EmptyState />
            ) : (
              <Table>
                <TableHeader className="bg-neutral-950/70">
                  <TableRow className="border-neutral-800 hover:bg-transparent">
                    <TableHead className="text-neutral-400 font-semibold py-4 pl-6">
                      Property
                    </TableHead>
                    <TableHead className="text-neutral-400 font-semibold py-4">Type</TableHead>
                    <TableHead className="text-neutral-400 font-semibold py-4">Location</TableHead>
                    <TableHead className="text-neutral-400 font-semibold py-4">Price</TableHead>
                    <TableHead className="text-neutral-400 font-semibold py-4">Status</TableHead>
                    <TableHead className="text-neutral-400 font-semibold py-4">Owner / Broker</TableHead>
                    <TableHead className="text-neutral-400 font-semibold py-4 text-right pr-6">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((p) => (
                    <TableRow
                      key={p.id}
                      className="border-neutral-800 hover:bg-neutral-800/40 transition-colors cursor-pointer"
                    >
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          {/* Thumbnail */}
                          {p.images?.[0]?.url ? (
                            <img
                              src={p.images[0].url}
                              alt={p.buildingName}
                              className="h-10 w-14 object-cover rounded-lg border border-neutral-700 flex-shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-14 rounded-lg border border-neutral-700 bg-neutral-800 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-4 w-4 text-neutral-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white text-sm">{p.buildingName}</p>
                            {p.floorNumber && (
                              <p className="text-xs text-neutral-500">Floor {p.floorNumber}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTypeStyle(p.propertyType)}`}>
                          {p.propertyType}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-neutral-300 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-neutral-500 flex-shrink-0" />
                          {p.location}
                        </div>
                        <p className="text-xs text-neutral-600 mt-0.5">PIN: {p.pinCode}</p>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1 text-yellow-400 font-semibold text-sm">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {formatPrice(p.askingPrice).replace('₹', '')}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(p.availabilityStatus)}`}>
                          {p.availabilityStatus}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-neutral-400 text-sm">
                        {p.owner?.name && (
                          <div className="text-xs">
                            <span className="text-neutral-500">Owner: </span>
                            <span className="text-neutral-300">{p.owner.name}</span>
                          </div>
                        )}
                        {p.sourcePartner?.name && (
                          <div className="text-xs mt-0.5">
                            <span className="text-neutral-500">Broker: </span>
                            <span className="text-neutral-300">{p.sourcePartner.name}</span>
                          </div>
                        )}
                        {!p.owner && !p.sourcePartner && (
                          <span className="text-neutral-600">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 pr-6">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(p.id)}
                            title="View property"
                            className="text-neutral-400 hover:text-yellow-400 hover:bg-yellow-400/10 cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(p.id)}
                            title="Edit property"
                            className="text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full bg-neutral-800 rounded-xl" />
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="p-3 space-y-3">
                {paginated.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3"
                  >
                    <div className="flex gap-3">
                      {p.images?.[0]?.url ? (
                        <img
                          src={p.images[0].url}
                          alt={p.buildingName}
                          className="h-16 w-20 object-cover rounded-lg border border-neutral-700 flex-shrink-0"
                        />
                      ) : (
                        <div className="h-16 w-20 rounded-lg border border-neutral-700 bg-neutral-800 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-neutral-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{p.buildingName}</p>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {p.location}
                        </p>
                        <p className="text-sm font-bold text-yellow-400 mt-1">
                          {formatPrice(p.askingPrice)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeStyle(p.propertyType)}`}>
                          {p.propertyType}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(p.availabilityStatus)}`}>
                          {p.availabilityStatus}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(p.id)}
                          className="text-neutral-400 hover:text-yellow-400 h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(p.id)}
                          className="text-neutral-400 hover:text-blue-400 h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && filtered.length > 0 && (
            <PaginationBar
              current={currentPage}
              total={totalPages}
              onPage={setCurrentPage}
              isLoading={isLoading}
              totalItems={filtered.length}
              shownItems={paginated.length}
            />
          )}
        </div>
      </div>
    </div>
  );
}
