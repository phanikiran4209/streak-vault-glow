
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Habit } from "@/types";
import { useHabits } from "@/contexts/HabitsContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { getDailyQuote } from "@/lib/utils";
import HabitCard from "@/components/HabitCard";
import HabitForm from "@/components/HabitForm";
import HabitHeatmap from "@/components/HabitHeatmap";
import Layout from "@/components/Layout";
import { StatsCard } from "@/components/StatsCard";
import { BarChart3, Calendar, Plus, PieChart, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Dashboard = () => {
  const { habits, addHabit, updateHabit, deleteHabit } = useHabits();
  const { preferences, updatePreferences } = usePreferences();
  
  const [isAddHabitDialogOpen, setIsAddHabitDialogOpen] = useState(false);
  const [isEditHabitDialogOpen, setIsEditHabitDialogOpen] = useState(false);
  const [currentHabit, setCurrentHabit] = useState<Habit | null>(null);
  const [activeTab, setActiveTab] = useState("today");
  
  const handleAddHabit = (habit: Omit<Habit, "id" | "createdAt">) => {
    addHabit(habit);
    setIsAddHabitDialogOpen(false);
  };
  
  const handleEditHabit = (habit: Habit) => {
    setCurrentHabit(habit);
    setIsEditHabitDialogOpen(true);
  };
  
  const handleUpdateHabit = (habit: Habit) => {
    updateHabit(habit);
    setIsEditHabitDialogOpen(false);
    setCurrentHabit(null);
  };
  
  const handleDeleteHabit = () => {
    if (currentHabit) {
      deleteHabit(currentHabit.id);
      setIsEditHabitDialogOpen(false);
      setCurrentHabit(null);
    }
  };
  
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
  const motivationalQuote = getDailyQuote();
  
  return (
    <Layout>
      {/* Motivational Quote */}
      {preferences.showMotivationalQuote && (
        <div className="mb-8 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-border text-center">
            <p className="italic font-medium text-lg text-gray-700 dark:text-gray-300">
              "{motivationalQuote}"
            </p>
          </div>
        </div>
      )}
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <Button onClick={() => setIsAddHabitDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add Habit
          </Button>
        </div>
        
        {/* Today Tab */}
        <TabsContent value="today" className="space-y-6 animate-slide-up">
          <h2 className="text-2xl font-bold">Today's Habits</h2>
          
          {habits.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-border">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No habits yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first habit to track
              </p>
              <Button onClick={() => setIsAddHabitDialogOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> Add Your First Habit
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onEdit={handleEditHabit}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* History Tab */}
        <TabsContent value="history" className="space-y-6 animate-slide-up">
          <h2 className="text-2xl font-bold">Habit History</h2>
          
          {habits.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-border">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No habits to show</h3>
              <p className="text-muted-foreground mb-4">
                Add habits to see their history here
              </p>
              <Button onClick={() => setIsAddHabitDialogOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> Add Habit
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {habits.map((habit) => (
                <div key={habit.id} className="space-y-2">
                  <h3 className="font-medium text-lg">{habit.name}</h3>
                  <HabitHeatmap habit={habit} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 animate-slide-up">
          <h2 className="text-2xl font-bold">Analytics</h2>
          
          {habits.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-border">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No analytics yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking habits to see insights here
              </p>
              <Button onClick={() => setIsAddHabitDialogOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> Add Habit
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Habits"
                  value={stats.totalHabits}
                  icon={<Calendar className="h-4 w-4" />}
                />
                <StatsCard
                  title="Completion Rate"
                  value={`${stats.overallCompletionRate}%`}
                  icon={<PieChart className="h-4 w-4" />}
                />
                <StatsCard
                  title="Total Active Streaks"
                  value={stats.totalCurrentStreaks}
                  description="Sum of all current streaks"
                  icon={<BarChart3 className="h-4 w-4" />}
                />
                <StatsCard
                  title="Best Performer"
                  value={stats.bestHabit}
                  description={`Longest streak: ${stats.bestStreak}`}
                  icon={<Settings className="h-4 w-4" />}
                />
              </div>
              
              <h3 className="text-xl font-medium mt-6">Individual Habits</h3>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-border p-4">
                <div className="space-y-4">
                  {habits.map((habit) => (
                    <div key={habit.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                      <span className="font-medium">{habit.name}</span>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{habit.completionRate}%</span> completion
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-primary">{habit.currentStreak}</span> day streak
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6 animate-slide-up">
          <h2 className="text-2xl font-bold">Settings</h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-medium mb-4">Preferences</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => updatePreferences({ darkMode: checked })}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Daily Motivational Quote</Label>
                  <p className="text-sm text-muted-foreground">
                    Show a motivational quote on the dashboard
                  </p>
                </div>
                <Switch
                  checked={preferences.showMotivationalQuote}
                  onCheckedChange={(checked) => updatePreferences({ showMotivationalQuote: checked })}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="text-base">Analytics Default Time Range</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={preferences.lastTimeRange === "week" ? "default" : "outline"}
                    onClick={() => updatePreferences({ lastTimeRange: "week" })}
                    className="flex-1"
                  >
                    Week
                  </Button>
                  <Button
                    variant={preferences.lastTimeRange === "month" ? "default" : "outline"}
                    onClick={() => updatePreferences({ lastTimeRange: "month" })}
                    className="flex-1"
                  >
                    Month
                  </Button>
                  <Button
                    variant={preferences.lastTimeRange === "year" ? "default" : "outline"}
                    onClick={() => updatePreferences({ lastTimeRange: "year" })}
                    className="flex-1"
                  >
                    Year
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-medium mb-4">Habits Management</h3>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage your habit list below
              </p>
              
              {habits.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No habits created yet</p>
                  <Button onClick={() => setIsAddHabitDialogOpen(true)}>
                    <Plus className="mr-1 h-4 w-4" /> Add Habit
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span>{habit.name}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditHabit(habit)}
                      >
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add Habit Dialog */}
      <Dialog open={isAddHabitDialogOpen} onOpenChange={setIsAddHabitDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Add New Habit</DialogTitle>
          <HabitForm
            onSubmit={handleAddHabit}
            onCancel={() => setIsAddHabitDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Habit Dialog */}
      <Dialog open={isEditHabitDialogOpen} onOpenChange={setIsEditHabitDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Edit Habit</DialogTitle>
          {currentHabit && (
            <HabitForm
              initialHabit={currentHabit}
              onSubmit={handleUpdateHabit}
              onCancel={() => {
                setIsEditHabitDialogOpen(false);
                setCurrentHabit(null);
              }}
              onDelete={handleDeleteHabit}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Dashboard;
