import { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { useTask } from "@/contexts/TaskContext";
import { motion, AnimatePresence } from "framer-motion";

export function CalendarView() {
  const { tasks } = useTask();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  
  // Get tasks for the selected date
  const tasksForSelectedDay = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    return isSameDay(taskDate, selectedDate);
  });
  
  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };
  
  // Format date to display
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(undefined, options);
  };
  
  // Count tasks for a specific date
  const getTaskCountForDate = (date: Date): number => {
    return tasks.filter(task => isSameDay(new Date(task.createdAt), date)).length;
  };
  
  // Generate calendar days for the current month view
  useEffect(() => {
    const days: Date[] = [];
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Add days from previous month to fill the first week
    const daysFromPrevMonth = firstDayOfWeek;
    const prevMonth = new Date(currentYear, currentMonth, 0);
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      days.push(new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i));
    }
    
    // Add all days of current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }
    
    // Add days from next month to complete the grid (6 rows of 7 days)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(currentYear, currentMonth + 1, i));
    }
    
    setCalendarDays(days);
  }, [currentMonth, currentYear]);
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Get month name
  const getMonthName = (month: number): string => {
    const date = new Date();
    date.setMonth(month);
    return date.toLocaleString('default', { month: 'long' });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 pb-6">
      <div className="w-full md:w-1/3">
        <div className="bg-card rounded-lg p-3 shadow">
          {/* Calendar header */}
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={goToPreviousMonth}
              className="p-2 rounded-full hover:bg-gray-200 text-gray-800"
            >
              &lt;
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              {getMonthName(currentMonth)} {currentYear}
            </h2>
            <button 
              onClick={goToNextMonth}
              className="p-2 rounded-full hover:bg-gray-200 text-gray-800"
            >
              &gt;
            </button>
          </div>
          
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium text-sm py-1 text-gray-700">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentMonth;
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const taskCount = getTaskCountForDate(day);
              
              return (
                <div 
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    p-2 h-12 text-center relative cursor-pointer rounded
                    ${isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}
                    ${isToday ? 'bg-blue-100' : ''}
                    ${isSelected ? 'bg-blue-200' : ''}
                    hover:bg-gray-100
                  `}
                >
                  <span className={`${isSelected ? 'font-bold' : ''}`}>
                    {day.getDate()}
                  </span>
                  {taskCount > 0 && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">
                      {taskCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-2/3">
        <div className="bg-card rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {formatDate(selectedDate)}
          </h2>
          
          <div className="space-y-4">
            <AnimatePresence>
              {tasksForSelectedDay.length > 0 ? (
                tasksForSelectedDay.map(task => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TaskCard task={task} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 text-center text-gray-500"
                >
                  No tasks for this date
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
