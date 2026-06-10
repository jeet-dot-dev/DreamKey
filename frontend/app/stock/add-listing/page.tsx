import React, { Suspense } from "react";
import PropertyListingForm from "@/components/PropertyListingForm";
import { Loader2 } from "lucide-react";

export default function AddListingPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-4xl mx-auto px-4 py-8 bg-black min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-yellow-400 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <PropertyListingForm />
    </Suspense>
  );
}
