
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

interface HabitsContextType {
  habits: HabitWithLogs[];
  isLoading: boolean;
  addHabit: (habit: Omit<Habit, "id" | "createdAt">) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  updateHabitStatus: (habitId: string, date: string, status: "completed" | "missed") => void;
  getHabitById: (id: string) => HabitWithLogs | undefined;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitWithLogs[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load habits when user changes
  useEffect(() => {
    if (user) {
      loadHabits(user.id);
    } else {
      setHabits([]);
    }
    setIsLoading(false);
  }, [user]);

  const loadHabits = (userId: string) => {
    const storageKey = `habitvault_habits_${userId}`;
    const logsKey = `habitvault_logs_${userId}`;
    
    const savedHabits = getLocalStorage<Habit[]>(storageKey, []);
    const savedLogs = getLocalStorage<Record<string, HabitLog>>(logsKey, {});
    
    const habitsWithLogs: HabitWithLogs[] = savedHabits.map(habit => {
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
  };

  const saveHabits = (updatedHabits: Habit[]) => {
    if (!user) return;
    
    const storageKey = `habitvault_habits_${user.id}`;
    setLocalStorage(storageKey, updatedHabits);
  };

  const saveLogs = (habitId: string, logs: HabitLog) => {
    if (!user) return;
    
    const logsKey = `habitvault_logs_${user.id}`;
    const savedLogs = getLocalStorage<Record<string, HabitLog>>(logsKey, {});
    
    savedLogs[habitId] = logs;
    setLocalStorage(logsKey, savedLogs);
  };

  const addHabit = (habitData: Omit<Habit, "id" | "createdAt">) => {
    const newHabit: Habit = {
      ...habitData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    
    const updatedHabits = [...habits.map(h => ({ ...h })), {
      ...newHabit,
      logs: {},
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0
    }];
    
    setHabits(updatedHabits);
    saveHabits(updatedHabits.map(({ logs, currentStreak, longestStreak, completionRate, ...habit }) => habit));
  };

  const updateHabit = (updatedHabit: Habit) => {
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
    saveHabits(updatedHabits.map(({ logs, currentStreak, longestStreak, completionRate, ...habit }) => habit));
  };

  const deleteHabit = (id: string) => {
    const updatedHabits = habits.filter(h => h.id !== id);
    setHabits(updatedHabits);
    saveHabits(updatedHabits.map(({ logs, currentStreak, longestStreak, completionRate, ...habit }) => habit));
    
    // Also delete logs
    if (user) {
      const logsKey = `habitvault_logs_${user.id}`;
      const savedLogs = getLocalStorage<Record<string, HabitLog>>(logsKey, {});
      delete savedLogs[id];
      setLocalStorage(logsKey, savedLogs);
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
