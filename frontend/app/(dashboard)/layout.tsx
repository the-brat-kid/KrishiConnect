"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { DynamicFarmWeatherBackground } from "@/components/layout/dynamic-farm-weather-background";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background relative selection:bg-primary/25 selection:text-primary">
      {/* Living dynamic farm & weather background with real photography */}
      <DynamicFarmWeatherBackground showControls={true} />

      {/* Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar Content Box with Obsidian Black Styling */}
          <div className="relative flex w-72 max-w-[85vw] flex-col bg-[#080808] z-50 shadow-2xl border-r border-[#1C1C1E] animate-page-enter">
            {/* Close Button Inside Sidebar */}
            <div className="flex justify-between items-center p-3.5 border-b border-[#1C1C1E]">
              <span className="text-sm font-bold tracking-tight text-[#CDCBCA]">Navigation Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-[#1A1A1D] text-[#CDCBCA] text-xs font-semibold transition-colors border border-[#242428]"
              >
                <X className="h-3.5 w-3.5" />
                <span>Close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar isMobile onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden w-full">
        {/* Top Bar with Liquid Glass Styling */}
        <div className="flex items-center px-3 md:px-5 py-2.5 border-b border-white/20 dark:border-white/10 bg-background/60 dark:bg-black/40 backdrop-blur-xl gap-3 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-muted text-foreground transition-colors focus:outline-none flex items-center justify-center cursor-pointer border border-border/70 shadow-2xs"
            aria-label="Open Sidebar Menu"
            title="Open side panel"
          >
            <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1">
            <Header onToggleSidebar={() => setSidebarOpen(true)} />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-transparent">
          <div className="max-w-7xl mx-auto w-full relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
