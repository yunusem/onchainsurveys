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
          className="relative  mb-2 rounded text-sm flex justify-between items-center bg-slate-700 "
        >
          <div
            style={{ width: `${answerPercentage}%` }}
            className={`rounded py-4  mr-2 ${isMyAnswer(survey, answer) ? "bg-red-400" : "bg-slate-600 "}`}
          >
          </div>
          <div className='text-slate-400 mr-2'>{answerPercentage}%</div>
          <div className={`absolute ml-3 w-full ${isMyAnswer(survey, answer) ? "text-slate-800 font-semibold" : ""}`}
          >{answer.text}</div>

        </div>
      );
    });
  };


  const renderSurveyQuestions = () => {
    const survey = surveys.find(s => s._id === expandedSurveyId);
    if (!survey) {
      return <div className="text-center text-white">Select a survey to view its questions.</div>;
    }

    return (
      <div className="border border-red-500  rounded p-4 h-full overflow-y-auto w-full">
        <div className='flex  justify-between'>

          <h3 className="text-xl font-semibold mb-4 text-red-500">{survey.title}</h3>
          <button
            type="button"
            onClick={() => history.push(`/surveys/${survey._id}/edit`)}
            className={`bg-slate-900 rounded font-semibold text-white h-8 w-12 bottom-0 ${isSurveyEditable(survey) ? "" : "hidden"}`}
          >
            Edit
          </button>
        </div>
        <div className="space-y-4">
          {survey.questions.map((question, index) => (
            <div key={question._id} className="  rounded w-full min-w-[450px] overflow-y-auto">
              <p className="font-semibold">{question.text}</p>
              <div className="mr-3 mt-2 text-slate-300 ">
                {renderAnswerStats(survey, index)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
    <div className="flex bg-slate-800 h-screen w-full text-white items-center justify-center">
      <NavigationBar />
      <div className="flex flex-col h-screen w-full">
        <div className=" flex flex-col overflow-y-auto h-full ">
          <div className='flex flex-col '>
            <div className='flex w-full  justify-center'>
              <div className='flex  mt-7 w-3/4 items-center '>
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
            <div className="flex flex-col h-[720px]  w-full items-center ">
              <div className='flex h-full w-3/4  '>
                <div className='flex w-full  justify-between '>
                  <div className='h-full w-full overflow-y-auto'>
                    <ul className=" flex w-full flex-col space-y-4">
                      {surveys && getFilteredSurveys().map((survey) => (
                        <li
                          key={survey._id}
                          className={`flex w-full flex-col space-y-2 h-fit justify-between p-3 rounded cursor-pointer transition-all ease-linear duration-50  ${expandedSurveyId === survey._id ? " bg-slate-800 border border-red-500" : "  bg-slate-700 text-slate-400"
                            }`}
                          onClick={() => toggleSurvey(survey._id)}
                        >
                          <div className="flex justify-between ">
                            <h3 className={` text-xl font-semibold select-none ${isSurveyEnded(survey.endDate) === 0 ? "line-through" : ""
                              }`}>
                              {survey.title}</h3>

                          </div>
                          <div className="flex justify-between w-full">
                            <div className='flex items-center space-x-8'>
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
                                  src={!isParticipated(survey) ? VolunteerIcon : VolunteerRedIcon}
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

                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className='h-[720px] w-full ml-3 flex '>
                    {expandedSurveyId && renderSurveyQuestions()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SurveyHistory;
