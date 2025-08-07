import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  PieChart,
  Activity
} from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';
import { formatDate } from '../../utils/helpers';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../utils/constants';
import './Analytics.css';

const Analytics = () => {
  const { tasks, stats, loading } = useTaskContext();
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('status');

  const getCompletionRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const getOverdueRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.overdue / stats.total) * 100);
  };

  const getTasksByStatus = () => {
    return [
      { name: 'Completed', value: stats.completed, color: '#28a745' },
      { name: 'In Progress', value: stats.inProgress, color: '#ffc107' },
      { name: 'Pending', value: stats.pending, color: '#17a2b8' }
    ];
  };

  const getTasksByPriority = () => {
    return [
      { name: 'High', value: stats.highPriority, color: '#dc3545' },
      { name: 'Medium', value: stats.mediumPriority, color: '#ffc107' },
      { name: 'Low', value: stats.lowPriority, color: '#28a745' }
    ];
  };

  const getRecentActivity = () => {
    return tasks
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 10);
  };

  const getProductivityTrend = () => {
    // Mock data for productivity trend
    return [
      { date: 'Mon', completed: 5, created: 8 },
      { date: 'Tue', completed: 7, created: 6 },
      { date: 'Wed', completed: 4, created: 9 },
      { date: 'Thu', completed: 9, created: 5 },
      { date: 'Fri', completed: 6, created: 7 },
      { date: 'Sat', completed: 3, created: 4 },
      { date: 'Sun', completed: 2, created: 3 }
    ];
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Analytics</h1>
        <div className="analytics-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon completion">
            <CheckCircle size={24} />
          </div>
          <div className="metric-content">
            <h3 className="metric-value">{getCompletionRate()}%</h3>
            <p className="metric-label">Completion Rate</p>
            <span className="metric-change positive">+5.2%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon productivity">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3 className="metric-value">{stats.completed}</h3>
            <p className="metric-label">Tasks Completed</p>
            <span className="metric-change positive">+12</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon overdue">
            <AlertTriangle size={24} />
          </div>
          <div className="metric-content">
            <h3 className="metric-value">{getOverdueRate()}%</h3>
            <p className="metric-label">Overdue Rate</p>
            <span className="metric-change negative">-2.1%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon efficiency">
            <Activity size={24} />
          </div>
          <div className="metric-content">
            <h3 className="metric-value">{stats.total}</h3>
            <p className="metric-label">Total Tasks</p>
            <span className="metric-change neutral">+8</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-header">
            <h2>Task Distribution</h2>
            <div className="chart-controls">
              <button 
                className={`chart-btn ${selectedMetric === 'status' ? 'active' : ''}`}
                onClick={() => setSelectedMetric('status')}
              >
                <PieChart size={16} />
                By Status
              </button>
              <button 
                className={`chart-btn ${selectedMetric === 'priority' ? 'active' : ''}`}
                onClick={() => setSelectedMetric('priority')}
              >
                <BarChart3 size={16} />
                By Priority
              </button>
            </div>
          </div>
          
          <div className="chart-content">
            {selectedMetric === 'status' ? (
              <div className="pie-chart">
                {getTasksByStatus().map((item, index) => (
                  <div key={index} className="chart-item">
                    <div className="chart-bar">
                      <div 
                        className="bar-fill"
                        style={{ 
                          width: `${(item.value / Math.max(...getTasksByStatus().map(i => i.value))) * 100}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                    <div className="chart-label">
                      <span className="label-color" style={{ backgroundColor: item.color }}></span>
                      <span className="label-text">{item.name}</span>
                      <span className="label-value">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pie-chart">
                {getTasksByPriority().map((item, index) => (
                  <div key={index} className="chart-item">
                    <div className="chart-bar">
                      <div 
                        className="bar-fill"
                        style={{ 
                          width: `${(item.value / Math.max(...getTasksByPriority().map(i => i.value))) * 100}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                    <div className="chart-label">
                      <span className="label-color" style={{ backgroundColor: item.color }}></span>
                      <span className="label-text">{item.name}</span>
                      <span className="label-value">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h2>Productivity Trend</h2>
          </div>
          <div className="chart-content">
            <div className="trend-chart">
              {getProductivityTrend().map((day, index) => (
                <div key={index} className="trend-day">
                  <div className="day-label">{day.date}</div>
                  <div className="day-bars">
                    <div 
                      className="completed-bar"
                      style={{ height: `${(day.completed / 10) * 100}%` }}
                      title={`${day.completed} completed`}
                    ></div>
                    <div 
                      className="created-bar"
                      style={{ height: `${(day.created / 10) * 100}%` }}
                      title={`${day.created} created`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color completed"></span>
                <span>Completed</span>
              </div>
              <div className="legend-item">
                <span className="legend-color created"></span>
                <span>Created</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {getRecentActivity().map((task, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">
                {task.status === TASK_STATUSES.COMPLETED ? (
                  <CheckCircle size={16} />
                ) : task.status === TASK_STATUSES.IN_PROGRESS ? (
                  <Clock size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
              </div>
              <div className="activity-content">
                <p className="activity-text">
                  <strong>{task.title}</strong> was {task.status === TASK_STATUSES.COMPLETED ? 'completed' : 'updated'}
                </p>
                <span className="activity-time">{formatDate(task.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics; 