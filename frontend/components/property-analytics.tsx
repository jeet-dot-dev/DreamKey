import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import { useProperties } from '@/hooks/useProperties'
import Link from 'next/link'

export function PropertyAnalytics() {
  const { properties, isLoading } = useProperties({ limit: 1000 })

  // Calculate total portfolio value
  const totalPortfolioValue = properties.reduce((sum, p) => {
    if (p.askingPrice && p.availabilityStatus === 'AVAILABLE') {
      return sum + Number(p.askingPrice)
    }
    return sum
  }, 0)

  // Format values into Crores (Cr) or Lakhs (L) in Indian system
  const formatPortfolioValue = (value: number) => {
    if (value >= 10000000) {
      const crVal = value / 10000000
      return {
        val: crVal.toFixed(crVal % 1 === 0 ? 0 : 1),
        unit: 'Cr'
      }
    } else if (value >= 100000) {
      const lVal = value / 100000
      return {
        val: lVal.toFixed(lVal % 1 === 0 ? 0 : 1),
        unit: 'L'
      }
    } else {
      return {
        val: value.toLocaleString('en-IN'),
        unit: ''
      }
    }
  }

  const { val, unit } = formatPortfolioValue(totalPortfolioValue)

  // Find the featured luxury property (highest askingPrice that is AVAILABLE)
  const featuredProperty = [...properties]
    .filter(p => p.askingPrice && p.askingPrice > 0 && p.availabilityStatus === 'AVAILABLE')
    .sort((a, b) => (b.askingPrice || 0) - (a.askingPrice || 0))[0]

  const featuredTitle = featuredProperty 
    ? featuredProperty.buildingName || `Luxury Property in ${featuredProperty.location}`
    : 'The Obsidian Penthouse'

  const featuredLocation = featuredProperty
    ? featuredProperty.location
    : 'Featured Luxury Entry'

  const featuredImageUrl = (featuredProperty?.images && featuredProperty.images.length > 0)
    ? featuredProperty.images[0].url
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop'

  return (
    <section className="mt-16 border-t border-stone-800 pt-16">
      <div className="container mx-auto px-6">
        {/* Market Intelligence Header */}
        <div className="mb-8">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
            Market Intelligence
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-12">
            Premium Property Analytics
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          {/* Left Content */}
          <div className="flex flex-col gap-8">
            <p className="text-base text-stone-400 leading-relaxed max-w-xl">
              Access real-time pricing trends and neighborhood appreciation rates for
              the top properties in the region.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">
                  {isLoading ? (
                    <span className="text-stone-600">...</span>
                  ) : (
                    <>
                      ₹{val} {unit && <span className="text-2xl font-semibold text-amber-400/90">{unit}</span>}
                    </>
                  )}
                </p>
                <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                  Total Active Portfolio
                </p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold text-amber-400 mb-2 flex items-center gap-1">
                  +12.4<span className="text-2xl">%</span>
                </p>
                <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                  YOY Appreciation
                </p>
              </div>
            </div>

            {/* CTA */}
            <div>
              <Link href="/stock/overview" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors group">
                <span className="text-sm font-semibold">View Detailed Insights</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>
          </div>

          {/* Right - Featured Property */}
          <div className="relative overflow-hidden rounded-2xl border border-stone-700 h-80 lg:h-96 group/card">
            {featuredProperty ? (
              <Link href={`/stock/lists/${featuredProperty.id}`}>
                <div className="relative w-full h-full cursor-pointer overflow-hidden">
                  <Image
                    src={featuredImageUrl}
                    alt={featuredTitle}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                    priority
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />

                  {/* Property Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-xs text-amber-400 uppercase tracking-wider font-semibold mb-2">
                      Featured Luxury Sourcing {featuredProperty.askingPrice ? `• ₹${formatPortfolioValue(featuredProperty.askingPrice).val} ${formatPortfolioValue(featuredProperty.askingPrice).unit}` : ''}
                    </p>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {featuredTitle}
                    </h3>
                    <p className="text-sm text-stone-300">
                      {featuredLocation}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={featuredImageUrl}
                  alt={featuredTitle}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />

                {/* Property Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs text-amber-400 uppercase tracking-wider font-semibold mb-2">
                    Featured Entry
                  </p>
                  <h3 className="text-2xl font-bold text-white">
                    {featuredTitle}
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
