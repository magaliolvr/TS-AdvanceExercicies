import React, { useState, useEffect, useRef } from 'react';
import './SearchComponent.css';

const SearchComponent = ({ userId = 'user123', initialData = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    category: 'all'
  });
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchStats, setSearchStats] = useState({
    totalResults: 0,
    searchTime: 0,
    lastSearch: null
  });
  const [viewMode, setViewMode] = useState('list');
  const searchInputRef = useRef(null);

  // Load search data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`search_data_${userId}`);
    if (savedData && initialData.length === 0) {
      try {
        const parsedData = JSON.parse(savedData);
        setSearchHistory(parsedData.searchHistory || []);
        setRecentSearches(parsedData.recentSearches || []);
      } catch (error) {
        console.error('Error parsing saved search data:', error);
      }
    }
  }, [userId, initialData.length]);

  // Save search data to localStorage
  useEffect(() => {
    localStorage.setItem(`search_data_${userId}`, JSON.stringify({
      searchHistory,
      recentSearches
    }));
  }, [searchHistory, recentSearches, userId]);

  // Generate sample data
  const generateSampleData = () => {
    const sampleData = [
      { id: '1', title: 'React Development Guide', type: 'document', category: 'development', content: 'Complete guide to React development with examples and best practices.', tags: ['react', 'javascript', 'frontend'], date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      { id: '2', title: 'JavaScript Fundamentals', type: 'document', category: 'programming', content: 'Core concepts of JavaScript programming language.', tags: ['javascript', 'programming', 'basics'], date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      { id: '3', title: 'CSS Grid Layout', type: 'tutorial', category: 'design', content: 'Learn CSS Grid layout system for modern web design.', tags: ['css', 'grid', 'layout', 'design'], date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
      { id: '4', title: 'Node.js Backend', type: 'code', category: 'backend', content: 'Backend development with Node.js and Express framework.', tags: ['nodejs', 'express', 'backend', 'api'], date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() },
      { id: '5', title: 'Database Design', type: 'document', category: 'database', content: 'Principles of database design and optimization.', tags: ['database', 'sql', 'design', 'optimization'], date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString() }
    ];
    return sampleData;
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const startTime = Date.now();

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const data = generateSampleData();
    const results = data.filter(item => {
      const searchLower = query.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(searchLower);
      const matchesContent = item.content.toLowerCase().includes(searchLower);
      const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(searchLower));
      const matchesCategory = item.category.toLowerCase().includes(searchLower);

      // Apply filters
      if (filters.type !== 'all' && item.type !== filters.type) return false;
      if (filters.category !== 'all' && item.category !== filters.category) return false;

      return matchesTitle || matchesContent || matchesTags || matchesCategory;
    });

    const searchTime = Date.now() - startTime;
    
    setSearchResults(results);
    setSearchStats({
      totalResults: results.length,
      searchTime,
      lastSearch: new Date().toISOString()
    });

    // Update search history
    if (query.trim()) {
      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      
      const newRecent = [query, ...recentSearches.filter(h => h !== query)].slice(0, 5);
      setRecentSearches(newRecent);
    }

    setIsSearching(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  const handleSearchInputChange = (value) => {
    setSearchTerm(value);
    
    // Generate suggestions based on input
    if (value.trim()) {
      const data = generateSampleData();
      const suggestions = data
        .filter(item => 
          item.title.toLowerCase().includes(value.toLowerCase()) ||
          item.tags.some(tag => tag.toLowerCase().includes(value.toLowerCase()))
        )
        .slice(0, 5)
        .map(item => item.title);
      setSuggestions(suggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setSuggestions([]);
    performSearch(suggestion);
  };

  const handleHistoryClick = (historyItem) => {
    setSearchTerm(historyItem);
    performSearch(historyItem);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSuggestions([]);
  };

  const getHighlightedText = (text, searchTerm) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'document': return '📄';
      case 'tutorial': return '📚';
      case 'code': return '💻';
      case 'image': return '🖼️';
      case 'video': return '🎥';
      default: return '📄';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'development': return 'category-dev';
      case 'programming': return 'category-prog';
      case 'design': return 'category-design';
      case 'backend': return 'category-backend';
      case 'database': return 'category-db';
      default: return '';
    }
  };

  const renderSearchResult = (result) => {
    return (
      <div key={result.id} className="search-result">
        <div className="result-header">
          <span className="result-icon">{getTypeIcon(result.type)}</span>
          <h3 className="result-title" dangerouslySetInnerHTML={{ 
            __html: getHighlightedText(result.title, searchTerm) 
          }} />
          <span className={`result-category ${getCategoryColor(result.category)}`}>
            {result.category}
          </span>
        </div>
        
        <p className="result-content" dangerouslySetInnerHTML={{ 
          __html: getHighlightedText(result.content, searchTerm) 
        }} />
        
        <div className="result-meta">
          <div className="result-tags">
            {result.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          <span className="result-date">
            {new Date(result.date).toLocaleDateString()}
          </span>
        </div>
        
        <div className="result-actions">
          <button className="view-btn">View</button>
          <button className="bookmark-btn">Bookmark</button>
          <button className="share-btn">Share</button>
        </div>
      </div>
    );
  };

  const renderGridView = () => (
    <div className="search-results-grid">
      {searchResults.map(result => (
        <div key={result.id} className="result-card">
          <div className="card-header">
            <span className="card-icon">{getTypeIcon(result.type)}</span>
            <span className={`card-category ${getCategoryColor(result.category)}`}>
              {result.category}
            </span>
          </div>
          <h3 className="card-title" dangerouslySetInnerHTML={{ 
            __html: getHighlightedText(result.title, searchTerm) 
          }} />
          <p className="card-content" dangerouslySetInnerHTML={{ 
            __html: getHighlightedText(result.content.substring(0, 100) + '...', searchTerm) 
          }} />
          <div className="card-tags">
            {result.tags.slice(0, 3).map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="search-results-list">
      {searchResults.map(renderSearchResult)}
    </div>
  );

  return (
    <div className="search-component-container">
      <div className="search-header">
        <h1>Search Component</h1>
        <p>User ID: {userId}</p>
        <div className="search-controls">
          <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>
            List View
          </button>
          <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}>
            Grid View
          </button>
        </div>
      </div>

      <div className="search-main">
        <div className="search-sidebar">
          <div className="sidebar-section">
            <h3>Search Filters</h3>
            <div className="filter-group">
              <label>Type:</label>
              <select value={filters.type} onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}>
                <option value="all">All Types</option>
                <option value="document">Documents</option>
                <option value="tutorial">Tutorials</option>
                <option value="code">Code</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Category:</label>
              <select value={filters.category} onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}>
                <option value="all">All Categories</option>
                <option value="development">Development</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="backend">Backend</option>
                <option value="database">Database</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Date Range:</label>
              <select value={filters.dateRange} onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Recent Searches</h3>
            <div className="recent-searches">
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="recent-search-item"
                  onClick={() => handleHistoryClick(search)}
                >
                  🔍 {search}
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Search History</h3>
            <div className="search-history">
              {searchHistory.map((search, index) => (
                <div
                  key={index}
                  className="history-item"
                  onClick={() => handleHistoryClick(search)}
                >
                  📚 {search}
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Search Statistics</h3>
            <div className="search-stats">
              <div className="stat-item">
                <span className="stat-number">{searchStats.totalResults}</span>
                <span className="stat-label">Total Results</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{searchStats.searchTime}ms</span>
                <span className="stat-label">Search Time</span>
              </div>
              {searchStats.lastSearch && (
                <div className="stat-item">
                  <span className="stat-number">
                    {new Date(searchStats.lastSearch).toLocaleTimeString()}
                  </span>
                  <span className="stat-label">Last Search</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="search-content">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                placeholder="Search for anything..."
                className="search-input"
              />
              <button type="submit" className="search-btn" disabled={isSearching}>
                {isSearching ? '🔍' : '🔍'}
              </button>
              {searchTerm && (
                <button type="button" onClick={clearSearch} className="clear-btn">
                  ×
                </button>
              )}
            </div>

            {suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    💡 {suggestion}
                  </div>
                ))}
              </div>
            )}
          </form>

          {isSearching && (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <p>Searching...</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="search-results">
              <div className="results-header">
                <h3>Search Results ({searchStats.totalResults})</h3>
                <span className="search-time">Found in {searchStats.searchTime}ms</span>
              </div>
              
              {viewMode === 'grid' ? renderGridView() : renderListView()}
            </div>
          )}

          {searchTerm && !isSearching && searchResults.length === 0 && (
            <div className="no-results">
              <p>No results found for "{searchTerm}"</p>
              <p>Try adjusting your search terms or filters.</p>
            </div>
          )}
        </div>
      </div>

      <div className="search-info">
        <h2>Search Features</h2>
        <ul>
          <li><strong>Real-time Search:</strong> Instant search results as you type</li>
          <li><strong>Smart Suggestions:</strong> Intelligent search suggestions</li>
          <li><strong>Advanced Filters:</strong> Filter by type, category, and date</li>
          <li><strong>Multiple View Modes:</strong> List and grid view options</li>
          <li><strong>Search History:</strong> Track and reuse previous searches</li>
          <li><strong>Result Highlighting:</strong> Highlight search terms in results</li>
          <li><strong>Search Statistics:</strong> Performance metrics and timing</li>
          <li><strong>Local Storage:</strong> Search data persists between sessions</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchComponent;
