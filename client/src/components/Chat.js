import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Chat({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const getWelcomeMessage = () => ({
    id: 'welcome',
    text: `Hello${user ? ' ' + user.username : ''}! I'm Simple Learn AI. How can I help you learn today? Feel free to ask me anything about any topic.`,
    sender: 'assistant'
  });

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Set welcome message when no active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([getWelcomeMessage()]);
    }
  }, [activeConversationId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchConversations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/conversations', {
        headers: getAuthHeaders()
      });
      setConversations(res.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const loadConversation = async (convId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/conversations/${convId}`, {
        headers: getAuthHeaders()
      });
      const conv = res.data;
      setActiveConversationId(conv._id);
      const loadedMessages = conv.messages.map((msg, index) => ({
        id: index,
        text: msg.content,
        sender: msg.role === 'user' ? 'user' : 'assistant'
      }));
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const deleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:5000/api/conversations/${convId}`, {
        headers: getAuthHeaders()
      });
      setConversations(prev => prev.filter(c => c._id !== convId));
      if (activeConversationId === convId) {
        setActiveConversationId(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const startNewChat = () => {
    setActiveConversationId(null);
    setMessages([getWelcomeMessage()]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length,
      text: input,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/chat',
        {
          question: currentInput,
          conversationId: activeConversationId
        },
        { headers: getAuthHeaders() }
      );

      const assistantMessage = {
        id: messages.length + 1,
        text: res.data.answer,
        sender: 'assistant'
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update conversation tracking
      if (res.data.conversationId) {
        if (!activeConversationId) {
          // New conversation was created
          setActiveConversationId(res.data.conversationId);
        }
        // Refresh conversation list
        if (user) {
          fetchConversations();
        }
      }
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

  return (
    <div className="App">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>📚 Simple Learn</h2>
        </div>
        <button className="new-chat-btn" onClick={startNewChat}>
          ➕ New Chat
        </button>

        {user && (
          <div className="conversation-list">
            {conversations.map((conv) => (
              <div
                key={conv._id}
                className={`conversation-item ${activeConversationId === conv._id ? 'active' : ''}`}
                onClick={() => loadConversation(conv._id)}
              >
                <span className="conversation-title">{conv.title}</span>
                <button
                  className="conversation-delete-btn"
                  onClick={(e) => deleteConversation(conv._id, e)}
                  title="Delete conversation"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="sidebar-spacer"></div>

        <div className="sidebar-footer">
          {user ? (
            <div className="sidebar-user-section">
              <div className="sidebar-user-profile">
                <div className="sidebar-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="sidebar-username">{user.username}</span>
              </div>
              <button className="sidebar-logout-btn" onClick={onLogout} title="Logout">
                ⏻
              </button>
            </div>
          ) : (
            <div className="sidebar-guest-section">
              <Link to="/login" className="sidebar-login-btn">Login</Link>
            </div>
          )}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-header-content">
            <h1>Simple Learn</h1>
            <p>AI Assistant for Students</p>
          </div>
          <div className="header-user-icon">
            {user ? (
              <div className="header-avatar-btn" title={user.username}>
                {user.username.charAt(0).toUpperCase()}
              </div>
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
