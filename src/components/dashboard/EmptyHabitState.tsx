
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyHabitStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onAddHabit: () => void;
  buttonText?: string;
}

export const EmptyHabitState = ({ 
  title, 
  description, 
  icon, 
  onAddHabit, 
  buttonText = "Add Habit" 
}: EmptyHabitStateProps) => {
  return (
    <div className="bg-white/80 dark:bg-gray-800/60 rounded-xl p-10 text-center border border-border backdrop-blur-sm card-gradient">
      <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 glow-effect">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-primary-700 dark:text-primary-300">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>
      <Button 
        onClick={onAddHabit}
        size="lg"
        className="bg-primary hover:bg-primary-600 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40"
      >
        <Plus className="mr-2 h-5 w-5" /> {buttonText}
      </Button>
    </div>
  );
};
