"use client";

import React from "react";
import { Users, UserCheck, ShieldAlert, Award, AlertTriangle } from "lucide-react";
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
import { useBrokerStats } from "@/hooks/useBrokerStats";
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

export default function BrokerOverviewPage() {
  const { stats, loading, error } = useBrokerStats();

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse text-white">
        <div>
          <Skeleton className="h-8 w-48 bg-neutral-900" />
          <Skeleton className="h-4 w-72 mt-2 bg-neutral-900" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 h-28 flex flex-col justify-between">
              <Skeleton className="h-4 w-16 bg-neutral-850" />
              <Skeleton className="h-6 w-24 bg-neutral-850" />
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
        <h2 className="text-lg font-semibold">Failed to load broker analytics</h2>
        <p className="text-sm text-neutral-400 mt-2">{error || "An unexpected error occurred."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Broker Overview</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Comprehensive statistics, active partners, and sourced inventory metrics across brokers.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Total Brokers</p>
            <Users className="h-5 w-5 text-yellow-400" />
          </div>
          <h3 className="text-3xl font-bold mt-3 text-white">{stats.total}</h3>
          <p className="text-xs text-neutral-505 mt-1.5">Registered partners</p>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Active Partners</p>
            <UserCheck className="h-5 w-5 text-green-400" />
          </div>
          <h3 className="text-3xl font-bold mt-3 text-green-400">{stats.active}</h3>
          <p className="text-xs text-neutral-505 mt-1.5">Actively sourcing</p>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Inactive Partners</p>
            <ShieldAlert className="h-5 w-5 text-neutral-450" />
          </div>
          <h3 className="text-3xl font-bold mt-3 text-white">{stats.inactive}</h3>
          <p className="text-xs text-neutral-505 mt-1.5">Dormant collaborations</p>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Blocked Partners</p>
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <h3 className="text-3xl font-bold mt-3 text-red-400">{stats.blocked}</h3>
          <p className="text-xs text-neutral-505 mt-1.5">Restricted profiles</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sourced Brokers */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-6 flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-400" />
            Top Sourcing Partners
          </h3>
          {stats.topBrokers.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-xs text-neutral-500">
              No properties sourced yet.
            </div>
          ) : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topBrokers}>
                  <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} />
                  <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Properties Sourced" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Partnership Status distribution */}
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-6 flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-400" />
            Partnership Status Distribution
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.byStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.byStatus.map((entry, index) => {
                    let color = "#737373"; // inactive
                    if (entry.name === "Active") color = "#10b981"; // Active (Green)
                    if (entry.name === "Blocked") color = "#ef4444"; // Blocked (Red)
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
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
