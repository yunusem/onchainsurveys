import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { fetchSurveys } from '../api';
import NavigationBar from './NavigationBar';
import QuestionIcon from "../assets/question-mark.svg";
import VolunteerIcon from "../assets/volunteer.svg";
import VolunteerRedIcon from "../assets/volunteer-red.svg";
import CalendarIcon from "../assets/calendar.svg";
import CoinLogo from "../assets/casper-logo.svg";

function SurveyHistory() {
  const [surveys, setSurveys] = useState([]);
  const [expandedSurveyId, setExpandedSurveyId] = useState(null);
  const [filter, setFilter] = useState('All');
  const history = useHistory();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const isWalletConnected = Boolean(localStorage.getItem('active_public_key'));
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [animatePercent, setAnimatePercent] = useState(false);

  useEffect(() => {
    if (isDetailsVisible) {
      const timer = setTimeout(() => {
        setAnimatePercent(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDetailsVisible]);


  useEffect(() => {
    if (expandedSurveyId) {
      const timer = setTimeout(() => {
        setIsDetailsVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [expandedSurveyId]);

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
    setIsDetailsVisible(false);
    setAnimatePercent(false);
    if (expandedSurveyId === id) {
      setExpandedSurveyId(null);
    } else {
      setExpandedSurveyId(id);

    }
  };

  const daysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const isSurveyEnded = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    return diff > 0 ? diff : 0;
  };

  const isParticipated = (survey) => {
    return survey.responses.some((response) => response.user === userId);
  }

  const isMyAnswer = (survey, answer) => {
    return survey.responses.some(
      (response) =>
        response.user === userId &&
        response.answers.includes(answer._id)
    );
  };

  const isSurveyEditable = (survey) => {
    if (survey.createdBy && survey.createdBy._id === userId) {
      if (daysRemaining(survey.endDate) !== 0) {
        if (survey.responses.length === 0) {
          return true;
        }
      }
    }
    return false;
  }

  const renderAnswerStats = (survey, questionIndex) => {
    const totalResponses = survey.responses.length;
    return survey.questions[questionIndex].answers.map((answer) => {
      const answerCount = survey.responses.filter((response) => {
        return response.answers.includes(answer._id);
      }).length;
      const answerPercentage = totalResponses
        ? ((answerCount / totalResponses) * 100).toFixed(2)
        : 0;

      return (
        <div
          key={answer._id}
          className={`relative ml-3 mt-3 mb-3 rounded flex justify-between items-center bg-slate-700`}>
          <div
            style={{ width: `${answerPercentage < 0.01 ? 100 : (animatePercent ? answerPercentage : 0)}%` }}
            className={`absolute rounded h-full top-0 left-0 transition-all delay-100 duration-500 ease-in-out ${isMyAnswer(survey, answer) ? "bg-red-400" : (answerPercentage < 1) ? "" : "bg-slate-600"}`}>
          </div>
          <div className={`relative w-full flex justify-between items-center`}>
            <div
              className={`p-2 break-word text-sm ${isMyAnswer(survey, answer) ? "text-slate-900 font-bold" : "text-slate-300"}`}>
              {answer.text}
            </div>
          </div>
          <div className="relative text-sm text-slate-100 p-2 w-20 text-end font-medium">{answerPercentage}%</div>
        </div>
      );
    });
  };



  const renderSurveyQuestions = () => {
    const survey = surveys.find(s => s._id === expandedSurveyId);
    if (survey && isDetailsVisible) {
      return (
        <div className={`relative block shrink ring-2 ring-red-500 rounded group p-3 h-fit w-full transition-all duration-100 ease-in-out`}>
          <div className='flex  justify-between'>
            <h3 className="text-xl font-semibold m-3 text-red-500 break-word">
              {survey.title}
            </h3>
            <button
              type="button"
              onClick={() => history.push(`/surveys/${survey._id}/edit`)}
              className={`bg-slate-900 absolute rounded  font-semibold text-white px-4 h-10 top-6 right-6 transition-all ease-in-out duration-300 ${isSurveyEditable(survey) ? "" : "hidden"} opacity-20 group-hover:opacity-100`}
            >
              Edit
            </button>
          </div>
          <div className="space-y-4">
            {survey.questions.map((question, index) => (
              <div key={question._id} className="rounded w-full">
                {/* DONT CHANGE THESE mr-3 clases AND DONT ASK ABOUT IT*/}
                <p className="ml-3 mr-3 font-semibold break-word text-slate-200">{question.text}</p>
                <div className="mr-3 mt-2 text-slate-300">
                  {renderAnswerStats(survey, index)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return <div></div>
  };

  const getFilteredSurveys = () => {
    if (filter === 'MyOwnSurvey') {
      return surveys.filter(survey => survey.createdBy && survey.createdBy._id === userId);
    } else if (filter === 'All') {
      return surveys;
    } else if (filter === 'MyHistory') {
      return surveys.filter(survey => survey.responses.some(response => response.user === userId));
    }
  };

  return (
    <div className="flex bg-slate-800  w-full h-screen text-white items-start overflow-hidden">
      <div className="select-none h-full w-full overflow-y-auto">
        <div className="mt-24 flex flex-col">
          <div className='flex flex-col '>
            <div className='flex w-full  justify-center'>
              <div className='flex w-3/4 items-center '>
                <h1 className=" text-3xl font-bold  text-white">
                  History
                </h1>
              </div>
            </div>
            <div className='flex  items-center justify-center'>
              <div className='flex w-3/4 items-center'>
                <h2 className="mt-3 text-slate-300 h-12">
                  Filter:{"  "}
                  <button
                    className={`${filter === 'All' ? "text-red-500" : "text-slate-300"
                      }`}
                    onClick={() => setFilter('All')}
                  >
                    All
                  </button>
                  {", "}
                  <button
                    className={`${filter === 'MyHistory' ? "text-red-500" : "text-slate-300"
                      }`}
                    onClick={() => setFilter('MyHistory')}
                  >
                    My History
                  </button>
                  {", "}
                  <button
                    className={`${filter === 'MyOwnSurvey' ? "text-red-500" : "text-slate-300"
                      }`}
                    onClick={() => setFilter('MyOwnSurvey')}
                  >
                    My Own Surveys
                  </button>
                </h2>
              </div>
            </div>
          </div>
          {getFilteredSurveys().length === 0 ? (
            filter === 'MyOwnSurvey' ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center w-48">
                  <p className="font-medium">
                    You have not created a survey yet.
                    <Link to="/surveys/new" className="text-red-500 font-semibold">
                      {" "}
                      Create One?
                    </Link>
                  </p>
                </div>
              </div>
            ) : filter === 'All' ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center w-40">
                  <p className="font-medium">
                    No surveys available.
                    <Link to="/surveys/new" className="text-red-500 font-semibold">
                      {" "}
                      Create One?
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center w-52">
                  <p className="font-medium">
                    You have not participated in any surveys yet.
                    <Link to="/" className="text-red-500 font-semibold">
                      {" "}
                      Take One?
                    </Link>
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col w-full items-center ">
              <div className='flex w-3/4  '>
                <div className='flex  w-full content-start '>
                  <div className='shrink-0 w-1/2 '>
                    <ul className="flex flex-col space-y-4 p-1 ">
                      {surveys && getFilteredSurveys().map((survey) => (
                        <li
                          key={survey._id}
                          className={`select-none flex w-full flex-col space-y-2 h-fit justify-between p-3 rounded   cursor-pointer transition-all ease-in-out duration-300  ${expandedSurveyId === survey._id ? " bg-slate-800 ring-2 ring-red-500" : "  bg-slate-700 text-slate-400"}`}
                          onClick={() => toggleSurvey(survey._id)}>
                          <div className="flex justify-between break-word">
                            <h3 className={` text-xl font-medium  ${isSurveyEnded(survey.endDate) === 0 ? "line-through" : ""}`}>
                              {survey.title}
                            </h3>
                          </div>
                          <div className="flex justify-between w-full">
                            <div className='flex flex-row items-center space-x-8'>
                              <div className='flex items-center  space-x-2'>
                                <img
                                  src={CoinLogo}
                                  alt="Casper Coin Logo"
                                  className="h-4 w-4"
                                />
                                <div className='text-xl'>{survey.rewardPerResponse}</div>
                              </div>
                              <div className='flex h-fit w-fit items-center space-x-2'>
                                <img
                                  src={QuestionIcon}
                                  alt="Question Icon"
                                  className="w-4"
                                />
                                <div className='text-xl'> {survey.questions.length}</div>
                              </div>
                              <div className='flex items-center space-x-2'>
                                <img
                                  src={!isParticipated(survey) ? VolunteerIcon : VolunteerRedIcon}
                                  alt="Volunteer Icon"
                                  className="w-4"
                                />
                                <div  className='text-xl'> {survey.responses.length}</div>
                              </div>
                              <div className='flex items-center space-x-2'>
                                <img
                                  src={CalendarIcon}
                                  alt="Calendar Icon"
                                  className="w-4"
                                />
                                <div  className='text-xl'>{daysRemaining(survey.endDate)}</div>
                              </div>
                            </div>

                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`shrink w-full flex`}>
                    {!expandedSurveyId && (
                      <div className={`absolute p-4 h-24 w-1/3 flex justify-center items-center`}>
                        <div className="text-center text-slate-500">
                          Select a survey to view its details.
                        </div>
                      </div>
                    )}
                    <div className={`h-FULL w-full ml-1 flex p-1 transition-opacity duration-200 ease-in-out ${isDetailsVisible ? "opacity-100" : "opacity-0"}`}>
                      {renderSurveyQuestions()}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <NavigationBar/>
    </div>
  );
}

export default SurveyHistory;
