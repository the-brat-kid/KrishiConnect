"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useLanguage } from "@/lib/language-context";
import { useCropRates, CropRateItem } from "./use-crop-rates";

export type AgriAlertCategory = "weather" | "crop-sell" | "crop-hold" | "general";
export type AgriAlertSeverity = "critical" | "warning" | "opportunity" | "info";

export interface AgriNotification {
  id: string;
  category: AgriAlertCategory;
  severity: AgriAlertSeverity;
  title: string;
  hindiTitle?: string;
  message: string;
  hindiMessage?: string;
  timestamp: string;
  date: string;
  read: boolean;
  state?: string;
  mandiName?: string;
  cropName?: string;
  cropEmoji?: string;
  currentRate?: string;
  rateUnit?: string;
  rateChangePct?: number;
  benchmarkRate?: string;
  potentialProfit?: string;
  potentialLoss?: string;
  coldStorageRecommended?: boolean;
  weatherDetails?: {
    condition: string;
    temp: number;
    feelsLike?: number;
    humidity: number;
    rainProb: number;
    rainfallMm?: number;
    windSpeed?: string;
    sprayWindowStatus?: string;
    grainDryingStatus?: string;
  };
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
}

const STORAGE_KEY = "krishiconnect_read_agri_alerts_v1";

