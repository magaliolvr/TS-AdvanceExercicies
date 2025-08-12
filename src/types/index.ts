// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  category: string;
  assignedTo: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Filter and Sort Types
export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  category?: string;
  assignedTo?: string;
  search?: string;
  dueDate?: string;
}

export type SortField = 'title' | 'dueDate' | 'priority' | 'status' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Context Types
export interface TaskState {
  tasks: Task[];
  filteredTasks: Task[];
  selectedTasks: string[];
  filters: TaskFilters;
  sort: SortConfig;
  loading: boolean;
  error: string | null;
  stats: TaskStats;
}

export interface TaskStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  dueSoon: number;
}

export type TaskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'BULK_UPDATE'; payload: { taskIds: string[]; updates: Partial<Task> } }
  | { type: 'BULK_DELETE'; payload: string[] }
  | { type: 'SET_FILTERS'; payload: TaskFilters }
  | { type: 'SET_SORT'; payload: SortConfig }
  | { type: 'TOGGLE_TASK_SELECTION'; payload: string }
  | { type: 'SET_SELECTED_TASKS'; payload: string[] }
  | { type: 'CLEAR_SELECTED_TASKS' }
  | { type: 'UPDATE_STATS'; payload: TaskStats };

// API Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface TaskApiResponse extends ApiResponse<Task[]> {}
export interface SingleTaskApiResponse extends ApiResponse<Task> {}

// Form Types
export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  category: string;
  assignedTo: string;
  tags: string[];
}

// Settings Types
export interface UserSettings {
  name: string;
  email: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  appearance: {
    theme: 'light' | 'dark';
    compactMode: boolean;
  };
}

// Component Props Types
export interface TaskListProps {
  tasks: Task[];
  selectedTasks: string[];
  onTaskSelect: (taskId: string) => void;
  onBulkUpdate: (taskIds: string[], updates: Partial<Task>) => void;
  onBulkDelete: (taskIds: string[]) => void;
}

export interface TaskFormProps {
  task?: Task;
  onSubmit: (task: TaskFormData) => void;
  onCancel: () => void;
}

export interface TaskDetailProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
}

export interface HeaderProps {
  onSearch: (query: string) => void;
  onThemeToggle: () => void;
}

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// Utility Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type ThemeMode = 'light' | 'dark';

// Constants Types
export interface PriorityConfig {
  label: string;
  color: string;
}

export interface StatusConfig {
  label: string;
  color: string;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SortOptionConfig {
  value: SortField;
  label: string;
} 