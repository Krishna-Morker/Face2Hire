'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

export default function QuestionPanel() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <aside className="p-6">Loading...</aside>;
  }

  if (!question) {
    return <aside className="p-6 text-red-600">Question not found.</aside>;
  }

  return (
    <aside className="bg-gray-100 border-r border-gray-300 p-6 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📘 Coding Question</h2>

      {/* Description */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📝 Description</h3>
        <p className="text-gray-600 leading-relaxed">{question.description}</p>
      </section>

      {/* Input Format */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">🔢 Input</h3>
        <p className="text-gray-600">{question.inputFormat}</p>
      </section>

      {/* Output Format */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📤 Output</h3>
        <p className="text-gray-600">{question.outputFormat}</p>
      </section>

      {/* Constraints */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📌 Constraints</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          {question.constraints?.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </section>

      {/* Languages */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">🌐 Allowed Languages</h3>
        <p className="text-gray-600">{question.language?.join(', ')}</p>
      </section>

      {/* Public Test Cases (Optional UI) */}
      {question.publicTestCases?.length > 0 && (
        <section className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">✅ Sample Test Cases</h3>
          <ul className="space-y-2">
            {question.publicTestCases.map((testCase, i) => (
              <li key={i} className="bg-white p-3 rounded-md shadow-sm border">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  <strong>Input:</strong><br />{testCase.input}
                </p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                  <strong>Expected Output:</strong><br />{testCase.expectedOutput}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
