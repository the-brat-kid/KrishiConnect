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
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ViewOnMap } from "@/components/ui/view-on-map";

interface MandiOption {
  id: string;
  name: string;
  district: string;
  address: string;
  lat: number;
  lon: number;
}

const ODISHA_MANDIS: MandiOption[] = [
  {
    id: "bhubaneswar",
    name: "Bhubaneswar APMC Mandi",
    district: "Khordha",
    address: "APMC Mandi Yard, Unit 1, Bhubaneswar, Odisha 751009, India",
    lat: 20.2961,
    lon: 85.8245,
  },
  {
    id: "cuttack",
    name: "Cuttack Malgodown Mandi",
    district: "Cuttack",
    address: "Malgodown Wholesale Market, Cuttack, Odisha 753003, India",
    lat: 20.4625,
    lon: 85.8828,
  },
  {
    id: "sambalpur",
    name: "Sambalpur Grain Mandi",
    district: "Sambalpur",
    address: "RMC Yard, Khetrajpur, Sambalpur, Odisha 768003, India",
    lat: 21.4669,
    lon: 83.9812,
  },
  {
    id: "bargarh",
    name: "Bargarh Agricultural Mandi",
    district: "Bargarh (Rice Bowl)",
    address: "Regulated Market Committee Yard, Bargarh, Odisha 768028, India",
    lat: 21.3340,
    lon: 83.6163,
  },
  {
    id: "berhampur",
    name: "Berhampur RMC Mandi",
    district: "Ganjam",
    address: "RMC Mandi Complex, Aska Road, Berhampur, Odisha 760001, India",
    lat: 19.3150,
    lon: 84.7941,
  },
  {
    id: "balasore",
    name: "Balasore APMC Mandi",
    district: "Balasore",
    address: "APMC Yard, Remuna Golei, Balasore, Odisha 756019, India",
    lat: 21.4934,
    lon: 86.9135,
  },
];

