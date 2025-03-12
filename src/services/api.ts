
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

// API service
export const api = {
  // GET /tasks - Fetch all tasks
  async getTasks(): Promise<Task[]> {
    try {
      console.log('Fetching tasks from:', `${API_URL}/tasks`);
      const response = await apiClient.get('/tasks');
      
      console.log('Tasks response:', response.data);
      
      // Transform MongoDB _id to id for frontend compatibility
      return response.data.map((task: any) => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status as TaskStatus,
        createdAt: task.createdAt
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // GET /tasks/:id - Fetch a single task
  async getTaskById(id: string): Promise<Task | null> {
    try {
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
      return null;
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
      return {
        id: newTask._id,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status as TaskStatus,
        createdAt: newTask.createdAt
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // PUT /tasks/:id - Update a task
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      console.log(`Updating task with ID: ${id}`, updates);
      const response = await apiClient.put(`/tasks/${id}`, updates);
      const updatedTask = response.data;
      
      console.log('Task updated:', updatedTask);
      
      // Transform MongoDB _id to id for frontend compatibility
      return {
        id: updatedTask._id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status as TaskStatus,
        createdAt: updatedTask.createdAt
      };
    } catch (error) {
      console.error(`Error updating task with ID ${id}:`, error);
      return null;
    }
  },

  // DELETE /tasks/:id - Delete a task
  async deleteTask(id: string): Promise<boolean> {
    try {
      console.log(`Deleting task with ID: ${id}`);
      await apiClient.delete(`/tasks/${id}`);
      console.log(`Task ${id} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error deleting task with ID ${id}:`, error);
      return false;
    }
  }
};
