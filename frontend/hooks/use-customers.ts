import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Customer } from '@/types';

export function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await api.get('/customers');
      return Array.isArray(data) ? data : (data?.items || []);
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customer: Partial<Customer>) => {
      const { data } = await api.post('/customers', customer);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: string | { id: string; cascade?: boolean }) => {
      const id = typeof args === "string" ? args : args.id;
      const cascade = typeof args === "object" ? args.cascade : false;
      const url = `/customers/${id}${cascade ? "?cascade=true" : ""}`;
      const { data } = await api.delete(url);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}