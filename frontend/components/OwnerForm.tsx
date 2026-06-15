"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ownerSchema, type OwnerFormData } from "@/schemas/owner.schemas";
import { type Owner, useOwner } from "@/hooks/useOwners";

type Props = {
  ownerId?: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

export default function OwnerForm({ ownerId }: Props) {
  const router = useRouter();
  const isEditMode = !!ownerId;
  const { data: loadedOwner, loading: loadingOwner } = useOwner(ownerId);
  const [initializing, setInitializing] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      whatsapp: "",
      address: "",
      status: "ACTIVE",
      preferredRentMin: "",
      preferredRentMax: "",
      preferredPropertyTypes: "",
      preferredDealTerms: "",
    },
  });

  useEffect(() => {
    if (loadedOwner) {
      setValue("name", loadedOwner.name ?? "");
      setValue("phone", loadedOwner.phone ?? "");
      setValue("email", loadedOwner.email ?? "");
      setValue("whatsapp", loadedOwner.whatsapp ?? "");
      setValue("address", loadedOwner.address ?? "");
      setValue("status", loadedOwner.status ?? "ACTIVE");
      setValue("preferredRentMin", loadedOwner.preferredRentMin?.toString() ?? "");
      setValue("preferredRentMax", loadedOwner.preferredRentMax?.toString() ?? "");
      setValue("preferredPropertyTypes", loadedOwner.preferredPropertyTypes ?? "");
      setValue("preferredDealTerms", loadedOwner.preferredDealTerms ?? "");
      setInitializing(false);
    }
  }, [loadedOwner, setValue]);

  const onSubmit = async (data: OwnerFormData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized", {
        description: "Please sign in again to continue.",
      });
      router.push("/auth");
      return;
    }

    const loadingToast = toast.loading(isEditMode ? "Updating owner..." : "Creating owner...");

    try {
      const endpoint = isEditMode
        ? `${apiBaseUrl}/api/v1/owner/${ownerId}`
        : `${apiBaseUrl}/api/v1/owner/add`;

      const response = await fetch(endpoint, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const responseText = await response.text();
      const responseJson = responseText ? JSON.parse(responseText) : {};

      if (!response.ok) {
        throw new Error(responseJson?.message || `Failed to ${isEditMode ? "update" : "create"} owner`);
      }

      toast.success(isEditMode ? "Owner updated" : "Owner created", {
        id: loadingToast,
        description: isEditMode
          ? "The owner record has been updated successfully."
          : "The owner record has been created successfully.",
      });

      reset();
      router.push("/owner/lists");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(isEditMode ? "Failed to update owner" : "Failed to create owner", {
        id: loadingToast,
        description: message,
      });
    }
  };

  if (initializing || loadingOwner) {
    return (
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
        <div className="space-y-3">
          <Skeleton className="h-8 w-56 bg-neutral-800" />
          <Skeleton className="h-4 w-80 bg-neutral-800" />
        </div>
        <div className="mt-8 space-y-4">
          <Skeleton className="h-12 w-full bg-neutral-800" />
          <Skeleton className="h-12 w-full bg-neutral-800" />
          <Skeleton className="h-12 w-full bg-neutral-800" />
          <Skeleton className="h-32 w-full bg-neutral-800" />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur"
    >
      <div className="border-b border-neutral-800 pb-5">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Owner Record</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          {isEditMode ? "Edit Owner" : "Add Owner"}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Capture the owner’s contact details, preferences, and status.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-white">Name</label>
          <Input {...register("name")} disabled={isSubmitting} placeholder="Owner name" className="bg-black border-neutral-700 text-white" />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">Status</label>
          <select {...register("status")} disabled={isSubmitting} className="h-10 w-full rounded-md border border-neutral-700 bg-black px-3 text-sm text-white outline-none">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">Phone</label>
          <Input {...register("phone")} disabled={isSubmitting} placeholder="10-digit phone" className="bg-black border-neutral-700 text-white" />
          {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">WhatsApp</label>
          <Input {...register("whatsapp")} disabled={isSubmitting} placeholder="Optional" className="bg-black border-neutral-700 text-white" />
          {errors.whatsapp && <p className="mt-1 text-xs text-red-400">{errors.whatsapp.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">Email (Optional)</label>
          <Input {...register("email")} disabled={isSubmitting} placeholder="owner@example.com" className="bg-black border-neutral-700 text-white" />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-white">Address</label>
          <textarea {...register("address")} disabled={isSubmitting} rows={3} placeholder="Owner address" className="w-full rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm text-white outline-none" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">Preferred Rent Min</label>
          <Input {...register("preferredRentMin")} disabled={isSubmitting} placeholder="Optional" className="bg-black border-neutral-700 text-white" />
          {errors.preferredRentMin && <p className="mt-1 text-xs text-red-400">{errors.preferredRentMin.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">Preferred Rent Max</label>
          <Input {...register("preferredRentMax")} disabled={isSubmitting} placeholder="Optional" className="bg-black border-neutral-700 text-white" />
          {errors.preferredRentMax && <p className="mt-1 text-xs text-red-400">{errors.preferredRentMax.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-white">Preferred Property Types</label>
          <Input {...register("preferredPropertyTypes")} disabled={isSubmitting} placeholder="Flat, Land, Commercial" className="bg-black border-neutral-700 text-white" />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-white">Preferred Deal Terms</label>
          <textarea {...register("preferredDealTerms")} disabled={isSubmitting} rows={4} placeholder="Optional notes about preferred deal terms" className="w-full rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm text-white outline-none" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting} className="bg-yellow-400 text-black hover:bg-yellow-300">
          {isSubmitting ? (isEditMode ? "Saving..." : "Creating...") : isEditMode ? "Save Owner" : "Create Owner"}
        </Button>
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.push("/owner/lists")} className="border-neutral-700 bg-black/40 text-white hover:bg-neutral-800">
          Cancel
        </Button>
      </div>
    </form>
  );
}
