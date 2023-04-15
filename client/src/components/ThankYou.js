import React from 'react';
import { useHistory, Link } from 'react-router-dom';
import Logo from "../assets/onchain-surveys-logo.svg";

function ThankYou() {
  const history = useHistory();

  const handleClick = () => {
    history.push('/');
  };

  return (
    <div className="bg-slate-800 h-screen w-screen text-slate-200 flex items-center flex-col justify-center">
    <div name="logo" className="absolute left-0 top-0 w-44 h-36 flex justify-center items-center p-8">
        <Link to="/">
          <img src={Logo} alt="logo" width="512px" />
        </Link>
      </div>
      <div className="py-12 px-8 bg-slate-700 shadow-lg rounded">
        <h2 className="text-2xl font-semibold mb-6">Thank you for submitting your response!</h2>
        <p className="mb-6">Your input is valuable to us.</p>
        <button
          onClick={handleClick}
          className="bg-red-500 py-2 px-4 rounded font-semibold text-white"
        >
          Go to Home Page
        </button>
      </div>
    </div>
  );
}

export default ThankYou;
