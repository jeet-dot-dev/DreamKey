"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LeadPage() {
    const router = useRouter();

    useEffect(() => {
        router.push("/leads/overview");
    }, [router]);

    return null;
}
