import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { TaskProvider } from './context/TaskContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/pages/Dashboard';
import TaskList from './components/pages/TaskList';
import TaskDetail from './components/pages/TaskDetail';
import TaskForm from './components/pages/TaskForm';
import Analytics from './components/pages/Analytics';
import Settings from './components/pages/Settings';
import Welcome from './components/pages/Welcome';
import WelcomeTS from './components/pages/WelcomeTS';
import Comparison from './components/pages/Comparison';
import './App.css';

function App() {
  return (
    <TaskProvider>
      <Router>
        <div className="app">
          <Header />
          <div className="app-content">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/welcome" element={<Welcome userName={10} courseName="teste" />} />
                <Route path="/welcome-ts" element={<WelcomeTS />} />
                <Route path="/comparison" element={<Comparison />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/new" element={<TaskForm />} />
                <Route path="/tasks/:id" element={<TaskDetail />} />
                <Route path="/tasks/:id/edit" element={<TaskForm />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#28a745',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#dc3545',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </TaskProvider>
  );
}

export default App; 