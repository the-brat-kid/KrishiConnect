import { NextResponse } from "next/server";

export const revalidate = 1800; // 30 minutes caching

export interface CropHistoryItem {
  id: string;
  name: string;
  color: string;
  image: string;
  unit: string;
  dailyPrices: number[];
  dailyPricesQuintal?: number[];
  retailPrices: string[];
  currentPrice: number;
  startPrice: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
}

const FALLBACK_HISTORY_ITEMS: CropHistoryItem[] = [
  {
    id: "potato",
    name: "Potato",
    color: "#d97706",
    image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Potato.jpg?width=48&quality=75&format=webp&resize=contain",
    unit: "1kg",
    dailyPrices: [17.8, 16.0, 16.5, 17.0, 18.0, 15.8],
    dailyPricesQuintal: [1775, 1600, 1650, 1700, 1800, 1575],
    retailPrices: ["₹23", "₹21", "₹22", "₹23", "₹24", "₹21"],
    currentPrice: 15.8,
    startPrice: 17.8,
    change: -2.0,
    changePercent: -11.2,
    trend: "down",
  },
  {
    id: "tomato",
    name: "Tomato",
    color: "#dc2626",
    image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Tomato.jpg?width=48&quality=75&format=webp&resize=contain",
    unit: "1kg",
    dailyPrices: [32.0, 30.0, 33.5, 30.0, 30.0, 30.0],
    dailyPricesQuintal: [3200, 3000, 3350, 3000, 3000, 3000],
    retailPrices: ["₹42", "₹39", "₹44", "₹39", "₹39", "₹39"],
    currentPrice: 30.0,
    startPrice: 32.0,
    change: -2.0,
    changePercent: -6.2,
    trend: "down",
  },
  {
    id: "onion",
    name: "Onion",
    color: "#b45309",
    image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Onion.jpg?width=48&quality=75&format=webp&resize=contain",
    unit: "1kg",
    dailyPrices: [49.0, 50.0, 50.0, 48.5, 50.0, 50.0],
    dailyPricesQuintal: [4900, 5000, 5000, 4850, 5000, 5000],
    retailPrices: ["₹65", "₹66", "₹66", "₹64", "₹66", "₹66"],
    currentPrice: 50.0,
    startPrice: 49.0,
    change: 1.0,
    changePercent: 2.0,
    trend: "up",
  },
  {
    id: "brinjal",
    name: "Brinjal",
    color: "#7c3aed",
    image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Brinjal.jpg?width=48&quality=75&format=webp&resize=contain",
    unit: "1kg",
    dailyPrices: [27.0, 32.0, 26.0, 26.0, 28.5, 27.5],
    dailyPricesQuintal: [2700, 3200, 2600, 2600, 2850, 2750],
    retailPrices: ["₹36", "₹42", "₹34", "₹34", "₹38", "₹36"],
    currentPrice: 27.5,
    startPrice: 27.0,
    change: 0.5,
    changePercent: 1.9,
    trend: "up",
  },
  {
    id: "green-chilli",
    name: "Green Chilli",
    color: "#16a34a",
    image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/GreenChilli.jpg?width=48&quality=75&format=webp&resize=contain",
    unit: "1kg",
    dailyPrices: [84.0, 80.0, 80.0, 55.0, 82.0, 58.0],
    dailyPricesQuintal: [8400, 8000, 8000, 5500, 8200, 5800],
    retailPrices: ["₹110", "₹105", "₹105", "₹75", "₹108", "₹78"],
    currentPrice: 58.0,
    startPrice: 84.0,
    change: -26.0,
    changePercent: -31.0,
    trend: "down",
  },
  {
    id: "cabbage",
    name: "Cabbage",
    color: "#059669",
    image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Cabbage.jpg?width=48&quality=75&format=webp&resize=contain",
    unit: "1kg",
    dailyPrices: [30.0, 31.0, 28.0, 30.0, 30.0, 30.0],
    dailyPricesQuintal: [3000, 3100, 2800, 3000, 3000, 3000],
    retailPrices: ["₹40", "₹41", "₹37", "₹40", "₹40", "₹40"],
    currentPrice: 30.0,
    startPrice: 30.0,
    change: 0.0,
    changePercent: 0.0,
    trend: "stable",
  },
  {
    id: "cauliflower",
    name: "Cauliflower",
    color: "#65a30d",
    image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Cauliflower.jpg?width=48&quality=75&format=webp&resize=contain",
    unit: "1kg",
    dailyPrices: [50.0, 50.0, 45.0, 47.5, 45.0, 43.5],
    dailyPricesQuintal: [5000, 5000, 4500, 4750, 4500, 4350],
    retailPrices: ["₹66", "₹66", "₹60", "₹63", "₹60", "₹58"],
    currentPrice: 43.5,
    startPrice: 50.0,
    change: -6.5,
    changePercent: -13.0,
    trend: "down",
  },
];

