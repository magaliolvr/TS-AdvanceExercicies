import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Edit, Trash2, ArrowLeft, Calendar, User, Tag, Clock, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { useTaskContext } from "../../context/TaskContext";
import { formatDate, formatDateTime, isOverdue, isDueSoon } from "../../utils/helper";
import { TASK_STATUSES, TASK_PRIORITIES, PRIORITY_LABELS, STATUS_LABELS, PRIORITY_COLORS, STATUS_COLORS } from "../../utils/constants";
import toast from "react-hot-toast";
import "./TaskDetail.css";

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask, loading } = useTaskContext();
  const [task, setTask] = useState(null);

  useEffect(() => {
    const foundTask = tasks.find((t) => t.id === id);
    if (foundTask) {
      setTask(foundTask);
    } else {
      toast.error("Task not found");
      navigate("/tasks");
    }
  }, [id, tasks, navigate]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTask(id, { status: newStatus });
      toast.success(`Task marked as ${STATUS_LABELS[newStatus]}`);
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id);
        toast.success("Task deleted successfully");
        navigate("/tasks");
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  const getTaskStatus = () => {
    if (task.status === TASK_STATUSES.COMPLETED) return "Completed";
    if (isOverdue(task.dueDate)) return "Overdue";
    if (isDueSoon(task.dueDate)) return "Due Soon";
    return "On Track";
  };

  const getTaskStatusColor = () => {
    if (task.status === TASK_STATUSES.COMPLETED) return "success";
    if (isOverdue(task.dueDate)) return "danger";
    if (isDueSoon(task.dueDate)) return "warning";
    return "info";
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="error">
        <p>Task not found</p>
      </div>
    );
  }

  return (
    <div className="task-detail-page">
      <div className="task-detail-header">
        <div className="header-left">
          <Link to="/tasks" className="back-button">
            <ArrowLeft size={20} />
            Back to Tasks
          </Link>
          <h1>{task.title}</h1>
        </div>
        <div className="header-actions">
          <Link to={`/tasks/${id}/edit`} className="btn btn-primary">
            <Edit size={16} />
            Edit
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="task-detail-content">
        <div className="task-main-info">
          <div className="task-status-section">
            <div className="status-info">
              <span className={`status-badge ${STATUS_COLORS[task.status]}`}>{STATUS_LABELS[task.status]}</span>
              <span className={`task-status ${getTaskStatusColor()}`}>{getTaskStatus()}</span>
            </div>

            {task.status !== TASK_STATUSES.COMPLETED && (
              <button className="btn btn-success" onClick={() => handleStatusChange(TASK_STATUSES.COMPLETED)}>
                <CheckCircle size={16} />
                Mark Complete
              </button>
            )}
          </div>

          {task.description && (
            <div className="task-description">
              <h3>Description</h3>
              <p>{task.description}</p>
            </div>
          )}

          <div className="task-meta-grid">
            <div className="meta-item">
              <div className="meta-icon">
                <Calendar size={16} />
              </div>
              <div className="meta-content">
                <label>Due Date</label>
                <span className={isOverdue(task.dueDate) ? "overdue" : ""}>{task.dueDate ? formatDateTime(task.dueDate) : "No due date"}</span>
              </div>
            </div>

            <div className="meta-item">
              <div className="meta-icon">
                <AlertTriangle size={16} />
              </div>
              <div className="meta-content">
                <label>Priority</label>
                <span className={`priority-badge ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
              </div>
            </div>

            {task.category && (
              <div className="meta-item">
                <div className="meta-icon">
                  <FileText size={16} />
                </div>
                <div className="meta-content">
                  <label>Category</label>
                  <span>{task.category}</span>
                </div>
              </div>
            )}

            {task.assignedTo && (
              <div className="meta-item">
                <div className="meta-icon">
                  <User size={16} />
                </div>
                <div className="meta-content">
                  <label>Assigned To</label>
                  <span>{task.assignedTo}</span>
                </div>
              </div>
            )}

            <div className="meta-item">
              <div className="meta-icon">
                <Clock size={16} />
              </div>
              <div className="meta-content">
                <label>Created</label>
                <span>{formatDateTime(task.createdAt)}</span>
              </div>
            </div>

            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <div className="meta-item">
                <div className="meta-icon">
                  <Clock size={16} />
                </div>
                <div className="meta-content">
                  <label>Last Updated</label>
                  <span>{formatDateTime(task.updatedAt)}</span>
                </div>
              </div>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="task-tags-section">
              <h3>Tags</h3>
              <div className="tags-container">
                {task.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    <Tag size={14} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="task-sidebar">
          <div className="sidebar-section">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              {task.status === TASK_STATUSES.PENDING && (
                <button className="btn btn-warning" onClick={() => handleStatusChange(TASK_STATUSES.IN_PROGRESS)}>
                  Start Task
                </button>
              )}

              {task.status === TASK_STATUSES.IN_PROGRESS && (
                <button className="btn btn-success" onClick={() => handleStatusChange(TASK_STATUSES.COMPLETED)}>
                  Complete Task
                </button>
              )}

              {task.status === TASK_STATUSES.COMPLETED && (
                <button className="btn btn-secondary" onClick={() => handleStatusChange(TASK_STATUSES.PENDING)}>
                  Reopen Task
                </button>
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Task Info</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">ID:</span>
                <span className="info-value">{task.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`info-value ${STATUS_COLORS[task.status]}`}>{STATUS_LABELS[task.status]}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Priority:</span>
                <span className={`info-value ${PRIORITY_COLORS[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
