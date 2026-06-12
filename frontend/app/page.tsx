'use client'

import { Calendar, Package, Users, AlertCircle, CheckSquare, CreditCard } from 'lucide-react'
import { Header } from '@/components/header'
import { ModuleCard } from '@/components/module-card'
import { PropertyAnalytics } from '@/components/property-analytics'
import { Footer } from '@/components/footer'
import { useProperties } from '@/hooks/useProperties'
import { useBrokers } from '@/hooks/useBrokers'
import { useOwners } from '@/hooks/useOwners'
import { useLeads } from '@/hooks/useLeads'

export default function Dashboard() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const { properties, isLoading: loadingProperties } = useProperties({ limit: 1000 })
  const { brokers, isLoading: loadingBrokers } = useBrokers()
  const { owners, loading: loadingOwners } = useOwners()
  const { leads, isLoading: loadingLeads } = useLeads()

  const modules = [
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Stock Management',
      description: 'Centralized repository for high-value properties and portfolio assets.',
      stat: loadingProperties ? 'LOADING...' : `${properties.length.toLocaleString()} UNITS`,
      statLabel: 'Units',
      varience: "stock",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Broker Directory',
      description: 'Manage professional relationships and partnership commission structures.',
      stat: loadingBrokers ? 'LOADING...' : `${brokers.filter(b => b.status === 'ACTIVE').length.toLocaleString()} ACTIVE PARTNERS`,
      statLabel: 'Partners',
      varience: "broker",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Owner Directory',
      description: 'Detailed profiles of high-net-worth property owners and investors.',
      stat: loadingOwners ? 'LOADING...' : `${(owners?.length ?? 0).toLocaleString()} PROFILES`,
      statLabel: 'Profiles',
      varience: "owner",
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: 'Leads',
      description: 'Automated reminder system for client nurturing and deal closures.',
      stat: loadingLeads ? 'LOADING...' : `${leads.filter(l => l.status !== 'CLOSED' && l.status !== 'LOST').length.toLocaleString()} PENDING`,
      statLabel: 'Leads',
      statColor: 'gold' as const,
      varience: "leads",
    },
    {
      icon: <CheckSquare className="w-6 h-6" />,
      title: 'Tasks',
      description: 'Operational task management and property site visit coordination.',
      stat: 'COMING SOON',
      statLabel: 'Status',
      varience: "task",
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Finance',
      description: 'Revenue tracking, commission payouts, and digital escrow management.',
      stat: 'COMING SOON',
      statLabel: 'Status',
      statColor: 'gold' as const,
      varience: "finance",
    },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-stone-950 to-black">
      <Header />

      <main className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
            Internal Portal
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Digital Estate
            Management
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-stone-400">
              <Calendar className="w-5 h-5" />
              <time className="text-sm">{today}</time>
            </div>
            <button className="px-6 py-2 rounded-lg bg-stone-800 text-stone-200 text-sm font-medium hover:bg-stone-700 transition-colors border border-stone-700 hover:border-stone-600 w-fit">
              Quick Actions
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {modules.map((module, idx) => (
            <ModuleCard
              key={idx}
              icon={module.icon}
              title={module.title}
              description={module.description}
              stat={module.stat}
              statLabel={module.statLabel}
              statColor={module.statColor}
              href={`/${module.varience}`}
            />
          ))}
        </div>
      </main>

      <PropertyAnalytics />

      <Footer />
    </div>
  )
}
