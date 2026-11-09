"use client";

interface DynamicFarmWeatherBackgroundProps {
  className?: string;
  showControls?: boolean;
}

export function DynamicFarmWeatherBackground({
  className = "",
}: DynamicFarmWeatherBackgroundProps) {
  return (
    <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#000030] ${className}`}>
      {/* 1. Starfall Midnight Background Photo (Photo-1536152470836) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{
          backgroundImage:
            "url('/starfall-night.jpg'), url('https://images.unsplash.com/photo-1536152470836-b943b246224c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1476&q=80')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />

      {/* 2. Starfall 3D Preserved Perspective Container (40 Animated Shooting Stars) */}
      <div className="starfall">
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} className="falling-star" />
        ))}
      </div>

      {/* 3. Soft Ambient Legibility Vignette - Ensures UI cards and text remain razor-sharp */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-background/55 dark:from-black/80 dark:via-black/25 dark:to-black/60 backdrop-blur-[0.5px] transition-colors duration-500" />
    </div>
  );
}
