"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Upload, X, Pencil, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utlis";
import { toast } from "sonner";
import { useOwners } from "@/hooks/useOwners";
import { useBrokers } from "@/hooks/useBrokers";
import { useProperty } from "@/hooks/useProperties";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
const IMAGE_MAX_SIZE = 2 * 1024 * 1024;
const BROCHURE_MAX_SIZE = 5 * 1024 * 1024;

type UploadStatus = "pending" | "uploading" | "uploaded" | "failed";

// ── Existing image from DB (read-only until deleted) ──────────────────────────
type ExistingImage = {
  kind: "existing";
  id: string;           // DB PropertyImage.id
  url: string;
  publicId?: string;
  caption?: string;
  order: number;
  markedForDeletion: boolean;
};

// ── New image being uploaded ──────────────────────────────────────────────────
type NewImage = {
  kind: "new";
  tempId: string;
  file: File;
  preview: string;
  caption: string;
  objectKey?: string;
  publicUrl?: string | null;
  uploadStatus: UploadStatus;
  error?: string;
};

type ImageSlot = ExistingImage | NewImage;

type BrochureSlot =
  | { kind: "existing"; id: string; url: string; publicId?: string; fileName: string; markedForDeletion: boolean }
  | { kind: "new"; file: File; preview: string; objectKey?: string; publicUrl?: string | null; uploadStatus: UploadStatus; error?: string }
  | null;

type FormData = {
  propertyType: string;
  buildingName: string;
  location: string;
  pinCode: string;
  floorNumber: string;
  totalFloors: string;
  bedrooms: string;
  bathrooms: string;
  balconies: string;
  carpetArea: string;
  superBuiltUpArea: string;
  askingPrice: string;
  availabilityStatus: string;
  availabilityDate: string;
  ownerId?: string;
  sourcePartnerId?: string;
  accessType: string;
  remarks: string;
  builderName: string;
  yearBuilt: string;
  totalUnits: string;
  reraNumber: string;
  amenities: {
    parking: boolean; gym: boolean; lift: boolean; security: boolean;
    powerBackup: boolean; swimmingPool: boolean; clubhouse: boolean;
  };
};

