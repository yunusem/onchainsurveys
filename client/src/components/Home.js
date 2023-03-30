import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Logo from "../assets/casper-logo.svg";
import { fetchSurveys, loginWithWallet } from '../api';
import CasperWalletContext from './CasperWalletContext';
import { useUserActivation } from './UserActivationContext';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [userIsActivated] = useUserActivation();
  const history = useHistory();
  const provider = useContext(CasperWalletContext);

  const signature = localStorage.getItem('x_casper_provided_signature');
  const userId = localStorage.getItem('userId');

  function removeItems() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('active_public_key');
    localStorage.removeItem('user_already_signed');
    localStorage.removeItem('x_casper_provided_signature');
    localStorage.removeItem('user_is_activated');
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
    const signature = localStorage.getItem('x_casper_provided_signature');
    if (token && signature && walletAddress && userIsActivated) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [signature, userIsActivated]);

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

    const CasperWalletEventTypes = window.CasperWalletEventTypes;
    window.addEventListener(CasperWalletEventTypes.Disconnected, handleDisconnect);
    window.addEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleDisconnect);

    return () => {
      window.removeEventListener(CasperWalletEventTypes.Disconnected, handleDisconnect);
      window.removeEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleDisconnect);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const isConnected = await provider.isConnected();
      if (isConnected) {
        const isDisconnected = await provider.disconnectFromSite();
        if (isDisconnected) {
          removeItems();
          setIsAuthenticated(false);
        }
      } else {
        removeItems();
      }
    } catch (error) {
      console.error("Error disconnecting wallet: " + error.message);
    }
  };

  const availabeSurveys = surveys.filter(survey => {
    if (!survey.createdBy) {
      return false;
    }
    return survey.createdBy._id !== userId;
  });

  return (
    <div className="bg-gray-800 text-center h-screen w-full text-white flex items-center flex flex-col justify-center">
      <img src={Logo} alt="logo" width="72px" />
      <h1 className="text-2xl font-semibold mt-4">
        Welcome to Onchain Surveys
      </h1>
      {isAuthenticated ? (
        <div className="w-screen justify-items-center mt-6">
          <div className="items-center">
          <Link
              to="/surveysall"
              className="bg-red-500 py-2 px-4 rounded font-semibold text-white mx-4"
            >
              All Surveys
            </Link>
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
           
            <Link
              to="/surveystaken"
              className="bg-red-500 py-2 px-4 rounded font-semibold text-white mx-4"
            >
              History
            </Link>

            <button
              className="bg-red-500 py-2 px-4 rounded font-semibold text-white mx-4"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          <div className="flex flex-col w-full items-center justify-items-center ">
            <h2 className="p-8">Available Surveys</h2>
            <ul className="w-full flex flex-col items-center overflow-auto h-80">
              {availabeSurveys && availabeSurveys.map((survey) =>
              (
                <li
                  key={survey._id}
                  className="bg-gray-900 p-6 rounded-xl mb-6 w-3/4"
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
        </div>
      )}
    </div>
  );
}

export default Home;