const DEFAULT_COLUMNS = ["4 Nov", "5 Nov", "6 Nov", "7 Nov", "8 Nov", "9 Nov"];

const COMMODITY_CONFIG = [
  { id: "potato", slug: "potato", name: "Potato", color: "#d97706", image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Potato.jpg?width=48&quality=75&format=webp&resize=contain" },
  { id: "tomato", slug: "tomato", name: "Tomato", color: "#dc2626", image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Tomato.jpg?width=48&quality=75&format=webp&resize=contain" },
  { id: "onion", slug: "onion", name: "Onion", color: "#b45309", image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Onion.jpg?width=48&quality=75&format=webp&resize=contain" },
  { id: "brinjal", slug: "brinjal", name: "Brinjal", color: "#7c3aed", image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Brinjal.jpg?width=48&quality=75&format=webp&resize=contain" },
  { id: "green-chilli", slug: "greenchilli", name: "Green Chilli", color: "#16a34a", image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/GreenChilli.jpg?width=48&quality=75&format=webp&resize=contain" },
  { id: "cabbage", slug: "cabbage", name: "Cabbage", color: "#059669", image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Cabbage.jpg?width=48&quality=75&format=webp&resize=contain" },
  { id: "cauliflower", slug: "cauliflower", name: "Cauliflower", color: "#65a30d", image: "https://api.acropai.com/storage/v1/render/image/public/acropcdn/crops/Cauliflower.jpg?width=48&quality=75&format=webp&resize=contain" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("refresh") === "true";

  try {
    let allDates: string[] = [];
    const parsedItems: CropHistoryItem[] = [];

    const fetchPromises = COMMODITY_CONFIG.map(async (cfg) => {
      try {
        const res = await fetch(`https://acrop.app/prices/${cfg.slug}/odisha`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)",
          },
          ...(forceRefresh ? { cache: "no-store" as const } : { next: { revalidate: 1800 } }),
        });

        if (!res.ok) return null;
        const html = await res.text();

        const pointMatches = Array.from(html.matchAll(/<circle[^>]*class="national-series-point"[^>]*><title>([^<]+)<\/title>/g));
        const dates: string[] = [];
        const pricesKg: number[] = [];
        const pricesQ: number[] = [];
        const retailPrices: string[] = [];

        for (const pt of pointMatches) {
          const m = pt[1].match(/(\d+\s+[A-Za-z]+)\s+\d{4}:\s*₹([\d,]+)\/quintal/);
          if (m) {
            const dStr = m[1];
            const qVal = parseInt(m[2].replace(/,/g, ""), 10);
            const kgVal = Math.round((qVal / 100.0) * 10) / 10;
            dates.push(dStr);
            pricesKg.push(kgVal);
            pricesQ.push(qVal);
            retailPrices.push(`₹${Math.round(kgVal * 1.35)}`);
          }
        }

        if (dates.length > 0) {
          const curr = pricesKg[pricesKg.length - 1];
          const start = pricesKg[0];
          const chg = Math.round((curr - start) * 10) / 10;
          const pct = start > 0 ? Math.round((chg / start) * 1000) / 10 : 0;
          const trend: "up" | "down" | "stable" = chg > 0 ? "up" : chg < 0 ? "down" : "stable";

          return {
            dates,
            item: {
              id: cfg.id,
              name: cfg.name,
              color: cfg.color,
              image: cfg.image,
              unit: "1kg",
              dailyPrices: pricesKg,
              dailyPricesQuintal: pricesQ,
              retailPrices,
              currentPrice: curr,
              startPrice: start,
              change: chg,
              changePercent: pct,
              trend,
            },
          };
        }
      } catch {
        return null;
      }
      return null;
    });

    const results = await Promise.all(fetchPromises);
    for (const r of results) {
      if (r) {
        if (r.dates.length > allDates.length) {
          allDates = r.dates;
        }
        parsedItems.push(r.item);
      }
    }

    if (parsedItems.length >= 3 && allDates.length >= 3) {
      return NextResponse.json({
        success: true,
        market: "Odisha Mandis (State-wide Average)",
        state: "Odisha",
        sourceUrl: "https://acrop.app/mandi/odisha",
        startDate: allDates[0],
        endDate: allDates[allDates.length - 1],
        rawColumns: allDates,
        columns: allDates,
        count: parsedItems.length,
        items: parsedItems,
      });
    }
  } catch (err) {
    console.error("History fetch from acrop.app failed, serving baseline:", err);
  }

  return NextResponse.json({
    success: true,
    market: "Odisha Mandis (State-wide Average)",
    state: "Odisha",
    sourceUrl: "https://acrop.app/mandi/odisha",
    startDate: DEFAULT_COLUMNS[0],
    endDate: DEFAULT_COLUMNS[DEFAULT_COLUMNS.length - 1],
    rawColumns: DEFAULT_COLUMNS,
    columns: DEFAULT_COLUMNS,
    count: FALLBACK_HISTORY_ITEMS.length,
    items: FALLBACK_HISTORY_ITEMS,
  });
}
