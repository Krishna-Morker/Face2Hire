'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/CustomModal';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [time, setTime] = useState(20);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const router = useRouter();

  const submit = () => {
    setIsModalOpen(false);
    router.push('/mock-session');
  };

  return (
    <>
      <header className="text-3xl font-bold p-6 text-left text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
        Face2Hire
      </header>

      <Modal
        submit={submit}
        time={time}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        setTime={setTime}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <section className="flex flex-col lg:flex-row items-center justify-between px-8 py-16 bg-gradient-to-br from-gray-200 to-gray-300">
        <div className="lg:w-1/2 m-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Ace Your Interview with AI or Real People</h1>
          <p className="text-lg text-gray-700 mb-8">
            Practice mock interviews in a realistic environment and get feedback to improve your performance.
            Choose between AI-driven simulations or real peer-to-peer interview experiences.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105 hover:bg-blue-700 hover:shadow-lg cursor-pointer"
            >
              Try AI Interview
            </button>
            <Link
              href="/mock-interview/people"
              className="bg-green-600 hover:scale-105 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition duration-300 cursor-pointer"
            >
              Try People Interview
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <Image src="/3661727.jpg" alt="Interview Illustration" width={500} height={400} className="rounded-lg shadow-lg" />
        </div>
      </section>

      <section className="bg-white py-20 px-8">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-12">Why Use Face2Hire?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              title: 'Improve Communication Skills',
              desc: 'Enhance your skills with practice sessions and constructive feedback.',
              icon: '🗣️',
            },
            {
              title: 'Tailored Feedback',
              desc: 'AI or human-generated insights help you improve precisely.',
              icon: '📋',
            },
            {
              title: 'Realistic Interview Environment',
              desc: 'Feel the pressure in a simulated but safe space.',
              icon: '🎯',
            },
          ].map((item, i) => (
            <div key={i} className="bg-gray-100 p-8 rounded-lg shadow-lg text-center transition hover:shadow-xl">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-20 px-8">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-12">Your Interview Analysis & Report</h2>
        <div className="max-w-5xl mx-auto">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center justify-between mb-6">
              <div className="flex-1 h-1 bg-gray-500 rounded-md"><h1 className="text-gray-900">Poor</h1></div>
              <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full text-white -ml-3">{step}</div>
              <div className="flex-1 h-1 bg-gray-500 rounded-md text-right"><h1 className="text-gray-900">Excellent</h1></div>
            </div>
          ))}

          <div className="mt-12 flex flex-wrap justify-between items-start gap-6">
            {[
              {
                title: 'Step 1: Interview Feedback',
                img: '/feed.jpg',
                desc: 'Receive detailed feedback on your responses, body language, and communication.',
              },
              {
                title: 'Step 2: Track Progress',
                img: '/prog.avif',
                desc: 'Review your performance over time and see how you improve with each session.',
              },
              {
                title: 'Step 3: Final Report',
                img: '/report.png',
                desc: 'At the end of your session, you will get a comprehensive report summarizing the interview.',
              },
            ].map((item, i) => (
              <div key={i} className="text-center flex-1 min-w-[250px]">
                <Image src={item.img} alt={item.title} width={80} height={80} className="mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center py-4 text-sm text-gray-500">
        © 2025 Face2Hire. All Rights Reserved.
      </footer>
    </>
  );
}
