
import { Habit, HabitWithLogs } from "@/types";

// Use the full API URL to connect to your backend
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
    console.log(`Sending create habit to: ${API_URL}/api/habits`);
    const response = await fetch(`${API_URL}/api/habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(habitToCreate)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API response not OK: ${response.status}`, errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText || response.statusText}`);
    }

    const createdHabit = await response.json();
    console.log("Successfully created habit:", createdHabit);
    return convertFromApiHabit(createdHabit);
  } catch (error) {
    console.error("API createHabit failed:", error);
    
    // In case the server is not available, use demo mode as fallback
    console.warn("Falling back to demo mode for habit creation");
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
    console.log(`Getting habits from: ${API_URL}/api/habits`);
    const response = await fetch(`${API_URL}/api/habits`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API response not OK: ${response.status}`, errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText || response.statusText}`);
    }

    const habits = await response.json();
    console.log("Successfully fetched habits:", habits);
    return habits.map(convertFromApiHabit);
  } catch (error) {
    console.error("API getHabits failed:", error);
    
    // Demo mode fallback - return empty array
    console.warn("Falling back to demo mode for habit listing");
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
    console.log(`Updating habit at: ${API_URL}/api/habits/${habit.id}`);
    const response = await fetch(`${API_URL}/api/habits/${habit.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(habitToUpdate)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API response not OK: ${response.status}`, errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText || response.statusText}`);
    }

    const updatedHabit = await response.json();
    console.log("Successfully updated habit:", updatedHabit);
    return convertFromApiHabit(updatedHabit);
  } catch (error) {
    console.error("API updateHabit failed:", error);
    
    // Demo mode fallback - just return the habit as is
    console.warn("Falling back to demo mode for habit update");
    return habit;
  }
};

export const deleteHabit = async (id: string): Promise<void> => {
  const token = localStorage.getItem('habitvault_token');
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    console.log(`Deleting habit at: ${API_URL}/api/habits/${id}`);
    const response = await fetch(`${API_URL}/api/habits/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API response not OK: ${response.status}`, errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText || response.statusText}`);
    }
    
    console.log("Successfully deleted habit");
  } catch (error) {
    console.error("API deleteHabit failed:", error);
    console.warn("Falling back to demo mode for habit deletion");
    // Demo mode fallback - no action needed
  }
};
