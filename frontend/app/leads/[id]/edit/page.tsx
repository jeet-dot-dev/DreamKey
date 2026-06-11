'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import LeadForm from '@/components/LeadForm';
import { useLeads } from '@/hooks/useLeads';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditLeadPage() {
  const params = useParams();
  const leadId = params?.id as string;
  const { leads, isLoading } = useLeads();

  // Find the lead
  const lead = leads.find((l) => l.id === leadId);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 bg-black min-h-screen space-y-8">
        <Skeleton className="h-12 w-64 bg-neutral-850" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-48 bg-neutral-850" />
            <Skeleton className="h-12 w-full bg-neutral-850" />
            <Skeleton className="h-12 w-full bg-neutral-850" />
          </div>
        ))}
      </div>
    );
  }

  return <LeadForm initialLead={lead} />;
}
