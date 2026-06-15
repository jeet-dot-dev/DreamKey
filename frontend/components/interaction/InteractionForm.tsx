"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Interaction } from "../../hooks/useBrokerInteractions";

type Props = {
  brokerId?: string;
  interactionId?: string | null;
  onSaved?: () => void;
};

const communicationOptions = ["Call", "Email", "WhatsApp", "In-Person", "Meeting"];
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

export default function InteractionForm({ brokerId, interactionId, onSaved }: Props) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [communicationType, setCommunicationType] = useState<string>(communicationOptions[0]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!interactionId) return;
      setInitialLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiBaseUrl}/api/v1/broker/interaction/${interactionId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error(`Failed to load interaction (${res.status})`);
        const payload = await res.json();
        const obj: Interaction = payload.data ?? payload;
        setSubject(obj.subject ?? "");
        setNotes(obj.notes ?? "");
        setCommunicationType(obj.communicationType ?? communicationOptions[0]);
      } catch (err: any) {
        const message = err?.message ?? String(err);
        setError(message);
        toast.error("Unable to load interaction", {
          description: message,
        });
      } finally {
        setInitialLoading(false);
      }
    }
    load();
  }, [interactionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerId) {
      toast.error("Broker missing", {
        description: "Open the interaction screen from a broker record so it can be linked correctly.",
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please sign in again", {
          description: "Your session is missing. Sign in to create or update interactions.",
        });
        router.push("/auth");
        return;
      }

      const payload = { brokerId, subject, notes, communicationType };
      const loadingToast = toast.loading(interactionId ? "Updating interaction..." : "Saving interaction...");
      let res: Response;
      if (interactionId) {
        res = await fetch(`${apiBaseUrl}/api/v1/broker/interaction/${interactionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${apiBaseUrl}/api/v1/broker/interaction`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }
      const responseText = await res.text();
      const responseJson = responseText ? JSON.parse(responseText) : {};
      if (!res.ok) throw new Error(responseJson?.message || `${res.status} ${res.statusText}`);

      toast.success(interactionId ? "Interaction updated" : "Interaction created", {
        id: loadingToast,
        description: interactionId
          ? "The broker timeline was updated successfully."
          : "The new interaction is now part of the broker history.",
      });
      onSaved?.();
      // go back to listing
      router.push(`/broker/interaction?id=${brokerId}`);
    } catch (err: any) {
      const message = err?.message ?? String(err);
      setError(message);
      toast.error(interactionId ? "Failed to update interaction" : "Failed to create interaction", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur">
        <div className="space-y-3">
          <Skeleton className="h-8 w-56 bg-muted/60" />
          <Skeleton className="h-4 w-80 bg-muted/60" />
        </div>
        <div className="mt-8 space-y-5">
          <Skeleton className="h-12 w-full bg-muted/60" />
          <Skeleton className="h-12 w-full bg-muted/60" />
          <Skeleton className="h-40 w-full bg-muted/60" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-36 bg-muted/60" />
            <Skeleton className="h-11 w-28 bg-muted/60" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur">
      <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Broker Timeline</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            {interactionId ? "Edit interaction" : "Add interaction"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Capture the call, meeting, or follow-up detail in one place.
          </p>
        </div>
        <div className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
          {interactionId ? "Editing" : "New entry"}
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20"
            placeholder="Example: Follow-up on site visit"
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Communication Type</label>
          <select
            value={communicationType}
            onChange={(e) => setCommunicationType(e.target.value)}
            className="w-full rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20"
            disabled={loading}
          >
            {communicationOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[180px] w-full rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20"
            rows={6}
            placeholder="Summarize context, next step, and anything worth remembering."
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="bg-amber-400 text-black hover:bg-amber-300"
        >
          {loading ? (interactionId ? "Saving..." : "Creating...") : interactionId ? "Save interaction" : "Create interaction"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/broker/interaction?id=${brokerId}`)}
          disabled={loading}
          className="border-border/70 bg-background/70 hover:bg-muted/60"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
