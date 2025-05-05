'use client';
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

export default function VideoSession() {
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [question, setQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const userVideoRef = useRef(null);
  const aiVideoRef = useRef(null);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [SpeechRecognition, setSpeechRecognition] = useState(null); // State for SpeechRecognition

  function close() {
    setIsSessionStarted(false);
    setQuestion('');
    setUserAnswer('');
    setEvaluation('');
    setCorrectAnswer('');
  }

  const startSession = async () => {
    setIsSessionStarted(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }

      // Ask question from the API and get the correct answer
      const res = await axios.post('/api/ask-question', {
        question: "Ask any one question related to Operating system related to interviews. Give me output only question and question should be theory related and medium difficulty and question should not be numerical"
      });
      console.log(res.data);
      setQuestion(res.data.answer); 
      setCorrectAnswer(res.data.correctAnswer); // The correct answer from API
      speakText(res.data.answer);   

    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const speakText = (text) => {
    if (aiVideoRef.current) {
      aiVideoRef.current.play();
    }
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    synth.speak(utter);
    utter.onend = () => {
      if (aiVideoRef.current) {
        aiVideoRef.current.pause();  // Pause the video once speech ends
        aiVideoRef.current.currentTime = 0;  // Optionally reset the video to the start
      }
    };
  };

  useEffect(() => {
    // Check if the window and SpeechRecognition API are available
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window) {
      setSpeechRecognition(window.SpeechRecognition || window.webkitSpeechRecognition);
    }
  }, []);

  const handleStartListening = () => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;

      recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Recognized Text:', transcript);
        setUserAnswer(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        evaluateAnswer();
      };

      recognition.start();
    } else {
      console.error('Speech Recognition API is not available in this browser.');
    }
  };

  const evaluateAnswer = async () => {
    try {
      // Send both the user's answer and the correct answer to the API for evaluation
      const res = await axios.post('/api/evaluate-answer', { 
        userAnswer,
        correctAnswer
      });
      console.log(res.data);

      // Set the evaluation result (correct or incorrect)
      setEvaluation(res.data.isCorrect ? "Correct!" : "Incorrect. Try again.");
    } catch (error) {
      console.error("Error evaluating the answer:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white">
      {!isSessionStarted && (
        <button
          onClick={startSession}
          className="mb-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Start Session
        </button>
      )}

      {isSessionStarted && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* User Video */}
            <div className="bg-gray-700 shadow rounded p-4 text-center">
              <h2 className="text-lg font-semibold mb-2">You</h2>
              <video ref={userVideoRef} autoPlay muted playsInline className="w-full rounded" />
            </div>

            {/* AI Video */}
            <div className="bg-gray-700 shadow rounded p-4 text-center">
              <h2 className="text-lg font-semibold mb-2">AI Interviewer</h2>
              <video
                ref={aiVideoRef}
                controls={false}
                className="w-full rounded"
                src="/WIN_20240928_11_52_57_Pro.mp4"
              />
            </div>
          </div>

          {/* AI Question */}
          <div className="mt-6 bg-gray-800 p-4 rounded shadow w-full max-w-xl text-center">
            <h3 className="text-xl font-semibold mb-2">AI Question:</h3>
            <p>{question}</p>
          </div>

          {/* Start Listening Button */}
          <div className="mt-6 bg-gray-800 p-4 rounded shadow w-full max-w-xl text-center">
            <button
              onClick={handleStartListening}
              className="mt-4 p-3 bg-blue-600 rounded"
            >
              Speak Your Answer
            </button>
          </div>

          {/* Evaluation Result */}
          {evaluation && (
            <div className="mt-4 p-3 text-center text-lg font-semibold">
              <p>{evaluation}</p>
            </div>
          )}

          <button className='flex justify-center m-4 p-3 bg-blue-600 rounded' onClick={close}>
            End Session
          </button>
        </>
      )}
    </div>
  );
}
