import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { fetchSurveys } from '../api';
import NavigationBar from './NavigationBar';
import QuestionIcon from "../assets/question-mark.png";
import VolunteerIcon from "../assets/volunteer.png";
import CalendarIcon from "../assets/calendar.png";
import CoinLogo from "../assets/caspercoin-logo.svg";

function SurveyUser() {
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
          className="bg-slate-700 px-4 py-2 mb-2 rounded text-sm flex justify-between items-center"
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
    <div className="flex bg-slate-800 h-screen w-full text-white items-center justify-center">
      <NavigationBar />
      <div className="flex flex-col h-screen w-full">
        <div className=" flex flex-col overflow-y-auto h-full">
          <div className='flex w-full justify-center'>
            <div className='flex w-3/4 h-24 items-center'>
              <h1 className=" text-3xl font-bold  text-white   text-left">
                {'My Own Surveys'}
              </h1>
            </div>
          </div>
          {mySurveys.length === 0 ? (
            <div className='flex w-48 items-center justify-center'>
              <div className="text-center ">
                <p className="font-medium ">
                  You have not created a survey yet.
                  <Link to="/surveys/new" className="text-red-500 font-semibold">
                    {" "}
                    Create One?
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-[720px] overflow-y-auto w-full items-center">
              <div className='h-full w-3/4'>
                <ul className="flex flex-col space-y-4">
                  {mySurveys &&
                    mySurveys.map((survey) => (
                      <li
                        key={survey._id}
                        className={` flex flex-col justify-between p-4 rounded transition-all ease-linear duration-50  ${expandedSurveyId === survey._id ? " bg-slate-900 h-auto" : " h-24 bg-slate-700"
                          }`}
                        onClick={() => toggleSurvey(survey._id)}
                      >
                        <div className="flex justify-between ">
                          <h3 className="text-xl font-semibold">{survey.title}</h3>

                        </div>
                        <div className="flex justify-between ">
                          <div className='flex items-center space-x-10'>
                            <div className='flex w-8 space-x-1'>
                              <img
                                src={CoinLogo}
                                alt="Casper Coin Logo"
                                className="h-5 w-5 "
                              />
                              <p> {survey.rewardPerResponse} </p>
                            </div>
                            <div className='flex w-8 space-x-1'>
                              <img
                                src={QuestionIcon}
                                alt="Question Icon"
                                className=" h-5 w-5"
                              />
                              <p> {survey.questions.length}</p>
                            </div>
                            <div className='flex w-8 space-x-1'>
                              <img
                                src={VolunteerIcon}
                                alt="Volunteer Icon"
                                className="h-5 w-5"
                              />
                              <p> {survey.responses.length}</p>
                            </div>
                            <div className='flex w-8 space-x-1'>
                              <img
                                src={CalendarIcon}
                                alt="Calendar Icon"
                                className="h-5 w-5"
                              />
                              <p> {daysRemaining(survey.endDate)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => history.push(`/surveys/${survey._id}/edit`)}
                            className="bg-slate-500 rounded font-semibold text-white h-8 w-12 bottom-0"
                          >
                            Edit
                          </button>
                        </div>
                        {expandedSurveyId === survey._id && (
                          <div className="bg-slate-900 rounded ">
                            <div className=" grid grid-cols-2 gap-3 overflow-y-auto max-h-full ">
                              {survey.questions.map((question, index) => (
                                <div key={question.text} className={` p-4 rounded mt-4 ${survey.questions.length === 1 ? "col-span-2" : ""}`}>
                                  <p className="font-semibold">{question.text}</p>
                                  <div className="mt-2 text-slate-300">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SurveyUser;
