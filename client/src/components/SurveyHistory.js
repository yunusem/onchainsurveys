import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { fetchSurveys } from '../api';

function SurveyHistory() {
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
  
    // Find the user's response for this question
    const userResponse = survey.responses.find(
      (response) => response.user === userId
    ).answers[questionIndex];
  
    return survey.questions[questionIndex].answers.map((answer) => {
      const answerCount = questionResponses.filter(
        (response) => response === answer.text
      ).length;
      const answerPercentage = totalResponses
        ? ((answerCount / totalResponses) * 100).toFixed(2)
        : 0;
  
      const bgColor = userResponse === answer.text ? 'bg-blue-600' : 'bg-green-700';
  
      return (
        <div
          key={answer.text}
          className={`${bgColor} px-4 py-2 mb-2 rounded text-sm flex justify-between items-center`}
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

  const participatedSurveys = () => {
    return surveys.filter((survey) =>
      survey.responses.some((response) => response.user === userId)
    );
  };

  const myParticipatedSurveys = participatedSurveys();

  return (
    <div className="bg-gray-800 h-screen w-screen text-white flex items-center flex-col justify-center">
      {myParticipatedSurveys.length === 0 && (
        <div className="text-center">
          <p className="mt-2 font-medium text-sm">
            You have not participated in any surveys yet.
          </p>
        </div>
      )}
      <ul className="w-full flex flex-col items-center h-3/4 overflow-auto mt-2">
        {myParticipatedSurveys &&
          myParticipatedSurveys.map((survey) => (
            <li
              key={survey._id}
              className={`bg-gray-900 p-6 rounded-xl mb-6 w-3/4 transition-all duration-300 ${expandedSurveyId === survey._id ? 'h-auto' : 'h-36'
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
                      <div key={question.text} className="bg-gray-800 p-4 rounded-xl mt-4">
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

export default SurveyHistory;
