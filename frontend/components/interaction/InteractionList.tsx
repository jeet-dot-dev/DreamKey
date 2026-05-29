"use client";
import React, { useMemo, useState } from "react";
import { Interaction } from "../../hooks/useBrokerInteractions";
import { useRouter } from "next/navigation";

type Props = {
  brokerId?: string;
  interactions?: Interaction[] | null;
  loading?: boolean;
};

const formatDate = (d?: string) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
};

export default function InteractionList({ brokerId, interactions, loading }: Props) {
  const router = useRouter();
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    if (!interactions) return [];
    return interactions.filter((it) => {
      if (filterType !== "all" && it.communicationType !== filterType) return false;
      if (search && !it.subject.toLowerCase().includes(search.toLowerCase()) && !it.notes.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [interactions, filterType, search]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          className="btn btn-primary"
          onClick={() => router.push(`/broker/interaction/add?id=${brokerId}`)}
        >
          + Add Interaction
        </button>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-2 py-1 border rounded">
          <option value="all">All</option>
          <option value="Call">Call</option>
          <option value="Email">Email</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="In-Person">In-Person</option>
          <option value="Meeting">Meeting</option>
        </select>

        <input
          placeholder="Search subject or notes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-2 py-1 border rounded flex-1"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Subject</th>
              <th className="p-3">Type</th>
              <th className="p-3">Notes</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-4 text-center">Loading...</td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center">No interactions found</td>
              </tr>
            )}

            {!loading && filtered.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-3 align-top">{it.subject}</td>
                <td className="p-3 align-top">{it.communicationType}</td>
                <td className="p-3 align-top">{it.notes}</td>
                <td className="p-3 align-top">{formatDate(it.createdAt)}</td>
                <td className="p-3 align-top">
                  <button
                    className="text-sm text-blue-600"
                    onClick={() => router.push(`/broker/interaction/add?id=${brokerId}&interactionId=${it.id}`)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
