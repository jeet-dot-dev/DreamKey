"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { AlertCircle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an analytics or logging service
    console.error("Global Error Boundary caught an exception:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#060913] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(234,179,8,0.08)_0%,rgba(6,9,19,0)_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(47,132,255,0.05)_0%,rgba(6,9,19,0)_40%)]" />

      <div className="relative z-10 w-full max-w-lg text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Luxury Logo Branding */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex items-center justify-center shadow-lg shadow-yellow-500/5">
            <span className="text-yellow-400 font-bold text-xl tracking-tighter">DK</span>
          </div>
          <p className="text-[10px] font-semibold tracking-[0.24em] text-yellow-500/60 uppercase">
            DreamKey Realty
          </p>
        </div>

        {/* Custom Container Card */}
        <div className="rounded-3xl border border-neutral-800 bg-[#111724]/60 backdrop-blur-xl p-8 sm:p-10 shadow-[0_32px_100px_-30px_rgba(0,0,0,0.8)] space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              System Interrupted
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm mx-auto">
              An unexpected operational anomaly has occurred. The luxury portal resources have been locked to protect your session.
            </p>
          </div>

          {/* Technical summary display box */}
          <div className="rounded-xl bg-black/40 border border-neutral-900 p-4 text-left font-mono text-[11px] text-neutral-500 overflow-x-auto max-h-24 scrollbar-thin">
            <span className="text-red-400/80 font-bold">Error:</span> {error?.message || "Internal Exception Encountered"}
            {error?.digest && (
              <div className="mt-1">
                <span className="text-neutral-600 font-bold">Digest ID:</span> {error.digest}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm shadow-lg shadow-yellow-400/10"
            >
              <RefreshCw className="h-4 w-4" />
              Attempt Recover
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="flex-1 border border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300 font-medium py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              <Home className="h-4 w-4" />
              Return Home
            </button>
          </div>
        </div>

        {/* Footer Support Tag */}
        <p className="text-[10px] text-neutral-600 tracking-wide">
          IF THIS ERROR PERSISTS, PLEASE CONTACT THE DREAMKEY PORTAL HELPLINE
        </p>
      </div>
    </main>
  );
}
