
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  hasError: boolean;
  errorMessage: string;
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
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  
  // Track if we've already attempted to fetch tasks
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  const paginatedTasks = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTasks.slice(startIndex, endIndex);
  }, [filteredTasks, currentPage, pageSize]);

  const totalPages = React.useMemo(() => {
    return Math.ceil(filteredTasks.length / pageSize) || 1;
  }, [filteredTasks.length, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (!hasAttemptedFetch) {
      fetchTasks();
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    if (isLoading) {
      return; // Prevent multiple simultaneous fetch requests
    }
    
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");
    setHasAttemptedFetch(true);
    
    try {
      console.log("Fetching tasks from API...");
      const data = await api.getTasks();
      console.log("Tasks fetched successfully:", data);
      setTasks(data);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      setHasError(true);
      setErrorMessage(error.message || "Failed to connect to the backend. Please ensure the server is running.");
      
      toast({
        title: "Error fetching tasks",
        description: "Could not connect to the server. Please check if the backend is running.",
        variant: "destructive",
      });
      
      // Set empty array to prevent UI errors
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const addTask = async (task: Omit<Task, "id" | "createdAt">) => {
    setIsLoading(true);
    try {
      const newTask = await api.createTask(task);
      // Set state with a function to ensure we're not creating duplicates
      setTasks(prevTasks => {
        // Ensure we don't add the same task twice by checking if it already exists
        const taskExists = prevTasks.some(t => t.id === newTask.id);
        if (taskExists) {
          return prevTasks;
        }
        return [...prevTasks, newTask];
      });
      
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
        setTasks(prevTasks =>
          prevTasks.map(task => (task.id === id ? updatedTask : task))
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
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
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

  const getTask = useCallback(async (id: string) => {
    try {
      console.log(`Getting task with ID: ${id} from context`);
      // First check if task is in our local state
      const cachedTask = tasks.find(task => task.id === id);
      if (cachedTask) {
        console.log("Found task in context state:", cachedTask);
        return cachedTask;
      }
      
      // If not in state, get from API
      const taskData = await api.getTaskById(id);
      console.log("Task from API:", taskData);
      
      // If task was found via API but not in our state, add it
      if (taskData && !tasks.some(t => t.id === taskData.id)) {
        setTasks(prev => [...prev, taskData]);
      }
      
      return taskData;
    } catch (error) {
      console.error("Error getting task:", error);
      return null;
    }
  }, [tasks]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    tasks, 
    paginatedTasks,
    filteredTasks,
    addTask, 
    updateTask, 
    deleteTask, 
    getTask,
    isLoading,
    hasError,
    errorMessage,
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
  }), [
    tasks, 
    paginatedTasks,
    filteredTasks,
    addTask, 
    updateTask, 
    deleteTask, 
    getTask,
    isLoading,
    hasError,
    errorMessage,
    currentPage,
    totalPages,
    pageSize,
    searchTerm,
    statusFilter,
    fetchTasks
  ]);

  return (
    <TaskContext.Provider value={contextValue}>
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
