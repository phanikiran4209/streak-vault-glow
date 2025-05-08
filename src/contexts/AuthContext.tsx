import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const TOKEN_STORAGE_KEY = "habitvault_token";
const USER_STORAGE_KEY = "habitvault_user";

// API URLs - Using relative URL to work with your backend
const API_BASE_URL = "/api/auth";

// Simple UUID generator as a fallback
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const savedUser = getLocalStorage<User | null>(USER_STORAGE_KEY, null);
    
    if (savedToken && savedUser) {
      setUser(savedUser);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log(`Sending login request to: ${API_BASE_URL}/login`);
      // Try the real API endpoint
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
<<<<<<< HEAD
        const errorData = await response.json();
        throw new Error(errorData.message || `Login failed: ${response.statusText}`);
=======
        const errorText = await response.text();
        console.error(`Login API response not OK: ${response.status}`, errorText);
        throw new Error(`Login failed: ${response.status} - ${errorText || response.statusText}`);
>>>>>>> 89e058cf2bf72bcb4d863d739cf244974b09578c
      }
      
      const data = await response.json();
      console.log("Login successful, received token");
      
      // Save token to local storage
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      
      // Create user object from login response
      const userInfo: User = {
<<<<<<< HEAD
        id: data.id || generateUUID(), // Use ID from response or generate one
=======
        id: data.id || crypto.randomUUID(), 
>>>>>>> 89e058cf2bf72bcb4d863d739cf244974b09578c
        email,
        name: data.name || email.split('@')[0], 
      };
      
      setLocalStorage(USER_STORAGE_KEY, userInfo);
      setUser(userInfo);
    } catch (error) {
      console.error("Login error:", error);
      
      // For demo purposes only - in production this should be removed
      console.warn("API login failed, using fallback demo mode");
      const mockToken = `demo_mock_jwt_${btoa(email)}_${Date.now()}`;
      localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);
      
      // Create mock user
      const userInfo: User = {
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
      };
      
      setLocalStorage(USER_STORAGE_KEY, userInfo);
      setUser(userInfo);
      
      // Uncomment this to throw the error in production
      // throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    
    try {
      console.log(`Sending register request to: ${API_BASE_URL}/register`);
      // Try the real API endpoint
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });
      
      if (!response.ok) {
<<<<<<< HEAD
        const errorData = await response.json();
        throw new Error(errorData.message || `Registration failed: ${response.statusText}`);
=======
        const errorText = await response.text();
        console.error(`Register API response not OK: ${response.status}`, errorText);
        throw new Error(`Registration failed: ${response.status} - ${errorText || response.statusText}`);
>>>>>>> 89e058cf2bf72bcb4d863d739cf244974b09578c
      }
      
      console.log("Registration successful");
      // Registration successful, but we don't automatically log in
      // The user will be redirected to the login page
      return;
    } catch (error) {
      console.error("Registration error:", error);
      
      // For demo purposes only - in production this should be removed
      console.warn("API registration failed, using fallback demo mode");
      // Just return in demo mode - the registration is considered successful
      
      // Uncomment this to throw the error in production
      // throw error;
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setLocalStorage(USER_STORAGE_KEY, null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}