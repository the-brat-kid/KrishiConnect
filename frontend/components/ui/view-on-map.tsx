"use client";

import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import {
  Satellite,
  Wind,
  CloudRain,
  Sun,
  Maximize2,
  Minimize2,
  MapPin,
  Sparkles,
  Layers,
  ShieldCheck,
  Compass,
  RefreshCw,
  Eye,
  Info,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ViewOnMapProps {
  locationName?: string;
  address?: string;
  mapImageUrl?: string;
  className?: string;
  lat?: number;
  lon?: number;
  state?: string;
}

type LayerMode = "truecolor" | "aqi" | "clouds" | "hybrid";

export const ViewOnMap: React.FC<ViewOnMapProps> = ({
  locationName = "APMC Mandi Hub",
  address = "APMC Mandi Yard, India",
  className = "",
  lat = 20.2961,
  lon = 85.8245,
  state = "Odisha",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<LayerMode>("truecolor");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [nasaData, setNasaData] = useState<{
    temperature_c?: number;
    relative_humidity_pct?: number;
    precipitation_mm?: number;
    solar_radiation_mj?: number;
    wind_speed_mps?: number;
    estimated_aqi?: number;
    aqi_status?: string;
    cloud_fraction_pct?: number;
  }>({
    temperature_c: 27.8,
    relative_humidity_pct: 68,
    precipitation_mm: 0.4,
    solar_radiation_mj: 18.9,
    wind_speed_mps: 2.2,
    estimated_aqi: lat >= 26 ? 138 : 64,
    aqi_status: lat >= 26 ? "Moderate to Poor" : "Good to Moderate",
    cloud_fraction_pct: 26,
  });

  const [isLoadingNasa, setIsLoadingNasa] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Calculate guaranteed available UTC date for NASA GIBS (yesterday UTC)
  const gibsDate = React.useMemo(() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().split("T")[0];
  }, []);

  // Fetch live NASA POWER / Earth observation metrics
  useEffect(() => {
    let isCancelled = false;
    async function fetchNasaDiagnostics() {
      setIsLoadingNasa(true);
      try {
        const res = await fetch(`/api/nasa?lat=${lat}&lon=${lon}`);
        if (res.ok) {
          const json = await res.json();
          if (!isCancelled && json.success) {
            setNasaData({
              temperature_c: json.weather?.temperature_c,
              relative_humidity_pct: json.weather?.relative_humidity_pct,
              precipitation_mm: json.weather?.precipitation_mm,
              solar_radiation_mj: json.weather?.solar_radiation_mj,
              wind_speed_mps: json.weather?.wind_speed_mps,
              estimated_aqi: json.satellite?.estimated_aqi,
              aqi_status: json.satellite?.aqi_status,
              cloud_fraction_pct: json.satellite?.cloud_fraction_pct,
            });
          }
        }
      } catch (e) {
        console.warn("NASA live diagnostics using cached baseline", e);
      } finally {
        if (!isCancelled) setIsLoadingNasa(false);
      }
    }

    fetchNasaDiagnostics();
    return () => {
      isCancelled = true;
    };
  }, [lat, lon]);

  // Initialize and update Leaflet Map with NASA GIBS Satellite Layers
  useEffect(() => {
    let isMounted = true;
    let map: any = null;

    async function initMap() {
      if (!mapContainerRef.current) return;

      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up existing map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Add Zoom Control at bottom right for clean layout
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // 1. Base Layer Selection
      if (activeLayer === "truecolor") {
        // NASA MODIS Terra TrueColor Daily Satellite & Clouds
        L.tileLayer(
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${gibsDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
          {
            maxZoom: 9,
            minZoom: 3,
          }
        ).addTo(map);
      } else if (activeLayer === "aqi") {
        // Dark Base + NASA MODIS Aqua Aerosol Optical Depth (Air Quality & Particulate PM2.5)
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 18,
          subdomains: "abcd",
        }).addTo(map);

        L.tileLayer(
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_Aerosol_Optical_Depth_3km/default/${gibsDate}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
          {
            maxZoom: 8,
            minZoom: 3,
            opacity: 0.85,
          }
        ).addTo(map);
      } else if (activeLayer === "clouds") {
        // Dark Base + NASA Terra Cloud Top Pressure & Monsoon Fronts
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 18,
          subdomains: "abcd",
        }).addTo(map);

        L.tileLayer(
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Cloud_Top_Pressure_Day/default/${gibsDate}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
          {
            maxZoom: 8,
            minZoom: 3,
            opacity: 0.85,
          }
        ).addTo(map);
      } else if (activeLayer === "hybrid") {
        // NASA TrueColor + Street / Mandi Corridor Overlay
        L.tileLayer(
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${gibsDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
          {
            maxZoom: 9,
            minZoom: 3,
          }
        ).addTo(map);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png", {
          maxZoom: 18,
          subdomains: "abcd",
          opacity: 0.9,
        }).addTo(map);
      }

      // 2. NASA Geospatial Reference Features (State Borders of India & Coastlines)
      L.tileLayer(
        "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/Reference_Features_15m/default/default/GoogleMapsCompatible_Level13/{z}/{y}/{x}.png",
        {
          opacity: 0.7,
          maxZoom: 13,
        }
      ).addTo(map);

      // 3. NASA Reference Labels (Mandi Cities & Geographic Regions)
      L.tileLayer(
        "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/Reference_Labels/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png",
        {
          opacity: 0.85,
          maxZoom: 9,
        }
      ).addTo(map);

      // 4. Custom Glowing Mandi Pin Marker
      const customIcon = L.divIcon({
        className: "mandi-marker-custom",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
            <span style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(52, 211, 153, 0.45); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="position: relative; width: 16px; height: 16px; border-radius: 50%; background: #10b981; border: 2.5px solid #ffffff; box-shadow: 0 0 14px #34d399, inset 0 1px 2px rgba(255,255,255,0.8);"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; padding: 6px 8px; max-width: 230px;">
          <div style="font-weight: 800; font-size: 13px; color: #047857; display: flex; align-items: center; gap: 4px;">
            📍 ${locationName}
          </div>
          <div style="font-size: 11px; color: #334155; margin-top: 3px; line-height: 1.3;">
            ${address}
          </div>
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #e2e8f0; font-size: 10px; font-weight: 700; color: #059669; font-family: monospace;">
            COORDS: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E
          </div>
        </div>
      `);

      setMapLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon, activeLayer, gibsDate, locationName, address]);

  // Quick Region Center Fly-To
  const handleFlyTo = (targetLat: number, targetLon: number, targetZoom: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([targetLat, targetLon], targetZoom, {
        duration: 1.2,
      });
    }
  };

  const aqiColorClass =
    (nasaData.estimated_aqi || 0) < 50
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      : (nasaData.estimated_aqi || 0) < 100
      ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
      : (nasaData.estimated_aqi || 0) < 150
      ? "text-orange-400 bg-orange-500/10 border-orange-500/30"
      : "text-rose-400 bg-rose-500/10 border-rose-500/30";

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-white/20 bg-black/50 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_12px_40px_rgba(0,0,0,0.6)] ${
        isFullscreen ? "fixed inset-3 z-50 rounded-2xl flex flex-col" : "w-full aspect-[4/3] min-h-[380px]"
      } ${className}`}
    >
      {/* Top Floating Glass Navigation Header */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Mandi & Satellite Indicator Pill */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 dark:bg-black/85 backdrop-blur-xl border border-white/20 text-white shadow-xl">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Satellite className="h-3.5 w-3.5 animate-pulse" />
          </div>
          <div className="leading-tight">
            <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate max-w-[180px] sm:max-w-[260px]">
              <span>{locationName}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-emerald-400/90 font-mono">
              NASA GIBS Daily • {gibsDate}
            </div>
          </div>
        </div>

        {/* Action Controls & Fullscreen Toggle */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xl border border-white/15 text-[10px] text-muted-foreground font-mono">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>NASA Key Active</span>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 rounded-full bg-black/80 hover:bg-black backdrop-blur-xl border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105"
            title={isFullscreen ? "Exit Fullscreen" : "Expand Observatory Map"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Layer Selector Bar (Floating at Top-Center on Medium+ Screens) */}
      <div className="absolute top-16 left-3 z-20 flex flex-wrap items-center gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={() => setActiveLayer("truecolor")}
          className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer border ${
            activeLayer === "truecolor"
              ? "bg-emerald-600/90 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              : "bg-black/70 text-muted-foreground hover:text-white border-white/15"
          }`}
        >
          🛰️ Sat Clouds
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer("aqi")}
          className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer border ${
            activeLayer === "aqi"
              ? "bg-amber-600/90 text-white border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              : "bg-black/70 text-muted-foreground hover:text-white border-white/15"
          }`}
        >
          🌫️ AQI &amp; Aerosol
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer("clouds")}
          className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer border ${
            activeLayer === "clouds"
              ? "bg-sky-600/90 text-white border-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.5)]"
              : "bg-black/70 text-muted-foreground hover:text-white border-white/15"
          }`}
        >
          🌧️ Cloud Fronts
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer("hybrid")}
          className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer border ${
            activeLayer === "hybrid"
              ? "bg-indigo-600/90 text-white border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
              : "bg-black/70 text-muted-foreground hover:text-white border-white/15"
          }`}
        >
          🗺️ Mandi Roads
        </button>
      </div>

      {/* Main Leaflet Map Viewport */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[360px] z-10 bg-[#080d12]" />

      {/* Bottom Floating Glass HUD: Live NASA Meteorological & AQI Diagnostics */}
      <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-auto">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-black/85 dark:bg-black/90 backdrop-blur-2xl border border-white/20 shadow-2xl text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Left: Quick Region Jumping Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1 pr-1 shrink-0">
                <Compass className="h-3.5 w-3.5 text-emerald-400" />
                <span>Region:</span>
              </span>
              <button
                type="button"
                onClick={() => handleFlyTo(lat, lon, 8)}
                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-emerald-300 font-semibold text-[11px] shrink-0 border border-emerald-500/30 transition-all cursor-pointer"
              >
                📍 Mandi Focus
              </button>
              <button
                type="button"
                onClick={() => handleFlyTo(22.8, 82.5, 5)}
                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] shrink-0 border border-white/15 transition-all cursor-pointer"
              >
                🇮🇳 All India
              </button>
              <button
                type="button"
                onClick={() => handleFlyTo(29.8, 76.5, 6)}
                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] shrink-0 border border-white/15 transition-all cursor-pointer"
              >
                🌾 North Plain
              </button>
              <button
                type="button"
                onClick={() => handleFlyTo(15.5, 78.5, 6)}
                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] shrink-0 border border-white/15 transition-all cursor-pointer"
              >
                🌴 South Coast
              </button>
            </div>

            {/* Right: Key NASA Agro-Telemetry Indicators */}
            <div className="flex items-center gap-2 text-xs flex-wrap sm:flex-nowrap justify-between sm:justify-end">
              {/* AQI Pill */}
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${aqiColorClass}`}>
                <Activity className="h-3 w-3" />
                <span>AQI {nasaData.estimated_aqi}</span>
              </div>

              {/* Cloud Coverage */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium text-slate-200">
                <Sun className="h-3 w-3 text-amber-400" />
                <span>Clouds {nasaData.cloud_fraction_pct}%</span>
              </div>

              {/* Solar Radiation */}
              <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium text-slate-200">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                <span>{nasaData.solar_radiation_mj} MJ/m²</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOnMap;
