
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HabitWithLogs } from "@/types";
import { getDaysInMonth, formatDate } from "@/lib/utils";

interface HabitHeatmapProps {
  habit: HabitWithLogs;
}

const HabitHeatmap = ({ habit }: HabitHeatmapProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Calculate the first day of the month
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayOffset = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
  
  // Calculate the number of days in the month
  const daysInMonth = getDaysInMonth(year, month);
  
  // Create the calendar grid
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const dayIndex = index - firstDayOffset + 1;
    
    if (dayIndex < 1 || dayIndex > daysInMonth) {
      return null; // Empty cell for days outside the month
    }
    
    const date = new Date(year, month, dayIndex);
    const dateString = formatDate(date);
    const status = habit.logs[dateString];
    
    let bgColor = "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600";
    let icon = null;
    
    if (status === "completed") {
      bgColor = "bg-completed hover:bg-completed-hover";
      icon = <div className="absolute inset-0 flex items-center justify-center text-white">✓</div>;
    } else if (status === "missed") {
      bgColor = "bg-missed hover:bg-missed-hover";
      icon = <div className="absolute inset-0 flex items-center justify-center text-white">✕</div>;
    }
    
    // Check if today
    const isToday = new Date().toDateString() === date.toDateString();
    const todayClass = isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : '';
    
    return {
      day: dayIndex,
      date: dateString,
      status,
      bgColor,
      icon,
      isToday,
      todayClass
    };
  });
  
  // Separate the calendar grid into weeks
  const calendarWeeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    calendarWeeks.push(calendarDays.slice(i, i + 7));
  }
  
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  return (
    <div className="bg-white/80 dark:bg-gray-800/60 rounded-xl p-5 border border-border backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center text-primary-800 dark:text-primary-200">
          <Calendar className="h-4 w-4 mr-2 text-primary-500" /> 
          Habit History
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {monthName} {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
            onClick={goToNextMonth}
            disabled={new Date(year, month) >= new Date(new Date().getFullYear(), new Date().getMonth())}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-semibold py-1 text-muted-foreground">
            {day}
          </div>
        ))}
        
        {calendarWeeks.map((week, weekIndex) => (
          week.map((day, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={`relative aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all duration-200 
                ${day ? day.bgColor + ' ' + day.todayClass : 'bg-transparent'}`}
            >
              {day?.day}
              {day?.icon}
              {day?.isToday && !day?.icon && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
              )}
            </div>
          ))
        ))}
      </div>
      
      <div className="flex justify-center mt-4 gap-6 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 mr-1.5 bg-completed rounded-sm"></div>
          <span className="font-medium">Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 mr-1.5 bg-missed rounded-sm"></div>
          <span className="font-medium">Missed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 mr-1.5 bg-gray-100 dark:bg-gray-700 rounded-sm"></div>
          <span className="font-medium">Not tracked</span>
        </div>
      </div>
    </div>
  );
};

export default HabitHeatmap;
