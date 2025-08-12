import { TaskPriority, TaskStatus, NotificationType, ThemeMode } from "../types";

export const TASK_PRIORITIES: Record<string, TaskPriority> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const; // as const é resumidamente e simplesmente uma forma de garantir que o objeto é imutável

export const TASK_STATUSES: Record<string, TaskStatus> = {
  //record<string, TaskStatus> é uma forma de mapear strings para o tipo TaskStatus. Ja o TaskStatus é um tipo que representa o estado de uma tarefa. TaskStatus é um type que pode ser criado por qualquer pessoa, ou seja, é possivel criar types personalizados
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "badge-low",
  medium: "badge-medium",
  high: "badge-high",
  urgent: "badge-urgent",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: "badge-pending",
  "in-progress": "badge-in-progress",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
};

export const FILTER_OPTIONS = {
  ALL: "all",
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
} as const;

export const SORT_OPTIONS = {
  CREATED_DATE: "createdAt",
  DUE_DATE: "dueDate",
  PRIORITY: "priority",
  TITLE: "title",
  STATUS: "status",
} as const;

export const API_ENDPOINTS = {
  TASKS: "/api/tasks",
  USERS: "/api/users",
  CATEGORIES: "/api/categories",
  ANALYTICS: "/api/analytics",
} as const;

export const LOCAL_STORAGE_KEYS = {
  TASKS: "taskManager_tasks",
  USER_PREFERENCES: "taskManager_userPreferences",
  THEME: "taskManager_theme",
  SETTINGS: "taskManager_settings",
} as const;

export const DEFAULT_TASK = {
  id: "",
  title: "",
  description: "",
  priority: TASK_PRIORITIES.MEDIUM,
  status: TASK_STATUSES.PENDING,
  dueDate: "",
  category: "",
  assignedTo: "",
  createdAt: "",
  updatedAt: "",
  tags: [],
};

export const VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  TAG_MAX_LENGTH: 20,
  MAX_TAGS: 5,
} as const;

export const NOTIFICATION_TYPES: Record<string, NotificationType> = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const;

export const THEME_MODES: Record<string, ThemeMode> = {
  LIGHT: "light",
  DARK: "dark",
} as const;
