
import axios from 'axios';
import { Task, TaskStatus } from "@/types/task";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API service
export const api = {
  // GET /tasks - Fetch all tasks
  async getTasks(): Promise<Task[]> {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      
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
      const response = await axios.get(`${API_URL}/tasks/${id}`);
      const task = response.data;
      
      console.log(`Fetching task with ID: ${id}`);
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
      const response = await axios.post(`${API_URL}/tasks`, task);
      const newTask = response.data;
      
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
      const response = await axios.put(`${API_URL}/tasks/${id}`, updates);
      const updatedTask = response.data;
      
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
      await axios.delete(`${API_URL}/tasks/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting task with ID ${id}:`, error);
      return false;
    }
  }
};
