import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api';

const FarmerProfileContext = createContext();

export const FarmerProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/farmer/profile');
      setProfile(res.data);
      return res.data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.put('/farmer/profile', updates);
      setProfile(res.data);
      return res.data;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.put('/farmer/settings', updates);
      // After settings update, fetch fresh profile data to sync everything
      await fetchProfile();
      return res.data;
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err.response?.data?.error || 'Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  const refreshProfile = useCallback(() => {
    return fetchProfile();
  }, [fetchProfile]);

  return (
    <FarmerProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        fetchProfile,
        updateProfile,
        updateSettings,
        refreshProfile,
      }}
    >
      {children}
    </FarmerProfileContext.Provider>
  );
};

export const useFarmerProfile = () => {
  const context = useContext(FarmerProfileContext);
  if (!context) {
    throw new Error('useFarmerProfile must be used within a FarmerProfileProvider');
  }
  return context;
};
