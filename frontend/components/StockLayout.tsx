"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  LayoutDashboard,
  Archive,
  ListCheck,
  Star,
  Menu,
  X,
  Bell,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utlis";
import { useRouter, usePathname } from "next/navigation";

type StockLayoutProps = {
  children: React.ReactNode;
  variant?: "broker" | "stock";
};

type User = {
  id: string;
  username: string;
  email: string;
  image?: string | null;
  phone?: string;
};

export default function StockLayout({ children, variant = "stock" }: StockLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/auth");
  };

  const getUserInitial = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  const getActiveItem = () => {
    if (pathname.includes("/overview")) return "overview";
    if (pathname.includes("/lists")) return "lists";
    if (pathname.includes("/archives")) return "archives";
    if (pathname.includes("/favorites")) return "favorites";
    return "overview";
  };

  const activeItem = getActiveItem();

  const navItems = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      id: "overview",
      href: `/${variant}/overview`,
    },
    { label: "Lists", icon: ListCheck, id: "lists", href: `/${variant}/lists` },
    {
      label: "Archives",
      icon: Archive,
      id: "archives",
      href: `/${variant}/archives`,
    },
    {
      label: "Favorites",
      icon: Star,
      id: "favorites",
      href: `/${variant}/favorites`,
    },
   
  ];

  return (
    <div className="dark min-h-screen bg-black">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Mobile Menu Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed top-4 right-4 z-50 p-2 hover:bg-neutral-800 rounded-md transition-colors text-yellow-400 cursor-pointer"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {/* Sidebar */}
        <aside
          className={cn(
            "bg-black border-r border-neutral-800 transition-all duration-300 ease-in-out",
            "flex flex-col w-64 py-8 px-6",
            "fixed md:static inset-y-0 left-0 z-40 md:z-auto",
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0",
          )}
        >
          {/* Header Section */}
          <div className="mb-12 mt-12 md:mt-0">
            <h1
              className="text-2xl cursor-pointer font-bold text-yellow-400 tracking-tight"
              onClick={() => router.push("/")}
            >
              DreamKey
            </h1>
          </div>

          {/* User Profile Card */}
          {/* <div className="bg-neutral-900/60 backdrop-blur rounded-xl p-4 mb-8 border border-neutral-800 hover:border-neutral-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">M</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold text-sm truncate">Mainak</p>
                <p className="text-neutral-400 text-xs truncate">Elite Agent</p>
              </div>
            </div>
          </div> */}

          {/* Add Stock Button */}
          <button
            onClick={() => {
              router.push(`/${variant}/add-listing`);
              setSidebarOpen(false);
            }}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-yellow-400/20 mb-8 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add {variant[0].toUpperCase() + variant.slice(1)}
          </button>

          {/* Navigation Items */}
          <nav className="flex-1 flex flex-col gap-2 mb-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative cursor-pointer",
                    isActive
                      ? "text-white bg-neutral-900/80"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-900/80",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      isActive
                        ? "text-yellow-400"
                        : "text-neutral-400 group-hover:text-yellow-400",
                    )}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                  <div
                    className={cn(
                      "absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-r transition-opacity",
                      isActive
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100",
                    )}
                  ></div>
                </button>
              );
            })}
          </nav>

          {/* Quota Status Section */}
          {/* <div className="border-t border-neutral-800 pt-6">
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold mb-4">
              Quota Status
            </p>
            <div className="bg-neutral-900/60 backdrop-blur rounded-xl p-4 border border-neutral-800">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-lg font-bold text-white">17/20</span>
                <span className="text-xs text-neutral-400">Listings used</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: "85%" }}
                ></div>
              </div>
              <p className="text-xs text-neutral-500 mt-3">3 slots available</p>
            </div>
          </div> */}

          {/* User Profile Section - Bottom */}
          {user && (
            <div className="border-t border-neutral-800 pt-6">
              <div className="bg-neutral-900/60 backdrop-blur rounded-xl p-4 border border-neutral-800 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-400 to-orange-600 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-white">
                        {getUserInitial()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold text-sm truncate">
                      {user.username}
                    </p>
                    <p className="text-neutral-400 text-xs truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-neutral-300 hover:text-yellow-400 text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-black">
          {/* Top Header */}
          {/* <div className="sticky top-0 z-20 bg-neutral-900/80 backdrop-blur border-b border-neutral-800 px-6 sm:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search properties, leads, or listings..."
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-4 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400/50 transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white">
                  <Settings className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 pl-4 border-l border-neutral-700">
                  <span className="text-sm text-white">Hi, Mainak</span>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">M</span>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Page Content */}
          <div className="p-6 sm:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
