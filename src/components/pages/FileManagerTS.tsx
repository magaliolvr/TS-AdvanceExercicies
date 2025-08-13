import React, { useState, useEffect } from "react";
import "./FileManager.css";

// TypeScript interfaces for component props and data
interface FileManagerProps {
	userId?: string;
	initialFiles?: FileItem[];
}

interface FileItem {
	id: string;
	name: string;
	type: "file" | "folder";
	size: number;
	createdAt: string;
	modifiedAt: string;
	path: string;
	extension?: string;
}

interface FileManagerState {
	files: FileItem[];
	currentPath: string;
	selectedFiles: string[];
	viewMode: "grid" | "list";
	searchTerm: string;
	sortBy: "name" | "size" | "createdAt" | "modifiedAt";
	sortOrder: "asc" | "desc";
}

const FileManagerTS: React.FC<FileManagerProps> = ({
	userId = "user123",
	initialFiles = [],
}) => {
	// TypeScript state with explicit typing
	const [fileManagerState, setFileManagerState] = useState<FileManagerState>({
		files: initialFiles,
		currentPath: "/",
		selectedFiles: [],
		viewMode: "grid",
		searchTerm: "",
		sortBy: "name",
		sortOrder: "asc",
	});
	const [showCreateFolder, setShowCreateFolder] = useState<boolean>(false);
	const [newFolderName, setNewFolderName] = useState<string>("");
	const [showUpload, setShowUpload] = useState<boolean>(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	// Load files from localStorage on component mount
	useEffect(() => {
		const savedFiles = localStorage.getItem(`files_${userId}`);
		if (savedFiles && initialFiles.length === 0) {
			try {
				const parsedFiles: FileItem[] = JSON.parse(savedFiles);
				setFileManagerState((prev: FileManagerState) => ({
					...prev,
					files: parsedFiles,
				}));
			} catch (error) {
				console.error("Error parsing saved files:", error);
			}
		}
	}, [userId, initialFiles]);

	// Save files to localStorage
	useEffect(() => {
		localStorage.setItem(
			`files_${userId}`,
			JSON.stringify(fileManagerState.files)
		);
	}, [fileManagerState.files, userId]);

	// Create a new folder
	const createFolder = (): void => {
		if (newFolderName.trim()) {
			const folder: FileItem = {
				id: Date.now().toString(),
				name: newFolderName.trim(),
				type: "folder",
				size: 0,
				createdAt: new Date().toISOString(),
				modifiedAt: new Date().toISOString(),
				path: `${fileManagerState.currentPath}${newFolderName.trim()}/`,
			};

			setFileManagerState((prev: FileManagerState) => ({
				...prev,
				files: [...prev.files, folder],
			}));
			setNewFolderName("");
			setShowCreateFolder(false);
		}
	};

	// Upload a file
	const uploadFile = (): void => {
		if (selectedFile) {
			const fileItem: FileItem = {
				id: Date.now().toString(),
				name: selectedFile.name,
				type: "file",
				size: selectedFile.size,
				createdAt: new Date().toISOString(),
				modifiedAt: new Date().toISOString(),
				path: `${fileManagerState.currentPath}${selectedFile.name}`,
				extension: selectedFile.name.split(".").pop() || "",
			};

			setFileManagerState((prev: FileManagerState) => ({
				...prev,
				files: [...prev.files, fileItem],
			}));
			setSelectedFile(null);
			setShowUpload(false);
		}
	};

	// Delete files or folders
	const deleteItems = (): void => {
		setFileManagerState((prev: FileManagerState) => ({
			...prev,
			files: prev.files.filter(
				(file: FileItem) => !prev.selectedFiles.includes(file.id)
			),
			selectedFiles: [],
		}));
	};

	// Rename a file or folder
	const renameItem = (id: string, newName: string): void => {
		setFileManagerState((prev: FileManagerState) => ({
			...prev,
			files: prev.files.map((file: FileItem) => {
				if (file.id === id) {
					return {
						...file,
						name: newName,
						modifiedAt: new Date().toISOString(),
						path:
							file.type === "folder"
								? `${file.path.split("/").slice(0, -2).join("/")}/${newName}/`
								: `${file.path.split("/").slice(0, -1).join("/")}/${newName}`,
					};
				}
				return file;
			}),
		}));
	};

	// Navigate to a folder
	const navigateToFolder = (path: string): void => {
		setFileManagerState((prev: FileManagerState) => ({
			...prev,
			currentPath: path,
			selectedFiles: [],
		}));
	};

	// Navigate back
	const navigateBack = (): void => {
		const pathParts: string[] = fileManagerState.currentPath
			.split("/")
			.filter(Boolean);
		if (pathParts.length > 0) {
			pathParts.pop();
			const newPath: string =
				pathParts.length > 0 ? `/${pathParts.join("/")}/` : "/";
			setFileManagerState((prev: FileManagerState) => ({
				...prev,
				currentPath: newPath,
				selectedFiles: [],
			}));
		}
	};

	// Select or deselect a file
	const toggleFileSelection = (fileId: string): void => {
		setFileManagerState((prev: FileManagerState) => ({
			...prev,
			selectedFiles: prev.selectedFiles.includes(fileId)
				? prev.selectedFiles.filter((id: string) => id !== fileId)
				: [...prev.selectedFiles, fileId],
		}));
	};

	// Select all files in current view
	const selectAll = (): void => {
		const currentFiles: FileItem[] = getCurrentPathFiles();
		setFileManagerState((prev: FileManagerState) => ({
			...prev,
			selectedFiles: currentFiles.map((file: FileItem) => file.id),
		}));
	};

	// Clear selection
	const clearSelection = (): void => {
		setFileManagerState((prev: FileManagerState) => ({
			...prev,
			selectedFiles: [],
		}));
	};

	// Get files for current path
	const getCurrentPathFiles = (): FileItem[] => {
		return fileManagerState.files.filter((file: FileItem) => {
			const filePath: string = file.path;
			const currentPath: string = fileManagerState.currentPath;

			if (file.type === "folder") {
				return filePath === currentPath;
			} else {
				const fileDir: string = filePath.substring(
					0,
					filePath.lastIndexOf("/") + 1
				);
				return fileDir === currentPath;
			}
		});
	};

	// Get filtered and sorted files
	const getFilteredAndSortedFiles = (): FileItem[] => {
		let filtered: FileItem[] = getCurrentPathFiles();

		// Apply search filter
		if (fileManagerState.searchTerm) {
			filtered = filtered.filter((file: FileItem) =>
				file.name
					.toLowerCase()
					.includes(fileManagerState.searchTerm.toLowerCase())
			);
		}

		// Apply sorting
		filtered.sort((a: FileItem, b: FileItem) => {
			let aValue: any = a[fileManagerState.sortBy];
			let bValue: any = b[fileManagerState.sortBy];

			if (fileManagerState.sortBy === "size") {
				aValue = aValue || 0;
				bValue = bValue || 0;
			} else if (
				fileManagerState.sortBy === "createdAt" ||
				fileManagerState.sortBy === "modifiedAt"
			) {
				aValue = new Date(aValue).getTime();
				bValue = new Date(bValue).getTime();
			}

			if (fileManagerState.sortOrder === "asc") {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});

		return filtered;
	};

	// Get file statistics
	const getFileStats = () => {
		const currentFiles: FileItem[] = getCurrentPathFiles();
		const totalItems: number = currentFiles.length;
		const folders: number = currentFiles.filter(
			(f: FileItem) => f.type === "folder"
		).length;
		const files: number = totalItems - folders;
		const totalSize: number = currentFiles.reduce(
			(sum: number, f: FileItem) => sum + (f.size || 0),
			0
		);
		const selectedCount: number = fileManagerState.selectedFiles.length;

		return { totalItems, folders, files, totalSize, selectedCount };
	};

	// Format file size
	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 B";
		const k: number = 1024;
		const sizes: string[] = ["B", "KB", "MB", "GB"];
		const i: number = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
	};

	// Handle file selection for upload
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const file: File | null = e.target.files?.[0] || null;
		setSelectedFile(file);
	};

	// Handle key press for creating folder
	const handleFolderKeyPress = (
		e: React.KeyboardEvent<HTMLInputElement>
	): void => {
		if (e.key === "Enter") {
			createFolder();
		}
	};

	const filteredFiles: FileItem[] = getFilteredAndSortedFiles();
	const stats = getFileStats();

	return (
		<div className="file-manager">
			<div className="file-manager-header">
				<h2>File Manager</h2>
				<p>User ID: {userId}</p>
			</div>

			<div className="file-manager-controls">
				<div className="navigation-controls">
					<button
						onClick={navigateBack}
						disabled={fileManagerState.currentPath === "/"}>
						← Back
					</button>
					<span className="current-path">{fileManagerState.currentPath}</span>
				</div>

				<div className="action-controls">
					<button
						onClick={() => setShowCreateFolder(true)}
						className="create-folder-btn">
						📁 New Folder
					</button>
					<button onClick={() => setShowUpload(true)} className="upload-btn">
						📤 Upload File
					</button>
					<button
						onClick={deleteItems}
						disabled={fileManagerState.selectedFiles.length === 0}
						className="delete-btn">
						🗑️ Delete
					</button>
				</div>

				<div className="view-controls">
					<button
						className={fileManagerState.viewMode === "grid" ? "active" : ""}
						onClick={() =>
							setFileManagerState((prev) => ({ ...prev, viewMode: "grid" }))
						}>
						Grid
					</button>
					<button
						className={fileManagerState.viewMode === "list" ? "active" : ""}
						onClick={() =>
							setFileManagerState((prev) => ({ ...prev, viewMode: "list" }))
						}>
						List
					</button>
				</div>
			</div>

			<div className="file-manager-toolbar">
				<div className="search-sort">
					<input
						type="text"
						value={fileManagerState.searchTerm}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setFileManagerState((prev) => ({
								...prev,
								searchTerm: e.target.value,
							}))
						}
						placeholder="Search files..."
						className="search-input"
					/>

					<select
						value={fileManagerState.sortBy}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
							setFileManagerState((prev) => ({
								...prev,
								sortBy: e.target.value as
									| "name"
									| "size"
									| "createdAt"
									| "modifiedAt",
							}))
						}
						className="sort-select">
						<option value="name">Sort by Name</option>
						<option value="size">Sort by Size</option>
						<option value="createdAt">Sort by Created</option>
						<option value="modifiedAt">Sort by Modified</option>
					</select>

					<button
						onClick={() =>
							setFileManagerState((prev) => ({
								...prev,
								sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
							}))
						}
						className="sort-order-btn">
						{fileManagerState.sortOrder === "asc" ? "↑" : "↓"}
					</button>
				</div>

				<div className="selection-controls">
					<button onClick={selectAll} className="select-all-btn">
						Select All
					</button>
					<button onClick={clearSelection} className="clear-selection-btn">
						Clear Selection
					</button>
					{stats.selectedCount > 0 && (
						<span className="selected-count">
							{stats.selectedCount} selected
						</span>
					)}
				</div>
			</div>

			<div className="file-manager-stats">
				<div className="stat-item">
					<span className="stat-number">{stats.totalItems}</span>
					<span className="stat-label">Total Items</span>
				</div>
				<div className="stat-item">
					<span className="stat-number">{stats.folders}</span>
					<span className="stat-label">Folders</span>
				</div>
				<div className="stat-item">
					<span className="stat-number">{stats.files}</span>
					<span className="stat-label">Files</span>
				</div>
				<div className="stat-item">
					<span className="stat-number">{formatFileSize(stats.totalSize)}</span>
					<span className="stat-label">Total Size</span>
				</div>
			</div>

			<div className="file-manager-content">
				{filteredFiles.length === 0 ? (
					<div className="no-files">
						<p>No files found in this location.</p>
					</div>
				) : (
					<div className={`files-container ${fileManagerState.viewMode}`}>
						{filteredFiles.map((file: FileItem) => (
							<div
								key={file.id}
								className={`file-item ${file.type} ${
									fileManagerState.selectedFiles.includes(file.id)
										? "selected"
										: ""
								}`}
								onClick={() => toggleFileSelection(file.id)}
								onDoubleClick={() => {
									if (file.type === "folder") {
										navigateToFolder(file.path);
									}
								}}>
								<div className="file-icon">
									{file.type === "folder" ? "📁" : "📄"}
								</div>
								<div className="file-info">
									<div className="file-name">{file.name}</div>
									<div className="file-details">
										{file.type === "file" && (
											<span className="file-size">
												{formatFileSize(file.size)}
											</span>
										)}
										<span className="file-date">
											{new Date(file.modifiedAt).toLocaleDateString()}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{showCreateFolder && (
				<div className="modal">
					<div className="modal-content">
						<h3>Create New Folder</h3>
						<input
							type="text"
							value={newFolderName}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setNewFolderName(e.target.value)
							}
							onKeyPress={handleFolderKeyPress}
							placeholder="Folder name"
							autoFocus
						/>
						<div className="modal-actions">
							<button onClick={createFolder}>Create</button>
							<button onClick={() => setShowCreateFolder(false)}>Cancel</button>
						</div>
					</div>
				</div>
			)}

			{showUpload && (
				<div className="modal">
					<div className="modal-content">
						<h3>Upload File</h3>
						<input type="file" onChange={handleFileSelect} accept="*/*" />
						{selectedFile && (
							<span className="selected-file">
								Selected: {selectedFile.name}
							</span>
						)}
						<div className="modal-actions">
							<button onClick={uploadFile} disabled={!selectedFile}>
								Upload
							</button>
							<button onClick={() => setShowUpload(false)}>Cancel</button>
						</div>
					</div>
				</div>
			)}

			<div className="typescript-features">
				<h3>TypeScript Features Used:</h3>
				<ul>
					<li>
						<strong>Type Safety:</strong> All file properties have defined
						interfaces
					</li>
					<li>
						<strong>Union Types:</strong> File types and view modes use specific
						string literals
					</li>
					<li>
						<strong>Interface Contracts:</strong> Clear structure for file items
						and manager state
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

export default FileManagerTS;
