"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Edit3, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useOwners } from "@/hooks/useOwners";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { toast } from "sonner";

export default function OwnerListPage() {
  const router = useRouter();
  const { data, loading, error, refetch } = useOwners();
  const [search, setSearch] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (owner: any) => {
    setSelectedOwner(owner);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOwner) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized", {
        description: "Please sign in again to continue.",
      });
      router.push("/auth");
      return;
    }

    setIsDeleting(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const response = await fetch(`${apiBaseUrl}/api/v1/owner/${selectedOwner.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resJson = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resJson.message || "Failed to delete owner");
      }

      toast.success("Owner deleted successfully");
      setShowDeleteModal(false);
      setSelectedOwner(null);
      void refetch();
    } catch (err) {
      toast.error("Failed to delete owner");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.toLowerCase().trim();
    if (!term) return data;
    return data.filter((owner) =>
      [owner.name, owner.phone, owner.email, owner.whatsapp ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [data, search]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Owner Management</p>
              <h1 className="mt-2 text-3xl font-semibold">Owners</h1>
              <p className="mt-2 max-w-2xl text-sm text-neutral-400">
                Search, view, and edit owner records.
              </p>
            </div>
            <Button onClick={() => router.push("/owner/add-listing")} className="bg-yellow-400 text-black hover:bg-yellow-300">
              <Plus className="mr-2 h-4 w-4" />
              Add Owner
            </Button>
          </div>

          <div className="mt-6 relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or email"
              className="border-neutral-700 bg-black/60 pl-10 text-white placeholder:text-neutral-500"
            />
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error.message}
          </div>
        )}

        <div className="mt-6 overflow-x-auto rounded-3xl border border-neutral-800 bg-neutral-900/80">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-800 bg-neutral-950 text-neutral-400">
              <tr>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="border-b border-neutral-800 last:border-b-0">
                    <td className="p-4"><Skeleton className="h-4 w-48 bg-neutral-800" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-56 bg-neutral-800" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24 bg-neutral-800" /></td>
                    <td className="p-4"><Skeleton className="h-9 w-24 bg-neutral-800" /></td>
                  </tr>
                ))
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-neutral-400">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <Users className="h-8 w-8 text-yellow-400" />
                      <p className="text-base font-medium text-white">No owners found</p>
                      <p className="text-sm text-neutral-400">Create the first owner record or adjust your search.</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filtered.map((owner) => (
                <tr key={owner.id} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-950/60">
                  <td className="p-4 align-top">
                    <div className="font-medium text-white">{owner.name}</div>
                    <div className="mt-1 text-xs text-neutral-500">{owner.email}</div>
                  </td>
                  <td className="p-4 align-top text-neutral-300">
                    <div>{owner.phone}</div>
                    {owner.whatsapp && <div className="text-xs text-neutral-500">WhatsApp: {owner.whatsapp}</div>}
                  </td>
                  <td className="p-4 align-top">
                    <span className="inline-flex rounded-full border border-neutral-700 bg-neutral-950 px-2.5 py-1 text-xs font-medium text-white">
                      {owner.status}
                    </span>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => router.push(`/owner/lists/${owner.id}`)} className="h-9 px-3 text-yellow-300 hover:bg-yellow-400/10 hover:text-yellow-200">
                        <Edit3 className="mr-2 h-4 w-4" />
                        Open
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteClick(owner)}
                        className="h-9 px-3 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Owner"
        message={
          <>
            Are you sure you want to delete owner <strong className="text-white">{selectedOwner?.name}</strong>? This will permanently remove the owner record and all related interaction logs. Linked property listings will not be deleted, but will no longer point to this owner.
          </>
        }
        loading={isDeleting}
      />
    </div>
  );
}
