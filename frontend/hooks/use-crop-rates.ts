import { useQuery } from "@tanstack/react-query";

export interface CropRateItem {
  id: string;
  name: string;
  category?: string;
  price: string;
  priceNum: number;
  price_quintal?: string;
  priceNumQuintal?: number;
  retailPrice: string;
  mallPrice?: string;
  unit: string;
  image: string;
  emoji?: string;
  mandi_info?: string;
  arrivals?: string;
  url?: string;
  date?: string;
}

export interface CropRatesResponse {
  success: boolean;
  market: string;
  state: string;
  sourceUrl: string;
  updatedAt: string;
  count: number;
  items: CropRateItem[];
  error?: string;
}

export function useCropRates() {
  return useQuery<CropRatesResponse>({
    queryKey: ["crop-rates"],
    queryFn: async () => {
      const res = await fetch("/api/crop-rates");
      if (!res.ok) {
        throw new Error("Failed to fetch daily crop rates");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 15, // 15 minutes fresh
    refetchOnWindowFocus: false,
  });
}
