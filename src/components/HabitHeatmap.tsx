
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HabitWithLogs } from "@/types";
import { getDaysInMonth, formatDate, addDays } from "@/lib/utils";

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
    
    let bgColor = "bg-gray-100 dark:bg-gray-700";
    
    if (status === "completed") {
      bgColor = "bg-completed";
    } else if (status === "missed") {
      bgColor = "bg-missed";
    }
    
    return {
      day: dayIndex,
      date: dateString,
      status,
      bgColor,
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
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Habit History</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {monthName} {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={goToNextMonth}
            disabled={new Date(year, month) >= new Date(new Date().getFullYear(), new Date().getMonth())}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-medium py-1 text-muted-foreground">
            {day}
          </div>
        ))}
        
        {calendarWeeks.map((week, weekIndex) => (
          week.map((day, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={`aspect-square rounded-md flex items-center justify-center text-xs 
                ${day ? day.bgColor : 'bg-transparent'}`}
            >
              {day?.day}
            </div>
          ))
        ))}
      </div>
      
      <div className="flex justify-center mt-4 gap-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 mr-1 bg-completed rounded-sm"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 mr-1 bg-missed rounded-sm"></div>
          <span>Missed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 mr-1 bg-gray-100 dark:bg-gray-700 rounded-sm"></div>
          <span>Not tracked</span>
        </div>
      </div>
    </div>
  );
};

export default HabitHeatmap;
