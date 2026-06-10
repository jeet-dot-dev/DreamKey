"use client";

import React from "react";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ArchivesPage() {
  const router = useRouter();

  return (
    <div className="h-full">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Archives</h1>
          <p className="text-neutral-400">Archived stocks will appear here soon.</p>
        </div>

        <div className="flex items-center justify-center">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800">
              <Archive className="h-8 w-8 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Coming Soon</h2>
            <p className="text-neutral-400 mb-6">
              We’re building a dedicated archive area to help you store and restore old listings. It will arrive shortly.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => router.push("/broker/overview")} className="bg-yellow-400 text-black hover:bg-yellow-300">
                Go to Overview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
