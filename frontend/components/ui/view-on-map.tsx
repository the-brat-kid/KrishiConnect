"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Compass,
  Activity,
  ChevronDown,
  Thermometer,
  Droplets,
} from "lucide-react";
import {
  MandiLocation,
  REGIONAL_MANDIS,
  STATE_NAMES,
  getMandisForState,
} from "@/lib/mandi-regions";

export type { MandiLocation };
export { REGIONAL_MANDIS, STATE_NAMES };

export interface ViewOnMapProps {
  locationName?: string;
  address?: string;
  className?: string;
  lat?: number;
  lon?: number;
  state?: string;
  onLocationChange?: (mandi: MandiLocation) => void;
}

type LayerMode = "truecolor" | "aqi" | "clouds" | "hybrid";

export const ViewOnMap: React.FC<ViewOnMapProps> = ({
  locationName = "APMC Mandi Hub",
  address = "APMC Mandi Yard, India",
  className = "",
  lat = 20.2961,
  lon = 85.8245,
  state = "Odisha",
  onLocationChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // State & Mandi Selection State
  const [selectedState, setSelectedState] = useState<string>(() => {
    if (state && STATE_NAMES.includes(state)) return state;
    return "Odisha";
  });

  const availablePlaces = useMemo(() => {
    return REGIONAL_MANDIS[selectedState] || REGIONAL_MANDIS["Odisha"];
  }, [selectedState]);

  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(() => {
    const matched = availablePlaces.find(
      (p) => p.name.toLowerCase().includes(locationName.toLowerCase()) || Math.abs(p.lat - lat) < 0.1
    );
    return matched?.id || availablePlaces[0].id;
  });

  const activePlace = useMemo(() => {
    return availablePlaces.find((p) => p.id === selectedPlaceId) || availablePlaces[0];
  }, [availablePlaces, selectedPlaceId]);

  const currentLat = activePlace.lat;
  const currentLon = activePlace.lon;
  const currentPlaceName = activePlace.name;
  const currentAddress = activePlace.address;

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
    temperature_c: 28.2,
    relative_humidity_pct: 66,
    precipitation_mm: 0.2,
    solar_radiation_mj: 18.8,
    wind_speed_mps: 2.1,
    estimated_aqi: currentLat >= 26 ? 142 : 68,
    aqi_status: currentLat >= 26 ? "Moderate to Poor" : "Good to Moderate",
    cloud_fraction_pct: 24,
  });

  // Calculate guaranteed available UTC date for satellite tiles (yesterday UTC)
  const gibsDate = useMemo(() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().split("T")[0];
  }, []);

  // Update selection if parent props change
  useEffect(() => {
    if (state && STATE_NAMES.includes(state)) {
      setSelectedState(state);
      const places = REGIONAL_MANDIS[state];
      if (places && places.length > 0) {
        const matched = places.find(
          (p) =>
            p.name.toLowerCase().includes(locationName.toLowerCase()) ||
            (Math.abs(p.lat - lat) < 0.15 && Math.abs(p.lon - lon) < 0.15)
        );
        if (matched) {
          setSelectedPlaceId(matched.id);
        }
      }
    }
  }, [state, locationName, lat, lon]);

  // Fetch live agro-meteorological diagnostics
  useEffect(() => {
    let isCancelled = false;
    async function fetchDiagnostics() {
      try {
        const res = await fetch(`/api/nasa?lat=${currentLat}&lon=${currentLon}`);
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
        console.warn("Satellite telemetry using fallback", e);
      }
    }

    fetchDiagnostics();
    return () => {
      isCancelled = true;
    };
  }, [currentLat, currentLon]);

  // Handle State Change
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const places = REGIONAL_MANDIS[newState];
    if (places && places.length > 0) {
      const firstPlace = places[0];
      setSelectedPlaceId(firstPlace.id);
      if (onLocationChange) onLocationChange(firstPlace);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([firstPlace.lat, firstPlace.lon], 8, { duration: 1.2 });
      }
    }
  };

  // Handle Place Change
  const handlePlaceChange = (newPlaceId: string) => {
    setSelectedPlaceId(newPlaceId);
    const place = availablePlaces.find((p) => p.id === newPlaceId);
    if (place) {
      if (onLocationChange) onLocationChange(place);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([place.lat, place.lon], 9, { duration: 1.2 });
      }
    }
  };

  // Quick Fly to All India
  const handleAllIndiaView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([22.8, 82.5], 5, { duration: 1.3 });
    }
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    let isMounted = true;
    let map: any = null;

    async function initMap() {
      if (!mapContainerRef.current) return;

      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLon],
        zoom: 8,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Zoom Control bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // 1. Satellite Base Layer Selection
      if (activeLayer === "truecolor") {
        L.tileLayer(
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${gibsDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
          { maxZoom: 9, minZoom: 3 }
        ).addTo(map);
      } else if (activeLayer === "aqi") {
        // Watermark-free high-res Dark Gray Canvas Base
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 16 }
        ).addTo(map);

        L.tileLayer(
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_Aerosol_Optical_Depth_3km/default/${gibsDate}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
          { maxZoom: 8, minZoom: 3, opacity: 0.85 }
        ).addTo(map);
      } else if (activeLayer === "clouds") {
        // Watermark-free high-res Dark Gray Canvas Base
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 16 }
        ).addTo(map);

        L.tileLayer(
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Cloud_Top_Pressure_Day/default/${gibsDate}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
          { maxZoom: 8, minZoom: 3, opacity: 0.85 }
        ).addTo(map);
      } else if (activeLayer === "hybrid") {
        L.tileLayer(
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${gibsDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
          { maxZoom: 9, minZoom: 3 }
        ).addTo(map);

        // Watermark-free crisp road & boundary reference
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 16, opacity: 0.95 }
        ).addTo(map);
      }

      // 2. Geospatial State Boundaries & Coastlines of India
      L.tileLayer(
        "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/Reference_Features_15m/default/default/GoogleMapsCompatible_Level13/{z}/{y}/{x}.png",
        { opacity: 0.7, maxZoom: 13 }
      ).addTo(map);

      // 3. Geographic City & Mandi Labels (watermark-free)
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
        { opacity: 0.9, maxZoom: 16 }
      ).addTo(map);

      // 4. Custom Glowing Mandi Pin Marker
      const customIcon = L.divIcon({
        className: "mandi-marker-custom",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px;">
            <span style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(52, 211, 153, 0.45); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="position: relative; width: 17px; height: 17px; border-radius: 50%; background: #10b981; border: 2.5px solid #ffffff; box-shadow: 0 0 14px #34d399, inset 0 1px 2px rgba(255,255,255,0.8);"></div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([currentLat, currentLon], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; padding: 6px 8px; max-width: 240px;">
          <div style="font-weight: 800; font-size: 13px; color: #047857; display: flex; align-items: center; gap: 4px;">
            📍 ${currentPlaceName}
          </div>
          <div style="font-size: 11px; color: #334155; margin-top: 3px; line-height: 1.3;">
            ${currentAddress}
          </div>
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #e2e8f0; font-size: 10px; font-weight: 700; color: #059669; font-family: monospace;">
            COORDS: ${currentLat.toFixed(4)}°N, ${currentLon.toFixed(4)}°E
          </div>
        </div>
      `);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentLat, currentLon, activeLayer, gibsDate, currentPlaceName, currentAddress]);

  const aqiColorClass =
    (nasaData.estimated_aqi || 0) < 50
      ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/40"
      : (nasaData.estimated_aqi || 0) < 100
      ? "text-yellow-400 bg-yellow-500/15 border-yellow-500/40"
      : (nasaData.estimated_aqi || 0) < 150
      ? "text-orange-400 bg-orange-500/15 border-orange-500/40"
      : "text-rose-400 bg-rose-500/15 border-rose-500/40";

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-white/20 bg-black/60 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_12px_40px_rgba(0,0,0,0.6)] ${
        isFullscreen ? "fixed inset-3 z-50 rounded-2xl flex flex-col" : "w-full aspect-[16/9] min-h-[460px] sm:min-h-[520px]"
      } ${className}`}
    >
      {/* Top Floating Glass Navigation Header with State & Place Selectors */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        {/* Region & Place Selector Controls */}
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
          {/* State Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 text-white shadow-xl">
            <Compass className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">State:</span>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1"
            >
              {STATE_NAMES.map((st) => (
                <option key={st} value={st} className="bg-neutral-900 text-white">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Place / Mandi Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 text-white shadow-xl">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Place:</span>
            <select
              value={selectedPlaceId}
              onChange={(e) => handlePlaceChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer max-w-[190px] sm:max-w-[240px] truncate pr-1"
            >
              {availablePlaces.map((pl) => (
                <option key={pl.id} value={pl.id} className="bg-neutral-900 text-white">
                  {pl.name}
                </option>
              ))}
            </select>
          </div>

          {/* All India Reset Button */}
          <button
            type="button"
            onClick={handleAllIndiaView}
            className="px-3 py-1.5 rounded-2xl bg-black/80 hover:bg-black/95 backdrop-blur-xl border border-white/20 text-xs font-bold text-white hover:text-emerald-400 transition-all cursor-pointer shadow-lg inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
            title="View Indian Subcontinent"
          >
            <span>🇮🇳 All India</span>
          </button>
        </div>

        {/* Action Controls & Fullscreen Toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/15 text-[11px] text-muted-foreground font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Satellite Feed Live</span>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-9 w-9 rounded-full bg-black/85 hover:bg-black backdrop-blur-xl border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105"
            title={isFullscreen ? "Exit Fullscreen" : "Expand Satellite Map"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Layer Selector Bar */}
      <div className="absolute top-16 left-3 z-20 flex flex-wrap items-center gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={() => setActiveLayer("truecolor")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer border ${
            activeLayer === "truecolor"
              ? "bg-emerald-600/90 text-white border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.5)]"
              : "bg-black/75 text-muted-foreground hover:text-white border-white/15"
          }`}
        >
          🛰️ Satellite Clouds
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer("aqi")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer border ${
            activeLayer === "aqi"
              ? "bg-amber-600/90 text-white border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.5)]"
              : "bg-black/75 text-muted-foreground hover:text-white border-white/15"
          }`}
        >
          🌫️ Air Quality &amp; AQI
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer("clouds")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer border ${
            activeLayer === "clouds"
              ? "bg-sky-600/90 text-white border-sky-400 shadow-[0_0_14px_rgba(14,165,233,0.5)]"
              : "bg-black/75 text-muted-foreground hover:text-white border-white/15"
          }`}
        >
          🌧️ Rain &amp; Storm Fronts
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer("hybrid")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer border ${
            activeLayer === "hybrid"
              ? "bg-indigo-600/90 text-white border-indigo-400 shadow-[0_0_14px_rgba(99,102,241,0.5)]"
              : "bg-black/75 text-muted-foreground hover:text-white border-white/15"
          }`}
        >
          🗺️ Mandi Road Corridors
        </button>
      </div>

      {/* Main Leaflet Map Viewport */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[440px] z-10 bg-[#060a0e]" />

      {/* Bottom Floating Glass HUD: Live Meteorological & AQI Diagnostics */}
      <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-auto">
        <div className="p-3 rounded-2xl bg-black/85 dark:bg-black/90 backdrop-blur-2xl border border-white/20 shadow-2xl text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left Info: Current Place & Coordinates */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <Satellite className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                  <span>{currentPlaceName}</span>
                  <span className="text-[10px] text-muted-foreground font-normal">({selectedState})</span>
                </div>
                <div className="text-[10px] text-emerald-400/90 font-mono truncate">
                  {currentLat.toFixed(3)}°N, {currentLon.toFixed(3)}°E • {currentAddress}
                </div>
              </div>
            </div>

            {/* Right Telemetry Indicators */}
            <div className="flex items-center gap-2 text-xs flex-wrap md:flex-nowrap justify-between md:justify-end">
              {/* AQI Pill */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${aqiColorClass}`}>
                <Activity className="h-3.5 w-3.5" />
                <span>AQI {nasaData.estimated_aqi}</span>
                <span className="text-[10px] opacity-80 font-normal">({nasaData.aqi_status})</span>
              </div>

              {/* Cloud Coverage */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-slate-200">
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span>Clouds {nasaData.cloud_fraction_pct}%</span>
              </div>

              {/* Solar Radiation */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-slate-200">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>{nasaData.solar_radiation_mj} MJ/m²</span>
              </div>

              {/* Temperature */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-slate-200">
                <Thermometer className="h-3.5 w-3.5 text-emerald-400" />
                <span>{nasaData.temperature_c}°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOnMap;
