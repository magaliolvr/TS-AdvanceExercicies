import React, { useState, useEffect } from 'react';
import './TaskManager.css';

const TaskManager = ({ userId = 'user123', initialTasks = [] }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [showCompleted, setShowCompleted] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem(`tasks_${userId}`);
    if (savedTasks && initialTasks.length === 0) {
      setTasks(JSON.parse(savedTasks));
    }
  }, [userId, initialTasks.length]);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem(`tasks_${userId}`, JSON.stringify(tasks));
  }, [tasks, userId]);

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now().toString(),
        title: newTask.trim(),
        description: '',
        priority: 'medium',
        status: 'pending',
        createdAt: new Date().toISOString(),
        completedAt: null,
        tags: []
      };
      setTasks(prev => [task, ...prev]);
      setNewTask('');
    }
  };

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const toggleTaskStatus = (taskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : null
        };
      }
      return task;
    }));
  };

  const addTag = (taskId, tag) => {
    if (tag.trim() && !tasks.find(t => t.id === taskId)?.tags.includes(tag.trim())) {
      updateTask(taskId, {
        tags: [...(tasks.find(t => t.id === taskId)?.tags || []), tag.trim()]
      });
    }
  };

  const removeTag = (taskId, tagToRemove) => {
    updateTask(taskId, {
      tags: tasks.find(t => t.id === taskId)?.tags.filter(tag => tag !== tagToRemove) || []
    });
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVisibility = showCompleted || task.status !== 'completed';
      return matchesFilter && matchesSearch && matchesVisibility;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'completed' ? '✓' : '○';
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = total - completed;
    const highPriority = tasks.filter(t => t.priority === 'high' && t.status === 'pending').length;
    
    return { total, completed, pending, highPriority };
  };

  const stats = getTaskStats();

  return (
    <div className="task-manager-container">
      <div className="task-header">
        <h1>Task Manager</h1>
        <p>User ID: {userId}</p>
        <div className="task-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.highPriority}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>
      </div>

      <div className="task-controls">
        <div className="add-task-section">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter new task..."
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            className="task-input"
          />
          <button onClick={addTask} className="add-task-btn">Add Task</button>
        </div>

        <div className="filter-controls">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className="search-input"
          />
          
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="priority">Sort by Priority</option>
            <option value="createdAt">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>

          <label className="show-completed">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
            />
            Show Completed
          </label>
        </div>
      </div>

      <div className="tasks-list">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="no-tasks">
            <p>No tasks found. Create your first task above!</p>
          </div>
        ) : (
          filteredAndSortedTasks.map(task => (
            <div key={task.id} className={`task-item ${task.status} ${getPriorityColor(task.priority)}`}>
              <div className="task-header-row">
                <div className="task-status" onClick={() => toggleTaskStatus(task.id)}>
                  <span className="status-icon">{getStatusIcon(task.status)}</span>
                </div>
                
                <div className="task-main">
                  <h3 className="task-title">{task.title}</h3>
                  {task.description && <p className="task-description">{task.description}</p>}
                  
                  <div className="task-meta">
                    <span className="task-date">
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                    {task.completedAt && (
                      <span className="task-completed">
                        Completed: {new Date(task.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="task-actions">
                  <select
                    value={task.priority}
                    onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                    className={`priority-select ${getPriorityColor(task.priority)}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="delete-task-btn"
                    title="Delete task"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="task-tags">
                {task.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button
                      onClick={() => removeTag(task.id, tag)}
                      className="remove-tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag(task.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="add-tag-input"
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="task-info">
        <h2>Task Management Features</h2>
        <ul>
          <li><strong>Add/Remove Tasks:</strong> Create and delete tasks with priority levels</li>
          <li><strong>Status Management:</strong> Mark tasks as pending or completed</li>
          <li><strong>Priority System:</strong> High, medium, and low priority levels</li>
          <li><strong>Search & Filter:</strong> Find tasks by text or status</li>
          <li><strong>Sorting Options:</strong> Sort by priority, date, or title</li>
          <li><strong>Tag System:</strong> Add and remove tags for organization</li>
          <li><strong>Local Storage:</strong> Tasks persist between sessions</li>
        </ul>
      </div>
    </div>
  );
};

export default TaskManager;
