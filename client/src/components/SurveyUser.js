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
          className="relative bg-slate-700  mb-2 rounded text-sm flex justify-between items-center"
        >
          
          <div
            style={{ width: `${answerPercentage}%` }}
            className=" bg-slate-600 rounded py-4  mr-2"
            
          >
            </div>
            <div className='text-slate-400 mr-2'>{answerPercentage}%</div>
            <div className='absolute ml-3 w-full'>{answer.text}</div>
          
          
          
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
            className="bg-slate-900 rounded font-semibold text-white h-8 w-12 bottom-0"
          >
            Edit
          </button>
        </div>
        <div className="space-y-4">
          {survey.questions.map((question, index) => (
            <div key={question.text} className="  rounded w-full min-w-[450px] overflow-y-auto">
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
  return (
    <div className="flex bg-slate-800 h-screen w-full text-white items-center justify-center">
      <NavigationBar />
      <div className="flex flex-col h-screen w-full">
        <div className=" flex flex-col overflow-y-auto h-full ">
          <div className='flex w-full justify-center '>
            <div className='flex w-3/4 h-24 items-center '>
              <h1 className=" text-3xl font-bold  text-white   text-left">
                {'My Own Surveys'}
              </h1>
            </div>
          </div>
          {mySurveys.length === 0 ? (
            <div className='flex  h-full items-center justify-center '>
              <div className="text-center w-48 ">
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
            <div className="flex flex-col h-[720px]  w-full items-center ">
              <div className='flex h-full w-3/4  '>
                <div className='flex w-full  justify-between '>
                  <div className='h-full w-full overflow-y-auto'>
                    <ul className=" flex flex-col space-y-4">
                      {mySurveys &&
                        mySurveys.map((survey) => (
                          <li
                            key={survey._id}
                            className={` flex flex-col h-24 justify-between p-4 rounded transition-all ease-linear duration-50  ${expandedSurveyId === survey._id ? " bg-slate-800 border border-red-500" : "  bg-slate-700 text-slate-400"
                              }`}
                            onClick={() => toggleSurvey(survey._id)}
                          >
                            <div className="flex justify-between "> 
                              <h3 className={` text-xl font-semibold   ${daysRemaining(survey.endDate) === 0 ? "line-through" : ""
                              }`}>
                                {survey.title}</h3>

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

export default SurveyUser;
