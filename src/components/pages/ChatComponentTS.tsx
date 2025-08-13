import React, { useState, useEffect, useRef } from "react";
import "./ChatComponent.css";

// TypeScript interfaces for component props and data
interface ChatComponentProps {
	chatId?: string;
	initialMessages?: ChatMessage[];
}

interface ChatMessage {
	id: string;
	text: string;
	sender: "user" | "other";
	timestamp: string;
	attachments: string[];
	reactions: Reaction[];
}

interface Reaction {
	type: string;
	count: number;
	users: string[];
}

interface ChatState {
	messages: ChatMessage[];
	newMessage: string;
	isTyping: boolean;
	searchTerm: string;
	filter: "all" | "user" | "other";
}

const ChatComponentTS: React.FC<ChatComponentProps> = ({
	chatId = "chat123",
	initialMessages = [],
}) => {
	// TypeScript state with explicit typing
	const [chatState, setChatState] = useState<ChatState>({
		messages: initialMessages,
		newMessage: "",
		isTyping: false,
		searchTerm: "",
		filter: "all",
	});
	const [showAttachments, setShowAttachments] = useState<boolean>(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Load messages from localStorage on component mount
	useEffect(() => {
		const savedMessages = localStorage.getItem(`chat_${chatId}`);
		if (savedMessages && initialMessages.length === 0) {
			try {
				const parsedMessages: ChatMessage[] = JSON.parse(savedMessages);
				setChatState((prev: ChatState) => ({
					...prev,
					messages: parsedMessages,
				}));
			} catch (error) {
				console.error("Error parsing saved messages:", error);
			}
		}
	}, [chatId, initialMessages]);

	// Save messages to localStorage
	useEffect(() => {
		localStorage.setItem(`chat_${chatId}`, JSON.stringify(chatState.messages));
	}, [chatState.messages, chatId]);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [chatState.messages]);

	// Simulate typing indicator
	useEffect(() => {
		if (chatState.isTyping) {
			const timer = setTimeout(() => {
				setChatState((prev: ChatState) => ({ ...prev, isTyping: false }));
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [chatState.isTyping]);

	// Send a new message
	const sendMessage = (): void => {
		if (chatState.newMessage.trim()) {
			const message: ChatMessage = {
				id: Date.now().toString(),
				text: chatState.newMessage.trim(),
				sender: "user",
				timestamp: new Date().toISOString(),
				attachments: [],
				reactions: [],
			};

			setChatState((prev: ChatState) => ({
				...prev,
				messages: [...prev.messages, message],
				newMessage: "",
			}));

			// Simulate other person typing and responding
			setChatState((prev: ChatState) => ({ ...prev, isTyping: true }));
			setTimeout(() => {
				const response: ChatMessage = {
					id: (Date.now() + 1).toString(),
					text: `Thanks for your message: "${message.text}"`,
					sender: "other",
					timestamp: new Date().toISOString(),
					attachments: [],
					reactions: [],
				};
				setChatState((prev: ChatState) => ({
					...prev,
					messages: [...prev.messages, response],
					isTyping: false,
				}));
			}, 2000);
		}
	};

	// Handle file selection
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const file: File | null = e.target.files?.[0] || null;
		if (file) {
			setSelectedFile(file);
			// Simulate file upload
			setTimeout(() => {
				const fileMessage: ChatMessage = {
					id: Date.now().toString(),
					text: `File uploaded: ${file.name}`,
					sender: "user",
					timestamp: new Date().toISOString(),
					attachments: [file.name],
					reactions: [],
				};
				setChatState((prev: ChatState) => ({
					...prev,
					messages: [...prev.messages, fileMessage],
				}));
				setSelectedFile(null);
			}, 1000);
		}
	};

	// Add reaction to a message
	const addReaction = (messageId: string, reactionType: string): void => {
		setChatState((prev: ChatState) => ({
			...prev,
			messages: prev.messages.map((message: ChatMessage) => {
				if (message.id === messageId) {
					const existingReaction = message.reactions.find(
						(r: Reaction) => r.type === reactionType
					);
					if (existingReaction) {
						return {
							...message,
							reactions: message.reactions.map((r: Reaction) =>
								r.type === reactionType ? { ...r, count: r.count + 1 } : r
							),
						};
					} else {
						return {
							...message,
							reactions: [
								...message.reactions,
								{ type: reactionType, count: 1, users: ["user"] },
							],
						};
					}
				}
				return message;
			}),
		}));
	};

	// Handle key press for sending messages
	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
		if (e.key === "Enter") {
			sendMessage();
		}
	};

	// Get filtered messages
	const getFilteredMessages = (): ChatMessage[] => {
		let filtered: ChatMessage[] = chatState.messages;

		// Apply sender filter
		if (chatState.filter !== "all") {
			filtered = filtered.filter(
				(message: ChatMessage) => message.sender === chatState.filter
			);
		}

		// Apply search filter
		if (chatState.searchTerm) {
			filtered = filtered.filter((message: ChatMessage) =>
				message.text.toLowerCase().includes(chatState.searchTerm.toLowerCase())
			);
		}

		return filtered;
	};

	// Get chat statistics
	const getChatStats = () => {
		const totalMessages: number = chatState.messages.length;
		const userMessages: number = chatState.messages.filter(
			(m: ChatMessage) => m.sender === "user"
		).length;
		const otherMessages: number = totalMessages - userMessages;
		const totalReactions: number = chatState.messages.reduce(
			(sum: number, m: ChatMessage) =>
				sum +
				m.reactions.reduce((rSum: number, r: Reaction) => rSum + r.count, 0),
			0
		);

		return { totalMessages, userMessages, otherMessages, totalReactions };
	};

	const filteredMessages: ChatMessage[] = getFilteredMessages();
	const stats = getChatStats();

	return (
		<div className="chat-component">
			<div className="chat-header">
				<h2>Chat Interface</h2>
				<p>Chat ID: {chatId}</p>
			</div>

			<div className="chat-controls">
				<div className="search-filter">
					<input
						type="text"
						value={chatState.searchTerm}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setChatState((prev: ChatState) => ({
								...prev,
								searchTerm: e.target.value,
							}))
						}
						placeholder="Search messages..."
						className="search-input"
					/>

					<select
						value={chatState.filter}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
							setChatState((prev: ChatState) => ({
								...prev,
								filter: e.target.value as "all" | "user" | "other",
							}))
						}
						className="filter-select">
						<option value="all">All Messages</option>
						<option value="user">My Messages</option>
						<option value="other">Other Messages</option>
					</select>
				</div>

				<div className="attachment-controls">
					<button
						onClick={() => setShowAttachments(!showAttachments)}
						className="attachment-btn">
						📎 Attachments
					</button>
					{showAttachments && (
						<div className="file-upload">
							<input
								type="file"
								onChange={handleFileSelect}
								accept="image/*,.pdf,.doc,.txt"
							/>
							{selectedFile && (
								<span className="selected-file">
									Selected: {selectedFile.name}
								</span>
							)}
						</div>
					)}
				</div>
			</div>

			<div className="chat-stats">
				<div className="stat-item">
					<span className="stat-number">{stats.totalMessages}</span>
					<span className="stat-label">Total Messages</span>
				</div>
				<div className="stat-item">
					<span className="stat-number">{stats.userMessages}</span>
					<span className="stat-label">My Messages</span>
				</div>
				<div className="stat-item">
					<span className="stat-number">{stats.otherMessages}</span>
					<span className="stat-label">Other Messages</span>
				</div>
				<div className="stat-item">
					<span className="stat-number">{stats.totalReactions}</span>
					<span className="stat-label">Total Reactions</span>
				</div>
			</div>

			<div className="chat-messages">
				{filteredMessages.length === 0 ? (
					<div className="no-messages">
						<p>No messages found. Start a conversation!</p>
					</div>
				) : (
					filteredMessages.map((message: ChatMessage) => (
						<div key={message.id} className={`message ${message.sender}`}>
							<div className="message-content">
								<div className="message-text">{message.text}</div>
								{message.attachments.length > 0 && (
									<div className="message-attachments">
										{message.attachments.map(
											(attachment: string, index: number) => (
												<div key={index} className="attachment">
													📎 {attachment}
												</div>
											)
										)}
									</div>
								)}
								<div className="message-timestamp">
									{new Date(message.timestamp).toLocaleTimeString()}
								</div>
							</div>

							<div className="message-reactions">
								{message.reactions.map((reaction: Reaction) => (
									<button
										key={reaction.type}
										className="reaction-btn"
										onClick={() => addReaction(message.id, reaction.type)}>
										{reaction.type} {reaction.count}
									</button>
								))}
								<div className="add-reaction">
									<button
										onClick={() => addReaction(message.id, "👍")}
										className="reaction-btn">
										👍
									</button>
									<button
										onClick={() => addReaction(message.id, "❤️")}
										className="reaction-btn">
										❤️
									</button>
									<button
										onClick={() => addReaction(message.id, "😊")}
										className="reaction-btn">
										😊
									</button>
								</div>
							</div>
						</div>
					))
				)}

				{chatState.isTyping && (
					<div className="typing-indicator">
						<span>Other person is typing...</span>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			<div className="chat-input">
				<input
					type="text"
					value={chatState.newMessage}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setChatState((prev: ChatState) => ({
							...prev,
							newMessage: e.target.value,
						}))
					}
					onKeyPress={handleKeyPress}
					placeholder="Type your message..."
					className="message-input"
				/>
				<button onClick={sendMessage} className="send-btn">
					Send
				</button>
			</div>

			<div className="typescript-features">
				<h3>TypeScript Features Used:</h3>
				<ul>
					<li>
						<strong>Type Safety:</strong> All message properties have defined
						interfaces
					</li>
					<li>
						<strong>Union Types:</strong> Message sender uses specific string
						literals
					</li>
					<li>
						<strong>Interface Contracts:</strong> Clear structure for chat
						messages and reactions
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
						reducing
					</li>
					<li>
						<strong>Ref Types:</strong> useRef with proper HTML element typing
					</li>
				</ul>
			</div>
		</div>
	);
};

export default ChatComponentTS;