const emptyForm: FormData = {
  propertyType: "", buildingName: "", location: "", pinCode: "",
  floorNumber: "", totalFloors: "", bedrooms: "", bathrooms: "",
  balconies: "", carpetArea: "", superBuiltUpArea: "", askingPrice: "",
  availabilityStatus: "", availabilityDate: "", ownerId: undefined,
  sourcePartnerId: undefined, accessType: "", remarks: "", builderName: "",
  yearBuilt: "", totalUnits: "", reraNumber: "",
  amenities: { parking: false, gym: false, lift: false, security: false, powerBackup: false, swimmingPool: false, clubhouse: false },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const getAuthToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

async function requestPresignedUrl(file: File, folder: string) {
  const token = getAuthToken();
  const res = await fetch(`${apiBaseUrl}/api/v1/upload/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type, folder }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Failed to get presigned URL");
  return json.data as { objectKey: string; uploadUrl: string; publicUrl: string | null };
}

async function uploadToR2(uploadUrl: string, file: File) {
  const r = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!r.ok) throw new Error("R2 upload failed");
}

async function deleteFromR2(objectKey: string) {
  const token = getAuthToken();
  await fetch(`${apiBaseUrl}/api/v1/upload/object`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
    body: JSON.stringify({ objectKey }),
  });
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PropertyListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("id") ?? undefined;
  const isEditMode = !!propertyId;

  const { data: existingProperty, loading: loadingExisting } = useProperty(propertyId);

  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([]);
  const [brochureSlot, setBrochureSlot] = useState<BrochureSlot>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ownerQuery, setOwnerQuery] = useState("");
  const [brokerQuery, setBrokerQuery] = useState("");
  const { data: owners = [], loading: ownersLoading } = useOwners({ name: ownerQuery });
  const { brokers = [], isLoading: brokersLoading } = useBrokers();

  const filteredOwners = owners ? owners.filter((o: any) => !ownerQuery || o.name?.toLowerCase().includes(ownerQuery.toLowerCase())) : [];
  const filteredBrokers = brokers ? brokers.filter((b: any) => !brokerQuery || b.name?.toLowerCase().includes(brokerQuery.toLowerCase())) : [];

  // ── Populate form when editing ───────────────────────────────────────────
  useEffect(() => {
    if (!existingProperty) return;
    const p = existingProperty;
    setFormData({
      propertyType: p.propertyType ?? "",
      buildingName: p.buildingName ?? "",
      location: p.location ?? "",
      pinCode: p.pinCode ?? "",
      floorNumber: p.floorNumber ?? "",
      totalFloors: p.totalFloors != null ? String(p.totalFloors) : "",
      bedrooms: p.bedrooms != null ? String(p.bedrooms) : "",
      bathrooms: p.bathrooms != null ? String(p.bathrooms) : "",
      balconies: p.balconies != null ? String(p.balconies) : "",
      carpetArea: p.carpetArea != null ? String(p.carpetArea) : "",
      superBuiltUpArea: p.superBuiltUpArea != null ? String(p.superBuiltUpArea) : "",
      askingPrice: p.askingPrice != null ? String(p.askingPrice) : "",
      availabilityStatus: p.availabilityStatus ?? "",
      availabilityDate: p.availabilityDate ? p.availabilityDate.split("T")[0] : "",
      ownerId: p.ownerId ?? undefined,
      sourcePartnerId: p.sourcePartnerId ?? undefined,
      accessType: p.ownerId ? "direct" : p.sourcePartnerId ? "broker" : "",
      remarks: p.remarks ?? "",
      builderName: p.builderName ?? "",
      yearBuilt: p.yearBuilt != null ? String(p.yearBuilt) : "",
      totalUnits: p.totalUnits != null ? String(p.totalUnits) : "",
      reraNumber: p.reraNumber ?? "",
      amenities: {
        parking: p.amenities?.parking ?? false,
        gym: p.amenities?.gym ?? false,
        lift: p.amenities?.lift ?? false,
        security: p.amenities?.security ?? false,
        powerBackup: p.amenities?.powerBackup ?? false,
        swimmingPool: p.amenities?.swimmingPool ?? false,
        clubhouse: p.amenities?.clubhouse ?? false,
      },
    });

    // Populate existing images
    const existing: ExistingImage[] = (p.images ?? []).map((img) => ({
      kind: "existing",
      id: img.id,
      url: img.url,
      publicId: img.publicId ?? undefined,
      caption: img.caption ?? undefined,
      order: img.order,
      markedForDeletion: false,
    }));
    setImageSlots(existing);

    // Populate existing brochure
    if (p.societyBrochure) {
      setBrochureSlot({
        kind: "existing",
        id: p.societyBrochure.id,
        url: p.societyBrochure.url,
        publicId: p.societyBrochure.publicId ?? undefined,
        fileName: p.societyBrochure.fileName,
        markedForDeletion: false,
      });
    }
  }, [existingProperty]);

  // ── Input handlers ────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next: any = { ...prev, [name]: value };
      if (name === "accessType") {
        if (value === "direct") { next.sourcePartnerId = undefined; }
        if (value === "broker") { next.ownerId = undefined; }
      }
      return next;
    });
  };

  const handleAmenityChange = (key: keyof FormData["amenities"]) => {
    setFormData((prev) => ({ ...prev, amenities: { ...prev.amenities, [key]: !prev.amenities[key] } }));
  };

  // ── Image handling ────────────────────────────────────────────────────────
  const totalImageCount = imageSlots.filter((s) => !(s.kind === "existing" && s.markedForDeletion)).length;

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const allowed = Array.from(files).slice(0, 20 - totalImageCount);
    allowed.forEach(async (file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > IMAGE_MAX_SIZE) { toast.error(`${file.name} exceeds 2 MB.`); return; }
      const tempId = crypto.randomUUID?.() ?? String(Date.now() + Math.random());
      const preview = URL.createObjectURL(file);
      const toastId = toast.loading(`Uploading ${file.name}`);
      setImageSlots((prev) => [...prev, { kind: "new", tempId, file, preview, caption: "", uploadStatus: "uploading" }]);
      try {
        const presign = await requestPresignedUrl(file, "properties/images");
        await uploadToR2(presign.uploadUrl, file);
        setImageSlots((prev) => prev.map((s) =>
          s.kind === "new" && s.tempId === tempId
            ? { ...s, uploadStatus: "uploaded", objectKey: presign.objectKey, publicUrl: presign.publicUrl }
            : s
        ));
        toast.dismiss(toastId);
        toast.success(`Uploaded ${file.name}`);
      } catch (err: any) {
        setImageSlots((prev) => prev.map((s) =>
          s.kind === "new" && s.tempId === tempId ? { ...s, uploadStatus: "failed", error: err?.message } : s
        ));
        toast.dismiss(toastId);
        toast.error(`Failed to upload ${file.name}`);
      }
    });
  };

  const removeExistingImage = (id: string) => {
    // Mark for deletion — actual delete happens on save
    setImageSlots((prev) => prev.map((s) =>
      s.kind === "existing" && s.id === id ? { ...s, markedForDeletion: true } : s
    ));
    toast.info("Image will be removed when you save.");
  };

  const undoRemoveExistingImage = (id: string) => {
    setImageSlots((prev) => prev.map((s) =>
      s.kind === "existing" && s.id === id ? { ...s, markedForDeletion: false } : s
    ));
  };

  const removeNewImage = async (tempId: string) => {
    const slot = imageSlots.find((s) => s.kind === "new" && s.tempId === tempId) as NewImage | undefined;
    if (!slot) return;
    if (slot.uploadStatus === "uploaded" && slot.objectKey) {
      try { await deleteFromR2(slot.objectKey); } catch {}
    }
    URL.revokeObjectURL(slot.preview);
    setImageSlots((prev) => prev.filter((s) => !(s.kind === "new" && s.tempId === tempId)));
  };

  const updateImageCaption = (id: string, caption: string) => {
    setImageSlots((prev) => prev.map((s) => {
      if (s.kind === "existing" && s.id === id) return { ...s, caption };
      if (s.kind === "new" && s.tempId === id) return { ...s, caption };
      return s;
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleImageUpload(e.dataTransfer.files);
  };

  // ── Brochure handling ─────────────────────────────────────────────────────
  const handleBrochureUpload = async (files: FileList | null) => {
    if (!files?.[0]) return;
    const file = files[0];
    if (file.type !== "application/pdf") { toast.error("Only PDF allowed"); return; }
    if (file.size > BROCHURE_MAX_SIZE) { toast.error("PDF must be ≤ 5 MB"); return; }
    const preview = URL.createObjectURL(file);
    setBrochureSlot({ kind: "new", file, preview, uploadStatus: "uploading" });
    const toastId = toast.loading(`Uploading ${file.name}`);
    try {
      const presign = await requestPresignedUrl(file, "properties/brochures");
      await uploadToR2(presign.uploadUrl, file);
      setBrochureSlot({ kind: "new", file, preview, uploadStatus: "uploaded", objectKey: presign.objectKey, publicUrl: presign.publicUrl });
      toast.dismiss(toastId); toast.success(`Uploaded ${file.name}`);
    } catch (err: any) {
      setBrochureSlot({ kind: "new", file, preview, uploadStatus: "failed", error: err?.message });
      toast.dismiss(toastId); toast.error(`Failed to upload ${file.name}`);
    }
  };

  const markBrochureForDeletion = () => {
    if (brochureSlot?.kind === "existing") {
      setBrochureSlot({ ...brochureSlot, markedForDeletion: true });
      toast.info("Brochure will be removed when you save.");
    }
  };

  const undoBrochureDeletion = () => {
    if (brochureSlot?.kind === "existing") {
      setBrochureSlot({ ...brochureSlot, markedForDeletion: false });
    }
  };

  const removeNewBrochure = async () => {
    if (brochureSlot?.kind !== "new") return;
    if (brochureSlot.uploadStatus === "uploaded" && brochureSlot.objectKey) {
      try { await deleteFromR2(brochureSlot.objectKey); } catch {}
    }
    if (brochureSlot.preview) URL.revokeObjectURL(brochureSlot.preview);
    setBrochureSlot(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.propertyType || !formData.buildingName || !formData.location || !formData.pinCode) {
      toast.error("Fill required fields: type, building, location, pin code.");
      return;
    }
    const ownerId = formData.ownerId ?? null;
    const sourcePartnerId = formData.sourcePartnerId ?? null;
    if (!ownerId && !sourcePartnerId) {
      toast.error("Select an owner or a source broker."); return;
    }

    // Check uploads in progress
    const newImages = imageSlots.filter((s): s is NewImage => s.kind === "new");
    if (newImages.some((s) => s.uploadStatus === "uploading")) {
      toast.error("Wait for all images to finish uploading."); return;
    }
    if (brochureSlot?.kind === "new" && brochureSlot.uploadStatus === "uploading") {
      toast.error("Wait for brochure to finish uploading."); return;
    }

    let loadingToast: string | number | undefined;
    try {
      setIsSubmitting(true);
      loadingToast = toast.loading(isEditMode ? "Saving changes..." : "Creating listing...");

      const payload: any = {
        propertyType: formData.propertyType?.toUpperCase() || undefined,
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
        ownerId, sourcePartnerId,
        accessType: formData.accessType || undefined,
        remarks: formData.remarks || undefined,
        builderName: formData.builderName || undefined,
        yearBuilt: formData.yearBuilt || undefined,
        totalUnits: formData.totalUnits || undefined,
        reraNumber: formData.reraNumber || undefined,
        amenities: formData.amenities,
      };

      // New images to add
      const uploadedNew = newImages.filter((s) => s.uploadStatus === "uploaded" && s.objectKey);
      if (uploadedNew.length > 0) {
        payload.images = uploadedNew.map((s, idx) => ({
          objectKey: s.objectKey, caption: s.caption || undefined, publicUrl: s.publicUrl, order: idx,
        }));
      }

      // Edit-mode: IDs of existing images marked for deletion
      if (isEditMode) {
        const toDelete = imageSlots.filter((s): s is ExistingImage => s.kind === "existing" && s.markedForDeletion).map((s) => s.id);
        if (toDelete.length > 0) payload.deletedImageIds = toDelete;
        if (brochureSlot?.kind === "existing" && brochureSlot.markedForDeletion) {
          payload.deleteBrochure = true;
        }
      }

      // New brochure
      if (brochureSlot?.kind === "new" && brochureSlot.uploadStatus === "uploaded" && brochureSlot.objectKey) {
        payload.brochure = { objectKey: brochureSlot.objectKey, publicUrl: brochureSlot.publicUrl, fileName: brochureSlot.file.name };
      }

      const token = localStorage.getItem("token");
      const url = isEditMode ? `${apiBaseUrl}/api/v1/property/${propertyId}` : `${apiBaseUrl}/api/v1/property`;
      const method = isEditMode ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || `${res.status} ${res.statusText}`);

      toast.dismiss(loadingToast);
      toast.success(isEditMode ? "Property updated!" : "Property created!", { description: json?.message });
      setTimeout(() => router.push(isEditMode ? `/stock/lists/${propertyId}` : "/stock/overview"), 1000);
    } catch (error) {
      if (loadingToast) toast.dismiss(loadingToast);
      toast.error("Failed to save", { description: error instanceof Error ? error.message : "Unexpected error." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading state for edit mode ───────────────────────────────────────────
  if (isEditMode && loadingExisting) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-yellow-400 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">Loading property data...</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 bg-black min-h-screen">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEditMode ? (
              <span className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-yellow-400" />
                Edit Property
              </span>
            ) : (
              "Add New Property"
            )}
          </h1>
          {isEditMode && (
            <p className="text-xs text-neutral-500 mt-0.5">
              ID: {propertyId}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── SECTION 01: BASIC INFO ─────────────────────────────────────── */}
        <Section num="01" title="Basic Information">
          <div>
            <Label>Property Type</Label>
            <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="dream-select">
              <option value="">Select Property Type</option>
              <option value="FLAT">Flat</option>
              <option value="LAND">Land</option>
              <option value="WAREHOUSE">Warehouse</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <Label>Building / Society Name</Label>
            <input type="text" name="buildingName" placeholder="e.g. Skyline Residences" value={formData.buildingName} onChange={handleInputChange} className="dream-text-input" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Location / Area</Label>
              <input type="text" name="location" placeholder="Enter Area or Locality" value={formData.location} onChange={handleInputChange} className="dream-text-input" />
            </div>
            <div>
              <Label>Pin Code</Label>
              <input type="text" name="pinCode" placeholder="e.g. 400001" value={formData.pinCode} onChange={handleInputChange} className="dream-text-input" />
            </div>
          </div>
        </Section>

        {/* ── SECTION 02: TECHNICAL SPECS ───────────────────────────────── */}
        <Section num="02" title="Technical Specifications">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Floor", name: "floorNumber" },
              { label: "Total Floors", name: "totalFloors" },
              { label: "Bedrooms", name: "bedrooms" },
              { label: "Bathrooms", name: "bathrooms" },
            ].map(({ label, name }) => (
              <div key={name}>
                <Label>{label}</Label>
                <input type="number" name={name} placeholder="0" value={(formData as any)[name]} onChange={handleInputChange} className="dream-input" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Balconies</Label>
              <input type="number" name="balconies" placeholder="0" value={formData.balconies} onChange={handleInputChange} className="dream-input" />
            </div>
            <div>
              <Label>Carpet Area (sq.ft)</Label>
              <input type="number" name="carpetArea" placeholder="e.g. 1250" value={formData.carpetArea} onChange={handleInputChange} className="dream-input" />
            </div>
            <div>
              <Label>Super Built-Up (sq.ft)</Label>
              <input type="number" name="superBuiltUpArea" placeholder="e.g. 1800" value={formData.superBuiltUpArea} onChange={handleInputChange} className="dream-input" />
            </div>
          </div>
        </Section>

        {/* ── SECTION 03: PRICING & STATUS ──────────────────────────────── */}
        <Section num="03" title="Pricing & Status">
          <div>
            <Label>Asking Price / Rent</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400">₹</span>
              <input type="number" name="askingPrice" placeholder="0.00" value={formData.askingPrice} onChange={handleInputChange} className="dream-input pl-8" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Availability Status</Label>
              <select name="availabilityStatus" value={formData.availabilityStatus} onChange={handleInputChange} className="dream-select">
                <option value="">Select Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="RENTED">Rented</option>
                <option value="SOLD">Sold</option>
                <option value="UPCOMING">Upcoming</option>
              </select>
            </div>
            <div>
              <Label>Availability Date</Label>
              <input type="date" name="availabilityDate" value={formData.availabilityDate} onChange={handleInputChange} className="dream-input" />
            </div>
          </div>
        </Section>

        {/* ── SECTION 04: MEDIA ASSETS ──────────────────────────────────── */}
        <Section num="04" title="Media Assets">
          {/* Images */}
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-4">
              Property Images ({totalImageCount}/20)
            </p>

            {/* Upload zone */}
            <div
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                dragActive ? "border-yellow-400 bg-yellow-400/10" : "border-neutral-700 bg-neutral-800/20 hover:border-yellow-400/50"
              )}
            >
              <input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden" id="image-upload" disabled={totalImageCount >= 20} />
              <label htmlFor="image-upload" className="flex flex-col items-center gap-2 cursor-pointer">
                <Upload className="w-8 h-8 text-yellow-400" />
                <p className="text-sm font-medium text-white">Drag & Drop or click to browse</p>
                <p className="text-xs text-neutral-400">JPG, PNG — max 2 MB each</p>
              </label>
            </div>

            {/* Image grid */}
            {imageSlots.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageSlots.map((slot) => {
                  if (slot.kind === "existing") {
                    const isDel = slot.markedForDeletion;
                    return (
                      <div key={slot.id} className={cn("relative group", isDel && "opacity-40")}>
                        <div className="relative bg-neutral-800 rounded-lg overflow-hidden aspect-square">
                          <img src={slot.url} alt={slot.caption || "Property"} className="w-full h-full object-cover" />
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {isDel ? (
                              <button type="button" onClick={() => undoRemoveExistingImage(slot.id)}
                                className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 rounded-lg text-xs font-medium text-black">
                                Undo
                              </button>
                            ) : (
                              <button type="button" onClick={() => removeExistingImage(slot.id)}
                                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg">
                                <X className="w-4 h-4 text-white" />
                              </button>
                            )}
                          </div>
                          {/* Saved badge */}
                          <div className="absolute top-2 left-2">
                            <span className="text-xs bg-neutral-900/80 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              {isDel ? "Will delete" : "Saved"}
                            </span>
                          </div>
                        </div>
                        <input type="text" placeholder="Image caption"
                          value={slot.caption ?? ""}
                          onChange={(e) => updateImageCaption(slot.id, e.target.value)}
                          className="mt-2 w-full bg-neutral-800 border border-neutral-600 rounded-lg px-2 py-1 text-white placeholder-neutral-500 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-all" />
                      </div>
                    );
                  }

                  // New image slot
                  return (
                    <div key={slot.tempId} className="relative group">
                      <div className="relative bg-neutral-800 rounded-lg overflow-hidden aspect-square">
                        <img src={slot.preview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => removeNewImage(slot.tempId)}
                            className="p-2 bg-red-500 hover:bg-red-600 rounded-lg">
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        {slot.uploadStatus === "uploading" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/15 px-2 py-1 text-yellow-300">
                            <Loader2 className="h-3 w-3 animate-spin" /> Uploading
                          </span>
                        )}
                        {slot.uploadStatus === "uploaded" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" /> Ready
                          </span>
                        )}
                        {slot.uploadStatus === "failed" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-1 text-red-300">
                            <AlertCircle className="h-3 w-3" /> Failed
                          </span>
                        )}
                      </div>
                      <input type="text" placeholder="Image caption"
                        value={slot.caption}
                        onChange={(e) => updateImageCaption(slot.tempId, e.target.value)}
                        className="mt-2 w-full bg-neutral-800 border border-neutral-600 rounded-lg px-2 py-1 text-white placeholder-neutral-500 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-all" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Brochure */}
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-4">Society Brochure (PDF)</p>
            {brochureSlot === null && (
              <div className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center">
                <input type="file" accept="application/pdf" onChange={(e) => handleBrochureUpload(e.target.files)} className="hidden" id="brochure-upload" />
                <label htmlFor="brochure-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-white">Upload Brochure PDF</p>
                </label>
              </div>
            )}

            {brochureSlot?.kind === "existing" && (
              <div className={cn("bg-neutral-800 rounded-lg p-4 flex items-center justify-between gap-3", brochureSlot.markedForDeletion && "opacity-50")}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-red-400 text-xs font-bold">PDF</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{brochureSlot.fileName}</p>
                    <p className="text-xs text-neutral-500">{brochureSlot.markedForDeletion ? "Will be deleted on save" : "Saved brochure"}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {brochureSlot.markedForDeletion ? (
                    <button type="button" onClick={undoBrochureDeletion}
                      className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30">
                      Undo
                    </button>
                  ) : (
                    <>
                      <a href={brochureSlot.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 rounded-lg bg-neutral-700 text-neutral-300 hover:bg-neutral-600">
                        View
                      </a>
                      <button type="button" onClick={markBrochureForDeletion}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
                        Delete
                      </button>
                      <label htmlFor="brochure-replace" className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30 cursor-pointer">
                        Replace
                      </label>
                      <input id="brochure-replace" type="file" accept="application/pdf" className="hidden"
                        onChange={(e) => { markBrochureForDeletion(); handleBrochureUpload(e.target.files); }} />
                    </>
                  )}
                </div>
              </div>
            )}

            {brochureSlot?.kind === "new" && (
              <div className="bg-neutral-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-red-400 text-xs font-bold">PDF</span>
                    </div>
                    <p className="text-sm text-white truncate">{brochureSlot.file.name}</p>
                  </div>
                  <button type="button" onClick={removeNewBrochure} className="p-2 hover:bg-neutral-700 rounded-lg">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {brochureSlot.uploadStatus === "uploading" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/15 px-2 py-1 text-yellow-300">
                      <Loader2 className="h-3 w-3 animate-spin" /> Uploading
                    </span>
                  )}
                  {brochureSlot.uploadStatus === "uploaded" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" /> Ready
                    </span>
                  )}
                  {brochureSlot.uploadStatus === "failed" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-1 text-red-300">
                      <AlertCircle className="h-3 w-3" /> Failed
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* ── SECTION 05: OWNER & ACCESS ────────────────────────────────── */}
        <Section num="05" title="Owner & Access Details">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-3">Access Type</p>
            <div className="flex gap-4">
              {[{ value: "direct", label: "Direct Owner" }, { value: "broker", label: "+1 Broker" }].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="accessType" value={opt.value} checked={formData.accessType === opt.value} onChange={handleInputChange} className="w-4 h-4 accent-yellow-400 cursor-pointer" />
                  <span className="text-sm text-neutral-300">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.accessType === "direct" && (
            <div>
              <Label>Select Owner</Label>
              <SearchableDropdown
                options={filteredOwners?.map((o: any) => ({ id: o.id, name: o.name })) ?? []}
                selectedValue={formData.ownerId}
                onChange={(val) => setFormData((p) => ({ ...p, ownerId: val }))}
                placeholder="-- Select Owner --"
                searchPlaceholder="Search owners by name"
                query={ownerQuery}
                onQueryChange={setOwnerQuery}
                loading={ownersLoading}
              />
              {formData.ownerId && (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-neutral-300">
                    Selected: <span className="text-white font-medium">{owners?.find((o: any) => o.id === formData.ownerId)?.name ?? "Unknown"}</span>
                  </p>
                  <button type="button" onClick={() => setFormData((p) => ({ ...p, ownerId: undefined }))} className="text-xs text-red-400 hover:text-red-300">Clear</button>
                </div>
              )}
            </div>
          )}

          {formData.accessType === "broker" && (
            <div>
              <Label>Select Broker / Source Partner</Label>
              <SearchableDropdown
                options={filteredBrokers?.map((b: any) => ({ id: b.id, name: b.name })) ?? []}
                selectedValue={formData.sourcePartnerId}
                onChange={(val) => setFormData((p) => ({ ...p, sourcePartnerId: val }))}
                placeholder="-- Select Broker --"
                searchPlaceholder="Search brokers by name"
                query={brokerQuery}
                onQueryChange={setBrokerQuery}
                loading={brokersLoading}
              />
              {formData.sourcePartnerId && (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-neutral-300">
                    Selected: <span className="text-white font-medium">{brokers?.find((b: any) => b.id === formData.sourcePartnerId)?.name ?? "Unknown"}</span>
                  </p>
                  <button type="button" onClick={() => setFormData((p) => ({ ...p, sourcePartnerId: undefined }))} className="text-xs text-red-400 hover:text-red-300">Clear</button>
                </div>
              )}
            </div>
          )}
        </Section>

        {/* ── SECTION 06: SOCIETY INSIGHTS ──────────────────────────────── */}
        <Section num="06" title="Society Insights & Extras">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Builder Name</Label>
              <input type="text" name="builderName" placeholder="e.g. Prestige Group" value={formData.builderName} onChange={handleInputChange} className="dream-text-input" />
            </div>
            <div>
              <Label>Year Built</Label>
              <input type="number" name="yearBuilt" placeholder="2020" value={formData.yearBuilt} onChange={handleInputChange} className="dream-input" />
            </div>
            <div>
              <Label>Total Units</Label>
              <input type="number" name="totalUnits" placeholder="120" value={formData.totalUnits} onChange={handleInputChange} className="dream-input" />
            </div>
            <div>
              <Label>RERA Number</Label>
              <input type="text" name="reraNumber" placeholder="RERA/MH/123456" value={formData.reraNumber} onChange={handleInputChange} className="dream-text-input" />
            </div>
          </div>

          <div>
            <Label>Key Amenities</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
              {Object.entries(formData.amenities).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2 p-3 bg-neutral-800/30 border border-neutral-700 rounded-lg cursor-pointer hover:border-yellow-400/50 transition-colors">
                  <input type="checkbox" checked={value} onChange={() => handleAmenityChange(key as keyof FormData["amenities"])} className="w-4 h-4 accent-yellow-400 cursor-pointer" />
                  <span className="text-xs sm:text-sm text-neutral-300 capitalize">
                    {key === "powerBackup" ? "Power Backup" : key === "swimmingPool" ? "Swimming Pool" : key}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Additional Remarks</Label>
            <textarea name="remarks" placeholder="Architectural highlights, neighborhood info..." value={formData.remarks} onChange={handleInputChange} rows={4} className="dream-textarea" />
          </div>
        </Section>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button type="button" onClick={() => router.back()} disabled={isSubmitting}
            className="flex-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-semibold py-3 px-4 rounded-lg transition-all cursor-pointer disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-lg hover:shadow-yellow-400/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> {isEditMode ? "Saving..." : "Creating..."}</>
            ) : (
              isEditMode ? "Save Changes" : "Create Property Listing"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Tiny helper components ────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">{children}</label>;
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">{num}</div>
        <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">{title}</h2>
      </div>
      <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-4">
        {children}
      </div>
    </div>
  );
}
