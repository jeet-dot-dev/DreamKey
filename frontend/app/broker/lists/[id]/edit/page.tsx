'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import BrokerForm from '@/components/BrokerForm';
import { useBrokers } from '@/hooks/useBrokers';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBrokerPage() {
  const params = useParams();
  const brokerId = params?.id as string;
  const { brokers, isLoading } = useBrokers();

  // Find the broker
  const broker = brokers.find((b) => b.id === brokerId);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 bg-black min-h-screen space-y-8">
        <Skeleton className="h-12 w-64" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return <BrokerForm initialBroker={broker} />;
}
