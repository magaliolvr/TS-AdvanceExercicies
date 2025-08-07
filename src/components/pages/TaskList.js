import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Search,
  Trash2,
  Edit,
  Eye,
  CheckSquare,
  Square,
  MoreVertical
} from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';
import { formatDate, isOverdue, isDueSoon } from '../../utils/helpers';
import { 
  TASK_STATUSES, 
  TASK_PRIORITIES, 
  PRIORITY_LABELS, 
  STATUS_LABELS,
  PRIORITY_COLORS,
  STATUS_COLORS,
  SORT_OPTIONS
} from '../../utils/constants';
import toast from 'react-hot-toast';
import './TaskList.css';

const TaskList = () => {
  const {
    filteredTasks,
    selectedTasks,
    loading,
    error,
    setFilters,
    setSort,
    toggleTaskSelection,
    setSelectedTasks,
    clearSelectedTasks,
    bulkUpdate,
    bulkDelete
  } = useTaskContext();

  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilters, setCurrentFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ search: searchQuery });
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...currentFilters, [filterType]: value };
    setCurrentFilters(newFilters);
    setFilters(newFilters);
  };

  const handleSortChange = (sortBy) => {
    const currentSort = filteredTasks.length > 0 ? 'asc' : 'desc';
    const newSortOrder = currentSort === 'asc' ? 'desc' : 'asc';
    setSort(sortBy, newSortOrder);
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      clearSelectedTasks();
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    try {
      await bulkUpdate(selectedTasks, { status });
      toast.success(`Updated ${selectedTasks.length} tasks to ${status}`);
      clearSelectedTasks();
    } catch (error) {
      toast.error('Failed to update tasks');
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) {
      try {
        await bulkDelete(selectedTasks);
        toast.success(`Deleted ${selectedTasks.length} tasks`);
        clearSelectedTasks();
      } catch (error) {
        toast.error('Failed to delete tasks');
      }
    }
  };

  const handleTaskStatusToggle = async (taskId, currentStatus) => {
    const newStatus = currentStatus === TASK_STATUSES.COMPLETED 
      ? TASK_STATUSES.PENDING 
      : TASK_STATUSES.COMPLETED;
    
    try {
      await bulkUpdate([taskId], { status: newStatus });
      toast.success(`Task marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const getTaskStatus = (task) => {
    if (task.status === TASK_STATUSES.COMPLETED) return 'Completed';
    if (isOverdue(task.dueDate)) return 'Overdue';
    if (isDueSoon(task.dueDate)) return 'Due Soon';
    return 'On Track';
  };

  const getTaskStatusColor = (task) => {
    if (task.status === TASK_STATUSES.COMPLETED) return 'success';
    if (isOverdue(task.dueDate)) return 'danger';
    if (isDueSoon(task.dueDate)) return 'warning';
    return 'info';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>Error loading tasks: {error}</p>
      </div>
    );
  }

  return (
    <div className="task-list-page">
      <div className="task-list-header">
        <div className="header-left">
          <h1>Tasks</h1>
          <span className="task-count">{filteredTasks.length} tasks</span>
        </div>
        <div className="header-right">
          <Link to="/tasks/new" className="btn btn-primary">
            <Plus size={16} />
            New Task
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="task-controls">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        </div>

        <div className="controls-section">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
          </button>
          
          <div className="sort-controls">
            <button 
              className="btn btn-secondary"
              onClick={() => handleSortChange(SORT_OPTIONS.DUE_DATE)}
            >
              <SortAsc size={16} />
              Due Date
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => handleSortChange(SORT_OPTIONS.PRIORITY)}
            >
              <SortDesc size={16} />
              Priority
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select 
              value={currentFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Priority</label>
            <select 
              value={currentFilters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select 
              value={currentFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="shopping">Shopping</option>
              <option value="health">Health</option>
            </select>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-info">
            <span>{selectedTasks.length} tasks selected</span>
            <button 
              className="btn btn-secondary"
              onClick={clearSelectedTasks}
            >
              Clear Selection
            </button>
          </div>
          <div className="bulk-buttons">
            <button 
              className="btn btn-success"
              onClick={() => handleBulkStatusUpdate(TASK_STATUSES.COMPLETED)}
            >
              <CheckSquare size={16} />
              Mark Complete
            </button>
            <button 
              className="btn btn-danger"
              onClick={handleBulkDelete}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="task-list-container">
        {filteredTasks.length > 0 ? (
          <div className="task-list">
            <div className="task-list-header-row">
              <div className="select-all">
                <input
                  type="checkbox"
                  checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                  onChange={handleSelectAll}
                  className="task-checkbox"
                />
              </div>
              <div className="task-title-header">Title</div>
              <div className="task-status-header">Status</div>
              <div className="task-priority-header">Priority</div>
              <div className="task-due-date-header">Due Date</div>
              <div className="task-actions-header">Actions</div>
            </div>

            {filteredTasks.map((task) => (
              <div key={task.id} className="task-row">
                <div className="task-select">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => toggleTaskSelection(task.id)}
                    className="task-checkbox"
                  />
                </div>
                
                <div className="task-info">
                  <div className="task-main">
                    <h4 className="task-title">{task.title}</h4>
                    <p className="task-description">{task.description}</p>
                    {task.tags && task.tags.length > 0 && (
                      <div className="task-tags">
                        {task.tags.map((tag, index) => (
                          <span key={index} className="task-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="task-status">
                  <span className={`status-badge ${STATUS_COLORS[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </span>
                  <button
                    className="status-toggle"
                    onClick={() => handleTaskStatusToggle(task.id, task.status)}
                    title="Toggle status"
                  >
                    {task.status === TASK_STATUSES.COMPLETED ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </div>

                <div className="task-priority">
                  <span className={`priority-badge ${PRIORITY_COLORS[task.priority]}`}>
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                </div>

                <div className="task-due-date">
                  {task.dueDate ? (
                    <span className={`due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
                      {formatDate(task.dueDate)}
                    </span>
                  ) : (
                    <span className="no-due-date">No due date</span>
                  )}
                </div>

                <div className="task-actions">
                  <Link to={`/tasks/${task.id}`} className="action-btn" title="View details">
                    <Eye size={16} />
                  </Link>
                  <Link to={`/tasks/${task.id}/edit`} className="action-btn" title="Edit task">
                    <Edit size={16} />
                  </Link>
                  <button 
                    className="action-btn"
                    onClick={() => handleBulkDelete([task.id])}
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No tasks found</h3>
            <p>Try adjusting your filters or create a new task.</p>
            <Link to="/tasks/new" className="btn btn-primary">
              <Plus size={16} />
              Create New Task
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList; 