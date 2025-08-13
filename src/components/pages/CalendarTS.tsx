import React, { useState, useEffect } from "react";
import "./Calendar.css";

// TypeScript interfaces for component props and data
interface CalendarProps {
	userId?: string;
	initialEvents?: CalendarEvent[];
}

interface CalendarEvent {
	id: string;
	title: string;
	description: string;
	date: string;
	startTime: string;
	endTime: string;
	color: string;
	allDay: boolean;
}

interface DayData {
	date: Date;
	isCurrentMonth: boolean;
}

interface NewEvent {
	title: string;
	description: string;
	startTime: string;
	endTime: string;
	color: string;
	allDay: boolean;
}

const CalendarTS: React.FC<CalendarProps> = ({
	userId = "user123",
	initialEvents = [],
}) => {
	// TypeScript state with explicit typing
	const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
	const [currentDate, setCurrentDate] = useState<Date>(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [isAddingEvent, setIsAddingEvent] = useState<boolean>(false);
	const [newEvent, setNewEvent] = useState<NewEvent>({
		title: "",
		description: "",
		startTime: "09:00",
		endTime: "10:00",
		color: "#007bff",
		allDay: false,
	});
	const [viewMode, setViewMode] = useState<"month" | "week">("month");
	const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
		null
	);

	// Load events from localStorage
	useEffect(() => {
		const savedEvents: string | null = localStorage.getItem(
			`calendar_${userId}`
		);
		if (savedEvents && initialEvents.length === 0) {
			try {
				const parsedEvents: CalendarEvent[] = JSON.parse(savedEvents);
				setEvents(parsedEvents);
			} catch (error) {
				console.error("Error parsing saved events:", error);
			}
		}
	}, [userId, initialEvents]);

	// Save events to localStorage
	useEffect(() => {
		localStorage.setItem(`calendar_${userId}`, JSON.stringify(events));
	}, [events, userId]);

	// Add a new event
	const addEvent = (): void => {
		if (newEvent.title.trim() && selectedDate) {
			const event: CalendarEvent = {
				id: Date.now().toString(),
				...newEvent,
				date: selectedDate.toISOString().split("T")[0],
			};
			setEvents((prev: CalendarEvent[]) => [...prev, event]);
			setNewEvent({
				title: "",
				description: "",
				startTime: "09:00",
				endTime: "10:00",
				color: "#007bff",
				allDay: false,
			});
			setIsAddingEvent(false);
		}
	};

	// Delete an event
	const deleteEvent = (eventId: string): void => {
		setEvents((prev: CalendarEvent[]) =>
			prev.filter((event: CalendarEvent) => event.id !== eventId)
		);
		setSelectedEvent(null);
	};

	// Update an event
	const updateEvent = (
		eventId: string,
		updates: Partial<CalendarEvent>
	): void => {
		setEvents((prev: CalendarEvent[]) =>
			prev.map((event: CalendarEvent) =>
				event.id === eventId ? { ...event, ...updates } : event
			)
		);
	};

	// Get events for a specific date
	const getEventsForDate = (date: Date): CalendarEvent[] => {
		const dateString: string = date.toISOString().split("T")[0];
		return events.filter((event: CalendarEvent) => event.date === dateString);
	};

	// Get days in month
	const getDaysInMonth = (date: Date): DayData[] => {
		const year: number = date.getFullYear();
		const month: number = date.getMonth();
		const firstDay: Date = new Date(year, month, 1);
		const lastDay: Date = new Date(year, month + 1, 0);
		const startDate: Date = new Date(firstDay);
		startDate.setDate(startDate.getDate() - firstDay.getDay());

		const days: DayData[] = [];
		const currentDate: Date = new Date(startDate);

		while (currentDate <= lastDay || currentDate.getDay() !== 0) {
			days.push({
				date: new Date(currentDate),
				isCurrentMonth: currentDate.getMonth() === month,
			});
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return days;
	};

	// Get week days
	const getWeekDays = (): string[] => [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat",
	];

	// Format time for display
	const formatTime = (time: string): string => {
		if (time === "") return "";
		const [hours, minutes]: string[] = time.split(":");
		const hour: number = parseInt(hours);
		const ampm: string = hour >= 12 ? "PM" : "AM";
		const displayHour: number = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	// Navigate to previous month
	const goToPreviousMonth = (): void => {
		setCurrentDate((prev: Date) => {
			const newDate: Date = new Date(prev);
			newDate.setMonth(prev.getMonth() - 1);
			return newDate;
		});
	};

	// Navigate to next month
	const goToNextMonth = (): void => {
		setCurrentDate((prev: Date) => {
			const newDate: Date = new Date(prev);
			newDate.setMonth(prev.getMonth() + 1);
			return newDate;
		});
	};

	// Navigate to today
	const goToToday = (): void => {
		setCurrentDate(new Date());
		setSelectedDate(new Date());
	};

	// Render month view
	const renderMonthView = () => {
		const days: DayData[] = getDaysInMonth(currentDate);
		const weekDays: string[] = getWeekDays();

		return (
			<div className="month-view">
				<div className="weekdays">
					{weekDays.map((day: string) => (
						<div key={day} className="weekday">
							{day}
						</div>
					))}
				</div>
				<div className="days">
					{days.map((day: DayData, index: number) => {
						const dayEvents: CalendarEvent[] = getEventsForDate(day.date);
						const isToday: boolean =
							day.date.toDateString() === new Date().toDateString();
						const isSelected: boolean =
							selectedDate !== null &&
							day.date.toDateString() === selectedDate.toDateString();

						return (
							<div
								key={index}
								className={`day ${
									day.isCurrentMonth ? "current-month" : "other-month"
								} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
								onClick={() => setSelectedDate(day.date)}>
								<span className="day-number">{day.date.getDate()}</span>
								<div className="day-events">
									{dayEvents.slice(0, 3).map((event: CalendarEvent) => (
										<div
											key={event.id}
											className="event-preview"
											style={{ backgroundColor: event.color }}
											onClick={(e: React.MouseEvent) => {
												e.stopPropagation();
												setSelectedEvent(event);
											}}>
											{event.title}
										</div>
									))}
									{dayEvents.length > 3 && (
										<div className="more-events">
											+{dayEvents.length - 3} more
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	// Render week view
	const renderWeekView = () => {
		const weekDays: Date[] = [];
		const current: Date = new Date(currentDate);
		const startOfWeek: Date = new Date(current);
		startOfWeek.setDate(current.getDate() - current.getDay());

		for (let i = 0; i < 7; i++) {
			const day: Date = new Date(startOfWeek);
			day.setDate(startOfWeek.getDate() + i);
			weekDays.push(day);
		}

		return (
			<div className="week-view">
				<div className="week-header">
					{weekDays.map((day: Date) => (
						<div key={day.toISOString()} className="week-day-header">
							<div className="week-day-name">
								{day.toLocaleDateString("en-US", { weekday: "short" })}
							</div>
							<div className="week-day-date">{day.getDate()}</div>
						</div>
					))}
				</div>
				<div className="week-timeline">
					{Array.from({ length: 24 }, (_, hour: number) => (
						<div key={hour} className="time-slot">
							<div className="time-label">
								{formatTime(`${hour.toString().padStart(2, "0")}:00`)}
							</div>
							<div className="time-grid">
								{weekDays.map((day: Date) => {
									const dayEvents: CalendarEvent[] = getEventsForDate(
										day
									).filter((event: CalendarEvent) => {
										if (event.allDay) return false;
										const startHour: number = parseInt(
											event.startTime.split(":")[0]
										);
										return startHour === hour;
									});

									return (
										<div key={day.toISOString()} className="time-cell">
											{dayEvents.map((event: CalendarEvent) => (
												<div
													key={event.id}
													className="timeline-event"
													style={{ backgroundColor: event.color }}
													onClick={() => setSelectedEvent(event)}>
													{event.title}
												</div>
											))}
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>
			</div>
		);
	};

	return (
		<div className="calendar">
			<div className="calendar-header">
				<h2>Calendar</h2>
				<p>User ID: {userId}</p>
			</div>

			<div className="calendar-controls">
				<div className="navigation-controls">
					<button onClick={goToPreviousMonth}>&lt;</button>
					<button onClick={goToToday}>Today</button>
					<button onClick={goToNextMonth}>&gt;</button>
					<h3>
						{currentDate.toLocaleDateString("en-US", {
							month: "long",
							year: "numeric",
						})}
					</h3>
				</div>

				<div className="view-controls">
					<button
						className={viewMode === "month" ? "active" : ""}
						onClick={() => setViewMode("month")}>
						Month
					</button>
					<button
						className={viewMode === "week" ? "active" : ""}
						onClick={() => setViewMode("week")}>
						Week
					</button>
				</div>
			</div>

			<div className="calendar-main">
				<div className="calendar-view">
					{viewMode === "month" ? renderMonthView() : renderWeekView()}
				</div>

				<div className="calendar-sidebar">
					<div className="sidebar-section">
						<h3>Quick Actions</h3>
						<button
							onClick={() => setIsAddingEvent(true)}
							className="add-event-btn">
							Add Event
						</button>
					</div>

					<div className="sidebar-section">
						<h3>Upcoming Events</h3>
						<div className="upcoming-events">
							{events
								.filter(
									(event: CalendarEvent) => new Date(event.date) >= new Date()
								)
								.sort(
									(a: CalendarEvent, b: CalendarEvent) =>
										new Date(a.date).getTime() - new Date(b.date).getTime()
								)
								.slice(0, 5)
								.map((event: CalendarEvent) => (
									<div
										key={event.id}
										className="upcoming-event"
										style={{ borderLeftColor: event.color }}
										onClick={() => setSelectedEvent(event)}>
										<div className="event-title">{event.title}</div>
										<div className="event-date">
											{new Date(event.date).toLocaleDateString()}
										</div>
									</div>
								))}
						</div>
					</div>
				</div>
			</div>

			{isAddingEvent && (
				<div className="add-event-modal">
					<h3>Add New Event</h3>
					<div className="event-form">
						<input
							type="text"
							value={newEvent.title}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setNewEvent((prev: NewEvent) => ({
									...prev,
									title: e.target.value,
								}))
							}
							placeholder="Event title"
						/>
						<textarea
							value={newEvent.description}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
								setNewEvent((prev: NewEvent) => ({
									...prev,
									description: e.target.value,
								}))
							}
							placeholder="Event description"
						/>
						<input
							type="time"
							value={newEvent.startTime}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setNewEvent((prev: NewEvent) => ({
									...prev,
									startTime: e.target.value,
								}))
							}
							disabled={newEvent.allDay}
						/>
						<input
							type="time"
							value={newEvent.endTime}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setNewEvent((prev: NewEvent) => ({
									...prev,
									endTime: e.target.value,
								}))
							}
							disabled={newEvent.allDay}
						/>
						<label>
							<input
								type="checkbox"
								checked={newEvent.allDay}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setNewEvent((prev: NewEvent) => ({
										...prev,
										allDay: e.target.checked,
									}))
								}
							/>
							All Day Event
						</label>
						<input
							type="color"
							value={newEvent.color}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setNewEvent((prev: NewEvent) => ({
									...prev,
									color: e.target.value,
								}))
							}
						/>
						<button onClick={addEvent}>Add Event</button>
						<button
							onClick={() => setIsAddingEvent(false)}
							className="cancel-btn">
							Cancel
						</button>
					</div>
				</div>
			)}

			{selectedEvent && (
				<div className="event-modal">
					<div className="event-details">
						<h3>{selectedEvent.title}</h3>
						<p className="event-date">
							{new Date(selectedEvent.date).toLocaleDateString()}
						</p>
						{selectedEvent.description && (
							<p className="event-description">{selectedEvent.description}</p>
						)}
						{!selectedEvent.allDay && (
							<p className="event-time">
								{formatTime(selectedEvent.startTime)} -{" "}
								{formatTime(selectedEvent.endTime)}
							</p>
						)}
						<div className="event-actions">
							<button onClick={() => setSelectedEvent(null)}>Close</button>
							<button
								onClick={() => deleteEvent(selectedEvent.id)}
								className="delete-btn">
								Delete
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="typescript-features">
				<h3>TypeScript Features Used:</h3>
				<ul>
					<li>
						<strong>Type Safety:</strong> All event properties have defined
						interfaces
					</li>
					<li>
						<strong>Union Types:</strong> View modes use specific string
						literals
					</li>
					<li>
						<strong>Interface Contracts:</strong> Clear structure for calendar
						events and days
					</li>
					<li>
						<strong>Generic State:</strong> useState hooks with explicit typing
					</li>
					<li>
						<strong>Event Handler Types:</strong> React events are properly
						typed
					</li>
					<li>
						<strong>Date Handling:</strong> Type-safe date manipulation and
						formatting
					</li>
					<li>
						<strong>Array Methods:</strong> Type-safe filtering, mapping, and
						sorting
					</li>
				</ul>
			</div>
		</div>
	);
};

export default CalendarTS;
