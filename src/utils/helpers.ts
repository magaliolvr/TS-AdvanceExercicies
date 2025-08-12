import { format, isAfter, isBefore, addDays, parseISO } from 'date-fns';
import { 
  TASK_PRIORITIES, 
  TASK_STATUSES, 
  VALIDATION_RULES,
  DEFAULT_TASK 
} from './constants';
import { Task, TaskFilters, TaskStats, TaskFormData } from '../types';

export const formatDate = (date: string | Date | null, formatString: string = 'MMM dd, yyyy'): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

export const formatDateTime = (date: string | Date | null): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
};

export const isOverdue = (dueDate: string | Date | null): boolean => {
  if (!dueDate) return false;
  const dueDateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return isBefore(dueDateObj, new Date());
};

export const isDueSoon = (dueDate: string | Date | null, days: number = 3): boolean => {
  if (!dueDate) return false;
  const dueDateObj = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const today = new Date();
  const soonDate = addDays(today, days);
  return isAfter(dueDateObj, today) && isBefore(dueDateObj, soonDate);
};

export const validateTask = (task: Partial<Task>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!task.title || task.title.trim().length < VALIDATION_RULES.TITLE_MIN_LENGTH) {
    errors.title = `Title must be at least ${VALIDATION_RULES.TITLE_MIN_LENGTH} characters long`;
  }

  if (task.title && task.title.length > VALIDATION_RULES.TITLE_MAX_LENGTH) {
    errors.title = `Title must be less than ${VALIDATION_RULES.TITLE_MAX_LENGTH} characters`;
  }

  if (task.description && task.description.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be less than ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`;
  }

  if (task.dueDate && isBefore(parseISO(task.dueDate), new Date())) {
    errors.dueDate = 'Due date cannot be in the past';
  }

  if (task.tags && task.tags.length > VALIDATION_RULES.MAX_TAGS) {
    errors.tags = `Maximum ${VALIDATION_RULES.MAX_TAGS} tags allowed`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const createTask = (taskData: Partial<TaskFormData>): Task => {
  const now = new Date().toISOString();
  return {
    ...DEFAULT_TASK,
    ...taskData,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  } as Task;
};

export const updateTask = (task: Task, updates: Partial<Task>): Task => {
  return {
    ...task,
    ...updates,
    updatedAt: new Date().toISOString()
  };
};

export const filterTasks = (tasks: Task[], filters: TaskFilters): Task[] => {
  return tasks.filter(task => {
    // Status filter
    if (filters.status && filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }

    // Category filter
    if (filters.category && filters.category !== 'all' && task.category !== filters.category) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(searchTerm);
      const matchesDescription = task.description.toLowerCase().includes(searchTerm);
      const matchesTags = task.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      
      if (!matchesTitle && !matchesDescription && !matchesTags) {
        return false;
      }
    }

    // Date range filter
    if (filters.dueDate) {
      const taskDate = task.dueDate ? parseISO(task.dueDate) : null;
      if (taskDate) {
        const filterDate = parseISO(filters.dueDate);
        if (isBefore(taskDate, filterDate)) {
          return false;
        }
      }
    }

    return true;
  });
};

export const sortTasks = (tasks: Task[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Task[] => {
  const sortedTasks = [...tasks];

  sortedTasks.sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'dueDate':
        aValue = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
        bValue = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
        break;
      case 'priority':
        const priorityOrder: Record<string, number> = { 
          [TASK_PRIORITIES.URGENT]: 4,
          [TASK_PRIORITIES.HIGH]: 3, 
          [TASK_PRIORITIES.MEDIUM]: 2, 
          [TASK_PRIORITIES.LOW]: 1 
        };
        aValue = priorityOrder[a.priority] || 0;
        bValue = priorityOrder[b.priority] || 0;
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'status':
        const statusOrder: Record<string, number> = {
          [TASK_STATUSES.PENDING]: 1,
          [TASK_STATUSES.IN_PROGRESS]: 2,
          [TASK_STATUSES.COMPLETED]: 3,
          [TASK_STATUSES.CANCELLED]: 4
        };
        aValue = statusOrder[a.status] || 0;
        bValue = statusOrder[b.status] || 0;
        break;
      default:
        return 0;
    }

    if (sortOrder === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  });

  return sortedTasks;
};

export const getTaskStats = (tasks: Task[]): TaskStats => {
  const stats: TaskStats = {
    total: tasks.length,
    pending: 0,
    completed: 0,
    overdue: 0,
    dueSoon: 0
  };

  tasks.forEach(task => {
    // Status counts
    switch (task.status) {
      case TASK_STATUSES.PENDING:
        stats.pending++;
        break;
      case TASK_STATUSES.COMPLETED:
        stats.completed++;
        break;
    }

    // Date-based counts
    if (isOverdue(task.dueDate)) {
      stats.overdue++;
    } else if (isDueSoon(task.dueDate)) {
      stats.dueSoon++;
    }
  });

  return stats;
};

export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): T => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  } as T;
};

export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): T => {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  } as T;
};

export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T | null = null): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}; 