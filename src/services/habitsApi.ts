
import { Habit, HabitWithLogs } from "@/types";

const API_URL = 'http://127.0.0.1:5000';

// Interface for API habit format
export interface ApiHabit {
  id?: string;
  name: string;
  target_days: string[];
  start_date: string;
}

// Convert from API format to our app format
export const convertFromApiHabit = (apiHabit: ApiHabit): Habit => {
  let frequency: "daily" | "weekdays" | "weekends" | "custom" = "custom";
  let customDays: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[] = [];
  
  // Determine frequency based on target_days
  if (apiHabit.target_days.includes("Every Day")) {
    frequency = "daily";
  } else if (apiHabit.target_days.join(",") === "Monday,Tuesday,Wednesday,Thursday,Friday") {
    frequency = "weekdays";
  } else if (apiHabit.target_days.join(",") === "Saturday,Sunday") {
    frequency = "weekends";
  } else {
    frequency = "custom";
    // Convert target_days to our day format
    if (apiHabit.target_days.includes("Monday")) customDays.push("mon");
    if (apiHabit.target_days.includes("Tuesday")) customDays.push("tue");
    if (apiHabit.target_days.includes("Wednesday")) customDays.push("wed");
    if (apiHabit.target_days.includes("Thursday")) customDays.push("thu");
    if (apiHabit.target_days.includes("Friday")) customDays.push("fri");
    if (apiHabit.target_days.includes("Saturday")) customDays.push("sat");
    if (apiHabit.target_days.includes("Sunday")) customDays.push("sun");
  }

  return {
    id: apiHabit.id || crypto.randomUUID(),
    name: apiHabit.name,
    frequency,
    customDays: frequency === "custom" ? customDays : undefined,
    startDate: apiHabit.start_date,
    createdAt: new Date().toISOString(),
  };
};

// Convert from our app format to API format
export const convertToApiHabit = (habit: Habit): ApiHabit => {
  let targetDays: string[] = [];
  
  // Convert frequency to target_days
  switch (habit.frequency) {
    case "daily":
      targetDays = ["Every Day"];
      break;
    case "weekdays":
      targetDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      break;
    case "weekends":
      targetDays = ["Saturday", "Sunday"];
      break;
    case "custom":
      // Convert our day format to target_days
      if (habit.customDays?.includes("mon")) targetDays.push("Monday");
      if (habit.customDays?.includes("tue")) targetDays.push("Tuesday");
      if (habit.customDays?.includes("wed")) targetDays.push("Wednesday");
      if (habit.customDays?.includes("thu")) targetDays.push("Thursday");
      if (habit.customDays?.includes("fri")) targetDays.push("Friday");
      if (habit.customDays?.includes("sat")) targetDays.push("Saturday");
      if (habit.customDays?.includes("sun")) targetDays.push("Sunday");
      break;
  }
  
  return {
    id: habit.id,
    name: habit.name,
    target_days: targetDays,
    start_date: habit.startDate,
  };
};

// API functions
export const createHabit = async (habit: Omit<Habit, "id" | "createdAt">): Promise<Habit> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error("Authentication required");
  }

  const habitToCreate = convertToApiHabit({
    ...habit,
    id: "", // Will be assigned by the API
    createdAt: new Date().toISOString(),
  });

  const response = await fetch(`${API_URL}/api/habits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(habitToCreate)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create habit");
  }

  const createdHabit = await response.json();
  return convertFromApiHabit(createdHabit);
};

export const getHabits = async (): Promise<Habit[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_URL}/api/habits`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch habits");
  }

  const habits = await response.json();
  return habits.map(convertFromApiHabit);
};

export const updateHabit = async (habit: Habit): Promise<Habit> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error("Authentication required");
  }

  const habitToUpdate = convertToApiHabit(habit);

  const response = await fetch(`${API_URL}/api/habits/${habit.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(habitToUpdate)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update habit");
  }

  const updatedHabit = await response.json();
  return convertFromApiHabit(updatedHabit);
};

export const deleteHabit = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_URL}/api/habits/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete habit");
  }
};
