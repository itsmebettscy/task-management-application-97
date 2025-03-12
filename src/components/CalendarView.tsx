
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Task } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { format, isSameDay } from "date-fns";
import { useTask } from "@/contexts/TaskContext";
import { motion, AnimatePresence } from "framer-motion";

export function CalendarView() {
  const { tasks } = useTask();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Get tasks for the selected date (based on creation date for simplicity)
  // In a real app, you'd likely use a due date property
  const tasksForSelectedDay = selectedDate
    ? tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return isSameDay(taskDate, selectedDate);
      })
    : [];

  // Count tasks for each day to show in the calendar
  const tasksByDate = tasks.reduce((acc, task) => {
    const date = format(new Date(task.createdAt), 'yyyy-MM-dd');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Generate custom calendar day renderer
  const renderDay = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const taskCount = tasksByDate[dateKey] || 0;
    return (
      <div className="relative flex justify-center items-center h-full">
        <div>{day.getDate()}</div>
        {taskCount > 0 && (
          <div className="absolute bottom-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
            {taskCount}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 pb-6">
      <div className="w-full md:w-1/3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="bg-card rounded-lg p-3 shadow"
          components={{
            Day: ({ day, ...props }) => (
              <div {...props}>
                {renderDay(day)}
              </div>
            ),
          }}
        />
      </div>
      
      <div className="w-full md:w-2/3">
        <div className="bg-card rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
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
                  className="p-6 text-center text-muted-foreground"
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
