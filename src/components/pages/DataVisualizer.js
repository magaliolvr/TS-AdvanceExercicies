import React, { useState, useEffect } from 'react';
import './DataVisualizer.css';

const DataVisualizer = ({ dataSource = 'default', chartType = 'bar' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChart, setSelectedChart] = useState(chartType);
  const [filters, setFilters] = useState({
    category: 'all',
    dateRange: 'all',
    minValue: 0,
    maxValue: 1000
  });
  const [viewMode, setViewMode] = useState('chart');
  const [sortBy, setSortBy] = useState('value');
  const [sortOrder, setSortOrder] = useState('desc');

  // Generate sample data
  const generateSampleData = () => {
    const categories = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing'];
    const sampleData = [];
    
    for (let i = 0; i < 50; i++) {
      sampleData.push({
        id: i + 1,
        name: `Data Point ${i + 1}`,
        value: Math.floor(Math.random() * 1000) + 100,
        category: categories[Math.floor(Math.random() * categories.length)],
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        percentage: Math.random() * 100
      });
    }
    
    return sampleData;
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (dataSource === 'default') {
          setData(generateSampleData());
        } else {
          // In a real app, this would fetch from an API
          setData(generateSampleData());
        }
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dataSource]);

  // Apply filters and sorting
  const getFilteredAndSortedData = () => {
    let filteredData = [...data];

    // Apply category filter
    if (filters.category !== 'all') {
      filteredData = filteredData.filter(item => item.category === filters.category);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const daysAgo = filters.dateRange === 'week' ? 7 : filters.dateRange === 'month' ? 30 : 365;
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      filteredData = filteredData.filter(item => new Date(item.date) >= cutoffDate);
    }

    // Apply value range filter
    filteredData = filteredData.filter(item => 
      item.value >= filters.minValue && item.value <= filters.maxValue
    );

    // Apply sorting
    filteredData.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredData;
  };

  const filteredData = getFilteredAndSortedData();

  // Calculate statistics
  const getStats = () => {
    if (filteredData.length === 0) return null;
    
    const values = filteredData.map(item => item.value);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { sum, avg: Math.round(avg), min, max, count: filteredData.length };
  };

  const stats = getStats();

  // Chart rendering functions
  const renderBarChart = () => {
    const maxValue = Math.max(...filteredData.map(item => item.value));
    
    return (
      <div className="bar-chart">
        {filteredData.slice(0, 20).map(item => (
          <div key={item.id} className="bar-item">
            <div className="bar-label">{item.name}</div>
            <div className="bar-container">
              <div 
                className="bar-fill" 
                style={{ 
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.trend === 'up' ? '#4CAF50' : '#f44336'
                }}
              >
                <span className="bar-value">{item.value}</span>
              </div>
            </div>
            <div className="bar-category">{item.category}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderPieChart = () => {
    const categoryData = {};
    filteredData.forEach(item => {
      categoryData[item.category] = (categoryData[item.category] || 0) + item.value;
    });

    const total = Object.values(categoryData).reduce((sum, val) => sum + val, 0);
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    return (
      <div className="pie-chart">
        {Object.entries(categoryData).map(([category, value], index) => {
          const percentage = ((value / total) * 100).toFixed(1);
          const color = colors[index % colors.length];
          
          return (
            <div key={category} className="pie-segment">
              <div className="pie-color" style={{ backgroundColor: color }}></div>
              <div className="pie-info">
                <span className="pie-category">{category}</span>
                <span className="pie-value">{value}</span>
                <span className="pie-percentage">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLineChart = () => {
    const sortedData = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return (
      <div className="line-chart">
        <div className="line-chart-container">
          {sortedData.slice(0, 30).map((item, index) => (
            <div key={item.id} className="line-point">
              <div 
                className="point" 
                style={{ 
                  left: `${(index / (sortedData.length - 1)) * 100}%`,
                  bottom: `${(item.value / 1000) * 100}%`
                }}
                title={`${item.name}: ${item.value}`}
              ></div>
              {index > 0 && (
                <div 
                  className="line-segment"
                  style={{
                    left: `${((index - 1) / (sortedData.length - 1)) * 100}%`,
                    width: `${100 / (sortedData.length - 1)}%`,
                    bottom: `${(item.value / 1000) * 100}%`
                  }}
                ></div>
              )}
            </div>
          ))}
        </div>
        <div className="line-chart-labels">
          <span>0</span>
          <span>250</span>
          <span>500</span>
          <span>750</span>
          <span>1000</span>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (selectedChart) {
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'line':
        return renderLineChart();
      default:
        return renderBarChart();
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (loading) {
    return (
      <div className="data-visualizer-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-visualizer-container">
        <div className="error-state">
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="data-visualizer-container">
      <div className="visualizer-header">
        <h1>Data Visualizer</h1>
        <p>Data Source: {dataSource}</p>
        <div className="view-toggle">
          <button 
            className={viewMode === 'chart' ? 'active' : ''} 
            onClick={() => setViewMode('chart')}
          >
            Chart View
          </button>
          <button 
            className={viewMode === 'table' ? 'active' : ''} 
            onClick={() => setViewMode('table')}
          >
            Table View
          </button>
        </div>
      </div>

      <div className="visualizer-controls">
        <div className="chart-type-selector">
          <label>Chart Type:</label>
          <select value={selectedChart} onChange={(e) => setSelectedChart(e.target.value)}>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="line">Line Chart</option>
          </select>
        </div>

        <div className="filter-controls">
          <select 
            value={filters.category} 
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Education">Education</option>
            <option value="Retail">Retail</option>
            <option value="Manufacturing">Manufacturing</option>
          </select>

          <select 
            value={filters.dateRange} 
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>

          <div className="value-range">
            <input
              type="number"
              placeholder="Min Value"
              value={filters.minValue}
              onChange={(e) => handleFilterChange('minValue', parseInt(e.target.value) || 0)}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max Value"
              value={filters.maxValue}
              onChange={(e) => handleFilterChange('maxValue', parseInt(e.target.value) || 1000)}
            />
          </div>
        </div>

        <div className="sort-controls">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="value">Sort by Value</option>
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="date">Sort by Date</option>
          </select>
          <button onClick={toggleSortOrder} className="sort-order-btn">
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {stats && (
        <div className="data-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.count}</span>
            <span className="stat-label">Data Points</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.sum}</span>
            <span className="stat-label">Total Value</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.avg}</span>
            <span className="stat-label">Average</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.min}</span>
            <span className="stat-label">Min Value</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.max}</span>
            <span className="stat-label">Max Value</span>
          </div>
        </div>
      )}

      <div className="visualization-area">
        {viewMode === 'chart' ? (
          <div className="chart-container">
            {renderChart()}
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Value</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Trend</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 50).map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.value}</td>
                    <td>{item.category}</td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`trend ${item.trend}`}>
                        {item.trend === 'up' ? '↗' : '↘'}
                      </span>
                    </td>
                    <td>{item.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="visualizer-info">
        <h2>Data Visualization Features</h2>
        <ul>
          <li><strong>Multiple Chart Types:</strong> Bar, pie, and line charts</li>
          <li><strong>Advanced Filtering:</strong> By category, date range, and value range</li>
          <li><strong>Sorting Options:</strong> Multiple sort criteria with order control</li>
          <li><strong>Dual View Modes:</strong> Chart and table views</li>
          <li><strong>Real-time Statistics:</strong> Dynamic calculation of data metrics</li>
          <li><strong>Responsive Design:</strong> Adapts to different screen sizes</li>
          <li><strong>Interactive Elements:</strong> Hover effects and click interactions</li>
        </ul>
      </div>
    </div>
  );
};

export default DataVisualizer;
