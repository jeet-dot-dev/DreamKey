"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useBrokerInteractions } from "../../../hooks/useBrokerInteractions";
import InteractionList from "../../../components/interaction/InteractionList";

const Page = () => {
  const search = useSearchParams();
  const brokerId = search?.get("id") ?? undefined;

  const { data, loading, error, refetch } = useBrokerInteractions(brokerId ?? undefined);

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Broker Interactions</h1>
        {error && <div className="text-red-600 mb-4">{String(error.message ?? error)}</div>}
        <InteractionList brokerId={brokerId} interactions={data} loading={loading} />
      </div>
    </div>
  );
};

export default Page;
