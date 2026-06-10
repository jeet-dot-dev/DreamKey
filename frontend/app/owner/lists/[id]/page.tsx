"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Archive, ChevronLeft, Edit3, Heart, MapPin, Phone, Mail, MessageSquarePlus, User2, Building2, Eye, IndianRupee, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useOwner } from "@/hooks/useOwners";
import { useProperties } from "@/hooks/useProperties";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function OwnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ownerId = params?.id as string;
  const { data: owner, loading, error } = useOwner(ownerId);
  const { properties, isLoading: propertiesLoading } = useProperties({ ownerId });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
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
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const response = await fetch(`${apiBaseUrl}/api/v1/owner/${ownerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resJson = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resJson.message || "Failed to delete owner");
      }

      toast.success("Owner deleted successfully");
      router.push("/owner/lists");
    } catch (err) {
      toast.error("Failed to delete owner");
    } finally {
      setIsDeleting(false);
    }
  };

  const propertyTypes = useMemo(() => {
    if (!owner?.preferredPropertyTypes) return [];
    try {
      return JSON.parse(owner.preferredPropertyTypes);
    } catch {
      return [owner.preferredPropertyTypes];
    }
  }, [owner?.preferredPropertyTypes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
          <Skeleton className="h-10 w-48 bg-neutral-800" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl bg-neutral-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 text-center">
            <p className="text-lg font-semibold text-white">Owner not found</p>
            <p className="mt-2 text-sm text-neutral-400">{error?.message || "The owner record could not be loaded."}</p>
            <Button onClick={() => router.back()} variant="outline" className="mt-6 border-neutral-700 bg-black/40 text-white hover:bg-neutral-800">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Button variant="ghost" onClick={() => router.back()} className="mb-4 h-9 px-2 text-neutral-300 hover:bg-neutral-800 hover:text-white">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Owner Profile</p>
              <h1 className="mt-2 text-3xl font-semibold">{owner.name}</h1>
              <p className="mt-2 text-sm text-neutral-400">Detailed owner record and preferences.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push(`/owner/interaction?id=${owner.id}`)} variant="outline" className="border-neutral-700 bg-black/40 text-white hover:bg-neutral-800">
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Interactions
              </Button>
              <Button onClick={() => router.push(`/owner/lists/${owner.id}/edit`)} className="bg-yellow-400 text-black hover:bg-yellow-300">
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="destructive"
                className="bg-red-600 text-white hover:bg-red-500 font-semibold"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info("Coming Soon")}
                className="border-neutral-700 bg-black/40 text-white hover:bg-neutral-800"
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info("Coming Soon")}
                className="border-neutral-700 bg-black/40 text-white hover:bg-neutral-800"
              >
                <Heart className="mr-2 h-4 w-4" />
                Favorite
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <InfoCard icon={<User2 className="h-5 w-5" />} label="Status" value={owner.status} />
          <InfoCard icon={<Phone className="h-5 w-5" />} label="Phone" value={owner.phone} />
          <InfoCard icon={<Mail className="h-5 w-5" />} label="Email" value={owner.email} />
          <InfoCard icon={<MapPin className="h-5 w-5" />} label="WhatsApp" value={owner.whatsapp || "N/A"} />
          <InfoCard icon={<MapPin className="h-5 w-5" />} label="Address" value={owner.address || "N/A"} />
          <InfoCard icon={<User2 className="h-5 w-5" />} label="Primary Contact" value={owner.primaryContactPartner?.name || "N/A"} />
          <InfoCard icon={<User2 className="h-5 w-5" />} label="Preferred Rent Range" value={owner.preferredRentMin || owner.preferredRentMax ? `${owner.preferredRentMin ?? "-"} - ${owner.preferredRentMax ?? "-"}` : "N/A"} />
          <InfoCard icon={<User2 className="h-5 w-5" />} label="Property Types" value={propertyTypes.length ? propertyTypes.join(", ") : "N/A"} />
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6">
          <h2 className="text-lg font-semibold text-white">Preferred Deal Terms</h2>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-400">
            {owner.preferredDealTerms || "No deal terms saved yet."}
          </p>
        </div>

        {/* Owned Properties Section */}
        <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Owned Properties</h2>
              <p className="text-xs text-neutral-400 mt-1">Properties listed under this owner.</p>
            </div>
            {!propertiesLoading && (
              <span className="text-xs font-medium bg-neutral-800 px-3 py-1 rounded-full text-neutral-300">
                {properties.length} {properties.length === 1 ? "Property" : "Properties"}
              </span>
            )}
          </div>

          {propertiesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-neutral-800 rounded-2xl" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
              <p className="text-sm font-medium text-neutral-400">No properties owned</p>
              <p className="text-xs text-neutral-500 mt-1">This owner doesn't have any properties registered yet.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-hidden rounded-2xl border border-neutral-800/80">
                <Table>
                  <TableHeader className="bg-neutral-950/40">
                    <TableRow className="border-neutral-800/80 hover:bg-transparent">
                      <TableHead className="text-neutral-400 font-semibold py-3 pl-4">Property</TableHead>
                      <TableHead className="text-neutral-400 font-semibold py-3">Type</TableHead>
                      <TableHead className="text-neutral-400 font-semibold py-3">Location</TableHead>
                      <TableHead className="text-neutral-400 font-semibold py-3">Price</TableHead>
                      <TableHead className="text-neutral-400 font-semibold py-3">Status</TableHead>
                      <TableHead className="text-neutral-400 font-semibold py-3 text-right pr-4">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((p) => (
                      <TableRow key={p.id} className="border-neutral-800/80 hover:bg-neutral-800/20">
                        <TableCell className="py-3 pl-4">
                          <div className="flex items-center gap-3">
                            {p.images?.[0]?.url ? (
                              <img
                                src={p.images[0].url}
                                alt={p.buildingName}
                                className="h-8 w-12 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
                              />
                            ) : (
                              <div className="h-8 w-12 rounded-lg border border-neutral-850 bg-neutral-800 flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-3 w-3 text-neutral-600" />
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
                        <TableCell className="py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${getTypeStyle(p.propertyType)}`}>
                            {p.propertyType}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-neutral-300 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-neutral-500" />
                            {p.location}
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-0.5 text-yellow-400 font-semibold text-sm">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {formatPrice(p.askingPrice).replace("₹", "")}
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${getStatusStyle(p.availabilityStatus)}`}>
                            {p.availabilityStatus}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 pr-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/stock/lists/${p.id}`)}
                            className="text-neutral-400 hover:text-yellow-400 hover:bg-yellow-400/10 h-8 px-3 rounded-lg"
                          >
                            <Eye className="h-4 w-4 mr-1.5" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {properties.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-neutral-800/80 bg-black/40 p-4 space-y-3">
                    <div className="flex gap-3">
                      {p.images?.[0]?.url ? (
                        <img
                          src={p.images[0].url}
                          alt={p.buildingName}
                          className="h-12 w-16 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-16 rounded-lg border border-neutral-800 bg-neutral-800 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-neutral-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{p.buildingName}</p>
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
                      <div className="flex gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${getTypeStyle(p.propertyType)}`}>
                          {p.propertyType}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${getStatusStyle(p.availabilityStatus)}`}>
                          {p.availabilityStatus}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/stock/lists/${p.id}`)}
                        className="text-neutral-400 hover:text-yellow-400 hover:bg-yellow-450/10 h-8 px-2.5 rounded-lg"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Owner"
        message={
          <>
            Are you sure you want to delete owner <strong className="text-white">{owner?.name}</strong>? This will permanently remove the owner record and all related interaction logs. Linked property listings will not be deleted, but will no longer point to this owner.
          </>
        }
        loading={isDeleting}
      />
    </div>
  );
}

const formatPrice = (value?: number | null): string => {
  if (!value) return "N/A";
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)} Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    case "RENTED":
      return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
    case "SOLD":
      return "bg-red-500/15 text-red-400 border border-red-500/30";
    case "UPCOMING":
      return "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30";
    default:
      return "bg-neutral-700 text-neutral-300 border border-neutral-600";
  }
};

const getTypeStyle = (type: string) => {
  switch (type) {
    case "FLAT":
      return "bg-violet-500/15 text-violet-400 border border-violet-500/30";
    case "LAND":
      return "bg-orange-500/15 text-orange-400 border border-orange-500/30";
    case "WAREHOUSE":
      return "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30";
    case "COMMERCIAL":
      return "bg-pink-500/15 text-pink-400 border border-pink-500/30";
    default:
      return "bg-neutral-700 text-neutral-300 border border-neutral-600";
  }
};

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5">
      <div className="flex items-start gap-3">
        <div className="mt-1 text-yellow-400">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">{label}</p>
          <p className="mt-2 text-sm text-white break-words">{value}</p>
        </div>
      </div>
    </div>
  );
}
