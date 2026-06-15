"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OwnerRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/owner/lists");
  }, [router]);

  return null;
}
