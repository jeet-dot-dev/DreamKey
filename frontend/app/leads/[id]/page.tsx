'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  FileText,
  ChevronLeft,
  Edit,
  AlertCircle,
  Trash2,
  Bookmark,
  Activity,
  Layers,
  Sparkles,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeads, type Lead } from '@/hooks/useLeads';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import LeadInteractionTimeline from '@/components/lead-interaction/LeadInteractionTimeline';
import SharePropertyModal from '@/components/lead-interaction/SharePropertyModal';

// ============================================================================
// Utility Functions
// ============================================================================

const formatCurrency = (value?: number | null): string => {
  if (!value) return 'N/A';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${value.toLocaleString('en-IN')}`;
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
      return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30';
    case 'WARM':
      return 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30';
    case 'COLD':
      return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

// ============================================================================
// Subcomponents
// ============================================================================

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value, className = '' }) => (
  <div className={`flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors ${className}`}>
    <div className="text-yellow-400 mt-1">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <div className="text-sm text-white font-medium wrap-break-word">{value || 'N/A'}</div>
    </div>
  </div>
);

const DetailPageSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Skeleton className="h-12 w-1/3 bg-neutral-850" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-24 bg-neutral-850" />
      ))}
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string; onBack: () => void }> = ({ error, onBack }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <AlertCircle className="h-16 w-16 text-destructive mb-4" />
    <p className="text-lg font-semibold text-destructive mb-2">Lead Not Found</p>
    <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">{error}</p>
    <Button onClick={onBack} variant="outline">
      <ChevronLeft className="h-4 w-4 mr-2" />
      Back to List
    </Button>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params?.id as string;

  const { leads, isLoading, error, refetch } = useLeads();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'interactions'>('overview');

  const handleBack = () => {
    router.push('/leads/lists');
  };

  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized. Please login again.");
      router.push("/auth");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/leads/${leadId}`, {
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
      router.push("/leads");
    } catch (err) {
      toast.error("Failed to delete lead");
    } finally {
      setIsDeleting(false);
    }
  };

  // Find the specific lead
  const lead = useMemo(() => {
    return leads.find((l) => l.id === leadId);
  }, [leads, leadId]);

  // Parse amenities if it is JSON
  const amenities = useMemo(() => {
    if (!lead?.preferredAmenities) return [];
    try {
      const parsed = JSON.parse(lead.preferredAmenities);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [lead?.preferredAmenities]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background p-6">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Skeleton className="h-10 w-32 mb-6 bg-neutral-850" />
          <DetailPageSkeleton />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen w-full bg-background p-6">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <ErrorState error="The lead you're looking for doesn't exist." onBack={handleBack} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">

        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="hover:bg-muted text-white cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{lead.name}</h1>
              <p className="text-sm text-neutral-400 mt-1">Lead ID: {lead.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-4 py-2 rounded-full font-semibold border ${getStatusColor(lead.status)}`}>
              {lead.status.replace('_', ' ')}
            </span>
            <span className={`px-4 py-2 rounded-full font-semibold border ${getPriorityColor(lead.priority)}`}>
              {lead.priority} Priority
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer ${activeTab === 'overview'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-neutral-400 hover:text-white'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('interactions')}
            className={`pb-4 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer ${activeTab === 'interactions'
                ? 'border-yellow-400 text-yellow-400'
                : 'border-transparent text-neutral-400 hover:text-white'
              }`}
          >
            Interactions
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            onClick={() => router.push(`/leads/${leadId}/edit`)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Lead
          </Button>
          <Button
            onClick={() => setShowShareModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Property
          </Button>
          <Button
            onClick={() => setShowDeleteModal(true)}
            variant="destructive"
            className="bg-red-600 hover:bg-red-500 font-semibold transition-all transform hover:scale-105 active:scale-95 cursor-pointer text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Lead
          </Button>
        </div>

        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Basic Information Section */}
              <div className="rounded-2xl border border-neutral-800 bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-yellow-400" />
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem
                    icon={<Phone className="h-5 w-5" />}
                    label="Phone"
                    value={
                      <a href={`tel:${lead.phone}`} className="text-yellow-400 hover:underline">
                        {lead.phone}
                      </a>
                    }
                  />
                  <DetailItem
                    icon={<Mail className="h-5 w-5" />}
                    label="Email"
                    value={
                      lead.email ? (
                        <a href={`mailto:${lead.email}`} className="text-yellow-400 hover:underline">
                          {lead.email}
                        </a>
                      ) : (
                        'N/A'
                      )
                    }
                  />
                  {lead.whatsapp && (
                    <DetailItem
                      icon={<Phone className="h-5 w-5" />}
                      label="WhatsApp"
                      value={
                        <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">
                          {lead.whatsapp}
                        </a>
                      }
                    />
                  )}
                  <DetailItem
                    icon={<Sparkles className="h-5 w-5" />}
                    label="Lead Source"
                    value={lead.source}
                  />
                </div>
              </div>

              {/* Budget & Location Section */}
              <div className="rounded-2xl border border-neutral-800 bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-400" />
                  Budget & Location
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem
                    icon={<DollarSign className="h-5 w-5" />}
                    label="Budget Range"
                    value={
                      lead.budgetMin || lead.budgetMax ? (
                        `${formatCurrency(lead.budgetMin)} - ${formatCurrency(lead.budgetMax)}`
                      ) : (
                        'N/A'
                      )
                    }
                  />
                  <DetailItem
                    icon={<MapPin className="h-5 w-5" />}
                    label="Preferred Location"
                    value={lead.preferredLocation}
                  />
                </div>
              </div>

              {/* Property Preferences Section */}
              <div className="rounded-2xl border border-neutral-800 bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-yellow-400" />
                  Property Preferences
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem
                    icon={<Building2 className="h-5 w-5" />}
                    label="Property Type"
                    value={lead.propertyType}
                  />
                  <DetailItem
                    icon={<Layers className="h-5 w-5" />}
                    label="Configuration"
                    value={
                      lead.bedrooms || lead.bathrooms ? (
                        `${lead.bedrooms || 0} BHK / ${lead.bathrooms || 0} Bath`
                      ) : (
                        'N/A'
                      )
                    }
                  />
                  <DetailItem
                    icon={<Layers className="h-5 w-5" />}
                    label="Area Range (Sq.Ft.)"
                    value={
                      lead.minArea || lead.maxArea ? (
                        `${lead.minArea ? Number(lead.minArea) : 0} - ${lead.maxArea ? Number(lead.maxArea) : 0} Sq.Ft.`
                      ) : (
                        'N/A'
                      )
                    }
                  />
                  <DetailItem
                    icon={<Sparkles className="h-5 w-5" />}
                    label="Furnishing Status"
                    value={lead.furnishedType ? lead.furnishedType.replace('_', ' ') : 'N/A'}
                  />
                </div>
              </div>

              {/* Amenities Section */}
              <div className="rounded-2xl border border-neutral-800 bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  Preferred Amenities
                </h2>
                {amenities.length === 0 ? (
                  <p className="text-sm text-neutral-400">No amenities preferences specified.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity: string, idx: number) => (
                      <span key={idx} className="text-sm bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-3 py-1.5 rounded-xl font-medium">
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes Section */}
              {lead.notes && (
                <div className="rounded-2xl border border-neutral-800 bg-card p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-yellow-400" />
                    Notes
                  </h2>
                  <p className="text-sm text-neutral-300 whitespace-pre-wrap bg-neutral-950/40 p-4 rounded-xl border border-neutral-800">
                    {lead.notes}
                  </p>
                </div>
              )}

            </div>

            {/* Right Column - Status & Metadata */}
            <div className="space-y-6">

              {/* Purchase Details Card */}
              <div className="rounded-2xl border border-neutral-800 bg-card p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-white">Purchase Timeline</h2>

                <DetailItem
                  icon={<Calendar className="h-5 w-5" />}
                  label="Estimated Timeline"
                  value={lead.purchaseTimeline || 'Exploring / No Timeline'}
                />
              </div>

              {/* Dates Card */}
              <div className="rounded-2xl border border-neutral-800 bg-card p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-white">Metadata</h2>

                <DetailItem
                  icon={<Calendar className="h-5 w-5" />}
                  label="Created"
                  value={formatDate(lead.createdAt)}
                />

                <DetailItem
                  icon={<Calendar className="h-5 w-5" />}
                  label="Last Updated"
                  value={formatDate(lead.updatedAt)}
                />
              </div>

            </div>

          </div>
        ) : (
          <LeadInteractionTimeline leadId={leadId} leadName={lead.name} />
        )}

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

      {/* Share Property Modal */}
      <SharePropertyModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        leadId={leadId}
        leadName={lead.name}
        leadPhone={lead.phone}
        leadWhatsapp={lead.whatsapp}
      />

    </div>
  );
}
