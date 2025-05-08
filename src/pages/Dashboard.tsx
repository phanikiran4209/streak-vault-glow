
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Habit } from "@/types";
import { useHabits } from "@/contexts/HabitsContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import HabitForm from "@/components/HabitForm";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Calendar, BarChart3, CheckCircle, Settings, Plus } from "lucide-react";

// Import refactored components
import { DailyQuote } from "@/components/dashboard/DailyQuote";
import { TodayTab } from "@/components/dashboard/TodayTab";
import { HistoryTab } from "@/components/dashboard/HistoryTab";
import { AnalyticsTab } from "@/components/dashboard/AnalyticsTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";

const Dashboard = () => {
  const { habits, addHabit, updateHabit, deleteHabit, isLoading } = useHabits();
  const { preferences, updatePreferences } = usePreferences();
  const { toast } = useToast();
  
  const [isAddHabitDialogOpen, setIsAddHabitDialogOpen] = useState(false);
  const [isEditHabitDialogOpen, setIsEditHabitDialogOpen] = useState(false);
  const [currentHabit, setCurrentHabit] = useState<Habit | null>(null);
  const [activeTab, setActiveTab] = useState("today");
  
  const handleAddHabit = async (habit: Omit<Habit, "id" | "createdAt">) => {
    try {
      await addHabit(habit);
      setIsAddHabitDialogOpen(false);
    } catch (error) {
      // Error is already handled in the context
      console.error("Error in handleAddHabit:", error);
    }
  };
  
  const handleEditHabit = (habit: Habit) => {
    setCurrentHabit(habit);
    setIsEditHabitDialogOpen(true);
  };
  
  const handleUpdateHabit = async (habit: Habit) => {
    try {
      await updateHabit(habit);
      setIsEditHabitDialogOpen(false);
      setCurrentHabit(null);
    } catch (error) {
      // Error is already handled in the context
      console.error("Error in handleUpdateHabit:", error);
    }
  };
  
  const handleDeleteHabit = async () => {
    if (currentHabit) {
      try {
        await deleteHabit(currentHabit.id);
        setIsEditHabitDialogOpen(false);
        setCurrentHabit(null);
      } catch (error) {
        // Error is already handled in the context
        console.error("Error in handleDeleteHabit:", error);
      }
    }
  };
  
  return (
    <Layout>
      {/* Motivational Quote */}
      <DailyQuote show={preferences.showMotivationalQuote} />
      
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
        <TabsContent value="today">
          <TodayTab 
            habits={habits} 
            onEditHabit={handleEditHabit} 
            onAddHabit={() => setIsAddHabitDialogOpen(true)} 
          />
        </TabsContent>
        
        {/* History Tab */}
        <TabsContent value="history">
          <HistoryTab 
            habits={habits} 
            onAddHabit={() => setIsAddHabitDialogOpen(true)} 
          />
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnalyticsTab 
            habits={habits} 
            onAddHabit={() => setIsAddHabitDialogOpen(true)} 
          />
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <SettingsTab 
            preferences={preferences} 
            updatePreferences={updatePreferences} 
            habits={habits}
            onAddHabit={() => setIsAddHabitDialogOpen(true)}
            onEditHabit={handleEditHabit}
          />
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
