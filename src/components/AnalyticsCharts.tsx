
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { HabitWithLogs } from "@/types";

interface AnalyticsChartsProps {
  habits: HabitWithLogs[];
}

const COLORS = ['#9b87f5', '#65c9ff', '#ff7eb6', '#7affa7', '#ffd166'];

export function AnalyticsCharts({ habits }: AnalyticsChartsProps) {
  const [activeTab, setActiveTab] = useState("completion");

  // Calculate completion rates
  const completionData = habits.map((habit) => ({
    name: habit.name,
    value: habit.completionRate,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

  // Calculate streaks
  const streakData = habits.map((habit) => ({
    name: habit.name,
    current: habit.currentStreak,
    longest: habit.longestStreak,
  }));

  // Simple weekly trend data (mock data - in a real app, you would calculate this from actual logs)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trendData = days.map((day, i) => {
    const completedCount = habits.reduce((acc, habit) => {
      // This is simplified; in reality you'd check for the actual day's logs
      const randomCompleted = Math.random() > 0.3; 
      return randomCompleted ? acc + 1 : acc;
    }, 0);
    
    return {
      day,
      completed: completedCount,
      total: habits.length,
      rate: habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const stringValue = typeof value === 'number' ? value.toString() : value;
      const formattedValue = typeof value === 'number' ? `${value}%` : value;
      
      return (
        <div className="bg-background p-2 rounded border border-border shadow-sm">
          <p>{payload[0].name}: {formattedValue}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-full animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="completion" className="flex-1">Completion Rate</TabsTrigger>
            <TabsTrigger value="streaks" className="flex-1">Streaks</TabsTrigger>
            <TabsTrigger value="trend" className="flex-1">Weekly Trend</TabsTrigger>
          </TabsList>
          
          <TabsContent value="completion" className="mt-4">
            {habits.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No habits to analyze yet</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={800}
                    >
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend formatter={(value, entry, index) => value} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="streaks" className="mt-4">
            {habits.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No habits to analyze yet</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={streakData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="current" name="Current Streak" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="longest" name="Longest Streak" fill="#65c9ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="trend" className="mt-4">
            {habits.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No habits to analyze yet</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      name="Completion Rate"
                      stroke="#9b87f5"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
