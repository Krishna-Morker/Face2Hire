'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const score = searchParams.get('score') || '0';
  const total = searchParams.get('total') || '0';

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">🎉 Thank You!</h1>
        <p className="text-lg mb-2">You have completed the challenge.</p>
        <p className="text-xl font-semibold text-green-600">
          Your Score: {score} / {total}
        </p>
      </div>
    </div>
  );
}
