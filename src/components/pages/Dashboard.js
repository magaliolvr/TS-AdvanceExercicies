import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Clock, CheckCircle, AlertTriangle, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { useTaskContext } from "../../context/TaskContext";
import { formatDate, isOverdue, isDueSoon } from "../../utils/helper";
import { TASK_STATUSES, TASK_PRIORITIES } from "../../utils/constants";
import "./Dashboard.css";

const Dashboard = () => {
  const { tasks, filteredTasks, stats, loading, error, setFilters } = useTaskContext();

  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  useEffect(() => {
    // Get recent tasks (last 5 created)
    const recent = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    setRecentTasks(recent);

    // Get upcoming tasks (due in next 7 days)
    const upcoming = tasks
      .filter((task) => {
        if (!task.dueDate || task.status === TASK_STATUSES.COMPLETED) return false;
        const dueDate = new Date(task.dueDate);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return dueDate <= nextWeek && dueDate >= new Date();
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
    setUpcomingTasks(upcoming);
  }, [tasks]);

  const getStatusColor = (status) => {
    switch (status) {
      case TASK_STATUSES.COMPLETED:
        return "success";
      case TASK_STATUSES.IN_PROGRESS:
        return "warning";
      case TASK_STATUSES.PENDING:
        return "info";
      default:
        return "secondary";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case TASK_PRIORITIES.HIGH:
        return "danger";
      case TASK_PRIORITIES.MEDIUM:
        return "warning";
      case TASK_PRIORITIES.LOW:
        return "success";
      default:
        return "secondary";
    }
  };

  const getTaskStatus = (task) => {
    if (task.status === TASK_STATUSES.COMPLETED) return "Completed";
    if (isOverdue(task.dueDate)) return "Overdue";
    if (isDueSoon(task.dueDate)) return "Due Soon";
    return "On Track";
  };

  const getTaskStatusColor = (task) => {
    if (task.status === TASK_STATUSES.COMPLETED) return "success";
    if (isOverdue(task.dueDate)) return "danger";
    if (isDueSoon(task.dueDate)) return "warning";
    return "info";
  };

  const handleQuickFilter = (filter) => {
    setFilters(filter);
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
        <p>Error loading dashboard: {error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/tasks/new" className="btn btn-primary">
          <Plus size={16} />
          New Task
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.total}</h3>
            <p className="stat-label">Total Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.pending}</h3>
            <p className="stat-label">Pending</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.completed}</h3>
            <p className="stat-label">Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon overdue">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.overdue}</h3>
            <p className="stat-label">Overdue</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => handleQuickFilter({ status: TASK_STATUSES.PENDING })}>
            <Clock size={20} />
            View Pending
          </button>
          <button className="action-btn" onClick={() => handleQuickFilter({ priority: TASK_PRIORITIES.HIGH })}>
            <AlertTriangle size={20} />
            High Priority
          </button>
          <button className="action-btn" onClick={() => handleQuickFilter({ status: TASK_STATUSES.COMPLETED })}>
            <CheckCircle size={20} />
            Completed
          </button>
          <Link to="/analytics" className="action-btn">
            <TrendingUp size={20} />
            View Analytics
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Recent Tasks */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Tasks</h2>
            <Link to="/tasks" className="view-all">
              View All
            </Link>
          </div>

          {recentTasks.length > 0 ? (
            <div className="task-list">
              {recentTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <h4 className="task-title">{task.title}</h4>
                    <p className="task-description">{task.description}</p>
                    <div className="task-meta">
                      <span className={`task-status ${getStatusColor(task.status)}`}>{task.status}</span>
                      <span className={`task-priority ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                      {task.dueDate && (
                        <span className="task-due-date">
                          <Calendar size={14} />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link to={`/tasks/${task.id}`} className="task-link">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No tasks created yet.</p>
              <Link to="/tasks/new" className="btn btn-primary">
                Create Your First Task
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Upcoming Tasks</h2>
            <Link to="/tasks" className="view-all">
              View All
            </Link>
          </div>

          {upcomingTasks.length > 0 ? (
            <div className="task-list">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <h4 className="task-title">{task.title}</h4>
                    <p className="task-description">{task.description}</p>
                    <div className="task-meta">
                      <span className={`task-status ${getTaskStatusColor(task)}`}>{getTaskStatus(task)}</span>
                      <span className={`task-priority ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                      {task.dueDate && (
                        <span className="task-due-date">
                          <Calendar size={14} />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link to={`/tasks/${task.id}`} className="task-link">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No upcoming tasks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
