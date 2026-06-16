"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import InteractionForm from "@/components/interaction/InteractionForm";

export default function BrokerInteractionAddClient() {
  const router = useRouter();
  const search = useSearchParams();
  const brokerId = search?.get("id") ?? undefined;
  const interactionId = search?.get("interactionId") ?? null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Broker Activity</p>
              <h1 className="mt-2 text-3xl font-semibold text-foreground">
                {interactionId ? "Edit interaction" : "Add interaction"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Record the communication details now so the next person sees the full context later.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.back()} className="border-border/70 bg-background/70 hover:bg-muted/60">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
                <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                Broker {brokerId ? brokerId.slice(0, 8) : "missing"}
              </div>
            </div>
          </div>
        </div>

        <InteractionForm brokerId={brokerId ?? undefined} interactionId={interactionId} />
      </div>
    </div>
  );
}