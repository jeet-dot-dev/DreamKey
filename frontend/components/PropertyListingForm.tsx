"use client";

import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utlis";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveListing } from "@/lib/fileStorage";

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

  // Owner Details
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  accessType: string;

  // Source & Notes
  sourcePartner: string;
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

type ImagePreview = {
  file: File;
  preview: string;
  caption: string;
};

export default function PropertyListingForm() {
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
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
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

  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [brochuirePreview, setBrochurePreview] = useState<{ file: File; preview: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Input change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    const newFiles = Array.from(files).slice(0, 20 - imagePreviews.length);

    newFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [
            ...prev,
            {
              file,
              preview: reader.result as string,
              caption: "",
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Handle brochure upload
  const handleBrochureUpload = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const file = files[0];

    if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrochurePreview({
          file,
          preview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Update image caption
  const updateImageCaption = (index: number, caption: string) => {
    setImagePreviews((prev) => {
      const updated = [...prev];
      updated[index].caption = caption;
      return updated;
    });
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

    // Validation
    if (
      !formData.propertyType ||
      !formData.buildingName ||
      !formData.location ||
      !formData.pinCode ||
      imagePreviews.length === 0
    ) {
      toast.error("Validation Error", {
        description: "Please fill all required fields and upload at least one image.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const loadingToast = toast.loading("Saving property listing...");

      // Save listing with images
      const listingId = await saveListing(
        formData,
        imagePreviews,
        brochuirePreview
      );

      toast.dismiss(loadingToast);
      toast.success("Property listing created successfully!", {
        description: `Listing ID: ${listingId}`,
      });

      // Reset form
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
        ownerName: "",
        ownerPhone: "",
        ownerEmail: "",
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

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/stock/overview");
      }, 2000);
    } catch (error) {
      console.error("Error saving listing:", error);
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
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="sold">Sold</option>
                  <option value="upcoming">Upcoming</option>
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
                  {imagePreviews.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="relative bg-neutral-800 rounded-lg overflow-hidden aspect-square">
                        <img
                          src={img.preview}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Image caption"
                        value={img.caption}
                        onChange={(e) => updateImageCaption(index, e.target.value)}
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
                <div className="bg-neutral-800 rounded-lg p-4 flex items-center justify-between">
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

            {/* Owner Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Owner Name
                </label>
                <input
                  type="text"
                  name="ownerName"
                  placeholder="Full Legal Name"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className="dream-text-input"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="ownerPhone"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.ownerPhone}
                  onChange={handleInputChange}
                  className="dream-text-input"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="ownerEmail"
                placeholder="owner@example.com"
                value={formData.ownerEmail}
                onChange={handleInputChange}
                className="dream-text-input"
              />
            </div>
          </div>
        </div>

        {/* SECTION 06: SOURCE & PARTNERS */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              06
            </div>
            <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-tight">
              Source Partner
            </h2>
          </div>

          <div className="bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                Partner Name / Source
              </label>
              <input
                type="text"
                name="sourcePartner"
                placeholder="e.g. Internal Marketing, Partner XYZ"
                value={formData.sourcePartner}
                onChange={handleInputChange}
                className="dream-text-input"
              />
            </div>
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
