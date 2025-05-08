
import { Calendar, Target } from "lucide-react";
import { HabitWithLogs } from "@/types";
import HabitCard from "@/components/HabitCard";
import { EmptyHabitState } from "./EmptyHabitState";

interface TodayTabProps {
  habits: HabitWithLogs[];
  onEditHabit: (habit: HabitWithLogs) => void;
  onAddHabit: () => void;
}

export const TodayTab = ({ habits, onEditHabit, onAddHabit }: TodayTabProps) => {
  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent flex items-center">
        <Calendar className="mr-2 h-6 w-6 text-primary-500" /> Today's Habits
      </h2>
      
      {habits.length === 0 ? (
        <EmptyHabitState
          title="No habits yet"
          description="Start building better routines by adding your first habit to track. Daily consistency leads to remarkable results!"
          icon={<Target className="h-10 w-10 text-primary" />}
          onAddHabit={onAddHabit}
          buttonText="Add Your First Habit"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={onEditHabit}
            />
          ))}
        </div>
      )}
    </div>
  );
};
