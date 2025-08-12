import axios from "axios";
import { API_ENDPOINTS, LOCAL_STORAGE_KEYS } from "../utils/constants";
import { saveToLocalStorage, loadFromLocalStorage } from "../utils/helper";

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Task API methods
export const taskApi = {
  // Get all tasks
  getTasks: async (filters = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.TASKS, { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      // Fallback to localStorage
      return loadFromLocalStorage(LOCAL_STORAGE_KEYS.TASKS, []);
    }
  },

  // Get single task
  getTask: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.TASKS}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching task:", error);
      throw error;
    }
  },

  // Create new task
  createTask: async (taskData) => {
    try {
      const response = await api.post(API_ENDPOINTS.TASKS, taskData);
      return response.data;
    } catch (error) {
      console.error("Error creating task:", error);
      // Fallback to localStorage
      const tasks = loadFromLocalStorage(LOCAL_STORAGE_KEYS.TASKS, []);
      const newTask = { ...taskData, id: Date.now().toString() };
      tasks.push(newTask);
      saveToLocalStorage(LOCAL_STORAGE_KEYS.TASKS, tasks);
      return newTask;
    }
  },

  // Update task
  updateTask: async (id, updates) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.TASKS}/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error("Error updating task:", error);
      // Fallback to localStorage
      const tasks = loadFromLocalStorage(LOCAL_STORAGE_KEYS.TASKS, []);
      const taskIndex = tasks.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
        saveToLocalStorage(LOCAL_STORAGE_KEYS.TASKS, tasks);
        return tasks[taskIndex];
      }
      throw error;
    }
  },

  // Delete task
  deleteTask: async (id) => {
    try {
      await api.delete(`${API_ENDPOINTS.TASKS}/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      // Fallback to localStorage
      const tasks = loadFromLocalStorage(LOCAL_STORAGE_KEYS.TASKS, []);
      const filteredTasks = tasks.filter((task) => task.id !== id);
      saveToLocalStorage(LOCAL_STORAGE_KEYS.TASKS, filteredTasks);
      return true;
    }
  },

  // Bulk operations
  bulkUpdate: async (taskIds, updates) => {
    try {
      const response = await api.patch(`${API_ENDPOINTS.TASKS}/bulk`, {
        taskIds,
        updates,
      });
      return response.data;
    } catch (error) {
      console.error("Error bulk updating tasks:", error);
      // Fallback to localStorage
      const tasks = loadFromLocalStorage(LOCAL_STORAGE_KEYS.TASKS, []);
      const updatedTasks = tasks.map((task) => (taskIds.includes(task.id) ? { ...task, ...updates } : task));
      saveToLocalStorage(LOCAL_STORAGE_KEYS.TASKS, updatedTasks);
      return updatedTasks;
    }
  },

  bulkDelete: async (taskIds) => {
    try {
      await api.delete(`${API_ENDPOINTS.TASKS}/bulk`, {
        data: { taskIds },
      });
      return true;
    } catch (error) {
      console.error("Error bulk deleting tasks:", error);
      // Fallback to localStorage
      const tasks = loadFromLocalStorage(LOCAL_STORAGE_KEYS.TASKS, []);
      const filteredTasks = tasks.filter((task) => !taskIds.includes(task.id));
      saveToLocalStorage(LOCAL_STORAGE_KEYS.TASKS, filteredTasks);
      return true;
    }
  },
};

// User API methods
export const userApi = {
  getUsers: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.USERS);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  getUser: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.USERS}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  updateProfile: async (updates) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.USERS}/profile`, updates);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },
};

// Category API methods
export const categoryApi = {
  getCategories: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CATEGORIES);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await api.post(API_ENDPOINTS.CATEGORIES, categoryData);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  updateCategory: async (id, updates) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.CATEGORIES}/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      await api.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },
};

// Analytics API methods
export const analyticsApi = {
  getTaskStats: async (filters = {}) => {
    try {
      const response = await api.get("/api/analytics/tasks", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching task stats:", error);
      return null;
    }
  },

  getProductivityReport: async (dateRange) => {
    try {
      const response = await api.get("/api/analytics/productivity", {
        params: dateRange,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching productivity report:", error);
      return null;
    }
  },

  getTrends: async (period = "month") => {
    try {
      const response = await api.get("/api/analytics/trends", {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching trends:", error);
      return null;
    }
  },
};

// Export API instance for direct use
export default api;
