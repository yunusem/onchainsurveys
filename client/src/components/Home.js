import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import Logo from "../assets/casper-logo.svg";
import { fetchSurveys, loginWithWallet } from '../api';
import Logout from './Logout';
import CasperWalletContext from './CasperWalletContext';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const history = useHistory();
  const provider = useContext(CasperWalletContext);
  const location = useLocation();
  const signature = location.state && location.state.signature;
  localStorage.setItem('x-casper-provided-signature', signature);

  function removeItems() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('active_public_key');
    localStorage.removeItem('user_already_signed');
    localStorage.removeItem('x-casper-provided-signature');
  }

  const handleWalletLogin = async (e) => {
    e.preventDefault();
    try {
      const isConnected = await provider.requestConnection();
      if (isConnected) {
        const walletAddress = await provider.getActivePublicKey();
        const response = await loginWithWallet(walletAddress);
        if (response.success) {
          localStorage.setItem('active_public_key', walletAddress);
          history.push('/login');
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    const walletAddress = localStorage.getItem("active_public_key");
    const signature = localStorage.getItem('x-casper-provided-signature');

    if (token && signature && walletAddress) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [signature]);

  useEffect(() => {
    async function loadSurveys() {
      try {
        const response = await fetchSurveys();
        setSurveys(response);
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
      }
    }
    if (isAuthenticated) {
      loadSurveys();
    }
  }, [isAuthenticated]);

  const handleTakeSurvey = (id) => {
    history.push(`/survey/${id}`);
  };

  useEffect(() => {
    const handleEvent = async (event) => {
      try {
        const state = JSON.parse(event.detail);
        if (!state.isConnected) {
          removeItems();
        }
      } catch (err) {
        console.error('Failed to handle event:', err);
      }
    };

    const CasperWalletEventTypes = window.CasperWalletEventTypes;
    window.addEventListener(CasperWalletEventTypes.Disconnected, handleEvent);
    window.addEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleEvent);

    return () => {
      window.removeEventListener(CasperWalletEventTypes.Disconnected, handleEvent);
      window.removeEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleEvent);
    };
  }, []);


  return (
    <div className="bg-gray-700 text-center h-screen w-screen text-white flex items-center flex flex-col justify-center">
      <img src={Logo} alt="logo" width="72px" />
      <h1 className="text-2xl font-semibold mt-4">
        Welcome to Onchain Surveys
      </h1>
      {isAuthenticated ? (
        <div>
          <h2 className="mt-6">You are logged in with {`Wallet address: ${localStorage.getItem('active_public_key')}`}</h2>
          <div className="flex items-center mt-6">
            <Link
              to="/surveys/new"
              className="bg-red-500 py-2 px-4 rounded font-semibold text-white mx-4"
            >
              Create Survey
            </Link>
            <Link
              to="/surveys"
              className="bg-red-500 py-2 px-4 rounded font-semibold text-white mx-4"
            >
              My Surveys
            </Link>
          </div>
          <Logout />
          <div className="flex flex-col w-full items-center justify-items-center mt-12">
            <h2 className="p-8">Available Surveys</h2>
            <ul className="w-full flex flex-col items-center">
              {surveys.map((survey) =>
                survey.createdBy && (
                  <li
                    key={survey._id}
                    className="bg-gray-800 p-6 rounded-xl mb-6 w-3/4"
                  >
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-2 justify-items-start">
                        {survey.title}
                      </div>
                      <div>Reward: {survey.rewardPerResponse} CSPR</div>
                      <div className="justify-items-end">
                        <button
                          className="bg-red-500 rounded font-semibold px-4 text-white"
                          onClick={() => handleTakeSurvey(survey._id)}
                        >
                          Take Survey
                        </button>
                      </div>
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <button
            className="bg-red-500 py-3 rounded-xl font-semibold px-5 text-white w-72"
            onClick={handleWalletLogin}
          >
            Connect Wallet
          </button>
          <p className="mt-2 font-medium text-sm">
            Do you have Casper Wallet?
            <a href="https://www.casperwallet.io/download">
              <span className="text-red-500 font-semibold"> Download</span>
            </a>
          </p>
        </div>
      )}
    </div>
  );
  

}

export default Home;
