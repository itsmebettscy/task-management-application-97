import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { TaskCard } from "./TaskCard";
import { format, isSameDay } from "date-fns";
import { useTask } from "@/contexts/TaskContext";
import { motion, AnimatePresence } from "framer-motion";

export function CalendarView() {
  const { tasks = [] } = useTask(); // Ensure tasks is always an array
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const tasksForSelectedDay = tasks.filter(task =>
    selectedDate ? isSameDay(new Date(task.createdAt), selectedDate) : false
  );

  const tasksByDate = tasks.reduce<Record<string, number>>((acc, task) => {
    const date = format(new Date(task.createdAt), "yyyy-MM-dd");
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col md:flex-row gap-6 pb-6">
      <div className="w-full md:w-1/3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="bg-card rounded-lg p-3 shadow"
        />
      </div>

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
