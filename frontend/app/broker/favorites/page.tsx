"use client";

import React from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function FavoritesPage() {
  const router = useRouter();

  return (
    <div className="h-full">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Favorites</h1>
          <p className="text-neutral-400">Your favorite stocks will show up here soon.</p>
        </div>

        <div className="flex items-center justify-center">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800">
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Coming Soon</h2>
            <p className="text-neutral-400 mb-6">
              We’re working on a curated favorites area so you can quickly access saved stocks.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => router.push("/broker/overview")} className="bg-yellow-400 text-black hover:bg-yellow-300">
                Browse Broker
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
