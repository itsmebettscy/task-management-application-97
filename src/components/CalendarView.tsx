import { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Task } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { format, isSameDay } from "date-fns";
import { useTask } from "@/contexts/TaskContext";
import { motion, AnimatePresence } from "framer-motion";

// Create a localizer for the Calendar
const localizer = momentLocalizer(moment);

export function CalendarView() {
  const { tasks } = useTask();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get tasks for the selected date (based on creation date for simplicity)
  const tasksForSelectedDay = selectedDate
    ? tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return isSameDay(taskDate, selectedDate);
      })
    : [];

  // Convert tasks to events format for react-big-calendar
  const events = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: new Date(task.createdAt),
    end: new Date(task.createdAt),
    task: task
  }));

  // Handle event selection
  const handleSelectEvent = (event) => {
    setSelectedDate(event.start);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 pb-6">
      <div className="w-full md:w-1/3">
        <div className="bg-card rounded-lg p-3 shadow" style={{ height: '500px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            date={selectedDate}
            onNavigate={date => setSelectedDate(date)}
            views={['month']}
            defaultView="month"
          />
        </div>
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
