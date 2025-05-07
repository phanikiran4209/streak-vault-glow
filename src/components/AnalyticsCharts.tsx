
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HabitWithLogs } from "@/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

interface AnalyticsChartsProps {
  habits: HabitWithLogs[];
}

export const AnalyticsCharts = ({ habits }: AnalyticsChartsProps) => {
  // Prepare data for completion rate pie chart
  const completionRateData = [
    {
      name: "Completed",
      value: habits.reduce((sum, habit) => sum + habit.completionRate, 0) / (habits.length || 1),
    },
    {
      name: "Missed",
      value: 100 - habits.reduce((sum, habit) => sum + habit.completionRate, 0) / (habits.length || 1),
    },
  ];

  // Prepare data for habits distribution by streak
  const streaksData = habits.map(habit => ({
    name: habit.name,
    currentStreak: habit.currentStreak,
    longestStreak: habit.longestStreak,
  }));

  // Colors for charts
  const COLORS = ["#9b87f5", "#f87171", "#4ade80", "#facc15", "#38bdf8"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {/* Completion Rate Pie Chart */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Overall Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ChartContainer
              config={{
                completed: { color: "#9b87f5", label: "Completed" },
                missed: { color: "#f87171", label: "Missed" }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionRateData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    animationDuration={1000}
                  >
                    {completionRateData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? "#9b87f5" : "#f87171"} 
                        className="hover:opacity-90 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border border-border rounded-lg shadow-lg">
                            <p className="font-medium">{payload[0].name}</p>
                            <p className="text-lg font-bold">
                              {payload[0].value.toFixed(1)}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Habits by Streak Chart */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Habits by Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ChartContainer
              config={{
                currentStreak: { color: "#9b87f5", label: "Current Streak" },
                longestStreak: { color: "#4ade80", label: "Longest Streak" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={streaksData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="currentStreak"
                    fill="#9b87f5"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                  <Bar
                    dataKey="longestStreak"
                    fill="#4ade80"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;
