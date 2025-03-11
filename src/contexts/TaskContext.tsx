
import React, { createContext, useContext, useState, useEffect } from "react";
import { Task, TaskStatus } from "@/types/task";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface TaskContextType {
  tasks: Task[];
  paginatedTasks: Task[];
  filteredTasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTask: (id: string) => Promise<Task | null>;
  isLoading: boolean;
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
  fetchTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      toast({
        title: "Error fetching tasks",
        description: "Could not fetch your tasks. Please try again.",
        variant: "destructive",
      });
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (task: Omit<Task, "id" | "createdAt">) => {
    setIsLoading(true);
    try {
      const newTask = await api.createTask(task);
      setTasks((prevTasks) => [...prevTasks, newTask]);
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error creating task",
        description: "Could not create your task. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setIsLoading(true);
    try {
      const updatedTask = await api.updateTask(id, updates);
      if (updatedTask) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === id ? updatedTask : task))
        );
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error updating task",
        description: "Could not update your task. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    setIsLoading(true);
    try {
      const success = await api.deleteTask(id);
      if (success) {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
        toast({
          title: "Task deleted",
          description: "Your task has been deleted successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error deleting task",
        description: "Could not delete your task. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTask = async (id: string) => {
    try {
      return await api.getTaskById(id);
    } catch (error) {
      console.error("Error getting task:", error);
      return null;
    }
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
        isLoading,
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
        },
        fetchTasks
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