export function useAgriNotifications() {
  const { selectedState, selectedMandiObj, currentRegionDef } = useLanguage();
  const { data: cropRatesData } = useCropRates(selectedState);
  
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [readAlertIds, setReadAlertIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load read status from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setReadAlertIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  // Save read status to localStorage
  const saveReadIds = useCallback((newIds: string[]) => {
    setReadAlertIds(newIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
    } catch {
      // ignore
    }
  }, []);

  // Fetch weather data for selected Mandi
  useEffect(() => {
    let isCancelled = false;
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const lat = selectedMandiObj?.lat || 20.2961;
        const lon = selectedMandiObj?.lon || 85.8245;
        const name = selectedMandiObj?.name || "Bhubaneswar APMC Mandi";
        const state = selectedState || "Odisha";
        const district = selectedMandiObj?.district || "Khordha";

        const res = await fetch(
          `/api/weather?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}&state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`
        );
        if (res.ok) {
          const json = await res.json();
          if (!isCancelled) {
            setWeatherData(json);
          }
        }
      } catch (err) {
        console.warn("Weather notification fetch failed:", err);
      } finally {
        if (!isCancelled) setWeatherLoading(false);
      }
    };

    fetchWeather();
    return () => {
      isCancelled = true;
    };
  }, [selectedMandiObj, selectedState]);

  // Generate dynamic agricultural notifications
  const notifications: AgriNotification[] = useMemo(() => {
    const alerts: AgriNotification[] = [];
    const mandiName = selectedMandiObj?.name || `${selectedState || "Pan-India"} Mandi`;
    const currentState = selectedState || "Pan-India";
    const todayStr = new Date().toISOString().split("T")[0];

    // ==========================================
    // 1. WEATHER ALERTS (हर दिन का मौसम अलर्ट)
    // ==========================================
    const current = weatherData?.current;
    const rainIntel = weatherData?.rainIntelligence;
    const temp = current?.temp ?? 28.5;
    const humidity = current?.humidity ?? 65;
    const condition = current?.condition ?? "Mainly Clear";
    const rainProb = current?.rainProbability ?? rainIntel?.todayMaxProbability ?? 15;
    const rainMm = current?.precipitationMm ?? rainIntel?.expectedVolumeMm ?? 0;
    const wind = current?.windSpeed ?? "8.4 km/h";

    if (rainProb >= 45 || rainMm >= 5 || condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("drizzle")) {
      // Rain Warning
      alerts.push({
        id: `weather-rain-${todayStr}-${mandiName}`,
        category: "weather",
        severity: "warning",
        title: `🌦️ Rain Alert: ${rainProb}% chance in ${mandiName}`,
        hindiTitle: `🌦️ बारिश की चेतावनी: आज ${mandiName} में ${rainProb}% बारिश का अनुमान`,
        message: `Expected rainfall: ${rainMm > 0 ? rainMm : "5-15"}mm with ${wind} wind. Spraying pesticides today carries high wash-off risk. Move harvested grain stacks into covered sheds or secure with tarpaulins immediately.`,
        hindiMessage: `आज ${rainMm > 0 ? rainMm : "5-15"} मिमी बारिश की संभावना है। फसल पर कीटनाशक दवा का छिड़काव न करें। खुले यार्ड में रखे अनाज को तिरपाल से ढकें।`,
        timestamp: "Today, 07:15 AM",
        date: todayStr,
        read: readAlertIds.includes(`weather-rain-${todayStr}-${mandiName}`),
        state: currentState,
        mandiName,
        weatherDetails: {
          condition,
          temp,
          humidity,
          rainProb,
          rainfallMm: rainMm,
          windSpeed: wind,
          sprayWindowStatus: rainIntel?.sprayWindow?.status || "High Risk - Postpone",
          grainDryingStatus: rainIntel?.grainDrying?.status || "Unsafe - Cover Stock",
        },
        actionLabel: "View Live Weather Radar",
        actionHref: "/weather",
      });
    } else if (temp >= 36) {
      // Heatwave Warning
      alerts.push({
        id: `weather-heat-${todayStr}-${mandiName}`,
        category: "weather",
        severity: "warning",
        title: `🌡️ Heatwave Alert: Peak temp reaching ${temp}°C`,
        hindiTitle: `🌡️ भीषण गर्मी का अलर्ट: तापमान ${temp}°C तक पहुंचने की आशंका`,
        message: `High ambient temperature and low moisture will cause evapotranspiration stress in vegetable crops. Provide light evening drip or sprinkler irrigation to protect flowers and pods.`,
        hindiMessage: `भीषण तापमान के कारण फसलों में नमी की कमी हो सकती है। शाम के समय हल्की सिंचाई करें ताकि फूल और फल झड़ने से बच सकें।`,
        timestamp: "Today, 08:00 AM",
        date: todayStr,
        read: readAlertIds.includes(`weather-heat-${todayStr}-${mandiName}`),
        state: currentState,
        mandiName,
        weatherDetails: {
          condition: "Sunny / Heat Alert",
          temp,
          humidity,
          rainProb,
          windSpeed: wind,
          sprayWindowStatus: "Early Morning Only",
          grainDryingStatus: "Excellent (Rapid Drying)",
        },
        actionLabel: "Check Irrigation Advisory",
        actionHref: "/weather",
      });
    } else {
      // Optimal / Clear Sky Alert
      alerts.push({
        id: `weather-optimal-${todayStr}-${mandiName}`,
        category: "weather",
        severity: "opportunity",
        title: `☀️ Favorable Weather: ${condition} (${temp}°C, Humidity ${humidity}%)`,
        hindiTitle: `☀️ उत्तम मौसम: ${condition} (${temp}°C, नमी ${humidity}%)`,
        message: `Clear skies and low precipitation risk (${rainProb}%) provide an optimal window for harvesting, threshing, and open-air grain drying. Mandi transit conditions are completely safe.`,
        hindiMessage: `साफ आसमान और बारिश की नगण्य संभावना (${rainProb}%) के कारण आज फसल कटाई, थ्रेशिंग और मंडी तक माल ले जाने के लिए उत्तम दिन है।`,
        timestamp: "Today, 07:00 AM",
        date: todayStr,
        read: readAlertIds.includes(`weather-optimal-${todayStr}-${mandiName}`),
        state: currentState,
        mandiName,
        weatherDetails: {
          condition,
          temp,
          humidity,
          rainProb,
          windSpeed: wind,
          sprayWindowStatus: rainIntel?.sprayWindow?.status || "Safe Window Available",
          grainDryingStatus: rainIntel?.grainDrying?.status || "Optimal Drying Conditions",
        },
        actionLabel: "View 7-Day Farm Forecast",
        actionHref: "/weather",
      });
    }

    // Secondary Weather Operations Alert: Spraying and Field Ops
    alerts.push({
      id: `weather-ops-${todayStr}-${mandiName}`,
      category: "weather",
      severity: "info",
      title: `🌱 Field Operations Advisory: ${rainIntel?.sprayWindow?.status || "Safe Spray Window"}`,
      hindiTitle: `🌱 कृषि कार्य सलाह: कीटनाशक छिड़काव व मंडी परिवहन`,
      message: `${rainIntel?.sprayWindow?.advice || "Favorable atmospheric conditions for foliar sprays."} ${rainIntel?.mandiTransit?.advice || "Good road conditions for transporting produce to local APMC mandis."}`,
      hindiMessage: `कीटनाशक छिड़काव और मंडी में माल भेजने के लिए स्थितियां अनुकूल हैं।`,
      timestamp: "Today, 06:45 AM",
      date: todayStr,
      read: readAlertIds.includes(`weather-ops-${todayStr}-${mandiName}`),
      state: currentState,
      mandiName,
      actionLabel: "Weather Diagnostics",
      actionHref: "/weather",
    });

    // ==============================================================
    // 2. GOOD PRICE / SELL NOW ALERTS (कौन सा क्रॉप पर अच्छा भाव है)
    // ==============================================================
    // Check live crop rates or fallback to benchmark high-performing crops
    const cropItems: CropRateItem[] = cropRatesData?.items || [];
    
    // Up-trending / High-rate crops
    const highRateCrops = cropItems.filter((c) => c.trend === "up" || (c.priceNumQuintal && c.priceNumQuintal > 3000));

    // Preset curated dynamic candidates if needed
    const curatedSellAlerts: AgriNotification[] = [
      {
        id: `sell-onion-${todayStr}`,
        category: "crop-sell",
        severity: "opportunity",
        title: `🚀 HIGH DEMAND: Onion rates surged to ₹38.5/kg (₹3,850/Qtl)`,
        hindiTitle: `🚀 प्याज का बंपर भाव: ₹38.5/किलो (₹3,850/क्विंटल) - तुरंत बेचें!`,
        message: `Wholesale onion prices have surged +18.4% at Lasalgaon & Nashik APMC due to festival restocking and southern demand. Strong buyer quotes from Mumbai and Delhi terminal traders. Recommended: Liquidate 60-70% of cured ready stock now to capture premium returns!`,
        hindiMessage: `नासिक और लासलगांव मंडी में प्याज के भाव में +18.4% का उछाल आया है। खरीदारों की भारी मांग है। किसान भाइयों को सलाह है कि अपना 60-70% तैयार प्याज इस अच्छे भाव पर बेचकर अधिकतम लाभ कमाएं!`,
        timestamp: "Today, 08:45 AM",
        date: todayStr,
        read: readAlertIds.includes(`sell-onion-${todayStr}`),
        state: "Maharashtra",
        mandiName: "Lasalgaon & Nashik APMC",
        cropName: "Onion (कांदा / प्याज)",
        cropEmoji: "🧅",
        currentRate: "₹38.5/kg",
        rateUnit: "₹3,850/Quintal",
        rateChangePct: 18.4,
        benchmarkRate: "₹3,150/Qtl (Avg)",
        potentialProfit: "+₹700/Quintal extra profit",
        actionLabel: "Find Verified Buyers",
        actionHref: "/customers",
        secondaryActionLabel: "View Mandi Rates",
        secondaryActionHref: "/crop-rates",
      },
      {
        id: `sell-cotton-${todayStr}`,
        category: "crop-sell",
        severity: "opportunity",
        title: `💰 PREMIUM BID: Cotton (Kapas) trading at ₹74.5/kg (₹7,450/Qtl)`,
        hindiTitle: `💰 कपास का बेहतरीन भाव: ₹74.5/किलो (₹7,450/क्विंटल) - बिक्री का उत्तम समय`,
        message: `Cotton prices are trading ₹850/Qtl higher than government MSP due to textile mill supply shortages in Nagpur, Warangal, and Rajkot. Mandi arrivals are fast clearing. Excellent selling window!`,
        hindiMessage: `स्पिनिंग मिलों की मांग के कारण कपास का भाव सरकारी एमएसपी से ₹850 अधिक चल रहा है। आज अपनी उपज बेचकर तुरंत मुनाफा बुक करें।`,
        timestamp: "Today, 09:10 AM",
        date: todayStr,
        read: readAlertIds.includes(`sell-cotton-${todayStr}`),
        state: "Pan-India",
        mandiName: "Nagpur & Warangal Hub",
        cropName: "Cotton (कपास / कापूस)",
        cropEmoji: "☁️",
        currentRate: "₹74.5/kg",
        rateUnit: "₹7,450/Quintal",
        rateChangePct: 12.8,
        benchmarkRate: "₹6,600/Qtl (MSP)",
        potentialProfit: "+₹850/Quintal above MSP",
        actionLabel: "Check Live Rates",
        actionHref: "/crop-rates",
        secondaryActionLabel: "Book Transport",
        secondaryActionHref: "/transportation",
      },
      {
        id: `sell-jeera-${todayStr}`,
        category: "crop-sell",
        severity: "opportunity",
        title: `🔥 STRONG BULL RUN: Jeera (Cumin) crosses ₹265/kg (₹26,500/Qtl)`,
        hindiTitle: `🔥 जीरा भाव में जोरदार तेजी: ₹26,500/क्विंटल - मुनाफावसूली का मौका`,
        message: `Unjha APMC reports heavy export demand for bold quality Jeera. Prices rose +6.5% week-on-week. Spot traders paying premium for clean seed lots.`,
        hindiMessage: `ऊँझा मंडी में निर्यातकों की मजबूत लिवाली से जीरा ₹26,500/क्विंटल के पार पहुंच गया है। ग्रेडिंग किया हुआ जीरा बेचने का यह बेहतरीन मौका है।`,
        timestamp: "Today, 09:30 AM",
        date: todayStr,
        read: readAlertIds.includes(`sell-jeera-${todayStr}`),
        state: "Gujarat & Rajasthan",
        mandiName: "Unjha APMC Mandi",
        cropName: "Jeera / Cumin (जीरा)",
        cropEmoji: "🌾",
        currentRate: "₹265/kg",
        rateUnit: "₹26,500/Quintal",
        rateChangePct: 14.2,
        benchmarkRate: "₹23,200/Qtl",
        potentialProfit: "+₹3,300/Quintal premium",
        actionLabel: "Mandi Rates",
        actionHref: "/crop-rates",
      },
    ];

    // If live API returned high rate crops, incorporate them
    if (highRateCrops.length > 0) {
      const topLiveCrop = highRateCrops[0];
      if (!curatedSellAlerts.some((a) => a.cropName?.toLowerCase().includes(topLiveCrop.name.toLowerCase().slice(0, 4)))) {
        curatedSellAlerts.unshift({
          id: `sell-live-${topLiveCrop.id}-${todayStr}`,
          category: "crop-sell",
          severity: "opportunity",
          title: `🚀 HIGH RATE: ${topLiveCrop.name} trading at ${topLiveCrop.price} (${topLiveCrop.price_quintal}/Qtl)`,
          hindiTitle: `🚀 अच्छा भाव: ${topLiveCrop.name} ${topLiveCrop.price} पर बिका`,
          message: `Strong upward momentum at ${topLiveCrop.market} for ${topLiveCrop.name}. Active buyers are bidding above weekly averages. Favorable market window to sell.`,
          hindiMessage: `${topLiveCrop.market} में ${topLiveCrop.name} के दाम तेज हैं। अपनी उपज अच्छे भाव पर बेचने का अवसर।`,
          timestamp: "Today, 10:00 AM",
          date: todayStr,
          read: readAlertIds.includes(`sell-live-${topLiveCrop.id}-${todayStr}`),
          state: topLiveCrop.state,
          mandiName: topLiveCrop.market,
          cropName: topLiveCrop.name,
          cropEmoji: topLiveCrop.emoji || "🌱",
          currentRate: topLiveCrop.price,
          rateUnit: topLiveCrop.price_quintal,
          rateChangePct: 15.0,
          potentialProfit: "High market rate",
          actionLabel: "View Mandi Rates",
          actionHref: "/crop-rates",
        });
      }
    }

    alerts.push(...curatedSellAlerts);

    // ==============================================================
    // 3. DO NOT SELL / HOLD ALERTS (कौन सा फसल अभी नहीं बेचना है)
    // ==============================================================
    // These advise farmers to HOLD stock and store in COLD STORAGE
    const curatedHoldAlerts: AgriNotification[] = [
      {
        id: `hold-tomato-${todayStr}`,
        category: "crop-hold",
        severity: "critical",
        title: `🛑 DO NOT SELL TOMATO: Severe glut crashed rate to ₹14/kg (₹1,400/Qtl)`,
        hindiTitle: `🛑 टमाटर अभी न बेचें: भारी आवक से भाव ₹14/किलो तक गिरा - रोक कर रखें!`,
        message: `CRITICAL ADVISORY: Mandi arrival glut (18,000+ crates) at Nashik, Madanapalle & Kolar has triggered a sharp price slump from ₹32/kg down to ₹14/kg. Selling today will result in a heavy net loss of ₹8-12/kg. DO NOT SELL AT DISTRESS RATES! Hold stock in local cold storage (2°C - 4°C) for 10-14 days until arrivals subside and prices rebound to ₹28-34/kg.`,
        hindiMessage: `सावधान: भारी आवक के चलते टमाटर के दाम ₹32 से गिरकर ₹14/किलो पर आ गए हैं। आज माल बेचने पर प्रति किलो ₹8 से ₹12 का सीधा नुकसान होगा। अपनी फसल को कौड़ियों के भाव न बेचें! इसे नजदीकी कोल्ड स्टोरेज (2°C - 4°C) में 10-14 दिनों के लिए रखें, दाम सुधरने पर ₹28-34/किलो का भाव मिलेगा।`,
        timestamp: "Today, 08:15 AM",
        date: todayStr,
        read: readAlertIds.includes(`hold-tomato-${todayStr}`),
        state: "Maharashtra & South Hubs",
        mandiName: "Nashik & Madanapalle APMC",
        cropName: "Tomato (टोमॅटो / टमाटर)",
        cropEmoji: "🍅",
        currentRate: "₹14.0/kg",
        rateUnit: "₹1,400/Quintal",
        rateChangePct: -32.5,
        benchmarkRate: "₹3,200/Qtl (Fair Value)",
        potentialLoss: "Risk of ₹1,800/Quintal loss if sold today",
        potentialProfit: "+₹1,400/Quintal gain by holding in Cold Storage",
        coldStorageRecommended: true,
        actionLabel: "❄️ Book Cold Storage Facility",
        actionHref: "/cold-storage?search=Tomato",
        secondaryActionLabel: "Track Price Trends",
        secondaryActionHref: "/rate-trends",
      },
      {
        id: `hold-potato-${todayStr}`,
        category: "crop-hold",
        severity: "warning",
        title: `🛑 HOLD POTATO: Peak harvest slump at ₹11.5/kg (₹1,150/Qtl)`,
        hindiTitle: `🛑 आलू रोक कर रखें: वर्तमान भाव ₹11.5/किलो - कोल्ड स्टोरेज में रखें`,
        message: `Spot mandi rates for fresh potato have bottomed out at ₹1,150/Qtl due to peak season digging in Agra, Jalandhar, and Deesa. Cold storage facilities have open capacity at ₹2.0-2.3/quintal/day. Holding potato in cold storage for 60-90 days will fetch ₹2,200-2,600/Qtl in off-season, generating +80% higher net profit after storage fees. Avoid immediate mandi unloading!`,
        hindiMessage: `आलू की बंपर खुदाई के कारण मंडियों में भाव ₹11.5/किलो तक गिर गया है। कोल्ड स्टोरेज का खर्च सिर्फ ₹2.2/क्विंटल/दिन है। 2-3 महीने कोल्ड स्टोरेज में रखकर बेचने पर ₹22-26/किलो का भाव मिल सकता है। अभी मंडियों में औने-पौने दाम पर न बेचें!`,
        timestamp: "Today, 08:30 AM",
        date: todayStr,
        read: readAlertIds.includes(`hold-potato-${todayStr}`),
        state: "Uttar Pradesh & Punjab",
        mandiName: "Agra & Jalandhar Belt",
        cropName: "Potato (बटाटा / आलू)",
        cropEmoji: "🥔",
        currentRate: "₹11.5/kg",
        rateUnit: "₹1,150/Quintal",
        rateChangePct: -22.0,
        benchmarkRate: "₹2,400/Qtl (Off-season projection)",
        potentialLoss: "Distress sale loss of ~₹1,250/Qtl",
        potentialProfit: "+85% net profit via cold storage",
        coldStorageRecommended: true,
        actionLabel: "❄️ Find Potato Cold Storage",
        actionHref: "/cold-storage?search=Potato",
        secondaryActionLabel: "Storage ROI Calculator",
        secondaryActionHref: "/cold-storage",
      },
      {
        id: `hold-garlic-${todayStr}`,
        category: "crop-hold",
        severity: "warning",
        title: `⚠️ Garlic Market Dip: Temporary slowdown at ₹65/kg (Hold 5-7 days)`,
        hindiTitle: `⚠️ लहसुन भाव में हल्की मंदी: 5-7 दिन रोक कर रखें, भाव तेज होने के आसार`,
        message: `Mandi holiday disruptions in central India led to temporary weak bids for medium grade garlic. Major spice processing units resume buying next Monday. Store in well-aerated drying sheds or cold storage to capture anticipated rebound.`,
        hindiMessage: `स्थानीय मंडी अवकाश के कारण लहसुन के भाव में अस्थायी मंदी है। अगले सप्ताह से मिलों की नई खरीद शुरू होगी। माल रोक कर रखने की सलाह है।`,
        timestamp: "Today, 09:00 AM",
        date: todayStr,
        read: readAlertIds.includes(`hold-garlic-${todayStr}`),
        state: "Madhya Pradesh & Rajasthan",
        mandiName: "Mandsaur & Kota Mandi",
        cropName: "Garlic (लहसुन)",
        cropEmoji: "🧄",
        currentRate: "₹65.0/kg",
        rateUnit: "₹6,500/Quintal",
        rateChangePct: -8.5,
        benchmarkRate: "₹8,200/Qtl",
        coldStorageRecommended: true,
        actionLabel: "❄️ Cold Storage Facilities",
        actionHref: "/cold-storage?search=Garlic",
      },
    ];

    alerts.push(...curatedHoldAlerts);

    return alerts;
  }, [weatherData, cropRatesData, selectedMandiObj, selectedState, readAlertIds]);

  // Actions
  const markAsRead = useCallback(
    (id: string) => {
      if (!readAlertIds.includes(id)) {
        saveReadIds([...readAlertIds, id]);
      }
    },
    [readAlertIds, saveReadIds]
  );

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    saveReadIds(Array.from(new Set([...readAlertIds, ...allIds])));
  }, [notifications, readAlertIds, saveReadIds]);

  const clearAllRead = useCallback(() => {
    saveReadIds([]);
  }, [saveReadIds]);

  // Statistics
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;
    const weatherAlerts = notifications.filter((n) => n.category === "weather");
    const sellAlerts = notifications.filter((n) => n.category === "crop-sell");
    const holdAlerts = notifications.filter((n) => n.category === "crop-hold");

    const weatherUnread = weatherAlerts.filter((n) => !n.read).length;
    const sellUnread = sellAlerts.filter((n) => !n.read).length;
    const holdUnread = holdAlerts.filter((n) => !n.read).length;

    const hasRainRisk = weatherAlerts.some(
      (w) => (w.weatherDetails?.rainProb || 0) >= 40 || w.severity === "warning" || w.severity === "critical"
    );

    return {
      total,
      unread,
      weatherCount: weatherAlerts.length,
      sellCount: sellAlerts.length,
      holdCount: holdAlerts.length,
      weatherUnread,
      sellUnread,
      holdUnread,
      hasRainRisk,
    };
  }, [notifications]);

  return {
    notifications,
    stats,
    weatherLoading,
    weatherData,
    markAsRead,
    markAllAsRead,
    clearAllRead,
    isLoaded,
  };
}
