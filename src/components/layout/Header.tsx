import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Search, Bell, User, Settings as SettingsIcon, LogOut, Sun, Moon, BarChart3 as AnalyticsIcon } from "lucide-react";
import { useTaskContext } from "../../context/TaskContext";
import "./Header.css";

// react.fc faz com que o componente seja tipado como um componente funcional do React

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const location = useLocation();
  const { setFilters, stats } = useTaskContext();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFilters({ search: searchQuery });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value === "") {
      setFilters({ search: "" });
    }
  };

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleUserMenu = () => setIsUserMenuOpen((prev) => !prev);
  const toggleThemeMenu = () => setIsThemeMenuOpen((prev) => !prev);

  const handleThemeChange = (theme: "light" | "dark") => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    setIsThemeMenuOpen(false);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/tasks") return "Tasks";
    if (path === "/analytics") return "Analytics";
    if (path === "/settings") return "Settings";
    if (path.includes("/tasks/")) return "Task Details";
    return "Task Manager";
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            <Menu size={20} />
          </button>

          <Link to="/" className="logo">
            <h1>Task Manager</h1>
          </Link>

          <h2 className="page-title">{getPageTitle()}</h2>
        </div>

        <div className="header-center">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={handleSearchChange} className="search-input" />
            </div>
          </form>
        </div>

        <div className="header-right">
          <div className="header-actions">
            <button className="action-button" onClick={toggleThemeMenu} aria-label="Theme settings">
              <Sun size={18} />
            </button>

            <button className="action-button notification-button" aria-label="Notifications">
              <Bell size={18} />
              {(stats?.overdue ?? 0) > 0 && <span className="notification-badge">{stats.overdue}</span>}
            </button>

            <div className="user-menu-wrapper">
              <button className="user-button" onClick={toggleUserMenu} aria-label="User menu">
                <User size={18} />
                <span className="user-name">John Doe</span>
              </button>

              {isUserMenuOpen && (
                <div className="user-menu">
                  <Link to="/settings" className="user-menu-item">
                    <SettingsIcon size={16} />
                    Settings
                  </Link>
                  <button className="user-menu-item">
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Menu */}
      {isThemeMenuOpen && (
        <div className="theme-menu">
          <button className="theme-option" onClick={() => handleThemeChange("light")}>
            <Sun size={16} />
            Light
          </button>
          <button className="theme-option" onClick={() => handleThemeChange("dark")}>
            <Moon size={16} />
            Dark
          </button>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav-item">
              Dashboard
            </Link>
            <Link to="/tasks" className="mobile-nav-item">
              Tasks
            </Link>
            <Link to="/analytics" className="mobile-nav-item">
              <AnalyticsIcon size={16} />
              Analytics
            </Link>
            <Link to="/settings" className="mobile-nav-item">
              <SettingsIcon size={16} />
              Settings
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
// .
