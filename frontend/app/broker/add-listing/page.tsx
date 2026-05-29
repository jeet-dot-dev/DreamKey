import { Suspense } from "react";
import BrokerForm from "@/components/BrokerForm";


export default function AddBrokerPage() {
  return (
    <Suspense fallback={null}>
      <BrokerForm />
    </Suspense>
  );
}
