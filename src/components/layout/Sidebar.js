import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  Plus,
  Calendar,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';
import './Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { stats } = useTaskContext();

  const navigationItems = [
    {
      path: '/',
      icon: Home,
      label: 'Dashboard',
      badge: null
    },
    {
      path: '/tasks',
      icon: CheckSquare,
      label: 'Tasks',
      badge: stats.total
    },
    {
      path: '/analytics',
      icon: BarChart3,
      label: 'Analytics',
      badge: null
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Settings',
      badge: null
    }
  ];

  const quickActions = [
    {
      path: '/tasks/new',
      icon: Plus,
      label: 'New Task',
      variant: 'primary'
    }
  ];

  const quickStats = [
    {
      icon: Clock,
      label: 'Pending',
      value: stats.pending,
      color: 'warning'
    },
    {
      icon: AlertTriangle,
      label: 'Overdue',
      value: stats.overdue,
      color: 'danger'
    },
    {
      icon: Calendar,
      label: 'Due Soon',
      value: stats.dueSoon,
      color: 'info'
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <button 
            className="collapse-toggle"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <div className={`hamburger ${isCollapsed ? 'collapsed' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">Navigation</h3>
            <ul className="nav-list">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <item.icon size={20} />
                    <span className="nav-label">{item.label}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">Quick Actions</h3>
            <ul className="nav-list">
              {quickActions.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`nav-item ${item.variant}`}
                  >
                    <item.icon size={20} />
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">Quick Stats</h3>
            <div className="quick-stats">
              {quickStats.map((stat) => (
                <div key={stat.label} className={`quick-stat ${stat.color}`}>
                  <stat.icon size={16} />
                  <div className="quick-stat-content">
                    <span className="quick-stat-value">{stat.value}</span>
                    <span className="quick-stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <span>JD</span>
            </div>
            <div className="user-details">
              <span className="user-name">John Doe</span>
              <span className="user-role">Developer</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 