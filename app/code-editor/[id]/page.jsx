'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import QuestionPanel from '../../../components/QuestionPanel';
import CodeEditor from '../../../components/CodeEditor';

export default function EditorPage() {
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const [panelWidth, setPanelWidth] = useState(400);
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const { id } = useParams();
  const router = useRouter();

  // Format seconds as MM:SS
  const formatTime = (seconds) => {
    if (typeof seconds !== 'number') return '--:--';
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  // Fetch question
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await fetch(`/api/coding-questions/${id}`);
        const data = await res.json();
        setQuestion(data);
        setTimeLeft((data?.totalTime || 0) * 60);
        setTotalScore(data?.totalScore || 0);
      } catch (error) {
        console.error('Failed to fetch question:', error);
      }
    };

    if (id) fetchQuestion();
  }, [id]);

  // Fullscreen & anti-cheat
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.warn('Could not enter fullscreen:', err);
      }
    };

    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        alert('🚫 Fullscreen exited. Ending test.');
        router.push(`/thank-you?score=${currentScore}&total=${totalScore}`);
      }
    };

    const disableContextMenu = (e) => e.preventDefault();

    enterFullscreen();
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('contextmenu', disableContextMenu);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('contextmenu', disableContextMenu);
    };
  }, [currentScore, totalScore, router]);

  // Timer logic
  useEffect(() => {
    let timer;
    if (question) {
      if (timeLeft <= 0) {
        alert('⏰ Time is up! Submitting your code.');
        router.push(`/thank-you?score=${currentScore}&total=${totalScore}`);
        return;
      }

      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [timeLeft, question, router, currentScore, totalScore]);

  // Deduct score when hint is used
  const deductScore = useCallback((deduction) => {
    setCurrentScore((prev) => prev - deduction);
  }, []);

  // Update score on test case success
  const updateScore = useCallback((newScore) => {
    setCurrentScore(Math.min(newScore, totalScore));
  }, [totalScore]);

  // Drag to resize logic
  const startDrag = () => (isDragging.current = true);
  const stopDrag = () => (isDragging.current = false);
  const onDrag = (e) => {
    if (!isDragging.current) return;
    const newWidth = e.clientX - containerRef.current.getBoundingClientRect().left;
    if (newWidth > 250 && newWidth < 800) setPanelWidth(newWidth);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" onMouseMove={onDrag} onMouseUp={stopDrag}>
      {/* Header */}
      <Header
        timeRemaining={timeLeft}
        currentScore={currentScore}
        totalScore={totalScore}
        formatTime={formatTime}
      />

      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Left panel: Question */}
        <div
          style={{ width: `${panelWidth}px` }}
          className="overflow-auto border-r border-gray-300 bg-white"
        >
          <QuestionPanel
            question={question}
            timeRemaining={timeLeft}
            deductScore={deductScore}
            currentScore={currentScore}
            totalScore={totalScore}
          />
        </div>

        {/* Resizer */}
        <div
          onMouseDown={startDrag}
          onMouseUp={stopDrag}
          className="w-1 cursor-col-resize bg-gray-300 hover:bg-gray-500"
        />

        {/* Right panel: Code Editor */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <CodeEditor
            question={question}
            updateScore={updateScore}
            currentScore={currentScore}
            totalScore={totalScore}
          />
        </div>
      </div>
    </div>
  );
}
