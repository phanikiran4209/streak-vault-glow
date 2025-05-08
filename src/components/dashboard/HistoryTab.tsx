
import { Calendar, CheckCircle } from "lucide-react";
import { HabitWithLogs } from "@/types";
import HabitHeatmap from "@/components/HabitHeatmap";
import { Flame } from "lucide-react";
import { EmptyHabitState } from "./EmptyHabitState";

interface HistoryTabProps {
  habits: HabitWithLogs[];
  onAddHabit: () => void;
}

export const HistoryTab = ({ habits, onAddHabit }: HistoryTabProps) => {
  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent flex items-center">
        <CheckCircle className="mr-2 h-6 w-6 text-primary-500" /> Habit History
      </h2>
      
      {habits.length === 0 ? (
        <EmptyHabitState
          title="No habits to show"
          description="Add habits to see their history here. Track your progress over time with visual heatmaps."
          icon={<Calendar className="h-10 w-10 text-primary" />}
          onAddHabit={onAddHabit}
        />
      ) : (
        <div className="space-y-8">
          {habits.map((habit) => (
            <div key={habit.id} className="space-y-3 bg-white/80 dark:bg-gray-800/60 p-6 rounded-xl border border-border backdrop-blur-sm card-gradient">
              <h3 className="font-medium text-lg flex items-center">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                </div>
                {habit.name}
                <div className="ml-auto flex items-center bg-primary/10 px-3 py-1 rounded-full text-xs text-primary-700 dark:text-primary-300">
                  <Flame className="h-3.5 w-3.5 mr-1" />
                  Streak: {habit.currentStreak} days
                </div>
              </h3>
              <HabitHeatmap habit={habit} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
