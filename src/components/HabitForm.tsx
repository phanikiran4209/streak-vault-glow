
import { useState } from "react";
import { Habit, DayOfWeek, HabitFrequency } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils";

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

const HabitForm = ({
  initialHabit,
  onSubmit,
  onCancel,
  onDelete,
  isEditing = false,
}: HabitFormProps) => {
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

  const handleCustomDayToggle = (day: DayOfWeek) => {
    setCustomDays((prevDays) =>
      prevDays.includes(day)
        ? prevDays.filter((d) => d !== day)
        : [...prevDays, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert("Please enter a habit name");
      return;
    }
    
    if (frequency === "custom" && customDays.length === 0) {
      alert("Please select at least one day for custom frequency");
      return;
    }
    
    const habitData = {
      ...(initialHabit || {}),
      name: name.trim(),
      frequency,
      customDays: frequency === "custom" ? customDays : undefined,
      startDate,
    };
    
    onSubmit(habitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="habit-name">Habit Name</Label>
        <Input
          id="habit-name"
          placeholder="e.g. Drink water"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Frequency</Label>
        <RadioGroup
          value={frequency}
          onValueChange={(value) => setFrequency(value as HabitFrequency)}
          className="grid grid-cols-2 gap-2"
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
        />
      </div>

      <div className="flex justify-between pt-4">
        {isEditing && onDelete ? (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
          >
            Delete Habit
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            {isEditing ? "Cancel" : "Discard"}
          </Button>
          <Button type="submit">
            {isEditing ? "Save Changes" : "Create Habit"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default HabitForm;
