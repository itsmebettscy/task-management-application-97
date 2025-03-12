import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { TaskCard } from "./TaskCard";
import { format, isSameDay } from "date-fns";
import { useTask } from "@/contexts/TaskContext";

export function CalendarView() {
  const { tasks } = useTask() || { tasks: [] }; // Add fallback for null context
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Debugging - add console logs to check data flow
  console.log("Tasks from context:", tasks);
  console.log("Selected date:", selectedDate);

  // Add error handling for task filtering
  const tasksForSelectedDay = selectedDate && tasks && Array.isArray(tasks) 
    ? tasks.filter(task => {
        try {
          const taskDate = new Date(task.createdAt);
          return isSameDay(taskDate, selectedDate);
        } catch (error) {
          console.error("Error filtering task:", error, task);
          return false;
        }
      })
    : [];

  console.log("Tasks for selected day:", tasksForSelectedDay);

  // Count tasks for each day with error handling
  const tasksByDate = tasks && Array.isArray(tasks) 
    ? tasks.reduce((acc, task) => {
        try {
          const date = format(new Date(task.createdAt), 'yyyy-MM-dd');
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        } catch (error) {
          console.error("Error processing task date:", error, task);
          return acc;
        }
      }, {} as Record<string, number>)
    : {};

  // Generate custom calendar day renderer
  const renderDay = (day: Date) => {
    try {
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
    } catch (error) {
      console.error("Error rendering day:", error, day);
      return <div>{day.getDate()}</div>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 pb-6">
      <div className="w-full md:w-1/3">
        <Calendar 
          mode="single" 
          selected={selectedDate} 
          onSelect={(date) => setSelectedDate(date || new Date())}
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
            {tasksForSelectedDay.length > 0 ? (
              tasksForSelectedDay.map(task => (
                <div key={task.id}>
                  <TaskCard task={task} />
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No tasks for this date
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
