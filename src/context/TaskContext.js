import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { taskApi } from '../services/api';
import { 
  saveToLocalStorage, 
  loadFromLocalStorage,
  filterTasks,
  sortTasks,
  getTaskStats 
} from '../utils/helpers';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';
import { sampleTasks } from '../data/sampleData';

// Initial state
const initialState = {
  tasks: [],
  filteredTasks: [],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    priority: 'all',
    category: 'all',
    search: '',
    dateRange: null
  },
  sortBy: 'createdDate',
  sortOrder: 'desc',
  selectedTasks: [],
  stats: {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    dueSoon: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0
  }
};

// Action types
const TASK_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_TASKS: 'SET_TASKS',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  BULK_UPDATE: 'BULK_UPDATE',
  BULK_DELETE: 'BULK_DELETE',
  SET_FILTERS: 'SET_FILTERS',
  SET_SORT: 'SET_SORT',
  SET_SELECTED_TASKS: 'SET_SELECTED_TASKS',
  CLEAR_SELECTED_TASKS: 'CLEAR_SELECTED_TASKS',
  UPDATE_STATS: 'UPDATE_STATS'
};

// Reducer function
const taskReducer = (state, action) => {
  switch (action.type) {
    case TASK_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case TASK_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case TASK_ACTIONS.SET_TASKS:
      const tasks = action.payload;
      const filteredTasks = filterTasks(tasks, state.filters);
      const sortedTasks = sortTasks(filteredTasks, state.sortBy, state.sortOrder);
      const stats = getTaskStats(tasks);
      
      return {
        ...state,
        tasks,
        filteredTasks: sortedTasks,
        stats,
        loading: false,
        error: null
      };

    case TASK_ACTIONS.ADD_TASK:
      const newTasks = [...state.tasks, action.payload];
      const newFilteredTasks = filterTasks(newTasks, state.filters);
      const newSortedTasks = sortTasks(newFilteredTasks, state.sortBy, state.sortOrder);
      const newStats = getTaskStats(newTasks);
      
      return {
        ...state,
        tasks: newTasks,
        filteredTasks: newSortedTasks,
        stats: newStats
      };

    case TASK_ACTIONS.UPDATE_TASK:
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload.id ? action.payload : task
      );
      const updatedFilteredTasks = filterTasks(updatedTasks, state.filters);
      const updatedSortedTasks = sortTasks(updatedFilteredTasks, state.sortBy, state.sortOrder);
      const updatedStats = getTaskStats(updatedTasks);
      
      return {
        ...state,
        tasks: updatedTasks,
        filteredTasks: updatedSortedTasks,
        stats: updatedStats
      };

    case TASK_ACTIONS.DELETE_TASK:
      const remainingTasks = state.tasks.filter(task => task.id !== action.payload);
      const remainingFilteredTasks = filterTasks(remainingTasks, state.filters);
      const remainingSortedTasks = sortTasks(remainingFilteredTasks, state.sortBy, state.sortOrder);
      const remainingStats = getTaskStats(remainingTasks);
      
      return {
        ...state,
        tasks: remainingTasks,
        filteredTasks: remainingSortedTasks,
        stats: remainingStats
      };

    case TASK_ACTIONS.BULK_UPDATE:
      const bulkUpdatedTasks = state.tasks.map(task =>
        action.payload.taskIds.includes(task.id)
          ? { ...task, ...action.payload.updates }
          : task
      );
      const bulkUpdatedFilteredTasks = filterTasks(bulkUpdatedTasks, state.filters);
      const bulkUpdatedSortedTasks = sortTasks(bulkUpdatedFilteredTasks, state.sortBy, state.sortOrder);
      const bulkUpdatedStats = getTaskStats(bulkUpdatedTasks);
      
      return {
        ...state,
        tasks: bulkUpdatedTasks,
        filteredTasks: bulkUpdatedSortedTasks,
        stats: bulkUpdatedStats
      };

    case TASK_ACTIONS.BULK_DELETE:
      const afterBulkDeleteTasks = state.tasks.filter(
        task => !action.payload.includes(task.id)
      );
      const afterBulkDeleteFilteredTasks = filterTasks(afterBulkDeleteTasks, state.filters);
      const afterBulkDeleteSortedTasks = sortTasks(afterBulkDeleteFilteredTasks, state.sortBy, state.sortOrder);
      const afterBulkDeleteStats = getTaskStats(afterBulkDeleteTasks);
      
      return {
        ...state,
        tasks: afterBulkDeleteTasks,
        filteredTasks: afterBulkDeleteSortedTasks,
        stats: afterBulkDeleteStats,
        selectedTasks: []
      };

    case TASK_ACTIONS.SET_FILTERS:
      const newFilters = { ...state.filters, ...action.payload };
      const filteredByNewFilters = filterTasks(state.tasks, newFilters);
      const sortedByNewFilters = sortTasks(filteredByNewFilters, state.sortBy, state.sortOrder);
      
      return {
        ...state,
        filters: newFilters,
        filteredTasks: sortedByNewFilters
      };

    case TASK_ACTIONS.SET_SORT:
      const sortedByNewSort = sortTasks(state.filteredTasks, action.payload.sortBy, action.payload.sortOrder);
      
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
        filteredTasks: sortedByNewSort
      };

    case TASK_ACTIONS.SET_SELECTED_TASKS:
      return {
        ...state,
        selectedTasks: action.payload
      };

    case TASK_ACTIONS.CLEAR_SELECTED_TASKS:
      return {
        ...state,
        selectedTasks: []
      };

    case TASK_ACTIONS.UPDATE_STATS:
      return {
        ...state,
        stats: action.payload
      };

    default:
      return state;
  }
};

