"use client";

import React, { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  Users,
  MapPin,
  FileText,
  Share2,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeadInteractions, type LeadInteraction } from "@/hooks/useLeadInteractions";

// Type Mapping Config
const typeConfig = {
  CALL: { icon: Phone, emoji: "📞", label: "Call", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  WHATSAPP: { icon: MessageSquare, emoji: "💬", label: "WhatsApp", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  EMAIL: { icon: Mail, emoji: "📧", label: "Email", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  MEETING: { icon: Users, emoji: "🤝", label: "Meeting", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  SITE_VISIT: { icon: MapPin, emoji: "🏢", label: "Site Visit", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  NOTE: { icon: FileText, emoji: "📝", label: "Note", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  PROPERTY_SHARED: { icon: Share2, emoji: "📤", label: "Property Shared", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" }
};

interface LeadInteractionTimelineProps {
  leadId: string;
  leadName: string;
}

// Zod schema for form validation
const formSchema = z.object({
  type: z.enum(["CALL", "WHATSAPP", "EMAIL", "MEETING", "SITE_VISIT", "NOTE", "PROPERTY_SHARED"], {
    required_error: "Interaction Type is required",
  }),
  subject: z.string().min(1, "Subject is required").max(255, "Subject cannot exceed 255 characters"),
  notes: z.string().min(1, "Notes are required"),
  followUpDate: z.string().optional().or(z.literal("")),
  outcome: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function LeadInteractionTimeline({ leadId, leadName }: LeadInteractionTimelineProps) {
  const router = useRouter();
  const { data: interactions, loading, error, refetch } = useLeadInteractions(leadId);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<LeadInteraction | null>(null);

  // Delete Modal State
  const [deletingInteraction, setDeletingInteraction] = useState<LeadInteraction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "CALL",
      subject: "",
      notes: "",
      followUpDate: "",
      outcome: "",
    },
  });

  // Open Dialog for Add
  const handleAddClick = () => {
    setEditingInteraction(null);
    reset({
      type: "CALL",
      subject: "",
      notes: "",
      followUpDate: "",
      outcome: "",
    });
    setDialogOpen(true);
  };

  // Open Dialog for Edit
  const handleEditClick = (interaction: LeadInteraction) => {
    setEditingInteraction(interaction);
    reset({
      type: interaction.type,
      subject: interaction.subject,
      notes: interaction.notes,
      followUpDate: interaction.followUpDate ? new Date(interaction.followUpDate).toISOString().split("T")[0] : "",
      outcome: interaction.outcome || "",
    });
    setDialogOpen(true);
  };

  // Form Submit (Create or Update)
  const onSubmit = async (values: FormValues) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized. Please login again.");
      router.push("/auth");
      return;
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

      let response;
      if (editingInteraction) {
        // Update endpoint
        response = await fetch(`${apiBaseUrl}/api/v1/lead-interactions/${editingInteraction.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });
      } else {
        // Create endpoint
        response = await fetch(`${apiBaseUrl}/api/v1/leads/${leadId}/interactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });
      }

      const resJson = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resJson.message || "Operation failed");
      }

      toast.success(editingInteraction ? "Interaction updated successfully" : "Interaction created successfully");
      setDialogOpen(false);
      refetch();
    } catch (err) {
      toast.error(editingInteraction ? "Failed to update interaction" : "Failed to create interaction");
    }
  };

  // Delete Action Click
  const handleDeleteClick = (interaction: LeadInteraction) => {
    setDeletingInteraction(interaction);
  };

  // Delete Confirm Action
  const handleDeleteConfirm = async () => {
    if (!deletingInteraction) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized. Please login again.");
      router.push("/auth");
      return;
    }

    setIsDeleting(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const response = await fetch(`${apiBaseUrl}/api/v1/lead-interactions/${deletingInteraction.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resJson = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resJson.message || "Failed to delete interaction");
      }

      toast.success("Interaction deleted successfully");
      setDeletingInteraction(null);
      refetch();
    } catch (err) {
      toast.error("Failed to delete interaction");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Sort Upcoming Follow-Ups
  const upcomingFollowUps = useMemo(() => {
    if (!interactions) return [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return interactions
      .filter((item) => item.followUpDate && new Date(item.followUpDate) >= now)
      .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime());
  }, [interactions]);

  return (
    <div className="space-y-6">
      {/* 1. Upcoming Follow-Ups Section */}
      {upcomingFollowUps.length > 0 && (
        <div className="rounded-3xl border border-neutral-850 bg-neutral-900/60 p-5 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.5)] backdrop-blur">
          <h3 className="text-sm uppercase tracking-wider text-yellow-400 font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Upcoming Follow-Ups
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingFollowUps.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-black/40 border border-neutral-800 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-xs text-neutral-400 truncate">
                    Lead: <span className="text-white font-medium">{leadName}</span>
                  </p>
                  <p className="text-sm font-semibold text-white mt-1 truncate">{item.subject}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-yellow-400 font-semibold uppercase tracking-wider">Follow-Up</p>
                  <p className="text-xs text-neutral-300 mt-1 font-semibold">
                    {new Date(item.followUpDate!).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Timeline Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white">Timeline Logs</h2>
          <p className="text-sm text-neutral-400 mt-1">Track communication history and customer requirements.</p>
        </div>
        <Button
          onClick={handleAddClick}
          className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Interaction
        </Button>
      </div>

      {/* 3. Skeleton Loading */}
      {loading && (
        <div className="space-y-4 pl-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex gap-4 p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40">
              <Skeleton className="h-10 w-10 rounded-full bg-neutral-800" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-1/3 bg-neutral-800" />
                <Skeleton className="h-4 w-full bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Empty State */}
      {!loading && (!interactions || interactions.length === 0) && (
        <div className="rounded-2xl border border-neutral-850 bg-neutral-900/20 p-8 text-center">
          <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
            <div className="rounded-full border border-neutral-700 bg-neutral-800/40 p-4 text-neutral-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">No interactions yet</p>
              <p className="mt-1 text-xs text-neutral-400">
                Log the first conversation, phone call, or email notes to start the customer history log.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Timeline List */}
      {!loading && interactions && interactions.length > 0 && (
        <div className="relative border-l-2 border-neutral-800 ml-4 pl-6 md:pl-8 space-y-8 py-2">
          {interactions.map((item) => {
            const config = typeConfig[item.type] || typeConfig.NOTE;
            const IconComponent = config.icon;

            return (
              <article key={item.id} className="relative group">
                {/* Badge Icon on Line */}
                <div
                  className={`absolute -left-[45px] md:-left-[53px] top-1.5 w-9 h-9 rounded-full border flex items-center justify-center text-sm z-10 bg-neutral-900 ${config.color}`}
                  title={config.label}
                >
                  <IconComponent className="w-4 h-4" />
                </div>

                {/* Log Details Card */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:border-neutral-700 transition-all shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${config.color}`}>
                          {config.label}
                        </span>
                        <p className="text-xs text-neutral-500">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <h4 className="text-base font-bold text-white mt-2 leading-snug">{item.subject}</h4>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(item)}
                        className="h-8 px-2 text-neutral-400 hover:text-white"
                        title="Edit Log"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(item)}
                        className="h-8 px-2 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete Log"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap break-words">
                    {item.notes}
                  </p>

                  {/* Outcome and Follow up display */}
                  {(item.outcome || item.followUpDate) && (
                    <div className="mt-4 pt-3 border-t border-neutral-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {item.outcome && (
                        <div className="p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800/40">
                          <p className="font-semibold text-neutral-400">Outcome</p>
                          <p className="mt-1 text-neutral-300 font-medium">{item.outcome}</p>
                        </div>
                      )}
                      {item.followUpDate && (
                        <div className="p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800/40">
                          <p className="font-semibold text-yellow-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Scheduled Follow-Up
                          </p>
                          <p className="mt-1 text-neutral-300 font-semibold">
                            {new Date(item.followUpDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 6. Add/Edit Dialog Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => !isSubmitting && setDialogOpen(false)}
          />
          <div className="relative w-full max-w-lg transform overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 p-6 text-left shadow-2xl backdrop-blur transition-all duration-300 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingInteraction ? "Edit Interaction Log" : "Log New Interaction"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDialogOpen(false)}
                className="text-neutral-400 hover:text-white"
                disabled={isSubmitting}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Type Select */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  Interaction Type <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full bg-neutral-800 border-neutral-700 text-white">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                        <SelectItem value="CALL"> Call</SelectItem>
                        <SelectItem value="WHATSAPP"> WhatsApp</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="MEETING">Meeting</SelectItem>
                        <SelectItem value="SITE_VISIT">Site Visit</SelectItem>
                        <SelectItem value="NOTE">Note</SelectItem>
                        <SelectItem value="PROPERTY_SHARED">Property Shared</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
              </div>

              {/* Subject Input */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Budget discussion, Property tour"
                  {...register("subject")}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  disabled={isSubmitting}
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
              </div>

              {/* Notes Input */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Detail notes of what was discussed..."
                  rows={4}
                  {...register("notes")}
                  className="w-full rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm p-3 outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400"
                  disabled={isSubmitting}
                />
                {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes.message}</p>}
              </div>

              {/* Outcome Input */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                  Outcome (Optional)
                </label>
                <Input
                  placeholder="e.g. Client requested callback next week"
                  {...register("outcome")}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  disabled={isSubmitting}
                />
              </div>

              {/* Follow Up Date */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-yellow-400" /> Scheduled Follow-Up (Optional)
                </label>
                <Input
                  type="date"
                  {...register("followUpDate")}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  disabled={isSubmitting}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-neutral-800 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 border-neutral-700 hover:bg-neutral-800 text-white"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Log"
                  )}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingInteraction}
        onClose={() => !isDeleting && setDeletingInteraction(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Interaction"
        message="Are you sure you want to delete this interaction? This action cannot be undone."
        loading={isDeleting}
      />
    </div>
  );
}
