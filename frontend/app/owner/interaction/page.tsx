import { Suspense } from "react";
import OwnerInteractionPageClient from "@/components/owner-interaction/OwnerInteractionPageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OwnerInteractionPageClient />
    </Suspense>
  );
}