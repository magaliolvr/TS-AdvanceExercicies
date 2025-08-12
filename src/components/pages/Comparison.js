import React from 'react';
import Welcome from './Welcome';
import WelcomeTS from './WelcomeTS';
import './Comparison.css';

const Comparison = () => {
  return (
    <div className="comparison-page">
      <div className="comparison-header">
        <h1>JavaScript vs TypeScript Component Comparison</h1>
        <p>See the differences between the same component written in JavaScript and TypeScript</p>
      </div>

      <div className="components-grid">
        <div className="component-section">
          <div className="component-header js-header">
            <h2>JavaScript Version</h2>
            <div className="language-badge js-badge">JavaScript</div>
          </div>
          <div className="component-content">
            <Welcome userName="Student" courseName="Web Development" />
          </div>
        </div>

        <div className="component-section">
          <div className="component-header ts-header">
            <h2>TypeScript Version</h2>
            <div className="language-badge ts-badge">TypeScript</div>
          </div>
          <div className="component-content">
            <WelcomeTS userName="Student" courseName="Web Development" />
          </div>
        </div>
      </div>

      <div className="key-differences">
        <h2>Key Differences Explained</h2>
        <div className="differences-grid">
          <div className="difference-item">
            <h3>Props Definition</h3>
            <div className="code-comparison">
              <div className="code-block js-code">
                <h4>JavaScript</h4>
                <pre><code>{`const Welcome = ({ userName = 'Student', courseName = 'Web Development' }) => {
  // No type checking
}`}</code></pre>
              </div>
              <div className="code-block ts-code">
                <h4>TypeScript</h4>
                <pre><code>{`interface WelcomeProps {
  userName?: string;
  courseName?: string;
}

const Welcome: React.FC<WelcomeProps> = ({ 
  userName = 'Student', 
  courseName = 'Web Development' 
}) => {
  // Full type safety
}`}</code></pre>
              </div>
            </div>
          </div>

          <div className="difference-item">
            <h3>State Definition</h3>
            <div className="code-comparison">
              <div className="code-block js-code">
                <h4>JavaScript</h4>
                <pre><code>{`const [clickCount, setClickCount] = useState(0);
const [isVisible, setIsVisible] = useState(true);`}</code></pre>
              </div>
              <div className="code-block ts-code">
                <h4>TypeScript</h4>
                <pre><code>{`const [clickCount, setClickCount] = useState<number>(0);
const [isVisible, setIsVisible] = useState<boolean>(true);`}</code></pre>
              </div>
            </div>
          </div>

          <div className="difference-item">
            <h3>Function Signatures</h3>
            <div className="code-comparison">
              <div className="code-block js-code">
                <h4>JavaScript</h4>
                <pre><code>{`const handleButtonClick = () => {
  setClickCount(prevCount => prevCount + 1);
};`}</code></pre>
              </div>
              <div className="code-block ts-code">
                <h4>TypeScript</h4>
                <pre><code>{`const handleButtonClick = (): void => {
  setClickCount((prevCount: number) => prevCount + 1);
};`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="learning-tips">
        <h2>Learning Tips for Beginners</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <h3>Start with JavaScript</h3>
            <p>Learn the fundamentals of React with JavaScript first. Understand components, props, state, and event handling.</p>
          </div>
          <div className="tip-card">
            <h3>Then Learn TypeScript</h3>
            <p>Once comfortable with React, TypeScript adds type safety and better tooling support.</p>
          </div>
          <div className="tip-card">
            <h3>Compare Side by Side</h3>
            <p>Look at both versions to understand how TypeScript enhances JavaScript with types.</p>
          </div>
          <div className="tip-card">
            <h3>Practice Both</h3>
            <p>Try converting simple JavaScript components to TypeScript to see the benefits.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comparison;
