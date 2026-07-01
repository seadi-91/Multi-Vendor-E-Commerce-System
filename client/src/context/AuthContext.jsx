import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate auth state from localStorage on mount
    const hydrateAuthState = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        // Only restore user state if both user and token exist
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('Auth state hydrated:', { user: parsedUser, hasToken: !!storedToken });
        } else if (storedUser && !storedToken) {
          // Clear invalid state (user exists but no token)
          console.warn('Invalid auth state: user exists but token is missing. Clearing...');
          localStorage.removeItem('user');
          setUser(null);
        } else if (!storedUser && storedToken) {
          // Clear invalid state (token exists but no user)
          console.warn('Invalid auth state: token exists but user is missing. Clearing...');
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('Error hydrating auth state:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrateAuthState();
  }, []);

  // Real login implementation
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      // Ensure user object has a role
      if (!response.data.user || !response.data.user.role) {
        console.error('Login response missing user role:', response.data);
        throw new Error('Invalid user data received from server');
      }
      
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      console.log('Login successful:', { user: response.data.user, role: response.data.user.role });
      return response.data;
    } catch (error) {
      let message;
      
      // Check for network errors
      if (!error.response) {
        message = 'Network error: Could not connect to server. Please check your internet connection.';
      } else {
        // Server errors
        message = error.response?.data?.message || error.message || 'Invalid email or password';
      }
      
      throw new Error(message);
    }
  };

  // Real register implementation
  const register = async (registrationData) => {
    console.log('Register data being sent:', registrationData);
    
    // Filter out any non-serializable data (like File objects)
    const serializableData = {};
    for (const key in registrationData) {
      const value = registrationData[key];
      if (value instanceof File) {
        console.log(`Skipping file field: ${key}`);
        continue;
      }
      serializableData[key] = value;
    }
    
    console.log('Filtered data for API:', serializableData);
    
    try {
      const response = await authAPI.register(serializableData);
      console.log('Success response:', response.data);
      
      // Ensure user object has a role
      if (!response.data.user || !response.data.user.role) {
        console.error('Register response missing user role:', response.data);
        throw new Error('Invalid user data received from server');
      }
      
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      console.log('Registration successful:', { user: response.data.user, role: response.data.user.role });
      return response.data;
    } catch (error) {
      console.error('Register axios error:', error);
      let message;
      
      // Check for network errors
      if (!error.response) {
        message = 'Network error: Could not connect to server. Please check your internet connection.';
      } else {
        // Server errors
        message = error.response?.data?.message || error.message || 'Registration failed';
      }
      
      throw new Error(message);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
