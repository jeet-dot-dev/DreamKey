"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOwnerInteractions } from "@/hooks/useOwnerInteractions";
import OwnerInteractionList from "@/components/owner-interaction/OwnerInteractionList";

export default function OwnerInteractionPageClient() {
  const search = useSearchParams();
  const ownerId = search?.get("id") ?? undefined;

  const { data, loading, error, refetch } = useOwnerInteractions(ownerId ?? undefined);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load interactions", {
        description: error.message,
      });
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Owner Activity</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Interactions</h1>
              <p className="mt-2 max-w-2xl text-sm text-neutral-400">
                Keep the full communication history in one place and move between calls, emails, and visits without losing context.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => window.history.back()} className="border-neutral-700 bg-black/40 text-white hover:bg-neutral-800">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-300">
                <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                Timeline view
              </div>
            </div>
          </div>
        </div>

        {!ownerId && (
          <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-100">
            Choose an owner to view and manage interactions.
          </div>
        )}

        {loading && !data && (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur">
            <div className="space-y-3">
              <Skeleton className="h-6 w-48 bg-neutral-800" />
              <Skeleton className="h-4 w-72 bg-neutral-800" />
            </div>
            <div className="mt-6 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full bg-neutral-800" />
              ))}
            </div>
          </div>
        )}

        <OwnerInteractionList ownerId={ownerId} interactions={data} loading={loading} refetch={refetch} />
      </div>
    </div>
  );
}