'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Building2,
  MapPin,
  IndianRupee,
  BedDouble,
  Bath,
  LayoutGrid,
  Layers,
  Calendar,
  Tag,
  Phone,
  Mail,
  User,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  Hash,
  Home,
  Warehouse,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProperty, type PropertyListing } from '@/hooks/useProperties';

// ============================================================================
// Utility
// ============================================================================

const formatPrice = (value?: number | null): string => {
  if (!value) return 'N/A';
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)} Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(2)} L`;
  return `₹${value.toLocaleString('en-IN')}`;
};

const formatDate = (d?: string | null): string => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const STATUS_CONFIG: Record<
  PropertyListing['availabilityStatus'],
  { label: string; style: string; dot: string }
> = {
  AVAILABLE: {
    label: 'Available',
    style: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  RENTED: {
    label: 'Rented',
    style: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    dot: 'bg-blue-400',
  },
  SOLD: {
    label: 'Sold',
    style: 'bg-red-500/15 text-red-300 border border-red-500/30',
    dot: 'bg-red-400',
  },
  UPCOMING: {
    label: 'Upcoming',
    style: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30',
    dot: 'bg-yellow-400',
  },
};

const TYPE_CONFIG: Record<
  PropertyListing['propertyType'],
  { label: string; icon: React.ReactNode }
> = {
  FLAT: { label: 'Flat / Apartment', icon: <Home className="h-4 w-4" /> },
  LAND: { label: 'Land / Plot', icon: <LayoutGrid className="h-4 w-4" /> },
  WAREHOUSE: { label: 'Warehouse', icon: <Warehouse className="h-4 w-4" /> },
  COMMERCIAL: { label: 'Commercial', icon: <Building2 className="h-4 w-4" /> },
  OTHER: { label: 'Other', icon: <Tag className="h-4 w-4" /> },
};

// ============================================================================
// Image Gallery
// ============================================================================

interface GalleryProps {
  images: PropertyListing['images'];
  buildingName: string;
}

const Gallery: React.FC<GalleryProps> = ({ images, buildingName }) => {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 md:h-80 lg:h-96 rounded-2xl border border-neutral-800 bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-neutral-700 mx-auto mb-3" />
          <p className="text-sm text-neutral-600">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative w-full h-64 md:h-80 lg:h-[440px] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900">
        <img
          src={images[active].url}
          alt={images[active].caption || buildingName}
          className="w-full h-full object-cover transition-all duration-300"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Caption */}
        {images[active].caption && (
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-block bg-black/70 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/10">
              {images[active].caption}
            </span>
          </div>
        )}

        {/* Counter */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/10">
          {active + 1} / {images.length}
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActive((a) => (a + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 h-16 w-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                i === active
                  ? 'border-yellow-400 opacity-100'
                  : 'border-neutral-700 opacity-50 hover:opacity-80'
              }`}
            >
              <img
                src={img.url}
                alt={img.caption || `Image ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Info Card
// ============================================================================

const InfoCard: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => (
  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5">
    <div className="flex items-center gap-2 mb-4">
      {icon && <span className="text-yellow-400">{icon}</span>}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">{title}</h2>
    </div>
    {children}
  </div>
);

const DataRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-neutral-800 last:border-0">
    <span className="text-sm text-neutral-500 whitespace-nowrap">{label}</span>
    <span className="text-sm text-neutral-200 text-right">{value ?? <span className="text-neutral-600">—</span>}</span>
  </div>
);

const AmenityBadge: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div
    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${
      active
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        : 'bg-neutral-800/50 text-neutral-600 border-neutral-700/50'
    }`}
  >
    {active ? (
      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
    ) : (
      <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
    )}
    {label}
  </div>
);

// ============================================================================
// Skeleton
// ============================================================================

const DetailSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <Skeleton className="h-10 w-48 bg-neutral-800" />
    <Skeleton className="w-full h-96 rounded-2xl bg-neutral-800" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-2xl bg-neutral-800" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-64 rounded-2xl bg-neutral-800" />
      <Skeleton className="h-64 rounded-2xl bg-neutral-800" />
    </div>
  </div>
);

