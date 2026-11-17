"use client";

import React from "react";
import { Shovel, Sparkles, AlertCircle, CheckCircle2, FileText, ArrowRight } from "lucide-react";

export function SoilSamplingGuide() {
  const steps = [
    {
      step: "01",
      title: "Select 5-8 Zig-Zag Spots",
      description: "Field me 'V' ya zig-zag pattern me 5 se 8 alag jagah chunein. Ped ke neeche, naali ke paas ya khaad ke dher ke paas se sample na lein.",
      icon: "🌾",
    },
    {
      step: "02",
      title: "Dig 15 cm 'V' Shape Trench",
      description: "Ghaas aur upari kachra saaf karein. Khurpi ya spade se 15 cm (6 inch) gehra 'V' aakar ka gaddha banayein.",
      icon: "⛏️",
    },
    {
      step: "03",
      title: "Collect 1-inch Soil Slice",
      description: "Gaddhe ke kinare se upar se neeche tak 1 inch moti mitti ki parat (slice) kaat kar saaf balti me daalein.",
      icon: "🧪",
    },
    {
      step: "04",
      title: "Mix, Quarter & Pack 500g",
      description: "Saare spots ki mitti achhi tarah milayein. Kankad-patthar hatayein. Chhan kar lagbhag 500g mitti saaf bag me pack karein.",
      icon: "📦",
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 dark:border-white/10 bg-white/60 dark:bg-[#0c0d0e]/80 backdrop-blur-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/50">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kisan Field Sampling Manual</span>
          </div>
          <h3 className="text-lg font-bold text-foreground">
            How to Collect Soil Sample from Your Field (4 Simple Steps)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sahi mitti lene se hi lab me NPK aur micronutrients ka sahi result nikalta hai.
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

      {/* Pro Tips Banner */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold block">Zaroori Nirdesh (Important Caution):</span>
          <span>
            Khaad daalne ke turant baad mitti na lein (kam se kam 25-30 din baad lein). Mitti ko dhoop me nahi, balki chhaon (shade) me sukhein.
          </span>
        </div>
      </div>
    </div>
  );
}
