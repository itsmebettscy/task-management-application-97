
import React, { createContext, useContext, useState, useEffect } from "react";
import { Task, TaskStatus } from "@/types/task";

interface TaskContextType {
  tasks: Task[];
  paginatedTasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTask: (id: string) => Task | undefined;
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    setCurrentPage: (page: number) => void;
    setPageSize: (size: number) => void;
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6); // Default to 6 tasks per page

  // Calculate paginated tasks
  const paginatedTasks = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return tasks.slice(startIndex, endIndex);
  }, [tasks, currentPage, pageSize]);

  // Calculate total pages
  const totalPages = React.useMemo(() => {
    return Math.ceil(tasks.length / pageSize) || 1; // Ensure at least 1 page
  }, [tasks.length, pageSize]);

  // Ensure currentPage is valid when tasks or pageSize changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const getTask = (id: string) => {
    return tasks.find((task) => task.id === id);
  };

  return (
    <TaskContext.Provider
      value={{ 
        tasks, 
        paginatedTasks,
        addTask, 
        updateTask, 
        deleteTask, 
        getTask,
        pagination: {
          currentPage,
          totalPages,
          pageSize,
          setCurrentPage,
          setPageSize,
        }
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
}
