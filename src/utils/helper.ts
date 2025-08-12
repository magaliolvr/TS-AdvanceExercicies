import { TaskPriority, TaskStatus } from "../types";
import { format, isAfter, isBefore, addDays, parseISO } from "date-fns";
import { TASK_PRIORITIES, TASK_STATUSES, VALIDATION_RULES, DEFAULT_TASK } from "./constants";

export const formatDate = (date: Date, formatString = "MMM dd, yyyy") => {
  if (!date) return "";
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatString);
};

export const formatDateTime = (date: Date) => {
  if (!date) return "";
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "MMM dd, yyyy HH:mm");
};

export const isOverdue = (dueDate: Date) => {
  if (!dueDate) return false;
  const dueDateObj = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  return isBefore(dueDateObj, new Date());
};

export const isDueSoon = (dueDate: Date, days = 3) => {
  if (!dueDate) return false;
  const dueDateObj = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  const today = new Date();
  const soonDate = addDays(today, days);
  return isAfter(dueDateObj, today) && isBefore(dueDateObj, soonDate);
};

export const validateTask = (task: any) => {
  const errors: { [key: string]: string } = {};

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
    errors.dueDate = "Due date cannot be in the past";
  }

  if (task.tags && task.tags.length > VALIDATION_RULES.MAX_TAGS) {
    errors.tags = `Maximum ${VALIDATION_RULES.MAX_TAGS} tags allowed`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const createTask = (taskData: any) => {
  const now = new Date().toISOString();
  return {
    ...DEFAULT_TASK,
    ...taskData,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
};

export const updateTask = (task: any, updates: any) => {
  return {
    ...task,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
};

export const filterTasks = (tasks: any, filters: any) => {
  return tasks.filter((task: any) => {
    // Status filter
    if (filters.status && filters.status !== "all" && task.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority && filters.priority !== "all" && task.priority !== filters.priority) {
      return false;
    }

    // Category filter
    if (filters.category && filters.category !== "all" && task.category !== filters.category) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(searchTerm);
      const matchesDescription = task.description.toLowerCase().includes(searchTerm);
      const matchesTags = task.tags.some((tag: any) => tag.toLowerCase().includes(searchTerm));

      if (!matchesTitle && !matchesDescription && !matchesTags) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange) {
      const taskDate = task.dueDate ? parseISO(task.dueDate) : null;
      if (taskDate) {
        if (filters.dateRange.start && isBefore(taskDate, parseISO(filters.dateRange.start))) {
          return false;
        }
        if (filters.dateRange.end && isAfter(taskDate, parseISO(filters.dateRange.end))) {
          return false;
        }
      }
    }

    return true;
  });
};

export const sortTasks = (tasks: any, sortBy: any, sortOrder = "asc") => {
  const sortedTasks = [...tasks];

  sortedTasks.sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "createdDate":
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case "dueDate":
        aValue = a.dueDate ? new Date(a.dueDate) : new Date("9999-12-31");
        bValue = b.dueDate ? new Date(b.dueDate) : new Date("9999-12-31");
        break;
      case "priority":
        const priorityOrder = { [TASK_PRIORITIES.HIGH]: 3, [TASK_PRIORITIES.MEDIUM]: 2, [TASK_PRIORITIES.LOW]: 1 };
        aValue = priorityOrder[a.priority] || 0;
        bValue = priorityOrder[b.priority] || 0;
        break;
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      default:
        return 0;
    }

    if (sortOrder === "desc") {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  });

  return sortedTasks;
};

export const getTaskStats = (tasks: any) => {
  const stats = {
    total: tasks.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    dueSoon: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
  };

  tasks.forEach((task: any) => {
    // Status counts
    switch (task.status) {
      case TASK_STATUSES.PENDING:
        stats.pending++;
        break;
      case TASK_STATUSES.IN_PROGRESS:
        stats.inProgress++;
        break;
      case TASK_STATUSES.COMPLETED:
        stats.completed++;
        break;
    }

    // Priority counts
    switch (task.priority) {
      case TASK_PRIORITIES.HIGH:
        stats.highPriority++;
        break;
      case TASK_PRIORITIES.MEDIUM:
        stats.mediumPriority++;
        break;
      case TASK_PRIORITIES.LOW:
        stats.lowPriority++;
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

export const debounce = (func: any, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func: any, limit: number) => {
  let inThrottle: boolean;
  return function (this: unknown, ...args: any[]) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const loadFromLocalStorage = (key: string, defaultValue: any = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
};
