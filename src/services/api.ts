
import axios from 'axios';
import { Task, TaskStatus } from "@/types/task";

// Use environment variables or fallback to defaults
// In production, set VITE_API_URL in your environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configure axios instance with defaults
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add logging for debugging
console.log('API URL configured as:', API_URL);

// In-memory fallback data for when the server is unavailable
let localTasks: Task[] = [];
let taskCounter = 0;

// Helper to generate IDs for local tasks
const generateLocalId = () => `local-${Date.now()}-${taskCounter++}`;

// API service
export const api = {
  // GET /tasks - Fetch all tasks
  async getTasks(): Promise<Task[]> {
    try {
      console.log('Fetching tasks from:', `${API_URL}/tasks`);
      const response = await apiClient.get('/tasks');
      
      console.log('Tasks response:', response.data);
      
      // Transform MongoDB _id to id for frontend compatibility
      const tasks = response.data.map((task: any) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status as TaskStatus,
        createdAt: task.createdAt
      }));
      
      // Update local cache
      localTasks = tasks;
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      console.warn('Using local fallback tasks since the backend is unavailable');
      return localTasks;
    }
  },

  // GET /tasks/:id - Fetch a single task
  async getTaskById(id: string): Promise<Task | null> {
    try {
      // Check if the ID is local
      if (id.startsWith('local-')) {
        const localTask = localTasks.find(task => task.id === id);
        return localTask || null;
      }
      
      console.log(`Fetching task with ID: ${id} from: ${API_URL}/tasks/${id}`);
      const response = await apiClient.get(`/tasks/${id}`);
      const task = response.data;
      
      console.log('Found task:', task);
      
      // Transform MongoDB _id to id for frontend compatibility
      return {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status as TaskStatus,
        createdAt: task.createdAt
      };
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error);
      // Try to find the task in the local cache
      const cachedTask = localTasks.find(task => task.id === id);
      return cachedTask || null;
    }
  },

  // POST /tasks - Create a new task
  async createTask(task: Omit<Task, "id" | "createdAt">): Promise<Task> {
    try {
      console.log('Creating task:', task);
      const response = await apiClient.post('/tasks', task);
      const newTask = response.data;
      
      console.log('New task created:', newTask);
      
      // Transform MongoDB _id to id for frontend compatibility
      const transformedTask = {
        id: newTask._id,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status as TaskStatus,
        createdAt: newTask.createdAt
      };
      
      return transformedTask;
    } catch (error) {
      console.error('Error creating task:', error);
      
      // Create a local task as fallback
      const localTask: Task = {
        id: generateLocalId(),
        title: task.title,
        description: task.description,
        status: task.status,
        createdAt: new Date().toISOString()
      };
      
      console.log('Created local fallback task:', localTask);
      localTasks.push(localTask);
      
      return localTask;
    }
  },

  // PUT /tasks/:id - Update a task
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      // If it's a local task, update it locally
      if (id.startsWith('local-')) {
        const index = localTasks.findIndex(task => task.id === id);
        if (index !== -1) {
          const updatedTask = { ...localTasks[index], ...updates };
          localTasks[index] = updatedTask;
          return updatedTask;
        }
        return null;
      }
      
      console.log(`Updating task with ID: ${id}`, updates);
      const response = await apiClient.put(`/tasks/${id}`, updates);
      const updatedTask = response.data;
      
      console.log('Task updated:', updatedTask);
      
      // Transform MongoDB _id to id for frontend compatibility
      const transformedTask = {
        id: updatedTask._id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status as TaskStatus,
        createdAt: updatedTask.createdAt
      };
      
      // Update in local cache
      const cachedIndex = localTasks.findIndex(task => task.id === id);
      if (cachedIndex !== -1) {
        localTasks[cachedIndex] = transformedTask;
      }
      
      return transformedTask;
    } catch (error) {
      console.error(`Error updating task with ID ${id}:`, error);
      
      // Try to update the task in the local cache
      const index = localTasks.findIndex(task => task.id === id);
      if (index !== -1) {
        const updatedTask = { ...localTasks[index], ...updates };
        localTasks[index] = updatedTask;
        return updatedTask;
      }
      
      return null;
    }
  },

  // DELETE /tasks/:id - Delete a task
  async deleteTask(id: string): Promise<boolean> {
    try {
      // If it's a local task, delete it locally
      if (id.startsWith('local-')) {
        localTasks = localTasks.filter(task => task.id !== id);
        return true;
      }
      
      console.log(`Deleting task with ID: ${id}`);
      await apiClient.delete(`/tasks/${id}`);
      console.log(`Task ${id} deleted successfully`);
      
      // Remove from local cache
      localTasks = localTasks.filter(task => task.id !== id);
      
      return true;
    } catch (error) {
      console.error(`Error deleting task with ID ${id}:`, error);
      
      // Try to delete the task from local cache
      const initialLength = localTasks.length;
      localTasks = localTasks.filter(task => task.id !== id);
      
      // Return true if we actually removed something
      return localTasks.length < initialLength;
    }
  }
};
