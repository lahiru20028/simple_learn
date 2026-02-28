import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Chat({ user, onLogout }) {
  const [messages, setMessages] = useState([
    {
      id: 0,
      text: `Hello${user ? ' ' + user.username : ''}! I'm Simple Learn AI. How can I help you learn today? Feel free to ask me anything about any topic.`,
      sender: 'assistant'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length,
      text: input,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await axios.post('http://localhost:5000/api/chat', 
        { question: input },
        { headers }
      );
      
      const assistantMessage = {
        id: messages.length + 1,
        text: res.data.answer,
        sender: 'assistant'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || "Sorry, there was a problem getting the answer.";
      const errorResponse = {
        id: messages.length + 1,
        text: `Error: ${errorMessage}`,
        sender: 'assistant'
      };
      setMessages(prev => [...prev, errorResponse]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 0,
        text: `Hello${user ? ' ' + user.username : ''}! I'm Simple Learn AI. How can I help you learn today? Feel free to ask me anything about any topic.`,
        sender: 'assistant'
      }
    ]);
  };

  return (
    <div className="App">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>📚 Simple Learn</h2>
        </div>
        <button className="new-chat-btn" onClick={clearChat}>
          ➕ New Chat
        </button>
        
        {user && (
          <div className="user-info">
            <div className="user-profile-header">
              <div className="profile-icon">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <strong>{user.username}</strong>
            </div>
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </div>
        )}

        <div className="sidebar-footer">
          <p>AI-powered educational assistant</p>
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-header-content">
            <h1>Simple Learn</h1>
            <p>AI Assistant for Students</p>
          </div>
          <div className="header-user-icon" ref={userMenuRef}>
            {user ? (
              <>
                <button
                  className="header-avatar-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  title={user.username}
                >
                  {user.username.charAt(0).toUpperCase()}
                </button>
                {showUserMenu && (
                  <div className="header-user-dropdown">
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.username}</span>
                    </div>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-logout-btn" onClick={onLogout}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="header-avatar-btn header-avatar-guest" title="Login">
                👤
              </Link>
            )}
          </div>
        </div>

        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-avatar">
                {message.sender === 'assistant' ? '🤖' : '👤'}
              </div>
              <div className="message-bubble">
                <p>{message.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-bubble loading">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <div className="input-wrapper">
            <textarea
              className="input-field"
              placeholder="Ask me anything... (Shift + Enter for new line, Enter to send)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              title="Send message"
            >
              ➤
            </button>
          </div>
          {!user && (
            <p className="login-prompt">
              <Link to="/login">Login</Link> to save your chat history!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
