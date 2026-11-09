"use client";

import { ReactNode } from "react";

export default function DashboardTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="animate-page-enter w-full">
      {children}
    </div>
  );
}
