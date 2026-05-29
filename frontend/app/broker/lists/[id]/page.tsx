'use client';

import React, { useMemo } from 'react';
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
  MessageSquare,
  AlertCircle,
  Loader,
  Archive,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBrokers, type Broker } from '@/hooks/useBrokers';
import { toast } from 'sonner';

// Constants
const BROKERS_PER_PAGE = 10;

// Utility Functions
const formatCurrency = (value?: number): string => {
  if (!value) return 'N/A';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${value.toLocaleString()}`;
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

// Detail Item Component
interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value, className = '' }) => (
  <div className={`flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors ${className}`}>
    <div className="text-primary/80 mt-1">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <div className="text-sm text-foreground font-medium wrap-break-word">{value || 'N/A'}</div>
    </div>
  </div>
);

// Loading Skeleton
const DetailPageSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Skeleton className="h-12 w-1/3" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  </div>
);

// Error State
const ErrorState: React.FC<{ error: string; onBack: () => void }> = ({ error, onBack }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <AlertCircle className="h-16 w-16 text-destructive mb-4" />
    <p className="text-lg font-semibold text-destructive mb-2">Broker Not Found</p>
    <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">{error}</p>
    <Button onClick={onBack} variant="outline">
      <ChevronLeft className="h-4 w-4 mr-2" />
      Back to List
    </Button>
  </div>
);

// Main Component
export default function BrokerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const brokerId = params?.id as string;
  const { brokers, isLoading, error } = useBrokers();

  // Find the specific broker
  const broker = useMemo(() => {
    return brokers.find((b) => b.id === brokerId);
  }, [brokers, brokerId]);

  // Parse areas and societies if they are JSON strings
  const areas = useMemo(() => {
    if (!broker?.areaOfOperation) return [];
    try {
      return typeof broker.areaOfOperation === 'string'
        ? JSON.parse(broker.areaOfOperation)
        : Array.isArray(broker.areaOfOperation)
        ? broker.areaOfOperation
        : [];
    } catch {
      return [broker.areaOfOperation];
    }
  }, [broker?.areaOfOperation]);

  const societies = useMemo(() => {
    if (!broker?.societyExpertise) return [];
    try {
      return typeof broker.societyExpertise === 'string'
        ? JSON.parse(broker.societyExpertise)
        : Array.isArray(broker.societyExpertise)
        ? broker.societyExpertise
        : [];
    } catch {
      return [broker.societyExpertise];
    }
  }, [broker?.societyExpertise]);

  // Action handlers
  const handleEdit = () => {
    router.push(`/broker/lists/${brokerId}/edit`);
  };

  const handleSeeInteractions = () => {
    router.push(`/broker/interaction?id=${brokerId}`);
  };

  const handleArchive = async () => {
    try {
      toast.info("Coming Soon !")
      // Archive logic will be implemented after route creation
      console.log('Archive broker:', brokerId);
      // await archiveBroker(brokerId);
    } catch (error) {
      console.error('Failed to archive broker:', error);
    }
  };

  const handleFavorite = async () => {
    try {
         toast.info("Coming Soon !")
      // Favorite logic will be implemented after route creation
      console.log('Toggle favorite for broker:', brokerId);
      // await toggleFavoriteBroker(brokerId);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Skeleton className="h-10 w-32 mb-6" />
          <DetailPageSkeleton />
        </div>
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="min-h-screen w-full bg-background">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <ErrorState error="The broker you're looking for doesn't exist." onBack={handleBack} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="hover:bg-muted"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{broker.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">Broker Details & Information</p>
            </div>
          </div>
          {/* Status Badge - Dot on mobile, Full text on desktop */}
          <span className={`rounded-full font-semibold ${getStatusColor(broker.status)}`}>
            {/* Mobile: Dot */}
            <span className="sm:hidden h-3 w-3 rounded-full inline-block" style={{
              backgroundColor: broker.status === 'ACTIVE' ? '#22c55e' : broker.status === 'INACTIVE' ? '#eab308' : '#ef4444'
            }} />
            {/* Desktop: Full text */}
            <span className="hidden sm:inline px-4 py-2">
              {broker.status}
            </span>
          </span>
        </div>

        {/* Action Buttons - Mobile First */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-8 auto-rows-max">
          <Button
            onClick={handleSeeInteractions}
            className="bg-yellow-500 cursor-pointer hover:bg-yellow-600 text-black font-semibold transition-all transform hover:scale-105 active:scale-95"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="text-sm">Interactions</span>
          </Button>
          <Button
            onClick={handleEdit}
            className="bg-yellow-500 cursor-pointer hover:bg-yellow-600 text-black font-semibold transition-all transform hover:scale-105 active:scale-95"
          >
            <Edit className="h-4 w-4 mr-2" />
            <span className="text-sm">Edit</span>
          </Button>
          <Button
            onClick={handleArchive}
            className="bg-yellow-500 cursor-pointer hover:bg-yellow-600 text-black font-semibold transition-all transform hover:scale-105 active:scale-95"
          >
            <Archive className="h-4 w-4 mr-2" />
            <span className="text-sm">Archive</span>
          </Button>
          <Button
            onClick={handleFavorite}
            className="bg-yellow-500 cursor-pointer hover:bg-yellow-600 text-black font-semibold transition-all transform hover:scale-105 active:scale-95"
          >
            <Heart className={`h-4 w-4 mr-2 ${broker.favorites ? 'fill-black' : ''}`} />
            <span className="text-sm">Favorite</span>
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information Section */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  icon={<Phone className="h-5 w-5" />}
                  label="Phone"
                  value={
                    <a href={`tel:${broker.phone}`} className="text-primary hover:underline">
                      {broker.phone}
                    </a>
                  }
                />
                <DetailItem
                  icon={<Mail className="h-5 w-5" />}
                  label="Email"
                  value={
                    <a href={`mailto:${broker.email}`} className="text-primary hover:underline">
                      {broker.email}
                    </a>
                  }
                />
                {broker.whatsapp && (
                  <DetailItem
                    icon={<Phone className="h-5 w-5" />}
                    label="WhatsApp"
                    value={
                      <a href={`https://wa.me/${broker.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {broker.whatsapp}
                      </a>
                    }
                  />
                )}
                {broker.primaryContactPartner && (
                  <DetailItem
                    icon={<Building2 className="h-5 w-5" />}
                    label="Primary Contact Partner"
                    value={
                      <div>
                        <p className="font-medium">{broker.primaryContactPartner.name}</p>
                        <p className="text-xs text-muted-foreground">{broker.primaryContactPartner.email}</p>
                      </div>
                    }
                  />
                )}
              </div>
            </div>

            {/* Budget & Operations Section */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Budget & Operations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  icon={<DollarSign className="h-5 w-5" />}
                  label="Budget Range"
                  value={`${formatCurrency(broker.budgetMin)} - ${formatCurrency(broker.budgetMax)}`}
                />
                {areas.length > 0 && (
                  <DetailItem
                    icon={<MapPin className="h-5 w-5" />}
                    label="Area of Operation"
                    value={
                      <div className="flex flex-wrap gap-2">
                        {areas.map((area: string, idx: number) => (
                          <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {area}
                          </span>
                        ))}
                      </div>
                    }
                  />
                )}
              </div>
            </div>

            {/* Expertise Section */}
            {societies.length > 0 && (
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Society Expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {societies.map((society: string, idx: number) => (
                    <span key={idx} className="text-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-3 py-1 rounded-full">
                      {society}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            {broker.notes && (
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Notes
                </h2>
                <p className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border border-border/50">
                  {broker.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Status & Metadata */}
          <div className="space-y-6">
            {/* Metadata Section */}
            <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Created & Updated</h2>

              <DetailItem
                icon={<Calendar className="h-5 w-5" />}
                label="Created"
                value={formatDate(broker.createdAt)}
              />

              <DetailItem
                icon={<Calendar className="h-5 w-5" />}
                label="Last Updated"
                value={formatDate(broker.updatedAt)}
              />
            </div>

            {/* Interactions Summary */}
            {broker.interactionLogs && broker.interactionLogs.length > 0 && (
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4">Recent Interactions</h2>
                <div className="space-y-3">
                  {broker.interactionLogs.slice(0, 3).map((log: any) => (
                    <div key={log.id} className="text-sm p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="font-medium text-foreground">{log.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.communicationType} • {formatDate(log.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={handleSeeInteractions}
                >
                  View All Interactions
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
