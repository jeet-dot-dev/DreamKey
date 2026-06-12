"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background ambient radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(234,179,8,0.08)_0%,rgba(6,9,19,0)_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(47,132,255,0.05)_0%,rgba(6,9,19,0)_40%)]" />

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Animated Gold Logo Spinner */}
        <div className="relative flex items-center justify-center">
          {/* External spinning gold gradient border */}
          <div className="w-16 h-16 rounded-2xl border-2 border-yellow-500/10 border-t-yellow-400 border-r-yellow-400/50 animate-spin" />
          
          {/* Logo center text */}
          <div className="absolute w-12 h-12 rounded-xl bg-[#111724]/90 border border-yellow-500/20 flex items-center justify-center shadow-lg shadow-yellow-500/5">
            <span className="text-yellow-400 font-bold text-lg tracking-tighter animate-pulse">DK</span>
          </div>
        </div>

        {/* Premium text label */}
        <div className="text-center space-y-1 mt-2">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-yellow-500/60 uppercase">
            DreamKey Realty
          </p>
          <p className="text-[11px] text-neutral-400 tracking-wide font-light animate-pulse">
            Arranging your luxury portal...
          </p>
        </div>
      </div>
    </div>
  );
}
