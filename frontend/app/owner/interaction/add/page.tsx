import { Suspense } from "react";
import OwnerInteractionAddClient from "@/components/owner-interaction/OwnerInteractionAddClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OwnerInteractionAddClient />
    </Suspense>
  );
}