"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Building2,
  MapPin,
  IndianRupee,
  BedDouble,
  Bath,
  LayoutGrid,
  Layers,
  Calendar,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  Home,
  Warehouse,
  Tag,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

interface PropertyImage {
  id: string;
  url: string;
  caption?: string | null;
  order: number;
}

interface PropertyAmenities {
  parking: boolean;
  gym: boolean;
  lift: boolean;
  security: boolean;
  powerBackup: boolean;
  swimmingPool: boolean;
  clubhouse: boolean;
}

interface SharedProperty {
  propertyType: "FLAT" | "LAND" | "WAREHOUSE" | "COMMERCIAL" | "OTHER";
  buildingName: string;
  location: string;
  pinCode: string;
  floorNumber?: string | null;
  totalFloors?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  balconies?: number | null;
  carpetArea?: number | null;
  superBuiltUpArea?: number | null;
  askingPrice: number;
  availabilityStatus: "AVAILABLE" | "RENTED" | "SOLD" | "UPCOMING";
  remarks?: string | null;
  builderName?: string | null;
  yearBuilt?: number | null;
  totalUnits?: number | null;
  reraNumber?: string | null;
  images: PropertyImage[];
  amenities: PropertyAmenities | null;
}

// ============================================================================
// Utility
// ============================================================================

const formatPrice = (value?: number | null): string => {
  if (!value) return "N/A";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
};

const STATUS_CONFIG: Record<
  SharedProperty["availabilityStatus"],
  { label: string; style: string; dot: string }
> = {
  AVAILABLE: {
    label: "Available",
    style: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  RENTED: {
    label: "Rented",
    style: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
    dot: "bg-blue-400",
  },
  SOLD: {
    label: "Sold",
    style: "bg-red-500/15 text-red-300 border border-red-500/30",
    dot: "bg-red-400",
  },
  UPCOMING: {
    label: "Upcoming",
    style: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
    dot: "bg-yellow-400",
  },
};

const TYPE_CONFIG: Record<
  SharedProperty["propertyType"],
  { label: string; icon: React.ReactNode }
> = {
  FLAT: { label: "Flat / Apartment", icon: <Home className="h-4 w-4" /> },
  LAND: { label: "Land / Plot", icon: <LayoutGrid className="h-4 w-4" /> },
  WAREHOUSE: { label: "Warehouse", icon: <Warehouse className="h-4 w-4" /> },
  COMMERCIAL: { label: "Commercial", icon: <Building2 className="h-4 w-4" /> },
  OTHER: { label: "Other", icon: <Tag className="h-4 w-4" /> },
};

// ============================================================================
// Gallery Component
// ============================================================================

interface GalleryProps {
  images: PropertyImage[];
  buildingName: string;
}

const Gallery: React.FC<GalleryProps> = ({ images, buildingName }) => {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 md:h-80 lg:h-96 rounded-3xl border border-neutral-800 bg-neutral-900/40 flex items-center justify-center">
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
      <div className="relative w-full h-64 md:h-80 lg:h-[480px] rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-950">
        <img
          src={images[active].url}
          alt={images[active].caption || buildingName}
          className="w-full h-full object-cover transition-all duration-300"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Caption */}
        {images[active].caption && (
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-block bg-black/75 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/10">
              {images[active].caption}
            </span>
          </div>
        )}

        {/* Counter */}
        <div className="absolute top-4 right-4 bg-black/75 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/10">
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
                  ? "border-yellow-400 opacity-100"
                  : "border-neutral-800 opacity-50 hover:opacity-80"
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
// Layout Helpers
// ============================================================================

const InfoCard: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => (
  <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      {icon && <span className="text-yellow-400">{icon}</span>}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">{title}</h2>
    </div>
    {children}
  </div>
);

const DataRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-neutral-850 last:border-0">
    <span className="text-sm text-neutral-500 whitespace-nowrap">{label}</span>
    <span className="text-sm text-neutral-200 text-right">{value ?? <span className="text-neutral-600">—</span>}</span>
  </div>
);

