import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 0,
      text: "Hello! I'm Simple Learn AI. How can I help you learn today? Feel free to ask me anything about any topic.",
      sender: 'assistant'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length,
      text: input,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Connecting to backend
      const res = await axios.post('http://localhost:5000/api/chat', { question: input });
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
        text: "Hello! I'm Simple Learn AI. How can I help you learn today? Feel free to ask me anything about any topic.",
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
        <div className="sidebar-footer">
          <p>AI-powered educational assistant</p>
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <h1>Simple Learn</h1>
          <p>AI Assistant for Students</p>
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
          <p className="input-hint">Press Enter to send, Shift + Enter for new line</p>
        </div>
      </div>
    </div>
  );
}

export default App;