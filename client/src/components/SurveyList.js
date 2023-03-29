import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { fetchSurveys } from '../api';

function SurveyList() {
  const [surveys, setSurveys] = useState([]);
  const history = useHistory();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const isWalletConnected = Boolean(localStorage.getItem('active_public_key'));

  function removeItems() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('active_public_key');
    localStorage.removeItem('user_already_signed');
    localStorage.removeItem('x-casper-provided-signature');
  }

  if (!isWalletConnected) {
    history.push('/');
  }

  useEffect(() => {
    const handleDisconnect = (event) => {
      try {
        const state = JSON.parse(event.detail);
        if (!state.isConnected) {
          removeItems();
          history.push('/');
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
  }, [history]);

  useEffect(() => {
    async function loadSurveys() {
      try {
        const response = await fetchSurveys();
        setSurveys(response);
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
      }
    }
    if (token) {
      loadSurveys();
    }
  }, [token, setSurveys]);

  const handleShowStats = (id) => {
    console.log("show stats pressed")
  };

  if (!token) {
    history.push('/login');
    return null;
  }

  const mySurveys = surveys.filter(survey => {
    if (!survey.createdBy) {
      return false;
    }
    return survey.createdBy._id === userId;
  });
  
  return (
    <div className="bg-gray-700 h-screen w-screen text-white flex items-center flex-col justify-center">
      {mySurveys.length === 0 && (
        <div className="text-center">
          <p className="mt-2 font-medium text-sm">
            You have not created a survey yet.
            <Link to="/surveys/new" className="text-red-500 font-semibold">
              {" "}
              Create One?
            </Link>
          </p>
        </div>
      )}
      <ul className="w-full flex flex-col items-center">
        {mySurveys &&
          mySurveys.map((survey) => (
            <li
              key={survey._id}
              className="bg-gray-800 p-6 rounded-xl mb-6 w-3/4"
            >
              <h3 className="text-xl font-semibold">{survey.title}</h3>
              <p>Number of questions: {survey.questions.length}</p>
              <p>Created by: {survey.createdBy._id}</p>
              <p>
                Start date: {new Date(survey.startDate).toLocaleDateString()}
              </p>
              <p>Reward: {survey.rewardPerResponse} CSPR</p>
              <button
                className="bg-red-500 py-2 px-4 rounded font-semibold text-white"
                onClick={() => handleShowStats(survey._id)}
              >
                Stats
              </button>
            </li>
          ))}
      </ul>
    </div>
  );  
}

export default SurveyList;
