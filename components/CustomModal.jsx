import { useState } from "react";


export default function Modal({ submit,isOpen, onClose,time, setTime, selectedOptions, setSelectedOptions }) {
  if (!isOpen) return null;
  const options = ["Frontend", "Backend", "DevOps", "AI/ML", "Design", "React-js", ];

  const toggleDropdown = () => setopen((prev) => !prev);
  const [open, setopen] = useState(false);
  const handleCheckboxChange = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleDurationChange = (e) => {
    setTime(e.target.value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-white w-1/2 h-[65vh] p-8 rounded-lg shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Start Your Interview Session</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-500 text-2xl"
            >
              &times;
            </button>
          </div>

          <p className="text-gray-600 mb-6">
          Prepare effectively by selecting a focus duration and choosing the topics you want to practice for your interview session.
          </p>

          <label className="block mb-4 text-gray-700 font-medium">
            Select a duration:
            <select
              value={time} // bind the dropdown value to the state
              onChange={handleDurationChange} // handle change
              className="mt-2 block w-full px-4 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="20">20 Minutes</option>
              <option value="40">40 Minutes</option>
              <option value="50">50 Minutes</option>
              <option value="60">60 Minutes</option>
            </select>
          </label>
          <label className="block mb-4 text-gray-700 font-medium">
  Select Topics:
</label>
<div className="relative w-full">
  <button
    onClick={toggleDropdown}
    className="w-full px-4 py-2 bg-white rounded-md shadow-sm text-left text-black border focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    {selectedOptions.length === 0
      ? "Select Topics"
      : selectedOptions.join(", ")}
  </button>

  {open && (
  <div className="absolute mt-2 w-full border bg-white rounded-md shadow-lg text-black z-50 max-h-48 overflow-y-auto">
    {options.map((option) => (
      <label
        key={option}
        className="flex border-white items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
      >
        <input
          type="checkbox"
          className="form-checkbox h-4 w-4 mr-2"
          checked={selectedOptions.includes(option)}
          onChange={() => handleCheckboxChange(option)}
        />
        {option}
      </label>
    ))}
  </div>
)}

</div>



        </div>

        <div className="flex justify-center">
          <button
            onClick={submit}
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition"
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}
