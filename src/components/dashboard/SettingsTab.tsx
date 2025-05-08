
import { Settings, Target, Plus } from "lucide-react";
import { Habit, UserPreferences } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface SettingsTabProps {
  preferences: UserPreferences;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  habits: Habit[];
  onAddHabit: () => void;
  onEditHabit: (habit: Habit) => void;
}

export const SettingsTab = ({ 
  preferences, 
  updatePreferences, 
  habits, 
  onAddHabit, 
  onEditHabit 
}: SettingsTabProps) => {
  return (
    <div className="space-y-6 animate-slide-up">
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
                onClick={onAddHabit}
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
                    onClick={() => onEditHabit(habit)}
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
    </div>
  );
};
