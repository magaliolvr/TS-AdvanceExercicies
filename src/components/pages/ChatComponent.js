import React, { useState, useEffect, useRef } from 'react';
import './ChatComponent.css';

const ChatComponent = ({ userId = 'user123', initialMessages = [] }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(['user123', 'user456', 'user789']);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageFilter, setMessageFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [emojiPicker, setEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const messagesEndRef = useRef(null);

  // Load messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_${userId}`);
    if (savedMessages && initialMessages.length === 0) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }
  }, [userId, initialMessages.length]);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem(`chat_${userId}`, JSON.stringify(messages));
  }, [messages, userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => setIsTyping(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  const addMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: userId,
        timestamp: new Date().toISOString(),
        type: 'text',
        attachments: attachments
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setAttachments([]);
      
      // Simulate other user typing
      if (Math.random() > 0.5) {
        setIsTyping(true);
      }
    }
  };

  const deleteMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const editMessage = (messageId, newText) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, text: newText, edited: true } : msg
    ));
  };

  const addReaction = (messageId, reaction) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions } || {};
        reactions[reaction] = (reactions[reaction] || 0) + 1;
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  const addAttachment = (file) => {
    if (file) {
      const attachment = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      };
      setAttachments(prev => [...prev, attachment]);
    }
  };

  const removeAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(addAttachment);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addMessage();
    }
  };

  const getFilteredMessages = () => {
    let filtered = messages;
    
    if (messageFilter === 'sent') {
      filtered = filtered.filter(msg => msg.sender === userId);
    } else if (messageFilter === 'received') {
      filtered = filtered.filter(msg => msg.sender !== userId);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const renderMessage = (message) => {
    const isOwnMessage = message.sender === userId;
    const hasReactions = message.reactions && Object.keys(message.reactions).length > 0;

    return (
      <div key={message.id} className={`message ${isOwnMessage ? 'own' : 'other'}`}>
        <div className="message-header">
          <span className="sender">{message.sender}</span>
          <span className="timestamp">{formatTimestamp(message.timestamp)}</span>
          {message.edited && <span className="edited">(edited)</span>}
        </div>
        
        <div className="message-content">
          {message.type === 'text' && (
            <div className="message-text">{message.text}</div>
          )}
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="message-attachments">
              {message.attachments.map(attachment => (
                <div key={attachment.id} className="attachment">
                  {attachment.type.startsWith('image/') ? (
                    <img src={attachment.url} alt={attachment.name} />
                  ) : (
                    <div className="file-attachment">
                      <span className="file-name">{attachment.name}</span>
                      <span className="file-size">({Math.round(attachment.size / 1024)}KB)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {hasReactions && (
          <div className="message-reactions">
            {Object.entries(message.reactions).map(([reaction, count]) => (
              <span key={reaction} className="reaction">
                {reaction} {count}
              </span>
            ))}
          </div>
        )}

        <div className="message-actions">
          {!isOwnMessage && (
            <button onClick={() => addReaction(message.id, '👍')}>👍</button>
          )}
          {!isOwnMessage && (
            <button onClick={() => addReaction(message.id, '❤️')}>❤️</button>
          )}
          {!isOwnMessage && (
            <button onClick={() => addReaction(message.id, '😊')}>😊</button>
          )}
          {isOwnMessage && (
            <button onClick={() => deleteMessage(message.id)} className="delete-btn">Delete</button>
          )}
        </div>
      </div>
    );
  };

  const renderEmojiPicker = () => {
    const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '👏', '🙏', '😎'];
    
    return (
      <div className="emoji-picker">
        {emojis.map(emoji => (
          <button
            key={emoji}
            onClick={() => {
              setNewMessage(prev => prev + emoji);
              setEmojiPicker(false);
            }}
            className="emoji-btn"
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  };

  const filteredMessages = getFilteredMessages();

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Chat Component</h1>
        <p>User ID: {userId}</p>
        <div className="chat-controls">
          <select value={messageFilter} onChange={(e) => setMessageFilter(e.target.value)}>
            <option value="all">All Messages</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
          </select>
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-sidebar">
          <div className="online-users">
            <h3>Online Users</h3>
            {onlineUsers.map(user => (
              <div
                key={user}
                className={`user-item ${selectedUser === user ? 'selected' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="user-avatar">{user.charAt(0).toUpperCase()}</div>
                <div className="user-info">
                  <span className="user-name">{user}</span>
                  <span className="user-status online">Online</span>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-stats">
            <h3>Chat Statistics</h3>
            <div className="stat-item">
              <span className="stat-label">Total Messages:</span>
              <span className="stat-value">{messages.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Sent:</span>
              <span className="stat-value">{messages.filter(m => m.sender === userId).length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Received:</span>
              <span className="stat-value">{messages.filter(m => m.sender !== userId).length}</span>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          <div className="messages-container">
            {filteredMessages.length === 0 ? (
              <div className="no-messages">
                <p>No messages found. Start a conversation!</p>
              </div>
            ) : (
              filteredMessages.map(renderMessage)
            )}
            
            {isTyping && (
              <div className="typing-indicator">
                <span>Someone is typing...</span>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="message-input">
            <div className="input-controls">
              <label className="file-upload">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                📎
              </label>
              <button
                onClick={() => setEmojiPicker(!emojiPicker)}
                className="emoji-btn"
              >
                😊
              </button>
            </div>
            
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows="3"
            />
            
            <button onClick={addMessage} className="send-btn">Send</button>
          </div>

          {emojiPicker && renderEmojiPicker()}

          {attachments.length > 0 && (
            <div className="attachments-preview">
              <h4>Attachments:</h4>
              {attachments.map(attachment => (
                <div key={attachment.id} className="attachment-preview">
                  <span>{attachment.name}</span>
                  <button onClick={() => removeAttachment(attachment.id)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="chat-info">
        <h2>Chat Features</h2>
        <ul>
          <li><strong>Real-time Messaging:</strong> Send and receive messages instantly</li>
          <li><strong>File Attachments:</strong> Share images and files</li>
          <li><strong>Emoji Support:</strong> Express emotions with emojis</li>
          <li><strong>Message Reactions:</strong> React to messages with emojis</li>
          <li><strong>Message Filtering:</strong> Filter by sent/received messages</li>
          <li><strong>Search Messages:</strong> Find specific messages quickly</li>
          <li><strong>Typing Indicators:</strong> See when others are typing</li>
          <li><strong>Local Storage:</strong> Messages persist between sessions</li>
        </ul>
      </div>
    </div>
  );
};

export default ChatComponent;
