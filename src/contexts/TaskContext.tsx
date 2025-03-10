
import React, { createContext, useContext, useState, useEffect } from "react";
import { Task, TaskStatus } from "@/types/task";

interface TaskContextType {
  tasks: Task[];
  paginatedTasks: Task[];
  filteredTasks: Task[];
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
  search: {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
  };
  filter: {
    statusFilter: string;
    setStatusFilter: (status: string) => void;
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6); // Default to 6 tasks per page

  // Apply filters to get filtered tasks
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  // Calculate paginated tasks from filtered tasks
  const paginatedTasks = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTasks.slice(startIndex, endIndex);
  }, [filteredTasks, currentPage, pageSize]);

  // Calculate total pages based on filtered tasks
  const totalPages = React.useMemo(() => {
    return Math.ceil(filteredTasks.length / pageSize) || 1; // Ensure at least 1 page
  }, [filteredTasks.length, pageSize]);

  // Ensure currentPage is valid when filtered tasks or pageSize changes
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
        filteredTasks,
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
        },
        search: {
          searchTerm,
          setSearchTerm,
        },
        filter: {
          statusFilter,
          setStatusFilter,
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
