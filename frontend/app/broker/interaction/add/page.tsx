"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import InteractionForm from "@/components/interaction/InteractionForm";

const Page = () => {
  const search = useSearchParams();
  const brokerId = search?.get("id") ?? undefined;
  const interactionId = search?.get("interactionId") ?? null;

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">{interactionId ? "Edit Interaction" : "Add Interaction"}</h1>
        <InteractionForm brokerId={brokerId ?? undefined} interactionId={interactionId} />
      </div>
    </div>
  );
};

export default Page;
