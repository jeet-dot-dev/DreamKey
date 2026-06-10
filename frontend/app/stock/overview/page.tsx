"use client";

import React from "react";
import { Building2, IndianRupee, TrendingUp, Calendar, LayoutGrid, CheckCircle } from "lucide-react";
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
  AreaChart,
  Area,
} from "recharts";
import { usePropertyStats } from "@/hooks/usePropertyStats";
import { Skeleton } from "@/components/ui/skeleton";

// Custom Tooltip component for Recharts
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-950/90 p-3 shadow-lg backdrop-blur text-xs">
        <p className="font-semibold text-white">{label || payload[0].name}</p>
        <p className="mt-1 text-yellow-400 font-medium">
          {payload[0].name}: {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

const formatPrice = (value: number) => {
  if (!value) return "₹0";
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)} Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(2)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
};

const COLORS = ["#facc15", "#a78bfa", "#22d3ee", "#fb7185", "#34d399"];

export default function StockOverviewPage() {
  const { stats, loading, error } = usePropertyStats();

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
        <h2 className="text-lg font-semibold">Failed to load stock analytics</h2>
        <p className="text-sm text-neutral-400 mt-2">{error || "An unexpected error occurred."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Overview</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Real-time metrics, valuation insights, and category distributions for all properties.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex items-start gap-4">
          <div className="rounded-2xl bg-yellow-400/10 p-3 text-yellow-400 shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Total Listings</p>
            <h3 className="text-3xl font-bold mt-2 text-white">{stats.total}</h3>
            <p className="text-xs text-neutral-505 mt-1">Properties in repository</p>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex items-start gap-4">
          <div className="rounded-2xl bg-yellow-400/10 p-3 text-yellow-400 shrink-0">
            <IndianRupee className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Average Price</p>
            <h3 className="text-2xl font-bold mt-2.5 text-white">{formatPrice(stats.avgPrice)}</h3>
            <p className="text-xs text-neutral-505 mt-1">Average asking valuation</p>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex items-start gap-4">
          <div className="rounded-2xl bg-yellow-400/10 p-3 text-yellow-400 shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Total Stock Value</p>
            <h3 className="text-2xl font-bold mt-2.5 text-white">{formatPrice(stats.totalValue)}</h3>
            <p className="text-xs text-neutral-505 mt-1">Combined valuation of listings</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Types */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-6 flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-yellow-400" />
            Property Type Distribution
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.byType.filter((t) => t.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.byType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

        {/* Listing Additions Timeline */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-6 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-yellow-400" />
            Listing Additions Timeline
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.historyData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Listing(s)" stroke="#facc15" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Listing Status Breakdown */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-6 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-yellow-400" />
            Valuation Status Grouping
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byStatus}>
                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Valuation Count" fill="#facc15" radius={[4, 4, 0, 0]}>
                  {stats.byStatus.map((entry, index) => {
                    let color = "#10b981"; // AVAILABLE (Green)
                    if (entry.name === "Rented") color = "#3b82f6"; // Blue
                    if (entry.name === "Sold") color = "#ef4444"; // Red
                    if (entry.name === "Upcoming") color = "#eab308"; // Yellow
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
