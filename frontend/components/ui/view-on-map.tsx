"use client";

import React, { useState } from "react";
import { X, Loader2, MapPin, Map, Navigation, ExternalLink } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export interface ViewOnMapProps {
  locationName?: string;
  address?: string;
  mapImageUrl?: string;
  className?: string;
}

export const ViewOnMap: React.FC<ViewOnMapProps> = ({
  locationName = "Bhubaneswar APMC Mandi",
  address = "APMC Mandi Yard, Unit 1, Bhubaneswar, Odisha 751009, India",
  mapImageUrl = "https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=2000&auto=format&fit=crop",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (isOpen) setIsMapLoaded(false);
  };

  const publicMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const externalDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className={`transition-colors duration-300 ${className}`}>
      {!isOpen ? (
        /* Action Button */
        <button
          type="button"
          onClick={toggleOpen}
          className="group relative flex items-center justify-between gap-3 px-4 py-3 rounded-md border border-border bg-card hover:border-primary/50 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer w-full sm:w-auto min-w-[210px] text-left"
        >
          {/* Subtle background image sheen */}
          <div
            className="absolute inset-0 rounded-md opacity-10 bg-cover bg-center grayscale pointer-events-none"
            style={{ backgroundImage: `url(${mapImageUrl})` }}
          />

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
              <Map className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{locationName}</p>
              <p className="text-[11px] text-muted-foreground truncate">View on Google Map</p>
            </div>
          </div>

          <Navigation className="relative z-10 w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </button>
      ) : (
        /* Expanded Map Modal / Container */
        <div className="relative w-full aspect-video sm:aspect-[4/3] max-w-2xl rounded-lg overflow-hidden border border-border bg-card shadow-xl transition-all duration-300">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40 backdrop-blur-xs">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-foreground truncate block">{locationName}</span>
                <span className="text-[10px] text-muted-foreground truncate block">{address}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={externalDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline px-2 py-1 rounded bg-primary/10"
              >
                <span>Open in App</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleOpen}
                className="h-7 w-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                aria-label="Close Map"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Map Frame */}
          <div className="relative w-full h-[calc(100%-52px)] bg-muted/20">
            <iframe
              title={`Map of ${locationName}`}
              width="100%"
              height="100%"
              style={{
                border: 0,
                filter: isDark ? "invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)" : "none",
              }}
              src={publicMapUrl}
              allowFullScreen
              onLoad={() => setIsMapLoaded(true)}
              className={`w-full h-full transition-opacity duration-500 ${isMapLoaded ? "opacity-100" : "opacity-0"}`}
            />

            {!isMapLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card/80 backdrop-blur-xs">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Loading Mandi Coordinates...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOnMap;
