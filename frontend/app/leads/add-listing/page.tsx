"use client";

import { Suspense } from "react";
import LeadForm from "@/components/LeadForm";

export default function AddLeadPage() {
  return (
    <Suspense fallback={null}>
      <LeadForm />
    </Suspense>
  );
}
