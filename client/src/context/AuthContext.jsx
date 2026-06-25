import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Use VITE_API_BASE_URL from .env with fallback
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Real login implementation
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Login failed');
    }
    const data = await res.json();
    
    // Ensure user object has a role
    if (!data.user || !data.user.role) {
      console.error('Login response missing user role:', data);
      throw new Error('Invalid user data received from server');
    }
    
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    console.log('Login successful:', { user: data.user, role: data.user.role });
    return data;
  };

  // Real register implementation
  const register = async (registrationData) => {
    console.log('Register data being sent:', registrationData);
    console.log('API_BASE_URL:', API_BASE_URL);
    
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
    console.log('Full URL:', `${API_BASE_URL}/auth/register`);
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serializableData)
      });
      
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      
      if (!res.ok) {
        const data = await res.json();
        console.error('Error response:', data);
        throw new Error(data.message || 'Registration failed');
      }
      const data = await res.json();
      console.log('Success response:', data);
      
      // Ensure user object has a role
      if (!data.user || !data.user.role) {
        console.error('Register response missing user role:', data);
        throw new Error('Invalid user data received from server');
      }
      
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      console.log('Registration successful:', { user: data.user, role: data.user.role });
      return data;
    } catch (error) {
      console.error('Register fetch error:', error);
      throw error;
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
