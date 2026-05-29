import { Suspense } from "react";
import BrokerInteractionAddClient from "@/components/interaction/BrokerInteractionAddClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BrokerInteractionAddClient />
    </Suspense>
  );
}