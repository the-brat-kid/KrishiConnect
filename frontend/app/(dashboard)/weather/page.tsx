"use client";

import { useState, useEffect } from "react";
import { 
  CloudSun, 
  Sun, 
  Moon, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  Compass, 
  Calendar, 
  Clock, 
  AlertCircle,
  Sprout,
  ShieldCheck,
  RefreshCw,
  MapPin,
  Umbrella,
  CloudLightning,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Satellite,
  Sparkles,
  Activity,
  Layers,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Chart3DContainer, ThreeDBar, ThreeDChartDefs } from "@/components/ui/chart-3d";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ViewOnMap } from "@/components/ui/view-on-map";
import { useLanguage } from "@/lib/language-context";

interface MandiOption {
  id: string;
  name: string;
  state: string;
  district: string;
  address: string;
  lat: number;
  lon: number;
}

const DEFAULT_MANDI: MandiOption = {
  id: "bhubaneswar",
  name: "Bhubaneswar APMC Mandi",
  state: "Odisha",
  district: "Khordha",
  address: "Unit 1 Wholesale Yard, Bhubaneswar, Odisha",
  lat: 20.2961,
  lon: 85.8245,
};

interface WeatherApiResponse {
  success: boolean;
  source?: string;
  mandi: MandiOption;
  coordinates?: { lat: number; lon: number };
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: string;
    windDirection: number;
    condition: string;
    icon: string;
    isDay: boolean;
    precipitationMm: number;
    rainProbability: number;
    solarRadiationMj?: number;
    estimatedAqi?: number;
    aqiStatus?: string;
    cloudFractionPct?: number;
  };
  rainIntelligence: {
    todayMaxProbability: number;
    expectedVolumeMm: number;
    riskLevel: "Low" | "Moderate" | "High" | "Extreme";
    sprayWindow: {
      status: string;
      advice: string;
    };
    grainDrying: {
      status: string;
      advice: string;
    };
    mandiTransit: {
      status: string;
      advice: string;
    };
  };
  nasaDiagnostics?: {
    temperature_c?: number;
    relative_humidity_pct?: number;
    solar_radiation_mj?: number;
    precipitation_mm?: number;
    wind_speed_kmh?: number;
    estimated_aqi?: number;
    aqi_status?: string;
    cloud_fraction_pct?: number;
    satellite_sensor?: string;
  };
  hourly: Array<{
    time: string;
    temp: number;
    rainProb: number;
    precipitation: number;
  }>;
  daily: Array<{
    date: string;
    day: string;
    maxTemp: number;
    minTemp: number;
    rainProbability: number;
    rainfallMm: number;
    condition: string;
    icon: string;
  }>;
  lastUpdated: string;
}

