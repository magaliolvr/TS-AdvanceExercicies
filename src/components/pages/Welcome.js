import React, { useState } from 'react';
import './Welcome.css';

const Welcome = ({ userName = 'Student', courseName = 'Web Development' }) => {
  const [clickCount, setClickCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleButtonClick = () => {
    setClickCount(prevCount => prevCount + 1);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const resetCounter = () => {
    setClickCount(0);
  };

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h1>Ola {courseName}!</h1>
        <p>Hello, {userName}! This is a JavaScript React component.</p>
      </div>

      <div className="welcome-content">
        <div className="demo-section">
          <h2>Interactive Demo</h2>
          
          <div className="demo-item">
            <h3>Button Click Counter</h3>
            <p>You've clicked the button {clickCount} times</p>
            <button onClick={handleButtonClick} className="demo-button">
              Click Me!
            </button>
            <button onClick={resetCounter} className="demo-button secondary">
              Reset Counter
            </button>
          </div>

          <div className="demo-item">
            <h3>Toggle Visibility</h3>
            <button onClick={toggleVisibility} className="demo-button">
              {isVisible ? 'Hide' : 'Show'} Content
            </button>
            {isVisible && (
              <div className="toggle-content">
                <p>This content can be toggled on and off!</p>
                <p>It demonstrates React state management.</p>
              </div>
            )}
          </div>

          <div className="demo-item">
            <h3>Props Example</h3>
            <p>Your name: <strong>{userName}</strong></p>
            <p>Course: <strong>{courseName}</strong></p>
            <p>These values come from props passed to the component.</p>
          </div>
        </div>

        <div className="info-section">
          <h2>What This Component Shows</h2>
          <ul>
            <li><strong>Props:</strong> Receiving data from parent component</li>
            <li><strong>State:</strong> Managing component data with useState</li>
            <li><strong>Event Handlers:</strong> Responding to user interactions</li>
            <li><strong>Conditional Rendering:</strong> Showing/hiding content based on state</li>
            <li><strong>Component Structure:</strong> Organized, readable code</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
