'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface ModuleCardProps {
  icon: React.ReactNode
  title: string
  description: string
  stat: string
  statLabel: string
  statColor?: 'gold' | 'default'
  onClick?: () => void
  href?: string
}

export function ModuleCard({
  icon,
  title,
  description,
  stat,
  statLabel,
  statColor = 'default',
  onClick,
  href,
}: ModuleCardProps) {
  const router = useRouter()
  const isComingSoon = stat.toUpperCase() === 'COMING SOON'

  const handleClick = () => {
    if (isComingSoon) {
      toast.info(`${title} module is coming soon!`)
      return
    }
    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    }
  }

  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer relative overflow-hidden rounded-xl border border-stone-700 bg-stone-900/50 p-6 backdrop-blur-sm transition-all hover:border-amber-500/50 hover:bg-stone-800/70"
    >
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-amber-500/0 to-amber-500/0 transition-all duration-300 group-hover:from-amber-500/5 group-hover:to-amber-500/0" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Icon */}
        <div className="h-12 w-12 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400">
          {icon}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 grow">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-sm text-stone-400">{description}</p>
        </div>

        {/* Stat and Arrow */}
        <div className="flex items-end justify-between pt-2">
          <div>
            <p
              className={`text-sm font-semibold ${
                statColor === 'gold' ? 'text-amber-400' : 'text-amber-500'
              }`}
            >
              {stat}
            </p>
            <p className="text-xs text-stone-500 uppercase tracking-wider">
              {statLabel}
            </p>
          </div>
          {!isComingSoon && (
            <ArrowRight className="h-5 w-5 text-amber-400 transition-transform group-hover:translate-x-1" />
          )}
        </div>
      </div>
    </div>
  )
}
