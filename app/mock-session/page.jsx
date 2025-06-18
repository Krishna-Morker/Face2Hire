"use client";
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

const TOPICS = ["Operating Systems", "OOP", "DBMS", "Computer Networks"];
const SESSION_DURATION = 10 * 60 * 1000;
const WARNING_TIME = 1 * 60 * 1000;

export default function VideoSession() {
  const userVideoRef = useRef(null);
  const aiVideoRef = useRef(null);

  const [sessionActive, setSessionActive] = useState(false);
  const [questionData, setQuestionData] = useState({ question: "", concept: "" });
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [askedConcepts, setAskedConcepts] = useState([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [currentTopic, setCurrentTopic] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [warningSpoken, setWarningSpoken] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [allowSpeak, setAllowSpeak] = useState(true);

  useEffect(() => {
    let timer;
    if (sessionActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1000), 1000);
    } else if (timeLeft <= 0 && sessionActive) {
      setTimerExpired(true);
      setSessionActive(false);
      setAllowSpeak(false);
      stopStream();
      speak("🕒 Time's up! Thanks for attending the interview. Please click the End Session button.");
    }

    if (timeLeft <= WARNING_TIME && !warningSpoken) {
      setWarningSpoken(true);
      speak("⏳ Just 1 minute remaining. Please wrap up your answers.");
    }

    return () => clearInterval(timer);
  }, [timeLeft, sessionActive, warningSpoken]);

  const startSession = async () => {
    setSessionActive(true);
    setAllowSpeak(true);
    setWarningSpoken(false);
    setTimeLeft(SESSION_DURATION);
    setAskedConcepts([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (userVideoRef.current) userVideoRef.current.srcObject = stream;

      const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      setCurrentTopic(randomTopic);
      setQuestionNumber(1);

      const data = await fetchQuestion(randomTopic);
      setQuestionData(data);
      speak(`Welcome to Face2Hire Mock Interview. We'll start with ${randomTopic}. Here's your first question: ${data.question}`);
    } catch (err) {
      console.error("Error accessing camera/mic:", err);
    }
  };

  const endSession = () => {
    setSessionActive(false);
    setAllowSpeak(false);
    setAskedQuestions([]);
    setAskedConcepts([]);
    setCurrentTopic(null);
    setQuestionData({ question: "", concept: "" });
    setQuestionNumber(0);
    setIsListening(false);
    setUserAnswer("");
    setFeedback("");
    setWarningSpoken(false);
    setTimeLeft(SESSION_DURATION);
    stopStream();

    if (aiVideoRef.current) {
      aiVideoRef.current.pause();
      aiVideoRef.current.currentTime = 0;
    }
  };

  const stopStream = () => {
    const stream = userVideoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      userVideoRef.current.srcObject = null;
    }
  };

  const speak = (text) => {
    if (!allowSpeak) return;
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    if (aiVideoRef.current) aiVideoRef.current.play();
    synth.speak(utter);
    utter.onend = () => {
      if (aiVideoRef.current) {
        aiVideoRef.current.pause();
        aiVideoRef.current.currentTime = 0;
      }
    };
  };

  const startListening = () => {
    if (!sessionActive || timerExpired) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return console.error("Speech Recognition not supported");

    const recog = new SR();
    recog.lang = "en-US";
    recog.interimResults = true;
    recog.continuous = true;

    setUserAnswer("");
    setFeedback("");
    setIsListening(true);

    let finalTranscript = "";
    let silenceTimeout = setTimeout(() => recog.stop(), 8000);

    recog.onresult = (e) => {
      clearTimeout(silenceTimeout);
      silenceTimeout = setTimeout(() => recog.stop(), 8000);

      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const text = res[0].transcript;
        if (res.isFinal) finalTranscript += text + " ";
        else interim += text;
      }
      setUserAnswer(finalTranscript + interim);
    };

    recog.onerror = (err) => {
      console.error("Recognition Error:", err);
      setIsListening(false);
    };

    recog.onend = async () => {
      setIsListening(false);
      if (finalTranscript.trim()) {
        await evaluateAnswer(finalTranscript);
      } else {
        speak("I didn't catch that. Please try again.");
      }
    };

    recog.start();
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
    } catch (err) {
      console.error("Fetch question failed:", err);
      return { question: "Let's continue with the next question.", concept: null };
    }
  };

 const evaluateAnswer = async (answerText) => {
  try {
    await axios.post("/api/evaluate-answer", {
      question: questionData.question,
      userAnswer: answerText,
      topic: currentTopic,
    });

    const next = questionNumber + 1;
    setFeedback("✅ Good answer. Moving on...");

    // End current topic section
    if (next > 4 || timerExpired) {
      speak(`✅ That's it for the ${currentTopic} section.`);

      // Pick a new topic that hasn't been used yet
      const remainingTopics = TOPICS.filter(topic => topic !== currentTopic);
      if (remainingTopics.length > 0 && !timerExpired) {
        const newTopic = remainingTopics[Math.floor(Math.random() * remainingTopics.length)];
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
      // Continue current topic
      setQuestionNumber(next);
      const data = await fetchQuestion(currentTopic);
      setQuestionData(data);
      speak(`Question ${next}: ${data.question}`);
    }
  } catch (err) {
    console.error("Evaluation failed:", err);
    setFeedback("⚠️ Sorry, could not evaluate your response.");
  }
};

  const formatTime = (ms) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      {!sessionActive ? (
        <button onClick={startSession} className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700">
          🎬 Start Mock Interview
        </button>
      ) : (
        <>
          <div className="text-sm text-gray-400 mt-2">⏱ Time Left: {formatTime(timeLeft)}</div>

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

          <div className="mt-6 bg-gray-800 p-4 rounded max-w-xl text-center shadow">
            <h3 className="mb-2 font-semibold">📢 Question {questionNumber}:</h3>
            <p>{questionData.question}</p>
            {currentTopic && (
              <p className="mt-1 text-gray-400 text-sm">Topic: {currentTopic}</p>
            )}
          </div>

          <div className="mt-4 bg-gray-800 p-4 rounded max-w-xl w-full text-center">
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

          {feedback && (
            <div className="mt-3 text-yellow-300 font-semibold animate-pulse">{feedback}</div>
          )}

          <button onClick={endSession} className="mt-6 bg-red-600 px-4 py-2 rounded hover:bg-red-700">
            ❌ End Session
          </button>
        </>
      )}
    </div>
  );
}