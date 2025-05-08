
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

// API URLs
const API_BASE_URL = "http://localhost:5000/api/auth";

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
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Save token to local storage
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      
      // Create user object from login response
      const userInfo: User = {
        id: data.id || crypto.randomUUID(), // Use ID from response or generate one
        email,
        name: data.name || email.split('@')[0], // Use name from response or generate one from email
      };
      
      setLocalStorage(USER_STORAGE_KEY, userInfo);
      setUser(userInfo);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Registration failed: ${response.statusText}`);
      }
      
      // Registration successful, but we don't automatically log in
      // The user will be redirected to the login page
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
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
