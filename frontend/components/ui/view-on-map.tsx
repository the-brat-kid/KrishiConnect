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
  CloudLightning,
  RefreshCw,
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

export type LayerMode =
  | "live_rain"
  | "live_wind"
  | "live_radar"
  | "live_clouds"
  | "truecolor"
  | "aqi"
  | "hybrid";

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

  // Active Layer: Defaults to Live Rain & Wind Flow across all regions (har jagah)
  const [activeLayer, setActiveLayer] = useState<LayerMode>("live_rain");
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Default to All India (panoramic subcontinent view) so wind and rain flow opens everywhere at start
  const [isAllIndia, setIsAllIndia] = useState(true);

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
    setIsAllIndia(false);
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
    setIsAllIndia(false);
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
    setIsAllIndia(true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([22.8, 82.5], 5, { duration: 1.3 });
    }
  };

  // Dynamic live stream embed URL for animated wind, rain radar, and cloud flow
  const liveStreamUrl = useMemo(() => {
    const overlay =
      activeLayer === "live_wind"
        ? "wind"
        : activeLayer === "live_radar"
        ? "radar"
        : activeLayer === "live_clouds"
        ? "clouds"
        : "rain"; // Default: Live rain precipitation radar WITH active animated wind streamline flow

    const zoom = isAllIndia ? 5 : 7;
    const centerLat = isAllIndia ? 22.8 : currentLat;
    const centerLon = isAllIndia ? 82.5 : currentLon;

    return `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km%2Fh&zoom=${zoom}&overlay=${overlay}&product=ecmwf&level=surface&lat=${centerLat}&lon=${centerLon}&detailLat=${currentLat}&detailLon=${currentLon}&marker=true&pressure=true&message=true`;
  }, [activeLayer, isAllIndia, currentLat, currentLon]);

  const isLiveStreamActive =
    activeLayer === "live_rain" ||
    activeLayer === "live_wind" ||
    activeLayer === "live_radar" ||
    activeLayer === "live_clouds";

  // Initialize and update Leaflet Map when satellite/AQI/hybrid is selected
  useEffect(() => {
    if (isLiveStreamActive) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

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

      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      map = L.map(mapContainerRef.current, {
        center: isAllIndia ? [22.8, 82.5] : [currentLat, currentLon],
        zoom: isAllIndia ? 5 : 8,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Force recalculation of map container dimensions once mounted
      setTimeout(() => {
        if (map && isMounted) {
          map.invalidateSize();
        }
      }, 120);

      // Zoom Control bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // 1. Satellite Base Layer Selection
      if (activeLayer === "truecolor") {
        // High-res satellite base imagery underneath
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 18, minZoom: 2 }
        ).addTo(map);

        // NASA MODIS Terra TrueColor Daily Earth Observation Overpass
        L.tileLayer(
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${gibsDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
          { maxZoom: 18, maxNativeZoom: 9, minZoom: 2, opacity: 0.92 }
        ).addTo(map);
      } else if (activeLayer === "aqi") {
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 18, minZoom: 2 }
        ).addTo(map);

        L.tileLayer(
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_Aerosol_Optical_Depth_3km/default/${gibsDate}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
          { maxZoom: 18, maxNativeZoom: 6, minZoom: 2, opacity: 0.88 }
        ).addTo(map);
      } else if (activeLayer === "hybrid") {
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 18, minZoom: 2 }
        ).addTo(map);

        L.tileLayer(
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${gibsDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
          { maxZoom: 18, maxNativeZoom: 9, minZoom: 2, opacity: 0.88 }
        ).addTo(map);

        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 18, opacity: 0.95 }
        ).addTo(map);
      }

      // 2. Geospatial State Boundaries & Coastlines of India
      L.tileLayer(
        "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/Reference_Features_15m/default/default/GoogleMapsCompatible_Level13/{z}/{y}/{x}.png",
        { opacity: 0.75, maxZoom: 18, maxNativeZoom: 9 }
      ).addTo(map);

      // 3. Geographic City & Mandi Labels
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
        { opacity: 0.9, maxZoom: 18 }
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
            ${currentPlaceName}
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
  }, [isLiveStreamActive, currentLat, currentLon, activeLayer, gibsDate, currentPlaceName, currentAddress, isAllIndia]);

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
        isFullscreen
          ? "fixed inset-3 z-50 rounded-2xl flex flex-col"
          : "w-full aspect-[16/9] min-h-[480px] sm:min-h-[560px]"
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
            <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
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

          {/* Farm View Quick Focus */}
          <button
            type="button"
            onClick={() => {
              setIsAllIndia(false);
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([currentLat, currentLon], 8, { duration: 1.2 });
              }
            }}
            className={`px-3 py-1.5 rounded-2xl backdrop-blur-xl border text-xs font-bold transition-all cursor-pointer shadow-lg inline-flex items-center gap-1 shrink-0 ${
              !isAllIndia
                ? "bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                : "bg-black/80 hover:bg-black text-white hover:text-emerald-400 border-white/20"
            }`}
            title="Focus on selected farm coordinates"
          >
            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
            <span>Farm View</span>
          </button>

          {/* All India Reset Button */}
          <button
            type="button"
            onClick={handleAllIndiaView}
            className={`px-3 py-1.5 rounded-2xl backdrop-blur-xl border text-xs font-bold transition-all cursor-pointer shadow-lg inline-flex items-center gap-1 shrink-0 whitespace-nowrap ${
              isAllIndia
                ? "bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                : "bg-black/80 hover:bg-black text-white hover:text-emerald-400 border-white/20"
            }`}
            title="View Indian Subcontinent"
          >
            <span>All India</span>
          </button>
        </div>

        {/* Live Status Badge & Fullscreen Toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/85 backdrop-blur-xl border border-emerald-500/40 text-[11px] text-emerald-300 font-mono shadow-[0_0_14px_rgba(16,185,129,0.3)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold tracking-wide">
              {activeLayer === "live_rain"
                ? "LIVE WIND & RAIN FLOW"
                : activeLayer === "live_wind"
                ? "LIVE WIND STREAM"
                : activeLayer === "live_radar"
                ? "DOPPLER WEATHER RADAR"
                : activeLayer === "live_clouds"
                ? "LIVE CLOUD RADAR"
                : activeLayer === "truecolor"
                ? "NASA EARTH OBSERVATION"
                : activeLayer === "aqi"
                ? "SATELLITE AEROSOL & AQI"
                : "MANDI CORRIDOR NETWORK"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-9 w-9 rounded-full bg-black/85 hover:bg-black backdrop-blur-xl border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105"
            title={isFullscreen ? "Exit Fullscreen" : "Expand Live Map"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Layer Selector Bar */}
      <div className="absolute top-16 left-3 right-3 z-20 flex items-center gap-1.5 pointer-events-auto overflow-x-auto no-scrollbar py-0.5">
        {/* 1. Live Rain & Animated Wind Flow (Default at startup) */}
        <button
          type="button"
          onClick={() => setActiveLayer("live_rain")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-xl transition-all cursor-pointer border flex items-center gap-1.5 shrink-0 ${
            activeLayer === "live_rain"
              ? "bg-gradient-to-r from-emerald-500 to-sky-500 text-black border-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.7)] font-black"
              : "bg-black/80 text-muted-foreground hover:text-white border-white/15"
          }`}
        >
          <span>Rain &amp; Wind</span>
        </button>

        {/* 2. Live Wind Stream */}
        <button
          type="button"
          onClick={() => setActiveLayer("live_wind")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${
            activeLayer === "live_wind"
              ? "bg-teal-500 text-black border-teal-300 shadow-[0_0_16px_rgba(20,184,166,0.6)] font-extrabold"
              : "bg-black/80 text-muted-foreground hover:text-white border-white/15"
          }`}
        >
          <span>Wind Stream</span>
        </button>

        {/* 3. Live Doppler Rain Radar */}
        <button
          type="button"
          onClick={() => setActiveLayer("live_radar")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${
            activeLayer === "live_radar"
              ? "bg-sky-500 text-black border-sky-300 shadow-[0_0_16px_rgba(14,165,233,0.6)] font-extrabold"
              : "bg-black/80 text-muted-foreground hover:text-white border-white/15"
          }`}
        >
          <span>Doppler Radar</span>
        </button>

        {/* 4. Live Animated Cloud Movement */}
        <button
          type="button"
          onClick={() => setActiveLayer("live_clouds")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer border flex items-center gap-1.5 shrink-0 ${
            activeLayer === "live_clouds"
              ? "bg-slate-200 text-black border-white shadow-[0_0_16px_rgba(255,255,255,0.6)] font-extrabold"
              : "bg-black/80 text-muted-foreground hover:text-white border-white/15"
          }`}
        >
          <span>Cloud Flow</span>
        </button>

        {/* 5. NASA Terra Satellite HD */}
        <button
          type="button"
          onClick={() => setActiveLayer("truecolor")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${
            activeLayer === "truecolor"
              ? "bg-emerald-600/90 text-white border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.5)] font-bold"
              : "bg-black/80 text-muted-foreground hover:text-white border-white/15"
          }`}
        >
          <span>NASA Satellite</span>
        </button>

        {/* 6. Air Quality & AQI */}
        <button
          type="button"
          onClick={() => setActiveLayer("aqi")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${
            activeLayer === "aqi"
              ? "bg-amber-600/90 text-white border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.5)] font-bold"
              : "bg-black/80 text-muted-foreground hover:text-white border-white/15"
          }`}
        >
          <span>Air Quality</span>
        </button>

        {/* 7. Mandi Transport Corridors */}
        <button
          type="button"
          onClick={() => setActiveLayer("hybrid")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${
            activeLayer === "hybrid"
              ? "bg-indigo-600/90 text-white border-indigo-400 shadow-[0_0_14px_rgba(99,102,241,0.5)] font-bold"
              : "bg-black/80 text-muted-foreground hover:text-white border-white/15"
          }`}
        >
          <span>Mandi Corridors</span>
        </button>
      </div>

      {/* 1. Real-Time Moving Cloud Radar Viewport (Windy Live Particle Stream) */}
      {isLiveStreamActive && (
        <iframe
          key={`${activeLayer}-${currentLat}-${currentLon}-${isAllIndia}`}
          src={liveStreamUrl}
          className="w-full h-full min-h-[480px] sm:min-h-[560px] border-0 z-10 bg-[#060a0e]"
          title="Live Animated Cloud and Weather Radar Movement Map"
          loading="lazy"
          allow="geolocation"
        />
      )}

      {/* 2. Leaflet NASA Satellite / AQI / Mandi Viewport */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full min-h-[480px] sm:min-h-[560px] z-10 bg-[#060a0e] ${
          isLiveStreamActive ? "hidden" : "block"
        }`}
      />

      {/* Bottom Floating Glass HUD: Live Meteorological Diagnostics */}
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
              {/* Cloud Coverage Indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300">
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span>Cloud Cover {nasaData.cloud_fraction_pct}%</span>
              </div>

              {/* Wind Speed & Direction */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-slate-200">
                <Wind className="h-3.5 w-3.5 text-sky-400" />
                <span>Wind {nasaData.wind_speed_mps} m/s</span>
              </div>

              {/* AQI Pill */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${aqiColorClass}`}>
                <Activity className="h-3.5 w-3.5" />
                <span>AQI {nasaData.estimated_aqi}</span>
                <span className="text-[10px] opacity-80 font-normal">({nasaData.aqi_status})</span>
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
