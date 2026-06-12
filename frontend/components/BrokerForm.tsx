"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { brokerSchema, type BrokerFormData } from "@/schemas/broker.schemas";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrokers, type Broker } from "@/hooks/useBrokers";

interface BrokerFormProps {
  initialBroker?: Broker;
}

export default function BrokerForm({ initialBroker }: BrokerFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryBrokerId = searchParams.get("id");

  // Use initialBroker id if provided, otherwise use query param
  const brokerId = initialBroker?.id || queryBrokerId;
  const isEditMode = !!brokerId && (!!initialBroker || !!queryBrokerId);

  const { brokers } = useBrokers();
  const [isLoading, setIsLoading] = useState(isEditMode && !initialBroker);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<BrokerFormData>({
    resolver: zodResolver(brokerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      whatsapp: "",
      status: "ACTIVE",
      budgetMin: "",
      budgetMax: "",
      areaOfOperation: "",
      societyExpertise: "",
      notes: "",
    },
  });

  // Load broker data when editing
  useEffect(() => {
    if (isEditMode && brokerId) {
      let broker = initialBroker;

      // If no initial broker prop, find it from useBrokers hook
      if (!broker) {
        broker = brokers.find((b) => b.id === brokerId);
      }

      if (broker) {
        // Helper function to convert array to comma-separated string
        const arrayToString = (value: string | string[] | null | undefined): string => {
          if (!value) return "";
          if (typeof value === 'string') {
            try {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed)) {
                return parsed.join(", ");
              }
            } catch {
              return value;
            }
          }
          if (Array.isArray(value)) {
            return value.join(", ");
          }
          return "";
        };

        // Populate form with broker data
        setValue("name", broker.name || "");
        setValue("email", broker.email || "");
        setValue("phone", broker.phone || "");
        setValue("whatsapp", broker.whatsapp || "");
        setValue("status", broker.status || "ACTIVE");
        setValue("budgetMin", broker.budgetMin?.toString() || "");
        setValue("budgetMax", broker.budgetMax?.toString() || "");
        setValue("areaOfOperation", arrayToString(broker.areaOfOperation));
        setValue("societyExpertise", arrayToString(broker.societyExpertise));
        setValue("notes", broker.notes || "");

        console.log("Broker data loaded for editing:", broker);
        setIsLoading(false);
      } else if (brokers.length > 0) {
        // Brokers are loaded but broker not found
        toast.error("Broker not found");
        router.push("/broker/lists");
      }
    }
  }, [isEditMode, brokerId, initialBroker, brokers, setValue, router]);

  // Form submission handler
  const onSubmit = async (data: BrokerFormData) => {
    const timestamp = new Date().toISOString();

    try {
      const loadingToast = toast.loading(
        isEditMode ? "Updating broker..." : "Adding broker...",
      );

      // Log form submission
      console.log(
        `[${timestamp}] INFO: Broker form submission initiated (${isEditMode ? "EDIT" : "ADD"} mode)`,
        {
          formData: data,
          component: "BrokerForm",
          brokerId: isEditMode ? brokerId : "NEW",
        },
      );

      const token = localStorage.getItem("token");
      if (!token) {
        console.warn(
          `[${timestamp}] WARN: Authentication token not found in localStorage`,
        );
        toast.error("Unauthorized", { id: loadingToast });
        router.push("/auth");
        return;
      }

      const endpoint = isEditMode
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/broker/${brokerId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/broker/add`;
      const method = isEditMode ? "PUT" : "POST";

      console.log(
        `[${timestamp}] INFO: Sending broker ${isEditMode ? "update" : "creation"} request to ${endpoint} with method ${method}`,
        { data }
      );

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log(`[${timestamp}] INFO: Response status: ${res.status} ${res.statusText}`);

      let json;
      try {
        const text = await res.text();
        console.log(`[${timestamp}] INFO: Response body: ${text}`);
        json = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error(`[${timestamp}] ERROR: Failed to parse response:`, parseError);
        json = {};
      }

      if (!res.ok) {
        const errorMessage = json?.message || `Failed to ${isEditMode ? "update" : "create"} broker`;
        console.error(
          `[${timestamp}] ERROR: Broker ${isEditMode ? "update" : "creation"} failed`,
          {
            status: res.status,
            statusText: res.statusText,
            message: errorMessage,
            response: json,
          },
        );
        toast.error(errorMessage, { id: loadingToast });
        return;
      }

      console.log(
        `[${timestamp}] INFO: Broker ${isEditMode ? "updated" : "created"} successfully`,
        {
          brokerId: json?.broker?.id,
          brokerName: data.name,
        },
      );

      toast.dismiss(loadingToast);
      toast.success(
        isEditMode ? "Broker updated successfully!" : "Broker added successfully!",
        {
          description: isEditMode
            ? `${data.name} has been updated.`
            : `${data.name} has been added as a new broker.`,
        },
      );

      // Reset form
      reset();

      // Redirect after 2 seconds
      setTimeout(() => {
        if (isEditMode) {
          router.push(`/broker/lists/${brokerId}`);
        } else {
          router.push("/broker/overview");
        }
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error(
        `[${timestamp}] ERROR: Exception in broker form submission`,
        {
          message: errorMessage,
          stack: errorStack,
          error: error,
          component: "BrokerForm",
        },
      );

      toast.error(
        isEditMode ? "Failed to update broker" : "Failed to add broker",
        {
          description: errorMessage || "An unexpected error occurred.",
        },
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 bg-black min-h-screen">
      {isLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-12 w-64" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Form Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-yellow-400 mb-2">
              {isEditMode ? "Edit Broker" : "Add New Broker"}
            </h1>
            <p className="text-neutral-400 text-sm">
              {isEditMode
                ? "Update broker information"
                : "Create a new broker profile"}
            </p>
          </div>
          {/* SECTION 01: BASIC INFORMATION */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">
                Basic Information
              </h2>
            </div>

            <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-4">
              {/* Broker Name */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Broker Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Singh"
                  {...register("name")}
                  className={`dream-text-input ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="broker@example.com"
                  {...register("email")}
                  className={`dream-text-input ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    {...register("phone")}
                    className={`dream-text-input ${errors.phone ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {errors.phone ? (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.phone.message}
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-500 mt-1">
                      10 digits only
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    WhatsApp Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    {...register("whatsapp")}
                    className={`dream-text-input ${errors.whatsapp ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {errors.whatsapp && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.whatsapp.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Status
                </label>
                <select
                  {...register("status")}
                  className={`dream-select ${errors.status ? "border-red-500 focus:ring-red-500" : ""}`}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 02: BUDGET RANGE */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">
                Budget Range
              </h2>
            </div>

            <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-4">
              {/* Budget Min & Max */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    Minimum Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      {...register("budgetMin")}
                      className={`dream-input pl-8 ${errors.budgetMin ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                  {errors.budgetMin ? (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.budgetMin.message}
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-500 mt-1">
                      Min amount broker can handle
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    Maximum Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      {...register("budgetMax")}
                      className={`dream-input pl-8 ${errors.budgetMax ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                  {errors.budgetMax && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.budgetMax.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 03: AREAS & EXPERTISE */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">
                Areas & Expertise
              </h2>
            </div>

            <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-4">
              {/* Areas of Operation */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Areas of Operation
                </label>
                <textarea
                  placeholder="e.g. Bandra, Andheri, Powai, Dadar (separate by comma)"
                  {...register("areaOfOperation")}
                  rows={3}
                  className={`dream-textarea ${errors.areaOfOperation ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.areaOfOperation ? (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.areaOfOperation.message}
                  </p>
                ) : (
                  <p className="text-xs text-neutral-500 mt-1">
                    List all areas where the broker operates (comma-separated)
                  </p>
                )}
              </div>

              {/* Society Expertise */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Society Expertise
                </label>
                <textarea
                  placeholder="e.g. Lodha Group, Godrej Properties, HDFC Holdings"
                  {...register("societyExpertise")}
                  rows={3}
                  className={`dream-textarea ${errors.societyExpertise ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.societyExpertise ? (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.societyExpertise.message}
                  </p>
                ) : (
                  <p className="text-xs text-neutral-500 mt-1">
                    List builder/society names the broker specializes in
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 04: ADDITIONAL NOTES */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">
                Additional Notes
              </h2>
            </div>

            <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-4">
              {/* Notes */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Notes & Comments
                </label>
                <textarea
                  placeholder="Any additional information about the broker, referral source, special terms, etc."
                  {...register("notes")}
                  rows={4}
                  className={`dream-textarea ${errors.notes ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.notes && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.notes.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/broker/overview")}
              className="flex-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-semibold py-3 px-4 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-lg hover:shadow-yellow-400/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  {isEditMode ? "Updating Broker..." : "Adding Broker..."}
                </>
              ) : isEditMode ? (
                "Update Broker"
              ) : (
                "Add Broker"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
