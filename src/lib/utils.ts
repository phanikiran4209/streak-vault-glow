
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DayOfWeek, Habit, HabitLog, HabitStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[date.getDay()];
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
}

export function shouldTrackHabit(habit: Habit, date: Date): boolean {
  const dayOfWeek = getDayOfWeek(date);
  
  switch (habit.frequency) {
    case "daily":
      return true;
    case "weekdays":
      return dayOfWeek !== "sat" && dayOfWeek !== "sun";
    case "weekends":
      return dayOfWeek === "sat" || dayOfWeek === "sun";
    case "custom":
      return habit.customDays?.includes(dayOfWeek) || false;
    default:
      return false;
  }
}

// Streak calculation
export function calculateStreaks(habit: Habit, logs: HabitLog): { current: number; longest: number } {
  let current = 0;
  let longest = 0;
  let consecutiveDays = 0;
  
  const today = getToday();
  const habitStartDate = parseDate(habit.startDate);
  
  // Calculate from start date to today
  for (let date = habitStartDate; formatDate(date) <= today; date = addDays(date, 1)) {
    const dateStr = formatDate(date);
    
    // Skip days that should not be tracked
    if (!shouldTrackHabit(habit, date)) {
      continue;
    }
    
    const status = logs[dateStr];
    
    if (status === "completed") {
      consecutiveDays++;
      // Update longest streak if current consecutive days is longer
      longest = Math.max(longest, consecutiveDays);
    } else if (status === "missed" || (dateStr < today && status === undefined)) {
      // Reset streak on missed day or past days with no status
      consecutiveDays = 0;
    }
    // Today without status doesn't break the streak
  }
  
  // Current streak is the consecutive days until now
  current = consecutiveDays;
  
  return { current, longest };
}

export function calculateCompletionRate(habit: Habit, logs: HabitLog): number {
  let total = 0;
  let completed = 0;
  
  const today = new Date();
  const habitStartDate = parseDate(habit.startDate);
  
  // Calculate from start date to today (yesterday for accurate rate)
  for (let date = habitStartDate; formatDate(date) < formatDate(today); date = addDays(date, 1)) {
    if (shouldTrackHabit(habit, date)) {
      const dateStr = formatDate(date);
      total++;
      
      if (logs[dateStr] === "completed") {
        completed++;
      }
    }
  }
  
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Local storage functions
export function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error setting localStorage", error);
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.error("Error getting localStorage", error);
    return defaultValue;
  }
}

// Return a date range as an array of date strings
export function getDateRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  let currentDate = new Date(start);
  
  while (currentDate <= end) {
    dates.push(formatDate(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
}

// Motivational quotes
export const motivationalQuotes = [
  "Small daily improvements over time lead to stunning results.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The only bad workout is the one that didn't happen.",
  "Don't count the days. Make the days count.",
  "Motivation gets you started. Habit keeps you going.",
  "The secret of your future is hidden in your daily routine.",
  "You don't have to be great to start, but you have to start to be great.",
  "Discipline is choosing between what you want now and what you want most.",
  "Good habits are worth being fanatical about.",
  "Your only limit is you.",
  "What you do every day matters more than what you do once in a while.",
  "One habit at a time.",
  "Consistency is the key to achieving and maintaining momentum.",
  "Success isn't always about greatness. It's about consistency.",
  "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
  "The difference between who you are and who you want to be is what you do.",
  "Excellence is not an exception, it is a prevailing attitude.",
  "Don't wish for it, work for it.",
  "What you plant now, you will harvest later.",
  "Your future is created by what you do today, not tomorrow."
];

export function getDailyQuote(): string {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % motivationalQuotes.length;
  return motivationalQuotes[index];
}
