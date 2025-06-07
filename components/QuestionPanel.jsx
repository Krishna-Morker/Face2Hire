'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Lock, Unlock } from 'lucide-react';

export default function QuestionPanel({ timeRemaining, deductScore }) {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableHints, setAvailableHints] = useState([]);
  const [displayedHints, setDisplayedHints] = useState([]);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(`/api/coding-questions/${id}`);
        setQuestion(response.data);
      } catch (error) {
        console.error('Failed to fetch question:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchQuestion();
  }, [id]);

  useEffect(() => {
    if (question && question.hints && timeRemaining !== null) {
      const unlocked = question.hints.filter(
        (hint) => question.totalTime * 60 - timeRemaining >= hint.unlockTime * 60
      );
      setAvailableHints(unlocked);
    }
  }, [question, timeRemaining]);

const handleHintClick = (hint) => {
  const alreadyDisplayed = displayedHints.find((h) => h.text === hint.text);
  if (!alreadyDisplayed) {
    setDisplayedHints((prev) => [...prev, hint]);
    deductScore(hint.scoreDeduction); // ✅ Correct usage
  }
};


  if (loading) return <aside className="p-6">Loading...</aside>;
  if (!question) return <aside className="p-6 text-red-600">Question not found.</aside>;

  return (
    <aside className="bg-white border-r border-gray-200 p-6 overflow-y-auto h-full space-y-6 text-gray-800">
      <h2 className="text-2xl font-bold mb-2">📘 Coding Question</h2>

      {/* Description, Input, Output */}
      {[
        ['📝 Description', question.description],
        ['🔢 Input Format', question.inputFormat],
        ['📤 Output Format', question.outputFormat],
      ].map(([label, content], idx) => (
        <div key={idx} className="space-y-1">
          <h3 className="font-semibold text-gray-700">{label}</h3>
          <p className="text-sm">{content}</p>
        </div>
      ))}

      {/* Constraints */}
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-700">📌 Constraints</h3>
        <ul className="list-disc list-inside text-sm space-y-0.5">
          {question.constraints?.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </div>

      {/* Hints */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">💡 Hints</h3>
        {availableHints.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No hints available yet.</p>
        ) : (
          <ul className="space-y-2">
            {availableHints.map((hint, i) => {
              const unlocked = displayedHints.find((h) => h.text === hint.text);
              return (
                <li
                  key={i}
                  className={`flex items-start gap-2 p-2 rounded-md border transition-all ${
                    unlocked ? 'bg-green-50 border-green-300' : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                  }`}
                  onClick={() => !unlocked && handleHintClick(hint)}
                >
                  {unlocked ? (
                    <Unlock className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500 mt-0.5" />
                  )}
                  <div className="text-sm">
                    {unlocked ? (
                      <p>
                        <strong>Hint {i + 1}:</strong> {hint.text}
                      </p>
                    ) : (
                      <p className="text-blue-600 hover:underline">
                        Unlock Hint {i + 1} (−{hint.scoreDeduction} pts)
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Languages */}
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-700">🌐 Allowed Languages</h3>
        <p className="text-sm">{question.language?.join(', ')}</p>
      </div>

      {/* Test Cases */}
      {question.publicTestCases?.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">✅ Sample Test Cases</h3>
          <ul className="space-y-2 text-sm">
            {question.publicTestCases.map((tc, i) => (
              <li key={i} className="border rounded p-2 bg-gray-50">
                <p className="whitespace-pre-wrap">
                  <strong>Input:</strong><br />{tc.input}
                </p>
                <p className="mt-1 whitespace-pre-wrap">
                  <strong>Expected Output:</strong><br />{tc.expectedOutput}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
