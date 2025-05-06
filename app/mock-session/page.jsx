'use client';
import React, { useRef, useState } from 'react';
import axios from 'axios';

const TOPICS = ['Operating Systems', 'OOP', 'DBMS', 'Computer Networks'];

export default function VideoSession() {
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [question, setQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const [currentTopic, setCurrentTopic] = useState(null);
  const [interviewStage, setInterviewStage] = useState('topic-check');
  const [questionCount, setQuestionCount] = useState(0);
  const userVideoRef = useRef(null);
  const aiVideoRef = useRef(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  function close() {
    setIsSessionStarted(false);
    setQuestion('');
    setUserAnswer('');
    setEvaluation('');
    setCurrentTopic(null);
    setInterviewStage('topic-check');
    setConversationHistory([]);
    setQuestionCount(0);
  }

  const startSession = async () => {
    setIsSessionStarted(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }

      // Initial greeting and topic check
      const initialPrompt = `Hi there... Ready for a mock interview? Which topic would you like to discuss: ${TOPICS.join(', ')}?`;
      setQuestion(initialPrompt);
      speakText(initialPrompt);
      setConversationHistory([{ role: 'assistant', content: initialPrompt }]);
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const speakText = (text) => {
    if (aiVideoRef.current) aiVideoRef.current.play();
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    synth.speak(utter);
    utter.onend = () => {
      if (aiVideoRef.current) {
        aiVideoRef.current.pause();
        aiVideoRef.current.currentTime = 0;
      }
    };
  };

  const handleStartListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      console.error('Speech Recognition not available in this browser.');
      return;
    }
  
    const recog = new SR();
    recog.lang = 'en-US';
    recog.interimResults = true;
    recog.maxAlternatives = 1;
    recog.continuous = true; // Add continuous mode
  
    let finalTranscript = '';
    let silenceTimer;
    const SILENCE_TIMEOUT = 10000; // 5 seconds of silence
  
    // Reset states when starting new recognition
    setUserAnswer('');
    setEvaluation('');
  
    recog.onresult = (event) => {
      // Reset the silence timer on each result
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        recog.stop();
      }, SILENCE_TIMEOUT);
  
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      
      // Update UI with both final and interim results
      setUserAnswer(finalTranscript + interim);
    };
  
    recog.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      clearTimeout(silenceTimer);
    };
  
    recog.onend = async () => {
      clearTimeout(silenceTimer);
      
      if (finalTranscript.trim()) {
        await handleUserResponse(finalTranscript);
      } else {
        const retryPrompt = "I didn't hear your response. Please try speaking again.";
        setQuestion(retryPrompt);
        speakText(retryPrompt);
      }
    };
  
    // Start the initial silence timer
    silenceTimer = setTimeout(() => {
      recog.stop();
    }, SILENCE_TIMEOUT);
  
    recog.start();
  };
  
  

  const handleUserResponse = async (transcript) => {
    if (interviewStage === 'finished') return;
    if (interviewStage === 'topic-check') {
      await handleTopicSelection(transcript);
    } else if (interviewStage === 'question-answered') {
      await evaluateAnswer(transcript);
    }
  };
  

  const handleTopicSelection = async (transcript) => {

    const topicSynonyms = {
      "Operating Systems": ["operating systems", "operating system"],
      OOP: ["oop"],
      DBMS: ["dbms", "database management system", "databases"],
      "Computer Networks": ["computer networks", "computer network", "networks", "network"]
    };

    let selectedTopic = null;
    const lowerTranscript = transcript.toLowerCase();
    for (const [topic, synonyms] of Object.entries(topicSynonyms)) {
      if (synonyms.some((syn) => lowerTranscript.includes(syn))) {
        selectedTopic = topic;
        break;
      }
    }

    if (!selectedTopic) {
      const prompt = `Sorry, I didn't catch that. Please choose from: ${Object.keys(topicSynonyms).join(', ')}`;
      setQuestion(prompt);
      speakText(prompt);
      return;
    }

    setCurrentTopic(selectedTopic);
    setInterviewStage('question-answered');
    setQuestionCount(0); // reset question counter for new topic

    // Ask confirmation and first question
    const confirmationPrompt = `Great choice! You selected ${selectedTopic}. Let's start with a basic question: `;
    const questionPrompt = await generateQuestion(selectedTopic);
    const fullPrompt = confirmationPrompt + questionPrompt;
    setQuestion(fullPrompt);
    speakText(fullPrompt);
  };

  const generateQuestion = async (topic) => {
    try {
      const res = await axios.post('/api/ask-question', {
        question: `Ask a medium-easy theory question about ${topic}`
      });
      return res.data.answer;
    } catch (error) {
      console.error("Error generating question:", error);
      return "Let's start with a question...";
    }
  };
  const evaluateAnswer = async (transcript) => {
    try {
     // console.log("Evaluating answer:", transcript, "for question:", question);
      const res = await axios.post('/api/evaluate-answer', {
        question,
        userAnswer: transcript,
        topic: currentTopic
      });
     // console.log("Evaluation response:", res.data);
  
     
        setEvaluation("Let's Move on to next Question!");
    
  
      const nextCount = questionCount + 1;
      setQuestionCount(nextCount);
  
      // Change topic after 4 questions on the current topic.
      if (nextCount >= 4) {
        const topicPrompt = `You've answered 4 questions on ${currentTopic}. Let's choose another topic. Which topic would you like to discuss next: ${TOPICS.join(
          ", "
        )}?`;
        setQuestion(topicPrompt);
        speakText(topicPrompt);
        setInterviewStage('topic-check');
      } else {
        // Ask next question on same topic
        const nextQ = await generateQuestion(currentTopic);
        const nextPrompt = `Next question: ${nextQ}`;
        setQuestion(nextPrompt);
        speakText(nextPrompt);
      }
    } catch (error) {
      console.error("Error evaluating the answer:", error);
      setEvaluation("Error evaluating your answer, please try again.");
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white">
      {!isSessionStarted ? (
        <button
          onClick={startSession}
          className="mb-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Start Session
        </button>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="bg-gray-700 p-4 rounded text-center">
              <h2 className="mb-2">You</h2>
              <video ref={userVideoRef} autoPlay muted playsInline className="w-full rounded" />
            </div>
            <div className="bg-gray-700 p-4 rounded text-center">
              <h2 className="mb-2">AI Interviewer</h2>
              <video
                ref={aiVideoRef}
                muted
                controls={false}
                src="/WIN_20240928_11_52_57_Pro.mp4"
                className="w-full rounded"
              />
            </div>
          </div>

          <div className="mt-6 bg-gray-800 p-4 rounded shadow w-full max-w-xl text-center">
            <h3 className="mb-2">AI Question:</h3>
            <p>{question}</p>
            {currentTopic && <p className="mt-2 text-sm text-gray-400">Current topic: {currentTopic}</p>}
          </div>

          <div className="mt-6 bg-gray-800 p-4 rounded shadow w-full max-w-xl text-center">
            <button
              onClick={handleStartListening}
              className="mt-4 bg-green-600 px-4 py-2 rounded hover:bg-green-700"
            >
              🎤 Speak Your Answer
            </button>
            <p className="mt-2">
              Your answer: <span className="font-medium">{userAnswer}</span>
            </p>
          </div>

          {evaluation && (
            <div className="mt-4 text-lg font-semibold animate-pulse">
              {evaluation}
            </div>
          )}

          <button
            onClick={close}
            className="mt-6 bg-red-600 px-4 py-2 rounded hover:bg-red-700"
          >
            End Session
          </button>
        </>
      )}
    </div>
  );
}