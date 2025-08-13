import React, { useState, useEffect } from 'react';
import './FileManager.css';

const FileManager = ({ userId = 'user123', initialFiles = [] }) => {
  const [files, setFiles] = useState(initialFiles);
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Load files from localStorage
  useEffect(() => {
    const savedFiles = localStorage.getItem(`files_${userId}`);
    if (savedFiles && initialFiles.length === 0) {
      try {
        setFiles(JSON.parse(savedFiles));
      } catch (error) {
        console.error('Error parsing saved files:', error);
      }
    }
  }, [userId, initialFiles.length]);

  // Save files to localStorage
  useEffect(() => {
    localStorage.setItem(`files_${userId}`, JSON.stringify(files));
  }, [files, userId]);

  const generateSampleFiles = () => {
    const sampleFiles = [
      { id: '1', name: 'Document.pdf', type: 'pdf', size: 1024000, path: '/', modified: new Date().toISOString(), hidden: false },
      { id: '2', name: 'Image.jpg', type: 'image', size: 2048000, path: '/', modified: new Date().toISOString(), hidden: false },
      { id: '3', name: 'Spreadsheet.xlsx', type: 'spreadsheet', size: 512000, path: '/', modified: new Date().toISOString(), hidden: false },
      { id: '4', name: 'Folder', type: 'folder', size: 0, path: '/', modified: new Date().toISOString(), hidden: false },
      { id: '5', name: '.config', type: 'config', size: 1024, path: '/', modified: new Date().toISOString(), hidden: true }
    ];
    setFiles(sampleFiles);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'folder': return '📁';
      case 'image': return '🖼️';
      case 'pdf': return '📄';
      case 'spreadsheet': return '📊';
      case 'config': return '⚙️';
      default: return '📄';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFilteredAndSortedFiles = () => {
    let filtered = files.filter(file => {
      const matchesPath = file.path === currentPath;
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesHidden = showHidden || !file.hidden;
      return matchesPath && matchesSearch && matchesHidden;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'modified') {
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

  const createFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName && folderName.trim()) {
      const newFolder = {
        id: Date.now().toString(),
        name: folderName.trim(),
        type: 'folder',
        size: 0,
        path: currentPath,
        modified: new Date().toISOString(),
        hidden: false
      };
      setFiles(prev => [...prev, newFolder]);
    }
  };

  const uploadFile = (event) => {
    const files = Array.from(event.target.files);
    setIsUploading(true);
    setUploadProgress(0);

    files.forEach((file, index) => {
      const newFile = {
        id: Date.now().toString() + index,
        name: file.name,
        type: file.type.split('/')[0],
        size: file.size,
        path: currentPath,
        modified: new Date().toISOString(),
        hidden: false
      };

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      setTimeout(() => {
        setFiles(prev => [...prev, newFile]);
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    });
  };

  const deleteFiles = () => {
    if (selectedFiles.length > 0) {
      if (confirm(`Are you sure you want to delete ${selectedFiles.length} file(s)?`)) {
        setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
        setSelectedFiles([]);
      }
    }
  };

  const moveFiles = (destinationPath) => {
    if (selectedFiles.length > 0) {
      setFiles(prev => prev.map(file => 
        selectedFiles.includes(file.id) ? { ...file, path: destinationPath } : file
      ));
      setSelectedFiles([]);
    }
  };

  const renameFile = (fileId, newName) => {
    if (newName && newName.trim()) {
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, name: newName.trim() } : file
      ));
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const selectAll = () => {
    const currentFiles = getFilteredAndSortedFiles();
    setSelectedFiles(currentFiles.map(file => file.id));
  };

  const deselectAll = () => {
    setSelectedFiles([]);
  };

  const navigateToFolder = (folderName) => {
    if (folderName === '..') {
      const pathParts = currentPath.split('/').filter(Boolean);
      pathParts.pop();
      setCurrentPath('/' + pathParts.join('/'));
    } else {
      setCurrentPath(currentPath + folderName + '/');
    }
  };

  const getBreadcrumbs = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    return pathParts.map((part, index) => ({
      name: part,
      path: '/' + pathParts.slice(0, index + 1).join('/') + '/'
    }));
  };

  const filteredFiles = getFilteredAndSortedFiles();

  return (
    <div className="file-manager-container">
      <div className="file-manager-header">
        <h1>File Manager</h1>
        <p>User ID: {userId}</p>
        <div className="file-controls">
          <button onClick={createFolder} className="create-folder-btn">New Folder</button>
          <label className="upload-btn">
            <input type="file" multiple onChange={uploadFile} style={{ display: 'none' }} />
            Upload Files
          </label>
          <button onClick={deleteFiles} disabled={selectedFiles.length === 0} className="delete-btn">
            Delete ({selectedFiles.length})
          </button>
        </div>
      </div>

      <div className="file-manager-main">
        <div className="file-sidebar">
          <div className="sidebar-section">
            <h3>Quick Actions</h3>
            <button onClick={selectAll}>Select All</button>
            <button onClick={deselectAll}>Deselect All</button>
          </div>

          <div className="sidebar-section">
            <h3>View Options</h3>
            <div className="view-controls">
              <button 
                className={viewMode === 'grid' ? 'active' : ''} 
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button 
                className={viewMode === 'list' ? 'active' : ''} 
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Sort Options</h3>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="modified">Modified</option>
              <option value="type">Type</option>
            </select>
            <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="sidebar-section">
            <h3>Filters</h3>
            <label>
              <input
                type="checkbox"
                checked={showHidden}
                onChange={(e) => setShowHidden(e.target.checked)}
              />
              Show Hidden Files
            </label>
          </div>

          <div className="sidebar-section">
            <h3>Storage Info</h3>
            <div className="storage-info">
              <div className="storage-bar">
                <div 
                  className="storage-fill" 
                  style={{ width: `${(files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024 * 1024)) * 100}%` }}
                ></div>
              </div>
              <span>{formatFileSize(files.reduce((sum, f) => sum + f.size, 0))} used</span>
            </div>
          </div>
        </div>

        <div className="file-content">
          <div className="file-toolbar">
            <div className="breadcrumbs">
              <span onClick={() => setCurrentPath('/')} className="breadcrumb">Home</span>
              {getBreadcrumbs().map((crumb, index) => (
                <>
                <span key={index} className="breadcrumb-separator">/</span>
                <span 
                  key={crumb.path} 
                  onClick={() => setCurrentPath(crumb.path)}
                  className="breadcrumb"
                >
                  {crumb.name}
                  </span>
                  </>
              ))}
            </div>

            <div className="search-bar">
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isUploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span>Uploading... {uploadProgress}%</span>
            </div>
          )}

          <div className="files-container">
            {currentPath !== '/' && (
              <div 
                className={`file-item ${viewMode}`}
                onClick={() => navigateToFolder('..')}
              >
                <span className="file-icon">📁</span>
                <span className="file-name">..</span>
                <span className="file-type">Parent Directory</span>
              </div>
            )}

            {filteredFiles.length === 0 ? (
              <div className="no-files">
                <p>No files found in this directory.</p>
                <button onClick={generateSampleFiles}>Generate Sample Files</button>
              </div>
            ) : (
              filteredFiles.map(file => (
                <div
                  key={file.id}
                  className={`file-item ${viewMode} ${selectedFiles.includes(file.id) ? 'selected' : ''}`}
                  onClick={() => file.type === 'folder' ? navigateToFolder(file.name) : toggleFileSelection(file.id)}
                  onDoubleClick={() => file.type === 'folder' ? navigateToFolder(file.name) : null}
                >
                  <span className="file-icon">{getFileIcon(file.type)}</span>
                  <span className="file-name">{file.name}</span>
                  {viewMode === 'list' && (
                    <>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                      <span className="file-type">{file.type}</span>
                      <span className="file-modified">{formatDate(file.modified)}</span>
                    </>
                  )}
                  <div className="file-actions">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      renameFile(file.id, prompt('Enter new name:', file.name));
                    }}>✏️</button>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      toggleFileSelection(file.id);
                    }}>{selectedFiles.includes(file.id) ? '✓' : '○'}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="file-manager-info">
        <h2>File Manager Features</h2>
        <ul>
          <li><strong>File Operations:</strong> Create, delete, rename, and move files</li>
          <li><strong>Folder Navigation:</strong> Navigate through directory structure</li>
          <li><strong>Multiple View Modes:</strong> Grid and list views</li>
          <li><strong>File Selection:</strong> Select multiple files for batch operations</li>
          <li><strong>Search & Filter:</strong> Find files quickly with search and filters</li>
          <li><strong>Sort Options:</strong> Sort by name, size, date, or type</li>
          <li><strong>File Upload:</strong> Upload multiple files with progress tracking</li>
          <li><strong>Local Storage:</strong> Files persist between sessions</li>
        </ul>
      </div>
    </div>
  );
};

export default FileManager;
