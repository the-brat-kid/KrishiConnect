"use client";

import React from "react";
import { Sparkles, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

export function SoilSamplingGuide() {
  const steps = [
    {
      step: "01",
      title: "Identify Representative Spots",
      description: "Traverse the plot in a zig-zag pattern selecting 8 to 10 distinct sampling points. Avoid field boundaries, irrigation channels, compost piles, and tree canopies.",
      icon: "🌾",
    },
    {
      step: "02",
      title: "Excavate 15 cm V-Shaped Trench",
      description: "Clear superficial organic debris and weed cover. Using a clean spade or auger, dig a V-shaped trench to a depth of 15 cm (plow layer depth).",
      icon: "⛏️",
    },
    {
      step: "03",
      title: "Extract Uniform 1-Inch Core Slice",
      description: "From the exposed trench wall, shave a uniform 1-inch (2.5 cm) thick vertical slice from top to bottom and collect in a clean plastic container.",
      icon: "🧪",
    },
    {
      step: "04",
      title: "Composite, Quarter & Pack 500g",
      description: "Thoroughly mix all field cores, remove stones and roots. Divide by quartering to isolate a 500g composite sample. Air-dry in shade and seal in a labeled bag.",
      icon: "📦",
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 dark:border-white/10 bg-white/60 dark:bg-[#0c0d0e]/80 backdrop-blur-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/50">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Standard Operating Procedure (SOP)</span>
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Standard Soil Sampling Protocol (4 Essential Steps)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Representative field sampling is vital for accurate NPK, pH, and micronutrient laboratory diagnostics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {steps.map((st, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{st.icon}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Step {st.step}
                </span>
              </div>
              <h4 className="font-bold text-sm text-foreground mb-1.5">{st.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{st.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Protocol Caution Banner */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold block">Critical Sampling Directives:</span>
          <span>
            Do not collect samples within 30 days of chemical fertilizer or manure application. Always air-dry samples in clean shade; avoid drying under direct midday sunlight or heating.
          </span>
        </div>
      </div>
    </div>
  );
}
