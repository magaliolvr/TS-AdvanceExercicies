export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const TASK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

export const PRIORITY_LABELS = {
  [TASK_PRIORITIES.LOW]: 'Low',
  [TASK_PRIORITIES.MEDIUM]: 'Medium',
  [TASK_PRIORITIES.HIGH]: 'High'
};

export const STATUS_LABELS = {
  [TASK_STATUSES.PENDING]: 'Pending',
  [TASK_STATUSES.IN_PROGRESS]: 'In Progress',
  [TASK_STATUSES.COMPLETED]: 'Completed'
};

export const PRIORITY_COLORS = {
  [TASK_PRIORITIES.LOW]: 'badge-low',
  [TASK_PRIORITIES.MEDIUM]: 'badge-medium',
  [TASK_PRIORITIES.HIGH]: 'badge-high'
};

export const STATUS_COLORS = {
  [TASK_STATUSES.PENDING]: 'badge-pending',
  [TASK_STATUSES.IN_PROGRESS]: 'badge-in-progress',
  [TASK_STATUSES.COMPLETED]: 'badge-completed'
};

export const FILTER_OPTIONS = {
  ALL: 'all',
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

export const SORT_OPTIONS = {
  CREATED_DATE: 'createdDate',
  DUE_DATE: 'dueDate',
  PRIORITY: 'priority',
  TITLE: 'title'
};

export const API_ENDPOINTS = {
  TASKS: '/api/tasks',
  USERS: '/api/users',
  CATEGORIES: '/api/categories'
};

export const LOCAL_STORAGE_KEYS = {
  TASKS: 'taskManager_tasks',
  USER_PREFERENCES: 'taskManager_userPreferences',
  THEME: 'taskManager_theme'
};

export const DEFAULT_TASK = {
  id: '',
  title: '',
  description: '',
  priority: TASK_PRIORITIES.MEDIUM,
  status: TASK_STATUSES.PENDING,
  dueDate: null,
  category: '',
  assignedTo: '',
  createdAt: null,
  updatedAt: null,
  tags: [],
  attachments: [],
  comments: []
};

export const VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  TAG_MAX_LENGTH: 20,
  MAX_TAGS: 5
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark'
}; 