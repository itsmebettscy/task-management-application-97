import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Task } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { format, isSameDay, parseISO } from "date-fns";
import { useTask } from "@/contexts/TaskContext";
import { motion, AnimatePresence } from "framer-motion";

export function CalendarView() {
  const { tasks } = useTask();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Ensure `createdAt` is parsed correctly
  const tasksForSelectedDay = selectedDate
    ? tasks.filter(task => {
        const taskDate = task.createdAt ? new Date(task.createdAt) : null;
        return taskDate && isSameDay(taskDate, selectedDate);
      })
    : [];

  // Group tasks by date for calendar indicator
  const tasksByDate = tasks.reduce((acc, task) => {
    if (!task.createdAt) return acc;
    const date = format(new Date(task.createdAt), "yyyy-MM-dd");
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col md:flex-row gap-6 pb-6">
      {/* Calendar Section */}
      <div className="w-full md:w-1/3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="bg-card rounded-lg p-3 shadow"
          dayContentRenderer={(day) => {
            const dateKey = format(day, "yyyy-MM-dd");
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
          }}
        />
      </div>

      {/* Task List Section */}
      <div className="w-full md:w-2/3">
        <div className="bg-card rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
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
