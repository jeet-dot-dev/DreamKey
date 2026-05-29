"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Interaction } from "../../hooks/useBrokerInteractions";

type Props = {
  brokerId?: string;
  interactionId?: string | null;
  onSaved?: () => void;
};

const communicationOptions = ["Call", "Email", "WhatsApp", "In-Person", "Meeting"];

export default function InteractionForm({ brokerId, interactionId, onSaved }: Props) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [communicationType, setCommunicationType] = useState<string>(communicationOptions[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!interactionId) return;
      try {
        const res = await fetch(`/broker/interaction/${interactionId}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const payload = await res.json();
        const obj: Interaction = payload.data ?? payload;
        setSubject(obj.subject ?? "");
        setNotes(obj.notes ?? "");
        setCommunicationType(obj.communicationType ?? communicationOptions[0]);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [interactionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { brokerId, subject, notes, communicationType };
      let res: Response;
      if (interactionId) {
        res = await fetch(`/broker/interaction/${interactionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/broker/interaction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      onSaved?.();
      // go back to listing
      router.push(`/broker/interaction?id=${brokerId}`);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-2xl">
      <div className="mb-3">
        <label className="block mb-1 font-medium">Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 border rounded" />
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-medium">Communication Type</label>
        <select value={communicationType} onChange={(e) => setCommunicationType(e.target.value)} className="w-full px-3 py-2 border rounded">
          {communicationOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="block mb-1 font-medium">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 border rounded" rows={6} />
      </div>

      {error && <div className="text-red-600 mb-2">{error}</div>}

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {interactionId ? "Save" : "Create"}
        </button>

        <button type="button" className="btn" onClick={() => router.push(`/broker/interaction?id=${brokerId}`)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
