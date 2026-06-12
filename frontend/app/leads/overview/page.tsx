"use client";

import React from "react";
import { Users, IndianRupee, Key, TrendingUp, Award, Activity, Calendar } from "lucide-react";
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
import { useLeadsStats } from "@/hooks/useLeadsStats";
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

// Utility to format price
const formatPrice = (value: number) => {
    if (!value) return "₹0";
    if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)} Cr`;
    if (value >= 100_000) return `₹${(value / 100_000).toFixed(2)} L`;
    return `₹${value.toLocaleString("en-IN")}`;
};

const COLORS = ["#facc15", "#a78bfa", "#22d3ee", "#fb7185", "#34d399", "#fb923c", "#f472b6"];

export default function LeadsOverviewPage() {
    const { stats: leadStats, loading, error } = useLeadsStats();

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse text-white">
                <div>
                    <Skeleton className="h-8 w-48 bg-neutral-850" />
                    <Skeleton className="h-4 w-72 mt-2 bg-neutral-850" />
                </div>

                {/* Stat Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 h-32 flex flex-col justify-between">
                            <Skeleton className="h-4 w-20 bg-neutral-850" />
                            <Skeleton className="h-8 w-40 bg-neutral-850" />
                        </div>
                    ))}
                </div>

                {/* Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 h-[320px]" />
                    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 h-[320px]" />
                </div>
            </div>
        );
    }

    if (error || !leadStats) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <h3 className="text-xl font-bold">Failed to load leads analytics</h3>
                <p className="text-neutral-400 text-sm mt-2">{error || "Something went wrong"}</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 text-white">
            {/* Top Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Leads Overview & Analytics</h1>
                <p className="text-sm text-neutral-400 mt-1">
                    Detailed metrics across customer interest levels, statuses, budgets, and registration timelines.
                </p>
            </div>

            {/* Leads Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex items-start gap-4">
                    <div className="rounded-2xl bg-yellow-400/10 p-3 text-yellow-400 shrink-0">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Total Leads</p>
                        <h3 className="text-3xl font-bold mt-2 text-white">{leadStats.total}</h3>
                        <p className="text-xs text-neutral-500 mt-1">Active customer profiles</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex items-start gap-4">
                    <div className="rounded-2xl bg-yellow-400/10 p-3 text-yellow-400 shrink-0">
                        <IndianRupee className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Avg Min Budget</p>
                        <h3 className="text-2xl font-bold mt-2.5 text-white">{formatPrice(leadStats.avgBudgetMin)}</h3>
                        <p className="text-xs text-neutral-500 mt-1">Average starting preferences</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex items-start gap-4">
                    <div className="rounded-2xl bg-yellow-400/10 p-3 text-yellow-400 shrink-0">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Avg Max Budget</p>
                        <h3 className="text-2xl font-bold mt-2.5 text-white">{formatPrice(leadStats.avgBudgetMax)}</h3>
                        <p className="text-xs text-neutral-500 mt-1">Average ceiling preferences</p>
                    </div>
                </div>
            </div>

            {/* Row 1: Status & Registration Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Status Distribution */}
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-6 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-yellow-400" />
                            Lead Status Distribution
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={leadStats.byStatus.filter((t) => t.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {leadStats.byStatus.map((entry, index) => (
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
                </div>

                {/* Lead Timeline Acquisitions */}
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-6 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-yellow-400" />
                        Acquisition Timeline (Last 6 Months)
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={leadStats.historyData}>
                                <defs>
                                    <linearGradient id="colorCountLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} />
                                <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="count" name="Incoming Leads" stroke="#facc15" strokeWidth={2} fillOpacity={1} fill="url(#colorCountLeads)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 2: Priority & Preferred Property Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Priority Levels */}
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-6">Interest Priority Levels</h3>
                    {leadStats.byPriority.filter(p => p.value > 0).length === 0 ? (
                        <div className="flex h-[250px] items-center justify-center text-xs text-neutral-500">
                            No priority details recorded.
                        </div>
                    ) : (
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={leadStats.byPriority}>
                                    <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} />
                                    <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" name="Leads" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Preferred Property Types */}
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-6">Preferred Property Types</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={leadStats.byType.filter((t) => t.value > 0)}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={0}
                                    outerRadius={80}
                                    dataKey="value"
                                >
                                    {leadStats.byType.map((entry, index) => (
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
            </div>

            {/* Row 3: Lead Sourcing Channels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-6">Lead Sourcing Channels</h3>
                    {leadStats.bySource.filter(s => s.value > 0).length === 0 ? (
                        <div className="flex h-[250px] items-center justify-center text-xs text-neutral-500">
                            No sources recorded.
                        </div>
                    ) : (
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={leadStats.bySource}>
                                    <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} />
                                    <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" name="Leads Sourced" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Extra import clean up helper to prevent TS unused variable warnings if any imports are missing
import { AlertCircle } from "lucide-react";
