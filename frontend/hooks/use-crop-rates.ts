import { useQuery } from "@tanstack/react-query";

export interface CropRateItem {
  id: string;
  name: string;
  category?: string;
  state?: string;
  market?: string;
  price: string;
  priceNum: number;
  price_quintal?: string;
  priceNumQuintal?: number;
  retailPrice: string;
  mallPrice?: string;
  min_price?: string;
  max_price?: string;
  unit: string;
  image: string;
  emoji?: string;
  mandi_info?: string;
  arrivals?: string;
  variety?: string;
  trend?: "up" | "down" | "stable";
  url?: string;
  date?: string;
}

export interface CropRatesResponse {
  success: boolean;
  market: string;
  state: string;
  sourceUrl: string;
  sourceAttribution?: string;
  updatedAt: string;
  count: number;
  items: CropRateItem[];
  error?: string;
}

export function useCropRates(state?: string) {
  const isAll = !state || state.toLowerCase() === "all" || state.toLowerCase() === "all india" || state.toLowerCase() === "pan-india";
  const cleanKey = isAll ? "all" : state;

  return useQuery<CropRatesResponse>({
    queryKey: ["crop-rates", cleanKey],
    queryFn: async () => {
      const url = !isAll ? `/api/crop-rates?state=${encodeURIComponent(state!)}` : "/api/crop-rates";
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch daily crop rates");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    refetchOnWindowFocus: false,
  });
}