const AmenityBadge: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div
    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border ${
      active
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-neutral-800/30 text-neutral-600 border-neutral-700/30"
    }`}
  >
    {active ? (
      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
    ) : (
      <XCircle className="h-4 w-4 flex-shrink-0 text-neutral-700" />
    )}
    {label}
  </div>
);

// ============================================================================
// Loading Skeleton
// ============================================================================

const SharePageSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-2">
      <Skeleton className="h-6 w-32 bg-neutral-800" />
      <Skeleton className="h-10 w-2/3 bg-neutral-800" />
      <Skeleton className="h-4 w-1/2 bg-neutral-800" />
    </div>
    <Skeleton className="w-full h-80 md:h-[440px] rounded-3xl bg-neutral-800" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-3xl bg-neutral-800" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-64 rounded-3xl bg-neutral-800" />
      <Skeleton className="h-64 rounded-3xl bg-neutral-800" />
    </div>
  </div>
);

// ============================================================================
// Main Public Page
// ============================================================================

export default function PublicSharePage() {
  const params = useParams();
  const token = params?.token as string;

  const [property, setProperty] = useState<SharedProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchSharedDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
        const response = await fetch(`${apiBaseUrl}/api/v1/share/${token}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("This share link has expired or is invalid.");
          }
          throw new Error("Failed to load property details. Please try again later.");
        }

        const resJson = await response.json();
        if (resJson.success && resJson.data?.property) {
          setProperty(resJson.data.property);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching shared property:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedDetails();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white px-4 py-8 md:px-6">
        <div className="mx-auto max-w-5xl">
          <SharePageSkeleton />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load Property</h2>
          <p className="text-neutral-400 text-sm mb-6 leading-relaxed">{error}</p>
          <div className="border-t border-neutral-800 pt-4 text-xs text-neutral-500">
            For support or questions, contact DreamKey Support.
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[property.availabilityStatus];
  const typeConfig = TYPE_CONFIG[property.propertyType];

  const amenityList = property.amenities
    ? [
        { label: "Parking", active: property.amenities.parking },
        { label: "Gym", active: property.amenities.gym },
        { label: "Lift", active: property.amenities.lift },
        { label: "Security", active: property.amenities.security },
        { label: "Power Backup", active: property.amenities.powerBackup },
        { label: "Swimming Pool", active: property.amenities.swimmingPool },
        { label: "Clubhouse", active: property.amenities.clubhouse },
      ]
    : [];

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const pdfDownloadUrl = `${apiBaseUrl}/api/v1/share/${token}/pdf`;
  const supportPhone = "+919876543210"; // Generic DreamKey support helpline
  const whatsappSupportUrl = `https://wa.me/919876543210?text=${encodeURIComponent(
    `Hello, I am interested in property details for ${property.buildingName} (Ref: ${token}). Please provide more information.`
  )}`;

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      {/* Branding Navigation Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-neutral-850 py-4 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-yellow-400 tracking-tight">DreamKey</h1>
            <p className="text-[9px] uppercase tracking-widest text-neutral-500">Premium Realty Listings</p>
          </div>
          <span className="text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-full px-3 py-1 font-mono uppercase tracking-wide">
            Ref: {token}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
        {/* Title and Badge Section */}
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.style}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 text-neutral-350 border border-neutral-800">
              {typeConfig.icon}
              {typeConfig.label}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{property.buildingName}</h2>
          <div className="flex items-center gap-1.5 mt-2.5 text-neutral-400">
            <MapPin className="h-4 w-4 text-yellow-455 flex-shrink-0" />
            <span className="text-sm">{property.location}</span>
            <span className="text-neutral-700">•</span>
            <span className="text-sm text-neutral-500">PIN {property.pinCode}</span>
          </div>
        </div>

        {/* Gallery */}
        <Gallery images={property.images} buildingName={property.buildingName} />

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Price */}
          <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-semibold uppercase tracking-wider">
              <IndianRupee className="h-3.5 w-3.5" />
              Asking Price
            </div>
            <p className="text-2xl font-bold text-white mt-1">{formatPrice(property.askingPrice)}</p>
          </div>

          {/* Bedrooms */}
          {property.bedrooms != null && (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <BedDouble className="h-3.5 w-3.5" />
                Bedrooms
              </div>
              <p className="text-3xl font-bold text-white mt-1">{property.bedrooms} BHK</p>
            </div>
          )}

          {/* Bathrooms */}
          {property.bathrooms != null && (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <Bath className="h-3.5 w-3.5" />
                Bathrooms
              </div>
              <p className="text-3xl font-bold text-white mt-1">{property.bathrooms} Bath</p>
            </div>
          )}

          {/* Carpet Area */}
          {property.carpetArea != null && (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <LayoutGrid className="h-3.5 w-3.5" />
                Carpet Area
              </div>
              <p className="text-xl font-bold text-white mt-1">
                {property.carpetArea} <span className="text-sm text-neutral-500 font-medium">sq.ft</span>
              </p>
            </div>
          )}
        </div>

        {/* Two Column details layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Specifications */}
          <InfoCard title="Property Specifications" icon={<Building2 className="h-4 w-4" />}>
            <DataRow label="Building Name" value={property.buildingName} />
            <DataRow label="Property Type" value={typeConfig.label} />
            <DataRow label="Location" value={property.location} />
            <DataRow label="PIN Code" value={property.pinCode} />
            {property.floorNumber && <DataRow label="Floor" value={property.floorNumber} />}
            {property.totalFloors != null && <DataRow label="Total Floors" value={property.totalFloors} />}
            {property.balconies != null && <DataRow label="Balconies" value={property.balconies} />}
            {property.superBuiltUpArea != null && (
              <DataRow label="Super Built-Up Area" value={`${property.superBuiltUpArea} sq.ft`} />
            )}
            <DataRow
              label="Availability Status"
              value={
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_CONFIG[property.availabilityStatus].style
                  }`}
                >
                  {statusConfig.label}
                </span>
              }
            />
          </InfoCard>

          {/* Building/Society Insights */}
          <InfoCard title="Society Insights" icon={<Layers className="h-4 w-4" />}>
            {property.builderName && <DataRow label="Builder" value={property.builderName} />}
            {property.yearBuilt != null && <DataRow label="Year Built" value={property.yearBuilt} />}
            {property.totalUnits != null && <DataRow label="Total Units" value={property.totalUnits} />}
            {property.reraNumber && (
              <DataRow
                label="RERA Registration"
                value={
                  <span className="font-mono text-xs bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
                    {property.reraNumber}
                  </span>
                }
              />
            )}
          </InfoCard>
        </div>

        {/* Amenities Section */}
        {amenityList.length > 0 && (
          <InfoCard title="Amenities Checklist" icon={<CheckCircle2 className="h-4 w-4" />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {amenityList.map((a) => (
                <AmenityBadge key={a.label} label={a.label} active={a.active} />
              ))}
            </div>
          </InfoCard>
        )}

        {/* Description Section */}
        {property.remarks && (
          <InfoCard title="Listing Description" icon={<FileText className="h-4 w-4" />}>
            <p className="text-sm text-neutral-350 leading-relaxed whitespace-pre-wrap">{property.remarks}</p>
          </InfoCard>
        )}

        {/* Safety Disclaimer */}
        <div className="rounded-3xl border border-neutral-850 bg-neutral-950 p-6 text-center text-xs text-neutral-500 leading-normal max-w-2xl mx-auto space-y-2">
          <p className="font-semibold text-neutral-400">Official Property Listing Share</p>
          <p>
            This page shows whitelisted details compiled directly from the DreamKey CRM database. Broker contacts,
            owner names, internal feedback logs, and private keys remain fully secured.
          </p>
        </div>
      </main>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/80 backdrop-blur-xl border-t border-neutral-850 py-4 px-4 sm:px-6 shadow-2xl">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-2 sm:gap-4">
          <a
            href={`tel:${supportPhone}`}
            className="flex-1 sm:max-w-[160px] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs sm:text-sm font-semibold py-2.5 sm:py-3.5 transition-all cursor-pointer text-center whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Call Now</span>
            <span className="sm:hidden">Call</span>
          </a>
          <a
            href={whatsappSupportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold py-2.5 sm:py-3.5 transition-all cursor-pointer text-center shadow-lg shadow-emerald-600/10 whitespace-nowrap"
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>WhatsApp</span>
          </a>
          <a
            href={pdfDownloadUrl}
            className="flex-1 sm:max-w-[200px] inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-yellow-400 hover:bg-yellow-350 text-black text-xs sm:text-sm font-bold py-2.5 sm:py-3.5 transition-all cursor-pointer text-center shadow-lg shadow-yellow-400/15 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </a>
        </div>
      </div>
    </div>
  );
}
