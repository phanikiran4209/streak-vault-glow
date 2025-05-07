
export type User = {
  id: string;
  email: string;
  name?: string;
};

export type HabitFrequency = "daily" | "weekdays" | "weekends" | "custom";

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type Habit = {
  id: string;
  name: string;
  frequency: HabitFrequency;
  customDays?: DayOfWeek[];
  startDate: string; // ISO date string
  createdAt: string; // ISO date string
};

export type HabitStatus = "completed" | "missed" | undefined;

export type HabitLog = {
  [date: string]: HabitStatus;
};

export type HabitWithLogs = Habit & {
  logs: HabitLog;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
};

export type UserPreferences = {
  darkMode: boolean;
  lastTimeRange: "week" | "month" | "year";
  showMotivationalQuote: boolean;
};
