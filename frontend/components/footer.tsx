'use client'

export function Footer() {
  return (
    <footer className="border-t border-stone-800 bg-black/20 mt-20 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-3">
          <p className="text-lg font-semibold text-amber-400">DreamKey</p>
          <p className="text-xs text-stone-500 uppercase tracking-wider">
            Enterprise Management Suite • © 2023
          </p>
        </div>
      </div>
    </footer>
  )
}
