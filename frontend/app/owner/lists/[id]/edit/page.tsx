"use client";

import React from "react";
import { useParams } from "next/navigation";
import OwnerForm from "@/components/OwnerForm";

export default function EditOwnerPage() {
  const params = useParams();
  const ownerId = params?.id as string;

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white md:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <OwnerForm ownerId={ownerId} />
      </div>
    </div>
  );
}
