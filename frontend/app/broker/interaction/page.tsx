import { Suspense } from "react";
import BrokerInteractionPageClient from "@/components/interaction/BrokerInteractionPageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BrokerInteractionPageClient />
    </Suspense>
  );
}