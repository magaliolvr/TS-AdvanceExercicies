import React, { useState } from "react";
import "./Welcome.css";

// TypeScript interface for component props
interface WelcomeProps {
	userName?: string;
	courseName?: string;
}

// TypeScript interface for demo item data
interface DemoItem {
	id: string;
	title: string;
	description: string;
}

const WelcomeTS: React.FC<WelcomeProps> = ({
	userName = "",
	courseName = "",
}) => {
	// TypeScript automatically infers the types from useState
	const [clickCount, setClickCount] = useState<number>(0);
	const [isVisible, setIsVisible] = useState<boolean>(true);

	// TypeScript ensures type safety for event handlers
	const handleButtonClick = (): void => {
		setClickCount((prevCount: number) => prevCount + 1);
	};

	const toggleVisibility = (): void => {
		setIsVisible((prevState: boolean) => !prevState);
	};

	const resetCounter = (): void => {
		setClickCount(0);
	};

	// Example of typed data structure
	const demoItems: DemoItem[] = [
		{
			id: "counter",
			title: "Button Click Counter",
			description: "You've clicked the button",
		},
		{
			id: "toggle",
			title: "Toggle Visibility",
			description: "This content can be toggled on and off!",
		},
		{
			id: "props",
			title: "Props Example",
			description: "These values come from props passed to the component.",
		},
	];

	return (
		<div className="welcome-container">
			<div className="welcome-header">
				<h1>Welcome to {courseName}!</h1>
				<p>Hello, {userName}! This is a TypeScript React component.</p>
				<div className="typescript-badge">
					<span>TypeScript</span>
				</div>
			</div>

			<div className="welcome-content">
				<div className="demo-section">
					<h2>Interactive Demo (TypeScript Version)</h2>

					<div className="demo-item">
						<h3>{demoItems[0].title}</h3>
						<p>
							{demoItems[0].description} {clickCount} times
						</p>
						<button onClick={handleButtonClick} className="demo-button">
							Click Me!
						</button>
						<button onClick={resetCounter} className="demo-button secondary">
							Reset Counter
						</button>
					</div>

					<div className="demo-item">
						<h3>{demoItems[1].title}</h3>
						<button onClick={toggleVisibility} className="demo-button">
							{isVisible ? "Hide" : "Show"} Content
						</button>
						{isVisible && (
							<div className="toggle-content">
								<p>{demoItems[1].description}</p>
								<p>It demonstrates React state management with TypeScript.</p>
							</div>
						)}
					</div>

					<div className="demo-item">
						<h3>{demoItems[2].title}</h3>
						<p>
							Your name: <strong>{userName}</strong>
						</p>
						<p>
							Course: <strong>{courseName}</strong>
						</p>
						<p>{demoItems[2].description}</p>
					</div>
				</div>

				<div className="info-section">
					<h2>TypeScript Benefits Demonstrated</h2>
					<ul>
						<li>
							<strong>Type Safety:</strong> Props and state have defined types
						</li>
						<li>
							<strong>Interface Definitions:</strong> Clear contracts for data
							structures
						</li>
						<li>
							<strong>Function Signatures:</strong> Explicit return types and
							parameters
						</li>
						<li>
							<strong>IntelliSense:</strong> Better IDE support and autocomplete
						</li>
						<li>
							<strong>Error Prevention:</strong> Catch bugs at compile time
						</li>
						<li>
							<strong>Code Documentation:</strong> Types serve as inline
							documentation
						</li>
					</ul>
				</div>

				<div className="comparison-section">
					<h2>JavaScript vs TypeScript</h2>
					<div className="comparison-grid">
						<div className="comparison-item">
							<h4>JavaScript</h4>
							<ul>
								<li>Dynamic typing</li>
								<li>Runtime error checking</li>
								<li>Faster development (no compilation)</li>
								<li>More flexible</li>
							</ul>
						</div>
						<div className="comparison-item">
							<h4>TypeScript</h4>
							<ul>
								<li>Static typing</li>
								<li>Compile-time error checking</li>
								<li>Better tooling and IDE support</li>
								<li>More maintainable for large projects</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WelcomeTS;
