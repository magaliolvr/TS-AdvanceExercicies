import React, { useState, useEffect } from "react";
import "./TaskManager.css";

// TypeScript interfaces for component props and data
interface TaskManagerProps {
	userId?: string;
	initialTasks?: Task[];
}

interface Task {
	id: string;
	title: string;
	description: string;
	priority: "low" | "medium" | "high";
	status: "pending" | "completed";
	createdAt: string;
	completedAt: string | null;
	tags: string[];
}

interface TaskStats {
	total: number;
	completed: number;
	pending: number;
	highPriority: number;
}

const TaskManagerTS: React.FC<TaskManagerProps> = ({
	userId = "user123",
	initialTasks = [],
}) => {
	// TypeScript state with explicit typing
	const [tasks, setTasks] = useState<Task[]>(initialTasks);
	const [newTask, setNewTask] = useState<string>("");
	const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
	const [sortBy, setSortBy] = useState<"priority" | "createdAt" | "title">(
		"priority"
	);
	const [showCompleted, setShowCompleted] = useState<boolean>(true);
	const [searchTerm, setSearchTerm] = useState<string>("");

	// Load tasks from localStorage on component mount
	useEffect(() => {
		const savedTasks = localStorage.getItem(`tasks_${userId}`);
		if (savedTasks && initialTasks.length === 0) {
			try {
				const parsedTasks: Task[] = JSON.parse(savedTasks);
				setTasks(parsedTasks);
			} catch (error) {
				console.error("Error parsing saved tasks:", error);
			}
		}
	}, [userId, initialTasks]);

	// Save tasks to localStorage whenever tasks change
	useEffect(() => {
		localStorage.setItem(`tasks_${userId}`, JSON.stringify(tasks));
	}, [tasks, userId]);

	// Add a new task
	const addTask = (): void => {
		if (newTask.trim()) {
			const task: Task = {
				id: Date.now().toString(),
				title: newTask.trim(),
				description: "",
				priority: "medium",
				status: "pending",
				createdAt: new Date().toISOString(),
				completedAt: null,
				tags: [],
			};
			setTasks((prev: Task[]) => [task, ...prev]);
			setNewTask("");
		}
	};

	// Toggle task completion status
	const toggleTaskStatus = (taskId: string): void => {
		setTasks((prev: Task[]) =>
			prev.map((task: Task) => {
				if (task.id === taskId) {
					const newStatus: "pending" | "completed" =
						task.status === "completed" ? "pending" : "completed";
					return {
						...task,
						status: newStatus,
						completedAt:
							newStatus === "completed" ? new Date().toISOString() : null,
					};
				}
				return task;
			})
		);
	};

	// Delete a task
	const deleteTask = (taskId: string): void => {
		setTasks((prev: Task[]) => prev.filter((task: Task) => task.id !== taskId));
	};

	// Update task properties
	const updateTask = (taskId: string, updates: Partial<Task>): void => {
		setTasks((prev: Task[]) =>
			prev.map((task: Task) =>
				task.id === taskId ? { ...task, ...updates } : task
			)
		);
	};

	// Add a tag to a task
	const addTag = (taskId: string, tag: string): void => {
		if (tag.trim()) {
			updateTask(taskId, {
				tags: [...tasks.find((t: Task) => t.id === taskId)!.tags, tag.trim()],
			});
		}
	};

	// Remove a tag from a task
	const removeTag = (taskId: string, tagToRemove: string): void => {
		const task = tasks.find((t: Task) => t.id === taskId);
		if (task) {
			updateTask(taskId, {
				tags: task.tags.filter((tag: string) => tag !== tagToRemove),
			});
		}
	};

	// Get filtered and sorted tasks
	const filteredAndSortedTasks: Task[] = tasks
		.filter((task: Task) => {
			const matchesFilter: boolean = filter === "all" || task.status === filter;
			const matchesSearch: boolean =
				task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				task.description.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesVisibility: boolean =
				showCompleted || task.status !== "completed";
			return matchesFilter && matchesSearch && matchesVisibility;
		})
		.sort((a: Task, b: Task) => {
			switch (sortBy) {
				case "priority":
					const priorityOrder: Record<string, number> = {
						high: 3,
						medium: 2,
						low: 1,
					};
					return priorityOrder[b.priority] - priorityOrder[a.priority];
				case "createdAt":
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
				case "title":
					return a.title.localeCompare(b.title);
				default:
					return 0;
			}
		});

	// TypeScript utility functions with explicit return types
	const getPriorityColor = (priority: Task["priority"]): string => {
		switch (priority) {
			case "high":
				return "priority-high";
			case "medium":
				return "priority-medium";
			case "low":
				return "priority-low";
			default:
				return "";
		}
	};

	const getStatusIcon = (status: Task["status"]): string => {
		return status === "completed" ? "✓" : "○";
	};

	const getTaskStats = (): TaskStats => {
		const total: number = tasks.length;
		const completed: number = tasks.filter(
			(t: Task) => t.status === "completed"
		).length;
		const pending: number = total - completed;
		const highPriority: number = tasks.filter(
			(t: Task) => t.priority === "high" && t.status === "pending"
		).length;

		return { total, completed, pending, highPriority };
	};

	// TypeScript event handlers for form inputs
	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
		if (e.key === "Enter") {
			addTask();
		}
	};

	const handleTagKeyPress = (
		e: React.KeyboardEvent<HTMLInputElement>,
		taskId: string
	): void => {
		if (e.key === "Enter") {
			addTag(taskId, e.currentTarget.value);
			e.currentTarget.value = "";
		}
	};

	const stats: TaskStats = getTaskStats();

	return (
		<div className="task-manager">
			<div className="task-header">
				<h2>Task Manager</h2>
				<p>User ID: {userId}</p>
			</div>

			<div className="task-controls">
				<div className="add-task-section">
					<input
						type="text"
						value={newTask}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setNewTask(e.target.value)
						}
						onKeyPress={handleKeyPress}
						placeholder="Enter a new task..."
						className="task-input"
					/>
					<button onClick={addTask} className="add-task-btn">
						Add Task
					</button>
				</div>

				<div className="filter-controls">
					<select
						value={filter}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
							setFilter(e.target.value as "all" | "pending" | "completed")
						}
						className="filter-select">
						<option value="all">All Tasks</option>
						<option value="pending">Pending</option>
						<option value="completed">Completed</option>
					</select>

					<select
						value={sortBy}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
							setSortBy(e.target.value as "priority" | "createdAt" | "title")
						}
						className="sort-select">
						<option value="priority">Sort by Priority</option>
						<option value="createdAt">Sort by Date</option>
						<option value="title">Sort by Title</option>
					</select>

					<input
						type="text"
						value={searchTerm}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setSearchTerm(e.target.value)
						}
						placeholder="Search tasks..."
						className="search-input"
					/>

					<label className="show-completed">
						<input
							type="checkbox"
							checked={showCompleted}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setShowCompleted(e.target.checked)
							}
						/>
						Show Completed
					</label>
				</div>
			</div>

			<div className="task-stats">
				<div className="stat-item">
					<span className="stat-number">{stats.total}</span>
					<span className="stat-label">Total Tasks</span>
				</div>
				<div className="stat-item">
					<span className="stat-number">{stats.pending}</span>
					<span className="stat-label">Pending</span>
				</div>
				<div className="stat-item">
					<span className="stat-number">{stats.completed}</span>
					<span className="stat-label">Completed</span>
				</div>
				<div className="stat-item">
					<span className="stat-number">{stats.highPriority}</span>
					<span className="stat-label">High Priority</span>
				</div>
			</div>

			<div className="task-list">
				{filteredAndSortedTasks.length === 0 ? (
					<div className="no-tasks">
						<p>No tasks found. Add a new task to get started!</p>
					</div>
				) : (
					filteredAndSortedTasks.map((task: Task) => (
						<div
							key={task.id}
							className={`task-item ${task.status} ${getPriorityColor(
								task.priority
							)}`}>
							<div className="task-header-row">
								<div
									className="task-status"
									onClick={() => toggleTaskStatus(task.id)}>
									<span className="status-icon">
										{getStatusIcon(task.status)}
									</span>
								</div>

								<div className="task-content">
									<div className="task-title">
										<input
											type="text"
											value={task.title}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												updateTask(task.id, { title: e.target.value })
											}
											className="task-title-input"
										/>
									</div>

									<div className="task-description">
										<textarea
											value={task.description}
											onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
												updateTask(task.id, { description: e.target.value })
											}
											placeholder="Add description..."
											rows={2}
										/>
									</div>

									<div className="task-meta">
										<span className="task-date">
											Created: {new Date(task.createdAt).toLocaleDateString()}
										</span>
										{task.completedAt && (
											<span className="task-completed">
												Completed:{" "}
												{new Date(task.completedAt).toLocaleDateString()}
											</span>
										)}
									</div>

									<div className="task-priority">
										<select
											value={task.priority}
											onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
												updateTask(task.id, {
													priority: e.target.value as Task["priority"],
												})
											}
											className={`priority-select ${getPriorityColor(
												task.priority
											)}`}>
											<option value="low">Low</option>
											<option value="medium">Medium</option>
											<option value="high">High</option>
										</select>
									</div>

									<div className="task-tags">
										{task.tags.map((tag: string, index: number) => (
											<span key={index} className="tag">
												{tag}
												<button
													onClick={() => removeTag(task.id, tag)}
													className="remove-tag">
													×
												</button>
											</span>
										))}
										<input
											type="text"
											placeholder="Add tag..."
											onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
												handleTagKeyPress(e, task.id)
											}
											className="tag-input"
										/>
									</div>
								</div>

								<button
									onClick={() => deleteTask(task.id)}
									className="delete-task-btn"
									title="Delete task">
									×
								</button>
							</div>
						</div>
					))
				)}
			</div>

			<div className="typescript-features">
				<h3>TypeScript Features Used:</h3>
				<ul>
					<li>
						<strong>Type Safety:</strong> All task properties have defined
						interfaces
					</li>
					<li>
						<strong>Union Types:</strong> Priority and status use specific
						string literals
					</li>
					<li>
						<strong>Generic State:</strong> useState hooks with explicit typing
					</li>
					<li>
						<strong>Event Handler Types:</strong> React events are properly
						typed
					</li>
					<li>
						<strong>Array Methods:</strong> Type-safe filtering, mapping, and
						sorting
					</li>
					<li>
						<strong>Interface Contracts:</strong> Clear structure for Task
						objects
					</li>
					<li>
						<strong>Key Safety:</strong> Object property access is type-checked
					</li>
				</ul>
			</div>
		</div>
	);
};

export default TaskManagerTS;
