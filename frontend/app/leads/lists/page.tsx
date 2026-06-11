'use client';

import React, { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Search,
    ChevronUp,
    ChevronDown,
    Edit,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Trash2,
    Plus,
    Eye,
    Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeads, type Lead } from '@/hooks/useLeads';
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

// ============================================================================
// Utility Functions
// ============================================================================

const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatCurrency = (value?: number | null): string => {
    if (!value) return '0';
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toLocaleString('en-IN')}`;
};

const getStatusColor = (status: Lead['status']): string => {
    switch (status) {
        case 'NEW':
            return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
        case 'FOLLOW_UP':
            return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
        case 'NEGOTIATION':
            return 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
        case 'CLOSED':
            return 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30';
        case 'LOST':
            return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
};

const getPriorityColor = (priority: Lead['priority']): string => {
    switch (priority) {
        case 'HOT':
            return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 font-semibold';
        case 'WARM':
            return 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 font-semibold';
        case 'COLD':
            return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 font-semibold';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
};

const getTypeStyle = (type?: string | null) => {
    if (!type) return 'bg-muted text-muted-foreground border-border';
    switch (type) {
        case 'FLAT':
            return 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30';
        case 'LAND':
            return 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30';
        case 'WAREHOUSE':
            return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
        case 'COMMERCIAL':
            return 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
};

// ============================================================================
// Subcomponents
// ============================================================================

const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-12">
        <div className="text-muted-foreground text-center">
            <p className="text-sm font-medium">No leads found</p>
            <p className="text-xs mt-1">Try adjusting your search criteria or add a new lead</p>
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

const LeadListSkeleton: React.FC = () => (
    <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 p-4 rounded-lg border bg-card">
                <Skeleton className="h-5 w-full bg-neutral-850" />
                <Skeleton className="h-4 w-3/4 bg-neutral-850" />
                <Skeleton className="h-4 w-1/2 bg-neutral-850" />
            </div>
        ))}
    </div>
);

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
// Filter State
// ============================================================================

interface FilterState {
    name: string;
    phone: string;
    propertyType: string;
    status: string;
    priority: string;
    budgetMin: number;
    budgetMax: number;
    dateFrom: string;
    dateTo: string;
}

const defaultFilters: FilterState = {
    name: '',
    phone: '',
    propertyType: '',
    status: '',
    priority: '',
    budgetMin: 0,
    budgetMax: 0,
    dateFrom: '',
    dateTo: '',
};

interface FilterPanelProps {
    filters: FilterState;
    onChange: (f: FilterState) => void;
    isLoading?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange, isLoading }) => {
    const [open, setOpen] = useState(false);

    const hasActive =
        filters.propertyType ||
        filters.status ||
        filters.priority ||
        filters.budgetMin ||
        filters.budgetMax ||
        filters.dateFrom ||
        filters.dateTo;

    const handleClear = () =>
        onChange({
            ...defaultFilters,
            name: filters.name,
            phone: filters.phone,
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
                {/* Status */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Status
                    </label>
                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(v) => onChange({ ...filters, status: v === 'all' ? '' : v })}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-200">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-700">
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="NEW">New</SelectItem>
                            <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                            <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                            <SelectItem value="LOST">Lost</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Priority
                    </label>
                    <Select
                        value={filters.priority || 'all'}
                        onValueChange={(v) => onChange({ ...filters, priority: v === 'all' ? '' : v })}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-200">
                            <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-700">
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="HOT">Hot</SelectItem>
                            <SelectItem value="WARM">Warm</SelectItem>
                            <SelectItem value="COLD">Cold</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

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

                {/* Budget Range */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            Min Budget
                        </label>
                        <Input
                            type="number"
                            placeholder="Min"
                            value={filters.budgetMin || ''}
                            onChange={(e) =>
                                onChange({ ...filters, budgetMin: e.target.value ? parseInt(e.target.value) : 0 })
                            }
                            disabled={isLoading}
                            className="bg-neutral-800 border-neutral-700 text-neutral-200 text-sm placeholder:text-neutral-600"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                            Max Budget
                        </label>
                        <Input
                            type="number"
                            placeholder="Max"
                            value={filters.budgetMax || ''}
                            onChange={(e) =>
                                onChange({ ...filters, budgetMax: e.target.value ? parseInt(e.target.value) : 0 })
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

// ============================================================================
// Main Component Content
// ============================================================================

function LeadListPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { leads, isLoading: hookLoading, error, refetch } = useLeads();

    const [currentPage, setCurrentPage] = useState(1);
    const LEADS_PER_PAGE = 10;

    const [filters, setFilters] = useState<FilterState>(defaultFilters);

    // Sorting states
    const [sortField, setSortField] = useState<keyof Lead | 'budget' | 'createdAt'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Dialog and Delete states
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Check query param to trigger new lead page
    useEffect(() => {
        if (searchParams && searchParams.get('add') === 'true') {
            router.push('/leads/add-listing');
        }
    }, [searchParams, router]);

    const handleCreateClick = () => {
        router.push('/leads/add-listing');
    };

    const handleEditClick = (e: React.MouseEvent, lead: Lead) => {
        e.stopPropagation();
        router.push(`/leads/${lead.id}/edit`);
    };

    const handleDeleteClick = (e: React.MouseEvent, lead: Lead) => {
        e.stopPropagation();
        setSelectedLead(lead);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedLead) return;
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Unauthorized. Please login again.");
            router.push("/auth");
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/leads/${selectedLead.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const resJson = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(resJson.message || "Failed to delete lead");
            }

            toast.success("Lead deleted successfully");
            setShowDeleteModal(false);
            setSelectedLead(null);
            void refetch();
        } catch (err) {
            toast.error("Failed to delete lead");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRowClick = (id: string) => {
        router.push(`/leads/${id}`);
    };

    const handleSort = (field: keyof Lead | 'budget' | 'createdAt') => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // Filter leads based on search state
    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            // Name search (case-insensitive)
            if (filters.name && !lead.name.toLowerCase().includes(filters.name.toLowerCase())) {
                return false;
            }

            // Phone search (contains match)
            if (filters.phone && !lead.phone.includes(filters.phone)) {
                return false;
            }

            // Status filter
            if (filters.status && lead.status !== filters.status) {
                return false;
            }

            // Priority filter
            if (filters.priority && lead.priority !== filters.priority) {
                return false;
            }

            // Property Type filter
            if (filters.propertyType && lead.propertyType !== filters.propertyType) {
                return false;
            }

            // Budget Min filter
            if (filters.budgetMin > 0 && (lead.budgetMin ?? 0) < filters.budgetMin) {
                return false;
            }

            // Budget Max filter
            if (filters.budgetMax > 0 && (lead.budgetMax ?? Infinity) > filters.budgetMax) {
                return false;
            }

            // Date Range filter
            if (filters.dateFrom && new Date(lead.createdAt) < new Date(filters.dateFrom)) {
                return false;
            }

            if (filters.dateTo) {
                const to = new Date(filters.dateTo);
                to.setHours(23, 59, 59, 999);
                if (new Date(lead.createdAt) > to) {
                    return false;
                }
            }

            return true;
        });
    }, [leads, filters]);

    // Sort leads based on sort options
    const sortedLeads = useMemo(() => {
        const sorted = [...filteredLeads];
        sorted.sort((a, b) => {
            let valA: any = a[sortField as keyof Lead];
            let valB: any = b[sortField as keyof Lead];

            if (sortField === 'budget') {
                valA = a.budgetMin ?? 0;
                valB = b.budgetMin ?? 0;
            }

            if (valA === undefined || valA === null) valA = '';
            if (valB === undefined || valB === null) valB = '';

            if (valA instanceof Date && valB instanceof Date) {
                return sortOrder === 'asc'
                    ? valA.getTime() - valB.getTime()
                    : valB.getTime() - valA.getTime();
            }

            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortOrder === 'asc'
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }

            return sortOrder === 'asc'
                ? (valA > valB ? 1 : -1)
                : (valA < valB ? 1 : -1);
        });
        return sorted;
    }, [filteredLeads, sortField, sortOrder]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedLeads.length / LEADS_PER_PAGE));

    const paginatedLeads = useMemo(() => {
        const startIndex = (currentPage - 1) * LEADS_PER_PAGE;
        return sortedLeads.slice(startIndex, startIndex + LEADS_PER_PAGE);
    }, [sortedLeads, currentPage]);

    // Reset page on filter change
    useEffect(() => setCurrentPage(1), [filters]);

    const renderSortIcon = (field: keyof Lead | 'budget' | 'createdAt') => {
        if (sortField !== field) return null;
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-1 inline" /> : <ChevronDown className="h-4 w-4 ml-1 inline" />;
    };

    return (
        <div className="w-full min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 py-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-neutral-800 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Leads</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage and track potential client leads
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreateClick}
                        className="sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-yellow-400/20 cursor-pointer self-start sm:self-center"
                    >
                        <Plus className="w-5 h-5" />
                        Add Lead
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                        <ErrorState error={error} onRetry={refetch} />
                    </div>
                )}

                {/* Search Row */}
                <div className="mt-6 mb-6 flex flex-col sm:flex-row gap-3">
                    {/* Name Search */}
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                        <Input
                            value={filters.name}
                            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                            placeholder="Search by lead name..."
                            className="border-neutral-700 bg-black/60 pl-10 text-white placeholder:text-neutral-500"
                            disabled={hookLoading}
                        />
                    </div>

                    {/* Phone Search */}
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                        <Input
                            value={filters.phone}
                            onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                            placeholder="Search by phone number..."
                            className="border-neutral-700 bg-black/60 pl-10 text-white placeholder:text-neutral-500"
                            disabled={hookLoading}
                        />
                    </div>

                    {/* Filter Panel */}
                    <FilterPanel filters={filters} onChange={setFilters} isLoading={hookLoading} />
                </div>

                {/* Results Count */}
                <div className="mb-4 text-sm text-muted-foreground">
                    Showing <span className="font-semibold">{paginatedLeads.length}</span> of{' '}
                    <span className="font-semibold">{filteredLeads.length}</span> leads
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
                    {hookLoading ? (
                        <div className="p-6">
                            <LeadListSkeleton />
                        </div>
                    ) : paginatedLeads.length === 0 ? (
                        <div className="p-6">
                            <EmptyState />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="font-semibold text-white cursor-pointer select-none" onClick={() => handleSort('name')}>
                                                Name {renderSortIcon('name')}
                                            </TableHead>
                                            <TableHead className="font-semibold text-white">Phone</TableHead>
                                            <TableHead className="font-semibold text-white">Location</TableHead>
                                            <TableHead className="font-semibold text-white cursor-pointer select-none" onClick={() => handleSort('budget')}>
                                                Budget {renderSortIcon('budget')}
                                            </TableHead>
                                            <TableHead className="font-semibold text-white">Property Type</TableHead>
                                            <TableHead className="font-semibold text-white">Status</TableHead>
                                            <TableHead className="font-semibold text-white cursor-pointer select-none" onClick={() => handleSort('priority')}>
                                                Priority {renderSortIcon('priority')}
                                            </TableHead>
                                            <TableHead className="font-semibold text-white cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
                                                Created At {renderSortIcon('createdAt')}
                                            </TableHead>
                                            <TableHead className="font-semibold text-right text-white pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedLeads.map((lead) => (
                                            <TableRow
                                                key={lead.id}
                                                onClick={() => handleRowClick(lead.id)}
                                                className="hover:bg-muted/50 transition-colors cursor-pointer"
                                            >
                                                <TableCell className="font-medium text-white">{lead.name}</TableCell>
                                                <TableCell className="text-muted-foreground">{lead.phone}</TableCell>
                                                <TableCell className="text-muted-foreground">{lead.preferredLocation || 'N/A'}</TableCell>
                                                <TableCell className="text-white font-medium">
                                                    {lead.budgetMin || lead.budgetMax ? (
                                                        <>
                                                            {formatCurrency(lead.budgetMin)} - {formatCurrency(lead.budgetMax)}
                                                        </>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${getTypeStyle(lead.propertyType)}`}>
                                                        {lead.propertyType || 'N/A'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                                                        {lead.status.replace('_', ' ')}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(lead.priority)}`}>
                                                        {lead.priority}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {formatDate(lead.createdAt)}
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex gap-2 justify-end pr-4">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="cursor-pointer text-neutral-450 hover:text-white"
                                                            onClick={() => router.push(`/leads/${lead.id}`)}
                                                            title="View details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="cursor-pointer text-neutral-450 hover:text-white"
                                                            onClick={(e) => handleEditClick(e, lead)}
                                                            title="Edit lead"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="cursor-pointer text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                            onClick={(e) => handleDeleteClick(e, lead)}
                                                            title="Delete lead"
                                                        >
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
                        <LeadListSkeleton />
                    ) : paginatedLeads.length === 0 ? (
                        <EmptyState />
                    ) : (
                        paginatedLeads.map((lead) => (
                            <div
                                key={lead.id}
                                onClick={() => handleRowClick(lead.id)}
                                className="p-4 rounded-lg border bg-card space-y-3 cursor-pointer hover:border-neutral-700 transition-all"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-white">{lead.name}</p>
                                        <p className="text-sm text-neutral-400">{lead.phone}</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5 items-end">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(lead.status)}`}>
                                            {lead.status.replace('_', ' ')}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getPriorityColor(lead.priority)}`}>
                                            {lead.priority}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground flex flex-col gap-1 border-t border-neutral-800 pt-2">
                                    <p>Location: <span className="text-white">{lead.preferredLocation || 'N/A'}</span></p>
                                    <p>Budget: <span className="text-white">
                                        {lead.budgetMin || lead.budgetMax ? `${formatCurrency(lead.budgetMin)} - ${formatCurrency(lead.budgetMax)}` : 'N/A'}
                                    </span></p>
                                    <p>Property Type: <span className="text-white">{lead.propertyType || 'N/A'}</span></p>
                                </div>
                                <div className="flex gap-2 border-t border-neutral-800 pt-2" onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="text-neutral-450 hover:text-white" onClick={() => router.push(`/leads/${lead.id}`)}>
                                        <Eye className="h-4 w-4 mr-1" /> View
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-neutral-450 hover:text-white" onClick={(e) => handleEditClick(e, lead)}>
                                        <Edit className="h-4 w-4 mr-1" /> Edit
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 ml-auto" onClick={(e) => handleDeleteClick(e, lead)}>
                                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>



            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => !isDeleting && setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Lead"
                message={
                    <>
                        Are you sure you want to delete this lead? This action cannot be undone.
                    </>
                }
                loading={isDeleting}
            />

        </div>
    );
}

export default function LeadListPage() {
    return (
        <Suspense fallback={
            <div className="w-full min-h-screen bg-background p-6 text-white">
                <div className="mx-auto max-w-7xl px-4 py-6">
                    <Skeleton className="h-12 w-48 bg-neutral-850 mb-6" />
                    <LeadListSkeleton />
                </div>
            </div>
        }>
            <LeadListPageContent />
        </Suspense>
    );
}
