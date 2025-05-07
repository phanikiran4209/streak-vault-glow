
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
import AnalyticsCharts from "@/components/AnalyticsCharts";
import { 
  BarChart3, 
  Calendar, 
  Plus, 
  PieChart, 
  Settings, 
  Sparkles, 
  Trophy, 
  Flame, 
  ArrowUpRight,
  Target,
  CheckCircle
} from "lucide-react";
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
          <div className="bg-white/80 dark:bg-gray-800/60 p-6 rounded-xl border border-border backdrop-blur-sm card-gradient">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="h-5 w-5 text-yellow-400 mr-2" />
              <h3 className="text-sm font-medium text-primary-700 dark:text-primary-300">DAILY INSPIRATION</h3>
            </div>
            <p className="italic font-medium text-lg text-gray-700 dark:text-gray-300 neon-text">
              "{motivationalQuote}"
            </p>
          </div>
        </div>
      )}
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-8 dashboard-header">
          <TabsList className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
            <TabsTrigger value="today" className="tab-animation">
              <Calendar className="mr-1 h-4 w-4" /> Today
            </TabsTrigger>
            <TabsTrigger value="history" className="tab-animation">
              <CheckCircle className="mr-1 h-4 w-4" /> History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="tab-animation">
              <BarChart3 className="mr-1 h-4 w-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="tab-animation">
              <Settings className="mr-1 h-4 w-4" /> Settings
            </TabsTrigger>
          </TabsList>
          
          <Button 
            onClick={() => setIsAddHabitDialogOpen(true)}
            className="bg-primary hover:bg-primary-600 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40"
          >
            <Plus className="mr-1 h-4 w-4" /> Add Habit
          </Button>
        </div>
        
        {/* Today Tab */}
        <TabsContent value="today" className="space-y-6 animate-slide-up">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent flex items-center">
            <Calendar className="mr-2 h-6 w-6 text-primary-500" /> Today's Habits
          </h2>
          
          {habits.length === 0 ? (
            <div className="bg-white/80 dark:bg-gray-800/60 rounded-xl p-10 text-center border border-border backdrop-blur-sm card-gradient">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 glow-effect">
                <Target className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-700 dark:text-primary-300">No habits yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start building better routines by adding your first habit to track. Daily consistency leads to remarkable results!
              </p>
              <Button 
                onClick={() => setIsAddHabitDialogOpen(true)}
                size="lg"
                className="bg-primary hover:bg-primary-600 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40"
              >
                <Plus className="mr-2 h-5 w-5" /> Add Your First Habit
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent flex items-center">
            <CheckCircle className="mr-2 h-6 w-6 text-primary-500" /> Habit History
          </h2>
          
          {habits.length === 0 ? (
            <div className="bg-white/80 dark:bg-gray-800/60 rounded-xl p-10 text-center border border-border backdrop-blur-sm card-gradient">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 glow-effect">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-700 dark:text-primary-300">No habits to show</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Add habits to see their history here. Track your progress over time with visual heatmaps.
              </p>
              <Button 
                onClick={() => setIsAddHabitDialogOpen(true)}
                size="lg"
                className="bg-primary hover:bg-primary-600 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40"
              >
                <Plus className="mr-2 h-5 w-5" /> Add Habit
              </Button>
            </div>
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
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 animate-slide-up">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent flex items-center">
            <BarChart3 className="mr-2 h-6 w-6 text-primary-500" /> Analytics
          </h2>
          
          {habits.length === 0 ? (
            <div className="bg-white/80 dark:bg-gray-800/60 rounded-xl p-10 text-center border border-border backdrop-blur-sm card-gradient">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 glow-effect">
                <PieChart className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary-700 dark:text-primary-300">No analytics yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start tracking habits to see detailed insights and visualizations here. Charts will appear as you build data.
              </p>
              <Button 
                onClick={() => setIsAddHabitDialogOpen(true)}
                size="lg"
                className="bg-primary hover:bg-primary-600 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40"
              >
                <Plus className="mr-2 h-5 w-5" /> Add Habit
              </Button>
            </div>
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
                  icon={<PieChart className="h-5 w-5" />}
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
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6 animate-slide-up">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent flex items-center">
            <Settings className="mr-2 h-6 w-6 text-primary-500" /> Settings
          </h2>
          
          <div className="bg-white/80 dark:bg-gray-800/60 rounded-xl p-6 border border-border backdrop-blur-sm card-gradient">
            <h3 className="text-lg font-semibold mb-5 flex items-center text-primary-700 dark:text-primary-300">
              <Settings className="h-4 w-4 mr-2" /> Preferences
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => updatePreferences({ darkMode: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              
              <Separator className="bg-primary/10" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Daily Motivational Quote</Label>
                  <p className="text-sm text-muted-foreground">
                    Show a motivational quote on the dashboard
                  </p>
                </div>
                <Switch
                  checked={preferences.showMotivationalQuote}
                  onCheckedChange={(checked) => updatePreferences({ showMotivationalQuote: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              
              <Separator className="bg-primary/10" />
              
              <div className="space-y-3">
                <Label className="text-base">Analytics Default Time Range</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={preferences.lastTimeRange === "week" ? "default" : "outline"}
                    onClick={() => updatePreferences({ lastTimeRange: "week" })}
                    className={`flex-1 ${preferences.lastTimeRange === "week" ? "bg-primary hover:bg-primary-600" : ""}`}
                  >
                    Week
                  </Button>
                  <Button
                    variant={preferences.lastTimeRange === "month" ? "default" : "outline"}
                    onClick={() => updatePreferences({ lastTimeRange: "month" })}
                    className={`flex-1 ${preferences.lastTimeRange === "month" ? "bg-primary hover:bg-primary-600" : ""}`}
                  >
                    Month
                  </Button>
                  <Button
                    variant={preferences.lastTimeRange === "year" ? "default" : "outline"}
                    onClick={() => updatePreferences({ lastTimeRange: "year" })}
                    className={`flex-1 ${preferences.lastTimeRange === "year" ? "bg-primary hover:bg-primary-600" : ""}`}
                  >
                    Year
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/60 rounded-xl p-6 border border-border backdrop-blur-sm card-gradient">
            <h3 className="text-lg font-semibold mb-5 flex items-center text-primary-700 dark:text-primary-300">
              <Target className="h-4 w-4 mr-2" /> Habits Management
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage your habit list below
              </p>
              
              {habits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No habits created yet</p>
                  <Button 
                    onClick={() => setIsAddHabitDialogOpen(true)}
                    className="bg-primary hover:bg-primary-600 transition-all duration-300"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Habit
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex justify-between items-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-8 rounded-full bg-primary/50 mr-3" />
                        <span>{habit.name}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditHabit(habit)}
                        className="hover:border-primary hover:bg-primary/5"
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
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-primary/20">
          <DialogTitle className="text-center text-xl font-semibold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">Add New Habit</DialogTitle>
          <HabitForm
            onSubmit={handleAddHabit}
            onCancel={() => setIsAddHabitDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Habit Dialog */}
      <Dialog open={isEditHabitDialogOpen} onOpenChange={setIsEditHabitDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-primary/20">
          <DialogTitle className="text-center text-xl font-semibold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">Edit Habit</DialogTitle>
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
