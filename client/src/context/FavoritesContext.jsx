import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Load favorites based on auth state
  useEffect(() => {
    const loadFavorites = async () => {
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
              const productsResponse = await api.get('/products');
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
      }
    };

    loadFavorites();
  }, []); // Only run on mount

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

    // Optimistic update
    if (!favorites.includes(normalizedId)) {
      setFavorites(prev => [...prev, normalizedId]);
    }

    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Logged-in user: save to database
        await api.post('/favorites/add', { productId: normalizedId });
        
        // Refresh from database to get complete product data
        const response = await api.get('/favorites');
        const items = Array.isArray(response?.data?.data) ? response.data.data : [];
        setFavorites(items.map(item => String(item.id)));
        setFavoriteProducts(items);
      } else {
        // Guest user: save to localStorage
        const currentFavorites = getStoredFavorites();
        if (!currentFavorites.includes(normalizedId)) {
          const newFavorites = [...currentFavorites, normalizedId];
          setStoredFavorites(newFavorites);
          setFavorites(newFavorites);
          
          // Fetch product data
          try {
            const productsResponse = await api.get('/products');
            const products = Array.isArray(productsResponse?.data?.data) ? productsResponse.data.data : [];
            const product = products.find(p => String(p.id) === normalizedId);
            if (product) {
              setFavoriteProducts(prev => [...prev, product]);
            }
          } catch (error) {
            console.error('Failed to fetch product data:', error);
          }
        }
      }
      
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    } catch (error) {
      console.error('Failed to add favorite:', error);
      // Revert optimistic update on error
      setFavorites(prev => prev.filter(id => id !== normalizedId));
    }
  }, [favorites]);

  // Remove from favorites
  const removeFavorite = useCallback(async (productId) => {
    const normalizedId = String(productId);

    // Optimistic update
    setFavorites(prev => prev.filter(id => id !== normalizedId));
    setFavoriteProducts(prev => prev.filter(p => String(p.id) !== normalizedId));

    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Logged-in user: remove from database
        await api.delete(`/favorites/${normalizedId}`);
        
        // Refresh from database
        const response = await api.get('/favorites');
        const items = Array.isArray(response?.data?.data) ? response.data.data : [];
        setFavorites(items.map(item => String(item.id)));
        setFavoriteProducts(items);
      } else {
        // Guest user: remove from localStorage
        const currentFavorites = getStoredFavorites();
        const newFavorites = currentFavorites.filter(id => id !== normalizedId);
        setStoredFavorites(newFavorites);
        setFavorites(newFavorites);
      }
      
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      // Revert on error by reloading
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/favorites');
        const items = Array.isArray(response?.data?.data) ? response.data.data : [];
        setFavorites(items.map(item => String(item.id)));
        setFavoriteProducts(items);
      } else {
        const storedIds = getStoredFavorites();
        setFavorites(storedIds);
      }
    }
  }, []);

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
