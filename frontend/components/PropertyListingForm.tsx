"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utlis";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveListing } from "@/lib/fileStorage";
import { useOwners } from "@/hooks/useOwners";
import { useBrokers } from "@/hooks/useBrokers";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

const IMAGE_MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const BROCHURE_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

type UploadStatus = "pending" | "uploading" | "uploaded" | "failed";

type FormData = {
  // Basic Information
  propertyType: string;
  buildingName: string;
  location: string;
  pinCode: string;

  // Technical Specifications
  floorNumber: string;
  totalFloors: string;
  bedrooms: string;
  bathrooms: string;
  balconies: string;
  carpetArea: string;
  superBuiltUpArea: string;

  // Pricing & Status
  askingPrice: string;
  availabilityStatus: string;
  availabilityDate: string;

  // Owner/Source
  ownerId?: string;
  accessType: string;
  sourcePartner: string;
  sourcePartnerId?: string;
  remarks: string;

  // Society Insights
  builderName: string;
  yearBuilt: string;
  totalUnits: string;
  reraNumber: string;
  amenities: {
    parking: boolean;
    gym: boolean;
    lift: boolean;
    security: boolean;
    powerBackup: boolean;
    swimmingPool: boolean;
    clubhouse: boolean;
  };

  // Media
  images: File[];
  societyBrochure: File | null;
};

