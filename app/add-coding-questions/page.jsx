'use client';

import { useState } from 'react';

export default function AddQuestionPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState(['']);
  const [publicTestCases, setPublicTestCases] = useState([{ input: '', expectedOutput: '' }]);
  const [hiddenTestCases, setHiddenTestCases] = useState([{ input: '', expectedOutput: '' }]);
  const [totalTime, setTotalTime] = useState(60);
  const [hints, setHints] = useState([{ text: '', unlockTime: 10, scoreDeduction: 5 }]);
  const [totalScore, setTotalScore] = useState(100);
  const [message, setMessage] = useState('');

  const handleTestCaseChange = (index, field, value, testCaseType) => {
    const updatedTestCases = testCaseType === 'public' ? [...publicTestCases] : [...hiddenTestCases];
    updatedTestCases[index][field] = value;

    if (testCaseType === 'public') {
      setPublicTestCases(updatedTestCases);
    } else {
      setHiddenTestCases(updatedTestCases);
    }
  };

  const addTestCase = (testCaseType) => {
    if (testCaseType === 'public') {
      setPublicTestCases([...publicTestCases, { input: '', expectedOutput: '' }]);
    } else {
      setHiddenTestCases([...hiddenTestCases, { input: '', expectedOutput: '' }]);
    }
  };

  const removeTestCase = (index, testCaseType) => {
    const updatedTestCases = testCaseType === 'public' ? [...publicTestCases] : [...hiddenTestCases];
    updatedTestCases.splice(index, 1);

    if (testCaseType === 'public') {
      setPublicTestCases(updatedTestCases);
    } else {
      setHiddenTestCases(updatedTestCases);
    }
  };

  const handleConstraintChange = (index, value) => {
    const updated = [...constraints];
    updated[index] = value;
    setConstraints(updated);
  };

  const addConstraint = () => {
    setConstraints([...constraints, '']);
  };

  const removeConstraint = (index) => {
    const updated = [...constraints];
    updated.splice(index, 1);
    setConstraints(updated);
  };

  const handleHintChange = (index, field, value) => {
    const updatedHints = [...hints];
    updatedHints[index][field] = value;
    setHints(updatedHints);
  };

  const addHint = () => {
    setHints([...hints, { text: '', unlockTime: 10, scoreDeduction: 5 }]);
  };

  const removeHint = (index) => {
    const updatedHints = [...hints];
    updatedHints.splice(index, 1);
    setHints(updatedHints);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!title || !description || !totalTime || !totalScore) {
      setMessage('❌ Please fill in all required fields.');
      return;
    }

    // Validate totalTime and totalScore are numbers
    if (isNaN(Number(totalTime)) || isNaN(Number(totalScore))) {
      setMessage('❌ Total Time and Total Score must be numbers.');
      return;
    }

    const res = await fetch('/api/coding-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        difficulty,
        inputFormat,
        outputFormat,
        constraints,
        publicTestCases,
        hiddenTestCases,
        totalTime: Number(totalTime), // Ensure it's a number
        hints,
        totalScore: Number(totalScore), // Ensure it's a number
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('✅ Question added successfully!');
      setTitle('');
      setDescription('');
      setDifficulty('easy');
      setInputFormat('');
      setOutputFormat('');
      setConstraints(['']);
      setPublicTestCases([{ input: '', expectedOutput: '' }]);
      setHiddenTestCases([{ input: '', expectedOutput: '' }]);
      setTotalTime(60);
      setHints([{ text: '', unlockTime: 10, scoreDeduction: 5 }]);
      setTotalScore(100);
    } else {
      setMessage(`❌ Failed to add: ${data.error}`);
    }
  };

  const handleTotalTimeChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and limit to a reasonable range
    if (/^\d+$/.test(value) || value === '') {
      const parsedValue = value === '' ? '' : Math.max(0, Math.min(1440, Number(value))); //Max 24 hours
      setTotalTime(parsedValue);
    }
  };

  const handleTotalScoreChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and limit to a reasonable range
    if (/^\d+$/.test(value) || value === '') {
      const parsedValue = value === '' ? '' : Math.max(0, Math.min(1000, Number(value))); // Max 1000 score
      setTotalScore(parsedValue);
    }
  };

  const handleHintUnlockTimeChange = (index, e) => {
      const value = e.target.value;
      if (/^\d+$/.test(value) || value === '') {
          const parsedValue = value === '' ? '' : Math.max(0, Math.min(1440, Number(value)));
          const updatedHints = [...hints];
          updatedHints[index].unlockTime = parsedValue;
          setHints(updatedHints);
      }
  };

  const handleHintScoreDeductionChange = (index, e) => {
      const value = e.target.value;
      if (/^\d+$/.test(value) || value === '') {
          const parsedValue = value === '' ? '' : Math.max(0, Math.min(1000, Number(value)));
          const updatedHints = [...hints];
          updatedHints[index].scoreDeduction = parsedValue;
          setHints(updatedHints);
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-3xl p-8 transition duration-300">
        <h2 className="text-3xl font-extrabold mb-6 text-blue-800">🚀 Add Coding Question</h2>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg"
            placeholder="Enter question title"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg h-28 resize-none"
            placeholder="Describe the problem"
            required
          />
        </div>

        {/* Input Format */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">Input Format</label>
          <textarea
            value={inputFormat}
            onChange={(e) => setInputFormat(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg h-20 resize-none"
            placeholder="Describe input format"
          />
        </div>

        {/* Output Format */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">Output Format</label>
          <textarea
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg h-20 resize-none"
            placeholder="Describe output format"
          />
        </div>

        {/* Constraints */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-2">Constraints</h4>
          {constraints.map((c, i) => (
            <div key={i} className="flex items-center mb-2 gap-2">
              <input
                value={c}
                onChange={(e) => handleConstraintChange(i, e.target.value)}
                placeholder={`Constraint ${i + 1}`}
                className="flex-1 p-2 border border-gray-300 rounded-lg"
              />
              {constraints.length > 1 && (
                <button onClick={() => removeConstraint(i)} className="text-red-500">❌</button>
              )}
            </div>
          ))}
          <button onClick={addConstraint} className="text-blue-600 font-semibold text-sm mt-1">
            ➕ Add Constraint
          </button>
        </div>

        {/* Difficulty */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg"
          >
            <option value="easy">Easy 💚</option>
            <option value="medium">Medium 🟡</option>
            <option value="hard">Hard 🔥</option>
          </select>
        </div>

        {/* Total Time */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">Total Time (minutes)</label>
          <input
            type="number"
            value={totalTime}
            onChange={handleTotalTimeChange}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg"
            placeholder="Enter total time in minutes"
            min="0"
            max="1440"
          />
        </div>

        {/* Total Score */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">Total Score</label>
          <input
            type="number"
            value={totalScore}
            onChange={handleTotalScoreChange}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg"
            placeholder="Enter total score for the question"
            min="0"
            max="1000"
          />
        </div>

        {/* Hints */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Hints</h4>
          {hints.map((hint, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg shadow-sm border mb-3 flex flex-col gap-2">
              <label className="block text-sm font-semibold text-gray-700">Hint Text</label>
              <textarea
                placeholder="Hint Text"
                value={hint.text}
                onChange={(e) => handleHintChange(i, 'text', e.target.value)}
                className="w-full p-2 border rounded-lg resize-vertical"
                rows="3"
              />
              <label className="block text-sm font-semibold text-gray-700">Unlock Time (minutes)</label>
              <input
                type="number"
                placeholder="Unlock Time"
                value={hint.unlockTime}
                onChange={(e) => handleHintUnlockTimeChange(i, e)}
                className="w-full p-2 border rounded-lg"
                min="0"
                max="1440"
              />
              <label className="block text-sm font-semibold text-gray-700">Score Deduction</label>
              <input
                type="number"
                placeholder="Score Deduction"
                value={hint.scoreDeduction}
                onChange={(e) => handleHintScoreDeductionChange(i, e)}
                className="w-full p-2 border rounded-lg"
                min="0"
                max="1000"
              />
              {hints.length > 1 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => removeHint(i)}
                    className="text-red-500 hover:text-red-700 transition text-xl"
                    title="Remove hint"
                  >
                    ❌
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={addHint}
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm mt-1"
          >
            ➕ Add Hint
          </button>
        </div>

        {/* Public Test Cases */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Public Test Cases</h4>
          {publicTestCases.map((tc, i) => (
            <div
              key={i}
              className="bg-gray-50 p-4 rounded-lg shadow-sm border mb-3 flex flex-col gap-2"
            >
              <label className="block text-sm font-semibold text-gray-700">Input</label>
              <textarea
                placeholder="Input"
                value={tc.input}
                onChange={(e) => handleTestCaseChange(i, 'input', e.target.value, 'public')}
                className="w-full p-2 border rounded-lg resize-vertical"
                rows="3"
              />
              <label className="block text-sm font-semibold text-gray-700">Expected Output</label>
              <textarea
                placeholder="Expected Output"
                value={tc.expectedOutput}
                onChange={(e) => handleTestCaseChange(i, 'expectedOutput', e.target.value, 'public')}
                className="w-full p-2 border rounded-lg resize-vertical"
                rows="3"
              />
              {publicTestCases.length > 1 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => removeTestCase(i, 'public')}
                    className="text-red-500 hover:text-red-700 transition text-xl"
                    title="Remove test case"
                  >
                    ❌
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => addTestCase('public')}
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm mt-1"
          >
            ➕ Add Public Test Case
          </button>
        </div>

        {/* Hidden Test Cases */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Hidden Test Cases</h4>
          {hiddenTestCases.map((tc, i) => (
            <div
              key={i}
              className="bg-gray-50 p-4 rounded-lg shadow-sm border mb-3 flex flex-col gap-2"
            >
              <label className="block text-sm font-semibold text-gray-700">Input</label>
              <textarea
                placeholder="Input"
                value={tc.input}
                onChange={(e) => handleTestCaseChange(i, 'input', e.target.value, 'hidden')}
                className="w-full p-2 border rounded-lg resize-vertical"
                rows="3"
              />
              <label className="block text-sm font-semibold text-gray-700">Expected Output</label>
              <textarea
                placeholder="Expected Output"
                value={tc.expectedOutput}
                onChange={(e) => handleTestCaseChange(i, 'expectedOutput', e.target.value, 'hidden')}
                className="w-full p-2 border rounded-lg resize-vertical"
                rows="3"
              />
              {hiddenTestCases.length > 1 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => removeTestCase(i, 'hidden')}
                    className="text-red-500 hover:text-red-700 transition text-xl"
                    title="Remove test case"
                  >
                    ❌
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => addTestCase('hidden')}
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm mt-1"
          >
            ➕ Add Hidden Test Case
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Submit Question
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mt-4 text-center">
            <p className={`text-sm font-medium ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}