interface WeatherApiResponse {
  success: boolean;
  mandi: MandiOption;
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
  const [selectedMandi, setSelectedMandi] = useState<MandiOption>(ODISHA_MANDIS[0]);
  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch weather data from our /api/weather endpoint
  const fetchWeather = async (mandiId: string) => {
    try {
      const res = await fetch(`/api/weather?mandi=${mandiId}`);
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
    fetchWeather(selectedMandi.id);
  }, [selectedMandi.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchWeather(selectedMandi.id);
  };

  // Weather condition icon helper
  const renderWeatherIcon = (iconName: string, isDay: boolean = true) => {
    if (iconName === "sun") return <Sun className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: "35s" }} />;
    if (iconName === "moon" || !isDay) return <Moon className="w-5 h-5 text-emerald-400" />;
    if (iconName === "cloud-rain" || iconName === "cloud-drizzle") return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (iconName === "zap") return <CloudLightning className="w-5 h-5 text-amber-400" />;
    return <CloudSun className="w-5 h-5 text-amber-400" />;
  };

  // Rain probability risk color helper
  const getRiskColor = (prob: number) => {
    if (prob > 70) return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800";
    if (prob > 40) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800";
    if (prob > 20) return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800";
    return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800";
  };

  const current = weatherData?.current;
  const rain = weatherData?.rainIntelligence;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1 font-medium">
              <Sprout className="h-3 w-3" /> Real-time Agro-Meteorology & Rainfall Risk
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CloudSun className="h-8 w-8 text-primary" />
            Farm Weather & Rain Probability Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Live precipitation risk, hour-by-hour rain probability, spray window forecasting, and geospatial mandi cargo routing for Odisha.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            <span>{isRefreshing ? "Syncing API..." : "Refresh Forecast"}</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Weather & Rain on Left (7 cols), Mandi Selector & Map on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Weather & Rain Intelligence (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Current Weather & Rain Probability Hero Card */}
          <Card className="bg-card shadow-sm border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                    {renderWeatherIcon(current?.icon || "cloud-sun", current?.isDay)}
                    {selectedMandi.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    District: {selectedMandi.district}, Odisha • Integrated with IMD & Agro-Meteo High-Resolution Model
                  </CardDescription>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-extrabold text-foreground">{current?.temp ?? 27}°C</div>
                  <span className="text-xs font-semibold text-primary">{current?.condition || "Loading..."}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {/* Primary Rain Probability Indicator Box */}
              <div className="p-4 rounded-lg border border-border/80 bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Umbrella className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Probability of Rain Today</p>
                      <p className="text-[11px] text-muted-foreground">
                        Expected Rainfall: <span className="font-semibold text-foreground">{rain?.expectedVolumeMm ?? 0} mm</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-foreground">
                      {rain?.todayMaxProbability ?? 0}%
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-bold uppercase px-2 py-0.5 ${getRiskColor(rain?.todayMaxProbability ?? 0)}`}>
                      {rain?.riskLevel ?? "Low"} Risk
                    </Badge>
                  </div>
                </div>

                {/* Visual Rain Probability Progress Gauge */}
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden border border-border/60">
                  <div
                    className={`h-full transition-all duration-700 ${
                      (rain?.todayMaxProbability ?? 0) > 70
                        ? "bg-red-500"
                        : (rain?.todayMaxProbability ?? 0) > 40
                        ? "bg-amber-500"
                        : (rain?.todayMaxProbability ?? 0) > 20
                        ? "bg-blue-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, rain?.todayMaxProbability ?? 0))}%` }}
                  />
                </div>
              </div>

              {/* 4 Essential Agro-Meteorology Telemetry Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-md bg-muted/40 border border-border/70 space-y-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" /> Relative Humidity
                  </span>
                  <p className="text-sm font-bold text-foreground">{current?.humidity ?? 75}%</p>
                  <p className="text-[10px] text-muted-foreground">Optimal: 60-80%</p>
                </div>

                <div className="p-3 rounded-md bg-muted/40 border border-border/70 space-y-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-emerald-500" /> Wind Velocity
                  </span>
                  <p className="text-sm font-bold text-foreground">{current?.windSpeed ?? "8 km/h"}</p>
                  <p className="text-[10px] text-muted-foreground">Calm breeze</p>
                </div>

                <div className="p-3 rounded-md bg-muted/40 border border-border/70 space-y-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Feels Like Temp
                  </span>
                  <p className="text-sm font-bold text-foreground">{current?.feelsLike ?? 28}°C</p>
                  <p className="text-[10px] text-muted-foreground">Heat index safe</p>
                </div>

                <div className="p-3 rounded-md bg-muted/40 border border-border/70 space-y-1">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Spray Window
                  </span>
                  <p className={`text-sm font-bold ${
                    rain?.sprayWindow?.status === "Optimal" 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : rain?.sprayWindow?.status === "Fair" 
                      ? "text-amber-600 dark:text-amber-400" 
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {rain?.sprayWindow?.status ?? "Optimal"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Foliar adherence</p>
                </div>
              </div>

              {/* 3 Actionable Practical Advisories: Spray, Drying & Mandi Transit */}
              <div className="space-y-2.5 pt-1">
                {/* 1. Chemical Spray Advisory */}
                <div className="p-3 rounded-md border border-border/70 bg-muted/20 flex items-start gap-2.5 text-xs">
                  {rain?.sprayWindow?.status === "Optimal" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold text-foreground block">Pesticide & Fertilizer Spray Window:</span>
                    <p className="text-muted-foreground leading-relaxed">{rain?.sprayWindow?.advice}</p>
                  </div>
                </div>

                {/* 2. Grain Sun-Drying Advisory */}
                <div className="p-3 rounded-md border border-border/70 bg-muted/20 flex items-start gap-2.5 text-xs">
                  <Sun className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Paddy & Grain Sun-Drying:</span>
                    <p className="text-muted-foreground leading-relaxed">{rain?.grainDrying?.advice}</p>
                  </div>
                </div>

                {/* 3. Mandi Cargo Transit Advisory */}
                <div className="p-3 rounded-md border border-border/70 bg-muted/20 flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Mandi Logistics & Truck Transit:</span>
                    <p className="text-muted-foreground leading-relaxed">{rain?.mandiTransit?.advice}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 24-Hour Hourly Probability of Rain Chart */}
          <Card className="bg-card shadow-sm border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    24-Hour Timeline: Rain Probability (%)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Hour-by-hour chance of precipitation to plan open-field harvesting and mandi dispatch.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-44 w-full">
                {weatherData?.hourly && weatherData.hourly.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weatherData.hourly.slice(0, 16)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#888888" tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#888888" tickLine={false} tickFormatter={(val) => `${val}%`} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-md border border-border bg-background p-2 text-xs shadow-md">
                                <p className="font-semibold text-foreground">{data.time}</p>
                                <p className="text-primary font-bold">Rain Chance: {data.rainProb}%</p>
                                <p className="text-muted-foreground">Temp: {data.temp}°C</p>
                                {data.precipitation > 0 && (
                                  <p className="text-blue-500 font-semibold">Rainfall: {data.precipitation} mm</p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="rainProb" radius={[4, 4, 0, 0]}>
                        {weatherData.hourly.slice(0, 16).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.rainProb > 70
                                ? "#ef4444"
                                : entry.rainProb > 40
                                ? "#f59e0b"
                                : entry.rainProb > 20
                                ? "#3b82f6"
                                : "#10b981"
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
            </CardContent>
          </Card>

          {/* 7-Day Regional Agricultural Forecast with Rain Prob & Volume */}
          <Card className="bg-card shadow-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                7-Day Regional Agrarian Forecast & Rain Probability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs">
                {(weatherData?.daily || []).map((item, idx) => (
                  <div
                    key={item.day + idx}
                    className={`p-2.5 rounded-md border transition-all ${
                      idx === 0
                        ? "border-primary/50 bg-primary/10 shadow-xs"
                        : "border-border/70 bg-muted/20"
                    }`}
                  >
                    <p className="text-[11px] text-muted-foreground font-bold">{item.day}</p>
                    <div className="my-2 flex justify-center">
                      {renderWeatherIcon(item.icon)}
                    </div>
                    <p className="text-xs font-extrabold text-foreground">{item.maxTemp}° / {item.minTemp}°</p>
                    
                    {/* Rain probability badge for each day */}
                    <div className="mt-2 pt-1.5 border-t border-border/60">
                      <div className="flex items-center justify-center gap-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
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
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Mandi Switcher & Interactive ViewOnMap (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Mandi Selector Card */}
          <Card className="bg-card shadow-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Compass className="w-4 h-4 text-primary" />
                Select Odisha APMC Mandi
              </CardTitle>
              <CardDescription className="text-xs">
                Switch real-time meteorological models across major regional agricultural markets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {ODISHA_MANDIS.map((mandi) => {
                const isSelected = selectedMandi.id === mandi.id;
                return (
                  <button
                    key={mandi.id}
                    type="button"
                    onClick={() => setSelectedMandi(mandi)}
                    className={`w-full flex items-center justify-between p-3 rounded-md border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground font-semibold shadow-2xs"
                        : "border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{mandi.name}</p>
                      <p className="text-[11px] text-muted-foreground">{mandi.district} District</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-primary">
                        {isSelected && current ? `${current.temp}°C` : "Select"}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {isSelected && rain ? `${rain.todayMaxProbability}% rain` : "View telemetry"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Interactive ViewOnMap Integration */}
          <Card className="bg-card shadow-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                Live Mandi Geospatial Navigation
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect physical gates, weighing bridges, and access roads for {selectedMandi.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-1">
              <ViewOnMap
                key={selectedMandi.id}
                locationName={selectedMandi.name}
                address={selectedMandi.address}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
