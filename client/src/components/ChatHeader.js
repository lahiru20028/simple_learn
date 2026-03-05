import React from 'react';
import { Link } from 'react-router-dom';

function ChatHeader({ user, onToggleSidebar }) {
    return (
        <header className="flex items-center justify-between px-6 py-4
      bg-gradient-to-r from-[#1a1a2e] to-[#16162a]
      border-b border-white/10">

            {/* Mobile hamburger */}
            <button
                onClick={onToggleSidebar}
                className="md:hidden p-2 rounded-lg text-white/60 hover:text-white
          hover:bg-white/10 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Title */}
            <div className="text-center flex-1">
                <h1 className="text-xl font-bold text-white tracking-tight">
                    Simple Learn
                </h1>
                <p className="text-xs text-white/40 mt-0.5">AI Assistant for Students</p>
            </div>

            {/* Profile Avatar */}
            <div>
                {user ? (
                    <div
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600
              flex items-center justify-center text-white font-bold text-sm
              ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/20
              cursor-default select-none"
                        title={user.username}
                    >
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="w-10 h-10 rounded-full bg-white/10
              flex items-center justify-center text-white/50 text-lg
              ring-2 ring-white/10 hover:ring-white/20
              transition-all duration-200"
                        title="Login"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </Link>
                )}
            </div>
        </header>
    );
}

export default ChatHeader;
