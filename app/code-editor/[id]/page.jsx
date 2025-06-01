'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../../components/Header';
import QuestionPanel from '../../../components/QuestionPanel';
import CodeEditor from '../../../components/CodeEditor';

export default function EditorPage() {
  const containerRef = useRef(null);
  const [panelWidth, setPanelWidth] = useState(400);
  const isDragging = useRef(false);
  const [question, setQuestion] = useState(null);
  const { id } = useParams();
  //console.log('EditorPage ID:', id);
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await fetch(`/api/coding-questions/${id}`);
        const data = await res.json();
        setQuestion(data);
      } catch (error) {
        console.error('Failed to fetch question:', error);
      }
    };

    if (id) fetchQuestion();
  }, [id]);

  const startDrag = () => {
    isDragging.current = true;
  };

  const stopDrag = () => {
    isDragging.current = false;
  };

  const onDrag = (e) => {
    if (!isDragging.current) return;
    const newWidth = e.clientX - containerRef.current.getBoundingClientRect().left;
    if (newWidth > 250 && newWidth < 800) {
      setPanelWidth(newWidth);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" onMouseMove={onDrag} onMouseUp={stopDrag}>
      <Header />

      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Question Panel */}
        <div style={{ width: `${panelWidth}px` }} className="overflow-auto border-r border-gray-300 bg-white">
          <QuestionPanel question={question} />
        </div>

        {/* Resizer */}
        <div
          onMouseDown={startDrag}
          onMouseUp={stopDrag}
          className="w-1 cursor-col-resize bg-gray-300 hover:bg-gray-500"
        />

        {/* Code Editor Panel */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <CodeEditor question={question} />
        </div>
      </div>
    </div>
  );
}
