"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  Copy,
  MessageSquare,
  Check,
  Loader2,
  Building2,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProperties, type PropertyListing } from "@/hooks/useProperties";
import { toast } from "sonner";

interface SharePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
  leadPhone?: string | null;
  leadWhatsapp?: string | null;
}

const formatPrice = (value?: number | null): string => {
  if (!value) return "N/A";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
};

export default function SharePropertyModal({
  isOpen,
  onClose,
  leadId,
  leadName,
  leadPhone,
  leadWhatsapp,
}: SharePropertyModalProps) {
  const { properties, isLoading, error } = useProperties();
  const [searchTerm, setSearchTerm] = useState("");
  const [sharingProperty, setSharingProperty] = useState<PropertyListing | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Client-side search matching stock layout pattern
  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    return properties.filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        p.buildingName.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term) ||
        p.propertyType.toLowerCase().includes(term)
      );
    });
  }, [properties, searchTerm]);

  if (!isOpen) return null;

  const handleSelectProperty = async (property: PropertyListing) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized. Please log in again.");
      return;
    }

    setIsGenerating(true);
    setSharingProperty(property);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const response = await fetch(`${apiBaseUrl}/api/v1/leads/${leadId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ propertyId: property.id }),
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || "Failed to generate share link");
      }

      // Construct localized share link if window is available, otherwise use API response
      const tokenString = resJson.data.token;
      const finalLink =
        typeof window !== "undefined"
          ? `${window.location.origin}/share/${tokenString}`
          : resJson.data.link;

      setShareLink(finalLink);
      toast.success("Share link generated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to share property");
      setSharingProperty(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleOpenWhatsApp = () => {
    if (!sharingProperty) return;

    const formattedPrice = formatPrice(sharingProperty.askingPrice);
    const message = `Hi *${leadName}*,\n\nHere are the details of the property we discussed:\n\n🏢 *${sharingProperty.buildingName}*\n📍 Location: ${sharingProperty.location}\n💰 Asking Price: ${formattedPrice}\n\nYou can view the full details and images here:\n🔗 ${shareLink}\n\nLet me know if you would like to schedule a visit!`;

    const targetNumber = leadWhatsapp || leadPhone || "";
    let cleaned = targetNumber.replace(/\D/g, "");
    if (cleaned.length === 10) {
      cleaned = "91" + cleaned;
    }

    const waUrl = cleaned
      ? `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");
  };

  const handleReset = () => {
    setSharingProperty(null);
    setShareLink("");
    setSearchTerm("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg transform overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 p-6 text-left shadow-2xl backdrop-blur transition-all duration-300 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4 shrink-0">
          <h3 className="text-xl font-bold text-white">Share Property with Lead</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {!sharingProperty ? (
          <>
            {/* Search Input */}
            <div className="relative mb-4 shrink-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search properties by building, location..."
                className="border-neutral-700 bg-black/60 pl-10 text-white placeholder:text-neutral-500 w-full"
              />
            </div>

            {/* Properties List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px] max-h-[50vh]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
                  <p className="text-neutral-400 text-sm mt-3">Loading properties...</p>
                </div>
              ) : error ? (
                <p className="text-red-400 text-sm text-center py-8">{error}</p>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-neutral-700" />
                  <p className="text-sm">No properties found</p>
                </div>
              ) : (
                filteredProperties.map((property) => (
                  <div
                    key={property.id}
                    onClick={() => handleSelectProperty(property)}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-neutral-850 hover:border-neutral-700 bg-black/20 hover:bg-black/40 transition-all cursor-pointer group"
                  >
                    {/* Thumbnail */}
                    {property.images?.[0]?.url ? (
                      <img
                        src={property.images[0].url}
                        alt={property.buildingName}
                        className="h-12 w-16 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-16 rounded-lg border border-neutral-800 bg-neutral-900 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-neutral-600" />
                      </div>
                    )}
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm truncate group-hover:text-yellow-400 transition-colors">
                        {property.buildingName}
                      </h4>
                      <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="h-3 w-3 text-neutral-500" />
                        {property.location}
                      </p>
                    </div>
                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-yellow-400">
                        {formatPrice(property.askingPrice)}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        {property.propertyType}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-16 flex-1">
                <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
                <p className="text-white font-medium mt-4">Generating secure share link...</p>
              </div>
            ) : (
              <div className="space-y-6 py-2">
                {/* Property Brief */}
                <div className="p-4 rounded-2xl bg-neutral-950/40 border border-neutral-850 flex items-center gap-3">
                  {sharingProperty.images?.[0]?.url ? (
                    <img
                      src={sharingProperty.images[0].url}
                      alt={sharingProperty.buildingName}
                      className="h-14 w-20 object-cover rounded-lg border border-neutral-800"
                    />
                  ) : (
                    <div className="h-14 w-20 rounded-lg border border-neutral-800 bg-neutral-900 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-neutral-600" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-white text-base">
                      {sharingProperty.buildingName}
                    </h4>
                    <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                      {sharingProperty.location}
                    </p>
                    <p className="text-xs font-bold text-yellow-400 mt-1">
                      {formatPrice(sharingProperty.askingPrice)}
                    </p>
                  </div>
                </div>

                {/* Generated Link Display */}
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                    Public Share Link
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-black/40 border border-neutral-850 rounded-xl px-3 py-2.5 text-sm text-neutral-300 font-mono select-all truncate">
                      {shareLink}
                    </div>
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="border-neutral-700 hover:bg-neutral-800 text-white shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Quick Share Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Button
                    onClick={handleOpenWhatsApp}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 py-5 rounded-xl transition-all"
                  >
                    <MessageSquare className="w-5 h-5 fill-current" />
                    Share on WhatsApp
                  </Button>
                  <Button
                    onClick={() => window.open(shareLink, "_blank")}
                    variant="outline"
                    className="border-neutral-700 hover:bg-neutral-800 text-white font-semibold flex items-center justify-center gap-2 py-5 rounded-xl transition-all"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Preview Share Page
                  </Button>
                </div>

                {/* Reset button to select another */}
                <div className="flex justify-end pt-4 border-t border-neutral-800">
                  <Button
                    onClick={handleReset}
                    variant="ghost"
                    className="text-neutral-400 hover:text-white"
                  >
                    Select Another Property
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
