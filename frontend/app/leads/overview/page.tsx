"use client";

import React from "react";
import { Building2, Users, IndianRupee, Key, TrendingUp, Award, Activity } from "lucide-react";
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
import { useOwnerStats } from "@/hooks/useOwnerStats";
import { useBrokerStats } from "@/hooks/useBrokerStats";
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
    if (value >= 100_000) return `₹${(value / 100_055).toFixed(2)} L`;
    return `₹${value.toLocaleString("en-IN")}`;
};

const COLORS = ["#facc15", "#a78bfa", "#22d3ee", "#fb7185", "#34d399", "#fb923c", "#f472b6"];

export default function OverviewPage() {
    const { stats: propStats, loading: propLoading } = usePropertyStats();
    const { stats: ownerStats, loading: ownerLoading } = useOwnerStats();
    const { stats: brokerStats, loading: brokerLoading } = useBrokerStats();

    const loading = propLoading || ownerLoading || brokerLoading;

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse text-white">
                <div>
                    <Skeleton className="h-8 w-48 bg-neutral-850" />
                    <Skeleton className="h-4 w-72 mt-2 bg-neutral-850" />
                </div>

                {/* Property Section Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32 bg-neutral-850" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 h-32 flex flex-col justify-between">
                            <Skeleton className="h-4 w-20 bg-neutral-850" />
                            <Skeleton className="h-8 w-40 bg-neutral-850" />
                        </div>
                        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 h-32 flex flex-col justify-between">
                            <Skeleton className="h-4 w-20 bg-neutral-850" />
                            <Skeleton className="h-8 w-40 bg-neutral-850" />
                        </div>
                        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 h-32 flex flex-col justify-between">
                            <Skeleton className="h-4 w-20 bg-neutral-850" />
                            <Skeleton className="h-8 w-40 bg-neutral-850" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 h-[320px]" />
                        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 h-[320px]" />
                    </div>
                </div>

                {/* Owner Section Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32 bg-neutral-850" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 h-[320px]" />
                        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 h-[320px]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 text-white">
            {/* Top Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Overview & Analytics</h1>
                <p className="text-sm text-neutral-400 mt-1">
                    Detailed metrics across properties, owner profiles, and brokers.
                </p>
            </div>

            {/* ==================== 1. PROPERTY ANALYTICS ==================== */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                    <Building2 className="h-5 w-5 text-yellow-400" />
                    <h2 className="text-xl font-semibold">Property Performance</h2>
                </div>

                {propStats && (
                    <>
                        {/* Property Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex items-start gap-4">
                                <div className="rounded-2xl bg-yellow-400/10 p-3 text-yellow-400 shrink-0">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Total Listings</p>
                                    <h3 className="text-3xl font-bold mt-2 text-white">{propStats.total}</h3>
                                    <p className="text-xs text-neutral-500 mt-1">Registered units</p>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex items-start gap-4">
                                <div className="rounded-2xl bg-yellow-400/10 p-3 text-yellow-400 shrink-0">
                                    <IndianRupee className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Average Price</p>
                                    <h3 className="text-2xl font-bold mt-2.5 text-white">{formatPrice(propStats.avgPrice)}</h3>
                                    <p className="text-xs text-neutral-500 mt-1">Average asking valuation</p>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex items-start gap-4">
                                <div className="rounded-2xl bg-yellow-400/10 p-3 text-yellow-400 shrink-0">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Portfolio Value</p>
                                    <h3 className="text-2xl font-bold mt-2.5 text-white">{formatPrice(propStats.totalValue)}</h3>
                                    <p className="text-xs text-neutral-500 mt-1">Total listings asking valuation</p>
                                </div>
                            </div>
                        </div>

                        {/* Property Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Property Types */}
                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-450 mb-6">Property Types</h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={propStats.byType.filter((t) => t.value > 0)}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {propStats.byType.map((entry, index) => (
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

                            {/* Monthly Listing Additions */}
                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-450 mb-6">Listing Timeline</h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={propStats.historyData}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} />
                                            <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="count" name="Properties" stroke="#facc15" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {/* ==================== 2. OWNER ANALYTICS ==================== */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                    <Users className="h-5 w-5 text-yellow-400" />
                    <h2 className="text-xl font-semibold">Owner Portfolios</h2>
                </div>

                {ownerStats && (
                    <>
                        {/* Owner Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex items-start gap-4">
                                <div className="rounded-2xl bg-yellow-400/10 p-3 text-yellow-400 shrink-0">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Total Owners</p>
                                    <h3 className="text-3xl font-bold mt-2 text-white">{ownerStats.total}</h3>
                                    <p className="text-xs text-neutral-500 mt-1">Owner profiles</p>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex items-start gap-4">
                                <div className="rounded-2xl bg-green-400/10 p-3 text-green-400 shrink-0">
                                    <Activity className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Active Profiles</p>
                                    <h3 className="text-3xl font-bold mt-2 text-white">{ownerStats.active}</h3>
                                    <p className="text-xs text-neutral-500 mt-1">Currently active owners</p>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex items-start gap-4">
                                <div className="rounded-2xl bg-neutral-800 p-3 text-neutral-400 shrink-0">
                                    <Activity className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Inactive Profiles</p>
                                    <h3 className="text-3xl font-bold mt-2 text-white">{ownerStats.inactive}</h3>
                                    <p className="text-xs text-neutral-500 mt-1">Archived/Inactive owners</p>
                                </div>
                            </div>
                        </div>

                        {/* Owner Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Owners Portfolio Sizes */}
                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-450 mb-6">Top Owner Portfolios</h3>
                                {ownerStats.topOwners.length === 0 ? (
                                    <div className="flex h-[200px] items-center justify-center text-xs text-neutral-500">
                                        No properties owned yet.
                                    </div>
                                ) : (
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={ownerStats.topOwners}>
                                                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} />
                                                <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="count" name="Properties Owned" fill="#facc15" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            {/* Owner Status Distribution */}
                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-450 mb-6">Owner Activity Distribution</h3>
                                    <div className="h-[200px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={ownerStats.byStatus.filter((s) => s.value > 0)}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={0}
                                                    outerRadius={70}
                                                    labelLine={false}
                                                    dataKey="value"
                                                >
                                                    {ownerStats.byStatus.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#737373"} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend
                                                    verticalAlign="bottom"
                                                    iconType="rect"
                                                    formatter={(value) => <span className="text-xs text-neutral-400">{value}</span>}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {/* ==================== 3. BROKER ANALYTICS ==================== */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                    <Award className="h-5 w-5 text-yellow-400" />
                    <h2 className="text-xl font-semibold">Broker Partnerships</h2>
                </div>

                {brokerStats && (
                    <>
                        {/* Broker Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
                                <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Total Brokers</p>
                                <h3 className="text-3xl font-bold mt-2 text-white">{brokerStats.total}</h3>
                                <p className="text-xs text-neutral-500 mt-1">Partnership pool</p>
                            </div>

                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
                                <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Active Partners</p>
                                <h3 className="text-3xl font-bold mt-2 text-green-400">{brokerStats.active}</h3>
                                <p className="text-xs text-neutral-500 mt-1">Operational brokers</p>
                            </div>

                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
                                <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Inactive Partners</p>
                                <h3 className="text-3xl font-bold mt-2 text-neutral-400">{brokerStats.inactive}</h3>
                                <p className="text-xs text-neutral-500 mt-1">Dormant partnerships</p>
                            </div>

                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
                                <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Blocked Partners</p>
                                <h3 className="text-3xl font-bold mt-2 text-red-400">{brokerStats.blocked}</h3>
                                <p className="text-xs text-neutral-500 mt-1">Restricted access</p>
                            </div>
                        </div>

                        {/* Broker Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Top Sourcing Brokers */}
                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-450 mb-6">Top Sourcing Partners</h3>
                                {brokerStats.topBrokers.length === 0 ? (
                                    <div className="flex h-[200px] items-center justify-center text-xs text-neutral-500">
                                        No properties sourced yet.
                                    </div>
                                ) : (
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={brokerStats.topBrokers}>
                                                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} />
                                                <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="count" name="Properties Sourced" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            {/* Status breakdown chart */}
                            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-450 mb-6">Partnership Status distribution</h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={brokerStats.byStatus}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {brokerStats.byStatus.map((entry, index) => {
                                                    let color = "#737373"; // inactive
                                                    if (entry.name === "Active") color = "#10b981";
                                                    if (entry.name === "Blocked") color = "#ef4444";
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
                    </>
                )}
            </section>
        </div>
    );
}
