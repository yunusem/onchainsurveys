import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Logo from "../assets/casper-logo.svg";
import { fetchSurveys } from '../api';
import Logout from './Logout';
import CasperWalletContext from './CasperWalletContext';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const history = useHistory();
  const provider = useContext(CasperWalletContext);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const checkWalletConnection = async () => {
      const isConnected = await provider.isConnected();
      setIsAuthenticated(token || isConnected);
    };

    checkWalletConnection();
  }, [provider]);

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
        const isConnected = await provider.isConnected();
        setIsAuthenticated(isConnected);
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
  }, [provider]);
  

  return (
    <div className="bg-gray-700 text-center h-screen w-screen text-white flex items-center flex flex-col  justify-center ">
      <img src={Logo} alt="logo" width="72px" />
      <h1 className="text-2xl font-semibold mt-4">
        Welcome to Onchain Surveys
      </h1>
      <br></br>
      {isAuthenticated ? (
        <div>
          <h2>You are logged in with {`Wallet address: ${localStorage.getItem('wallet_address')}` || `User ID: ${localStorage.getItem('userId')}`}</h2>
          <ul>
            <li>
              <Link to="/surveys/new">Create Survey</Link>
            </li>
            <li>
              <Link to="/surveys">My Surveys</Link>
            </li>
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
                    <button onClick={() => handleTakeSurvey(survey._id)}>Take Survey</button>
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
