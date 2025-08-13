import React, { useState, useEffect } from 'react';
import './Calendar.css';

const Calendar = ({ userId = 'user123', initialEvents = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(initialEvents);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    color: '#007bff',
    allDay: false
  });
  const [viewMode, setViewMode] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem(`calendar_${userId}`);
    if (savedEvents && initialEvents.length === 0) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (error) {
        console.error('Error parsing saved events:', error);
      }
    }
  }, [userId, initialEvents.length]);

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem(`calendar_${userId}`, JSON.stringify(events));
  }, [events, userId]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add previous month's days
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const addEvent = () => {
    if (newEvent.title.trim() && selectedDate) {
      const event = {
        id: Date.now().toString(),
        ...newEvent,
        date: selectedDate.toISOString().split('T')[0]
      };
      setEvents(prev => [...prev, event]);
      setNewEvent({
        title: '',
        description: '',
        startTime: '09:00',
        endTime: '10:00',
        color: '#007bff',
        allDay: false
      });
      setIsAddingEvent(false);
      setSelectedDate(null);
    }
  };

  const deleteEvent = (eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    setSelectedEvent(null);
  };

  const updateEvent = (eventId, updates) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ));
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateYear = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const getWeekDays = () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatTime = (time) => {
    if (time === '') return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = getWeekDays();

    return (
      <div className="month-view">
        <div className="weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="days-grid">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day.date);
            const isToday = day.date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={index}
                className={`day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(day.date)}
              >
                <span className="day-number">{day.date.getDate()}</span>
                <div className="day-events">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className="day-event"
                      style={{ backgroundColor: event.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="more-events">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }

    return (
      <div className="week-view">
        <div className="week-header">
          {weekDays.map(day => (
            <div key={day.toISOString()} className="week-day-header">
              <div className="week-day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="week-day-date">{day.getDate()}</div>
            </div>
          ))}
        </div>
        <div className="week-timeline">
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="time-slot">
              <div className="time-label">{formatTime(`${hour.toString().padStart(2, '0')}:00`)}</div>
              <div className="time-grid">
                {weekDays.map(day => {
                  const dayEvents = getEventsForDate(day).filter(event => {
                    if (event.allDay) return false;
                    const startHour = parseInt(event.startTime.split(':')[0]);
                    return startHour === hour;
                  });

                  return (
                    <div key={day.toISOString()} className="time-cell">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className="timeline-event"
                          style={{ backgroundColor: event.color }}
                          onClick={() => setSelectedEvent(event)}
                        >
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

  const renderEventForm = () => {
    if (!selectedDate) return null;

    return (
      <div className="event-form">
        <h3>Add Event for {selectedDate.toLocaleDateString()}</h3>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={newEvent.title}
            onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Event title"
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={newEvent.description}
            onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Event description"
            rows="3"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Start Time:</label>
            <input
              type="time"
              value={newEvent.startTime}
              onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
              disabled={newEvent.allDay}
            />
          </div>
          <div className="form-group">
            <label>End Time:</label>
            <input
              type="time"
              value={newEvent.endTime}
              onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
              disabled={newEvent.allDay}
            />
          </div>
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={newEvent.allDay}
              onChange={(e) => setNewEvent(prev => ({ ...prev, allDay: e.target.checked }))}
            />
            All Day Event
          </label>
        </div>
        <div className="form-group">
          <label>Color:</label>
          <input
            type="color"
            value={newEvent.color}
            onChange={(e) => setNewEvent(prev => ({ ...prev, color: e.target.value }))}
          />
        </div>
        <div className="form-actions">
          <button onClick={addEvent} className="add-btn">Add Event</button>
          <button onClick={() => setIsAddingEvent(false)} className="cancel-btn">Cancel</button>
        </div>
      </div>
    );
  };

  const renderEventDetails = () => {
    if (!selectedEvent) return null;

    return (
      <div className="event-details">
        <h3>{selectedEvent.title}</h3>
        <p className="event-date">{new Date(selectedEvent.date).toLocaleDateString()}</p>
        {selectedEvent.description && (
          <p className="event-description">{selectedEvent.description}</p>
        )}
        {!selectedEvent.allDay && (
          <p className="event-time">
            {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
          </p>
        )}
        <div className="event-actions">
          <button onClick={() => setSelectedEvent(null)}>Close</button>
          <button onClick={() => deleteEvent(selectedEvent.id)} className="delete-btn">Delete</button>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Calendar</h1>
        <p>User ID: {userId}</p>
        <div className="calendar-controls">
          <button onClick={() => navigateYear(-1)}>«</button>
          <button onClick={() => navigateMonth(-1)}>‹</button>
          <button onClick={goToToday} className="today-btn">Today</button>
          <button onClick={() => navigateMonth(1)}>›</button>
          <button onClick={() => navigateYear(1)}>»</button>
        </div>
        <div className="view-controls">
          <button 
            className={viewMode === 'month' ? 'active' : ''} 
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button 
            className={viewMode === 'week' ? 'active' : ''} 
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
        </div>
      </div>

      <div className="calendar-main">
        <div className="calendar-view">
          {viewMode === 'month' ? renderMonthView() : renderWeekView()}
        </div>

        <div className="calendar-sidebar">
          <div className="sidebar-section">
            <h3>Quick Actions</h3>
            <button 
              onClick={() => setIsAddingEvent(true)}
              className="add-event-btn"
            >
              Add Event
            </button>
          </div>

          {isAddingEvent && renderEventForm()}
          {selectedEvent && renderEventDetails()}

          <div className="sidebar-section">
            <h3>Upcoming Events</h3>
            <div className="upcoming-events">
              {events
                .filter(event => new Date(event.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5)
                .map(event => (
                  <div
                    key={event.id}
                    className="upcoming-event"
                    style={{ borderLeftColor: event.color }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="event-title">{event.title}</div>
                    <div className="event-date">{new Date(event.date).toLocaleDateString()}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="calendar-info">
        <h2>Calendar Features</h2>
        <ul>
          <li><strong>Multiple Views:</strong> Month and week calendar views</li>
          <li><strong>Event Management:</strong> Add, edit, and delete events</li>
          <li><strong>Date Navigation:</strong> Navigate between months and years</li>
          <li><strong>Event Colors:</strong> Customize event colors for organization</li>
          <li><strong>All-Day Events:</strong> Support for all-day and timed events</li>
          <li><strong>Local Storage:</strong> Events persist between sessions</li>
          <li><strong>Responsive Design:</strong> Works on all device sizes</li>
        </ul>
      </div>
    </div>
  );
};

export default Calendar;
