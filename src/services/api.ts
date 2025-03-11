
import { Task, TaskStatus } from "@/types/task";

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API service
export const api = {
  // GET /tasks - Fetch all tasks
  async getTasks(): Promise<Task[]> {
    // Get tasks from localStorage
    const tasks = localStorage.getItem("tasks");
    await delay(500); // Simulate network delay
    return tasks ? JSON.parse(tasks) : [];
  },

  // GET /tasks/:id - Fetch a single task
  async getTaskById(id: string): Promise<Task | null> {
    const tasks = localStorage.getItem("tasks");
    await delay(300);
    if (!tasks) return null;
    
    const taskList: Task[] = JSON.parse(tasks);
    const task = taskList.find(task => task.id === id);
    
    // Add debugging to help trace the issue
    console.log(`Fetching task with ID: ${id}`);
    console.log(`Found task:`, task);
    
    return task || null;
  },

  // POST /tasks - Create a new task
  async createTask(task: Omit<Task, "id" | "createdAt">): Promise<Task> {
    const tasks = localStorage.getItem("tasks");
    await delay(600);
    
    const taskList: Task[] = tasks ? JSON.parse(tasks) : [];
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedTasks = [...taskList, newTask];
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    
    return newTask;
  },

  // PUT /tasks/:id - Update a task
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const tasks = localStorage.getItem("tasks");
    await delay(400);
    if (!tasks) return null;
    
    const taskList: Task[] = JSON.parse(tasks);
    const taskIndex = taskList.findIndex(task => task.id === id);
    
    if (taskIndex === -1) return null;
    
    const updatedTask = { ...taskList[taskIndex], ...updates };
    taskList[taskIndex] = updatedTask;
    localStorage.setItem("tasks", JSON.stringify(taskList));
    
    return updatedTask;
  },

  // DELETE /tasks/:id - Delete a task
  async deleteTask(id: string): Promise<boolean> {
    const tasks = localStorage.getItem("tasks");
    await delay(350);
    if (!tasks) return false;
    
    const taskList: Task[] = JSON.parse(tasks);
    const filteredTasks = taskList.filter(task => task.id !== id);
    
    if (filteredTasks.length === taskList.length) return false;
    
    localStorage.setItem("tasks", JSON.stringify(filteredTasks));
    return true;
  }
};
