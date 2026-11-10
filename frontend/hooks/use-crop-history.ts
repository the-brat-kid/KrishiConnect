import { useQuery } from "@tanstack/react-query";

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

export interface CropHistoryResponse {
  success: boolean;
  market: string;
  state: string;
  sourceUrl: string;
  startDate: string;
  endDate: string;
  rawColumns: string[];
  columns: string[];
  count: number;
  items: CropHistoryItem[];
  error?: string;
}

export function useCropHistory() {
  return useQuery<CropHistoryResponse>({
    queryKey: ["crop-rates-history"],
    queryFn: async () => {
      const res = await fetch("/api/crop-rates/history");
      if (!res.ok) {
        throw new Error("Failed to fetch 7-day rate trends");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  });
}
