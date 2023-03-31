import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { fetchSurveys } from '../api';

function SurveyList() {
  const [surveys, setSurveys] = useState([]);
  const [expandedSurveyId, setExpandedSurveyId] = useState(null);
  const history = useHistory();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const isWalletConnected = Boolean(localStorage.getItem('active_public_key'));


  function removeItems() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('active_public_key');
    localStorage.removeItem('user_already_signed');
    localStorage.removeItem('x_casper_provided_signature');
    localStorage.removeItem('user_is_activated');
  }

  useEffect(() => {
    if (!isWalletConnected) {
      history.push('/');
    }
  }, [isWalletConnected, history]);

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

  if (!token) {
    history.push('/login');
    return null;
  }

  const toggleSurvey = (id) => {
    if (expandedSurveyId === id) {
      setExpandedSurveyId(null);
    } else {
      setExpandedSurveyId(id);
    }
  };

  const renderAnswerStats = (survey, questionIndex) => {
    const questionResponses = survey.responses.map(
      (response) => response.answers[questionIndex]
    );
    const totalResponses = questionResponses.length;
  
    return survey.questions[questionIndex].answers.map((answer) => {
      const answerCount = questionResponses.filter(
        (response) => response === answer.text
      ).length;
      const answerPercentage = totalResponses
        ? ((answerCount / totalResponses) * 100).toFixed(2)
        : 0;
  
      return (
        <div
          key={answer.text}
          className="bg-green-700 px-4 py-2 mb-2 rounded text-sm flex justify-between items-center"
        >
          <div>{answer.text}</div>
          <div>{answerPercentage}%</div>
        </div>
      );
    });
  };
  
  const daysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const mySurveys = surveys.filter(survey => {
    if (!survey.createdBy) {
      return false;
    }
    return survey.createdBy._id === userId;
  });

  return (
    <div className="bg-gray-800 h-screen w-screen text-white flex items-center flex-col justify-center">
      {mySurveys.length === 0 && (
        <div className="text-center">
          <p className="mt-2 font-medium text-sm">
            You have not created a survey yet.
            <Link to="/surveys/new" className="text-emerald-500 font-semibold">
              {" "}
              Create One?
            </Link>
          </p>
        </div>
      )}
      <ul className="w-full flex flex-col items-center h-3/4 overflow-auto mt-2">
        {mySurveys &&
          mySurveys.map((survey) => (
            <li
              key={survey._id}
              className={`bg-gray-900 p-6 rounded mb-6 w-3/4 transition-all duration-300 ${expandedSurveyId === survey._id ? 'h-auto' : 'h-36'
                }`}
              onClick={() => toggleSurvey(survey._id)}
            >
              <div className="flex justify-between">
                <h3 className="text-xl font-semibold">{survey.title}</h3>
                <p>Reward: {survey.rewardPerResponse} CSPR</p>
              </div>
              <div className="flex justify-between">
                <p>Questions: {survey.questions.length}</p>
                <p>Participants: {survey.responses.length}</p>
              </div>
              <p>Days remaining: {daysRemaining(survey.endDate)}</p>
              {expandedSurveyId === survey._id && (
                <div className="mt-4">
                  <div className="overflow-y-auto max-h-96">
                    {survey.questions.map((question, index) => (
                      <div key={question.text} className="bg-gray-800 p-4 rounded mt-4">
                        <p className="font-semibold">{question.text}</p>
                        <div className="mt-2">
                          {renderAnswerStats(survey, index)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default SurveyList;