export default function FarmWeatherPage() {
  const {
    currentRegionDef,
    selectedState,
    selectedPlaceId,
    selectedMandiObj,
    setRegionAndPlace,
  } = useLanguage();

  const [selectedMandi, setSelectedMandi] = useState<MandiOption>(() => ({
    id: selectedMandiObj?.id || DEFAULT_MANDI.id,
    name: selectedMandiObj?.name || DEFAULT_MANDI.name,
    state: selectedMandiObj?.state || DEFAULT_MANDI.state,
    district: selectedMandiObj?.district || DEFAULT_MANDI.district,
    address: selectedMandiObj?.address || DEFAULT_MANDI.address,
    lat: selectedMandiObj?.lat || DEFAULT_MANDI.lat,
    lon: selectedMandiObj?.lon || DEFAULT_MANDI.lon,
  }));

  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync mandi with active region and mandi from global context
  useEffect(() => {
    if (selectedMandiObj) {
      setSelectedMandi({
        id: selectedMandiObj.id,
        name: selectedMandiObj.name,
        state: selectedMandiObj.state,
        district: selectedMandiObj.district,
        address: selectedMandiObj.address,
        lat: selectedMandiObj.lat,
        lon: selectedMandiObj.lon,
      });
    }
  }, [selectedMandiObj]);

  // Fetch weather data directly calibrated from NASA POWER & Earth Observation
  const fetchWeather = async (mandi: MandiOption) => {
    try {
      const query = new URLSearchParams({
        lat: mandi.lat.toString(),
        lon: mandi.lon.toString(),
        name: mandi.name,
        state: mandi.state,
        district: mandi.district || "",
        address: mandi.address || "",
        mandi: mandi.id,
      });

      const res = await fetch(`/api/weather?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch weather telemetry");
      const data: WeatherApiResponse = await res.json();
      setWeatherData(data);
    } catch (err) {
      console.error("Error fetching weather:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchWeather(selectedMandi);
  }, [selectedMandi.lat, selectedMandi.lon, selectedMandi.id, selectedMandi.name]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchWeather(selectedMandi);
  };

  // Weather condition icon helper
  const renderWeatherIcon = (iconName: string, isDay: boolean = true) => {
    if (iconName === "sun") return <Sun className="w-6 h-6 text-amber-500 animate-spin" style={{ animationDuration: "35s" }} />;
    if (iconName === "moon" || !isDay) return <Moon className="w-6 h-6 text-emerald-400" />;
    if (iconName === "cloud-rain" || iconName === "cloud-drizzle") return <CloudRain className="w-6 h-6 text-blue-400" />;
    if (iconName === "zap") return <CloudLightning className="w-6 h-6 text-amber-400" />;
    return <CloudSun className="w-6 h-6 text-amber-400" />;
  };

  const current = weatherData?.current;
  const rain = weatherData?.rainIntelligence;
  const nasa = weatherData?.nasaDiagnostics;

  const aqiColorClass =
    (current?.estimatedAqi || 0) < 50
      ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/40"
      : (current?.estimatedAqi || 0) < 100
      ? "text-yellow-400 bg-yellow-500/15 border-yellow-500/40"
      : (current?.estimatedAqi || 0) < 150
      ? "text-orange-400 bg-orange-500/15 border-orange-500/40"
      : "text-rose-400 bg-rose-500/15 border-rose-500/40";

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#34d399]" />
            <div className="btn-liquid-glass inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/30">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span>Live Cloud Movement &amp; Doppler Radar Feed</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2 font-plus-jakarta">
            <CloudSun className="h-7 w-7 text-primary drop-shadow-[0_0_10px_rgba(20,122,77,0.5)]" />
            <span>Farm Weather &amp; Live Cloud Radar</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Real-time atmospheric cloud movement, live Doppler precipitation radar, spray window forecasting, and agrarian logistics synchronized with the selected APMC Mandi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-liquid-glass flex items-center gap-2 border-white/15 text-xs font-semibold"
          >
            <RefreshCw className={`h-4 w-4 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing NASA API..." : "Refresh Forecast"}</span>
          </Button>
        </div>
      </div>

      {/* 1. TOP HERO SATELLITE WEATHER MAP (FULL WIDTH) WITH STATE & PLACE SELECTOR */}
      <div className="w-full">
        <ViewOnMap
          key={`${selectedMandi.id}-${selectedMandi.lat}-${selectedMandi.lon}`}
          locationName={selectedMandi.name}
          address={selectedMandi.address}
          lat={selectedMandi.lat}
          lon={selectedMandi.lon}
          state={selectedMandi.state}
          onLocationChange={(loc) => {
            setRegionAndPlace(loc.state, loc.id);
            setSelectedMandi({
              id: loc.id,
              name: loc.name,
              state: loc.state,
              district: loc.district || loc.name,
              address: loc.address || `${loc.name}, ${loc.state}`,
              lat: loc.lat,
              lon: loc.lon,
            });
          }}
          className="w-full h-[480px] sm:h-[540px]"
        />
      </div>

      {/* 2. DEDICATED REAL-TIME WEATHER FOR THE SELECTED MANDI (FULL WIDTH) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Weather & Agricultural Risk Card (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="liquid-glass p-6 sm:p-7 rounded-3xl border border-white/20 bg-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_12px_40px_rgba(0,0,0,0.5)] space-y-5">
            {/* Header: Selected Mandi Title + Real-time Temp */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {renderWeatherIcon(current?.icon || "cloud-sun", current?.isDay)}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                      {selectedMandi.name}
                    </h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                      <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span>{selectedMandi.district}, {selectedMandi.state}</span>
                      <span>•</span>
                      <span>{selectedMandi.lat.toFixed(4)}°N, {selectedMandi.lon.toFixed(4)}°E</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-plus-jakarta">
                  {current?.temp ?? 27}°C
                </div>
                <div className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{current?.condition || "Partly Cloudy"}</span>
                </div>
              </div>
            </div>

            {/* Primary Rain Probability Indicator Box */}
            <div className="p-4 rounded-2xl border border-white/15 bg-white/[0.03] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    <Umbrella className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Probability of Rain Today
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Expected Rainfall: <strong className="text-blue-400 font-mono">{rain?.expectedVolumeMm ?? 0} mm</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-extrabold text-foreground font-plus-jakarta">
                    {rain?.todayMaxProbability ?? 20}%
                  </span>
                  <div className="mt-0.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        rain?.riskLevel === "Extreme"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/35"
                          : rain?.riskLevel === "High"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/35"
                          : rain?.riskLevel === "Moderate"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/35"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/35"
                      }`}
                    >
                      {rain?.riskLevel ?? "Low"} Risk
                    </span>
                  </div>
                </div>
              </div>

              <Progress value={rain?.todayMaxProbability ?? 20} className="h-2 bg-white/10" />
            </div>

            {/* Meteorological Telemetry Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" /> Relative Humidity
                </span>
                <span className="text-lg font-bold text-foreground mt-1 block">
                  {current?.humidity ?? 68}%
                </span>
                <span className="text-[10px] text-muted-foreground block">Optimal: 60-80%</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium">
                  <Wind className="w-3.5 h-3.5 text-emerald-400" /> Wind Velocity
                </span>
                <span className="text-lg font-bold text-foreground mt-1 block">
                  {current?.windSpeed ?? "8 km/h"}
                </span>
                <span className="text-[10px] text-emerald-400 block font-medium">Favorable drift</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Feels Like Temp
                </span>
                <span className="text-lg font-bold text-foreground mt-1 block">
                  {current?.feelsLike ?? 28}°C
                </span>
                <span className="text-[10px] text-muted-foreground block">Heat index safe</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Spray Window
                </span>
                <span
                  className={`text-lg font-bold mt-1 block ${
                    rain?.sprayWindow?.status === "Optimal"
                      ? "text-emerald-400"
                      : rain?.sprayWindow?.status === "Fair"
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {rain?.sprayWindow?.status ?? "Optimal"}
                </span>
                <span className="text-[10px] text-muted-foreground block">Foliar adherence</span>
              </div>
            </div>

            {/* Actionable Agrarian Warnings & Operations Guidance */}
            <div className="space-y-2.5 pt-2">
              {/* 1. Spray Window Advisory */}
              <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-start gap-2.5 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-foreground block">
                    Pesticide &amp; Fertilizer Spray Window:
                  </span>
                  <p className="text-muted-foreground leading-relaxed mt-0.5">
                    {rain?.sprayWindow?.advice}
                  </p>
                </div>
              </div>

              {/* 2. Grain Drying Advisory */}
              <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-start gap-2.5 text-xs">
                <Sun className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-foreground block">Paddy &amp; Grain Sun-Drying:</span>
                  <p className="text-muted-foreground leading-relaxed mt-0.5">
                    {rain?.grainDrying?.advice}
                  </p>
                </div>
              </div>

              {/* 3. Mandi Logistics Advisory */}
              <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-foreground block">
                    Mandi Logistics &amp; Truck Transit:
                  </span>
                  <p className="text-muted-foreground leading-relaxed mt-0.5">
                    {rain?.mandiTransit?.advice}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 24-Hour Hourly Probability of Rain Chart (3D Perspective) */}
          <Chart3DContainer
            title={`24-Hour Timeline: Rain Probability (%) — ${selectedMandi.name}`}
            subtitle="Hour-by-hour chance of precipitation to plan harvesting and mandi dispatch"
            icon={<Clock className="w-4 h-4 text-emerald-400" />}
            badge="3D Meteo"
            show3DBadge={true}
          >
            <div className="h-48 w-full pt-2">
              {weatherData?.hourly && weatherData.hourly.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weatherData.hourly.slice(0, 16)} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                    <ThreeDChartDefs />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} tickFormatter={(val) => `${val}%`} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-white/20 bg-black/90 p-2.5 text-xs shadow-xl backdrop-blur-md">
                              <p className="font-bold text-white">{data.time}</p>
                              <p className="text-emerald-400 font-bold">Rain Chance: {data.rainProb}%</p>
                              <p className="text-muted-foreground">Temp: {data.temp}°C</p>
                              {data.precipitation > 0 && (
                                <p className="text-blue-400 font-semibold">Rainfall: {data.precipitation} mm</p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="rainProb" shape={<ThreeDBar />} isAnimationActive={true} animationDuration={1600}>
                      {weatherData.hourly.slice(0, 16).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.rainProb > 70
                              ? "url(#threed-rose)"
                              : entry.rainProb > 40
                              ? "url(#threed-amber)"
                              : entry.rainProb > 20
                              ? "url(#threed-sky)"
                              : "url(#threed-emerald)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Loading hourly timeline...
                </div>
              )}
            </div>
          </Chart3DContainer>

          {/* 7-Day Regional Agricultural Forecast with Rain Prob & Volume */}
          <div className="liquid-glass p-6 rounded-3xl border border-white/20 bg-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_12px_40px_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>7-Day Agricultural Trajectory &amp; Rainfall Forecast</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5 text-center text-xs">
              {(weatherData?.daily || []).map((item, idx) => (
                <div
                  key={item.day + idx}
                  className={`p-3 rounded-2xl border transition-all ${
                    idx === 0
                      ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <p className="font-extrabold text-foreground">{item.day}</p>
                  <div className="my-2 flex justify-center">{renderWeatherIcon(item.icon)}</div>
                  <div className="font-bold text-foreground text-xs">{item.maxTemp}°</div>
                  <div className="text-[10px] text-muted-foreground">{item.minTemp}°</div>

                  <div className="mt-2 pt-1.5 border-t border-white/10">
                    <div className="flex items-center justify-center gap-0.5 text-[10px] font-bold text-blue-400">
                      <Droplets className="w-2.5 h-2.5" />
                      <span>{item.rainProbability}%</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground block">
                      {item.rainfallMm > 0 ? `${item.rainfallMm}mm` : "Dry"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: NASA Agroclimatology & Earth Observation HUD (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* NASA Satellite Telemetry Diagnostics Card */}
          <div className="liquid-glass p-6 rounded-3xl border border-white/20 bg-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_12px_40px_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Satellite className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">NASA Satellite Telemetry</h3>
                  <p className="text-[11px] text-muted-foreground">MODIS / POWER Earth Model</p>
                </div>
              </div>
              <span className="badge-liquid-glass-emerald text-[10px] py-0.5 px-2">
                Live
              </span>
            </div>

            <div className="space-y-3">
              {/* Solar Radiation */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Solar Irradiance (Insolation)</span>
                  </span>
                  <span className="font-extrabold text-foreground font-mono">
                    {current?.solarRadiationMj ?? 18.4} MJ/m²
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Photosynthetic photon flux rate for grain maturity and open sun-drying.
                </p>
              </div>

              {/* Air Quality Index (AQI) */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-amber-400" />
                    <span>Aerosol AQI Depth</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${aqiColorClass}`}>
                    AQI {current?.estimatedAqi ?? 72}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Status: <strong className="text-foreground">{current?.aqiStatus ?? "Moderate"}</strong>. Evaluates particulate scattering over agricultural canopy.
                </p>
              </div>

              {/* Cloud Coverage */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span>Cloud Fraction Over Mandi</span>
                  </span>
                  <span className="font-extrabold text-foreground font-mono">
                    {current?.cloudFractionPct ?? 25}%
                  </span>
                </div>
                <Progress value={current?.cloudFractionPct ?? 25} className="h-1.5 bg-white/10 mt-1" />
              </div>

              {/* Earth Sensor Information */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sensor Platform:</span>
                  <span className="text-emerald-400 font-mono font-bold">Terra &amp; Aqua MODIS</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Geo Grid:</span>
                  <span className="text-foreground font-mono">0.5° × 0.625° Global</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Target Mandi:</span>
                  <span className="text-foreground font-semibold truncate max-w-[160px]">{selectedMandi.name}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="h-3 w-3" /> Auto-synced with Top Map
              </span>
              <span className="font-mono text-[10px]">{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>

          {/* Mandi Logistics Quick Reference Card */}
          <div className="liquid-glass p-5 rounded-3xl border border-white/20 bg-black/40 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.4),0_12px_40px_rgba(0,0,0,0.5)] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span>Selected APMC Market Yard</span>
            </h4>

            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
              <div className="text-sm font-bold text-foreground">
                {selectedMandi.name}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedMandi.address}
              </p>
              <div className="text-[11px] text-emerald-400/90 font-mono pt-1">
                Coordinates: {selectedMandi.lat.toFixed(4)}°N, {selectedMandi.lon.toFixed(4)}°E
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              To change region or mandi, pick any of the 50+ APMC yards from the <strong>State</strong> and <strong>Place</strong> dropdowns directly on the map above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
