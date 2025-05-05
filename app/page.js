'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/CustomModal';
import { useRouter } from 'next/navigation';

export default function Home() {
  // State to control the modal visibility
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [time, setTime] = useState(20);
  const router = useRouter();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const onClose = () => setIsModalOpen(false);
  const submit = () => {
    setIsModalOpen(false);
    router.push('/mock-session');
  };

  return (
    <>
      <header className="text-3xl font-bold p-6 text-left text-white">Face2Hire</header>
      <Modal
        submit={submit}
        time={time}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        setTime={setTime}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="flex flex-col lg:flex-row items-center justify-between px-8 py-16 bg-gray-300">
        {/* Left Side: Text & Button */}
        <div className="lg:w-1/2 m-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Ace Your Interview with AI or Real People</h1>
          <p className="text-lg text-gray-600 mb-8">
            Practice mock interviews in a realistic environment and get feedback to improve your performance.
            Choose between AI-driven simulations or real peer-to-peer interview experiences.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsModalOpen(true)} // Open the modal when clicked
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition duration-300"
            >
              Try AI Interview
            </button>

            <Link
              href="/mock-interview/people"
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition duration-300"
            >
              Try People Interview
            </Link>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="/3661727.jpg" // Make sure this exists in /public
            alt="Interview Illustration"
            width={500}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>

      {/* Why Use Face2Hire Section */}
      <section className="bg-white py-20 px-8">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Why Use Face2Hire?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-9">
          <div className="bg-gray-100 p-10 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Improve Communication Skills</h3>
            <p className="text-gray-600">
              Face2Hire helps you enhance your communication skills by practicing mock interviews, getting feedback, and refining your delivery.
            </p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Tailored Feedback</h3>
            <p className="text-gray-600">
              Receive detailed feedback from AI or real interviewers, helping you focus on areas that need improvement for your next interview.
            </p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Realistic Interview Environment</h3>
            <p className="text-gray-600">
              Our platform simulates real-life interview scenarios, giving you a safe space to practice and feel more confident.
            </p>
          </div>
        </div>
      </section>

{/* Interview Analysis and Report Section */}
<section className="bg-gray-100 py-16 px-8">
  <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Your Interview Analysis & Report</h2>
  <div className="max-w-5xl mx-auto">
    {/* Timeline */}
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 h-1 bg-gray-500 rounded-md"><h1 className='text-gray-900'>Poor</h1></div>
        <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full text-white -ml-3">1</div>
        <div className="flex-1 h-1 bg-gray-500 rounded-md"><h1 className='text-gray-900 text-right'>Excellent</h1></div>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 h-1 bg-gray-500 rounded-md"><h1 className='text-gray-900'>Poor</h1></div>
        <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full text-white -ml-3">2</div>
        <div className="flex-1 h-1 bg-gray-500 rounded-md"><h1 className='text-gray-900 text-right'>Excellent</h1></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1 h-1 bg-gray-500 rounded-md"><h1 className='text-gray-900'>Poor</h1></div>
        <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full text-white -ml-3">3</div>
        <div className="flex-1 h-1 bg-gray-500 rounded-md"><h1 className='text-gray-900 text-right'>Excellent</h1></div>
      </div>

      {/* Timeline Steps */}
      <div className="mt-12 flex justify-between">
        <div className="text-center flex-1">
          <Image
            src="/feed.jpg"
            alt="Interview Feedback"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-800">Step 1: Interview Feedback</h3>
          <p className="text-gray-600">
            Receive detailed feedback on your responses, body language, and communication.
          </p>
        </div>

        <div className="text-center flex-1">
          <Image
            src="/prog.avif"
            alt="Track Progress"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-800">Step 2: Track Progress</h3>
          <p className="text-gray-600">
            Review your performance over time and see how you improve with each session.
          </p>
        </div>

        <div className="text-center flex-1">
          <Image
            src="/report.png"
            alt="Final Report"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-800">Step 3: Final Report</h3>
          <p className="text-gray-600">
            At the end of your session, you will get a comprehensive report summarizing the interview.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>



      <footer className="text-center py-4 text-sm text-gray-500">
        © 2025 Face2Hire. All Rights Reserved.
      </footer>
    </>
  );
}
