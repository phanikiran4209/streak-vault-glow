
import { Habit, HabitWithLogs } from "@/types";
import { Button } from "@/components/ui/button";
import { formatDate, getToday, shouldTrackHabit } from "@/lib/utils";
import { useHabits } from "@/contexts/HabitsContext";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: HabitWithLogs;
  onEdit: (habit: Habit) => void;
}

const HabitCard = ({ habit, onEdit }: HabitCardProps) => {
  const { updateHabitStatus } = useHabits();
  const today = getToday();
  const todayStatus = habit.logs[today];

  const handleToggle = () => {
    const newStatus = todayStatus === "completed" ? "missed" : "completed";
    updateHabitStatus(habit.id, today, newStatus);
  };

  const isTrackingToday = shouldTrackHabit(habit, new Date());

  // Get the days for frequency display
  const getFrequencyText = () => {
    switch (habit.frequency) {
      case "daily":
        return "Every day";
      case "weekdays":
        return "Weekdays";
      case "weekends":
        return "Weekends";
      case "custom":
        return "Custom days";
      default:
        return "";
    }
  };

  return (
    <div className={cn(
      "habit-card bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border p-4",
      habit.currentStreak >= 5 ? "border-primary-300" : "",
      habit.currentStreak >= 10 ? "streak-pulse" : ""
    )}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{habit.name}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(habit)}
            className="text-xs"
          >
            Edit
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground mb-3">
          {getFrequencyText()}
        </div>

        <div className="mt-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Current streak:</span>
              <span className="font-bold text-primary">{habit.currentStreak}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Best:</span>
              <span className="font-medium">{habit.longestStreak}</span>
            </div>
          </div>

          {isTrackingToday ? (
            <div className="flex justify-between gap-2">
              <Button
                variant={todayStatus === "completed" ? "default" : "outline"}
                className={cn(
                  "flex-1",
                  todayStatus === "completed" 
                    ? "bg-completed hover:bg-completed-hover" 
                    : ""
                )}
                onClick={() => updateHabitStatus(habit.id, today, "completed")}
              >
                <Check className="w-4 h-4 mr-1" /> Done
              </Button>
              <Button
                variant={todayStatus === "missed" ? "default" : "outline"}
                className={cn(
                  "flex-1",
                  todayStatus === "missed" 
                    ? "bg-missed hover:bg-missed-hover" 
                    : ""
                )}
                onClick={() => updateHabitStatus(habit.id, today, "missed")}
              >
                <X className="w-4 h-4 mr-1" /> Skip
              </Button>
            </div>
          ) : (
            <div className="bg-muted p-2 rounded-md text-center text-sm text-muted-foreground">
              Not scheduled for today
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
