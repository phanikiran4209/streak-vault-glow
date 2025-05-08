
import React, { createContext, useContext, useEffect, useState } from "react";
import { Habit, HabitLog, HabitWithLogs } from "@/types";
import { useAuth } from "./AuthContext";
import { 
  calculateCompletionRate, 
  calculateStreaks, 
  formatDate,
  generateId, 
  getLocalStorage, 
  getToday, 
  setLocalStorage 
} from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import * as habitsApi from "@/services/habitsApi";

interface HabitsContextType {
  habits: HabitWithLogs[];
  isLoading: boolean;
  addHabit: (habit: Omit<Habit, "id" | "createdAt">) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  updateHabitStatus: (habitId: string, date: string, status: "completed" | "missed") => void;
  getHabitById: (id: string) => HabitWithLogs | undefined;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitWithLogs[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load habits when user changes
  useEffect(() => {
    if (user) {
      loadHabits();
    } else {
      setHabits([]);
    }
    setIsLoading(false);
  }, [user]);

  const loadHabits = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const apiHabits = await habitsApi.getHabits();
      
      // Get logs from local storage
      const logsKey = `habitvault_logs_${user.id}`;
      const savedLogs = getLocalStorage<Record<string, HabitLog>>(logsKey, {});
      
      const habitsWithLogs: HabitWithLogs[] = apiHabits.map(habit => {
        const logs = savedLogs[habit.id] || {};
        const { current, longest } = calculateStreaks(habit, logs);
        const completionRate = calculateCompletionRate(habit, logs);
        
        return {
          ...habit,
          logs,
          currentStreak: current,
          longestStreak: longest,
          completionRate
        };
      });
      
      setHabits(habitsWithLogs);
    } catch (error: any) {
      console.error("Failed to load habits:", error);
      toast({
        title: "Error loading habits",
        description: error.message || "An error occurred while loading habits",
        variant: "destructive"
      });
      
      // If there's an authentication error, redirect to login
      if (error.message === "Authentication required") {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveLogs = (habitId: string, logs: HabitLog) => {
    if (!user) return;
    
    const logsKey = `habitvault_logs_${user.id}`;
    const savedLogs = getLocalStorage<Record<string, HabitLog>>(logsKey, {});
    
    savedLogs[habitId] = logs;
    setLocalStorage(logsKey, savedLogs);
  };

  const addHabit = async (habitData: Omit<Habit, "id" | "createdAt">) => {
    try {
      setIsLoading(true);
      
      // Call API to create habit
      const newHabit = await habitsApi.createHabit(habitData);
      
      // Update local state with new habit + logs data
      const habitWithLogs: HabitWithLogs = {
        ...newHabit,
        logs: {},
        currentStreak: 0,
        longestStreak: 0,
        completionRate: 0
      };
      
      setHabits(prevHabits => [...prevHabits, habitWithLogs]);
      
      toast({
        title: "Success",
        description: "Habit created successfully",
      });
    } catch (error: any) {
      console.error("Failed to create habit:", error);
      toast({
        title: "Error creating habit",
        description: error.message || "An error occurred while creating the habit",
        variant: "destructive"
      });
      
      // If there's an authentication error, redirect to login
      if (error.message === "Authentication required") {
        navigate("/login");
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateHabit = async (updatedHabit: Habit) => {
    try {
      setIsLoading(true);
      
      // Call API to update habit
      await habitsApi.updateHabit(updatedHabit);
      
      // Update local state
      const habitIndex = habits.findIndex(h => h.id === updatedHabit.id);
      if (habitIndex === -1) return;
      
      const currentLogs = habits[habitIndex].logs || {};
      
      const updatedHabits = [...habits];
      const { current, longest } = calculateStreaks(updatedHabit, currentLogs);
      const completionRate = calculateCompletionRate(updatedHabit, currentLogs);
      
      updatedHabits[habitIndex] = {
        ...updatedHabit,
        logs: currentLogs,
        currentStreak: current,
        longestStreak: longest,
        completionRate
      };
      
      setHabits(updatedHabits);
      
      toast({
        title: "Success",
        description: "Habit updated successfully",
      });
    } catch (error: any) {
      console.error("Failed to update habit:", error);
      toast({
        title: "Error updating habit",
        description: error.message || "An error occurred while updating the habit",
        variant: "destructive"
      });
      
      // If there's an authentication error, redirect to login
      if (error.message === "Authentication required") {
        navigate("/login");
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Call API to delete habit
      await habitsApi.deleteHabit(id);
      
      // Update local state
      setHabits(prevHabits => prevHabits.filter(h => h.id !== id));
      
      // Also delete logs
      if (user) {
        const logsKey = `habitvault_logs_${user.id}`;
        const savedLogs = getLocalStorage<Record<string, HabitLog>>(logsKey, {});
        delete savedLogs[id];
        setLocalStorage(logsKey, savedLogs);
      }
      
      toast({
        title: "Success",
        description: "Habit deleted successfully",
      });
    } catch (error: any) {
      console.error("Failed to delete habit:", error);
      toast({
        title: "Error deleting habit",
        description: error.message || "An error occurred while deleting the habit",
        variant: "destructive"
      });
      
      // If there's an authentication error, redirect to login
      if (error.message === "Authentication required") {
        navigate("/login");
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateHabitStatus = (habitId: string, date: string, status: "completed" | "missed") => {
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;
    
    const habit = habits[habitIndex];
    const updatedLogs = { ...habit.logs, [date]: status };
    
    const { current, longest } = calculateStreaks(habit, updatedLogs);
    const completionRate = calculateCompletionRate(habit, updatedLogs);
    
    const updatedHabits = [...habits];
    updatedHabits[habitIndex] = {
      ...habit,
      logs: updatedLogs,
      currentStreak: current,
      longestStreak: longest,
      completionRate
    };
    
    setHabits(updatedHabits);
    saveLogs(habitId, updatedLogs);
  };

  const getHabitById = (id: string) => {
    return habits.find(h => h.id === id);
  };

  return (
    <HabitsContext.Provider value={{
      habits,
      isLoading,
      addHabit,
      updateHabit,
      deleteHabit,
      updateHabitStatus,
      getHabitById
    }}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }
  return context;
}
