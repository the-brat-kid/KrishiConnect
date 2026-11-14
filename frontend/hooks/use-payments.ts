import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface StripeConfig {
  publishable_key: string;
  currency: string;
  is_configured: boolean;
}

export interface CheckoutSessionResponse {
  session_id: string;
  url: string;
  publishable_key?: string;
}

export interface VerifyPaymentRequest {
  session_id?: string;
  payment_intent_id?: string;
  invoice_id?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  status: string;
  invoice_id: string;
  payment_id?: string;
  amount?: number;
  currency?: string;
  payment_intent_id?: string;
  message: string;
}

export function useStripeConfig() {
  return useQuery<StripeConfig>({
    queryKey: ["stripe-config"],
    queryFn: async () => {
      const { data } = await api.get("/payments/stripe/config");
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useCreateStripeCheckout() {
  return useMutation<CheckoutSessionResponse, Error, { invoice_id: string; success_url?: string; cancel_url?: string; is_public?: boolean }>({
    mutationFn: async ({ invoice_id, success_url, cancel_url, is_public }) => {
      const endpoint = is_public
        ? "/payments/public/stripe/checkout-session"
        : "/payments/stripe/checkout-session";
      const { data } = await api.post(endpoint, {
        invoice_id,
        success_url,
        cancel_url,
      });
      return data;
    },
  });
}

export function useVerifyStripePayment() {
  const queryClient = useQueryClient();
  return useMutation<VerifyPaymentResponse, Error, VerifyPaymentRequest>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/payments/stripe/verify", payload);
      return data;
    },
    onSuccess: (data) => {
      if (data.invoice_id) {
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        queryClient.invalidateQueries({ queryKey: ["invoices", data.invoice_id] });
      }
    },
  });
}
