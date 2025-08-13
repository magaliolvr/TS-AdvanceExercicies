import React, { useState, useEffect } from 'react';
import './NotificationCenter.css';

const NotificationCenter = ({ userId = 'user123', initialNotifications = [] }) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState({
    sound: true,
    desktop: true,
    email: false,
    autoClear: false
  });

  // Load notifications from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem(`notifications_${userId}`);
    if (savedNotifications && initialNotifications.length === 0) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Error parsing saved notifications:', error);
      }
    }
  }, [userId, initialNotifications.length]);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
  }, [notifications, userId]);

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Generate sample notifications
  const generateSampleNotifications = () => {
    const sampleNotifications = [
      {
        id: '1',
        title: 'Welcome to the app!',
        message: 'Thank you for joining us. We hope you enjoy your experience.',
        type: 'info',
        priority: 'low',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        read: false,
        category: 'system'
      },
      {
        id: '2',
        title: 'New message received',
        message: 'You have a new message from John Doe.',
        type: 'message',
        priority: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
        category: 'communication'
      },
      {
        id: '3',
        title: 'Task completed',
        message: 'Your task "Review documents" has been completed successfully.',
        type: 'success',
        priority: 'low',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        read: true,
        category: 'task'
      },
      {
        id: '4',
        title: 'System update available',
        message: 'A new system update is available. Please restart to apply changes.',
        type: 'warning',
        priority: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: false,
        category: 'system'
      }
    ];
    setNotifications(sampleNotifications);
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Play sound if enabled
    if (settings.sound) {
      // Simulate notification sound
      console.log('🔔 Notification sound played');
    }
    
    // Show desktop notification if enabled
    if (settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico'
      });
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'message': return '💬';
      default: return '📢';
    }
  };

  const getFilteredAndSortedNotifications = () => {
    let filtered = notifications;
    
    // Apply filter
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter !== 'all') {
      filtered = filtered.filter(n => n.category === filter);
    }
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'timestamp') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  const filteredNotifications = getFilteredAndSortedNotifications();

  return (
    <div className="notification-center-container">
      <div className="notification-header">
        <h1>Notification Center</h1>
        <p>User ID: {userId}</p>
        <div className="notification-controls">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="notification-toggle"
          >
            🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button onClick={generateSampleNotifications}>Generate Sample</button>
          <button onClick={requestNotificationPermission}>Enable Desktop</button>
        </div>
      </div>

      <div className="notification-main">
        <div className="notification-sidebar">
          <div className="sidebar-section">
            <h3>Quick Actions</h3>
            <button onClick={markAllAsRead}>Mark All Read</button>
            <button onClick={clearAll}>Clear All</button>
          </div>

          <div className="sidebar-section">
            <h3>Filters</h3>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="system">System</option>
              <option value="communication">Communication</option>
              <option value="task">Task</option>
            </select>
          </div>

          <div className="sidebar-section">
            <h3>Sort Options</h3>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="timestamp">Date & Time</option>
              <option value="priority">Priority</option>
              <option value="type">Type</option>
              <option value="title">Title</option>
            </select>
            <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="sidebar-section">
            <h3>Settings</h3>
            <label>
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(e) => setSettings(prev => ({ ...prev, sound: e.target.checked }))}
              />
              Sound Notifications
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.desktop}
                onChange={(e) => setSettings(prev => ({ ...prev, desktop: e.target.checked }))}
              />
              Desktop Notifications
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.autoClear}
                onChange={(e) => setSettings(prev => ({ ...prev, autoClear: e.target.checked }))}
              />
              Auto-clear Read
            </label>
          </div>

          <div className="sidebar-section">
            <h3>Statistics</h3>
            <div className="notification-stats">
              <div className="stat-item">
                <span className="stat-number">{notifications.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{unreadCount}</span>
                <span className="stat-label">Unread</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {notifications.filter(n => n.priority === 'high').length}
                </span>
                <span className="stat-label">High Priority</span>
              </div>
            </div>
          </div>
        </div>

        <div className="notification-content">
          <div className="notification-toolbar">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="toolbar-actions">
              <button onClick={() => addNotification({
                title: 'Test Notification',
                message: 'This is a test notification to demonstrate the system.',
                type: 'info',
                priority: 'medium',
                category: 'system'
              })}>Add Test</button>
            </div>
          </div>

          <div className="notifications-list">
            {filteredNotifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications found.</p>
                <button onClick={generateSampleNotifications}>Generate Sample Notifications</button>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'} ${getPriorityColor(notification.priority)}`}
                >
                  <div className="notification-icon">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4 className="notification-title">{notification.title}</h4>
                      <span className="notification-time">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    
                    <p className="notification-message">{notification.message}</p>
                    
                    <div className="notification-meta">
                      <span className="notification-type">{notification.type}</span>
                      <span className="notification-category">{notification.category}</span>
                      <span className={`notification-priority ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div className="notification-actions">
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="mark-read-btn"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="delete-btn"
                      title="Delete notification"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="notification-popup">
          <div className="popup-header">
            <h3>Recent Notifications</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="popup-content">
            {notifications.slice(0, 5).map(notification => (
              <div key={notification.id} className="popup-notification">
                <span className="popup-icon">{getTypeIcon(notification.type)}</span>
                <div className="popup-text">
                  <div className="popup-title">{notification.title}</div>
                  <div className="popup-time">{formatTimestamp(notification.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="notification-info">
        <h2>Notification Center Features</h2>
        <ul>
          <li><strong>Multiple Types:</strong> Info, success, warning, error, and message notifications</li>
          <li><strong>Priority Levels:</strong> High, medium, and low priority notifications</li>
          <li><strong>Categories:</strong> System, communication, and task notifications</li>
          <li><strong>Filtering & Search:</strong> Find notifications quickly</li>
          <li><strong>Sorting Options:</strong> Sort by time, priority, type, or title</li>
          <li><strong>Desktop Notifications:</strong> Browser-based desktop notifications</li>
          <li><strong>Sound Alerts:</strong> Audio notification support</li>
          <li><strong>Local Storage:</strong> Notifications persist between sessions</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationCenter;
