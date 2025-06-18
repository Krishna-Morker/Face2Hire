"use client";
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

const TOPICS = ["Operating Systems", "OOP", "DBMS", "Computer Networks"];
const SESSION_DURATION = 10 * 60 * 1000;
const WARNING_TIME = 1 * 60 * 1000;
const MAX_CHEATING_WARNINGS = 5;

export default function VideoSession() {
  const userVideoRef = useRef(null);
  const aiVideoRef = useRef(null);

  const [faceapi, setFaceapi] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [warningSpoken, setWarningSpoken] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);

  const [questionData, setQuestionData] = useState({ question: "", concept: "" });
  const [currentTopic, setCurrentTopic] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [askedConcepts, setAskedConcepts] = useState([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [allowSpeak, setAllowSpeak] = useState(true);
  const [cheatingWarning, setCheatingWarning] = useState("");
  const [cheatingCount, setCheatingCount] = useState(0);
  const [permissionGiven, setPermissionGiven] = useState(false);

  // --- Load face-api.js ---
  useEffect(() => {
    if (sessionActive) loadFaceApi();
  }, [sessionActive]);

  // --- Detect tab switch (cheating) ---
  useEffect(() => {
    const handleTabSwitch = () => {
      if (sessionActive && !permissionGiven) {
        setCheatingCount(prevCount => prevCount + 1);
        speak("⚠️ Please do not switch tabs during the interview.");
        setCheatingWarning("⚠️ Tab switch detected! 🚫");
      }
    };
    window.addEventListener("blur", handleTabSwitch);
    window.addEventListener("focus", () => {
      setPermissionGiven(false);
    });
    return () => {
      window.removeEventListener("blur", handleTabSwitch);
      window.removeEventListener("focus", () => {
        setPermissionGiven(false);
      });
    };
  }, [sessionActive, permissionGiven]);

  // --- Interview session timer + warning ---
  useEffect(() => {
    let timer;
    if (sessionActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1000), 1000);
    }

    if (timeLeft <= WARNING_TIME && !warningSpoken) {
      setWarningSpoken(true);
      speak("⏳ Just 1 minute remaining. Please wrap up your answers.");
    }

    if (timeLeft <= 0 && sessionActive) {
      clearInterval(timer);
      setTimerExpired(true);
      setSessionActive(false);
      setAllowSpeak(false);
      stopStream();
      speak("🕒 Time's up! Thanks for attending the interview. Please click the End Session button.");
    }

    if (cheatingCount > MAX_CHEATING_WARNINGS && sessionActive) {
      clearInterval(timer);
      setTimerExpired(true);
      setSessionActive(false);
      setAllowSpeak(false);
      stopStream();
      speak("❌ Session ended due to excessive cheating attempts.");
    }

    return () => clearInterval(timer);
  }, [sessionActive, timeLeft, warningSpoken, cheatingCount]);

  // --- Face Detection ---
  const loadFaceApi = async () => {
    const fa = await import("face-api.js");
    await fa.nets.tinyFaceDetector.loadFromUri("/models");
    await fa.nets.faceLandmark68Net.loadFromUri("/models");
    await fa.nets.faceRecognitionNet.loadFromUri("/models");
    await fa.nets.faceExpressionNet.loadFromUri("/models");
    setFaceapi(fa);
    monitorFace(fa);
  };

  const monitorFace = (fa) => {
    const interval = setInterval(async () => {
      if (!sessionActive || !userVideoRef.current?.srcObject) {
        clearInterval(interval);
        return;
      }

      const detections = await fa
        .detectAllFaces(userVideoRef.current, new fa.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections.length === 0) {
        setCheatingCount(prevCount => prevCount + 1);
        setCheatingWarning("⚠️ No face detected! 👤");
        speak("Please keep your face in view.");
      } else if (detections.length > 1) {
        setCheatingCount(prevCount => prevCount + 1);
        setCheatingWarning("⚠️ Multiple faces detected! 👥");
        speak("⚠️ Please ensure you're the only one visible.");
      } else {
        setCheatingWarning("");
      }

      if (cheatingCount > MAX_CHEATING_WARNINGS && sessionActive) {
        clearInterval(interval);
        setTimerExpired(true);
        setSessionActive(false);
        setAllowSpeak(false);
        stopStream();
        speak("❌ Session ended due to excessive cheating attempts.");
      }
    }, 4000);
  };

  // --- Start Interview Session ---
  const startSession = async () => {
    setSessionActive(true);
    setAllowSpeak(true);
    setWarningSpoken(false);
    setTimeLeft(SESSION_DURATION);
    setAskedConcepts([]);
    setAskedQuestions([]);
    setCheatingCount(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      userVideoRef.current.srcObject = stream;

      const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      setCurrentTopic(randomTopic);
      setQuestionNumber(1);

      const data = await fetchQuestion(randomTopic);
      setQuestionData(data);
      speak(`Welcome to Face2Hire Mock Interview. We'll start with ${randomTopic}. Here's your first question: ${data.question}`);
    } catch (err) {
      console.error("Camera/Mic error:", err);
      setPermissionGiven(true);
    }
  };

  const stopStream = () => {
    const stream = userVideoRef.current?.srcObject;
    stream?.getTracks().forEach(track => track.stop());
    if (userVideoRef.current) userVideoRef.current.srcObject = null;
  };

  const endSession = () => {
    setSessionActive(false);
    setAllowSpeak(false);
    setQuestionNumber(0);
    setQuestionData({ question: "", concept: "" });
    setAskedQuestions([]);
    setAskedConcepts([]);
    setCurrentTopic(null);
    setUserAnswer("");
    setFeedback("");
    setWarningSpoken(false);
    setTimeLeft(SESSION_DURATION);
    stopStream();
    setCheatingCount(0);

    if (aiVideoRef.current) {
      aiVideoRef.current.pause();
      aiVideoRef.current.currentTime = 0;
    }
  };

  // --- AI Speak Function ---
  const speak = (text) => {
    if (!allowSpeak) return;
    const utterance = new SpeechSynthesisUtterance(text);
    if (aiVideoRef.current) aiVideoRef.current.play();
    utterance.onend = () => {
      if (aiVideoRef.current) {
        aiVideoRef.current.pause();
        aiVideoRef.current.currentTime = 0;
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const fetchQuestion = async (topic) => {
    try {
      const res = await axios.post("/api/ask-question", {
        topic,
        previousQuestions: askedQuestions,
        previousConcepts: askedConcepts,
      });
      const { question, concept } = res.data;
      setAskedQuestions(prev => [...prev, question]);
      if (concept) setAskedConcepts(prev => [...prev, concept]);
      return { question, concept };
    } catch {
      return { question: "Let's continue with the next question.", concept: null };
    }
  };

  // --- Answer Evaluation ---
  const evaluateAnswer = async (answerText) => {
    try {
      await axios.post("/api/evaluate-answer", {
        question: questionData.question,
        userAnswer: answerText,
        topic: currentTopic,
      });

      const next = questionNumber + 1;
      setFeedback("✅ Good answer. Moving on...");

      if (next > 4 || timerExpired) {
        speak(`✅ That's it for the ${currentTopic} section.`);
        const remaining = TOPICS.filter(t => t !== currentTopic);
        if (remaining.length > 0 && !timerExpired) {
          const newTopic = remaining[Math.floor(Math.random() * remaining.length)];
          setCurrentTopic(newTopic);
          setQuestionNumber(1);
          const data = await fetchQuestion(newTopic);
          setQuestionData(data);
          speak(`Now let's move to ${newTopic}. Here's your first question: ${data.question}`);
        } else {
          speak("🎉 You’ve completed all topics. Great job!");
          setSessionActive(false);
          setAllowSpeak(false);
        }
      } else {
        setQuestionNumber(next);
        const data = await fetchQuestion(currentTopic);
        setQuestionData(data);
        speak(`Question ${next}: ${data.question}`);
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      setFeedback("⚠️ Could not evaluate your response.");
    }
  };

  // --- Speech Recognition ---
  const startListening = () => {
    if (!sessionActive || timerExpired) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recog = new SR();
    recog.lang = "en-US";
    recog.continuous = true;
    recog.interimResults = true;

    setUserAnswer("");
    setFeedback("");
    setIsListening(true);

    let finalTranscript = "";
    let silenceTimer = setTimeout(() => recog.stop(), 8000);

    recog.onresult = (e) => {
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => recog.stop(), 8000);

      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) finalTranscript += result[0].transcript + " ";
        else interim += result[0].transcript;
      }
      setUserAnswer(finalTranscript + interim);
    };

    recog.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    };

    recog.onend = async () => {
      setIsListening(false);
      if (finalTranscript.trim()) await evaluateAnswer(finalTranscript);
      else speak("I didn't catch that. Please try again.");
    };

    recog.start();
  };

  const formatTime = (ms) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // --- JSX UI ---
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      {!sessionActive ? (
        <button onClick={startSession} className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700">
          🎬 Start Mock Interview
        </button>
      ) : (
        <>
          <div className="text-sm text-gray-400 mt-2">⏱ Time Left: {formatTime(timeLeft)}</div>
          {cheatingWarning && <div className="text-red-400 mt-1 font-semibold">{cheatingWarning}</div>}
          <div className="text-sm text-gray-400 mt-1">
            ⚠️ Warnings: {cheatingCount} / {MAX_CHEATING_WARNINGS}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mt-4">
            <div className="bg-gray-700 p-3 rounded text-center">
              <h2 className="mb-2">🎥 You</h2>
              <video ref={userVideoRef} autoPlay muted playsInline className="w-full rounded" />
            </div>
            <div className="bg-gray-700 p-3 rounded text-center">
              <h2 className="mb-2">🤖 AI Interviewer</h2>
              <video ref={aiVideoRef} muted src="/WIN_20240928_11_52_57_Pro.mp4" className="w-full rounded" />
            </div>
          </div>

          <div className="mt-6 bg-gray-800 p-4 rounded max-w-xl text-center">
            <h3 className="mb-2 font-semibold">📢 Question {questionNumber}:</h3>
            <p>{questionData.question}</p>
            {currentTopic && <p className="mt-1 text-gray-400 text-sm">Topic: {currentTopic}</p>}
          </div>

          <div className="mt-4 bg-gray-800 p-4 rounded max-w-xl text-center w-full">
            {isListening ? (
              <p className="text-green-400 font-semibold animate-pulse">🟢 Listening...</p>
            ) : (
              <button
                onClick={startListening}
                disabled={!sessionActive || timeLeft <= WARNING_TIME}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                🎤 Speak Your Answer
              </button>
            )}
            <p className="mt-2 text-sm">🗣 {userAnswer}</p>
          </div>

          {feedback && <div className="mt-3 text-yellow-300 font-semibold animate-pulse">{feedback}</div>}

          <button onClick={endSession} className="mt-6 bg-red-600 px-4 py-2 rounded hover:bg-red-700">
            ❌ End Session
          </button>
        </>
      )}
    </div>
  );
}