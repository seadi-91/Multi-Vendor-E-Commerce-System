import { useQuery, useQueries } from '@tanstack/react-query';
import { productsAPI } from '../api';

// Hook for fetching all cached products
export const useCachedProducts = (params = {}) => {
  return useQuery({
    queryKey: ['cachedProducts', params],
    queryFn: async () => {
      const response = await productsAPI.getCachedProducts(params);
      return response.data?.data; // Unwrap the nested data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for fetching single cached product
export const useCachedProduct = (id) => {
  return useQuery({
    queryKey: ['cachedProduct', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await productsAPI.getCachedProductById(id);
      return response.data?.data; // Unwrap the nested data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for fetching live price/stock for single product
export const useLiveProductPriceStock = (id) => {
  return useQuery({
    queryKey: ['liveProductPriceStock', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await productsAPI.getLiveProductPriceAndStock(id);
      return response.data?.data; // Unwrap the nested data
    },
    enabled: !!id,
    staleTime: 0, // Always refetch
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
};

// Hook for fetching live price/stock for multiple products
export const useLiveProductsPriceStock = (productIds) => {
  return useQuery({
    queryKey: ['liveProductsPriceStock', productIds],
    queryFn: async () => {
      if (!productIds || productIds.length === 0) return [];
      const response = await productsAPI.getLiveProductsPriceAndStock(productIds);
      return response.data?.data; // Unwrap the nested data
    },
    enabled: !!productIds && productIds.length > 0,
    staleTime: 0, // Always refetch
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
};
