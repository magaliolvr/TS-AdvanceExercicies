import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Save, X, Calendar, Tag, User, FileText, AlertCircle } from "lucide-react";
import { useTaskContext } from "../../context/TaskContext";
import { validateTask, createTask } from "../../utils/helper";
import { TASK_PRIORITIES, TASK_STATUSES, PRIORITY_LABELS, STATUS_LABELS, VALIDATION_RULES } from "../../utils/constants";
import toast from "react-hot-toast";
import "./TaskForm.css";

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, createTask: createTaskAction, updateTask, loading } = useTaskContext();
  const [isEditing, setIsEditing] = useState(false);
  const [task, setTask] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm();

  const watchedValues = watch();

  useEffect(() => {
    if (id && id !== "new") {
      setIsEditing(true);
      const existingTask = tasks.find((t) => t.id === id);
      if (existingTask) {
        setTask(existingTask);
        setTags(existingTask.tags || []);
        reset(existingTask);
      } else {
        toast.error("Task not found");
        navigate("/tasks");
      }
    }
  }, [id, tasks, navigate, reset]);

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < VALIDATION_RULES.MAX_TAGS) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmit = async (data) => {
    const taskData = {
      ...data,
      tags,
      dueDate: data.dueDate || null,
    };

    const validation = validateTask(taskData);
    if (!validation.isValid) {
      Object.keys(validation.errors).forEach((field) => {
        toast.error(validation.errors[field]);
      });
      return;
    }

    try {
      if (isEditing) {
        await updateTask(id, taskData);
        toast.success("Task updated successfully");
      } else {
        await createTaskAction(taskData);
        toast.success("Task created successfully");
      }
      navigate("/tasks");
    } catch (error) {
      toast.error(isEditing ? "Failed to update task" : "Failed to create task");
    }
  };

  const handleCancel = () => {
    navigate("/tasks");
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="task-form-page">
      <div className="task-form-header">
        <h1>{isEditing ? "Edit Task" : "Create New Task"}</h1>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            <X size={16} />
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" form="task-form">
            <Save size={16} />
            {isEditing ? "Update Task" : "Create Task"}
          </button>
        </div>
      </div>

      <form id="task-form" onSubmit={handleSubmit(onSubmit)} className="task-form">
        <div className="form-grid">
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label className="form-label">
                Title <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.title ? "error" : ""}`}
                placeholder="Enter task title"
                {...register("title", {
                  required: "Title is required",
                  minLength: {
                    value: VALIDATION_RULES.TITLE_MIN_LENGTH,
                    message: `Title must be at least ${VALIDATION_RULES.TITLE_MIN_LENGTH} characters`,
                  },
                  maxLength: {
                    value: VALIDATION_RULES.TITLE_MAX_LENGTH,
                    message: `Title must be less than ${VALIDATION_RULES.TITLE_MAX_LENGTH} characters`,
                  },
                })}
              />
              {errors.title && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.title.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className={`form-input ${errors.description ? "error" : ""}`}
                placeholder="Enter task description"
                rows={4}
                {...register("description", {
                  maxLength: {
                    value: VALIDATION_RULES.DESCRIPTION_MAX_LENGTH,
                    message: `Description must be less than ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`,
                  },
                })}
              />
              {errors.description && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.description.message}
                </span>
              )}
            </div>
          </div>

          {/* Task Details */}
          <div className="form-section">
            <h2>Task Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" {...register("status")}>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-input" {...register("priority")}>
                  {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <div className="date-input-wrapper">
                <Calendar size={16} className="date-icon" />
                <input type="datetime-local" className={`form-input ${errors.dueDate ? "error" : ""}`} {...register("dueDate")} />
              </div>
              {errors.dueDate && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.dueDate.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" {...register("category")}>
                <option value="">Select category</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="shopping">Shopping</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
                <option value="finance">Finance</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <div className="user-input-wrapper">
                <User size={16} className="user-icon" />
                <input type="text" className="form-input" placeholder="Enter assignee name" {...register("assignedTo")} />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="form-section">
            <h2>Tags</h2>

            <div className="form-group">
              <label className="form-label">Add Tags</label>
              <div className="tag-input-wrapper">
                <Tag size={16} className="tag-icon" />
                <input type="text" className="form-input" placeholder="Enter tag and press Enter" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={handleKeyPress} maxLength={VALIDATION_RULES.TAG_MAX_LENGTH} />
                <button type="button" className="btn btn-secondary" onClick={handleAddTag} disabled={!tagInput.trim() || tags.length >= VALIDATION_RULES.MAX_TAGS}>
                  Add
                </button>
              </div>
              <p className="form-help">Press Enter to add a tag. Maximum {VALIDATION_RULES.MAX_TAGS} tags allowed.</p>
            </div>

            {tags.length > 0 && (
              <div className="tags-container">
                {tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button type="button" className="tag-remove" onClick={() => handleRemoveTag(tag)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-footer">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            <X size={16} />
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Save size={16} />
            {isEditing ? "Update Task" : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