export default function PropertyListingForm() {

  type ImagePreview = {
    id: string;
    file: File;
    preview: string;
    caption: string;
    objectKey?: string;
    publicUrl?: string | null;
    uploadStatus: UploadStatus;
    error?: string;
  };

  type BrochurePreview = {
    file: File;
    preview: string;
    objectKey?: string;
    publicUrl?: string | null;
    uploadStatus: UploadStatus;
    error?: string;
  };

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    propertyType: "",
    buildingName: "",
    location: "",
    pinCode: "",
    floorNumber: "",
    totalFloors: "",
    bedrooms: "",
    bathrooms: "",
    balconies: "",
    carpetArea: "",
    superBuiltUpArea: "",
    askingPrice: "",
    availabilityStatus: "",
    availabilityDate: "",
    ownerId: undefined,
    accessType: "",
    sourcePartner: "",
    sourcePartnerId: undefined,
    remarks: "",
    builderName: "",
    yearBuilt: "",
    totalUnits: "",
    reraNumber: "",
    amenities: {
      parking: false,
      gym: false,
      lift: false,
      security: false,
      powerBackup: false,
      swimmingPool: false,
      clubhouse: false,
    },
    images: [],
    societyBrochure: null,
  });

  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [brochuirePreview, setBrochurePreview] = useState<BrochurePreview | null>(null);
  const [dragActive, setDragActive] = useState(false);
  // Owner/Broker selection state
  const [ownerQuery, setOwnerQuery] = useState("");
  const [brokerQuery, setBrokerQuery] = useState("");
  const { data: owners = [], loading: ownersLoading } = useOwners({ name: ownerQuery });
  const { brokers = [], isLoading: brokersLoading } = useBrokers();

  const filteredOwners = (ownerQuery && owners) ? owners.filter((o: any) => o.name?.toLowerCase().includes(ownerQuery.toLowerCase())) : (owners || []);
  const filteredBrokers = (brokerQuery && brokers) ? brokers.filter((b: any) => b.name?.toLowerCase().includes(brokerQuery.toLowerCase())) : (brokers || []);

  const parseErrorMessage = async (response: Response, fallback: string) => {
    const text = await response.text();
    if (!text) return fallback;

    try {
      const json = JSON.parse(text);
      return json?.message || json?.error || fallback;
    } catch {
      return text;
    }
  };

  const getAuthToken = () => localStorage.getItem("token");

  const requestPresignedUrl = async (file: File, folder: string) => {
    const token = getAuthToken();
    const res = await fetch(`${apiBaseUrl}/api/v1/upload/presign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ fileName: file.name, contentType: file.type, folder }),
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(json?.message || "Failed to get presigned URL");
    return json.data as { objectKey: string; uploadUrl: string; publicUrl: string | null };
  };

  const uploadToR2 = async (uploadUrl: string, file: File) => {
    const r = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
    if (!r.ok) {
      throw new Error(await parseErrorMessage(r, "R2 upload failed"));
    }
  };

  const deleteUploadedObject = async (objectKey: string) => {
    const token = getAuthToken();
    const res = await fetch(`${apiBaseUrl}/api/v1/upload/object`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ objectKey }),
    });

    if (!res.ok) {
      throw new Error(await parseErrorMessage(res, "Failed to delete uploaded image"));
    }
  };

  // Input change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let next: any = { ...prev, [name]: value };
      if (name === "accessType") {
        if (value === "direct") {
          // clear broker/source partner fields
          next.sourcePartner = "";
          next.sourcePartnerId = undefined;
        } else if (value === "broker") {
          // clear owner selection
          next.ownerId = undefined;
        }
      }
      return next;
    });
  };

  // Amenities change handler
  const handleAmenityChange = (key: keyof typeof formData.amenities) => {
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: !prev.amenities[key],
      },
    }));
  };

  // Handle image uploads
  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const allowed = Array.from(files).slice(0, 20 - imagePreviews.length);

    allowed.forEach(async (file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > IMAGE_MAX_SIZE) {
        toast.error("Image too large", { description: `${file.name} exceeds 2 MB.` });
        return;
      }

      const id = (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now()) + Math.random();
      const preview = URL.createObjectURL(file);
      const uploadToastId = toast.loading(`Uploading ${file.name}`);

      setImagePreviews((prev) => [
        ...prev,
        { id, file, preview, caption: "", uploadStatus: "uploading" },
      ]);

      try {
        const presign = await requestPresignedUrl(file, "properties/images");
        await uploadToR2(presign.uploadUrl, file);
        setImagePreviews((prev) => prev.map((p) => p.id === id ? { ...p, uploadStatus: "uploaded", objectKey: presign.objectKey, publicUrl: presign.publicUrl ?? undefined } : p));
        toast.dismiss(uploadToastId);
        toast.success(`Uploaded ${file.name}`, {
          description: "The image is ready to be saved with the listing.",
        });
      } catch (err: any) {
        const message = err?.message ?? String(err);
        setImagePreviews((prev) => prev.map((p) => p.id === id ? { ...p, uploadStatus: "failed", error: message } : p));
        toast.dismiss(uploadToastId);
        toast.error(`Failed to upload ${file.name}`, {
          description: message,
        });
      }
    });
  };

  // Handle brochure upload
  const handleBrochureUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];
    if (file.type !== "application/pdf") {
      toast.error("Only PDF allowed");
      return;
    }
    if (file.size > BROCHURE_MAX_SIZE) {
      toast.error("Brochure too large", { description: "PDF must be <= 5 MB" });
      return;
    }

    const preview = URL.createObjectURL(file);
    setBrochurePreview({ file, preview, uploadStatus: "uploading" });
    const uploadToastId = toast.loading(`Uploading ${file.name}`);

    try {
      const presign = await requestPresignedUrl(file, "properties/brochures");
      await uploadToR2(presign.uploadUrl, file);
      setBrochurePreview({ file, preview, uploadStatus: "uploaded", objectKey: presign.objectKey, publicUrl: presign.publicUrl ?? undefined });
      toast.dismiss(uploadToastId);
      toast.success(`Uploaded ${file.name}`, {
        description: "The brochure is ready to be saved with the listing.",
      });
    } catch (err: any) {
      const message = err?.message ?? String(err);
      setBrochurePreview({ file, preview, uploadStatus: "failed", error: message });
      toast.dismiss(uploadToastId);
      toast.error(`Failed to upload ${file.name}`, {
        description: message,
      });
    }
  };

  // Remove image by id
  const removeImage = async (id: string) => {
    const image = imagePreviews.find((item) => item.id === id);
    if (!image) return;

    if (image.uploadStatus === "uploaded" && image.objectKey) {
      const deleteToastId = toast.loading(`Removing ${image.file.name}`);
      try {
        await deleteUploadedObject(image.objectKey);
        URL.revokeObjectURL(image.preview);
        setImagePreviews((prev) => prev.filter((p) => p.id !== id));
        toast.dismiss(deleteToastId);
        toast.success(`Removed ${image.file.name}`, {
          description: "The image was deleted from R2.",
        });
      } catch (error) {
        toast.dismiss(deleteToastId);
        toast.error(`Failed to remove ${image.file.name}`, {
          description: error instanceof Error ? error.message : "Could not delete the uploaded image.",
        });
      }
      return;
    }

    URL.revokeObjectURL(image.preview);
    setImagePreviews((prev) => prev.filter((p) => p.id !== id));
    toast.info(`Removed ${image.file.name}`, {
      description: "This image was only removed from the form.",
    });
  };

  // Update image caption by id
  const updateImageCaption = (id: string, caption: string) => {
    setImagePreviews((prev) => prev.map((p) => p.id === id ? { ...p, caption } : p));
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validation: require basic fields and either owner or sourcePartner selection
    if (!formData.propertyType || !formData.buildingName || !formData.location || !formData.pinCode) {
      toast.error("Validation Error", {
        description: "Please fill required fields (type, building, location, pin code).",
      });
      return;
    }

    // prefer ownerId/sourcePartnerId provided via formData.ownerId/sourcePartnerId
    const ownerId = (formData as any).ownerId ?? null;
    const sourcePartnerId = (formData as any).sourcePartnerId ?? null;

    if (!ownerId && !sourcePartnerId) {
      toast.error("Relation required", { description: "Select an owner or a source partner (broker)." });
      return;
    }

    // Ensure all selected media are uploaded
    if (imagePreviews.some((p) => p.uploadStatus !== "uploaded")) {
      toast.error("Please wait for all images to finish uploading or remove failed ones.");
      return;
    }
    if (brochuirePreview && brochuirePreview.uploadStatus !== "uploaded") {
      toast.error("Please wait for brochure upload to finish or remove it.");
      return;
    }

    let loadingToast: string | number | undefined;

    try {
      setIsSubmitting(true);
      loadingToast = toast.loading("Saving property listing...");

      // Build payload
      const payload: any = {
        propertyType: formData.propertyType ? formData.propertyType.toUpperCase() : undefined,
        buildingName: formData.buildingName,
        location: formData.location,
        pinCode: formData.pinCode,
        floorNumber: formData.floorNumber || undefined,
        totalFloors: formData.totalFloors || undefined,
        bedrooms: formData.bedrooms || undefined,
        bathrooms: formData.bathrooms || undefined,
        balconies: formData.balconies || undefined,
        carpetArea: formData.carpetArea || undefined,
        superBuiltUpArea: formData.superBuiltUpArea || undefined,
        askingPrice: formData.askingPrice || undefined,
        availabilityStatus: formData.availabilityStatus || undefined,
        availabilityDate: formData.availabilityDate || undefined,
        ownerId,
        sourcePartnerId,
        accessType: formData.accessType || undefined,
        remarks: formData.remarks || undefined,
        amenities: formData.amenities,
      };

      // Attach uploaded media keys
      const uploadedImages = imagePreviews.filter((p) => p.uploadStatus === "uploaded" && p.objectKey).map((p, idx) => ({ objectKey: p.objectKey, caption: p.caption || undefined, publicUrl: p.publicUrl, order: idx }));
        if (uploadedImages.length) payload.images = uploadedImages;

        if (brochuirePreview && brochuirePreview.uploadStatus === "uploaded" && brochuirePreview.objectKey) {
          payload.brochure = { objectKey: brochuirePreview.objectKey, publicUrl: brochuirePreview.publicUrl, fileName: brochuirePreview.file.name };
        }
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiBaseUrl}/api/v1/property`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const respText = await res.text();
      const respJson = respText ? JSON.parse(respText) : {};
      if (!res.ok) throw new Error(respJson?.message || `${res.status} ${res.statusText}`);

      if (loadingToast) toast.dismiss(loadingToast);
      toast.success("Property listing created successfully!", { description: respJson?.message ?? "Created" });

      // Reset form (keep images handling local but clear previews)
      setFormData({
        propertyType: "",
        buildingName: "",
        location: "",
        pinCode: "",
        floorNumber: "",
        totalFloors: "",
        bedrooms: "",
        bathrooms: "",
        balconies: "",
        carpetArea: "",
        superBuiltUpArea: "",
        askingPrice: "",
        availabilityStatus: "",
        availabilityDate: "",
        ownerId: undefined,
        accessType: "",
        sourcePartner: "",
        remarks: "",
        builderName: "",
        yearBuilt: "",
        totalUnits: "",
        reraNumber: "",
        amenities: {
          parking: false,
          gym: false,
          lift: false,
          security: false,
          powerBackup: false,
          swimmingPool: false,
          clubhouse: false,
        },
        images: [],
        societyBrochure: null,
      });
      setImagePreviews([]);
      setBrochurePreview(null);
      setTimeout(() => router.push("/stock/overview"), 1200);
    } catch (error) {
      console.error("Error saving listing:", error);
      if (loadingToast) toast.dismiss(loadingToast);
      toast.error("Failed to save listing", {
        description:
          error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 bg-black min-h-screen">
      <form onSubmit={handleSubmit} className="space-y-8">
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
            {/* Property Type */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                Property Type
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                className="dream-select"
              >
                <option value="">Select Property Type</option>
                <option value="flat">Flat</option>
                <option value="land">Land</option>
                <option value="warehouse">Warehouse</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            {/* Building Name */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                Building/Society Name
              </label>
              <input
                type="text"
                name="buildingName"
                placeholder="e.g. Skyline Residences"
                value={formData.buildingName}
                onChange={handleInputChange}
                className="dream-text-input"
              />
            </div>

            {/* Location & Pin Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Location / Area
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter Area or Locality"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="dream-text-input"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Pin Code
                </label>
                <input
                  type="text"
                  name="pinCode"
                  placeholder="e.g. 400001"
                  value={formData.pinCode}
                  onChange={handleInputChange}
                  className="dream-text-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 02: TECHNICAL SPECIFICATIONS */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">
              Technical Specifications
            </h2>
          </div>

          <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-4">
            {/* Floor Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Floor
                </label>
                <input
                  type="number"
                  name="floorNumber"
                  placeholder="0"
                  value={formData.floorNumber}
                  onChange={handleInputChange}
                  className="dream-input"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Total Floors
                </label>
                <input
                  type="number"
                  name="totalFloors"
                  placeholder="0"
                  value={formData.totalFloors}
                  onChange={handleInputChange}
                  className="dream-input"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  placeholder="0"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="dream-input"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  placeholder="0"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="dream-input"
                />
              </div>
            </div>

            {/* Balconies */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                Balconies
              </label>
              <input
                type="number"
                name="balconies"
                placeholder="0"
                value={formData.balconies}
                onChange={handleInputChange}
                className="dream-input"
              />
            </div>

            {/* Area Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Carpet Area (SQ FT)
                </label>
                <input
                  type="number"
                  name="carpetArea"
                  placeholder="e.g. 1250"
                  value={formData.carpetArea}
                  onChange={handleInputChange}
                  className="dream-input"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Super Built-up Area (SQ FT)
                </label>
                <input
                  type="number"
                  name="superBuiltUpArea"
                  placeholder="e.g. 1800"
                  value={formData.superBuiltUpArea}
                  onChange={handleInputChange}
                  className="dream-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 03: PRICING & STATUS */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">
              Pricing & Status
            </h2>
          </div>

          <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-4">
            {/* Asking Price */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                Asking Price / Rent
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400">₹</span>
                <input
                  type="number"
                  name="askingPrice"
                  placeholder="0.00"
                  value={formData.askingPrice}
                  onChange={handleInputChange}
                  className="dream-input pl-8"
                />
              </div>
            </div>

            {/* Availability Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Availability Status
                </label>
                <select
                  name="availabilityStatus"
                  value={formData.availabilityStatus}
                  onChange={handleInputChange}
                  className="dream-select"
                >
                  <option value="">Select Status</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="RENTED">Rented</option>
                  <option value="SOLD">Sold</option>
                  <option value="UPCOMING">Upcoming</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Availability Date
                </label>
                <input
                  type="date"
                  name="availabilityDate"
                  value={formData.availabilityDate}
                  onChange={handleInputChange}
                  className="dream-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 04: MEDIA ASSETS */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">
              Media Assets
            </h2>
          </div>

          <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-6">
            {/* Property Images */}
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-4">
                Property Images ({imagePreviews.length}/20)
              </p>

              {/* Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                  dragActive
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-neutral-700 bg-neutral-800/20 hover:border-yellow-400/50"
                )}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                  disabled={imagePreviews.length >= 20}
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-yellow-400" />
                  <p className="text-sm font-medium text-white">
                    Drag & Drop up to 20 Photos
                  </p>
                  <p className="text-xs text-neutral-400">
                    Or click to browse from your device. JPG, PNG formats only.
                  </p>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((img) => (
                    <div key={img.id} className="relative group">
                      <div className="relative bg-neutral-800 rounded-lg overflow-hidden aspect-square">
                        <img
                          src={img.preview}
                          alt={`Property`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        {img.uploadStatus === "uploading" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/15 px-2 py-1 text-yellow-300">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Uploading
                          </span>
                        )}
                        {img.uploadStatus === "uploaded" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Ready
                          </span>
                        )}
                        {img.uploadStatus === "failed" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-1 text-red-300">
                            <AlertCircle className="h-3 w-3" />
                            Failed
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Image caption"
                        value={img.caption}
                        onChange={(e) => updateImageCaption(img.id, e.target.value)}
                        className="mt-2 w-full bg-neutral-800 border border-neutral-600 rounded-lg px-2 py-1 text-white placeholder-neutral-500 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-all"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Society Brochure */}
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-4">
                Society Brochure (PDF)
              </p>
              {brochuirePreview ? (
                <div className="bg-neutral-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-red-500 text-lg font-bold">PDF</span>
                      </div>
                      <div className="text-sm text-white">{brochuirePreview.file.name}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBrochurePreview(null)}
                      className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {brochuirePreview.uploadStatus === "uploading" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/15 px-2 py-1 text-yellow-300">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Uploading
                      </span>
                    )}
                    {brochuirePreview.uploadStatus === "uploaded" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        Ready
                      </span>
                    )}
                    {brochuirePreview.uploadStatus === "failed" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-1 text-red-300">
                        <AlertCircle className="h-3 w-3" />
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleBrochureUpload(e.target.files)}
                    className="hidden"
                    id="brochure-upload"
                  />
                  <label htmlFor="brochure-upload" className="cursor-pointer">
                    <Upload className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-sm text-white">Upload Brochure PDF</p>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 05: OWNER & ACCESS DETAILS */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              05
            </div>
            <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">
              Owner & Access Details
            </h2>
          </div>

          <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-4">
            {/* Access Type */}
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-3">
                Access Type
              </p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accessType"
                    value="direct"
                    checked={formData.accessType === "direct"}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-yellow-400 cursor-pointer"
                  />
                  <span className="text-sm text-neutral-300">Direct Owner</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accessType"
                    value="broker"
                    checked={formData.accessType === "broker"}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-yellow-400 cursor-pointer"
                  />
                  <span className="text-sm text-neutral-300">+1 Broker</span>
                </label>
              </div>
            </div>

            {formData.accessType === "direct" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    Select Owner
                  </label>
                  <SearchableDropdown
                    options={filteredOwners?.map((o: any) => ({ id: o.id, name: o.name })) ?? []}
                    selectedValue={(formData as any).ownerId}
                    onChange={(val) => {
                      setFormData((p) => ({ ...(p as any), ownerId: val }));
                    }}
                    placeholder="-- Select Owner (optional) --"
                    searchPlaceholder="Search owners by name"
                    query={ownerQuery}
                    onQueryChange={setOwnerQuery}
                    loading={ownersLoading}
                  />
                </div>

                <div className="sm:col-span-2">
                  {(formData as any).ownerId ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-200">
                          Selected owner: {owners?.find((o: any) => o.id === (formData as any).ownerId)?.name ?? "Unknown"}
                        </p>
                        <Link href={`/owner/lists/${(formData as any).ownerId}`} className="text-yellow-400 text-sm underline">
                          View Owner
                        </Link>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...(p as any), ownerId: undefined }))}
                          className="text-sm text-red-400"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-400">No owner selected. Choose an owner from the dropdown above.</p>
                  )}
                </div>
              </div>
            ) : null}

            {formData.accessType === "broker" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                    Partner Name / Source
                  </label>
                  <SearchableDropdown
                    options={filteredBrokers?.map((b: any) => ({ id: b.id, name: b.name })) ?? []}
                    selectedValue={(formData as any).sourcePartnerId}
                    onChange={(val) => {
                      setFormData((p) => ({ ...(p as any), sourcePartnerId: val }));
                    }}
                    placeholder="-- Select Broker (optional) --"
                    searchPlaceholder="Search brokers by name"
                    query={brokerQuery}
                    onQueryChange={setBrokerQuery}
                    loading={brokersLoading}
                  />
                </div>

                <div className="sm:col-span-2">
                  {(formData as any).sourcePartnerId ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-200">
                          Selected broker: {brokers?.find((b: any) => b.id === (formData as any).sourcePartnerId)?.name ?? "Unknown"}
                        </p>
                        <Link href={`/broker/lists/${(formData as any).sourcePartnerId}`} className="text-yellow-400 text-sm underline">
                          View Broker
                        </Link>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...(p as any), sourcePartnerId: undefined }))}
                          className="text-sm text-red-400"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-400">No broker selected. Choose a broker from the dropdown above.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* SECTION 07: SOCIETY INSIGHTS & EXTRAS */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              07
            </div>
            <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">
              Society Insights & Extras
            </h2>
          </div>

          <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-4">
            {/* Builder & Year Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Builder Name
                </label>
                <input
                  type="text"
                  name="builderName"
                  placeholder="e.g. Prestige Group"
                  value={formData.builderName}
                  onChange={handleInputChange}
                  className="dream-text-input"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Year Built
                </label>
                <input
                  type="number"
                  name="yearBuilt"
                  placeholder="2020"
                  value={formData.yearBuilt}
                  onChange={handleInputChange}
                  className="dream-input"
                />
              </div>
            </div>

            {/* Units & RERA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Total Units
                </label>
                <input
                  type="number"
                  name="totalUnits"
                  placeholder="120"
                  value={formData.totalUnits}
                  onChange={handleInputChange}
                  className="dream-input"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  RERA Registration Number
                </label>
                <input
                  type="text"
                  name="reraNumber"
                  placeholder="e.g. RERA/MH/123456"
                  value={formData.reraNumber}
                  onChange={handleInputChange}
                  className="dream-text-input"
                />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-3">
                Key Amenities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(formData.amenities).map(([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 p-3 bg-neutral-800/30 border border-neutral-700 rounded-lg cursor-pointer hover:border-yellow-400/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() =>
                        handleAmenityChange(key as keyof typeof formData.amenities)
                      }
                      className="w-4 h-4 accent-yellow-400 cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm text-neutral-300 capitalize">
                      {key === "powerBackup"
                        ? "Power Backup"
                        : key === "swimmingPool"
                          ? "Swimming Pool"
                          : key}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                Additional Remarks
              </label>
              <textarea
                name="remarks"
                placeholder="Mention architectural highlights, neighborhood proximity, historical value, or any other additional information..."
                value={formData.remarks}
                onChange={handleInputChange}
                rows={4}
                className="dream-textarea"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/stock/overview")}
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
                Saving...
              </>
            ) : (
              "Save Property Listing"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
