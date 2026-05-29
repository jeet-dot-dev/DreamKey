"use client";

import StockLayout from "@/components/StockLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StockLayout variant="broker">
      {children}
    </StockLayout>
  );
}
