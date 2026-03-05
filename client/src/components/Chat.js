import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';

function Chat({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
          setActiveConversationId(res.data.conversationId);
        }
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
    <div className="flex h-screen bg-[#0d0d0d]">
      {/* Sidebar */}
      <Sidebar
        user={user}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={startNewChat}
        onLoadConversation={loadConversation}
        onDeleteConversation={deleteConversation}
        onLogout={onLogout}
        isMobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatHeader
          user={user}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5
          scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-fade-in
                ${message.sender === 'user' ? 'justify-end' : 'justify-start'}
              `}
            >
              {/* Assistant avatar (left) */}
              {message.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#1a2a3a] flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-base">🤖</span>
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`max-w-[70%] md:max-w-[65%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap break-words
                  ${message.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-br-md shadow-lg shadow-emerald-500/10'
                    : 'bg-[#1e1e2e] text-white/85 rounded-bl-md border border-white/5'
                  }
                `}
              >
                {message.text}
              </div>

              {/* User avatar (right) */}
              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-base">👤</span>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#1a2a3a] flex items-center justify-center flex-shrink-0">
                <span className="text-base">🤖</span>
              </div>
              <div className="bg-[#1e1e2e] border border-white/5 px-5 py-3.5 rounded-2xl rounded-bl-md flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 md:px-8 py-4 bg-[#0d0d0d] border-t border-white/5">
          <div className="flex gap-3 items-end bg-[#1e1e2e] border border-white/10
            rounded-2xl px-4 py-2 transition-all duration-200
            focus-within:border-emerald-500/50 focus-within:shadow-lg focus-within:shadow-emerald-500/5">
            <textarea
              className="flex-1 bg-transparent border-none outline-none resize-none
                text-white/90 text-[15px] py-2.5 placeholder-white/25
                max-h-[150px] font-[inherit]"
              placeholder="Ask me anything... (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500
                disabled:bg-white/5 disabled:text-white/20
                text-white transition-all duration-200
                hover:shadow-lg hover:shadow-emerald-500/20
                disabled:shadow-none disabled:cursor-not-allowed
                active:scale-95 flex-shrink-0"
              title="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {!user && (
            <p className="text-center text-white/30 text-xs mt-3">
              <a href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Login</a>
              {' '}to save your chat history
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
