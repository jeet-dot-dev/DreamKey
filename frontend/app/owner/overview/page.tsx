"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OwnerOverviewPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Owner Overview | DreamKey";
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Owner Management</p>
              <h1 className="mt-2 text-3xl font-semibold">Overview</h1>
              <p className="mt-2 max-w-2xl text-sm text-neutral-400">
                Manage your owner records, track preferences, and keep contacts organized.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => router.push("/owner/lists")} variant="outline" className="border-neutral-700 bg-black/40 text-white hover:bg-neutral-800">
                <Users className="mr-2 h-4 w-4" />
                View Owners
              </Button>
              <Button onClick={() => router.push("/owner/add-listing")} className="bg-yellow-400 text-black hover:bg-yellow-300">
                <Plus className="mr-2 h-4 w-4" />
                Add Owner
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { label: "Total Owners", value: "--" },
            { label: "Active Owners", value: "--" },
            { label: "Archived", value: "--" },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5">
              <p className="text-sm text-neutral-400">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-yellow-400/30 bg-yellow-400/10 p-3 text-yellow-400">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Owner records coming online</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Use the list view to search and open individual owner profiles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
