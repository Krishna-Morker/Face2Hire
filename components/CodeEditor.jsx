'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const languageMap = {
  python: 71,
  javascript: 63,
  cpp: 54,
  java: 62,
  c: 50,
  ruby: 72,
  go: 60,
};

const defaultCodes = {
  python: `# Read an integer and print its square\nn = int(input())\nprint(n * n)`,
  javascript: `const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin, output: process.stdout });\nrl.question('', (answer) => {\n  const n = parseInt(answer);\n  console.log(n * n);\n  rl.close();\n});`,
  cpp: `#include <iostream>\nusing namespace std;\nint main() {\n  int n;\n  cin >> n;\n  cout << n * n << endl;\n  return 0;\n}`,
  java: `import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int n = sc.nextInt();\n    System.out.println(n * n);\n  }\n}`,
  c: `#include <stdio.h>\nint main() {\n  int n;\n  scanf("%d", &n);\n  printf("%d\\n", n * n);\n  return 0;\n}`,
  ruby: `n = gets.to_i\nputs n * n`,
  go: `package main\nimport "fmt"\nfunc main() {\n  var n int\n  fmt.Scan(&n)\n  fmt.Println(n * n)\n}`,
};

export default function CodeEditor({ question, updateScore }) {
  const [language, setLanguage] = useState('python');
  const [theme, setTheme] = useState('vs-dark');
  const [code, setCode] = useState(defaultCodes['python']);
  const [status, setStatus] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [customTestCases, setCustomTestCases] = useState([]);
  const [outputTabs, setOutputTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [outputHeight, setOutputHeight] = useState(200);
  const [isOutputVisible, setIsOutputVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isTestCaseVisible, setIsTestCaseVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(question?.totalTime * 60 || 3600);
  const [totalScore, setTotalScore] = useState(question?.totalScore || 100);
  const [prevScore, setPrevScore] = useState(0); // Track previous score

  const publicTestCases = question?.publicTestCases || [];
  const hiddenTestCases = question?.hiddenTestCases || [];
  const timerRef = useRef(null);

  useEffect(() => {
    setCode(defaultCodes[language]);
  }, [language]);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  useEffect(() => {
    if (question) {
      setTimeRemaining(question.totalTime * 60);
      setTotalScore(question.totalScore);
    }
  }, [question]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const onDrag = (e) => {
    if (!isDragging) return;
    setOutputHeight((prev) => Math.max(100, prev - e.movementY));
  };

  const runCode = async (testCase) => {
    try {
      const langId = languageMap[language];
      const response = await axios.post(
        'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
        {
          source_code: code,
          language_id: langId,
          stdin: testCase.input,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': process.env.NEXT_PUBLIC_CODE_EDITOR_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
        }
      );

      const result = response.data;
      const actualOutput = result.stdout?.trim();

      if (actualOutput === testCase.expectedOutput) {
        return { status: 'Passed', output: actualOutput };
      } else if (result.stderr) {
        return { status: 'Runtime Error', output: result.stderr };
      } else if (result.compile_output) {
        return { status: 'Compilation Error', output: result.compile_output };
      } else {
        return { status: 'Wrong Answer', output: actualOutput || 'No Output' };
      }
    } catch (err) {
      return { status: 'Error', output: err.message };
    }
  };

  const handleRunAll = async () => {
    setIsRunning(true);
    setStatus('Running...');
    setSelectedTab('all');
    const allTests = [...publicTestCases, ...customTestCases];
    const results = [];

    for (const test of allTests) {
      const result = await runCode(test);
      results.push(result);
    }

    setOutputTabs(results);
    const passed = results.filter((r) => r.status === 'Passed').length;
    setStatus(`${passed}/${allTests.length} Test Cases Passed`);
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setStatus('Submitting...');
    setSelectedTab('all');
    const results = [];
    let newScore = 0;

    for (let i = 0; i < hiddenTestCases.length; i++) {
      const test = hiddenTestCases[i];
      const result = await runCode(test);
      results.push(result);

      if (result.status === 'Passed') {
        newScore += question.totalScore / hiddenTestCases.length;
      }
    }

    // Update total score
    //const currentScore = totalScore - prevScore + newScore;

    // Update state with new score
    updateScore(currentScore => currentScore + Math.floor(newScore)-prevScore);
    setPrevScore(Math.floor(newScore));

    setOutputTabs(results);
    const passed = results.filter((r) => r.status === 'Passed').length;
    setStatus(`Hidden Test Cases: ${passed}/${hiddenTestCases.length} Passed`);
    setIsRunning(false);

    clearInterval(timerRef.current);
   
  };

  const addCustomTestCase = () => {
    setCustomTestCases([...customTestCases, { input: '', expectedOutput: '' }]);
  };

  const updateCustomTestCase = (index, field, value) => {
    const updated = [...customTestCases];
    updated[index][field] = value;
    setCustomTestCases(updated);
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="flex w-full h-screen overflow-hidden" onMouseMove={onDrag}>
      <div className={`flex flex-col p-4 transition-all duration-300 ${isTestCaseVisible ? 'w-full md:w-2/3' : 'w-full'}`}>
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="p-2 border rounded cursor-pointer hover:shadow">
            {Object.keys(languageMap).map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>

          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="p-2 border rounded cursor-pointer hover:shadow">
            <option value="vs-dark">Dark</option>
            <option value="light">Light</option>
          </select>

          <button onClick={handleRunAll} disabled={isRunning} className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-4 py-2 rounded transition">
            Run All
          </button>
          <button onClick={handleSubmit} disabled={isRunning || timeRemaining <= 0} className="bg-green-500 hover:bg-green-600 cursor-pointer text-white px-4 py-2 rounded transition">
            Submit
          </button>
          <button onClick={addCustomTestCase} className="bg-purple-500 hover:bg-purple-600 cursor-pointer text-white px-4 py-2 rounded transition">
            Add Test Case
          </button>

          <button
            onClick={() => setIsTestCaseVisible(!isTestCaseVisible)}
            className="ml-auto bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded cursor-pointer text-sm"
          >
            {isTestCaseVisible ? 'Hide Test Cases' : 'Show Test Cases'}
          </button>
        </div>

        <div className="flex-1 border rounded overflow-hidden min-h-[300px]">
          <MonacoEditor
            height="100%"
            language={language}
            value={code}
            onChange={(val) => setCode(val)}
            theme={theme}
            options={{ fontSize: 14, automaticLayout: true, minimap: { enabled: false } }}
          />
        </div>

        <div className="relative mt-2">
          <button
            onClick={() => setIsOutputVisible(!isOutputVisible)}
            className="absolute right-0 -top-6 px-2 py-1 bg-gray-300 rounded text-xs cursor-pointer hover:bg-gray-400"
          >
            {isOutputVisible ? 'Hide Output' : 'Show Output'}
          </button>

          {isOutputVisible && (
            <>
              <div className="h-2 cursor-row-resize bg-gray-400" onMouseDown={() => setIsDragging(true)} />
              <div className="bg-gray-100 p-4 rounded border" style={{ height: `${outputHeight}px` }}>
                <p className="mb-2 font-semibold">Status: <span className="font-bold">{status}</span></p>
                <div className="flex gap-2 overflow-x-auto mb-2">
                  <button
                    onClick={() => setSelectedTab('all')}
                    className={`px-3 py-1 rounded cursor-pointer transition ${selectedTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
                  >
                    All Results
                  </button>
                  {outputTabs.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTab(idx)}
                      className={`px-3 py-1 rounded cursor-pointer transition ${selectedTab === idx ? 'bg-blue-600 text-white' : 'bg-white border'}`}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>

                {selectedTab === 'all' ? (
                  outputTabs.length > 0 ? (
                    outputTabs.map((r, i) => (
                      <pre key={i} className="bg-black text-green-400 p-2 rounded mb-2 text-sm">
                        {`Test Case ${i + 1}: ${r.status}\nOutput: ${r.output}`}
                      </pre>
                    ))
                  ) : (
                    <pre className="bg-black text-gray-300 p-2 rounded text-sm">No output yet...</pre>
                  )
                ) : (
                  outputTabs[selectedTab] && (
                    <pre className="bg-black text-green-400 p-2 rounded text-sm whitespace-pre-wrap">
                      {`Test Case ${selectedTab + 1}: ${outputTabs[selectedTab].status}\nOutput: ${outputTabs[selectedTab].output}`}
                    </pre>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isTestCaseVisible && (
        <div className="w-full md:w-1/3 p-4 overflow-y-auto border-l transition-all">
          <h3 className="font-bold text-lg mb-2">Test Cases</h3>
          {publicTestCases.map((tc, idx) => (
            <div key={idx} className="p-2 border rounded bg-white mb-2">
              <div><strong>Input:</strong><pre>{tc.input.trim()}</pre></div>
              <div><strong>Expected:</strong><pre>{tc.expectedOutput}</pre></div>
            </div>
          ))}
          {customTestCases.map((tc, idx) => (
            <div key={idx} className="p-2 border rounded bg-white mb-2 space-y-1">
              <div>
                <label className="text-sm font-semibold">Input:</label>
                <textarea value={tc.input} onChange={(e) => updateCustomTestCase(idx, 'input', e.target.value)} className="w-full p-1 border rounded text-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold">Expected Output:</label>
                <textarea value={tc.expectedOutput} onChange={(e) => updateCustomTestCase(idx, 'expectedOutput', e.target.value)} className="w-full p-1 border rounded text-sm" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}