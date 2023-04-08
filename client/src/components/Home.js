import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { fetchSurveys, loginWithWallet } from '../api';
import CasperWalletContext from './CasperWalletContext';
import { useUserActivation } from './UserActivationContext';
import NavigationBar from './NavigationBar';

function Home() {
  // Define state variables and hooks
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [userIsActivated] = useUserActivation();
  const history = useHistory();
  const provider = useContext(CasperWalletContext);

  // Retrieve user signature and ID from localStorage
  const signature = localStorage.getItem('x_casper_provided_signature');
  const userId = localStorage.getItem('userId');

  // Define a function to remove all items from localStorage
  function removeItems() {
    // Remove all necessary items from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('active_public_key');
    localStorage.removeItem('user_already_signed');
    localStorage.removeItem('x_casper_provided_signature');
    localStorage.removeItem('user_is_activated');
  }

  // Define a function to handle wallet login
  const handleWalletLogin = async (e) => {
    // Attempt to connect to the wallet
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

  // Define an effect hook to check if the user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    const walletAddress = localStorage.getItem("active_public_key");
    const signature = localStorage.getItem('x_casper_provided_signature');
    // Check if the user is authenticated
    if (token && signature && walletAddress && userIsActivated) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [signature, userIsActivated]);

  // Define an effect hook to load surveys if the user is authenticated
  useEffect(() => {
    async function loadSurveys() {
      try {
        const response = await fetchSurveys();
        setSurveys(response);
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
      }
    }
    // Load surveys if the user is authenticated
    if (isAuthenticated) {
      loadSurveys();
    }
  }, [isAuthenticated]);

  // Define a function to handle taking a survey
  const handleTakeSurvey = (id) => {
    // Navigate to the survey page
    history.push(`/survey/${id}`);
  };

  // Define an effect hook to handle wallet disconnection
  useEffect(() => {
    const handleDisconnect = (event) => {
      try {
        const state = JSON.parse(event.detail);
        if (!state.isConnected) {
          removeItems();
        }
      } catch (error) {
        console.error("Error handling disconnect event: " + error.message);
      }
    };

    // Add event listeners to handle wallet disconnection
    const CasperWalletEventTypes = window.CasperWalletEventTypes;
    window.addEventListener(CasperWalletEventTypes.Disconnected, handleDisconnect);
    window.addEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleDisconnect);
    return () => {
      // Remove event listeners
      window.removeEventListener(CasperWalletEventTypes.Disconnected, handleDisconnect);
      window.removeEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleDisconnect);
    };
  }, []);

  // Filter out the surveys to fit the available requirement
  const availabeSurveys = surveys.filter(survey => {
    if (!survey.createdBy) {
      return false;
    }
    return survey.createdBy._id !== userId && new Date(survey.endDate) > new Date();
  });

  // Define a function to calculate remaining time
  const remainingTime = (endDate) => {
    const remainingMs = new Date(endDate) - new Date();
    const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    // Calculate remaining time and return a string
    let timeString = '';
    if (remainingDays > 0) {
      timeString += `${remainingDays} day${remainingDays > 1 ? 's' : ''}, `;
    }
    if (remainingHours > 0) {
      timeString += `${remainingHours} hour${remainingHours > 1 ? 's' : ''}, `;
    }
    timeString += `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;

    return timeString;
  };

  // Render the Home component
  return (
    <div className="bg-gray-800 text-center h-screen w-full text-white flex items-center justify-center">
      {isAuthenticated ? (
        <div className="w-screen items-center">
          <div className="grid gap-0 grid-rows-13 grid-flow-col bg-gray-800 h-screen w-full">
            <NavigationBar />
            <div className="flex flex-col w-full items-center justify-items-center">
              <h2 className="p-8">Available Surveys</h2>
              <ul className="w-full flex flex-col items-center overflow-auto h-80">
                {availabeSurveys && availabeSurveys.map((survey) => (
                  <li
                    key={survey._id}
                    className="bg-gray-900 p-1 rounded mb-2 w-3/4 flex items-stretch group"
                  >
                    <div className="grid grid-cols-5 gap-4 flex-grow items-center">
                      <div className="col-span-2 justify-items-start">
                        {survey.title}
                      </div>
                      <div>Questions: {survey.questions.length}</div>
                      <div>Reward: {survey.rewardPerResponse} CSPR</div>
                      <div>{remainingTime(survey.endDate)} left</div>
                    </div>
                    <div className="flex justify-end items-stretch">
                      <button
                        className="bg-emerald-500 rounded font-semibold p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={() => handleTakeSurvey(survey._id)}
                      >
                        Take Survey
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

            </div>
          </div>
        </div>
      ) : (
        <div className="w-3/4 bg-gray-800 items-center justify-center">
          <h1 className="text-4xl font-semibold mt-4 p-6 break-normal">
            Create<span className="text-emerald-500">/Vote</span> on Casper-based surveys using coins and get rewarded automatically
          </h1>
          <button
            className="bg-emerald-500 py-3 rounded font-semibold px-5 text-white w-72"
            onClick={handleWalletLogin}
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
