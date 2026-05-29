"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, Edit3, MessageSquarePlus, Search } from "lucide-react";
import { Interaction } from "../../hooks/useBrokerInteractions";

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

  const loadingRows = Array.from({ length: 5 });

  return (
    <div className="space-y-5 rounded-3xl border border-border/60 bg-card/80 p-4 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur md:p-6">
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Interaction history</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">Broker timeline</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Search calls, meetings, and follow-ups without losing the thread.
          </p>
        </div>

        <Button
          onClick={() => router.push(`/broker/interaction/add?id=${brokerId}`)}
          className="bg-amber-400 text-black hover:bg-amber-300"
        >
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          Add interaction
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search subject or notes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-border/70 bg-background/70 py-3 pl-10 pr-4 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20"
        >
          <option value="all">All types</option>
          <option value="Call">Call</option>
          <option value="Email">Email</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="In-Person">In-Person</option>
          <option value="Meeting">Meeting</option>
        </select>
      </div>

      <div className="md:hidden space-y-3">
        {loading &&
          loadingRows.map((_, index) => (
            <div key={index} className="rounded-2xl border border-border/60 bg-background/50 p-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-40 bg-muted/60" />
                <Skeleton className="h-4 w-24 bg-muted/60" />
                <Skeleton className="h-16 w-full bg-muted/60" />
                <Skeleton className="h-4 w-32 bg-muted/60" />
              </div>
            </div>
          ))}

        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-background/50 p-6 text-center">
            <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
              <div className="rounded-full border border-amber-400/30 bg-amber-400/10 p-3 text-amber-300">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground">No interactions yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add the first call or meeting to start building the broker timeline.
                </p>
              </div>
              <Button
                onClick={() => router.push(`/broker/interaction/add?id=${brokerId}`)}
                className="bg-amber-400 text-black hover:bg-amber-300"
              >
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Add first interaction
              </Button>
            </div>
          </div>
        )}

        {!loading && filtered.map((it) => (
          <article key={it.id} className="rounded-2xl border border-border/60 bg-background/50 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-base font-medium text-foreground">{it.subject}</p>
                <div className="mt-2 inline-flex rounded-full border border-border/70 bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
                  {it.communicationType}
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => router.push(`/broker/interaction/add?id=${brokerId}&interactionId=${it.id}`)}
                className="h-9 shrink-0 px-3 text-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>

            <div className="mt-3 space-y-3">
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                {it.notes}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(it.createdAt)}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-border/60 bg-background/40 md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/60 bg-muted/40 text-muted-foreground">
            <tr>
              <th className="p-4 font-medium">Subject</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Notes</th>
              <th className="p-4 font-medium">Created</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              loadingRows.map((_, index) => (
                <tr key={index} className="border-b border-border/50 last:border-b-0">
                  <td className="p-4"><Skeleton className="h-4 w-40 bg-muted/60" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-24 bg-muted/60" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-[min(100%,18rem)] bg-muted/60" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-32 bg-muted/60" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-20 bg-muted/60" /></td>
                </tr>
              ))
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center">
                  <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                    <div className="rounded-full border border-amber-400/30 bg-amber-400/10 p-3 text-amber-300">
                      <CalendarClock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-foreground">No interactions yet</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Add the first call or meeting to start building the broker timeline.
                      </p>
                    </div>
                    <Button
                      onClick={() => router.push(`/broker/interaction/add?id=${brokerId}`)}
                      className="bg-amber-400 text-black hover:bg-amber-300"
                    >
                      <MessageSquarePlus className="mr-2 h-4 w-4" />
                      Add first interaction
                    </Button>
                  </div>
                </td>
              </tr>
            )}

            {!loading && filtered.map((it) => (
              <tr key={it.id} className="border-b border-border/50 last:border-b-0 transition-colors hover:bg-muted/20">
                <td className="p-4 align-top">
                  <div className="break-words font-medium text-foreground">{it.subject}</div>
                </td>
                <td className="p-4 align-top">
                  <span className="inline-flex rounded-full border border-border/70 bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
                    {it.communicationType}
                  </span>
                </td>
                <td className="max-w-[28rem] p-4 align-top text-muted-foreground">
                  <div className="whitespace-pre-wrap break-words leading-6">
                    {it.notes}
                  </div>
                </td>
                <td className="p-4 align-top text-muted-foreground">{formatDate(it.createdAt)}</td>
                <td className="p-4 align-top">
                  <Button
                    variant="ghost"
                    onClick={() => router.push(`/broker/interaction/add?id=${brokerId}&interactionId=${it.id}`)}
                    className="h-9 px-3 text-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
