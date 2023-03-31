import React from 'react';
import { useHistory } from 'react-router-dom';

function ThankYou() {
  const history = useHistory();

  const handleClick = () => {
    history.push('/');
  };

  return (
    <div className="bg-gray-800 h-screen w-screen text-white flex items-center flex-col justify-center">
      <div className="py-12 px-8 bg-gray-900 shadow-lg rounded">
        <h2 className="text-2xl font-semibold mb-6">Thank you for submitting your response!</h2>
        <p className="mb-6">Your input is valuable to us.</p>
        <button
          onClick={handleClick}
          className="bg-emerald-500 py-2 px-4 rounded font-semibold text-white"
        >
          Go to Home Page
        </button>
      </div>
    </div>
  );
}

export default ThankYou;
