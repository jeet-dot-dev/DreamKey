'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

type User = {
  id: string;
  username: string;
  email: string;
  image?: string | null;
};

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse user data in Header:", error)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    document.cookie = "token=; path=/; max-age=0"
    router.push("/auth")
  }

  const getUserInitial = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  return (
    <header className="border-b border-stone-800 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
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

          {/* User Profile and Logout Button */}
          {user && (
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                {user.image ? (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-stone-800 shrink-0">
                    <Image
                      src={user.image}
                      alt={user.username}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-base sm:text-lg shrink-0">
                    {getUserInitial()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-semibold text-white leading-none">
                    {user.username}
                  </span>
                  <span className="text-xs text-stone-400 truncate max-w-[120px] mt-1">
                    {user.email}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-stone-800 bg-stone-900/40 text-stone-300 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all text-xs sm:text-sm font-medium cursor-pointer"
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

