'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [questions, setQuestions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch('/api/coding-questions');
      const data = await res.json();
      setQuestions(data);
    };
    fetchQuestions();
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">📚 Coding Question Bank</h2>

        {questions.length === 0 ? (
          <p className="text-center text-gray-500">No questions available.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {questions.map((q) => (
              <div
                key={q._id}
                onClick={() => router.push(`/code-editor/${q._id}`)}
                className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{q.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{q.description}</p>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${getDifficultyColor(
                    q.difficulty
                  )}`}
                >
                  {q.difficulty.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
