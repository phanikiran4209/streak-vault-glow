
import { Habit, HabitWithLogs } from "@/types";

// Using relative URL to work in any environment
const API_URL = '';

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
  const token = localStorage.getItem('habitvault_token');
  if (!token) {
    throw new Error("Authentication required");
  }

  const habitToCreate = convertToApiHabit({
    ...habit,
    id: "", // Will be assigned by the API
    createdAt: new Date().toISOString(),
  });

  try {
    // Try the real API endpoint
    const response = await fetch(`${API_URL}/api/habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(habitToCreate)
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const createdHabit = await response.json();
    return convertFromApiHabit(createdHabit);
  } catch (error) {
    console.warn("API createHabit failed, using fallback demo mode:", error);
    
    // Demo mode fallback - create a habit with a generated ID
    const demoHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    return demoHabit;
  }
};

export const getHabits = async (): Promise<Habit[]> => {
  const token = localStorage.getItem('habitvault_token');
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    // Try the real API endpoint
    const response = await fetch(`${API_URL}/api/habits`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const habits = await response.json();
    return habits.map(convertFromApiHabit);
  } catch (error) {
    console.warn("API getHabits failed, using fallback demo mode:", error);
    
    // Demo mode fallback - return empty array
    // In a real app, you might want to return some demo data here
    return [];
  }
};

export const updateHabit = async (habit: Habit): Promise<Habit> => {
  const token = localStorage.getItem('habitvault_token');
  if (!token) {
    throw new Error("Authentication required");
  }

  const habitToUpdate = convertToApiHabit(habit);

  try {
    // Try the real API endpoint
    const response = await fetch(`${API_URL}/api/habits/${habit.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(habitToUpdate)
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const updatedHabit = await response.json();
    return convertFromApiHabit(updatedHabit);
  } catch (error) {
    console.warn("API updateHabit failed, using fallback demo mode:", error);
    
    // Demo mode fallback - just return the habit as is
    return habit;
  }
};

export const deleteHabit = async (id: string): Promise<void> => {
  const token = localStorage.getItem('habitvault_token');
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    // Try the real API endpoint
    const response = await fetch(`${API_URL}/api/habits/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }
  } catch (error) {
    console.warn("API deleteHabit failed, using fallback demo mode:", error);
    // Demo mode fallback - no action needed
  }
};
