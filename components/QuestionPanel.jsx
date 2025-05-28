'use client';
import React from 'react';

export default function QuestionPanel() {
  return (
    <aside className="bg-gray-100 border-r border-gray-300 p-6 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📘 Coding Question</h2>

      {/* Description */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📝 Description</h3>
        <p className="text-gray-600 leading-relaxed">
          Write a program that reads an integer and prints its square.
        </p>
      </section>

      {/* Input Format */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">🔢 Input</h3>
        <p className="text-gray-600">5</p>
      </section>

      {/* Output Format */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📤 Output</h3>
        <p className="text-gray-600">25</p>
      </section>

      {/* Constraints */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📌 Constraints</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>1 ≤ n ≤ 1000</li>
          <li>Input is a single integer</li>
          <li>Use standard input/output</li>
        </ul>
      </section>

      {/* Languages */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">🌐 Allowed Languages</h3>
        <p className="text-gray-600">Python, JavaScript, C++</p>
      </section>
    </aside>
  );
}
