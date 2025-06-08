import React from 'react';

export default function Header({ timeRemaining, totalScore, currentScore, formatTime }) {
  return (
    <header className="bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 shadow-lg text-white p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-wider text-indigo-300">
          🚀 Face2Hire
        </h1>

        <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm md:text-base">
          <span className="text-indigo-200 italic text-center md:text-left">
            AI-Powered Coding Interviews
          </span>

          <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded shadow-inner">
            <span className="text-gray-300 font-semibold">⏳ Time Left:</span>
            <span className="font-bold text-green-400">{formatTime ? formatTime(timeRemaining) : 'Loading...'}</span>
          </div>

          <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded shadow-inner">
            <span className="text-gray-300 font-semibold">🏆 Score:</span>
            <span className="font-bold text-yellow-300">{currentScore}</span>
            <span className="text-gray-400">/</span>
            <span className="font-bold text-white">{totalScore}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
