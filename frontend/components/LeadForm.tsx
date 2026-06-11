"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { leadSchema, type LeadFormData } from "@/schemas/lead.schemas";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lead } from "@/hooks/useLeads";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeadFormProps {
  initialLead?: Lead;
}

const AMENITY_OPTIONS = [
  { label: "Parking", value: "Parking" },
  { label: "Gym", value: "Gym" },
  { label: "Lift", value: "Lift" },
  { label: "Security", value: "Security" },
  { label: "Power Backup", value: "Power Backup" },
  { label: "Swimming Pool", value: "Swimming Pool" },
  { label: "Clubhouse", value: "Clubhouse" },
];

export default function LeadForm({ initialLead }: LeadFormProps) {
  const router = useRouter();
  const isEditMode = !!initialLead;
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    control,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      whatsapp: "",
      source: "",
      budgetMin: "",
      budgetMax: "",
      preferredLocation: "",
      propertyType: "",
      bedrooms: "",
      bathrooms: "",
      minArea: "",
      maxArea: "",
      furnishedType: "",
      preferredAmenities: "",
      purchaseTimeline: "",
      priority: "WARM",
      notes: "",
      status: "NEW",
    },
  });

  // Load initial lead data when editing
  useEffect(() => {
    if (initialLead) {
      setValue("name", initialLead.name || "");
      setValue("phone", initialLead.phone || "");
      setValue("email", initialLead.email || "");
      setValue("whatsapp", initialLead.whatsapp || "");
      setValue("source", initialLead.source || "");
      setValue("budgetMin", initialLead.budgetMin?.toString() || "");
      setValue("budgetMax", initialLead.budgetMax?.toString() || "");
      setValue("preferredLocation", initialLead.preferredLocation || "");
      setValue("propertyType", initialLead.propertyType || "");
      setValue("bedrooms", initialLead.bedrooms?.toString() || "");
      setValue("bathrooms", initialLead.bathrooms?.toString() || "");
      setValue("minArea", initialLead.minArea?.toString() || "");
      setValue("maxArea", initialLead.maxArea?.toString() || "");
      setValue("furnishedType", initialLead.furnishedType || "");
      setValue("purchaseTimeline", initialLead.purchaseTimeline || "");
      setValue("priority", initialLead.priority || "WARM");
      setValue("notes", initialLead.notes || "");
      setValue("status", initialLead.status || "NEW");

      try {
        const parsed = initialLead.preferredAmenities ? JSON.parse(initialLead.preferredAmenities) : [];
        setSelectedAmenities(Array.isArray(parsed) ? parsed : []);
      } catch {
        setSelectedAmenities([]);
      }
    }
  }, [initialLead, setValue]);

  const handleAmenityChange = (value: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const onSubmit = async (data: LeadFormData) => {
    const timestamp = new Date().toISOString();
    try {
      const loadingToast = toast.loading(
        isEditMode ? "Updating lead..." : "Creating lead..."
      );

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unauthorized. Please login again.", { id: loadingToast });
        router.push("/auth");
        return;
      }

      const endpoint = isEditMode
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/leads/${initialLead.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/leads`;
      const method = isEditMode ? "PATCH" : "POST";

      const payload = {
        ...data,
        preferredAmenities: JSON.stringify(selectedAmenities),
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(responseData.message || `Failed to ${isEditMode ? "update" : "create"} lead`);
      }

      toast.dismiss(loadingToast);
      toast.success(isEditMode ? "Lead updated successfully" : "Lead created successfully");

      // Redirect back to list or details view
      setTimeout(() => {
        if (isEditMode) {
          router.push(`/leads/${initialLead.id}`);
        } else {
          router.push("/leads");
        }
      }, 1000);
    } catch (err) {
      console.error(`[${timestamp}] Error submitting form:`, err);
      toast.error(isEditMode ? "Failed to update lead" : "Failed to create lead");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 bg-black min-h-screen text-white">
      {isLoading ? (
        <div className="space-y-8 animate-pulse">
          <Skeleton className="h-12 w-64 bg-neutral-850" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-48 bg-neutral-850" />
              <Skeleton className="h-12 w-full bg-neutral-850" />
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Header Title */}
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">
              {isEditMode ? "Edit Lead Profile" : "Create New Lead"}
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              {isEditMode ? "Modify client details and search preferences." : "Establish client criteria and purchase timelines."}
            </p>
          </div>

          {/* Section 01: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">Basic Information</h2>
            </div>
            
            <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  {...register("name")}
                  className={`dream-text-input ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

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
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
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
                    <p className="mt-1 text-xs text-red-500">{errors.whatsapp.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    {...register("email")}
                    className={`dream-text-input ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    Lead Source
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Website, Instagram, Referral"
                    {...register("source")}
                    className="dream-text-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 02: Budget & Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">Budget & Location</h2>
            </div>

            <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    Minimum Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400 text-sm">₹</span>
                    <input
                      type="text"
                      placeholder="0.00"
                      {...register("budgetMin")}
                      className={`dream-input pl-8 ${errors.budgetMin ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                  {errors.budgetMin && (
                    <p className="mt-1 text-xs text-red-500">{errors.budgetMin.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    Maximum Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400 text-sm">₹</span>
                    <input
                      type="text"
                      placeholder="0.00"
                      {...register("budgetMax")}
                      className={`dream-input pl-8 ${errors.budgetMax ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                  </div>
                  {errors.budgetMax && (
                    <p className="mt-1 text-xs text-red-500">{errors.budgetMax.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Preferred Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bandra West, Sector 15"
                  {...register("preferredLocation")}
                  className="dream-text-input"
                />
              </div>
            </div>
          </div>

          {/* Section 03: Property Requirements */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">Property Preference</h2>
            </div>

            <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    Property Type
                  </label>
                  <Controller
                    name="propertyType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <SelectTrigger className="w-full bg-neutral-800 border-neutral-600 rounded-lg px-4 py-3 h-[46px] text-white text-sm focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 hover:border-yellow-400/60 transition-all text-left flex justify-between items-center [&>span]:line-clamp-1">
                          <SelectValue placeholder="Select Property Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                          <SelectItem value="FLAT">Flat</SelectItem>
                          <SelectItem value="LAND">Land</SelectItem>
                          <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                          <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                      Bedrooms (BHK)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 3"
                      {...register("bedrooms")}
                      className="dream-text-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 2"
                      {...register("bathrooms")}
                      className="dream-text-input"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    Minimum Area (Sq.Ft.)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 800"
                    {...register("minArea")}
                    className={`dream-text-input ${errors.minArea ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {errors.minArea && (
                    <p className="mt-1 text-xs text-red-500">{errors.minArea.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    Maximum Area (Sq.Ft.)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2000"
                    {...register("maxArea")}
                    className={`dream-text-input ${errors.maxArea ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {errors.maxArea && (
                    <p className="mt-1 text-xs text-red-500">{errors.maxArea.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Furnishing Status
                </label>
                <Controller
                  name="furnishedType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <SelectTrigger className="w-full bg-neutral-800 border-neutral-600 rounded-lg px-4 py-3 h-[46px] text-white text-sm focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 hover:border-yellow-400/60 transition-all text-left flex justify-between items-center [&>span]:line-clamp-1">
                        <SelectValue placeholder="Select Furnishing" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                        <SelectItem value="UNFURNISHED">Unfurnished</SelectItem>
                        <SelectItem value="SEMI_FURNISHED">Semi Furnished</SelectItem>
                        <SelectItem value="FULLY_FURNISHED">Fully Furnished</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section 04: Amenities (Checkboxes) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">Preferred Amenities</h2>
            </div>

            <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AMENITY_OPTIONS.map((opt) => {
                  const isChecked = selectedAmenities.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                        isChecked
                          ? "bg-yellow-400/10 border-yellow-400 text-yellow-400"
                          : "bg-neutral-850/20 border-neutral-800 hover:border-neutral-700 text-neutral-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleAmenityChange(opt.value)}
                        className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-yellow-450 focus:ring-yellow-400/50"
                      />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 05: Purchase Details & CRM Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                05
              </div>
              <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">Timeline & Priority</h2>
            </div>

            <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    Purchase Timeline
                  </label>
                  <Controller
                    name="purchaseTimeline"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <SelectTrigger className="w-full bg-neutral-800 border-neutral-600 rounded-lg px-4 py-3 h-[46px] text-white text-sm focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 hover:border-yellow-400/60 transition-all text-left flex justify-between items-center [&>span]:line-clamp-1">
                          <SelectValue placeholder="Select Timeline" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                          <SelectItem value="Immediate">Immediate</SelectItem>
                          <SelectItem value="Within 1 Month">Within 1 Month</SelectItem>
                          <SelectItem value="Within 3 Months">Within 3 Months</SelectItem>
                          <SelectItem value="Within 6 Months">Within 6 Months</SelectItem>
                          <SelectItem value="Just Exploring">Just Exploring</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    Priority Rating
                  </label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <SelectTrigger className="w-full bg-neutral-800 border-neutral-600 rounded-lg px-4 py-3 h-[46px] text-white text-sm focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 hover:border-yellow-400/60 transition-all text-left flex justify-between items-center [&>span]:line-clamp-1">
                          <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                          <SelectItem value="HOT">Hot</SelectItem>
                          <SelectItem value="WARM">Warm</SelectItem>
                          <SelectItem value="COLD">Cold</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    Lead Status
                  </label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <SelectTrigger className="w-full bg-neutral-800 border-neutral-600 rounded-lg px-4 py-3 h-[46px] text-white text-sm focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 hover:border-yellow-400/60 transition-all text-left flex justify-between items-center [&>span]:line-clamp-1">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                          <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                          <SelectItem value="LOST">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 06: Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                06
              </div>
              <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">Additional Notes</h2>
            </div>

            <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6">
              <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                Notes / Requirements
              </label>
              <textarea
                placeholder="Enter client remarks, key preferences, or transaction details..."
                {...register("notes")}
                rows={5}
                className="dream-textarea"
              />
            </div>
          </div>

          {/* Form Action Controls */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                if (isEditMode) {
                  router.push(`/leads/${initialLead.id}`);
                } else {
                  router.push("/leads");
                }
              }}
              disabled={isSubmitting}
              className="flex-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-semibold py-3 px-4 rounded-lg transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-lg hover:shadow-yellow-400/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Saving Lead...
                </>
              ) : isEditMode ? (
                "Update Lead"
              ) : (
                "Create Lead"
              )}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
