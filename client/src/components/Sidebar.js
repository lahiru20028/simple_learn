import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({
    user,
    conversations,
    activeConversationId,
    onNewChat,
    onLoadConversation,
    onDeleteConversation,
    onLogout,
    isMobileOpen,
    onCloseMobile,
}) {
    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onCloseMobile}
                />
            )}

            <aside
                className={`
          fixed md:static inset-y-0 left-0 z-50
          w-[280px] bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a]
          border-r border-white/10
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
            >
                {/* Header */}
                <div className="px-5 py-5 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                        <span className="text-xl">📚</span>
                        Simple Learn
                    </h2>
                </div>

                {/* New Chat Button */}
                <div className="px-4 py-3">
                    <button
                        onClick={() => {
                            onNewChat();
                            onCloseMobile();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl
              bg-gradient-to-r from-emerald-600 to-emerald-500
              hover:from-emerald-500 hover:to-emerald-400
              text-white font-medium text-sm
              transition-all duration-200 shadow-lg shadow-emerald-500/20
              hover:shadow-emerald-500/30 active:scale-[0.98]"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Chat
                    </button>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto px-3 py-1 scrollbar-thin">
                    {user && conversations.length > 0 ? (
                        <div className="space-y-0.5">
                            <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider px-3 py-2">
                                Recent Chats
                            </p>
                            {conversations.map((conv) => (
                                <div
                                    key={conv._id}
                                    onClick={() => {
                                        onLoadConversation(conv._id);
                                        onCloseMobile();
                                    }}
                                    className={`
                    group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer
                    transition-all duration-150
                    ${activeConversationId === conv._id
                                            ? 'bg-white/10 border-l-[3px] border-emerald-400'
                                            : 'hover:bg-white/5 border-l-[3px] border-transparent'
                                        }
                  `}
                                >
                                    <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span className={`
                    flex-1 text-sm truncate
                    ${activeConversationId === conv._id ? 'text-white' : 'text-white/60'}
                  `}>
                                        {conv.title}
                                    </span>
                                    <button
                                        onClick={(e) => onDeleteConversation(conv._id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md
                      hover:bg-red-500/20 text-white/30 hover:text-red-400
                      transition-all duration-150"
                                        title="Delete conversation"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : user ? (
                        <div className="flex flex-col items-center justify-center h-32 text-white/20 text-sm">
                            <svg className="w-8 h-8 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            No conversations yet
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 p-4">
                    {user ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600
                  flex items-center justify-center text-white font-bold text-sm flex-shrink-0
                  ring-2 ring-emerald-500/20">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-white/80 truncate max-w-[120px]">
                                    {user.username}
                                </span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="p-2 rounded-lg text-white/40 hover:text-red-400
                  hover:bg-red-500/10 border border-white/10 hover:border-red-500/30
                  transition-all duration-200"
                                title="Logout"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <Link
                                to="/login"
                                className="inline-block w-full py-2.5 px-4 rounded-lg
                  bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold
                  transition-colors duration-200 text-center"
                            >
                                Login to save chats
                            </Link>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
