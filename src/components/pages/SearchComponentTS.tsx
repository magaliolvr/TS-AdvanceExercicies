import React, { useState, useEffect } from "react";
import "./SearchComponent.css";

// TypeScript interfaces for component props and data
interface SearchComponentProps {
	searchId?: string;
	initialData?: SearchItem[];
}

interface SearchItem {
	id: string;
	title: string;
	description: string;
	type: "document" | "image" | "video" | "audio" | "link";
	category: string;
	tags: string[];
	url: string;
	createdAt: string;
	updatedAt: string;
	relevance: number;
}

interface SearchState {
	searchTerm: string;
	searchResults: SearchItem[];
	searchHistory: string[];
	filterType: "all" | "document" | "image" | "video" | "audio" | "link";
	filterCategory: string;
	sortBy: "relevance" | "updatedAt" | "title";
	sortOrder: "asc" | "desc";
	viewMode: "list" | "grid";
	showSuggestions: boolean;
}

const SearchComponentTS: React.FC<SearchComponentProps> = ({
	searchId = "search123",
	initialData = [],
}) => {
	// TypeScript state with explicit typing
	const [searchState, setSearchState] = useState<SearchState>({
		searchTerm: "",
		searchResults: [],
		searchHistory: [],
		filterType: "all",
		filterCategory: "",
		sortBy: "relevance",
		sortOrder: "desc",
		viewMode: "list",
		showSuggestions: false,
	});
	const [isSearching, setIsSearching] = useState<boolean>(false);
	const [searchStats, setSearchStats] = useState({
		totalResults: 0,
		searchTime: 0,
		lastSearch: "",
	});

	// Load search history from localStorage on component mount
	useEffect(() => {
		const savedHistory = localStorage.getItem(`search_history_${searchId}`);
		if (savedHistory) {
			try {
				const parsedHistory: string[] = JSON.parse(savedHistory);
				setSearchState((prev: SearchState) => ({
					...prev,
					searchHistory: parsedHistory,
				}));
			} catch (error) {
				console.error("Error parsing saved search history:", error);
			}
		}
	}, [searchId]);

	// Save search history to localStorage
	useEffect(() => {
		localStorage.setItem(
			`search_history_${searchId}`,
			JSON.stringify(searchState.searchHistory)
		);
	}, [searchState.searchHistory, searchId]);

	// Generate sample search data
	const generateSampleData = (): SearchItem[] => {
		const sampleData: SearchItem[] = [];
		const types: SearchItem["type"][] = [
			"document",
			"image",
			"video",
			"audio",
			"link",
		];
		const categories: string[] = [
			"Technology",
			"Science",
			"Arts",
			"History",
			"Sports",
			"Business",
		];
		const sampleTitles: string[] = [
			"Introduction to React",
			"JavaScript Fundamentals",
			"CSS Grid Layout",
			"TypeScript Basics",
			"Web Development Best Practices",
			"Responsive Design",
			"API Integration",
			"State Management",
			"Component Architecture",
			"Testing Strategies",
		];

		for (let i = 0; i < 50; i++) {
			const type: SearchItem["type"] =
				types[Math.floor(Math.random() * types.length)];
			const category: string =
				categories[Math.floor(Math.random() * categories.length)];
			const title: string =
				sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
			const tags: string[] = [
				"web development",
				"programming",
				"frontend",
				"javascript",
				"react",
				"typescript",
			].slice(0, Math.floor(Math.random() * 4) + 2);

			sampleData.push({
				id: `item_${i}`,
				title: `${title} ${i + 1}`,
				description: `This is a sample ${type} about ${title.toLowerCase()}. It contains useful information for developers.`,
				type,
				category,
				tags,
				url: `https://example.com/${type}/${i}`,
				createdAt: new Date(
					Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
				).toISOString(),
				updatedAt: new Date(
					Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
				).toISOString(),
				relevance: Math.floor(Math.random() * 100) + 1,
			});
		}

		return sampleData;
	};

	// Perform search
	const performSearch = async (query: string): Promise<void> => {
		if (!query.trim()) {
			setSearchState((prev: SearchState) => ({
				...prev,
				searchResults: [],
			}));
			return;
		}

		setIsSearching(true);
		const startTime: number = Date.now();

		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Generate sample data for demonstration
		const allData: SearchItem[] = generateSampleData();
		const queryLower: string = query.toLowerCase();

		// Simple search algorithm
		const results: SearchItem[] = allData
			.filter((item: SearchItem) => {
				const matchesTitle: boolean = item.title
					.toLowerCase()
					.includes(queryLower);
				const matchesDescription: boolean = item.description
					.toLowerCase()
					.includes(queryLower);
				const matchesTags: boolean = item.tags.some((tag: string) =>
					tag.toLowerCase().includes(queryLower)
				);
				const matchesCategory: boolean = item.category
					.toLowerCase()
					.includes(queryLower);

				return (
					matchesTitle || matchesDescription || matchesTags || matchesCategory
				);
			})
			.map((item: SearchItem) => ({
				...item,
				relevance: calculateRelevance(item, queryLower),
			}))
			.sort((a: SearchItem, b: SearchItem) => b.relevance - a.relevance);

		const searchTime: number = Date.now() - startTime;

		setSearchState((prev: SearchState) => ({
			...prev,
			searchResults: results,
		}));

		setSearchStats({
			totalResults: results.length,
			searchTime,
			lastSearch: query,
		});

		setIsSearching(false);

		// Add to search history
		if (!searchState.searchHistory.includes(query)) {
			setSearchState((prev: SearchState) => ({
				...prev,
				searchHistory: [query, ...prev.searchHistory.slice(0, 9)],
			}));
		}
	};

	// Calculate search relevance
	const calculateRelevance = (item: SearchItem, query: string): number => {
		let relevance: number = 0;

		// Title matches get highest weight
		if (item.title.toLowerCase().includes(query)) {
			relevance += 50;
		}

		// Description matches
		if (item.description.toLowerCase().includes(query)) {
			relevance += 20;
		}

		// Tag matches
		item.tags.forEach((tag: string) => {
			if (tag.toLowerCase().includes(query)) {
				relevance += 15;
			}
		});

		// Category matches
		if (item.category.toLowerCase().includes(query)) {
			relevance += 10;
		}

		// Recency bonus
		const daysSinceUpdate: number =
			(Date.now() - new Date(item.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
		if (daysSinceUpdate < 30) {
			relevance += 5;
		}

		return relevance;
	};

	// Handle search input change
	const handleSearchInputChange = (
		e: React.ChangeEvent<HTMLInputElement>
	): void => {
		const value: string = e.target.value;
		setSearchState((prev: SearchState) => ({
			...prev,
			searchTerm: value,
			showSuggestions: value.length > 0,
		}));

		// Auto-search after delay
		if (value.trim()) {
			setTimeout(() => {
				performSearch(value);
			}, 300);
		} else {
			setSearchState((prev: SearchState) => ({
				...prev,
				searchResults: [],
			}));
		}
	};

	// Handle search form submission
	const handleSearchSubmit = (e: React.FormEvent): void => {
		e.preventDefault();
		performSearch(searchState.searchTerm);
		setSearchState((prev: SearchState) => ({
			...prev,
			showSuggestions: false,
		}));
	};

	// Get filtered and sorted results
	const getFilteredAndSortedResults = (): SearchItem[] => {
		let filtered: SearchItem[] = searchState.searchResults;

		// Apply type filter
		if (searchState.filterType !== "all") {
			filtered = filtered.filter(
				(item: SearchItem) => item.type === searchState.filterType
			);
		}

		// Apply category filter
		if (searchState.filterCategory) {
			filtered = filtered.filter((item: SearchItem) =>
				item.category
					.toLowerCase()
					.includes(searchState.filterCategory.toLowerCase())
			);
		}

		// Apply sorting
		filtered.sort((a: SearchItem, b: SearchItem) => {
			let aValue: any;
			let bValue: any;

			switch (searchState.sortBy) {
				case "relevance":
					aValue = a.relevance;
					bValue = b.relevance;
					break;
				case "updatedAt":
					aValue = new Date(a.updatedAt).getTime();
					bValue = new Date(b.updatedAt).getTime();
					break;
				case "title":
					aValue = a.title.toLowerCase();
					bValue = b.title.toLowerCase();
					break;
				default:
					return 0;
			}

			if (searchState.sortOrder === "asc") {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});

		return filtered;
	};

	// Get search suggestions
	const getSearchSuggestions = (): string[] => {
		const suggestions: string[] = [];
		const query: string = searchState.searchTerm.toLowerCase();

		// Add from search history
		searchState.searchHistory.forEach((term: string) => {
			if (term.toLowerCase().includes(query) && !suggestions.includes(term)) {
				suggestions.push(term);
			}
		});

		// Add common search terms
		const commonTerms: string[] = [
			"react tutorial",
			"javascript basics",
			"typescript examples",
			"css grid",
			"web development",
			"frontend framework",
			"state management",
			"component design",
		];

		commonTerms.forEach((term: string) => {
			if (term.toLowerCase().includes(query) && !suggestions.includes(term)) {
				suggestions.push(term);
			}
		});

		return suggestions.slice(0, 5);
	};

	// Clear search
	const clearSearch = (): void => {
		setSearchState((prev: SearchState) => ({
			...prev,
			searchTerm: "",
			searchResults: [],
		}));
		setSearchStats({
			totalResults: 0,
			searchTime: 0,
			lastSearch: "",
		});
	};

	// Get unique categories from results
	const getUniqueCategories = (): string[] => {
		const categories: string[] = searchState.searchResults.map(
			(item: SearchItem) => item.category
		);
		return Array.from(new Set(categories)).sort();
	};

	const filteredResults: SearchItem[] = getFilteredAndSortedResults();
	const suggestions: string[] = getSearchSuggestions();
	const categories: string[] = getUniqueCategories();

	return (
		<div className="search-component">
			<div className="search-header">
				<h2>Search Interface</h2>
				<p>Search ID: {searchId}</p>
			</div>

			<div className="search-form">
				<form onSubmit={handleSearchSubmit}>
					<div className="search-input-container">
						<input
							type="text"
							value={searchState.searchTerm}
							onChange={handleSearchInputChange}
							placeholder="Search for anything..."
							className="search-input"
							autoFocus
						/>
						<button type="submit" className="search-btn">
							🔍 Search
						</button>
						{searchState.searchTerm && (
							<button
								type="button"
								onClick={clearSearch}
								className="clear-search-btn">
								×
							</button>
						)}
					</div>
				</form>

				{searchState.showSuggestions && suggestions.length > 0 && (
					<div className="search-suggestions">
						{suggestions.map((suggestion: string, index: number) => (
							<div
								key={index}
								className="suggestion-item"
								onClick={() => {
									setSearchState((prev: SearchState) => ({
										...prev,
										searchTerm: suggestion,
										showSuggestions: false,
									}));
									performSearch(suggestion);
								}}>
								{suggestion}
							</div>
						))}
					</div>
				)}
			</div>

			{searchState.searchResults.length > 0 && (
				<div className="search-controls">
					<div className="filter-controls">
						<select
							value={searchState.filterType}
							onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
								setSearchState((prev: SearchState) => ({
									...prev,
									filterType: e.target.value as SearchItem["type"],
								}))
							}
							className="filter-select">
							<option value="all">All Types</option>
							<option value="document">Documents</option>
							<option value="image">Images</option>
							<option value="video">Videos</option>
							<option value="audio">Audio</option>
							<option value="link">Links</option>
						</select>

						<select
							value={searchState.filterCategory}
							onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
								setSearchState((prev: SearchState) => ({
									...prev,
									filterCategory: e.target.value,
								}))
							}
							className="filter-select">
							<option value="">All Categories</option>
							{categories.map((category: string) => (
								<option key={category} value={category}>
									{category}
								</option>
							))}
						</select>
					</div>

					<div className="sort-controls">
						<select
							value={searchState.sortBy}
							onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
								setSearchState((prev: SearchState) => ({
									...prev,
									sortBy: e.target.value as "relevance" | "updatedAt" | "title",
								}))
							}
							className="sort-select">
							<option value="relevance">Sort by Relevance</option>
							<option value="updatedAt">Sort by Date</option>
							<option value="title">Sort by Title</option>
						</select>

						<button
							onClick={() =>
								setSearchState((prev: SearchState) => ({
									...prev,
									sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
								}))
							}
							className="sort-order-btn">
							{searchState.sortOrder === "asc" ? "↑" : "↓"}
						</button>
					</div>

					<div className="view-controls">
						<button
							className={searchState.viewMode === "list" ? "active" : ""}
							onClick={() =>
								setSearchState((prev: SearchState) => ({
									...prev,
									viewMode: "list",
								}))
							}>
							List
						</button>
						<button
							className={searchState.viewMode === "grid" ? "active" : ""}
							onClick={() =>
								setSearchState((prev: SearchState) => ({
									...prev,
									viewMode: "grid",
								}))
							}>
							Grid
						</button>
					</div>
				</div>
			)}

			{searchStats.totalResults > 0 && (
				<div className="search-stats">
					<div className="stat-item">
						<span className="stat-number">{searchStats.totalResults}</span>
						<span className="stat-label">Results</span>
					</div>
					<div className="stat-item">
						<span className="stat-number">{searchStats.searchTime}ms</span>
						<span className="stat-label">Search Time</span>
					</div>
					<div className="stat-item">
						<span className="stat-number">{filteredResults.length}</span>
						<span className="stat-label">Filtered</span>
					</div>
					<div className="stat-item">
						<span className="stat-number">
							{searchState.searchHistory.length}
						</span>
						<span className="stat-label">History</span>
					</div>
				</div>
			)}

			{isSearching && (
				<div className="searching-indicator">
					<span>Searching...</span>
				</div>
			)}

			<div className="search-results">
				{filteredResults.length === 0 && searchState.searchTerm ? (
					<div className="no-results">
						<p>No results found for "{searchState.searchTerm}"</p>
						<p>Try different keywords or check your spelling.</p>
					</div>
				) : (
					<div className={`results-container ${searchState.viewMode}`}>
						{filteredResults.map((result: SearchItem) => (
							<div key={result.id} className="result-item">
								<div className="result-icon">
									{result.type === "document" && "📄"}
									{result.type === "image" && "🖼️"}
									{result.type === "video" && "🎥"}
									{result.type === "audio" && "🎵"}
									{result.type === "link" && "🔗"}
								</div>

								<div className="result-content">
									<h3 className="result-title">
										<a
											href={result.url}
											target="_blank"
											rel="noopener noreferrer">
											{result.title}
										</a>
									</h3>
									<p className="result-description">{result.description}</p>
									<div className="result-meta">
										<span className="result-type">{result.type}</span>
										<span className="result-category">{result.category}</span>
										<span className="result-date">
											{new Date(result.updatedAt).toLocaleDateString()}
										</span>
										<span className="result-relevance">
											Relevance: {result.relevance}%
										</span>
									</div>
									<div className="result-tags">
										{result.tags.map((tag: string, index: number) => (
											<span key={index} className="result-tag">
												{tag}
											</span>
										))}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{searchState.searchHistory.length > 0 && (
				<div className="search-history">
					<h3>Recent Searches</h3>
					<div className="history-items">
						{searchState.searchHistory.map((term: string, index: number) => (
							<button
								key={index}
								onClick={() => {
									setSearchState((prev: SearchState) => ({
										...prev,
										searchTerm: term,
									}));
									performSearch(term);
								}}
								className="history-item">
								{term}
							</button>
						))}
					</div>
				</div>
			)}

			<div className="typescript-features">
				<h3>TypeScript Features Used:</h3>
				<ul>
					<li>
						<strong>Type Safety:</strong> All search properties have defined
						interfaces
					</li>
					<li>
						<strong>Union Types:</strong> Item types and sort options use
						specific string literals
					</li>
					<li>
						<strong>Interface Contracts:</strong> Clear structure for search
						items and search state
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
						<strong>Key Safety:</strong> Object property access is type-checked
					</li>
				</ul>
			</div>
		</div>
	);
};

export default SearchComponentTS;
