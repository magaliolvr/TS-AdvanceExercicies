import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Database,
  Save,
  X
} from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';
import './Settings.css';

const Settings = () => {
  const { tasks } = useTaskContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Developer',
      timezone: 'UTC-5'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      taskReminders: true,
      weeklyReports: false,
      overdueAlerts: true
    },
    appearance: {
      theme: 'light',
      compactMode: false,
      showCompletedTasks: true,
      defaultView: 'list'
    },
    data: {
      autoBackup: true,
      exportFormat: 'json',
      deleteConfirmation: true
    }
  });

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
    // In a real app, you would save to API
    alert('Settings saved successfully!');
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTasks = JSON.parse(e.target.result);
          // In a real app, you would validate and save to API
          console.log('Imported tasks:', importedTasks);
          alert('Data imported successfully!');
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      // In a real app, you would clear data from API
      alert('Data cleared successfully!');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Privacy', icon: Database }
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <div className="settings-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setSettings(JSON.parse(localStorage.getItem('userSettings') || '{}'))}
          >
            <X size={16} />
            Reset
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSaveSettings}
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="settings-main">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Settings</h2>
              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.profile.name}
                    onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={settings.profile.email}
                    onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.profile.role}
                    onChange={(e) => handleSettingChange('profile', 'role', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select
                    className="form-input"
                    value={settings.profile.timezone}
                    onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
                  >
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC-7">Mountain Time (UTC-7)</option>
                    <option value="UTC-6">Central Time (UTC-6)</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC+0">UTC</option>
                    <option value="UTC+1">Central European Time (UTC+1)</option>
                    <option value="UTC+5:30">India Standard Time (UTC+5:30)</option>
                    <option value="UTC+8">China Standard Time (UTC+8)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <div className="settings-form">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Email Notifications</h3>
                    <p>Receive notifications via email</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Push Notifications</h3>
                    <p>Receive push notifications in browser</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.notifications.pushNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Task Reminders</h3>
                    <p>Get reminded about upcoming tasks</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.notifications.taskReminders}
                      onChange={(e) => handleSettingChange('notifications', 'taskReminders', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Weekly Reports</h3>
                    <p>Receive weekly productivity reports</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.notifications.weeklyReports}
                      onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Overdue Alerts</h3>
                    <p>Get notified about overdue tasks</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.notifications.overdueAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'overdueAlerts', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2>Appearance Settings</h2>
              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <select
                    className="form-input"
                    value={settings.appearance.theme}
                    onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Compact Mode</h3>
                    <p>Use compact layout for better space utilization</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.appearance.compactMode}
                      onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Show Completed Tasks</h3>
                    <p>Display completed tasks in task lists</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.appearance.showCompletedTasks}
                      onChange={(e) => handleSettingChange('appearance', 'showCompletedTasks', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Default View</label>
                  <select
                    className="form-input"
                    value={settings.appearance.defaultView}
                    onChange={(e) => handleSettingChange('appearance', 'defaultView', e.target.value)}
                  >
                    <option value="list">List View</option>
                    <option value="grid">Grid View</option>
                    <option value="kanban">Kanban View</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Data & Privacy Settings */}
          {activeTab === 'data' && (
            <div className="settings-section">
              <h2>Data & Privacy</h2>
              <div className="settings-form">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Auto Backup</h3>
                    <p>Automatically backup your data</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.data.autoBackup}
                      onChange={(e) => handleSettingChange('data', 'autoBackup', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Export Format</label>
                  <select
                    className="form-input"
                    value={settings.data.exportFormat}
                    onChange={(e) => handleSettingChange('data', 'exportFormat', e.target.value)}
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Delete Confirmation</h3>
                    <p>Ask for confirmation before deleting tasks</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.data.deleteConfirmation}
                      onChange={(e) => handleSettingChange('data', 'deleteConfirmation', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="data-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={handleExportData}
                  >
                    Export Data
                  </button>
                  <label className="btn btn-secondary">
                    Import Data
                    <input
                      type="file"
                      accept=".json,.csv"
                      onChange={handleImportData}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button 
                    className="btn btn-danger"
                    onClick={handleClearData}
                  >
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 