import React, { useState, useEffect } from "react";
import "./DataVisualizer.css";

// TypeScript interfaces for component props and data
interface DataVisualizerProps {
	dataSource?: string;
	chartType?: "bar" | "pie" | "line";
}

interface DataPoint {
	id: string;
	name: string;
	value: number;
	category: string;
	date: string;
	trend: "up" | "down";
	percentage: number;
}

interface Filters {
	category: "all" | string;
	dateRange: "all" | "week" | "month" | "year";
	minValue: number;
	maxValue: number;
}

interface DataStats {
	total: number;
	average: number;
	min: number;
	max: number;
}

interface CategoryData {
	[key: string]: number;
}

const DataVisualizerTS: React.FC<DataVisualizerProps> = ({
	dataSource = "default",
	chartType = "bar",
}) => {
	// TypeScript state with explicit typing
	const [data, setData] = useState<DataPoint[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedChart, setSelectedChart] = useState<"bar" | "pie" | "line">(
		chartType
	);
	const [filters, setFilters] = useState<Filters>({
		category: "all",
		dateRange: "all",
		minValue: 0,
		maxValue: 1000,
	});
	const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
	const [sortBy, setSortBy] = useState<keyof DataPoint>("value");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	// Generate sample data with type safety
	const generateSampleData = (): DataPoint[] => {
		const categories: string[] = [
			"Technology",
			"Healthcare",
			"Finance",
			"Education",
			"Retail",
			"Manufacturing",
		];
		const sampleData: DataPoint[] = [];

		for (let i = 0; i < 20; i++) {
			sampleData.push({
				id: `item_${i}`,
				name: `Item ${i + 1}`,
				value: Math.floor(Math.random() * 1000) + 100,
				category: categories[Math.floor(Math.random() * categories.length)],
				date: new Date(
					Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
				).toISOString(),
				trend: Math.random() > 0.5 ? "up" : "down",
				percentage: Math.random() * 100,
			});
		}

		return sampleData;
	};

	// Load data on component mount
	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true);
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 1000));

				if (dataSource === "default") {
					setData(generateSampleData());
				} else {
					setData(generateSampleData());
				}
			} catch (err) {
				setError("Failed to load data");
				console.error("Error loading data:", err);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [dataSource]);

	// Get filtered and sorted data
	const getFilteredAndSortedData = (): DataPoint[] => {
		let filteredData: DataPoint[] = [...data];

		// Apply category filter
		if (filters.category !== "all") {
			filteredData = filteredData.filter(
				(item: DataPoint) => item.category === filters.category
			);
		}

		// Apply date range filter
		if (filters.dateRange !== "all") {
			const now: Date = new Date();
			const daysAgo: number =
				filters.dateRange === "week"
					? 7
					: filters.dateRange === "month"
					? 30
					: 365;

			filteredData = filteredData.filter((item: DataPoint) => {
				const itemDate: Date = new Date(item.date);
				return (
					now.getTime() - itemDate.getTime() <= daysAgo * 24 * 60 * 60 * 1000
				);
			});
		}

		// Apply value range filter
		filteredData = filteredData.filter(
			(item: DataPoint) =>
				item.value >= filters.minValue && item.value <= filters.maxValue
		);

		// Sort data
		filteredData.sort((a: DataPoint, b: DataPoint) => {
			let aValue: any = a[sortBy];
			let bValue: any = b[sortBy];

			if (sortBy === "date") {
				aValue = new Date(aValue);
				bValue = new Date(bValue);
			}

			if (sortOrder === "asc") {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});

		return filteredData;
	};

	// Calculate statistics
	const getStats = (): DataStats => {
		const filteredData: DataPoint[] = getFilteredAndSortedData();
		const values: number[] = filteredData.map((item: DataPoint) => item.value);
		const sum: number = values.reduce(
			(acc: number, val: number) => acc + val,
			0
		);
		const avg: number = sum / values.length;
		const min: number = Math.min(...values);
		const max: number = Math.max(...values);

		return { total: sum, average: avg, min, max };
	};

	// Chart rendering functions with type safety
	const renderBarChart = () => {
		const maxValue: number = Math.max(
			...filteredData.map((item: DataPoint) => item.value)
		);

		return (
			<div className="bar-chart">
				{filteredData.map((item: DataPoint) => (
					<div key={item.id} className="bar-item">
						<div className="bar-label">{item.name}</div>
						<div
							className="bar"
							style={{
								width: `${(item.value / maxValue) * 100}%`,
								backgroundColor: item.trend === "up" ? "#4CAF50" : "#f44336",
							}}>
							<span className="bar-value">{item.value}</span>
						</div>
					</div>
				))}
			</div>
		);
	};

	const renderPieChart = () => {
		const filteredData: DataPoint[] = getFilteredAndSortedData();
		const categoryData: CategoryData = {};
		filteredData.forEach((item: DataPoint) => {
			categoryData[item.category] =
				(categoryData[item.category] || 0) + item.value;
		});

		const total: number = Object.values(categoryData).reduce(
			(acc: number, val: number) => acc + val,
			0
		);
		const colors: string[] = [
			"#FF6384",
			"#36A2EB",
			"#FFCE56",
			"#4BC0C0",
			"#9966FF",
			"#FF9F40",
		];

		return (
			<div className="pie-chart">
				{Object.entries(categoryData).map(
					([category, value], index: number) => {
						const percentage: string = ((value / total) * 100).toFixed(1);
						const color: string = colors[index % colors.length];

						return (
							<div key={category} className="pie-segment">
								<div
									className="pie-color"
									style={{ backgroundColor: color }}></div>
								<div className="pie-info">
									<span className="pie-category">{category}</span>
									<span className="pie-value">{value}</span>
									<span className="pie-percentage">{percentage}%</span>
								</div>
							</div>
						);
					}
				)}
			</div>
		);
	};

	const renderLineChart = () => {
		const sortedData: DataPoint[] = [...filteredData].sort(
			(a: DataPoint, b: DataPoint) =>
				new Date(a.date).getTime() - new Date(b.date).getTime()
		);

		return (
			<div className="line-chart">
				{sortedData.map((item: DataPoint, index: number) => (
					<div key={item.id} className="line-point">
						<div
							className="point"
							style={{
								left: `${(index / (sortedData.length - 1)) * 100}%`,
								bottom: `${(item.value / 1000) * 100}%`,
							}}
							title={`${item.name}: ${item.value}`}></div>
						{index > 0 && (
							<div
								className="line"
								style={{
									left: `${((index - 1) / (sortedData.length - 1)) * 100}%`,
									width: `${100 / (sortedData.length - 1)}%`,
									bottom: `${(item.value / 1000) * 100}%`,
								}}></div>
						)}
					</div>
				))}
			</div>
		);
	};

	const renderChart = () => {
		switch (selectedChart) {
			case "bar":
				return renderBarChart();
			case "pie":
				return renderPieChart();
			case "line":
				return renderLineChart();
			default:
				return renderBarChart();
		}
	};

	// Event handlers
	const handleFilterChange = (filterType: keyof Filters, value: any): void => {
		setFilters((prev: Filters) => ({ ...prev, [filterType]: value }));
	};

	const toggleSortOrder = (): void => {
		setSortOrder((prev: "asc" | "desc") => (prev === "asc" ? "desc" : "asc"));
	};

	const handleChartTypeChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	): void => {
		setSelectedChart(e.target.value as "bar" | "pie" | "line");
	};

	const handleCategoryFilterChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	): void => {
		handleFilterChange("category", e.target.value);
	};

	const handleDateRangeFilterChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	): void => {
		handleFilterChange(
			"dateRange",
			e.target.value as "all" | "week" | "month" | "year"
		);
	};

	const handleMinValueChange = (
		e: React.ChangeEvent<HTMLInputElement>
	): void => {
		handleFilterChange("minValue", parseInt(e.target.value) || 0);
	};

	const handleMaxValueChange = (
		e: React.ChangeEvent<HTMLInputElement>
	): void => {
		handleFilterChange("maxValue", parseInt(e.target.value) || 1000);
	};

	const handleSortByChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	): void => {
		setSortBy(e.target.value as keyof DataPoint);
	};

	// Get filtered data for rendering
	const filteredData: DataPoint[] = getFilteredAndSortedData();
	const stats: DataStats = getStats();

	if (loading) {
		return <div className="data-visualizer">Loading data...</div>;
	}

	if (error) {
		return <div className="data-visualizer">Error: {error}</div>;
	}

	return (
		<div className="data-visualizer">
			<div className="visualizer-header">
				<h2>Data Visualization Tool</h2>
				<p>Explore and analyze your data with interactive charts</p>
			</div>

			<div className="controls-section">
				<div className="view-toggle">
					<button
						className={viewMode === "chart" ? "active" : ""}
						onClick={() => setViewMode("chart")}>
						Chart View
					</button>
					<button
						className={viewMode === "table" ? "active" : ""}
						onClick={() => setViewMode("table")}>
						Table View
					</button>
				</div>

				<div className="chart-type-selector">
					<label>Chart Type:</label>
					<select value={selectedChart} onChange={handleChartTypeChange}>
						<option value="bar">Bar Chart</option>
						<option value="pie">Pie Chart</option>
						<option value="line">Line Chart</option>
					</select>
				</div>

				<div className="filter-controls">
					<select
						value={filters.category}
						onChange={handleCategoryFilterChange}>
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
						onChange={handleDateRangeFilterChange}>
						<option value="all">All Time</option>
						<option value="week">Last Week</option>
						<option value="month">Last Month</option>
						<option value="year">Last Year</option>
					</select>

					<input
						type="number"
						placeholder="Min Value"
						value={filters.minValue}
						onChange={handleMinValueChange}
					/>
					<input
						type="number"
						placeholder="Max Value"
						value={filters.maxValue}
						onChange={handleMaxValueChange}
					/>

					<select value={sortBy} onChange={handleSortByChange}>
						<option value="value">Sort by Value</option>
						<option value="name">Sort by Name</option>
						<option value="category">Sort by Category</option>
						<option value="date">Sort by Date</option>
					</select>

					<button onClick={toggleSortOrder} className="sort-order-btn">
						{sortOrder === "asc" ? "↑" : "↓"}
					</button>
				</div>
			</div>

			<div className="stats-section">
				<div className="stat-item">
					<span className="stat-number">{stats.total}</span>
					<span className="stat-label">Total Value</span>
				</div>
				<div className="stat-item">
					<span className="stat-number">{stats.average.toFixed(0)}</span>
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

			<div className="visualization-area">
				{viewMode === "chart" ? (
					<div className="chart-container">{renderChart()}</div>
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
								</tr>
							</thead>
							<tbody>
								{filteredData.map((item: DataPoint) => (
									<tr key={item.id}>
										<td>{item.name}</td>
										<td>{item.value}</td>
										<td>{item.category}</td>
										<td>{new Date(item.date).toLocaleDateString()}</td>
										<td>
											<span className={`trend ${item.trend}`}>
												{item.trend === "up" ? "↗" : "↘"}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<div className="typescript-features">
				<h3>TypeScript Features Used:</h3>
				<ul>
					<li>
						<strong>Type Safety:</strong> All data structures have defined
						interfaces
					</li>
					<li>
						<strong>Union Types:</strong> Chart types and filter values use
						specific literals
					</li>
					<li>
						<strong>Generic State:</strong> useState hooks with explicit typing
					</li>
					<li>
						<strong>Event Handler Types:</strong> React events are properly
						typed
					</li>
					<li>
						<strong>Array Methods:</strong> Type-safe filtering, mapping, and
						sorting
					</li>
					<li>
						<strong>Interface Contracts:</strong> Clear structure for data
						points and filters
					</li>
					<li>
						<strong>Key Safety:</strong> Object property access is type-checked
					</li>
				</ul>
			</div>
		</div>
	);
};

export default DataVisualizerTS;
