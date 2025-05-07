
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

// Mock users data
const USERS_STORAGE_KEY = "habitvault_users";
const CURRENT_USER_KEY = "habitvault_current_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize users if not exists
    const existingUsers = getLocalStorage<User[]>(USERS_STORAGE_KEY, []);
    if (existingUsers.length === 0) {
      setLocalStorage(USERS_STORAGE_KEY, []);
    }
    
    // Check if user is already logged in
    const savedUser = getLocalStorage<User | null>(CURRENT_USER_KEY, null);
    if (savedUser) {
      setUser(savedUser);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getLocalStorage<Array<{ id: string; email: string; password: string; name?: string }>>(USERS_STORAGE_KEY, []);
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      setIsLoading(false);
      throw new Error("Invalid email or password");
    }
    
    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    setLocalStorage(CURRENT_USER_KEY, userWithoutPassword);
    setIsLoading(false);
  };

  const register = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = getLocalStorage<Array<{ id: string; email: string; password: string; name?: string }>>(USERS_STORAGE_KEY, []);
    
    if (users.some(u => u.email === email)) {
      setIsLoading(false);
      throw new Error("Email already in use");
    }
    
    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      name
    };
    
    setLocalStorage(USERS_STORAGE_KEY, [...users, newUser]);
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setLocalStorage(CURRENT_USER_KEY, userWithoutPassword);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setLocalStorage(CURRENT_USER_KEY, null);
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
