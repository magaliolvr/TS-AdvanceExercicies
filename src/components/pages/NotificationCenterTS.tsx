import React, { useState, useEffect } from "react";
import "./NotificationCenter.css";

// TypeScript interfaces for component props and data
interface NotificationCenterProps {
	userId?: string;
	initialNotifications?: NotificationItem[];
}

interface NotificationItem {
	id: string;
	title: string;
	message: string;
	type: "info" | "success" | "warning" | "error";
	priority: "low" | "medium" | "high";
	category: string;
	timestamp: string;
	isRead: boolean;
	actionUrl?: string;
}

interface NotificationCenterState {
	notifications: NotificationItem[];
	showUnreadOnly: boolean;
	filterType: "all" | "info" | "success" | "warning" | "error";
	filterPriority: "all" | "low" | "medium" | "high";
	filterCategory: string;
	sortBy: "timestamp" | "priority" | "type";
	sortOrder: "asc" | "desc";
}

const NotificationCenterTS: React.FC<NotificationCenterProps> = ({
	userId = "user123",
	initialNotifications = [],
}) => {
	// TypeScript state with explicit typing
	const [notificationState, setNotificationState] =
		useState<NotificationCenterState>({
			notifications: initialNotifications,
			showUnreadOnly: false,
			filterType: "all",
			filterPriority: "all",
			filterCategory: "",
			sortBy: "timestamp",
			sortOrder: "desc",
		});
	const [showSettings, setShowSettings] = useState<boolean>(false);
	const [enableSound, setEnableSound] = useState<boolean>(true);
	const [enableDesktopNotifications, setEnableDesktopNotifications] =
		useState<boolean>(true);

	// Load notifications from localStorage on component mount
	useEffect(() => {
		const savedNotifications = localStorage.getItem(`notifications_${userId}`);
		if (savedNotifications && initialNotifications.length === 0) {
			try {
				const parsedNotifications: NotificationItem[] =
					JSON.parse(savedNotifications);
				setNotificationState((prev: NotificationCenterState) => ({
					...prev,
					notifications: parsedNotifications,
				}));
			} catch (error) {
				console.error("Error parsing saved notifications:", error);
			}
		}
	}, [userId, initialNotifications]);

	// Save notifications to localStorage
	useEffect(() => {
		localStorage.setItem(
			`notifications_${userId}`,
			JSON.stringify(notificationState.notifications)
		);
	}, [notificationState.notifications, userId]);

	// Request notification permission
	useEffect(() => {
		if (enableDesktopNotifications && "Notification" in window) {
			Notification.requestPermission();
		}
	}, [enableDesktopNotifications]);

	// Add a new notification
	const addNotification = (
		title: string,
		message: string,
		type: NotificationItem["type"] = "info",
		priority: NotificationItem["priority"] = "medium",
		category: string = "General"
	): void => {
		const notification: NotificationItem = {
			id: Date.now().toString(),
			title,
			message,
			type,
			priority,
			category,
			timestamp: new Date().toISOString(),
			isRead: false,
		};

		setNotificationState((prev: NotificationCenterState) => ({
			...prev,
			notifications: [notification, ...prev.notifications],
		}));

		// Show desktop notification
		if (enableDesktopNotifications && Notification.permission === "granted") {
			new Notification(title, {
				body: message,
				icon: "/favicon.ico",
				tag: notification.id,
			});
		}

		// Play sound
		if (enableSound) {
			playNotificationSound();
		}
	};

	// Mark notification as read
	const markAsRead = (notificationId: string): void => {
		setNotificationState((prev: NotificationCenterState) => ({
			...prev,
			notifications: prev.notifications.map((notification: NotificationItem) =>
				notification.id === notificationId
					? { ...notification, isRead: true }
					: notification
			),
		}));
	};

	// Mark all notifications as read
	const markAllAsRead = (): void => {
		setNotificationState((prev: NotificationCenterState) => ({
			...prev,
			notifications: prev.notifications.map(
				(notification: NotificationItem) => ({
					...notification,
					isRead: true,
				})
			),
		}));
	};

	// Delete a notification
	const deleteNotification = (notificationId: string): void => {
		setNotificationState((prev: NotificationCenterState) => ({
			...prev,
			notifications: prev.notifications.filter(
				(notification: NotificationItem) => notification.id !== notificationId
			),
		}));
	};

	// Clear all notifications
	const clearAllNotifications = (): void => {
		setNotificationState((prev: NotificationCenterState) => ({
			...prev,
			notifications: [],
		}));
	};

	// Clear read notifications
	const clearReadNotifications = (): void => {
		setNotificationState((prev: NotificationCenterState) => ({
			...prev,
			notifications: prev.notifications.filter(
				(notification: NotificationItem) => !notification.isRead
			),
		}));
	};

	// Play notification sound
	const playNotificationSound = (): void => {
		// Create a simple beep sound
		const audioContext = new (window.AudioContext ||
			(window as any).webkitAudioContext)();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		oscillator.frequency.value = 800;
		gainNode.gain.value = 0.1;

		oscillator.start();
		oscillator.stop(audioContext.currentTime + 0.1);
	};

	// Get filtered and sorted notifications
	const getFilteredAndSortedNotifications = (): NotificationItem[] => {
		let filtered: NotificationItem[] = notificationState.notifications;

		// Apply unread filter
		if (notificationState.showUnreadOnly) {
			filtered = filtered.filter(
				(notification: NotificationItem) => !notification.isRead
			);
		}

		// Apply type filter
		if (notificationState.filterType !== "all") {
			filtered = filtered.filter(
				(notification: NotificationItem) =>
					notification.type === notificationState.filterType
			);
		}

		// Apply priority filter
		if (notificationState.filterPriority !== "all") {
			filtered = filtered.filter(
				(notification: NotificationItem) =>
					notification.priority === notificationState.filterPriority
			);
		}

		// Apply category filter
		if (notificationState.filterCategory) {
			filtered = filtered.filter((notification: NotificationItem) =>
				notification.category
					.toLowerCase()
					.includes(notificationState.filterCategory.toLowerCase())
			);
		}

		// Apply sorting
		filtered.sort((a: NotificationItem, b: NotificationItem) => {
			let aValue: any = a[notificationState.sortBy];
			let bValue: any = b[notificationState.sortBy];

			if (notificationState.sortBy === "timestamp") {
				aValue = new Date(aValue).getTime();
				bValue = new Date(bValue).getTime();
			} else if (notificationState.sortBy === "priority") {
				const priorityOrder: Record<string, number> = {
					high: 3,
					medium: 2,
					low: 1,
				};
				aValue = priorityOrder[aValue];
				bValue = priorityOrder[bValue];
			}

			if (notificationState.sortOrder === "asc") {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});

		return filtered;
	};

	// Get notification statistics
	const getNotificationStats = () => {
		const total: number = notificationState.notifications.length;
		const unread: number = notificationState.notifications.filter(
			(n: NotificationItem) => !n.isRead
		).length;
		const read: number = total - unread;
		const highPriority: number = notificationState.notifications.filter(
			(n: NotificationItem) => n.priority === "high" && !n.isRead
		).length;

		return { total, unread, read, highPriority };
	};

	// Get unique categories
	const getUniqueCategories = (): string[] => {
		const categories: string[] = notificationState.notifications.map(
			(n: NotificationItem) => n.category
		);
		return Array.from(new Set(categories)).sort();
	};

	// Handle notification click
	const handleNotificationClick = (notification: NotificationItem): void => {
		markAsRead(notification.id);
		if (notification.actionUrl) {
			window.open(notification.actionUrl, "_blank");
		}
	};

	// Demo notifications
	const addDemoNotifications = (): void => {
		addNotification(
			"Welcome!",
			"Welcome to the notification center!",
			"success",
			"medium",
			"System"
		);
		addNotification(
			"Update Available",
			"A new version is available for download.",
			"info",
			"low",
			"Updates"
		);
		addNotification(
			"Error Detected",
			"There was an issue with your last action.",
			"error",
			"high",
			"Errors"
		);
		addNotification(
			"Reminder",
			"Don't forget to save your work!",
			"warning",
			"medium",
			"Reminders"
		);
	};

	const filteredNotifications: NotificationItem[] =
		getFilteredAndSortedNotifications();
	const stats = getNotificationStats();
	const categories = getUniqueCategories();

	return (
		<div className="notification-center">
			<div className="notification-header">
				<h2>Notification Center</h2>
				<p>User ID: {userId}</p>
			</div>

			<div className="notification-controls">
				<div className="filter-controls">
					<label className="filter-group">
						<input
							type="checkbox"
							checked={notificationState.showUnreadOnly}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setNotificationState((prev: NotificationCenterState) => ({
									...prev,
									showUnreadOnly: e.target.checked,
								}))
							}
						/>
						Show Unread Only
					</label>

					<select
						value={notificationState.filterType}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
							setNotificationState((prev: NotificationCenterState) => ({
								...prev,
								filterType: e.target.value as
									| "all"
									| "info"
									| "success"
									| "warning"
									| "error",
							}))
						}
						className="filter-select">
						<option value="all">All Types</option>
						<option value="info">Info</option>
						<option value="success">Success</option>
						<option value="warning">Warning</option>
						<option value="error">Error</option>
					</select>

					<select
						value={notificationState.filterPriority}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
							setNotificationState((prev: NotificationCenterState) => ({
								...prev,
								filterPriority: e.target.value as
									| "all"
									| "low"
									| "medium"
									| "high",
							}))
						}
						className="filter-select">
						<option value="all">All Priorities</option>
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
					</select>

					<select
						value={notificationState.filterCategory}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
							setNotificationState((prev: NotificationCenterState) => ({
								...prev,
								filterCategory: e.target.value,
							}))
						}
						className="filter-select">
						<option value="">All Categories</option>
						{categories.map((category: string) => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>
				</div>

				<div className="sort-controls">
					<select
						value={notificationState.sortBy}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
							setNotificationState((prev: NotificationCenterState) => ({
								...prev,
								sortBy: e.target.value as "timestamp" | "priority" | "type",
							}))
						}
						className="sort-select">
						<option value="timestamp">Sort by Time</option>
						<option value="priority">Sort by Priority</option>
						<option value="type">Sort by Type</option>
					</select>

					<button
						onClick={() =>
							setNotificationState((prev: NotificationCenterState) => ({
								...prev,
								sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
							}))
						}
						className="sort-order-btn">
						{notificationState.sortOrder === "asc" ? "↑" : "↓"}
					</button>
				</div>
			</div>

			<div className="notification-actions">
				<button onClick={addDemoNotifications} className="demo-btn">
					Add Demo Notifications
				</button>
				<button onClick={markAllAsRead} className="mark-read-btn">
					Mark All as Read
				</button>
				<button onClick={clearReadNotifications} className="clear-read-btn">
					Clear Read
				</button>
				<button onClick={clearAllNotifications} className="clear-all-btn">
					Clear All
				</button>
				<button
					onClick={() => setShowSettings(!showSettings)}
					className="settings-btn">
					⚙️ Settings
				</button>
			</div>

			<div className="notification-stats">
				<div className="stat-item">
					<span className="stat-number">{stats.total}</span>
					<span className="stat-label">Total</span>
				</div>
				<div className="stat-item">
					<span className="stat-number">{stats.unread}</span>
					<span className="stat-label">Unread</span>
				</div>
				<div className="stat-item">
					<span className="stat-number">{stats.read}</span>
					<span className="stat-label">Read</span>
				</div>
				<div className="stat-item">
					<span className="stat-number">{stats.highPriority}</span>
					<span className="stat-label">High Priority</span>
				</div>
			</div>

			{showSettings && (
				<div className="settings-panel">
					<h3>Notification Settings</h3>
					<div className="setting-item">
						<label>
							<input
								type="checkbox"
								checked={enableSound}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setEnableSound(e.target.checked)
								}
							/>
							Enable Sound Notifications
						</label>
					</div>
					<div className="setting-item">
						<label>
							<input
								type="checkbox"
								checked={enableDesktopNotifications}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setEnableDesktopNotifications(e.target.checked)
								}
							/>
							Enable Desktop Notifications
						</label>
					</div>
				</div>
			)}

			<div className="notifications-list">
				{filteredNotifications.length === 0 ? (
					<div className="no-notifications">
						<p>No notifications found.</p>
					</div>
				) : (
					filteredNotifications.map((notification: NotificationItem) => (
						<div
							key={notification.id}
							className={`notification-item ${notification.type} ${
								notification.priority
							} ${notification.isRead ? "read" : "unread"}`}
							onClick={() => handleNotificationClick(notification)}>
							<div className="notification-icon">
								{notification.type === "info" && "ℹ️"}
								{notification.type === "success" && "✅"}
								{notification.type === "warning" && "⚠️"}
								{notification.type === "error" && "❌"}
							</div>

							<div className="notification-content">
								<div className="notification-header">
									<h4 className="notification-title">{notification.title}</h4>
									<div className="notification-meta">
										<span className="notification-category">
											{notification.category}
										</span>
										<span className="notification-priority">
											{notification.priority}
										</span>
										<span className="notification-time">
											{new Date(notification.timestamp).toLocaleString()}
										</span>
									</div>
								</div>
								<p className="notification-message">{notification.message}</p>
							</div>

							<div className="notification-actions">
								<button
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation();
										markAsRead(notification.id);
									}}
									className="mark-read-btn"
									title="Mark as read">
									✓
								</button>
								<button
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation();
										deleteNotification(notification.id);
									}}
									className="delete-btn"
									title="Delete notification">
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
						<strong>Type Safety:</strong> All notification properties have
						defined interfaces
					</li>
					<li>
						<strong>Union Types:</strong> Notification types and priorities use
						specific string literals
					</li>
					<li>
						<strong>Interface Contracts:</strong> Clear structure for
						notification items and center state
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
						<strong>Key Safety:</strong> Object property access is type-checked
					</li>
				</ul>
			</div>
		</div>
	);
};

export default NotificationCenterTS;
