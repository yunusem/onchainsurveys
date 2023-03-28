import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Logo from "../assets/casper-logo.svg";
import { fetchSurveys } from '../api';
import Logout from './Logout';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const walletAddress = localStorage.getItem("wallet_address");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    if (walletAddress) {
      setIsWalletConnected(true);
    } else {
      setIsWalletConnected(false);
    }

  }, []);

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
        setIsWalletConnected(state.isConnected);
      } catch (err) {
        console.error('Failed to handle event:', err);
      }
    };
  
    const CasperWalletEventTypes = window.CasperWalletEventTypes;
    window.addEventListener(CasperWalletEventTypes.Connected, handleEvent);
    window.addEventListener(CasperWalletEventTypes.Disconnected, handleEvent);
    window.addEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleEvent);
  
    return () => {
      window.removeEventListener(CasperWalletEventTypes.Connected, handleEvent);
      window.removeEventListener(CasperWalletEventTypes.Disconnected, handleEvent);
      window.removeEventListener(CasperWalletEventTypes.ActiveKeyChanged, handleEvent);
    };
  }, []);
  

  return (
    <div className="bg-gray-700 text-center h-screen w-screen text-white flex items-center flex flex-col  justify-center ">
      <img src={Logo} alt="logo" width="72px" />
      <h1 className="text-2xl font-semibold mt-4">
        Welcome to Onchain Surveys
      </h1>
      <br></br>
      {isAuthenticated ? (
        <div>
          <h2>You are logged in with {isWalletConnected ? (`Wallet address: ${localStorage.getItem('wallet_address')}`) : (`User ID: ${localStorage.getItem('userId')}`)}</h2>
          <ul>
          {isWalletConnected ? (
            <ul>
              <li>
                <Link to="/surveys/new">Create Survey</Link>
              </li>
              <li>
                <Link to="/surveys">My Surveys</Link>
              </li>
            </ul>
          ) : (
            <li>
                <Link to="/login">Connect your wallet to take Surveys</Link>
            </li>
          )}
          </ul>
          <Logout />
          <div>
          <br></br>
          <br></br>
          <h2>Available Surveys</h2>
            <div className="overflow-y-auto h-64 bg-white text-black p-4 rounded-lg">
              <ul>
                {surveys.map((survey) => (
                  survey.createdBy && (
                  <li key={survey._id}>
                    <h3>{survey.title}</h3>
                    <p>Reward: {survey.rewardPerResponse} CSPR</p>
                    {isWalletConnected && (<button onClick={() => handleTakeSurvey(survey._id)}>Take Survey</button>)}
                  </li>
                  )
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="mb-4 font-semibold">You aren't logged in.</h2>
          <ul className="flex items-center">
            <li>
              <Link to="/login">
                <button className="mr-4 bg-transparent border border-white  py-3 rounded-xl font-semibold px-10 text-white">
                  Login
                </button>
              </Link>
            </li>
            <li>
              <Link to="/register">
                <button className="bg-white py-3 rounded-xl font-semibold px-8 text-black">
                  Register
                </button>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Home;
