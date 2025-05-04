'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/CustomModal';

export default function Home() {
  // State to control the modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [time,setTime]=useState(20);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const onClose = () => setIsModalOpen(false);
  const submit= ()=>{
    setIsModalOpen(false);
    alert("Your interview has been scheduled");
  }
  return (
    <>
      <header className="text-3xl font-bold p-6 text-center text-white">Face2Hire</header>
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

      <footer className="text-center py-4 text-sm text-gray-500">
        © 2025 Face2Hire. All Rights Reserved.
      </footer>

      {/* Modal Component */}
     
    </>
  );
}
