"use client";

import React from "react";
import { Users, UserCheck, ShieldAlert, Award, PieChart as PieIcon } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useOwnerStats } from "@/hooks/useOwnerStats";
import { Skeleton } from "@/components/ui/skeleton";

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-950/90 p-3 shadow-lg backdrop-blur text-xs text-white">
        <p className="font-semibold">{label || payload[0].name}</p>
        <p className="mt-1 text-yellow-400 font-medium">
          {payload[0].name}: {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

export default function OwnerOverviewPage() {
  const { stats, loading, error } = useOwnerStats();

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse text-white">
        <div>
          <Skeleton className="h-8 w-48 bg-neutral-900" />
          <Skeleton className="h-4 w-72 mt-2 bg-neutral-900" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 h-32 flex flex-col justify-between">
              <Skeleton className="h-4 w-20 bg-neutral-850" />
              <Skeleton className="h-8 w-40 bg-neutral-850" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 h-[320px]" />
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 h-[320px]" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center text-white">
        <h2 className="text-lg font-semibold">Failed to load owner analytics</h2>
        <p className="text-sm text-neutral-400 mt-2">{error || "An unexpected error occurred."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Owner Overview</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Detailed metrics, profile activities, and listing distribution across owner accounts.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex items-start gap-4">
          <div className="rounded-2xl bg-yellow-400/10 p-3 text-yellow-400 shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Total Owners</p>
            <h3 className="text-3xl font-bold mt-2 text-white">{stats.total}</h3>
            <p className="text-xs text-neutral-505 mt-1">Owner profiles registered</p>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex items-start gap-4">
          <div className="rounded-2xl bg-green-400/10 p-3 text-green-400 shrink-0">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Active Owners</p>
            <h3 className="text-3xl font-bold mt-2 text-white">{stats.active}</h3>
            <p className="text-xs text-neutral-505 mt-1">Sourcing properties actively</p>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex items-start gap-4">
          <div className="rounded-2xl bg-neutral-800 p-3 text-neutral-400 shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Inactive Owners</p>
            <h3 className="text-3xl font-bold mt-2 text-white">{stats.inactive}</h3>
            <p className="text-xs text-neutral-505 mt-1">Closed or suspended profiles</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Owner Portfolios */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-6 flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-400" />
            Top Owner Portfolios
          </h3>
          {stats.topOwners.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-xs text-neutral-500">
              No portfolios registered yet.
            </div>
          ) : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topOwners}>
                  <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} />
                  <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Properties Owned" fill="#facc15" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Owner Status distribution */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-6 flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-yellow-400" />
            Owner Status Distribution
          </h3>
          <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.byStatus.filter((s) => s.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#737373"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-neutral-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
