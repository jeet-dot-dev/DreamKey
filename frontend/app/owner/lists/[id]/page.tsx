"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Archive, ChevronLeft, Edit3, Heart, MapPin, Phone, Mail, MessageSquarePlus, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useOwner } from "@/hooks/useOwners";

export default function OwnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ownerId = params?.id as string;
  const { data: owner, loading, error } = useOwner(ownerId);

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
      </div>
    </div>
  );
}

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
