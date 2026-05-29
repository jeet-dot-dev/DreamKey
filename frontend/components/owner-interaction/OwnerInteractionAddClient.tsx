"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import OwnerInteractionForm from "@/components/owner-interaction/OwnerInteractionForm";

export default function OwnerInteractionAddClient() {
  const searchParams = useSearchParams();
  const ownerId = searchParams?.get("id") ?? undefined;
  const interactionId = searchParams?.get("interactionId");

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white md:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <OwnerInteractionForm ownerId={ownerId} interactionId={interactionId} />
      </div>
    </div>
  );
}