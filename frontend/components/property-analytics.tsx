'use client'

import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'

export function PropertyAnalytics() {
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
              the top 5% of properties in the region.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">
                  ₹142.5 <span className="text-2xl">Cr</span>
                </p>
                <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                  Total Portfolio Value
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
              <button className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors group">
                <span className="text-sm font-semibold">View Detailed Insights</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>
            </div>
          </div>

          {/* Right - Featured Property */}
          <div className="relative overflow-hidden rounded-2xl border border-stone-700 h-80 lg:h-96">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
              alt="The Obsidian Penthouse - Featured luxury property"
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
                The Obsidian Penthouse
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
