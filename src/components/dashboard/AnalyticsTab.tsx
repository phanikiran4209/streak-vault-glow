
import { BarChart3, PieChart } from "lucide-react";
import { HabitWithLogs } from "@/types";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { StatsCard } from "@/components/StatsCard";
import { Target, PieChart as PieChartIcon, Flame, Trophy, ArrowUpRight } from "lucide-react";
import { EmptyHabitState } from "./EmptyHabitState";

interface AnalyticsTabProps {
  habits: HabitWithLogs[];
  onAddHabit: () => void;
}

export const AnalyticsTab = ({ habits, onAddHabit }: AnalyticsTabProps) => {
  // Calculate overall stats
  const calculateOverallStats = () => {
    const totalHabits = habits.length;
    
    // Calculate overall completion rate
    let totalTracks = 0;
    let totalCompletions = 0;
    
    habits.forEach(habit => {
      const completionRate = habit.completionRate;
      totalTracks++;
      totalCompletions += completionRate;
    });
    
    const overallCompletionRate = totalTracks > 0 
      ? Math.round(totalCompletions / totalTracks) 
      : 0;
    
    // Find best performing habit
    let bestHabit = habits.length > 0 ? habits[0].name : "-";
    let bestStreak = habits.length > 0 ? habits[0].longestStreak : 0;
    
    habits.forEach(habit => {
      if (habit.longestStreak > bestStreak) {
        bestStreak = habit.longestStreak;
        bestHabit = habit.name;
      }
    });
    
    // Calculate total current streaks
    const totalCurrentStreaks = habits.reduce((total, habit) => total + habit.currentStreak, 0);
    
    return {
      totalHabits,
      overallCompletionRate,
      bestHabit,
      bestStreak,
      totalCurrentStreaks
    };
  };
  
  const stats = calculateOverallStats();

  return (
    <div className="space-y-6 animate-slide-up">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent flex items-center">
        <BarChart3 className="mr-2 h-6 w-6 text-primary-500" /> Analytics
      </h2>
      
      {habits.length === 0 ? (
        <EmptyHabitState
          title="No analytics yet"
          description="Start tracking habits to see detailed insights and visualizations here. Charts will appear as you build data."
          icon={<PieChart className="h-10 w-10 text-primary" />}
          onAddHabit={onAddHabit}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Habits"
              value={stats.totalHabits}
              icon={<Target className="h-5 w-5" />}
              trend="up"
              trendValue="Active tracking"
            />
            <StatsCard
              title="Completion Rate"
              value={`${stats.overallCompletionRate}%`}
              icon={<PieChartIcon className="h-5 w-5" />}
              trend={stats.overallCompletionRate > 50 ? "up" : "down"}
              trendValue={`${stats.overallCompletionRate > 50 ? "Good" : "Needs improvement"}`}
            />
            <StatsCard
              title="Total Active Streaks"
              value={stats.totalCurrentStreaks}
              description="Sum of all current streaks"
              icon={<Flame className="h-5 w-5" />}
              trend="neutral"
              trendValue="Ongoing"
            />
            <StatsCard
              title="Best Performer"
              value={stats.bestHabit}
              description={`Longest streak: ${stats.bestStreak}`}
              icon={<Trophy className="h-5 w-5" />}
              trend="up"
              trendValue={`${stats.bestStreak} day record`}
            />
          </div>
          
          {/* Analytics Charts */}
          <AnalyticsCharts habits={habits} />
          
          <h3 className="text-xl font-medium mt-8 flex items-center">
            <ArrowUpRight className="mr-2 h-5 w-5 text-primary" /> 
            Individual Habits Performance
          </h3>
          <div className="bg-white/80 dark:bg-gray-800/60 rounded-xl border border-border p-5 backdrop-blur-sm card-gradient">
            <div className="space-y-2">
              {habits.map((habit) => (
                <div key={habit.id} className="flex items-center justify-between p-3 hover:bg-primary/5 dark:hover:bg-primary/10 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-10 rounded-full bg-primary/30" />
                    <span className="font-medium">{habit.name}</span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-primary">{habit.completionRate}%</span>
                      <span className="text-xs text-muted-foreground">completion</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-primary-700 dark:text-primary-300">{habit.currentStreak}</span>
                      <span className="text-xs text-muted-foreground">day streak</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