// ============================================================================
// Main Page
// ============================================================================

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: property, loading, error } = useProperty(id);

  useEffect(() => {
    console.log('🏠 Property Data:', property);
  }, [property]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            {error === 'Property not found' ? 'Property Not Found' : 'Failed to load'}
          </h2>
          <p className="text-neutral-400 text-sm mb-6">{error}</p>
          <Button
            onClick={() => router.back()}
            className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[property.availabilityStatus];
  const typeConfig = TYPE_CONFIG[property.propertyType];

  const amenityList = property.amenities
    ? [
        { label: 'Parking', active: property.amenities.parking },
        { label: 'Gym', active: property.amenities.gym },
        { label: 'Lift', active: property.amenities.lift },
        { label: 'Security', active: property.amenities.security },
        { label: 'Power Backup', active: property.amenities.powerBackup },
        { label: 'Swimming Pool', active: property.amenities.swimmingPool },
        { label: 'Clubhouse', active: property.amenities.clubhouse },
      ]
    : [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Properties
          </button>

          <Button
            onClick={() => router.push(`/stock/add-listing?id=${property.id}`)}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Property
          </Button>
        </div>

        {/* Title Section */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.style}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
              {typeConfig.icon}
              {typeConfig.label}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{property.buildingName}</h1>
          <div className="flex items-center gap-1.5 mt-2 text-neutral-400">
            <MapPin className="h-4 w-4 text-yellow-400 flex-shrink-0" />
            <span className="text-sm">{property.location}</span>
            <span className="text-neutral-600">•</span>
            <span className="text-sm text-neutral-500">PIN {property.pinCode}</span>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-6">
          <Gallery images={property.images} buildingName={property.buildingName} />
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {/* Price */}
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-semibold uppercase tracking-wider">
              <IndianRupee className="h-3.5 w-3.5" />
              Asking Price
            </div>
            <p className="text-xl font-bold text-white mt-1">{formatPrice(property.askingPrice)}</p>
          </div>

          {/* Bedrooms */}
          {property.bedrooms != null && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <BedDouble className="h-3.5 w-3.5" />
                Bedrooms
              </div>
              <p className="text-2xl font-bold text-white mt-1">{property.bedrooms}</p>
            </div>
          )}

          {/* Bathrooms */}
          {property.bathrooms != null && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <Bath className="h-3.5 w-3.5" />
                Bathrooms
              </div>
              <p className="text-2xl font-bold text-white mt-1">{property.bathrooms}</p>
            </div>
          )}

          {/* Carpet Area */}
          {property.carpetArea != null && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <LayoutGrid className="h-3.5 w-3.5" />
                Carpet Area
              </div>
              <p className="text-xl font-bold text-white mt-1">
                {property.carpetArea} <span className="text-sm text-neutral-500">sq.ft</span>
              </p>
            </div>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Property Details */}
          <InfoCard title="Property Details" icon={<Building2 className="h-4 w-4" />}>
            <DataRow label="Building Name" value={property.buildingName} />
            <DataRow label="Property Type" value={typeConfig.label} />
            <DataRow label="Location" value={property.location} />
            <DataRow label="PIN Code" value={property.pinCode} />
            {property.floorNumber && (
              <DataRow label="Floor" value={property.floorNumber} />
            )}
            {property.totalFloors != null && (
              <DataRow label="Total Floors" value={property.totalFloors} />
            )}
            {property.balconies != null && (
              <DataRow label="Balconies" value={property.balconies} />
            )}
            {property.superBuiltUpArea != null && (
              <DataRow
                label="Super Built-Up Area"
                value={`${property.superBuiltUpArea} sq.ft`}
              />
            )}
            {property.accessType && (
              <DataRow label="Access Type" value={property.accessType} />
            )}
            <DataRow
              label="Availability"
              value={
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[property.availabilityStatus].style}`}
                >
                  {statusConfig.label}
                </span>
              }
            />
            {property.availabilityDate && (
              <DataRow
                label="Available From"
                value={formatDate(property.availabilityDate)}
              />
            )}
          </InfoCard>

          {/* Society Insights */}
          <InfoCard title="Society Insights" icon={<Layers className="h-4 w-4" />}>
            {property.builderName && (
              <DataRow label="Builder" value={property.builderName} />
            )}
            {property.yearBuilt != null && (
              <DataRow label="Year Built" value={property.yearBuilt} />
            )}
            {property.totalUnits != null && (
              <DataRow label="Total Units" value={property.totalUnits} />
            )}
            {property.reraNumber && (
              <DataRow
                label="RERA Number"
                value={
                  <span className="font-mono text-xs bg-neutral-800 px-2 py-0.5 rounded-lg border border-neutral-700">
                    {property.reraNumber}
                  </span>
                }
              />
            )}

            {/* Timestamps */}
            <div className="pt-2 mt-2 border-t border-neutral-800 space-y-2.5">
              <DataRow
                label="Listed On"
                value={
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                    {formatDate(property.createdAt)}
                  </span>
                }
              />
              <DataRow
                label="Last Updated"
                value={
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-neutral-500" />
                    {formatDate(property.updatedAt)}
                  </span>
                }
              />
              {property.user && (
                <DataRow
                  label="Added By"
                  value={
                    <span className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-neutral-500" />
                      {property.user.username}
                    </span>
                  }
                />
              )}
            </div>
          </InfoCard>
        </div>

        {/* Owner & Broker */}
        {(property.owner || property.sourcePartner) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {property.owner && (
              <InfoCard title="Owner" icon={<User className="h-4 w-4" />}>
                <DataRow label="Name" value={property.owner.name} />
                {property.owner.phone && (
                  <DataRow
                    label="Phone"
                    value={
                      <a
                        href={`tel:${property.owner.phone}`}
                        className="flex items-center gap-1.5 text-yellow-400 hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {property.owner.phone}
                      </a>
                    }
                  />
                )}
                {property.owner.email && (
                  <DataRow
                    label="Email"
                    value={
                      <a
                        href={`mailto:${property.owner.email}`}
                        className="flex items-center gap-1.5 text-yellow-400 hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {property.owner.email}
                      </a>
                    }
                  />
                )}
                {property.owner.whatsapp && (
                  <DataRow label="WhatsApp" value={property.owner.whatsapp} />
                )}
              </InfoCard>
            )}

            {property.sourcePartner && (
              <InfoCard title="Source Broker" icon={<Users className="h-4 w-4" />}>
                <DataRow label="Name" value={property.sourcePartner.name} />
                {property.sourcePartner.phone && (
                  <DataRow
                    label="Phone"
                    value={
                      <a
                        href={`tel:${property.sourcePartner.phone}`}
                        className="flex items-center gap-1.5 text-yellow-400 hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {property.sourcePartner.phone}
                      </a>
                    }
                  />
                )}
                {property.sourcePartner.email && (
                  <DataRow
                    label="Email"
                    value={
                      <a
                        href={`mailto:${property.sourcePartner.email}`}
                        className="flex items-center gap-1.5 text-yellow-400 hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {property.sourcePartner.email}
                      </a>
                    }
                  />
                )}
                {property.sourcePartner.whatsapp && (
                  <DataRow label="WhatsApp" value={property.sourcePartner.whatsapp} />
                )}
              </InfoCard>
            )}
          </div>
        )}

        {/* Amenities */}
        {amenityList.length > 0 && (
          <div className="mb-5">
            <InfoCard title="Amenities" icon={<CheckCircle2 className="h-4 w-4" />}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {amenityList.map((a) => (
                  <AmenityBadge key={a.label} label={a.label} active={a.active} />
                ))}
              </div>
            </InfoCard>
          </div>
        )}

        {/* Remarks */}
        {property.remarks && (
          <div className="mb-5">
            <InfoCard title="Remarks / Notes" icon={<FileText className="h-4 w-4" />}>
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {property.remarks}
              </p>
            </InfoCard>
          </div>
        )}

        {/* Brochure */}
        {property.societyBrochure && (
          <div className="mb-5">
            <InfoCard title="Society Brochure" icon={<Download className="h-4 w-4" />}>
              <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-neutral-800/60 border border-neutral-700">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {property.societyBrochure.fileName}
                    </p>
                    <p className="text-xs text-neutral-500">PDF Document</p>
                  </div>
                </div>
                <a
                  href={property.societyBrochure.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-semibold transition-colors flex-shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </div>
            </InfoCard>
          </div>
        )}

        {/* Bottom Edit CTA */}
        <div className="rounded-2xl border border-neutral-800 bg-gradient-to-r from-yellow-500/5 to-neutral-900/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Need to make changes?</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Update this property's details, images, or pricing.
            </p>
          </div>
          <Button
            onClick={() => router.push(`/stock/add-listing?id=${property.id}`)}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold flex items-center gap-2 flex-shrink-0"
          >
            <Edit className="h-4 w-4" />
            Edit This Property
          </Button>
        </div>
      </div>
    </div>
  );
}
