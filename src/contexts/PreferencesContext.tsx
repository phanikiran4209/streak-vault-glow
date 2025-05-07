
import React, { createContext, useContext, useEffect, useState } from "react";
import { UserPreferences } from "@/types";
import { useAuth } from "./AuthContext";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: UserPreferences = {
  darkMode: false,
  lastTimeRange: "week",
  showMotivationalQuote: true,
};

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  // Load preferences when user changes
  useEffect(() => {
    if (user) {
      const userPrefs = getLocalStorage<UserPreferences>(
        `habitvault_prefs_${user.id}`, 
        DEFAULT_PREFERENCES
      );
      setPreferences(userPrefs);
      
      // Apply dark mode
      if (userPrefs.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      setPreferences(DEFAULT_PREFERENCES);
    }
  }, [user]);

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    if (!user) return;
    
    const updatedPreferences = { ...preferences, ...newPrefs };
    setPreferences(updatedPreferences);
    setLocalStorage(`habitvault_prefs_${user.id}`, updatedPreferences);
    
    // Update dark mode if changed
    if (newPrefs.darkMode !== undefined) {
      if (newPrefs.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
