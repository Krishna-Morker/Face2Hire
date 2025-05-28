import React from 'react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 shadow-md text-white p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-wide">
          🚀 Face2Hire
        </h1>
        <span className="text-sm text-indigo-200 italic">
          AI-Powered Coding Interviews
        </span>
      </div>
    </header>
  );
}
