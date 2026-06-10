'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  Edit,
  Phone,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useBrokers, type Broker } from '@/hooks/useBrokers';

// ============================================================================
// Type Definitions
// ============================================================================

interface FilterState {
  status: string;
  partner: string;
  budgetMin: number;
  budgetMax: number;
  dateFrom: string;
  dateTo: string;
  searchName: string;
  searchArea: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const formatCurrency = (value?: number): string => {
  if (!value) return 'N/A';
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  return `₹${value.toLocaleString()}`;
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusColor = (status: Broker['status']): string => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'INACTIVE':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'BLOCKED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

// ============================================================================
// Components
// ============================================================================

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="text-muted-foreground text-center">
      <p className="text-sm font-medium">No brokers found</p>
      <p className="text-xs mt-1">Try adjusting your search or filter criteria</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
    <p className="text-sm font-medium text-destructive text-center mb-4">{error}</p>
    <Button onClick={onRetry} variant="outline" size="sm">
      Try Again
    </Button>
  </div>
);

const BrokerListSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex flex-col gap-3 p-4 rounded-lg border bg-card">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ))}
  </div>
);

interface FilterSectionProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isLoading?: boolean;
  partners?: Array<{ id: string; name: string }>;
}

const FilterSection: React.FC<FilterSectionProps> = ({ filters, onFiltersChange, isLoading = false, partners = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value === 'all' ? '' : value });
  };

  const handlePartnerChange = (value: string) => {
    onFiltersChange({ ...filters, partner: value === 'all' ? '' : value });
  };

  const handleBudgetMinChange = (value: string) => {
    onFiltersChange({ ...filters, budgetMin: value ? parseInt(value) : 0 });
  };

  const handleBudgetMaxChange = (value: string) => {
    onFiltersChange({ ...filters, budgetMax: value ? parseInt(value) : 0 });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      status: '',
      partner: '',
      budgetMin: 0,
      budgetMax: 0,
      dateFrom: '',
      dateTo: '',
      searchName: filters.searchName,
      searchArea: filters.searchArea,
    });
  };

  const hasActiveFilters = filters.status || filters.partner || filters.budgetMin || filters.budgetMax || filters.dateFrom || filters.dateTo;

  return (
    <div className="relative w-full sm:w-auto">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
            {hasActiveFilters && <span className="ml-2 h-2 w-2 rounded-full bg-blue-500" />}
            <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="absolute top-full right-0 mt-2 p-4 border rounded-lg bg-card space-y-4 shadow-lg z-50 w-80 md:w-96">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <Select value={filters.status || 'all'} onValueChange={handleStatusChange} disabled={isLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Partner Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Primary Contact Partner</label>
            <Select value={filters.partner || 'all'} onValueChange={handlePartnerChange} disabled={isLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Partners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Partners</SelectItem>
                {partners.length > 0 && partners.map((p) => (
                  <SelectItem key={p.id} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Budget Min</label>
              <Input
                type="number"
                placeholder="Min"
                value={filters.budgetMin || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBudgetMinChange(e.target.value)}
                disabled={isLoading}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Budget Max</label>
              <Input
                type="number"
                placeholder="Max"
                value={filters.budgetMax || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBudgetMaxChange(e.target.value)}
                disabled={isLoading}
                className="text-sm"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">From Date</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                disabled={isLoading}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">To Date</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                disabled={isLoading}
                className="text-sm"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearFilters}
              disabled={isLoading}
              className="w-full"
            >
              Clear Filters
            </Button>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, isLoading = false }) => (
  <div className="flex items-center justify-between px-4 py-4 border-t bg-card rounded-b-lg">
    <p className="text-sm text-muted-foreground">
      Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
    </p>
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export default function BrokerListPage() {
  const router = useRouter();
  const { brokers, isLoading: hookLoading, error, refetch } = useBrokers();
  
  const [currentPage, setCurrentPage] = useState(1);
  const BROKERS_PER_PAGE = 10;

  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (broker: any) => {
    setSelectedBroker(broker);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBroker) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized", {
        description: "Please sign in again to continue.",
      });
      router.push("/auth");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/broker/${selectedBroker.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resJson = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resJson.message || "Failed to delete broker");
      }

      toast.success("Broker deleted successfully");
      setShowDeleteModal(false);
      setSelectedBroker(null);
      void refetch();
    } catch (err) {
      toast.error("Failed to delete broker");
    } finally {
      setIsDeleting(false);
    }
  };

  const [filters, setFilters] = useState<FilterState>({
    status: '',
    partner: '',
    budgetMin: 0,
    budgetMax: 0,
    dateFrom: '',
    dateTo: '',
    searchName: '',
    searchArea: '',
  });

  // Extract unique partners from brokers
  const partners = useMemo(() => {
    const uniquePartners = new Map();
    brokers.forEach((broker) => {
      if (broker.primaryContactPartner?.id && broker.primaryContactPartner?.name) {
        uniquePartners.set(broker.primaryContactPartner.id, {
          id: broker.primaryContactPartner.id,
          name: broker.primaryContactPartner.name,
        });
      }
    });
    return Array.from(uniquePartners.values());
  }, [brokers]);

  // Filter brokers based on filter state
  const filteredBrokers = useMemo(() => {
    return brokers.filter((broker) => {
      // Name search (case-insensitive)
      if (filters.searchName && !broker.name.toLowerCase().includes(filters.searchName.toLowerCase())) {
        return false;
      }

      // Area search (case-insensitive)
      if (filters.searchArea && broker.areaOfOperation && 
          !broker.areaOfOperation.toLowerCase().includes(filters.searchArea.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filters.status && broker.status !== filters.status) {
        return false;
      }

      // Partner filter - match by name
      if (filters.partner && broker.primaryContactPartner?.name !== filters.partner) {
        return false;
      }

      // Budget range filter
      if (filters.budgetMin > 0 && broker.budgetMax && broker.budgetMax < filters.budgetMin) {
        return false;
      }
      if (filters.budgetMax > 0 && broker.budgetMin && broker.budgetMin > filters.budgetMax) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (new Date(broker.createdAt) < fromDate) {
          return false;
        }
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (new Date(broker.createdAt) > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [brokers, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredBrokers.length / BROKERS_PER_PAGE);
  const paginatedBrokers = useMemo(() => {
    const startIndex = (currentPage - 1) * BROKERS_PER_PAGE;
    return filteredBrokers.slice(startIndex, startIndex + BROKERS_PER_PAGE);
  }, [filteredBrokers, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Action handlers
  const handleView = useCallback((id: string) => {
    router.push(`/broker/lists/${id}`);
  }, [router]);

  const handleEdit = useCallback((id: string) => {
    router.push(`/broker/add-listing?id=${id}`);
  }, [router]);

  const handleInteraction = useCallback((id: string) => {
    router.push(`/broker/interaction/add?id=${id}`);
  }, [router]);

  // Handle search inputs
  const handleSearchNameChange = (value: string) => {
    setFilters({ ...filters, searchName: value });
  };

  const handleSearchAreaChange = (value: string) => {
    setFilters({ ...filters, searchArea: value });
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Brokers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and view all broker information
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <ErrorState error={error} onRetry={refetch} />
          </div>
        )}

        {/* Search Section */}
        <div className="relative z-20 space-y-4 mb-6">
          {/* Name Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by broker name..."
              value={filters.searchName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchNameChange(e.target.value)}
              className="pl-10"
              disabled={hookLoading}
            />
          </div>

          {/* Area Search and Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Search by area of operation..."
                value={filters.searchArea}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchAreaChange(e.target.value)}
                disabled={hookLoading}
              />
            </div>
            <div className="w-full sm:w-auto">
              <FilterSection
                filters={filters}
                onFiltersChange={setFilters}
                isLoading={hookLoading}
                partners={partners}
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing <span className="font-semibold">{paginatedBrokers.length}</span> of{' '}
          <span className="font-semibold">{filteredBrokers.length}</span> brokers
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
          {hookLoading ? (
            <div className="p-6">
              <BrokerListSkeleton />
            </div>
          ) : paginatedBrokers.length === 0 ? (
            <div className="p-6">
              <EmptyState />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Phone</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Budget Range</TableHead>
                      <TableHead className="font-semibold">Primary Partner</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBrokers.map((broker) => (
                      <TableRow key={broker.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium text-foreground">{broker.name}</TableCell>
                        <TableCell>
                          <a href={`tel:${broker.phone}`} className="text-primary hover:underline">
                            {broker.phone}
                          </a>
                        </TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(broker.status)}`}>
                            {broker.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatCurrency(broker.budgetMin)} - {formatCurrency(broker.budgetMax)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {broker.primaryContactPartner?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" className='cursor-pointer' size="sm" onClick={() => handleView(broker.id)} title="View broker">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm"className='cursor-pointer'  onClick={() => handleEdit(broker.id)} title="Edit broker">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className='cursor-pointer'  onClick={() => handleInteraction(broker.id)} title="Add interaction">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className='cursor-pointer text-red-500 hover:text-red-400 hover:bg-red-500/10' onClick={() => handleDeleteClick(broker)} title="Delete broker">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                isLoading={hookLoading}
              />
            </>
          )}
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {hookLoading ? (
            <BrokerListSkeleton />
          ) : paginatedBrokers.length === 0 ? (
            <EmptyState />
          ) : (
            paginatedBrokers.map((broker) => (
              <div key={broker.id} className="p-4 rounded-lg border bg-card space-y-3">
                <div>
                  <p className="font-medium text-foreground">{broker.name}</p>
                  <a href={`tel:${broker.phone}`} className="text-sm text-primary hover:underline">
                    {broker.phone}
                  </a>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(broker.status)}`}>
                    {broker.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(broker.budgetMin)} - {formatCurrency(broker.budgetMax)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleView(broker.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(broker.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleInteraction(broker.id)}>
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400" onClick={() => handleDeleteClick(broker)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Broker"
        message={
          <>
            Are you sure you want to delete broker <strong className="text-white">{selectedBroker?.name}</strong>? This will permanently remove the broker record and all related interaction logs. Linked property listings will not be deleted, but will no longer point to this broker.
          </>
        }
        loading={isDeleting}
      />
    </div>
  );
}