// Create context
const TaskContext = createContext();

// Provider component
export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const loadTasks = async () => {
      dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
      
      try {
        // Try to load from API first, fallback to localStorage
        const tasks = await taskApi.getTasks();
        
        // If no tasks exist, load sample data
        if (tasks.length === 0) {
          dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: sampleTasks });
          saveToLocalStorage(LOCAL_STORAGE_KEYS.TASKS, sampleTasks);
        } else {
          dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: tasks });
          saveToLocalStorage(LOCAL_STORAGE_KEYS.TASKS, tasks);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        // Load sample data as fallback
        dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: sampleTasks });
        saveToLocalStorage(LOCAL_STORAGE_KEYS.TASKS, sampleTasks);
      }
    };

    loadTasks();
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (state.tasks.length > 0) {
      saveToLocalStorage(LOCAL_STORAGE_KEYS.TASKS, state.tasks);
    }
  }, [state.tasks]);

  // Action creators
  const actions = {
    // Task CRUD operations
    createTask: async (taskData) => {
      dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
      
      try {
        const newTask = await taskApi.createTask(taskData);
        dispatch({ type: TASK_ACTIONS.ADD_TASK, payload: newTask });
        return newTask;
      } catch (error) {
        dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    updateTask: async (id, updates) => {
      dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
      
      try {
        const updatedTask = await taskApi.updateTask(id, updates);
        dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: updatedTask });
        return updatedTask;
      } catch (error) {
        dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    deleteTask: async (id) => {
      dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
      
      try {
        await taskApi.deleteTask(id);
        dispatch({ type: TASK_ACTIONS.DELETE_TASK, payload: id });
      } catch (error) {
        dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Bulk operations
    bulkUpdate: async (taskIds, updates) => {
      dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
      
      try {
        await taskApi.bulkUpdate(taskIds, updates);
        dispatch({ 
          type: TASK_ACTIONS.BULK_UPDATE, 
          payload: { taskIds, updates } 
        });
      } catch (error) {
        dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    bulkDelete: async (taskIds) => {
      dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
      
      try {
        await taskApi.bulkDelete(taskIds);
        dispatch({ type: TASK_ACTIONS.BULK_DELETE, payload: taskIds });
      } catch (error) {
        dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    // Filter and sort operations
    setFilters: (filters) => {
      dispatch({ type: TASK_ACTIONS.SET_FILTERS, payload: filters });
    },

    setSort: (sortBy, sortOrder) => {
      dispatch({ 
        type: TASK_ACTIONS.SET_SORT, 
        payload: { sortBy, sortOrder } 
      });
    },

    // Selection operations
    setSelectedTasks: (taskIds) => {
      dispatch({ type: TASK_ACTIONS.SET_SELECTED_TASKS, payload: taskIds });
    },

    clearSelectedTasks: () => {
      dispatch({ type: TASK_ACTIONS.CLEAR_SELECTED_TASKS });
    },

    toggleTaskSelection: (taskId) => {
      const isSelected = state.selectedTasks.includes(taskId);
      const newSelectedTasks = isSelected
        ? state.selectedTasks.filter(id => id !== taskId)
        : [...state.selectedTasks, taskId];
      
      dispatch({ type: TASK_ACTIONS.SET_SELECTED_TASKS, payload: newSelectedTasks });
    },

    // Utility actions
    refreshTasks: async () => {
      dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
      
      try {
        const tasks = await taskApi.getTasks();
        dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: tasks });
      } catch (error) {
        dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    clearError: () => {
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: null });
    }
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use the task context
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}; 