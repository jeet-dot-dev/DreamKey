'use client'

import Image from 'next/image'

export function Header() {
  return (
    <header className="border-b border-stone-800 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
              <Image
                src="/logoicon.png"
                alt="DreamKey Logo"
                width={40}
                height={40}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white leading-none">
                DreamKey
              </span>
              <span className="text-xs text-amber-400 font-medium">Portal</span>
            </div>
          </div>

          {/* Navigation - Hidden on mobile
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#"
              className="text-sm text-stone-300 hover:text-amber-400 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-sm text-stone-300 hover:text-amber-400 transition-colors"
            >
              Analytics
            </a>
            <a
              href="#"
              className="text-sm text-stone-300 hover:text-amber-400 transition-colors"
            >
              Reports
            </a>
          </nav> */}

 
          {/* <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-stone-300">Hi, Mainak</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-lg">
              M
            </div>
          </div> */}
        </div>
      </div>
    </header>
  )
}
