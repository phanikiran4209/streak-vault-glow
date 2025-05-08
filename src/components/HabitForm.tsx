import { useState } from "react";
import { Habit, DayOfWeek, HabitFrequency } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate, getLocalStorage } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext"; // Adjust path as needed

interface HabitFormProps {
  initialHabit?: Habit;
  onSubmit: (habit: Omit<Habit, "id" | "createdAt"> | Habit) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
}

const DAYS_OF_WEEK: { label: string; value: DayOfWeek }[] = [
  { label: "Monday", value: "mon" },
  { label: "Tuesday", value: "tue" },
  { label: "Wednesday", value: "wed" },
  { label: "Thursday", value: "thu" },
  { label: "Friday", value: "fri" },
  { label: "Saturday", value: "sat" },
  { label: "Sunday", value: "sun" },
];

const BASE_URL = "http://127.0.0.1:5000";
const TOKEN_STORAGE_KEY = "habitvault_token";

const HabitForm = ({
  initialHabit,
  onSubmit,
  onCancel,
  onDelete,
  isEditing = false,
}: HabitFormProps) => {
  const { user } = useAuth(); // Get current user from AuthContext
  const [name, setName] = useState(initialHabit?.name || "");
  const [frequency, setFrequency] = useState<HabitFrequency>(
    initialHabit?.frequency || "daily"
  );
  const [startDate, setStartDate] = useState(
    initialHabit?.startDate || formatDate(new Date())
  );
  const [customDays, setCustomDays] = useState<DayOfWeek[]>(
    initialHabit?.customDays || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCustomDayToggle = (day: DayOfWeek) => {
    setCustomDays((prevDays) =>
      prevDays.includes(day)
        ? prevDays.filter((d) => d !== day)
        : [...prevDays, day]
    );
  };

  // Convert form frequency and customDays to API's target_days format
  const getTargetDays = (): string[] => {
    switch (frequency) {
      case "daily":
        return ["Every Day"];
      case "weekdays":
        return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      case "weekends":
        return ["Saturday", "Sunday"];
      case "custom":
        return customDays.map(
          (day) => DAYS_OF_WEEK.find((d) => d.value === day)?.label || day
        );
      default:
        return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!user) {
      setError("You must be logged in to save a habit");
      setIsLoading(false);
      return;
    }

    if (!name.trim()) {
      setError("Please enter a habit name");
      setIsLoading(false);
      return;
    }

    if (frequency === "custom" && customDays.length === 0) {
      setError("Please select at least one day for custom frequency");
      setIsLoading(false);
      return;
    }

    const token = getLocalStorage<string | null>(TOKEN_STORAGE_KEY, null);
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      setIsLoading(false);
      return;
    }

    const habitData = {
      name: name.trim(),
      target_days: getTargetDays(),
      start_date: startDate,
    };

    try {
      const url = isEditing
        ? `${BASE_URL}/api/habits/${initialHabit?.id}`
        : `${BASE_URL}/api/habits`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(habitData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized. Please log in again.");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save habit");
      }

      const responseData = await response.json();
      onSubmit({
        ...habitData,
        id: responseData.id || initialHabit?.id,
        frequency,
        customDays: frequency === "custom" ? customDays : undefined,
        startDate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !onDelete || !initialHabit?.id) return;

    if (!user) {
      setError("You must be logged in to delete a habit");
      return;
    }

    const token = getLocalStorage<string | null>(TOKEN_STORAGE_KEY, null);
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/habits/${initialHabit.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized. Please log in again.");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete habit");
      }

      onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="space-y-2">
        <Label htmlFor="habit-name">Habit Name</Label>
        <Input
          id="habit-name"
          placeholder="e.g. Drink water"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label>Frequency</Label>
        <RadioGroup
          value={frequency}
          onValueChange={(value) => setFrequency(value as HabitFrequency)}
          className="grid grid-cols-2 gap-2"
          disabled={isLoading}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="daily" id="daily" />
            <Label htmlFor="daily">Daily</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="weekdays" id="weekdays" />
            <Label htmlFor="weekdays">Weekdays</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="weekends" id="weekends" />
            <Label htmlFor="weekends">Weekends</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom">Custom</Label>
          </div>
        </RadioGroup>
      </div>

      {frequency === "custom" && (
        <div className="space-y-2">
          <Label>Days of the Week</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day.value}`}
                  checked={customDays.includes(day.value)}
                  onCheckedChange={() => handleCustomDayToggle(day.value)}
                  disabled={isLoading}
                />
                <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="start-date">Start Date</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-between pt-4">
        {isEditing && onDelete ? (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Delete Habit
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {isEditing ? "Cancel" : "Discard"}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : isEditing
              ? "Save Changes"
              : "Create Habit"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default HabitForm;