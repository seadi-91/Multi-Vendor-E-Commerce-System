import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';

const FavoritesContext = createContext(undefined);

const STORAGE_KEY = 'guest_favorites';

// Helper functions for localStorage
const getStoredFavorites = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse stored favorites:', error);
    return [];
  }
};

const setStoredFavorites = (favorites) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to store favorites:', error);
  }
};

const clearStoredFavorites = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear stored favorites:', error);
  }
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const inFlightRequestsRef = useRef(new Set());

  const refreshFavorites = useCallback(async () => {
    // Prevent duplicate calls
    if (inFlightRequestsRef.current.has('loadFavorites')) return;
    inFlightRequestsRef.current.add('loadFavorites');
    
    setLoading(true);
    
    try {
      // Try to get user from localStorage (check if logged in)
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (token && user) {
        // Logged-in user: fetch from database
        const response = await api.get('/favorites');
        const items = Array.isArray(response?.data?.data) ? response.data.data : [];
        setFavorites(items.map(item => String(item.id)));
        setFavoriteProducts(items);
      } else {
        // Guest user: load from localStorage
        const storedIds = getStoredFavorites();
        setFavorites(storedIds);
        
        // Fetch product data for stored IDs
        if (storedIds.length > 0) {
          try {
            // Fetch all cached products and filter
            const productsResponse = await api.get('/products/cached/all');
            const products = Array.isArray(productsResponse?.data?.data) ? productsResponse.data.data : [];
            const matchedProducts = products.filter(product => 
              storedIds.includes(String(product.id))
            );
            setFavoriteProducts(matchedProducts);
          } catch (error) {
            console.error('Failed to load guest favorite products:', error);
            setFavoriteProducts([]);
          }
        } else {
          setFavoriteProducts([]);
        }
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      // Fallback to localStorage on error
      const storedIds = getStoredFavorites();
      setFavorites(storedIds);
    } finally {
      setLoading(false);
      setIsInitialized(true);
      inFlightRequestsRef.current.delete('loadFavorites');
    }
  }, []);
  
  // Load favorites based on auth state
  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]); // Only run on mount

  // Sync guest favorites to database after login
  const syncGuestFavorites = useCallback(async () => {
    const storedIds = getStoredFavorites();
    if (storedIds.length === 0) return;

    try {
      setLoading(true);
      
      // Get current database favorites
      const response = await api.get('/favorites');
      const dbFavorites = Array.isArray(response?.data?.data) ? response.data.data : [];
      const dbIds = dbFavorites.map(item => String(item.id));

      // Find favorites that are in localStorage but not in database
      const toSync = storedIds.filter(id => !dbIds.includes(id));

      // Add each missing favorite to database
      for (const productId of toSync) {
        try {
          await api.post('/favorites/add', { productId });
        } catch (error) {
          console.error(`Failed to sync favorite ${productId}:`, error);
        }
      }

      // Clear localStorage after successful sync
      clearStoredFavorites();

      // Reload favorites from database
      const freshResponse = await api.get('/favorites');
      const freshItems = Array.isArray(freshResponse?.data?.data) ? freshResponse.data.data : [];
      setFavorites(freshItems.map(item => String(item.id)));
      setFavoriteProducts(freshItems);
      
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    } catch (error) {
      console.error('Failed to sync guest favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if a product is favorited
  const isFavorite = useCallback((productId) => {
    return favorites.includes(String(productId));
  }, [favorites]);

  // Add to favorites
  const addFavorite = useCallback(async (productId) => {
    const normalizedId = String(productId);
    const requestKey = `addFavorite:${normalizedId}`;

    // Prevent duplicate calls for the same product
    if (inFlightRequestsRef.current.has(requestKey)) return;
    inFlightRequestsRef.current.add(requestKey);

    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Logged-in user: save to database
        await api.post('/favorites/add', { productId: normalizedId });
      } else {
        // Guest user: save to localStorage
        const currentFavorites = getStoredFavorites();
        if (!currentFavorites.includes(normalizedId)) {
          const newFavorites = [...currentFavorites, normalizedId];
          setStoredFavorites(newFavorites);
        }
      }
      
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      
      // Always refresh to get real data
      await refreshFavorites();
    } catch (error) {
      console.error('Failed to add favorite:', error);
    } finally {
      inFlightRequestsRef.current.delete(requestKey);
    }
  }, [refreshFavorites]);

  // Remove from favorites
  const removeFavorite = useCallback(async (productId) => {
    const normalizedId = String(productId);
    const requestKey = `removeFavorite:${normalizedId}`;

    // Prevent duplicate calls
    if (inFlightRequestsRef.current.has(requestKey)) return;
    inFlightRequestsRef.current.add(requestKey);

    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Logged-in user: remove from database
        await api.delete(`/favorites/${normalizedId}`);
      } else {
        // Guest user: remove from localStorage
        const currentFavorites = getStoredFavorites();
        const newFavorites = currentFavorites.filter(id => id !== normalizedId);
        setStoredFavorites(newFavorites);
      }
      
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      
      // Always refresh to get real data
      await refreshFavorites();
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    } finally {
      inFlightRequestsRef.current.delete(requestKey);
    }
  }, [refreshFavorites]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (productId) => {
    const normalizedId = String(productId);
    
    if (isFavorite(normalizedId)) {
      await removeFavorite(normalizedId);
    } else {
      await addFavorite(normalizedId);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  // Get favorite products
  const getFavoriteProducts = useCallback(() => {
    return favoriteProducts;
  }, [favoriteProducts]);

  // Get favorite count
  const getFavoriteCount = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  const value = {
    favorites,
    favoriteProducts,
    loading,
    isInitialized,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    getFavoriteProducts,
    getFavoriteCount,
    syncGuestFavorites,
    refreshFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;
